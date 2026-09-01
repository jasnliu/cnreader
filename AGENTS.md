# Project: Chinese Character Reader (Duolingo-style)

A vanilla JavaScript website for learning Chinese character and phrase readings. The project currently contains 10 units of 100 characters each (1,000 unique characters total) and 10 units of 100 phrases each (1,000 unique phrases total).

## Runtime architecture

All pages load `unit-data.js`, which defines `window.CHINESE_READER_UNIT_DATA`. This is the runtime source of truth. Each unit has five aligned 100-entry arrays:

```js
{
  characters: [],
  pinyin: [],       // shown in the grids and definition popups
  quizPinyin: [],   // exact accepted quiz answer
  definitions: [],
  examples: [[], []]
}
```

Do not add character, pinyin, definition, or example arrays directly to `script.js`, `select.js`, `quiz-engine.js`, `worksheet.js`, or `word-details.js`. Those consumers must continue reading the shared unit data.

The phrase grid, phrase quiz, phrase review, and phrase custom test load `phrase-data.js`, which defines `window.CHINESE_READER_PHRASE_UNITS`. Each phrase unit has three aligned 100-entry arrays: `phrases`, `pinyin`, and `definitions`. `window.CHINESE_READER_PHRASE_DATA` is a backward-compatible alias for the first unit.

## Source-file layout

| Path | Purpose |
|---|---|
| `Characters/characters.txt` | Unit 1 characters, one per line |
| `Characters/characters2.txt` … `characters10.txt` | Units 2–10 characters, one per line |
| `Pinyin/pinyin.txt` | Unit 1 exact quiz pinyin, one per line |
| `Pinyin/pinyin2.txt` … `pinyin10.txt` | Units 2–10 exact quiz pinyin, one per line |
| `Examples/examples.txt` | Unit 1 examples, two per line |
| `Examples/examples2.txt` … `examples10.txt` | Units 2–10 examples, two per line |
| `Phrases/phrases.txt` | Phrase Unit 1, one phrase per line |
| `Phrases/phrases2.txt` … `phrases10.txt` | Phrase Units 2–10, one phrase per line |
| `PPinyin/pinyin.txt` | Phrase Unit 1 pinyin, one reading per line |
| `PPinyin/pinyin2.txt` … `pinyin10.txt` | Phrase Units 2–10 pinyin, one reading per line |
| `PDefinitions/pdefinitions.txt` | Phrase Unit 1 definitions, one per line |
| `PDefinitions/pdefinitions2.txt` … `pdefinitions10.txt` | Phrase Units 2–10 definitions, one per line |
| `unit-data.js` | Generated/compiled runtime data used by every page |
| `phrase-data.js` | Generated/compiled phrase data used by the phrase grid and quiz |
| `generate-phrase-data.js` | Validates phrase sources and compiles `phrase-data.js` |
| `word-details.js` | Exposes shared definitions/examples to quiz result popups |
| `reading-dictionary.js` | Reading-mode dictionary for the bundled excerpt |

There are intentionally no `definitions*.txt` files. Definitions live only in the compiled `unit-data.js` and come from the external source documented below.

Phrase definitions are separate aligned source data under `PDefinitions/`. After editing aligned phrase sources, run `node generate-phrase-data.js` and bump the `phrase-data.js` cache key in every HTML page that loads it.

## Data sources and conventions

### Characters

The ranked character lists are the project’s user-provided curriculum. Each unit source file must contain exactly 100 characters. Across all current units, characters are unique.

### Definitions

Definitions come verbatim from the `definition` field in the official Make Me a Hanzi dictionary:

- Repository: https://github.com/skishore/makemeahanzi
- Dictionary: https://github.com/skishore/makemeahanzi/blob/master/dictionary.txt
- Raw dictionary: https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt

The dictionary is newline-delimited JSON. Find the object whose `character` field matches the character and copy its `definition` value into `unit-data.js`. Do not recreate `definitions*.txt` files.

`reading-dictionary.js` was also generated from Make Me a Hanzi, but only for characters used by the bundled reading excerpt.

### Phrase definitions

Phrase definitions use exact simplified-headword matches from CC-CEDICT:

