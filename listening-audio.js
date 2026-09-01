(function (global) {
  'use strict';

  function createAudioController(options) {
    const AudioCtor = options && options.AudioCtor
      ? options.AudioCtor
      : global.Audio;
    const onStateChange = options && typeof options.onStateChange === 'function'
      ? options.onStateChange
      : function () {};
    let audio = null;
    let busy = false;
    let mediaError = false;
    let destroyed = false;

    function notify() {
      onStateChange({ busy: busy, error: mediaError });
    }

    function handleEnded() {
      busy = false;
      notify();
    }

    function handleError() {
      busy = false;
      mediaError = true;
      notify();
    }

    function cleanupCurrent() {
      if (!audio) return;
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.currentTime = 0;
      audio = null;
      busy = false;
    }

    function setSource(url) {
      cleanupCurrent();
      destroyed = false;
      mediaError = false;
      audio = new AudioCtor();
      audio.preload = 'auto';
      audio.src = url;
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      if (typeof audio.load === 'function') audio.load();
      notify();
    }

    function play() {
      if (!audio || busy || mediaError || destroyed) {
        return Promise.resolve(false);
      }

      busy = true;
      notify();
      let playResult;
      try {
        playResult = audio.play();
      } catch (error) {
        busy = false;
        notify();
        return Promise.resolve(false);
      }

      Promise.resolve(playResult).catch(function () {
        busy = false;
        notify();
      });
      return Promise.resolve(true);
    }

    function destroy() {
      destroyed = true;
      cleanupCurrent();
      notify();
    }

    return {
      setSource: setSource,
      play: play,
      isBusy: function () { return busy; },
      hasError: function () { return mediaError; },
      destroy: destroy,
    };
  }

  function createQuestionSession(options) {
    const controller = options.controller;
    let revealed = false;
    controller.setSource(options.audioUrl);

    return {
      reveal: function () {
        revealed = true;
        return true;
      },
      isRevealed: function () { return revealed; },
      canAdvance: function () { return revealed; },
      play: function () { return controller.play(); },
      hasError: function () { return controller.hasError(); },
      isBusy: function () { return controller.isBusy(); },
      destroy: function () { controller.destroy(); },
    };
  }

  global.CHINESE_READER_LISTENING = {
    createAudioController: createAudioController,
    createQuestionSession: createQuestionSession,
  };
})(window);
