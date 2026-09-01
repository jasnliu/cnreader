const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class EventTargetFake {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this.listeners.has(type)) this.listeners.get(type).delete(listener);
  }

  dispatch(type, event) {
    const value = event || {};
    value.type = type;
    value.target = value.target || this;
    value.repeat = Boolean(value.repeat);
    value.defaultPrevented = false;
    value.propagationStopped = false;
    value.preventDefault = value.preventDefault || function () { value.defaultPrevented = true; };
    value.stopPropagation = value.stopPropagation || function () { value.propagationStopped = true; };
    Array.from(this.listeners.get(type) || []).forEach(function (listener) {
      listener(value);
    });
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
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.classList = {
      add() {}, remove() {}, toggle() {}, contains() { return false; },
    };
  }

  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() { this.focused = true; }
  blur() { this.focused = false; }
}

class CanvasContextFake {
  constructor() {
    this.visibleText = [];
    this.textDraws = [];
  }

  save() {}
  restore() {}
  translate() {}
  setTransform() {}
  scale() {}
  fillRect() {}
  strokeRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  roundRect() {}
  fill() {}
  clearRect() {}
  fillText(text, x, y) {
    this.visibleText.push(String(text));
    this.textDraws.push({
      text: String(text),
      x: x,
      y: y,
      font: this.font,
      fillStyle: this.fillStyle,
    });
  }
  measureText(text) { return { width: String(text).length * 12 }; }
  createLinearGradient() { return { addColorStop() {} }; }
}

class CanvasFake extends ElementFake {
  constructor(context) {
    super('canvas');
    this.context = context;
    this.width = 0;
    this.height = 0;
  }

  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}

class AudioFake extends EventTargetFake {
  static instances = [];

  constructor() {
    super();
    this.src = '';
    this.preload = '';
    this.paused = true;
    this.currentTime = 0;
    this.playCalls = 0;
    AudioFake.instances.push(this);
  }

