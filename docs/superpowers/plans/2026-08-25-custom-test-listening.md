# Custom Test Listening Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an unscored Listening question type to Words and Phrases Custom Test, backed by 2,000 locally generated, consistent-voice Mandarin MP3 files.

**Architecture:** Keep speech synthesis entirely in a resumable Python build script and expose generated asset metadata through a browser-safe JavaScript manifest. Add two small vanilla-JavaScript runtime modules: one pure Custom Test question builder and one injected-audio controller/session module. Integrate the new type into the existing canvas quiz runner without changing scored question behavior.

**Tech Stack:** Vanilla JavaScript, Canvas 2D, browser `Audio`, Node.js `node:test`/`assert`, Python 3.12, `edge-tts==7.2.8`, `ffprobe`.

**Spec:** `docs/superpowers/specs/2026-08-25-custom-test-listening-design.md`

## Global Constraints

- Listening applies only to Words and Phrases Custom Test.
- Listening is honor-system only: never call correct/missed/progress/targeted-knowledge mutation paths.
- Use `zh-CN-XiaoxiaoNeural` with rate `+0%`, volume `+0%`, and pitch `+0Hz` for every asset.
- Runtime playback uses checked-in local MP3 files and never contacts a speech service.
- Preserve all existing Multiple Choice, Pinyin input, Definition, Review, regular quiz, phrase quiz, and skip quiz behavior.
- Keep characters, phrases, pinyin, definitions, and examples in their existing shared data files; consumers must not duplicate them.
- Use `apply_patch` for hand-edited files. The generator may mechanically write its manifest and MP3 outputs.
- This workspace is not a Git repository, so each task ends with a verification checkpoint instead of a commit.

---

### Task 1: Listening Checkbox and Saved Setting

**Files:**
- Modify: `custom-test.html`
- Create: `custom-quiz-logic.js`
- Modify: `select.js`
- Modify: `progress-backup.js`
- Create: `tests/custom-test-listening-setting.test.js`

**Interfaces:**
- Consumes: existing `.format-checkbox` markup and the `worksheet*` / `phraseCustomTest*` storage prefixes.
- Produces: checked `#listeningCheckbox`, `#listeningBox`, `listeningSelected`, `worksheetListening`, `phraseCustomTestListening`, and executable `readFormatSettings(storage, prefix)` / `writeFormatSettings(storage, prefix, settings)` helpers.

- [ ] **Step 1: Write the failing setting test**

Load `custom-quiz-logic.js` in a `vm` context with a real in-memory Storage implementation. Assert absent keys yield all four `true` settings, then write `{ listening: false }` for `worksheet` while preserving explicit settings for the other three types. Repeat with `phraseCustomTest` and assert the prefixes do not leak into one another.

Load `progress-backup.js` with the same complete Storage interface plus real `TextEncoder`, `TextDecoder`, `btoa`, and `atob`. Set `worksheetListening=false` and `phraseCustomTestListening=true`, call `getCNReaderProgressCode()`, clear storage, restore without reload, and assert both exact values return. This verifies backup behavior rather than matching prose or source lines.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/custom-test-listening-setting.test.js`

Expected: FAIL because `custom-quiz-logic.js` and its settings API are absent.

- [ ] **Step 3: Add the fourth checkbox and persistence**

Add beneath Definition:

```html
<div class="format-checkbox" id="listeningCheckbox">
  <div class="format-checkbox-box" id="listeningBox"></div>
  <span class="format-checkbox-label">Listening</span>
