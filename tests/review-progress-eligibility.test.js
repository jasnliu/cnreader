const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class EventTargetFake {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatchEvent(event) {
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) || []) listener(event);
  }
}

class ElementFake extends EventTargetFake {
  constructor(tagName) {
    super();
    this.tagName = String(tagName || 'div').toUpperCase();
    this.style = {};
    this.children = [];
    this.attributes = new Map();
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    this.checked = false;
    this.disabled = false;
    this.hidden = false;
    this.value = '';
    this.textContent = '';
    this.innerHTML = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() {}
  blur() {}
}

class CanvasContextFake {
  constructor() { this.visibleText = []; }
  save() {}
  restore() {}
  translate() {}
  setTransform() {}
  scale() {}
  fillRect() {}
  strokeRect() {}
  fillText(text) { this.visibleText.push(String(text)); }
  measureText(text) { return { width: String(text).length * 12 }; }
  createLinearGradient() { return { addColorStop() {} }; }
}

class CanvasFake extends ElementFake {
  constructor() {
    super('canvas');
    this.context = new CanvasContextFake();
  }
  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}

function createStorage(entries) {
  const values = new Map(entries);
  return {
    get length() { return values.size; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

function createReviewContext(options) {
  const elements = {
    reviewTypeControls: new ElementFake('div'),
    reviewTargetedMode: new ElementFake('input'),
    reviewModeText: new ElementFake('span'),
    reviewMultipleChoice: new ElementFake('input'),
    reviewWriting: new ElementFake('input'),
    reviewDefinition: new ElementFake('input'),
    reviewDefinitionOption: new ElementFake('label'),
    reviewQuestionCount: new ElementFake('input'),
    reviewCanvas: new CanvasFake(),
    reviewTypingInput: new ElementFake('input'),
    missedTitle: new ElementFake('div'),
  };
  elements.reviewMultipleChoice.checked = true;
  elements.reviewWriting.checked = true;
  elements.reviewDefinition.checked = true;
  elements.reviewQuestionCount.value = '1';

  const currentScript = new ElementFake('script');
  currentScript.setAttribute('data-quiz-mode', 'review');
  const documentFake = new EventTargetFake();
  documentFake.body = new ElementFake('body');
  documentFake.currentScript = currentScript;
  documentFake.title = '';
  documentFake.createElement = function (tagName) { return new ElementFake(tagName); };
  documentFake.getElementById = function (id) { return elements[id] || null; };

  const windowFake = new EventTargetFake();
  windowFake.window = windowFake;
  windowFake.innerWidth = 1000;
  windowFake.innerHeight = 800;
  windowFake.devicePixelRatio = 1;
  windowFake.location = {
    href: '',
    search: options.phraseMode ? '?content=phrases' : '?content=words',
  };
  windowFake.CHINESE_READER_UNIT_DATA = [{
    characters: ['甲', '乙', '丙', '丁'],
    pinyin: ['jiǎ', 'yǐ', 'bǐng', 'dīng'],
    quizPinyin: ['jiǎ', 'yǐ', 'bǐng', 'dīng'],
  }];
  windowFake.CHINESE_READER_PHRASE_UNITS = [{
    phrases: ['甲一', '乙二', '丙三', '丁四'],
    pinyin: ['jiǎ yī', 'yǐ èr', 'bǐng sān', 'dīng sì'],
    definitions: ['first phrase', 'second phrase', 'third phrase', 'fourth phrase'],
  }];
  windowFake.CHINESE_READER_CUSTOM_QUIZ_LOGIC = {
    configureDefinitionControl(phraseMode, option, checkbox) {
      option.hidden = !phraseMode;
      option.style.display = phraseMode ? '' : 'none';
      if (!phraseMode) checkbox.checked = false;
    },
    filterQuestionTypes(phraseMode, types) {
      return types.filter((type) => phraseMode || type !== 'definition');
    },
  };
  windowFake.CHINESE_READER_PHRASE_QUIZ_LOGIC = {
    normalizePinyinAnswer(value) { return String(value); },
    isDefinitionAnswerCorrect(expected, actual) { return expected === actual; },
  };

  const deterministicMath = Object.create(Math);
  deterministicMath.random = function () { return 0; };
  const context = vm.createContext({
    window: windowFake,
    document: documentFake,
    localStorage: createStorage(options.storageEntries),
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
    fs.readFileSync(path.join(__dirname, '..', 'quiz-engine.js'), 'utf8'),
    context,
    { filename: 'quiz-engine.js' }
  );
  return { context, elements };
}

function answerFirstMultipleChoiceCorrectly(elements) {
  elements.reviewCanvas.dispatchEvent({
    type: 'click',
    clientX: 700,
    clientY: 520,
    stopPropagation() {},
  });
}

{
  const { context, elements } = createReviewContext({
    phraseMode: true,
    storageEntries: [
      ['phraseProgress', '{"0":6}'],
      ['phraseKnowledge', '{"1":0}'],
      ['phraseReviewQuizMultipleChoice', 'true'],
      ['phraseReviewQuizWriting', 'false'],
      ['phraseReviewQuizDefinition', 'false'],
      ['phraseReviewQuizTargeted', 'true'],
    ],
  });

  assert.equal(
    elements.reviewQuestionCount.max,
    '1',
    'Phrase Review must exclude knowledge-only phrases whose green progress bar is empty'
  );
  assert.equal(context.window.location.href, '', 'Eligible phrase progress should keep Review open');
  assert.ok(
    elements.reviewCanvas.context.visibleText.includes('甲一'),
    'Targeted Phrase Review must ask about the phrase whose progress bar is complete'
  );
  assert.ok(
    !elements.reviewCanvas.context.visibleText.includes('乙二'),
    'Targeted Phrase Review must not ask about a knowledge-only phrase'
  );
}

{
  const { elements } = createReviewContext({
    phraseMode: true,
    storageEntries: [
      ['phraseProgress', '{"0":6}'],
      ['phraseKnowledge', '{"1":-1}'],
      ['phraseReviewQuizMultipleChoice', 'true'],
      ['phraseReviewQuizWriting', 'false'],
      ['phraseReviewQuizDefinition', 'false'],
      ['phraseReviewQuizTargeted', 'false'],
    ],
  });

  assert.equal(
    elements.reviewQuestionCount.max,
    '1',
    'Random Phrase Review must exclude knowledge-only phrases whose progress bars are empty'
  );
  assert.ok(
    elements.reviewCanvas.context.visibleText.includes('甲一'),
    'Random Phrase Review must draw only a phrase with complete progress'
  );
  assert.ok(
    !elements.reviewCanvas.context.visibleText.includes('乙二'),
    'Random Phrase Review must not draw a knowledge-only phrase'
  );
}

{
  const { elements } = createReviewContext({
    phraseMode: true,
    storageEntries: [
      ['phraseProgress', '{"0":6,"1":6}'],
      ['phraseKnowledge', '{"0":4,"1":-2}'],
      ['phraseReviewQuizMultipleChoice', 'true'],
      ['phraseReviewQuizWriting', 'false'],
      ['phraseReviewQuizDefinition', 'false'],
      ['phraseReviewQuizTargeted', 'true'],
      ['phraseReviewQuizQuestionCount', '1'],
    ],
  });

  assert.ok(
    elements.reviewCanvas.context.visibleText.includes('乙二'),
    'Targeted Phrase Review must retain phraseKnowledge ordering among eligible phrases'
  );
}

{
  const { context } = createReviewContext({
    phraseMode: false,
    storageEntries: [
      ['charProgress', '{"0":5}'],
      ['reviewQuizMultipleChoice', 'true'],
      ['reviewQuizWriting', 'false'],
      ['reviewQuizDefinition', 'false'],
    ],
  });

  assert.equal(
    context.window.location.href,
    'index.html',
    'Word Review must not start for a partially completed word'
  );
}

{
  const { context, elements } = createReviewContext({
    phraseMode: false,
    storageEntries: [
      ['charProgress', '{"0":6}'],
      ['reviewQuizMultipleChoice', 'true'],
      ['reviewQuizWriting', 'false'],
      ['reviewQuizDefinition', 'false'],
    ],
  });

  answerFirstMultipleChoiceCorrectly(elements);
  assert.equal(
    JSON.parse(context.localStorage.getItem('charProgress'))['0'],
    6,
    'A completed green progress bar must remain capped after a correct Review answer'
  );
}

{
  const { context } = createReviewContext({
    phraseMode: true,
    storageEntries: [
      ['phraseProgress', '{"0":5}'],
      ['phraseReviewQuizMultipleChoice', 'true'],
      ['phraseReviewQuizWriting', 'false'],
      ['phraseReviewQuizDefinition', 'false'],
    ],
  });

  assert.equal(
    context.window.location.href,
    'index.html?view=phrases',
    'Phrase Review must not start for a partially completed phrase'
  );
}

{
  const { elements } = createReviewContext({
    phraseMode: false,
    storageEntries: [
      ['charProgress', '{"0":6}'],
      ['charKnowledge', '{"1":-1}'],
      ['reviewQuizMultipleChoice', 'true'],
      ['reviewQuizWriting', 'false'],
      ['reviewQuizDefinition', 'false'],
      ['reviewQuizTargeted', 'true'],
    ],
  });

  assert.equal(elements.reviewQuestionCount.max, '1');
  assert.ok(
    elements.reviewCanvas.context.visibleText.includes('甲'),
    'Targeted Word Review must retain completed words'
  );
  assert.ok(
    !elements.reviewCanvas.context.visibleText.includes('乙'),
    'Targeted Word Review must exclude knowledge-only words without complete progress'
  );
}

console.log('Review eligibility and correct-answer progress updates are enforced');