  load() {}
  play() { this.playCalls++; this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}

function createStorage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

const canvasContext = new CanvasContextFake();
const canvas = new CanvasFake(canvasContext);
const typingInput = new ElementFake('input');
typingInput.style.display = 'none';
const body = new ElementFake('body');
const documentFake = new EventTargetFake();
documentFake.body = body;
documentFake.currentScript = null;
documentFake.createElement = function (tagName) { return new ElementFake(tagName); };
documentFake.getElementById = function (id) {
  if (id === 'quizCanvas') return canvas;
  if (id === 'quizTypingInput') return typingInput;
  return null;
};

const windowFake = new EventTargetFake();
windowFake.window = windowFake;
windowFake.innerWidth = 1000;
windowFake.innerHeight = 800;
windowFake.devicePixelRatio = 1;
windowFake.location = { href: '' };
windowFake.Audio = AudioFake;
windowFake.CHINESE_READER_UNIT_DATA = [{
  characters: ['确'],
  pinyin: ['què'],
  quizPinyin: ['què'],
  definitions: ['certain'],
  examples: [['确定 (què dìng)', '确认 (què rèn)']],
}];

const context = {
  window: windowFake,
  document: documentFake,
  localStorage: createStorage(),
  Audio: AudioFake,
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  setTimeout,
  clearTimeout,
  console,
  URLSearchParams,
  Math,
  Map,
  Set,
};
vm.createContext(context);

const projectRoot = path.join(__dirname, '..');
vm.runInContext(fs.readFileSync(path.join(projectRoot, 'listening-audio.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(projectRoot, 'quiz-engine.js'), 'utf8'), context);

assert.equal(
  typeof windowFake.CHINESE_READER_QUIZ_TEST_API?.createQuizRunner,
  'function',
  'Quiz engine must expose its real runner for behavior verification'
);

let finishedResult = null;
let knowledgeAdjustments = 0;
windowFake.CHINESE_READER_QUIZ_TEST_API.createQuizRunner({
  canvasId: 'quizCanvas',
  inputId: 'quizTypingInput',
  questions: [{
    type: 'listening',
    charIndex: 0,
    trackIndex: 0,
    char: '确',
    pinyin: 'què',
    definition: 'certain',
    audioUrl: 'audio/words/0000.mp3',
  }],
  getQuestionDetails() {
    return { char: '确', pinyin: 'què', definition: 'certain', examples: [] };
  },
  adjustQuestionKnowledge() { knowledgeAdjustments++; },
  onFinish(result) { finishedResult = result; },
});

assert.equal(typingInput.style.display, 'none', 'Listening never shows the typing input');
assert.ok(canvasContext.visibleText.includes('Click to reveal'));
const pinyinDraw = canvasContext.textDraws.find(function (draw) {
  return draw.text === 'què';
});
assert.deepEqual(pinyinDraw, {
  text: 'què',
  x: 0,
  y: 85,
  font: '22px "Times New Roman", serif',
  fillStyle: 'black',
});
assert.equal(AudioFake.instances.length, 1);
assert.equal(AudioFake.instances[0].src, 'audio/words/0000.mp3');
assert.equal(AudioFake.instances[0].paused, false, 'Listening attempts playback on entry');
assert.equal(AudioFake.instances[0].playCalls, 1);

const listeningNumberKey = documentFake.dispatch('keydown', { key: '1', repeat: false });
assert.equal(finishedResult, null, 'Number keys must not answer or advance a listening question');
assert.equal(knowledgeAdjustments, 0, 'Number keys on listening questions must not change knowledge');
assert.equal(listeningNumberKey.defaultPrevented, false);

AudioFake.instances[0].dispatch('ended');
const replayClick = canvas.dispatch('click', { clientX: 500, clientY: 550 });
if (!replayClick.propagationStopped) documentFake.dispatch('click', replayClick);
assert.equal(AudioFake.instances[0].playCalls, 2, 'Play Sound replays after the first clip ends');
assert.equal(finishedResult, null, 'Play Sound never advances the question');

canvasContext.visibleText.length = 0;
const revealClick = canvas.dispatch('click', { clientX: 500, clientY: 300 });
if (!revealClick.propagationStopped) documentFake.dispatch('click', revealClick);

assert.ok(canvasContext.visibleText.includes('确'), 'Square displays the answer after reveal');
assert.ok(!canvasContext.visibleText.includes('Click to reveal'));
assert.equal(finishedResult, null, 'The reveal click does not also advance');

const bodyChildrenBeforeDetails = body.children.length;
const detailsClick = canvas.dispatch('click', { clientX: 500, clientY: 300 });
if (!detailsClick.propagationStopped) documentFake.dispatch('click', detailsClick);
assert.equal(body.children.length, bodyChildrenBeforeDetails + 1, 'Revealed square opens details');
const detailsOverlay = body.children[body.children.length - 1];
assert.equal(detailsOverlay.style.display, 'flex');
documentFake.dispatch('keydown', { key: 'a', repeat: false });
assert.equal(finishedResult, null, 'Keys do not advance while details are open');
detailsOverlay.style.display = 'none';

documentFake.dispatch('keydown', { key: 'a', repeat: true });
assert.equal(finishedResult, null, 'Repeating key events do not advance');

documentFake.dispatch('keydown', { key: 'a', repeat: false });
assert.ok(finishedResult, 'Any non-repeating key advances after reveal');
assert.deepEqual(JSON.parse(JSON.stringify(finishedResult.correctItems)), []);
assert.deepEqual(JSON.parse(JSON.stringify(finishedResult.missedItems)), []);
assert.equal(finishedResult.answeredCount, 0);
assert.equal(knowledgeAdjustments, 0, 'Listening never changes targeted knowledge');
assert.equal(AudioFake.instances[0].paused, true, 'Finishing cleans up active audio');

let outsideClickResult = null;
windowFake.CHINESE_READER_QUIZ_TEST_API.createQuizRunner({
  canvasId: 'quizCanvas',
  inputId: 'quizTypingInput',
  questions: [{
    type: 'listening',
    charIndex: 0,
    trackIndex: 0,
    char: '确',
    pinyin: 'què',
    definition: 'certain',
    audioUrl: 'audio/words/0000.mp3',
  }],
  onFinish(result) { outsideClickResult = result; },
});
const secondRevealClick = canvas.dispatch('click', { clientX: 500, clientY: 300 });
assert.equal(secondRevealClick.propagationStopped, true);
assert.equal(outsideClickResult, null);
documentFake.dispatch('click', { target: documentFake });
assert.ok(outsideClickResult, 'A click outside the revealed square advances');
assert.equal(outsideClickResult.answeredCount, 0);

console.log('Listening runner autoplays, replays, reveals details, advances by key/click, and remains unscored');