</div>
```

Create the IIFE settings API, load it before `select.js`, and use it to initialize all four settings. In `select.js`, mirror the existing toggle handler and save through the helper:

```js
window.CHINESE_READER_CUSTOM_QUIZ_LOGIC.writeFormatSettings(
  localStorage,
  storagePrefix,
  { mc: mcSelected, typing: writeSelected, definition: definitionSelected, listening: listeningSelected }
);
```

Add both content-specific keys to `FIXED_BACKUP_KEYS` in `progress-backup.js`.

- [ ] **Step 4: Run the focused and existing UI tests**

Run: `node tests/custom-test-listening-setting.test.js && node tests/custom-test-format-panel.test.js`

Expected: both PASS.

---

### Task 2: Pure Custom Question Builder

**Files:**
- Modify: `custom-quiz-logic.js`
- Create: `tests/custom-quiz-listening-logic.test.js`
- Modify: `custom-quiz.html`
- Modify: `quiz-engine.js`

**Interfaces:**
- Consumes: selected global indexes, `{ mc, typing, definition, listening }` settings, and an injected `makeQuestion(globalIndex, type)` callback.
- Produces: `window.CHINESE_READER_CUSTOM_QUIZ_LOGIC.buildQuestions(options)` returning unshuffled question objects.

- [ ] **Step 1: Write the failing builder test**

Load the real `custom-quiz-logic.js` into a `vm` context and assert:

```js
const questions = logic.buildQuestions({
  selectedGlobalIndices: [4, 9],
  selectedTypes: ['typing', 'listening'],
  makeQuestion(index, type) { return { charIndex: index, type }; },
});
assert.deepEqual(questions, [
  { charIndex: 4, type: 'typing' },
  { charIndex: 4, type: 'listening' },
  { charIndex: 9, type: 'typing' },
  { charIndex: 9, type: 'listening' },
]);
```

Also assert that an empty type list returns `[]` and that duplicate indexes are rejected by the caller's existing normalization rather than introduced by the builder.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/custom-quiz-listening-logic.test.js`

Expected: FAIL because `buildQuestions` is not yet exported.

- [ ] **Step 3: Implement the IIFE module**

```js
(function (global) {
  'use strict';

  // Keep the Task 1 read/write settings helpers.
  function buildQuestions(options) {
    const result = [];
    options.selectedGlobalIndices.forEach(function (globalIndex) {
      options.selectedTypes.forEach(function (type) {
        result.push(options.makeQuestion(globalIndex, type));
      });
    });
    return result;
  }

  global.CHINESE_READER_CUSTOM_QUIZ_LOGIC.buildQuestions = buildQuestions;
})(window);
```

Load it before `quiz-engine.js`. In `startCustomQuizPage()`, read `storagePrefix + 'Listening'`, construct the selected type list, build word or phrase questions with the module, and keep the existing final shuffle.

- [ ] **Step 4: Verify the builder and quiz syntax**

Run: `node tests/custom-quiz-listening-logic.test.js && node --check custom-quiz-logic.js && node --check quiz-engine.js`

Expected: PASS with no syntax output.

---

### Task 3: Testable Audio Lock and Reveal Session

**Files:**
- Create: `listening-audio.js`
- Create: `tests/listening-audio-controller.test.js`
- Modify: `custom-quiz.html`

**Interfaces:**
- Consumes: `{ AudioCtor, onStateChange }`, then local MP3 URLs.
- Produces: `window.CHINESE_READER_LISTENING.createAudioController({ AudioCtor, onStateChange })` and `createQuestionSession({ controller, audioUrl })`.
- Controller methods: `setSource(url)`, `play() -> Promise<boolean>`, `isBusy()`, `hasError()`, `destroy()`.
- Session methods: `reveal()`, `isRevealed()`, `canAdvance()`, `play()`, `destroy()`.

- [ ] **Step 1: Write the failing audio-controller tests**

Use a real event-emitting fake `Audio` implementation and assert behavior rather than call counts alone:

```js
controller.setSource('audio/words/0000.mp3');
assert.equal(await controller.play(), true);
assert.equal(controller.isBusy(), true);
assert.equal(await controller.play(), false);
fakeAudio.finish();
assert.equal(controller.isBusy(), false);
assert.equal(await controller.play(), true);
```

