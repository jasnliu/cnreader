const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

const storage = createStorage([
  ['charProgress', '{"0":6,"1":2}'],
  ['charProgress_1', '{"0":1}'],
  ['phraseProgress', '{"0":3}'],
  ['phraseProgress_1', '{"0":6}'],
]);
const windowFake = {};
const context = vm.createContext({ window: windowFake, localStorage: storage, Math, JSON });
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '..', 'xp-system.js'), 'utf8'),
  context,
  { filename: 'xp-system.js' }
);

const xp = windowFake.CHINESE_READER_XP;
assert.equal(xp.getProgressXp(storage), 36, 'Word and Phrase progress must contribute to one XP total');
assert.equal(xp.getTotalXp(storage), 36);

assert.equal(xp.awardCompletedAnswerXp(storage, 5), 0, 'Incomplete items earn their XP through progress');
assert.equal(xp.awardCompletedAnswerXp(storage, 6), 1, 'Correct completed items earn one bonus XP');
assert.equal(storage.getItem('cnReaderCompletedAnswerXp'), '1');
assert.equal(xp.getTotalXp(storage), 37);

const smallGainDuration = xp.getXpAnimationDuration(0, 3);
assert.ok(smallGainDuration >= 600 && smallGainDuration <= 2000);
assert.deepEqual(
  [0, 1, 2, 3].map(function (expectedValue) {
    return xp.getXpAnimationValue(0, 3, smallGainDuration * expectedValue / 3, smallGainDuration);
  }),
  [0, 1, 2, 3],
  'Small XP gains must count upward one whole point at a time'
);

const largeGainDuration = xp.getXpAnimationDuration(0, 1000);
assert.equal(largeGainDuration, 2000, 'Large XP gains must be capped at 2 seconds');
const largeGainMidpoint = xp.getXpAnimationValue(0, 1000, largeGainDuration / 2, largeGainDuration);
assert.equal(Number.isInteger(largeGainMidpoint), true, 'Animated XP must always be a whole number');
assert.equal(xp.getXpAnimationValue(0, 1000, largeGainDuration, largeGainDuration), 1000);

assert.equal(xp.queueXpAnimation(storage, 37, 40), true);
assert.equal(xp.takeXpAnimationStart(storage, 40), 37);
assert.equal(storage.getItem(xp.XP_ANIMATION_START_KEY), null, 'Animation handoff is consumed once');
assert.equal(xp.takeXpAnimationStart(storage, 40), null, 'A missing handoff must not animate from zero');
assert.equal(xp.queueXpAnimation(storage, 40, 40), false, 'No animation is queued when XP did not increase');
