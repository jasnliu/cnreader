#!/usr/bin/env python3
"""Generate static Mandarin listening assets for CNReader Custom Test."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import sys
import unicodedata
from pathlib import Path
from typing import Awaitable, Callable


PROJECT_ROOT = Path(__file__).resolve().parent
UNIT_COUNT = 10
ITEMS_PER_UNIT = 100
GENERATOR_VERSION = 1
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "+0%"
VOLUME = "+0%"
PITCH = "+0Hz"
MINIMUM_AUDIO_BYTES = 500
MAX_CONCURRENCY = 4
RETRY_DELAYS = (1, 2, 4)
MANIFEST_PATH = PROJECT_ROOT / "listening-audio-manifest.js"
STATE_PATH = PROJECT_ROOT / "audio" / ".listening-build-state.json"


def source_path(folder: str, base_name: str, unit_number: int) -> Path:
    suffix = "" if unit_number == 1 else str(unit_number)
    return PROJECT_ROOT / folder / f"{base_name}{suffix}.txt"


def read_lines(path: Path) -> list[str]:
    return [
        unicodedata.normalize("NFC", line.strip())
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def read_aligned_sources(
    text_folder: str,
    text_base_name: str,
    pinyin_folder: str,
    pinyin_base_name: str,
) -> list[tuple[str, str]]:
    items: list[tuple[str, str]] = []
    for unit_number in range(1, UNIT_COUNT + 1):
        texts = read_lines(source_path(text_folder, text_base_name, unit_number))
        pinyin = read_lines(source_path(pinyin_folder, pinyin_base_name, unit_number))
        if len(texts) != ITEMS_PER_UNIT or len(pinyin) != ITEMS_PER_UNIT:
            raise ValueError(
                f"Listening source unit {unit_number} must contain "
                f"{ITEMS_PER_UNIT} aligned text and pinyin entries."
            )
        items.extend(zip(texts, pinyin, strict=True))

    if len({text for text, _pinyin in items}) != len(items):
        raise ValueError(f"Listening source {text_folder} contains duplicate entries.")
    return items


def entry_signature(kind: str, index: int, text: str, pinyin: str) -> str:
    payload = {
        "generatorVersion": GENERATOR_VERSION,
        "voice": VOICE,
        "rate": RATE,
        "volume": VOLUME,
        "pitch": PITCH,
        "kind": kind,
        "index": index,
        "text": text,
        "pinyin": pinyin,
    }
    encoded = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def build_entries(kind: str, items: list[tuple[str, str]]) -> list[dict[str, str]]:
    if kind not in {"words", "phrases"}:
        raise ValueError(f"Unsupported listening content kind: {kind}")
    return [
        {
            "text": text,
            "pinyin": pinyin,
            "path": f"audio/{kind}/{index:04d}.mp3",
            "signature": entry_signature(kind, index, text, pinyin),
        }
        for index, (text, pinyin) in enumerate(items)
    ]


def manifest_payload(
    words: list[dict[str, str]], phrases: list[dict[str, str]]
) -> dict[str, object]:
    return {
        "generatorVersion": GENERATOR_VERSION,
        "voice": VOICE,
        "rate": RATE,
        "volume": VOLUME,
        "pitch": PITCH,
        "words": words,
        "phrases": phrases,
    }


def render_manifest(
    words: list[dict[str, str]], phrases: list[dict[str, str]]
) -> str:
    payload = json.dumps(
        manifest_payload(words, phrases), ensure_ascii=False, indent=2
    )
    return f"window.CHINESE_READER_LISTENING_AUDIO = {payload};\n"


def load_json(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return value if isinstance(value, dict) else {}


def load_manifest_signatures(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    prefix = "window.CHINESE_READER_LISTENING_AUDIO = "
    text = path.read_text(encoding="utf-8")
    if not text.startswith(prefix) or not text.endswith(";\n"):
        return {}
    try:
        payload = json.loads(text[len(prefix) : -2])
    except json.JSONDecodeError:
        return {}
    signatures: dict[str, str] = {}
    for kind in ("words", "phrases"):
        for entry in payload.get(kind, []):
            if isinstance(entry, dict) and "path" in entry and "signature" in entry:
                signatures[str(entry["path"])] = str(entry["signature"])
    return signatures


def write_json_atomic(path: Path, value: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(str(path) + ".part")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary, path)


def is_entry_current(
    project_root: Path, entry: dict[str, str], state: dict[str, str]
) -> bool:
    audio_path = project_root / entry["path"]
    return (
        state.get(entry["path"]) == entry["signature"]
        and audio_path.is_file()
        and audio_path.stat().st_size > MINIMUM_AUDIO_BYTES
    )


async def generate_entry(
    project_root: Path,
    entry: dict[str, str],
    synthesizer: Callable[[str, Path], Awaitable[None]],
    *,
    sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
) -> None:
    output_path = project_root / entry["path"]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    partial_path = Path(str(output_path) + ".part")
    attempts = len(RETRY_DELAYS) + 1
    last_error: Exception | None = None

    for attempt in range(attempts):
        partial_path.unlink(missing_ok=True)
        try:
            await synthesizer(entry["text"], partial_path)
            if (
                not partial_path.is_file()
                or partial_path.stat().st_size <= MINIMUM_AUDIO_BYTES
            ):
                raise RuntimeError("speech service returned an empty audio file")
            os.replace(partial_path, output_path)
            return
        except Exception as error:  # Network/library failures are retried uniformly.
            last_error = error
            partial_path.unlink(missing_ok=True)
            if attempt < len(RETRY_DELAYS):
                await sleep(RETRY_DELAYS[attempt])

    raise RuntimeError(
        f"Failed to generate {entry['path']} after {attempts} attempts: {last_error}"
    ) from last_error


async def generate_all(
    entries: list[dict[str, str]], state: dict[str, str]
) -> tuple[int, int, list[str]]:
    import edge_tts

    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    state_lock = asyncio.Lock()
    counter_lock = asyncio.Lock()
    generated = 0
    skipped = 0
    processed = 0
    failures: list[str] = []

    async def process(entry: dict[str, str]) -> None:
        nonlocal generated, skipped, processed
        if is_entry_current(PROJECT_ROOT, entry, state):
            async with counter_lock:
                skipped += 1
                processed += 1
            return

        async def synthesize(text: str, output_path: Path) -> None:
            communicator = edge_tts.Communicate(
                text,
                VOICE,
                rate=RATE,
                volume=VOLUME,
                pitch=PITCH,
            )
            await communicator.save(str(output_path))

        try:
            async with semaphore:
                await generate_entry(PROJECT_ROOT, entry, synthesize)
            async with state_lock:
                state[entry["path"]] = entry["signature"]
                write_json_atomic(STATE_PATH, state)
            async with counter_lock:
                generated += 1
                processed += 1
                if processed % 25 == 0 or processed == len(entries):
                    print(
                        f"Listening audio progress: {processed}/{len(entries)} "
                        f"({generated} generated, {skipped} reused)",
                        flush=True,
                    )
        except Exception as error:
            async with counter_lock:
                processed += 1
                failures.append(str(error))

    await asyncio.gather(*(process(entry) for entry in entries))
    return generated, skipped, failures


async def async_main() -> int:
    words = build_entries(
        "words",
        read_aligned_sources("Characters", "characters", "Pinyin", "pinyin"),
    )
    phrases = build_entries(
        "phrases",
        read_aligned_sources("Phrases", "phrases", "PPinyin", "pinyin"),
    )
    all_entries = words + phrases
    state = load_manifest_signatures(MANIFEST_PATH)
    state.update(load_json(STATE_PATH))
    generated, skipped, failures = await generate_all(all_entries, state)

    if failures:
        print("Listening audio generation failures:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        print(
            f"Generated {generated + skipped}/{len(all_entries)} listening assets; "
            f"{len(failures)} failures.",
            file=sys.stderr,
        )
        return 1

    MANIFEST_PATH.write_text(render_manifest(words, phrases), encoding="utf-8")
    write_json_atomic(STATE_PATH, state)
    print(
        f"Generated {generated + skipped}/{len(all_entries)} listening assets; "
        "0 failures."
    )
    return 0


def main() -> int:
    return asyncio.run(async_main())


if __name__ == "__main__":
    raise SystemExit(main())