Add separate cases for rejected `play()` promises, `error` events, source replacement cleanup, and `destroy()`. For the session, assert `canAdvance()` is false before `reveal()` and true afterward, with no score callback in its API.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/listening-audio-controller.test.js`

Expected: FAIL because `listening-audio.js` does not exist.

- [ ] **Step 3: Implement the controller and session**

The controller must set its busy flag before calling `audio.play()`, ignore concurrent requests, clear busy on `ended`, `error`, or rejection, and detach every installed listener during source replacement/destruction. `destroy()` pauses and rewinds the current element.

The session calls `controller.setSource(options.audioUrl)`, wraps that controller source, and maintains only:

```js
let revealed = false;
return {
  reveal() { revealed = true; return true; },
  isRevealed() { return revealed; },
  canAdvance() { return revealed; },
  play() { return controller.play(); },
  destroy() { controller.destroy(); },
};
```

Load `listening-audio.js` before the generated manifest and `quiz-engine.js` in `custom-quiz.html`.

- [ ] **Step 4: Run controller tests and syntax checks**

Run: `node tests/listening-audio-controller.test.js && node --check listening-audio.js`

Expected: PASS.

---

### Task 4: Canvas Listening Interaction and Honor-System Navigation

**Files:**
- Modify: `quiz-engine.js`
- Create: `tests/listening-quiz-integration.test.js`

**Interfaces:**
- Consumes: `question.type === 'listening'`, `question.audioUrl`, and `CHINESE_READER_LISTENING.createQuestionSession({ controller, audioUrl })`.
- Produces: concealed/revealed rendering, Play Sound hit target, automatic play attempt, details routing, and unscored advance behavior.

- [ ] **Step 1: Write the failing integration behavior test**

Execute `listening-audio.js` and `quiz-engine.js` in a `vm` context containing complete minimal DOM, CanvasRenderingContext2D, Storage, and Audio fakes. `quiz-engine.js` exposes `createQuizRunner` through `window.CHINESE_READER_QUIZ_TEST_API` before its page-mode bootstrap. The fake canvas records visible `fillText` values and dispatches real registered pointer events; the fake document dispatches the real key/click handlers.

Create a single listening question and assert the initial draw includes literal `Click to reveal`, the typing input is hidden, and the Audio fake enters playing state. Dispatch a canvas click at the hand-derived square center `(window.innerWidth / 2, window.innerHeight / 2 - 100)`, then assert the draw includes the literal fixture character and no longer includes `Click to reveal`. Dispatch a non-repeating key and assert the runner's real `onFinish` result contains empty correct and missed arrays and the injected knowledge-adjustment counter remains zero.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/listening-quiz-integration.test.js`

Expected: FAIL because the runner treats `listening` as typing and displays the input instead of the concealed listening state.

- [ ] **Step 3: Add listening layout and drawing**

Add constants near the existing square/input layout and implement:

```js
function drawListeningContent(ctx, offsetX, prepared, revealed, unavailable) {
  // Draw the SQUARE2 white fill and black outline.
  // Concealed: fit black Times New Roman "Click to reveal".
  // Revealed: fit prepared.char in "DFFangSong", serif.
  // Draw the black Play Sound button below; use "Sound unavailable" on error.
}
```

Hide the typing input for listening. During `resetForPrepared`, create the session with `createQuestionSession({ controller: listeningAudioController, audioUrl: prepared.audioUrl })` and immediately call `play()`. Destroy the old session before changing questions or finishing.

- [ ] **Step 4: Add guarded input behavior**

Implement these exact branches:

- Concealed square click: stop propagation, reveal, set navigation-complete state, redraw.
- Revealed square click: stop propagation, open existing details popup.
- Play Sound click at either state: stop propagation and call session play; a busy controller ignores it.
- Document keydown: when revealed, ignore repeats/popup/slide, prevent default, and advance without scoring.
- Document click: when revealed, advance only if the click was not stopped by square, popup, or Play Sound.
- `isCurrentQuestionAnswered()`: return session reveal state for listening.
- `moveToNextQuestion()` and finish: destroy listening audio before transition.