- Official download and license: https://cc-cedict.org/editor/editor.php?handler=Download
- License: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)

For each phrase, first choose the exact CC-CEDICT headword entry whose pinyin matches the aligned `PPinyin/` reading. A base-syllable match may be used only for normal tone-sandhi or neutral-tone differences. Remove dictionary metadata such as classifiers, variant/abbreviation notes, alternate-pronunciation notes, and cross-references. Keep the concise, useful, distinct English senses (normally no more than four), in dictionary order, separated by a semicolon and one space (`; `). If CC-CEDICT has no exact phrase headword, add a concise manually verified fallback rather than constructing a definition by joining the individual characters.

The existing phrase definition files are curated source data: preserve their wording unless correcting a known error. Keep every `Phrases/`, `PPinyin/`, and `PDefinitions/` file index-aligned at exactly 100 nonblank NFC-normalized lines. After any change, run `node generate-phrase-data.js`; it validates all phrase units and rebuilds `phrase-data.js`. Then bump the `phrase-data.js?v=` cache key in every HTML page that loads it.

### Pinyin

Quiz pinyin is stored in `Pinyin/` and must use lowercase, NFC-normalized accented pinyin (`lǜ`, not tone numbers or `lv`). Choose the reading taught by the examples/common usage, because a dictionary’s first reading is not always the intended one for a polyphonic character.

For a new unit, `pinyin` and `quizPinyin` should normally be identical. They may differ only when the grid intentionally displays an alternate or multiple readings. Existing Unit 1–3 display/quiz differences are:

- `了`: grid `le, liǎo`; quiz `le`
- `地`: grid `de`; quiz `dì`
- `子`: grid `zi`; quiz `zǐ`
- `只`: grid `zhī`; quiz `zhǐ`
- `长`: grid `zhǎng`; quiz `cháng`
- `处`: grid `chù`; quiz `chǔ`

Typing shortcuts in quizzes and search: `1`–`4` apply tone marks and `5` changes `u` to `ü`; a tone key can then produce `ǖ`, `ǘ`, `ǚ`, or `ǜ`. A tone key applies to a directly selected vowel or the vowel immediately before the caret, including when correcting an earlier syllable.

On active multiple-choice questions, keyboard keys `1`–`4` select the answer buttons from top to bottom. Number-key selection uses the same scoring and feedback path as clicking; held-key repeats and modifier shortcuts are ignored.

Definition-input questions normalize case and punctuation, check semicolon/comma alternatives, and treat standalone `to` and `be` as optional. Non-exact answers are accepted when either character-edit similarity or word overlap is greater than 75%. Candidates shorter than four non-space characters remain exact-only to avoid broad accidental matches.

### Examples

Examples are project-authored/user-provided and stored in `Examples/`. Every line must contain exactly two examples in this format:

```text
完全 (wán quán), 完成 (wán chéng)
```

Both examples should contain the target character and use accurate accented pinyin. Polyphonic examples may demonstrate different readings.

## Adding a new unit or new characters

1. Add the character file under `Characters/`, the matching pinyin file under `Pinyin/`, and the matching two-example file under `Examples/`.
2. Keep all three files index-aligned and at exactly 100 lines for a full unit.
3. Fetch each definition from Make Me a Hanzi’s `dictionary.txt` using the source above.
4. Add a new aligned object to `window.CHINESE_READER_UNIT_DATA` in `unit-data.js`. There is currently no checked-in generator, so validate the compiled object carefully.
5. Ensure `characters`, `pinyin`, `quizPinyin`, `definitions`, and `examples` have identical lengths and that every example entry contains exactly two strings.
6. Bump the `?v=` cache key for `unit-data.js` in every HTML page that loads it.
7. Run `node --check` on all modified JavaScript and verify there are no duplicate characters across units.

The main grid, selector, quizzes, review, progress storage, and worksheet all iterate over the shared unit array dynamically; adding another valid unit should not require hard-coded consumer changes.

## Main files

