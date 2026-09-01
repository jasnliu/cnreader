const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {} });

[
  'custom-quiz-logic.js',
  'unit-data.js',
  'phrase-data.js',
  'listening-audio-manifest.js',
].forEach(function (filename) {
  vm.runInContext(
    fs.readFileSync(path.join(projectRoot, filename), 'utf8'),
    context,
    { filename: filename }
  );
});

const logic = context.window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;
const manifest = context.window.CHINESE_READER_LISTENING_AUDIO;
const wordUnits = context.window.CHINESE_READER_UNIT_DATA;
const phraseUnits = context.window.CHINESE_READER_PHRASE_UNITS;

function flatWords() {
  return wordUnits.flatMap(function (unit) {
    return unit.characters.map(function (character, index) {
      return { char: character, pinyin: unit.quizPinyin[index] };
    });
  });
}

function flatPhrases() {
  return phraseUnits.flatMap(function (unit) {
    return unit.phrases.map(function (phrase, index) {
      return { char: phrase, pinyin: unit.pinyin[index] };
    });
  });
}

const words = flatWords();
const phrases = flatPhrases();

[
  { question: words[0], index: 0, entries: manifest.words, path: 'audio/words/0000.mp3' },
  { question: words[999], index: 999, entries: manifest.words, path: 'audio/words/0999.mp3' },
  { question: phrases[0], index: 0, entries: manifest.phrases, path: 'audio/phrases/0000.mp3' },
  { question: phrases[999], index: 999, entries: manifest.phrases, path: 'audio/phrases/0999.mp3' },
].forEach(function (fixture) {
  const bound = logic.bindListeningAudio(fixture.question, fixture.index, fixture.entries);
  assert.strictEqual(bound.audioUrl, fixture.path);
  assert.strictEqual(bound.char, fixture.question.char);
  assert.notStrictEqual(bound, fixture.question, 'Binding should not mutate the base question');
});

assert.throws(function () {
  logic.bindListeningAudio({ char: '错', pinyin: 'cuò' }, 0, manifest.words);
}, /does not match/i);

assert.throws(function () {
  logic.bindListeningAudio(words[0], 2000, manifest.words);
}, /missing/i);

console.log('Listening questions bind to exact, content-matched local audio');