- [ ] **Step 5: Prove honor-system isolation**

Use the same executable runner harness, its existing `onFinish` result, and an injected knowledge-adjustment function. Reveal and advance one listening fixture and assert:

```js
assert.deepEqual(result.correctItems, []);
assert.deepEqual(result.missedItems, []);
assert.equal(knowledgeAdjustments, 0);
```

- [ ] **Step 6: Run focused and existing quiz tests**

Run: `node tests/listening-quiz-integration.test.js && node --check quiz-engine.js`

Expected: PASS.

---

### Task 5: Generated Manifest and 2,000 Local MP3 Assets

**Files:**
- Create: `requirements-listening.txt`
- Create: `generate-listening-audio.py`
- Generate: `listening-audio-manifest.js`
- Generate: `audio/words/0000.mp3` through `audio/words/0999.mp3`
- Generate: `audio/phrases/0000.mp3` through `audio/phrases/0999.mp3`
- Create: `tests/listening-audio-assets.test.js`

**Interfaces:**
- Consumes: `Characters/characters*.txt`, `Pinyin/pinyin*.txt`, `Phrases/phrases*.txt`, and `PPinyin/pinyin*.txt`, exactly 10 units × 100 aligned entries each.
- Produces: `window.CHINESE_READER_LISTENING_AUDIO = { generatorVersion, voice, rate, volume, pitch, words, phrases }` and every referenced MP3.

- [ ] **Step 1: Write the failing asset integrity test**

Load the manifest in a `vm` context. Compare all `text` and `pinyin` fields to the aligned source files. Assert 1,000 entries per content type, exact path format, unique paths, file existence, nonzero size, and MP3 decode success.

