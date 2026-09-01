(function (global) {
  'use strict';

  const XP_PER_PROGRESS_STEP = 2;
  const COMPLETE_PROGRESS = 6;
  const COMPLETED_ANSWER_XP_KEY = 'cnReaderCompletedAnswerXp';
  const XP_ANIMATION_START_KEY = 'cnReaderXpAnimationStart';
  const XP_ANIMATION_MIN_DURATION = 500;
  const XP_ANIMATION_MAX_DURATION = 2000;
  const XP_ANIMATION_MILLISECONDS_PER_POINT = 200;

  function getWholeXpValue(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function getProgressValue(value) {
    return Math.min(COMPLETE_PROGRESS, Math.max(0, Number(value) || 0));
  }

  function readProgressMap(storage, key) {
    try {
      const parsed = JSON.parse(storage.getItem(key) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function isProgressKey(key) {
    return /^charProgress(?:_\d+)?$/.test(key)
      || /^phraseProgress(?:_\d+)?$/.test(key);
  }

  function getProgressXp(storage) {
    let total = 0;

    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key || !isProgressKey(key)) continue;

      const progress = readProgressMap(storage, key);
      Object.keys(progress).forEach(function (itemKey) {
        total += getProgressValue(progress[itemKey]) * XP_PER_PROGRESS_STEP;
      });
    }

    return total;
  }

  function getCompletedAnswerXp(storage) {
    return Math.max(0, Math.floor(Number(storage.getItem(COMPLETED_ANSWER_XP_KEY)) || 0));
  }

  function getTotalXp(storage) {
    return getProgressXp(storage) + getCompletedAnswerXp(storage);
  }

  function awardCompletedAnswerXp(storage, progressBeforeAnswer) {
    if (getProgressValue(progressBeforeAnswer) < COMPLETE_PROGRESS) return 0;

    const nextValue = getCompletedAnswerXp(storage) + 1;
    storage.setItem(COMPLETED_ANSWER_XP_KEY, String(nextValue));
    return 1;
  }

  function getXpAnimationDuration(startXp, endXp) {
    const gain = getWholeXpValue(endXp) - getWholeXpValue(startXp);
    if (gain <= 0) return 0;

    return Math.min(
      XP_ANIMATION_MAX_DURATION,
      Math.max(XP_ANIMATION_MIN_DURATION, gain * XP_ANIMATION_MILLISECONDS_PER_POINT)
    );
  }

  function getXpAnimationValue(startXp, endXp, elapsed, duration) {
    const start = getWholeXpValue(startXp);
    const end = getWholeXpValue(endXp);
    if (end <= start || duration <= 0) return end;

    const progress = Math.min(1, Math.max(0, Number(elapsed) || 0) / duration);
    return Math.min(end, start + Math.floor((end - start) * progress));
  }

  function queueXpAnimation(storage, startXp, endXp) {
    const start = getWholeXpValue(startXp);
    const end = getWholeXpValue(endXp);
    if (!storage || end <= start) return false;

    storage.setItem(XP_ANIMATION_START_KEY, String(start));
    return true;
  }

  function takeXpAnimationStart(storage, endXp) {
    if (!storage) return null;

    const storedValue = storage.getItem(XP_ANIMATION_START_KEY);
    storage.removeItem(XP_ANIMATION_START_KEY);
    if (storedValue === null) return null;
    const start = getWholeXpValue(storedValue);
    const end = getWholeXpValue(endXp);
    return start < end ? start : null;
  }

  global.CHINESE_READER_XP = Object.freeze({
    XP_PER_PROGRESS_STEP: XP_PER_PROGRESS_STEP,
    COMPLETE_PROGRESS: COMPLETE_PROGRESS,
    COMPLETED_ANSWER_XP_KEY: COMPLETED_ANSWER_XP_KEY,
    XP_ANIMATION_START_KEY: XP_ANIMATION_START_KEY,
    getProgressValue: getProgressValue,
    getProgressXp: getProgressXp,
    getTotalXp: getTotalXp,
    awardCompletedAnswerXp: awardCompletedAnswerXp,
    getXpAnimationDuration: getXpAnimationDuration,
    getXpAnimationValue: getXpAnimationValue,
    queueXpAnimation: queueXpAnimation,
    takeXpAnimationStart: takeXpAnimationStart,
  });
})(window);
