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
const allTypes = ['mc', 'typing', 'definition', 'listening'];

assert.deepEqual(
  JSON.parse(JSON.stringify(logic.filterQuestionTypes(false, allTypes))),
  ['mc', 'typing', 'listening'],
  'Single-character quizzes must reject definition questions even when an old setting requests them'
);
assert.deepEqual(
  JSON.parse(JSON.stringify(logic.filterQuestionTypes(true, allTypes))),
  allTypes,
  'Phrase quizzes must retain definition questions'
);

const wordDefinitionOption = { hidden: false, style: { display: 'flex' } };
const wordDefinitionCheckbox = { checked: true };
logic.configureDefinitionControl(false, wordDefinitionOption, wordDefinitionCheckbox);
assert.equal(wordDefinitionOption.hidden, true, 'Words UI must hide the Definition option');
assert.equal(
  wordDefinitionOption.style.display,
  'none',
  'Words UI must override layout CSS that would otherwise display the Definition option'
);
assert.equal(wordDefinitionCheckbox.checked, false, 'Words UI must clear stale Definition selections');

const phraseDefinitionOption = { hidden: true, style: { display: 'none' } };
const phraseDefinitionCheckbox = { checked: true };
logic.configureDefinitionControl(true, phraseDefinitionOption, phraseDefinitionCheckbox);
assert.equal(phraseDefinitionOption.hidden, false, 'Phrases UI must show the Definition option');
assert.equal(
  phraseDefinitionOption.style.display,
  '',
  'Phrases UI must restore the Definition option to its normal stylesheet layout'
);
assert.equal(phraseDefinitionCheckbox.checked, true, 'Phrases UI must preserve its Definition selection');

console.log('Definition questions and controls are limited to phrase quizzes');
