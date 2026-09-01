import asyncio
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
GENERATOR_PATH = PROJECT_ROOT / "generate-listening-audio.py"


class ListeningAudioGeneratorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not GENERATOR_PATH.exists():
            cls.generator = None
            return
        spec = importlib.util.spec_from_file_location(
            "generate_listening_audio", GENERATOR_PATH
        )
        cls.generator = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.generator)

    def setUp(self):
        self.assertIsNotNone(
            self.generator,
            "Listening audio generation must be reproducible",
        )

    def test_build_entries_have_stable_paths_and_source_sensitive_signatures(self):
        first = self.generator.build_entries("words", [("确", "què"), ("定", "dìng")])
        second = self.generator.build_entries("words", [("确", "què"), ("定", "dìng")])
        changed = self.generator.build_entries("words", [("确", "què"), ("定", "dìng2")])

        self.assertEqual(first[0]["path"], "audio/words/0000.mp3")
        self.assertEqual(first[1]["path"], "audio/words/0001.mp3")
        self.assertEqual(first, second)
        self.assertNotEqual(first[1]["signature"], changed[1]["signature"])
        self.assertEqual(first[0]["text"], "确")
        self.assertEqual(first[0]["pinyin"], "què")

    def test_current_asset_requires_matching_signature_and_nontrivial_file(self):
        entry = self.generator.build_entries("phrases", [("确定", "què dìng")])[0]
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            audio_path = root / entry["path"]
            audio_path.parent.mkdir(parents=True)
            audio_path.write_bytes(b"x" * 700)
            state = {entry["path"]: entry["signature"]}

            self.assertTrue(self.generator.is_entry_current(root, entry, state))
            self.assertFalse(self.generator.is_entry_current(root, entry, {}))
            state[entry["path"]] = "wrong"
            self.assertFalse(self.generator.is_entry_current(root, entry, state))
            audio_path.write_bytes(b"tiny")
            state[entry["path"]] = entry["signature"]
            self.assertFalse(self.generator.is_entry_current(root, entry, state))

    def test_synthesis_retries_and_atomically_keeps_success(self):
        entry = self.generator.build_entries("words", [("确", "què")])[0]
        attempts = []

        async def flaky_synthesizer(text, output_path):
            attempts.append(text)
            if len(attempts) < 3:
                raise RuntimeError("temporary failure")
            output_path.write_bytes(b"m" * 800)

        async def no_wait(_seconds):
            return None

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            asyncio.run(
                self.generator.generate_entry(
                    root,
                    entry,
                    flaky_synthesizer,
                    sleep=no_wait,
                )
            )
            final_path = root / entry["path"]
            self.assertEqual(len(attempts), 3)
            self.assertEqual(final_path.read_bytes(), b"m" * 800)
            self.assertFalse(final_path.with_suffix(".mp3.part").exists())

    def test_manifest_is_browser_executable_and_preserves_configuration(self):
        words = self.generator.build_entries("words", [("确", "què")])
        phrases = self.generator.build_entries("phrases", [("确定", "què dìng")])
        text = self.generator.render_manifest(words, phrases)

        prefix = "window.CHINESE_READER_LISTENING_AUDIO = "
        self.assertTrue(text.startswith(prefix))
        payload = json.loads(text[len(prefix):].removesuffix(";\n"))
        self.assertEqual(payload["voice"], "zh-CN-XiaoxiaoNeural")
        self.assertEqual(payload["rate"], "+0%")
        self.assertEqual(payload["volume"], "+0%")
        self.assertEqual(payload["pitch"], "+0Hz")
        self.assertEqual(payload["words"], words)
        self.assertEqual(payload["phrases"], phrases)


if __name__ == "__main__":
    unittest.main()
