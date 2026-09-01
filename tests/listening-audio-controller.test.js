const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const modulePath = path.join(__dirname, '..', 'listening-audio.js');
assert.equal(
  fs.existsSync(modulePath),
  true,
  'Listening must expose a reusable local-audio controller'
);

class FakeAudio {
  static instances = [];

  constructor() {
    this.src = '';
    this.preload = '';
    this.currentTime = 0;
    this.paused = true;
    this.listeners = new Map();
    this.nextPlayError = null;
    FakeAudio.instances.push(this);
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this.listeners.has(type)) this.listeners.get(type).delete(listener);
  }

  play() {
    if (this.nextPlayError) {
      const error = this.nextPlayError;
      this.nextPlayError = null;
      return Promise.reject(error);
    }
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {}

  dispatch(type) {
    Array.from(this.listeners.get(type) || []).forEach(function (listener) {
      listener();
    });
  }

  finish() {
    this.paused = true;
    this.dispatch('ended');
  }
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(modulePath, 'utf8'), context);
const listening = context.window.CHINESE_READER_LISTENING;

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

(async function run() {
  const controller = listening.createAudioController({ AudioCtor: FakeAudio });
  controller.setSource('audio/words/0000.mp3');
  const firstAudio = FakeAudio.instances.at(-1);

  assert.equal(firstAudio.src, 'audio/words/0000.mp3');
  assert.equal(firstAudio.preload, 'auto');
  assert.equal(await controller.play(), true);
  assert.equal(controller.isBusy(), true);
  assert.equal(firstAudio.paused, false);
  assert.equal(await controller.play(), false, 'A replay is ignored while audio is active');

  firstAudio.finish();
  assert.equal(controller.isBusy(), false);
  assert.equal(await controller.play(), true, 'Replay is allowed after ended');

  controller.setSource('audio/words/0001.mp3');
  const secondAudio = FakeAudio.instances.at(-1);
  assert.equal(firstAudio.paused, true, 'Changing question stops the previous clip');
  assert.equal(firstAudio.currentTime, 0);
  assert.equal(secondAudio.src, 'audio/words/0001.mp3');

  secondAudio.nextPlayError = new Error('autoplay blocked');
  assert.equal(await controller.play(), true, 'A blocked attempt still starts the play workflow');
  await flushPromises();
  assert.equal(controller.isBusy(), false, 'Rejected autoplay releases the playback lock');
  assert.equal(controller.hasError(), false, 'Autoplay rejection permits manual retry');
  assert.equal(await controller.play(), true, 'Manual retry works after autoplay rejection');

  secondAudio.dispatch('error');
  assert.equal(controller.isBusy(), false);
  assert.equal(controller.hasError(), true, 'Media loading errors mark sound unavailable');

  const session = listening.createQuestionSession({
    controller: controller,
    audioUrl: 'audio/phrases/0000.mp3',
  });
  assert.equal(session.isRevealed(), false);
  assert.equal(session.canAdvance(), false);
  assert.equal(session.reveal(), true);
  assert.equal(session.isRevealed(), true);
  assert.equal(session.canAdvance(), true);

  const sessionAudio = FakeAudio.instances.at(-1);
  session.destroy();
  assert.equal(sessionAudio.paused, true);
  assert.equal(sessionAudio.currentTime, 0);

  console.log('Listening audio locks replay, recovers from autoplay rejection, and reveals without scoring');
})().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