| File | Purpose |
|---|---|
| `index.html` + `script.js` | Main word grid, search, reading view, progress, unit navigation |
| `quiz.html`, `phrase-quiz.html`, `review.html`, `custom-quiz.html` + `quiz-engine.js` | Regular, phrase, review, custom, and skip quiz modes |
| `custom-test.html` + `select.js` | Word or phrase selection and custom quiz setup |
| `select.html`, `worksheet.html` + `worksheet.js` | Word and phrase worksheet selection, preview, and PDF export |
| `word-details.js` | Quiz missed-word details sourced from shared unit data |
| `DFFangSong1B Regular.ttf` | Local Chinese display font |

## Progress storage

- Unit 1 uses `localStorage` key `charProgress`.
- Later units use `charProgress_1`, `charProgress_2`, and so on, using zero-based unit indexes in the suffix.
- Each map is `{ localCharacterIndex: correctCount }`; progress is considered complete at 6.
- `currentUnit` stores a zero-based unit index.
- Phrase progress uses `phraseProgress`, `phraseProgress_1`, and so on; `phraseCurrentUnit` stores the selected phrase unit.
- Worksheet selections are saved independently while building/previewing a sheet: word global indexes use `worksheetGlobalChars`, phrase global indexes use `phraseWorksheetGlobalPhrases`, and `worksheetSelectionContent` remembers the active selector tab. A normal plus-menu entry clears both selections, while Back from `worksheet.html` uses `worksheetReturn` to preserve them for editing. The mixed worksheet renders all selected words first, then all selected phrases.
- Targeted word review values use `charKnowledge`; targeted phrase review values use `phraseKnowledge`. Phrase keys are global phrase indexes. Word and Phrase Review eligibility requires a fully complete (6/6) progress bar; knowledge values rank eligible items but do not make incomplete items eligible.
- Correct answers in Word Review and Phrase Review increment the item's progress bar by one, capped at 6. Incorrect answers do not add progress.
- XP is shared across Words and Phrases: each stored progress step is worth 2 XP (12 at completion). Correct answers on already-complete items add one persistent bonus XP under `cnReaderCompletedAnswerXp`; Custom Tests do not award XP.
- Word Review supports `mc` and `typing` (pinyin input); Phrase Review also supports `definition`. Definition questions must never be generated for single characters.
- Word Custom Test supports `mc`, `typing`, and honor-system `listening`; Phrase Custom Test also supports `definition`. Listening reveals do not change progress, missed-item results, or `charKnowledge`/`phraseKnowledge`. The format settings are `worksheetListening` for words and `phraseCustomTestListening` for phrases.

### Listening audio

Listening questions use checked-in static MP3 files and never call a speech service at runtime. `listening-audio-manifest.js` aligns global word and phrase indexes to `audio/words/` and `audio/phrases/`. All clips use the same `zh-CN-XiaoxiaoNeural` voice with neutral rate, volume, and pitch.

After changing the aligned character/phrase or pinyin sources, install the pinned build dependency from `requirements-listening.txt`, run `python generate-listening-audio.py`, and commit the updated audio files, manifest, and build state together. The generator is resumable and content-signature based. Run `node tests/listening-audio-assets.test.js` to verify manifest alignment and decode every MP3. Single-character synthesis may still choose an unintended reading for a polyphonic character; phrases provide more pronunciation context.

### Console progress backup

Every page loads `progress-backup.js`. In the browser developer console:

- `getCNReaderProgressCode()` returns and prints a versioned backup code containing word/phrase progress, XP bonus rewards, quiz positions and settings, worksheet/custom-test selections, and `charKnowledge`/`phraseKnowledge` targeted-review values.
- `restoreCNReaderProgress('CODE')` validates the code, exactly replaces CNReader-owned saved state, clears transient skip/return flags, and reloads the page.

Restore never clears unrelated `localStorage` entries. The backup code intentionally excludes one-time skip-quiz launch flags and the transient XP-header animation start value.

## General notes

- No frameworks or external runtime libraries.
- Canvas rendering uses `devicePixelRatio` scaling.
- Chinese characters use `"DFFangSong", serif`; pinyin uses `"Times New Roman", serif`.
- Main-page horizontal overflow is hidden; quiz pages use full-screen canvases with overflow hidden.

### Agent autonomy

Do not ask for permission to proceed unless the user explicitly asks for approval or confirmation.
