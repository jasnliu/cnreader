const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'custom-quiz-logic.js'), 'utf8'),
  context
);

const logic = context.window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;
assert.equal(
  typeof logic.buildQuestions,
  'function',
  'Custom Test logic must build questions for all selected formats'
);

const questions = logic.buildQuestions({
  selectedGlobalIndices: [4, 9],
  selectedTypes: ['typing', 'listening'],
  makeQuestion(globalIndex, type) {
    return { charIndex: globalIndex, type: type };
  },
});

assert.deepEqual(JSON.parse(JSON.stringify(questions)), [
  { charIndex: 4, type: 'typing' },
  { charIndex: 4, type: 'listening' },
  { charIndex: 9, type: 'typing' },
  { charIndex: 9, type: 'listening' },
]);

assert.deepEqual(
  JSON.parse(JSON.stringify(logic.buildQuestions({
    selectedGlobalIndices: [4],
    selectedTypes: [],
    makeQuestion() { throw new Error('No question should be built without a format'); },
  }))),
  []
);

console.log('Custom Test builds one listening question per selected item and format');
