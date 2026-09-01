const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const projectRoot = path.join(__dirname, '..');
const manifestPath = path.join(projectRoot, 'listening-audio-manifest.js');
assert.equal(
  fs.existsSync(manifestPath),
  true,
  'The complete local listening manifest must be generated'
);

const context = { window: {} };
vm.createContext(context);
for (const fileName of ['unit-data.js', 'phrase-data.js', 'listening-audio-manifest.js']) {
  vm.runInContext(fs.readFileSync(path.join(projectRoot, fileName), 'utf8'), context);
}

const manifest = context.window.CHINESE_READER_LISTENING_AUDIO;
const wordUnits = context.window.CHINESE_READER_UNIT_DATA;
const phraseUnits = context.window.CHINESE_READER_PHRASE_UNITS;
const expectedWords = wordUnits.flatMap(function (unit) {
  return unit.characters.map(function (text, index) {
    return { text: text, pinyin: (unit.quizPinyin || unit.pinyin)[index] };
  });
});
const expectedPhrases = phraseUnits.flatMap(function (unit) {
  return unit.phrases.map(function (text, index) {
    return { text: text, pinyin: unit.pinyin[index] };
  });
});

assert.equal(manifest.voice, 'zh-CN-XiaoxiaoNeural');
assert.equal(manifest.rate, '+0%');
assert.equal(manifest.volume, '+0%');
assert.equal(manifest.pitch, '+0Hz');
assert.equal(manifest.words.length, 1000);
assert.equal(manifest.phrases.length, 1000);

const allPaths = [];
for (const [kind, expected] of [['words', expectedWords], ['phrases', expectedPhrases]]) {
  manifest[kind].forEach(function (entry, index) {
    assert.equal(entry.text, expected[index].text, kind + ' text must match runtime data');
    assert.equal(entry.pinyin, expected[index].pinyin, kind + ' pinyin must match runtime data');
    assert.equal(entry.path, 'audio/' + kind + '/' + String(index).padStart(4, '0') + '.mp3');
    assert.match(entry.signature, /^[a-f0-9]{64}$/);
    const absolutePath = path.join(projectRoot, entry.path);
    assert.equal(fs.existsSync(absolutePath), true, 'Missing listening asset ' + entry.path);
    assert.ok(fs.statSync(absolutePath).size > 500, 'Listening asset is empty ' + entry.path);
    allPaths.push(absolutePath);
  });
}

assert.equal(new Set(allPaths).size, 2000, 'Every curriculum item has its own asset path');

const probeIndexes = [0, 499, 999, 1000, 1499, 1999];
probeIndexes.forEach(function (index) {
  const probe = spawnSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_name:format=duration',
    '-of', 'json',
    allPaths[index],
  ], { encoding: 'utf8' });
  assert.equal(probe.status, 0, probe.stderr || 'ffprobe failed for ' + allPaths[index]);
  const data = JSON.parse(probe.stdout);
  assert.equal(data.streams[0].codec_name, 'mp3');
  assert.ok(Number(data.format.duration) > 0);
});

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'cnreader-audio-check-'));
const concatPath = path.join(temporaryDirectory, 'assets.txt');
fs.writeFileSync(
  concatPath,
  allPaths.map(function (filePath) {
    return "file '" + filePath.replaceAll("'", "'\\''") + "'";
  }).join('\n') + '\n',
  'utf8'
);
const decode = spawnSync('ffmpeg', [
  '-v', 'error',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatPath,
  '-f', 'null',
  '-',
], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
fs.rmSync(temporaryDirectory, { recursive: true, force: true });
assert.equal(decode.status, 0, decode.stderr || 'At least one listening MP3 could not be decoded');

console.log('2,000 local listening assets align with runtime data and decode as MP3');
