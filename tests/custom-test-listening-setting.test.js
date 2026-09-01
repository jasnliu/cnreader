const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.join(__dirname, '..');
const logicPath = path.join(projectRoot, 'custom-quiz-logic.js');

assert.equal(
  fs.existsSync(logicPath),
  true,
  'Custom Test must expose executable format-setting behavior'
);

function createStorage(initialValues) {
  const values = new Map(Object.entries(initialValues || {}));
  return {
    get length() { return values.size; },
    key(index) { return Array.from(values.keys())[index] ?? null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
    clear() { values.clear(); },
  };
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(logicPath, 'utf8'), context);
const logic = context.window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;

const storage = createStorage({
  worksheetMC: 'false',
  worksheetWrite: 'true',
  worksheetDefinition: 'false',
});

assert.deepEqual(
  JSON.parse(JSON.stringify(logic.readFormatSettings(storage, 'worksheet'))),
  { mc: false, typing: true, definition: false, listening: true },
  'Listening defaults on while existing explicit settings are preserved'
);

logic.writeFormatSettings(storage, 'worksheet', {
  mc: true,
  typing: false,
  definition: true,
  listening: false,
});

assert.deepEqual(
  JSON.parse(JSON.stringify(logic.readFormatSettings(storage, 'worksheet'))),
  { mc: true, typing: false, definition: true, listening: false },
  'All four Word Custom Test settings round-trip through storage'
);

assert.deepEqual(
  JSON.parse(JSON.stringify(logic.readFormatSettings(storage, 'phraseCustomTest'))),
  { mc: true, typing: true, definition: true, listening: true },
  'Phrase defaults are independent from Word settings'
);

logic.writeFormatSettings(storage, 'phraseCustomTest', {
  mc: false,
  typing: true,
  definition: false,
  listening: true,
});

assert.equal(storage.getItem('worksheetListening'), 'false');
assert.equal(storage.getItem('phraseCustomTestListening'), 'true');

const backupStorage = createStorage({
  worksheetListening: 'false',
  phraseCustomTestListening: 'true',
});
const backupWindow = { location: { reload() {} } };
const backupContext = {
  window: backupWindow,
  localStorage: backupStorage,
  TextEncoder,
  TextDecoder,
  btoa,
  atob,
  setTimeout,
  console: { log() {}, info() {} },
};
vm.createContext(backupContext);
vm.runInContext(
  fs.readFileSync(path.join(projectRoot, 'progress-backup.js'), 'utf8'),
  backupContext
);
const progressCode = backupWindow.getCNReaderProgressCode();
backupStorage.clear();
backupWindow.restoreCNReaderProgress(progressCode, false);

assert.equal(
  backupStorage.getItem('worksheetListening'),
  'false',
  'Progress backup restores the Word Listening setting'
);
assert.equal(
  backupStorage.getItem('phraseCustomTestListening'),
  'true',
  'Progress backup restores the Phrase Listening setting'
);

console.log('Custom Test listening settings default, persist, and stay content-specific');
