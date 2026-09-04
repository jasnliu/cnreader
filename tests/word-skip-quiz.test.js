const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createStorage(entries) {
  const values = new Map(entries || []);
  return {
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

function makeUnit(startIndex) {
  return {
    characters: Array.from({ length: 100 }, function (_, index) {
      return 'word-' + (startIndex + index);
    }),
    pinyin: Array.from({ length: 100 }, function (_, index) {
      return 'pinyin-' + (startIndex + index);
    }),
    quizPinyin: Array.from({ length: 100 }, function (_, index) {
      return 'pinyin-' + (startIndex + index);
    }),
  };
}

let randomState = 17;
const deterministicMath = Object.create(Math);
deterministicMath.random = function () {
  randomState = (randomState * 1664525 + 1013904223) >>> 0;
  return randomState / 4294967296;
};

const storage = createStorage([
  ['charProgress', '{"99":1}'],
]);
const windowFake = {
  CHINESE_READER_UNIT_DATA: [makeUnit(0), makeUnit(100)],
};
windowFake.window = windowFake;
const context = vm.createContext({
  window: windowFake,
  document: { currentScript: null },
  localStorage: storage,
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  setTimeout,
  clearTimeout,
  console,
  URLSearchParams,
  Math: deterministicMath,
  Map,
  Set,
});

vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'skip-logic.js'), 'utf8'),
  context,
  { filename: 'skip-logic.js' }
);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'quiz-engine.js'), 'utf8'),
  context,
  { filename: 'quiz-engine.js' }
);

const api = windowFake.CHINESE_READER_QUIZ_TEST_API;
assert.equal(typeof api.buildSkipQuizQuestions, 'function');
assert.equal(typeof api.completeSkippedWords, 'function');

const questions = api.buildSkipQuizQuestions(149);
const questionIndices = questions.map(function (question) { return question.trackIndex; });
assert.equal(questions.length, 50, 'A word skip quiz must always contain 50 questions');
assert.equal(new Set(questionIndices).size, 50, 'A word skip quiz must not repeat a word');
assert.ok(questionIndices.includes(149), 'The clicked target must be tested');
assert.ok(
  questions.every(function (question) {
    return question.type === 'mc' || question.type === 'typing';
  }),
  'Word skip questions must randomly use only multiple choice and pinyin input'
);
assert.deepEqual(
  Array.from(new Set(questions.map(function (question) { return question.type; }))).sort(),
  ['mc', 'typing'],
  'The deterministic runtime draw must exercise both word question types'
);

storage.setItem('charProgress_1', '{"80":1}');
api.completeSkippedWords(149, 99);
const completedUnitTwo = JSON.parse(storage.getItem('charProgress_1'));
for (let localIndex = 0; localIndex < 50; localIndex++) {
  assert.equal(
    completedUnitTwo[String(localIndex)],
    6,
    'Completion must use the same frontier that was used to build the quiz'
  );
}
assert.equal(completedUnitTwo['49'], 6, 'Passing must complete the clicked target');
assert.equal(completedUnitTwo['80'], 1, 'Unrelated progress written during the quiz must be preserved');

storage.setItem('charProgress', '{"99":0}');
storage.removeItem('charProgress_1');
const newLearnerQuestions = api.buildSkipQuizQuestions(49);
assert.equal(
  newLearnerQuestions.length,
  50,
  'Zero-valued storage entries must not move the word progress frontier'
);

console.log('word skip quiz runtime builds and completes the approved inclusive 50-item range');
