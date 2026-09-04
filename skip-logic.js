(function (window) {
  'use strict';

  const MIN_SKIP_DISTANCE = 50;
  const SKIP_QUESTION_COUNT = 50;
  const LATEST_QUESTION_COUNT = 25;
  const SKIP_PASS_RATIO = 0.95;

  function canOfferSkipTarget(selectedGlobalIndex, latestSeenGlobalIndex, totalItems) {
    const target = Number(selectedGlobalIndex);
    const latestSeen = Number(latestSeenGlobalIndex);
    const total = Number(totalItems);
    const skipThreshold = latestSeen + MIN_SKIP_DISTANCE;

    return Number.isInteger(target)
      && Number.isInteger(latestSeen)
      && Number.isInteger(total)
      && target >= skipThreshold
      && skipThreshold >= 0
      && skipThreshold < total;
  }

  function buildSkipRangeIndices(latestSeenIndex, targetIndex, totalItems) {
    const numericLatestSeenIndex = Number(latestSeenIndex);
    const firstSkippedIndex = Math.max(
      (Number.isFinite(numericLatestSeenIndex) ? numericLatestSeenIndex : -1) + 1,
      0
    );
    const lastSkippedIndex = Math.min(
      Math.max(Number(targetIndex) || 0, 0),
      Math.max((Number(totalItems) || 0) - 1, -1)
    );
    const indices = [];

    for (let index = firstSkippedIndex; index <= lastSkippedIndex; index++) {
      indices.push(index);
    }

    return indices;
  }

  function shuffleInPlace(items, randomFn) {
    const random = typeof randomFn === 'function' ? randomFn : Math.random;
    for (let index = items.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      const temporary = items[index];
      items[index] = items[swapIndex];
      items[swapIndex] = temporary;
    }
    return items;
  }

  function buildSkipQuizIndices(latestSeenIndex, targetIndex, totalItems, randomFn) {
    const skipRange = buildSkipRangeIndices(latestSeenIndex, targetIndex, totalItems);
    if (skipRange.length < SKIP_QUESTION_COUNT) return [];

    const latestQuestions = skipRange.slice(-LATEST_QUESTION_COUNT);
    const earlierPool = skipRange.slice(0, -LATEST_QUESTION_COUNT);
    shuffleInPlace(earlierPool, randomFn);
    const randomQuestions = earlierPool.slice(
      0,
      SKIP_QUESTION_COUNT - LATEST_QUESTION_COUNT
    );

    return shuffleInPlace(latestQuestions.concat(randomQuestions), randomFn);
  }

  function pickRandomQuestionType(questionTypes, randomFn) {
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) return null;
    const random = typeof randomFn === 'function' ? randomFn : Math.random;
    return questionTypes[Math.floor(random() * questionTypes.length)];
  }

  function getRequiredSkipCorrectCount(totalQuestions) {
    const total = Math.max(Math.floor(Number(totalQuestions) || 0), 0);
    return total ? Math.floor(total * SKIP_PASS_RATIO) + 1 : 1;
  }

  function hasPassedSkipQuiz(correctCount, totalQuestions) {
    return Math.max(Math.floor(Number(correctCount) || 0), 0)
      >= getRequiredSkipCorrectCount(totalQuestions);
  }

  function canStillPassSkipQuiz(correctCount, answeredCount, totalQuestions) {
    const total = Math.max(Math.floor(Number(totalQuestions) || 0), 0);
    const answered = Math.min(
      Math.max(Math.floor(Number(answeredCount) || 0), 0),
      total
    );
    const correct = Math.min(
      Math.max(Math.floor(Number(correctCount) || 0), 0),
      answered
    );
    return correct + (total - answered) >= getRequiredSkipCorrectCount(total);
  }

  window.CHINESE_READER_SKIP_LOGIC = Object.freeze({
    MIN_SKIP_DISTANCE: MIN_SKIP_DISTANCE,
    SKIP_QUESTION_COUNT: SKIP_QUESTION_COUNT,
    LATEST_QUESTION_COUNT: LATEST_QUESTION_COUNT,
    SKIP_PASS_RATIO: SKIP_PASS_RATIO,
    canOfferSkipTarget: canOfferSkipTarget,
    buildSkipRangeIndices: buildSkipRangeIndices,
    buildSkipQuizIndices: buildSkipQuizIndices,
    pickRandomQuestionType: pickRandomQuestionType,
    getRequiredSkipCorrectCount: getRequiredSkipCorrectCount,
    hasPassedSkipQuiz: hasPassedSkipQuiz,
    canStillPassSkipQuiz: canStillPassSkipQuiz,
  });
})(window);
