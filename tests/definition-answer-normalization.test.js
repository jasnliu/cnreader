const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {} });
const logicPath = path.join(__dirname, '..', 'phrase-quiz-logic.js');
vm.runInContext(fs.readFileSync(logicPath, 'utf8'), context, {
  filename: 'phrase-quiz-logic.js',
});

const isCorrect = context.window.CHINESE_READER_PHRASE_QUIZ_LOGIC.isDefinitionAnswerCorrect;

assert.equal(isCorrect('to be afraid', 'afraid'), true);
assert.equal(isCorrect('to be afraid', 'to be afraid'), true);
assert.equal(isCorrect('to be afraid', 'be afraid'), true);
assert.equal(isCorrect('to be afraid', 'brave'), false);