For efficient `ffprobe` validation, first test every file is larger than 500 bytes, then run one command across the complete path list and fail on any nonzero exit. Also inspect representative first/middle/last assets from both collections for `codec_name=mp3` and a positive duration.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/listening-audio-assets.test.js`

Expected: FAIL because the generated manifest/assets are absent.

- [ ] **Step 3: Add the pinned build dependency and generator**

`requirements-listening.txt` contains:

```text
edge-tts==7.2.8
```

The generator reads and NFC-normalizes every nonblank source line, validates 100 entries per unit and 1,000 total per content type, and constructs entries:

```py
{
    "text": text,
    "pinyin": pinyin,
    "path": f"audio/{kind}/{index:04d}.mp3",
    "signature": sha256(config_and_source.encode("utf-8")).hexdigest(),
}
```

Use `asyncio.Semaphore(4)`, `edge_tts.Communicate`, temporary `*.part` output files, atomic rename after nonempty output, three retries, and exponential delays of 1, 2, and 4 seconds. Skip only files whose previous signature matches. Exit nonzero with a list of failed entries if retries are exhausted.

- [ ] **Step 4: Install the build-only dependency outside the project**

Run:

```bash
python3 -m venv /tmp/cnreader-listening-venv
/tmp/cnreader-listening-venv/bin/pip install -r requirements-listening.txt
```

Expected: `edge-tts==7.2.8` installs without adding project runtime files.

- [ ] **Step 5: Generate all assets with resumable progress**

Run: `/tmp/cnreader-listening-venv/bin/python generate-listening-audio.py`

Expected final line: `Generated 2000/2000 listening assets; 0 failures.`

During the long run, report progress to the user at least once per minute. If interrupted, rerun the same command; valid completed signatures are skipped.

- [ ] **Step 6: Run the asset integrity test**

Run: `node tests/listening-audio-assets.test.js`

Expected: PASS with 1,000 word and 1,000 phrase files validated.

---

### Task 6: Runtime Manifest Binding, Cache Keys, and Documentation

**Files:**
- Modify: `custom-quiz.html`
- Modify: `quiz-engine.js`
- Modify: `AGENTS.md`
- Modify: relevant `?v=` cache keys in `custom-test.html` and `custom-quiz.html`
- Create: `tests/listening-runtime-binding.test.js`

**Interfaces:**
- Consumes: generated manifest arrays aligned by global index.
- Produces: each listening question receives its exact local `audioUrl`; initialization fails clearly on missing/misaligned metadata.

- [ ] **Step 1: Write the failing binding test**

Execute the generated manifest, shared unit data, phrase data, Custom Test logic, and an exported `buildCustomQuizQuestions` boundary from `quiz-engine.js` in a `vm` context. For both content modes, resolve indexes `0` and `999`, assert the returned listening questions contain the hand-derived local paths and exact source text/pinyin, and assert a deliberately mismatched manifest fixture throws `Listening audio manifest is missing or out of date.`

Browser verification, not a source-text test, confirms that `custom-quiz.html` loads scripts in this order:

```text
unit-data.js / phrase-data.js
custom-quiz-logic.js
listening-audio.js
listening-audio-manifest.js
quiz-engine.js
```

Human documentation is reviewed against the specification during the final requirement audit; it is not tested by grepping prose.

- [ ] **Step 2: Run it and verify RED**

Run: `node tests/listening-runtime-binding.test.js`

Expected: FAIL until manifest binding and documentation are present.

- [ ] **Step 3: Bind manifest entries while building questions**

In `startCustomQuizPage()`, validate the selected manifest collection length against the current flattened curriculum. When making a listening question, attach:

```js
question.audioUrl = audioEntries[globalIndex].path;
```

Throw `Listening audio manifest is missing or out of date.` if any selected listening entry is unavailable or does not match `char` and `pinyin`.

- [ ] **Step 4: Document maintenance and bump cache keys**

Document the build-time-only dependency, exact generator command, source alignment, voice settings, file naming, polyphonic limitation, storage keys, and validation command in `AGENTS.md`. Bump changed JavaScript cache keys using one consistent listening-feature version.

- [ ] **Step 5: Run the binding and syntax tests**

Run: `node tests/listening-runtime-binding.test.js && node --check custom-quiz-logic.js && node --check listening-audio.js && node --check listening-audio-manifest.js && node --check quiz-engine.js`

Expected: PASS.

---

### Task 7: Full Regression and Browser Verification

**Files:**
- Verify all changed and generated files.

**Interfaces:**
- Consumes: completed implementation and audio assets.
- Produces: fresh evidence that the new mode works without regressing existing modes.

- [ ] **Step 1: Run every automated test and syntax check**

```bash
set -e
for test_file in tests/*.test.js; do node "$test_file"; done
for js_file in *.js tests/*.js; do node --check "$js_file"; done
python3 -m py_compile generate-listening-audio.py
```

Expected: every test exits zero; no syntax errors.

- [ ] **Step 2: Run fresh asset coverage verification**

Run: `node tests/listening-audio-assets.test.js`

Expected: 2,000 aligned, nonempty, decodable MP3s and no network references in runtime code.

- [ ] **Step 3: Browser-check Words Custom Test**

Select one word with Listening as the only type. Verify attempted autoplay, Play Sound replay, concurrent click lock, Click to reveal typography, revealed character, details popup, key advance, outside-square advance, and no changes to `charProgress` or `charKnowledge`.

- [ ] **Step 4: Browser-check Phrases Custom Test**

Repeat with one phrase and confirm the popup shows phrase pinyin/definition, Play Sound remains available after reveal, and `phraseProgress`/`phraseKnowledge` remain unchanged.

- [ ] **Step 5: Browser-check mixed formats and fallback**

Enable Listening plus Pinyin input, confirm both question types are generated and shuffled, and confirm existing typing submission remains unchanged. Simulate a rejected audio play promise or missing asset and verify Play Sound fallback / Sound unavailable without quiz deadlock.

- [ ] **Step 6: Final requirement audit**

Re-read the specification and confirm each requirement has a passing automated assertion or observed browser result. Record the in-app browser limitation plainly if that browser surface is unavailable.
