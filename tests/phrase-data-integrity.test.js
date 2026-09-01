const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.join(__dirname, '..');
const unitCount = 10;
const itemsPerUnit = 100;

function sourcePath(folder, baseName, unitNumber) {
  const suffix = unitNumber === 1 ? '' : String(unitNumber);
  return path.join(projectRoot, folder, baseName + suffix + '.txt');
}

function readLines(filePath) {
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map(function (line) { return line.trim(); })
    .filter(Boolean);
}

const sourceUnits = [];
for (let unitNumber = 1; unitNumber <= unitCount; unitNumber++) {
  const phrasePath = sourcePath('Phrases', 'phrases', unitNumber);
  const pinyinPath = sourcePath('PPinyin', 'pinyin', unitNumber);
  const definitionPath = sourcePath('PDefinitions', 'pdefinitions', unitNumber);

  assert.equal(
    fs.existsSync(definitionPath),
    true,
    'Phrase Unit ' + unitNumber + ' must have an aligned definition file'
  );

  const unit = {
    phrases: readLines(phrasePath),
    pinyin: readLines(pinyinPath),
    definitions: readLines(definitionPath),
  };
  Object.entries(unit).forEach(function ([field, entries]) {
    assert.equal(
      entries.length,
      itemsPerUnit,
      'Phrase Unit ' + unitNumber + ' must contain 100 ' + field
    );
  });
  sourceUnits.push(unit);
}

const allPhrases = sourceUnits.flatMap(function (unit) { return unit.phrases; });
assert.equal(new Set(allPhrases).size, allPhrases.length, 'Phrases must be unique across all units');

const jinliIndex = allPhrases.indexOf('尽力');
assert.notEqual(jinliIndex, -1, '尽力 must be present in the phrase curriculum');
assert.equal(
  sourceUnits[Math.floor(jinliIndex / itemsPerUnit)].pinyin[jinliIndex % itemsPerUnit],
  'jìn lì',
  '尽力 must use the correct jìn lì pronunciation'
);

sourceUnits.forEach(function (unit, unitIndex) {
  unit.pinyin.forEach(function (pinyin, entryIndex) {
    assert.equal(pinyin, pinyin.normalize('NFC'), 'Pinyin must be NFC-normalized');
    assert.doesNotMatch(pinyin, /[A-Z0-9]/, 'Pinyin must use lowercase accented syllables');
    assert.ok(unit.definitions[entryIndex], 'Every phrase must have a definition');
    assert.equal(
      unit.definitions[entryIndex],
      unit.definitions[entryIndex].replace(/\s*;\s*/g, '; '),
      'Multiple meanings must use consistent semicolon separators'
    );
  });
});

const runtimeContext = { window: {} };
vm.createContext(runtimeContext);
vm.runInContext(
  fs.readFileSync(path.join(projectRoot, 'phrase-data.js'), 'utf8'),
  runtimeContext
);
assert.deepEqual(
  JSON.parse(JSON.stringify(runtimeContext.window.CHINESE_READER_PHRASE_UNITS)),
  sourceUnits,
  'Compiled phrase-data.js must exactly match all aligned phrase sources'
);

const fallbackDefinitions = new Map();
sourceUnits.forEach(function (unit) {
  unit.phrases.forEach(function (phrase, index) {
    fallbackDefinitions.set(phrase, unit.definitions[index]);
  });
});
assert.equal(fallbackDefinitions.get('想想'), 'to think about; to consider');
assert.equal(fallbackDefinitions.get('第三'), 'third; number three');
assert.equal(fallbackDefinitions.get('某个'), 'a certain one; a particular one');
assert.equal(fallbackDefinitions.get('听听'), 'to listen; to have a listen');
assert.equal(fallbackDefinitions.get('手上'), "in one's hand; in one's possession");

console.log('all ten phrase units are aligned with their compiled runtime data');
