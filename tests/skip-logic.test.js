const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'skip-logic.js'), 'utf8'),
  context,
  { filename: 'skip-logic.js' }
);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'phrase-quiz-logic.js'), 'utf8'),
  context,
  { filename: 'phrase-quiz-logic.js' }
);

const skipLogic = context.window.CHINESE_READER_SKIP_LOGIC;
const phraseLogic = context.window.CHINESE_READER_PHRASE_QUIZ_LOGIC;

function toNativeArray(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeSeededRandom(seed) {
  let state = seed >>> 0;
  return function () {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sorted(values) {
  return values.slice().sort(function (left, right) { return left - right; });
}

assert.equal(
  skipLogic.canOfferSkipTarget(48, -1, 1000),
  false,
  'A new learner must not be offered a skip before the 50th item'
);
assert.equal(
  skipLogic.canOfferSkipTarget(49, -1, 1000),
  true,
  'A new learner must be offered a skip on the 50th item'
);
assert.equal(
  skipLogic.canOfferSkipTarget(148, 99, 1000),
  false,
  'The 50-item minimum must move forward with the progress frontier'
);
assert.equal(
  skipLogic.canOfferSkipTarget(149, 99, 1000),
  true,
  'The first target 50 items beyond current progress must be offered'
);

assert.equal(
  typeof skipLogic.buildSkipRangeIndices,
  'function',
  'Skip logic must expose the inclusive range used for completion'
);
const completionRange = toNativeArray(skipLogic.buildSkipRangeIndices(99, 149, 1000));
assert.equal(completionRange.length, 50);
assert.equal(completionRange[0], 100);
assert.equal(completionRange[49], 149, 'The clicked target must be completed after a pass');

assert.equal(
  typeof skipLogic.buildSkipQuizIndices,
  'function',
  'Skip logic must expose the 50-question content selector'
);
const minimumSkip = toNativeArray(
  skipLogic.buildSkipQuizIndices(-1, 49, 1000, makeSeededRandom(1))
);
assert.equal(minimumSkip.length, 50, 'A minimum-distance skip must have exactly 50 questions');
assert.equal(new Set(minimumSkip).size, 50, 'A skip quiz must not repeat content');
assert.deepEqual(sorted(minimumSkip), Array.from({ length: 50 }, function (_, index) { return index; }));
assert.notDeepEqual(
  minimumSkip,
  sorted(minimumSkip),
  'The final 50-question pool must not remain in curriculum order'
);

const longSkipA = toNativeArray(
  skipLogic.buildSkipQuizIndices(-1, 149, 1000, makeSeededRandom(11))
);
const longSkipB = toNativeArray(
  skipLogic.buildSkipQuizIndices(-1, 149, 1000, makeSeededRandom(29))
);
for (const questions of [longSkipA, longSkipB]) {
  assert.equal(questions.length, 50);
  assert.equal(new Set(questions).size, 50);
  for (let recentIndex = 125; recentIndex <= 149; recentIndex++) {
    assert.ok(questions.includes(recentIndex), 'The latest 25 items must always be selected');
  }
  const randomHalf = questions.filter(function (index) { return index < 125; });
  assert.equal(randomHalf.length, 25, 'Exactly 25 questions must come from the earlier random pool');
  assert.ok(randomHalf.every(function (index) { return index >= 0 && index < 125; }));

  const firstHalfRecentCount = questions.slice(0, 25).filter(function (index) {
    return index >= 125;
  }).length;
  assert.ok(
    firstHalfRecentCount > 0 && firstHalfRecentCount < 25,
    'The latest and random halves must be mixed in the final order'
  );
}
assert.notDeepEqual(
  sorted(longSkipA.filter(function (index) { return index < 125; })),
  sorted(longSkipB.filter(function (index) { return index < 125; })),
  'Different random draws must be able to select different earlier items'
);

const wordTypes = [
  skipLogic.pickRandomQuestionType(['mc', 'typing'], function () { return 0; }),
  skipLogic.pickRandomQuestionType(['mc', 'typing'], function () { return 0.999; }),
];
assert.deepEqual(wordTypes, ['mc', 'typing']);

const phraseTypes = [
  skipLogic.pickRandomQuestionType(['mc', 'typing', 'definition'], function () { return 0; }),
  skipLogic.pickRandomQuestionType(['mc', 'typing', 'definition'], function () { return 0.5; }),
  skipLogic.pickRandomQuestionType(['mc', 'typing', 'definition'], function () { return 0.999; }),
];
assert.deepEqual(phraseTypes, ['mc', 'typing', 'definition']);

const phraseQuestions = toNativeArray(
  phraseLogic.buildSkipIndices(-1, 149, 1000, makeSeededRandom(7))
);
assert.equal(phraseLogic.MAX_SKIP_QUESTIONS, 50, 'Phrase skip quizzes must also always use 50 questions');
assert.equal(phraseQuestions.length, 50);
assert.equal(new Set(phraseQuestions).size, 50);
for (let recentIndex = 125; recentIndex <= 149; recentIndex++) {
  assert.ok(phraseQuestions.includes(recentIndex));
}
assert.equal(phraseLogic.getRequiredSkipCorrectCount(50), 48);
assert.equal(phraseLogic.hasPassedSkipQuiz(47, 50), false);
assert.equal(phraseLogic.hasPassedSkipQuiz(48, 50), true);

assert.equal(
  typeof skipLogic.canStillPassSkipQuiz,
  'function',
  'Pass viability must be part of the shared word-and-phrase skip algorithm'
);
assert.equal(
  skipLogic.canStillPassSkipQuiz(0, 2, 50),
  true,
  'A skip quiz can continue after two incorrect answers because 48/50 remains possible'
);
assert.equal(
  skipLogic.canStillPassSkipQuiz(0, 3, 50),
  false,
  'A skip quiz must end after three incorrect answers because 48/50 is impossible'
);
assert.equal(
  skipLogic.canStillPassSkipQuiz(1, 3, 50),
  true,
  'Three answered questions must not end the quiz when only two were incorrect'
);

console.log('skip quizzes use 25 latest and 25 random unique items in a shuffled 50-question pool');
