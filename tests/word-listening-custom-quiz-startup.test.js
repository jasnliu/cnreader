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
}

class ElementFake extends EventTargetFake {
  constructor(tagName) {
    super();
    this.tagName = String(tagName || 'div').toUpperCase();
    this.style = {};
    this.children = [];
    this.attributes = new Map();
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
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
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  roundRect() {}
  fill() {}
  clearRect() {}
  fillText(text) { this.visibleText.push(String(text)); }
  measureText(text) { return { width: String(text).length * 12 }; }
  createLinearGradient() { return { addColorStop() {} }; }
}

class CanvasFake extends ElementFake {
  constructor(context) { super('canvas'); this.context = context; }
  getContext() { return this.context; }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}

class AudioFake extends EventTargetFake {
  static instances = [];
  constructor() {
    super();
    this.src = '';
    this.currentTime = 0;
    this.paused = true;
    AudioFake.instances.push(this);
  }
  load() {}
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
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

const canvasContext = new CanvasContextFake();
const canvas = new CanvasFake(canvasContext);
const typingInput = new ElementFake('input');
typingInput.style.display = 'none';
const currentScript = new ElementFake('script');
currentScript.setAttribute('data-quiz-mode', 'custom');
const documentFake = new EventTargetFake();
documentFake.body = new ElementFake('body');
documentFake.currentScript = currentScript;
documentFake.title = '';
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
windowFake.location = { href: '', search: '?content=words' };
windowFake.Audio = AudioFake;

const context = vm.createContext({
  window: windowFake,
  document: documentFake,
  localStorage: createStorage([
    ['worksheetGlobalChars', '[0]'],
    ['worksheetMC', 'false'],
    ['worksheetWrite', 'false'],
    ['worksheetDefinition', 'false'],
    ['worksheetListening', 'true'],
  ]),
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
});

const projectRoot = path.resolve(__dirname, '..');
[
  'unit-data.js',
  'phrase-data.js',
  'phrase-quiz-logic.js',
  'word-details.js',
  'custom-quiz-logic.js',
  'listening-audio.js',
  'listening-audio-manifest.js',
  'quiz-engine.js',
].forEach(function (filename) {
  vm.runInContext(
    fs.readFileSync(path.join(projectRoot, filename), 'utf8'),
    context,
    { filename: filename }
  );
});

assert.ok(canvasContext.visibleText.includes('Click to reveal'));
assert.equal(AudioFake.instances.length, 1);
assert.equal(AudioFake.instances[0].src, 'audio/words/0000.mp3');
assert.equal(AudioFake.instances[0].paused, false);

console.log('Words listening-only Custom Test starts and draws its first question');
