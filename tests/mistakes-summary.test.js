const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class ElementFake {
  constructor() {
    this.style = {};
    this.textContent = '';
  }

  addEventListener() {}
}

class CanvasFake extends ElementFake {
  constructor() {
    super();
    this.context = {
      scale() {},
      fillRect() {},
      strokeRect() {},
      fillText() {},
      measureText(text) { return { width: String(text).length * 12 }; },
    };
  }

  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}

const elements = {
  missedPage: new ElementFake(),
  missedTitle: new ElementFake(),
  missedAccuracy: new ElementFake(),
  missedXp: new ElementFake(),
  missedCanvas: new CanvasFake(),
  okButton: new ElementFake(),
};
elements.missedTitle.textContent = 'Words Missed';

const storageValues = new Map([
  ['charProgress', '{"0":5}'],
]);
const storage = {
  get length() { return storageValues.size; },
  key(index) { return Array.from(storageValues.keys())[index] || null; },
  getItem(key) { return storageValues.has(String(key)) ? storageValues.get(String(key)) : null; },
  setItem(key, value) { storageValues.set(String(key), String(value)); },
  removeItem(key) { storageValues.delete(String(key)); },
};

const context = vm.createContext({
  window: {
    devicePixelRatio: 1,
    innerWidth: 1000,
    location: { href: '' },
    CHINESE_READER_UNIT_DATA: [{ characters: ['错'], pinyin: ['cuò'] }],
  },
  document: { getElementById(id) { return elements[id] || null; }, currentScript: null },
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  setTimeout,
  clearTimeout,
  console,
  Math,
  Map,
  Set,
  URLSearchParams,
  JSON,
  localStorage: storage,
});

const xpSystemPath = path.join(__dirname, '..', 'xp-system.js');
vm.runInContext(fs.readFileSync(xpSystemPath, 'utf8'), context, { filename: 'xp-system.js' });

const enginePath = path.join(__dirname, '..', 'quiz-engine.js');
const source = fs.readFileSync(enginePath, 'utf8')
  + '\nwindow.showMistakesForTest = showMissedWordsPage;'
  + '\nwindow.isAcceptedEnglishDefinitionForTest = isAcceptedEnglishDefinition;';
vm.runInContext(source, context, { filename: 'quiz-engine.js' });

assert.equal(
  context.window.isAcceptedEnglishDefinitionForTest('to be afraid', 'afraid'),
  true,
  'Definition answers may omit optional "to" and "be" words'
);
assert.equal(
  context.window.isAcceptedEnglishDefinitionForTest('to be afraid', 'to be afraid'),
  true,
  'Definition answers may still include optional "to" and "be" words'
);
assert.equal(
  context.window.isAcceptedEnglishDefinitionForTest('to be afraid', 'brave'),
  false,
  'Optional-word handling must not accept unrelated answers'
);

context.window.showMistakesForTest(
  [0],
  function () { return '错'; },
  function () { return 'cuò'; },
  function () { return 'wrong'; },
  function () { return []; },
  'index.html',
  7,
  8,
  10,
  true
);

assert.equal(elements.missedTitle.textContent, 'Mistakes');
assert.equal(elements.missedAccuracy.textContent, 'Accuracy 88%');
assert.equal(elements.missedXp.textContent, '10 XP');
assert.equal(elements.missedXp.style.display, 'block');
assert.equal(elements.missedCanvas.style.marginTop, '8px');
assert.equal(
  storage.getItem('cnReaderXpAnimationStart'),
  '0',
  'An XP-earning quiz must queue the previous total for the grid animation'
);

context.window.showMistakesForTest(
  [],
  function () { return ''; },
  function () { return ''; },
  function () { return ''; },
  function () { return []; },
  'index.html',
  10,
  10,
  20,
  true
);
assert.equal(elements.missedAccuracy.textContent, 'Accuracy 100%');
assert.equal(elements.missedXp.textContent, '20 XP');
assert.equal(elements.missedCanvas.style.display, 'none');
assert.equal(
  elements.missedTitle.style.display,
  'none',
  'Perfect quiz results must omit the Mistakes heading'
);

for (const page of ['quiz.html', 'phrase-quiz.html', 'review.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  assert.match(html, /id="missedTitle"[^>]*>Mistakes<\/div>/, page + ' must use the shared Mistakes heading');
  assert.match(html, /id="missedAccuracy"/, page + ' must include an accuracy line');
  assert.match(html, /id="missedTitle"[^>]*font-size: 40px/, page + ' must use the smaller heading font');
  assert.match(html, /id="missedAccuracy"[^>]*font-size: 22px/, page + ' must use a smaller accuracy font');
  assert.ok(
    html.indexOf('id="missedCanvas"') < html.indexOf('id="missedAccuracy"'),
    page + ' must show accuracy below the mistakes grid'
  );
  assert.match(html, /id="missedAccuracy"[^>]*margin-top: 24px/, page + ' must separate accuracy from the grid');
  assert.match(html, /id="missedXp"/, page + ' must show earned XP after regular and review quizzes');
}

const customQuizHtml = fs.readFileSync(path.join(__dirname, '..', 'custom-quiz.html'), 'utf8');
assert.doesNotMatch(customQuizHtml, /id="missedXp"/, 'Custom Tests must not show an XP result');
