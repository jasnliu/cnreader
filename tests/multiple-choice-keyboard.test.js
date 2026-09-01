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

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type, event) {
    const value = Object.assign({
      key: '',
      repeat: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      defaultPrevented: false,
      propagationStopped: false,
    }, event || {});
    value.type = type;
    value.target = value.target || this;
    value.preventDefault = value.preventDefault || function () { value.defaultPrevented = true; };
    value.stopPropagation = value.stopPropagation || function () { value.propagationStopped = true; };
    for (const listener of this.listeners.get(type) || []) listener(value);
    return value;
  }
}

class ElementFake extends EventTargetFake {
  constructor(tagName) {
    super();
    this.tagName = String(tagName || 'div').toUpperCase();
    this.style = {};
    this.children = [];
    this.attributes = new Map();
    this.value = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }

  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() { this.focused = true; }
  blur() { this.focused = false; }
}

class CanvasContextFake {
  constructor() { this.fillRects = []; }
  save() {}
  restore() {}
  translate() {}
  setTransform() {}
  scale() {}
  fillRect(x, y, width, height) {
    this.fillRects.push({ x, y, width, height, fillStyle: this.fillStyle });
  }
  strokeRect() {}
  fillText() {}
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

function createStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

function createHarness(question) {
  const canvas = new CanvasFake();
  const typingInput = new ElementFake('input');
  typingInput.style.display = 'none';
  const documentFake = new EventTargetFake();
  documentFake.body = new ElementFake('body');
  documentFake.currentScript = null;
  documentFake.createElement = function (tagName) { return new ElementFake(tagName); };
  documentFake.getElementById = function (id) {
    if (id === 'quizCanvas') return canvas;
    if (id === 'typingInput') return typingInput;
    return null;
  };

  const windowFake = new EventTargetFake();
  windowFake.window = windowFake;
  windowFake.innerWidth = 1000;
  windowFake.innerHeight = 800;
  windowFake.devicePixelRatio = 1;
  windowFake.location = { href: '', search: '' };
  windowFake.CHINESE_READER_UNIT_DATA = [{
    characters: ['甲'],
    pinyin: ['jiǎ'],
    quizPinyin: ['jiǎ'],
  }];

  let nextAnimationFrameId = 1;
  const animationFrames = new Map();
  const context = vm.createContext({
    window: windowFake,
    document: documentFake,
    localStorage: createStorage(),
    requestAnimationFrame(callback) {
      const id = nextAnimationFrameId++;
      animationFrames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) { animationFrames.delete(id); },
    setTimeout,
    clearTimeout,
    console,
    URLSearchParams,
    Math,
    Map,
    Set,
  });
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'quiz-engine.js'), 'utf8'),
    context,
    { filename: 'quiz-engine.js' }
  );

  let finishedResult = null;
  const knowledgeChanges = [];
  windowFake.CHINESE_READER_QUIZ_TEST_API.createQuizRunner({
    canvasId: 'quizCanvas',
    inputId: 'typingInput',
    questions: [question],
    adjustQuestionKnowledge(currentQuestion, change) {
      knowledgeChanges.push({ currentQuestion, change });
    },
    onFinish(result) { finishedResult = result; },
  });

  return {
    canvas,
    document: documentFake,
    typingInput,
    knowledgeChanges,
    runNextAnimationFrame() {
      const entry = animationFrames.entries().next().value;
      if (!entry) return false;
      animationFrames.delete(entry[0]);
      entry[1](0);
      return true;
    },
    getFinishedResult() { return finishedResult; },
  };
}

function makeMultipleChoiceQuestion(correctAnswerIndex) {
  return {
    type: 'mc',
    charIndex: 0,
    trackIndex: 0,
    char: '甲',
    pinyin: 'jiǎ',
    answers: ['top', 'upper middle', 'lower middle', 'bottom'],
    correctAnswerIndex,
  };
}

for (let answerIndex = 0; answerIndex < 4; answerIndex++) {
  const harness = createHarness(makeMultipleChoiceQuestion(answerIndex));
  const selectionEvent = harness.document.dispatch('keydown', {
    key: String(answerIndex + 1),
  });

  assert.equal(
    harness.getFinishedResult(),
    null,
    'Selecting button ' + (answerIndex + 1) + ' must show feedback before advancing'
  );
  assert.equal(selectionEvent.defaultPrevented, true);
  assert.equal(selectionEvent.propagationStopped, true);
  assert.equal(harness.knowledgeChanges.length, 1);
  assert.equal(harness.knowledgeChanges[0].change, 1);

  harness.document.dispatch('keydown', { key: 'x' });
  const result = harness.getFinishedResult();
  assert.deepEqual(JSON.parse(JSON.stringify(result.correctItems)), [0]);
  assert.deepEqual(JSON.parse(JSON.stringify(result.missedItems)), []);
}

{
  const harness = createHarness(makeMultipleChoiceQuestion(3));
  harness.document.dispatch('keydown', { key: '1' });
  harness.document.dispatch('keydown', { key: 'x' });
  const result = harness.getFinishedResult();

  assert.deepEqual(
    JSON.parse(JSON.stringify(result.correctItems)),
    [],
    'A number key must not mark the selected button correct when its answer is wrong'
  );
  assert.deepEqual(JSON.parse(JSON.stringify(result.missedItems)), [0]);
  assert.equal(harness.knowledgeChanges[0].change, -1);
}

{
  const harness = createHarness(makeMultipleChoiceQuestion(3));
  harness.canvas.dispatch('mousemove', { clientX: 700, clientY: 280 });
  assert.equal(harness.runNextAnimationFrame(), true, 'Hovering must start its width animation');
  harness.canvas.context.fillRects.length = 0;

  harness.document.dispatch('keydown', { key: '2' });
  const feedbackButtons = harness.canvas.context.fillRects
    .filter((rect) => rect.height === 55)
    .slice(-4);

  assert.deepEqual(
    feedbackButtons.map((rect) => rect.width),
    [300, 360, 300, 300],
    'Keyboard feedback must clear stale hover width and enlarge only the selected button'
  );
  assert.deepEqual(
    feedbackButtons.map((rect) => rect.fillStyle),
    ['black', '#F44336', 'black', '#4CAF50'],
    'A wrong keyboard choice must retain the normal wrong/correct feedback colors'
  );
}

for (const blockedEvent of [
  { key: '1', repeat: true },
  { key: '1', altKey: true },
  { key: '1', ctrlKey: true },
  { key: '1', metaKey: true },
]) {
  const harness = createHarness(makeMultipleChoiceQuestion(0));
  const event = harness.document.dispatch('keydown', blockedEvent);

  assert.equal(harness.getFinishedResult(), null);
  assert.equal(harness.knowledgeChanges.length, 0);
  assert.equal(event.defaultPrevented, false);
}

for (const questionType of ['typing', 'definition']) {
  const harness = createHarness({
    type: questionType,
    charIndex: 0,
    trackIndex: 0,
    char: '甲',
    pinyin: 'jiǎ',
    definition: 'first',
  });
  const event = harness.document.dispatch('keydown', { key: '1' });

  assert.equal(harness.getFinishedResult(), null);
  assert.equal(harness.knowledgeChanges.length, 0);
  assert.equal(event.defaultPrevented, false, 'Document handling must leave typing tone keys alone');
  assert.equal(harness.typingInput.style.display, 'block');
}

console.log('Number keys select multiple-choice buttons from top to bottom');
