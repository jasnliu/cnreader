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

function parseExampleLine(line, unitNumber, entryNumber) {
  const match = line.match(/^(.+ \([^)]+\)), (.+ \([^)]+\))$/);
  assert.ok(
    match,
    'Word Unit ' + unitNumber + ', item ' + entryNumber + ' must contain exactly two formatted examples'
  );
  return [match[1], match[2]];
}

const sourceUnits = [];
for (let unitNumber = 1; unitNumber <= unitCount; unitNumber++) {
  const characters = readLines(sourcePath('Characters', 'characters', unitNumber));
  const exampleLines = readLines(sourcePath('Examples', 'examples', unitNumber));

  assert.equal(characters.length, itemsPerUnit, 'Word Unit ' + unitNumber + ' must contain 100 characters');
  assert.equal(exampleLines.length, itemsPerUnit, 'Word Unit ' + unitNumber + ' must contain 100 example lines');

  const examples = exampleLines.map(function (line, entryIndex) {
    const parsed = parseExampleLine(line, unitNumber, entryIndex + 1);
    parsed.forEach(function (example) {
      const exampleText = example.slice(0, example.lastIndexOf(' ('));
      assert.ok(
        exampleText.includes(characters[entryIndex]),
        'Word Unit ' + unitNumber + ', item ' + (entryIndex + 1)
          + ' example "' + exampleText + '" must contain ' + characters[entryIndex]
      );
    });
    return parsed;
  });

  sourceUnits.push({ characters: characters, examples: examples });
}

const runtimeContext = { window: {} };
vm.createContext(runtimeContext);
vm.runInContext(fs.readFileSync(path.join(projectRoot, 'unit-data.js'), 'utf8'), runtimeContext);
const runtimeUnits = JSON.parse(JSON.stringify(runtimeContext.window.CHINESE_READER_UNIT_DATA));

assert.equal(runtimeUnits.length, unitCount, 'Runtime data must contain all ten word units');
sourceUnits.forEach(function (sourceUnit, unitIndex) {
  assert.deepEqual(
    runtimeUnits[unitIndex].characters,
    sourceUnit.characters,
    'Word Unit ' + (unitIndex + 1) + ' runtime characters must match the source file'
  );
  assert.deepEqual(
    runtimeUnits[unitIndex].examples,
    sourceUnit.examples,
    'Word Unit ' + (unitIndex + 1) + ' runtime examples must match the source file'
  );
});

console.log('all ten word units have aligned examples containing their target characters');
