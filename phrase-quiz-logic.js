(function (global) {
  'use strict';

  const SECTION_SIZE = 20;
  const ITEMS_PER_QUIZ = 5;
  const MAX_PROGRESS = 6;
  const MAX_BONUS_COUNT = 5;
  const MAX_SKIP_QUESTIONS = 50;
  const SKIP_PASS_RATIO = 0.95;
  const RANDOM_QUESTION_TYPES = Object.freeze(['mc', 'typing', 'definition']);

  function getProgressValue(progress, index) {
    return Number(progress[String(index)]) || 0;
  }

  function getBonusCount(currentSection, storedMaximum) {
    const sectionBonus = Math.min(
      Math.max(Number(currentSection) || 0, 0),
      MAX_BONUS_COUNT
    );
    return Math.max(Number(storedMaximum) || 0, sectionBonus);
  }

  function buildMainIndices(progress, totalItems, currentSection, quizPosition) {
    const sectionStart = currentSection * SECTION_SIZE;
    const sectionEnd = Math.min(sectionStart + SECTION_SIZE, totalItems);
    const start = sectionStart + quizPosition * ITEMS_PER_QUIZ;
    const items = [];

    for (let index = start; index < start + ITEMS_PER_QUIZ && index < sectionEnd; index++) {
      if (getProgressValue(progress, index) < MAX_PROGRESS) items.push(index);
    }

    if (items.length < ITEMS_PER_QUIZ) {
      for (let offset = ITEMS_PER_QUIZ; offset < SECTION_SIZE && items.length < ITEMS_PER_QUIZ; offset++) {
        const index = sectionStart + (
          (quizPosition * ITEMS_PER_QUIZ + offset) % SECTION_SIZE
        );
        if (
          index < sectionEnd
          && getProgressValue(progress, index) < MAX_PROGRESS
          && items.indexOf(index) === -1
        ) {
          items.push(index);
        }
      }
    }

    return items;
  }

  function buildBonusIndices(progress, totalItems, mainIndices, bonusCount, randomFn) {
    if (bonusCount <= 0) return [];
    const mainSet = new Set(mainIndices);
    const pool = [];

    for (let index = 0; index < totalItems; index++) {
      if (getProgressValue(progress, index) > 0 && !mainSet.has(index)) {
        pool.push(index);
      }
    }

    if (pool.length < bonusCount) return [];
    const random = typeof randomFn === 'function' ? randomFn : Math.random;
    for (let index = pool.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1));
      const temporary = pool[index];
      pool[index] = pool[swapIndex];
      pool[swapIndex] = temporary;
    }
    return pool.slice(0, bonusCount);
  }

  function isSectionComplete(progress, totalItems, currentSection) {
    const sectionStart = currentSection * SECTION_SIZE;
    const sectionEnd = Math.min(sectionStart + SECTION_SIZE, totalItems);
    if (sectionStart >= sectionEnd) return false;

    for (let index = sectionStart; index < sectionEnd; index++) {
      if (getProgressValue(progress, index) < MAX_PROGRESS) return false;
    }
    return true;
  }

  function buildQuestionSequence(mainIndices, bonusIndices, randomFn) {
    return mainIndices.map(function (index) {
      return { index: index, type: 'mc', isBonus: false };
    }).concat(mainIndices.map(function (index) {
      return { index: index, type: 'typing', isBonus: false };
    })).concat(mainIndices.map(function (index) {
      return { index: index, type: 'definition', isBonus: false };
    })).concat(bonusIndices.map(function (index) {
      return { index: index, type: getRandomQuestionType(randomFn), isBonus: true };
    }));
  }

  function buildSkipIndices(latestSeenIndex, targetIndex, totalItems, randomFn) {
    const skipLogic = global.CHINESE_READER_SKIP_LOGIC;
    if (!skipLogic || typeof skipLogic.buildSkipQuizIndices !== 'function') {
      throw new Error('Expected shared skip quiz logic.');
    }
    return skipLogic.buildSkipQuizIndices(
      latestSeenIndex,
      targetIndex,
      totalItems,
      randomFn
    );
  }

  function getRandomQuestionType(randomFn) {
    const skipLogic = global.CHINESE_READER_SKIP_LOGIC;
    if (!skipLogic || typeof skipLogic.pickRandomQuestionType !== 'function') {
      throw new Error('Expected shared skip quiz logic.');
    }
    return skipLogic.pickRandomQuestionType(RANDOM_QUESTION_TYPES, randomFn);
  }

  function getRandomSkipQuestionType(randomFn) {
    return getRandomQuestionType(randomFn);
  }

  function getRequiredSkipCorrectCount(totalQuestions) {
    return global.CHINESE_READER_SKIP_LOGIC.getRequiredSkipCorrectCount(totalQuestions);
  }

  function hasPassedSkipQuiz(correctCount, totalQuestions) {
    return global.CHINESE_READER_SKIP_LOGIC.hasPassedSkipQuiz(
      correctCount,
      totalQuestions
    );
  }

  function canStillPassSkipQuiz(correctCount, answeredCount, totalQuestions) {
    return global.CHINESE_READER_SKIP_LOGIC.canStillPassSkipQuiz(
      correctCount,
      answeredCount,
      totalQuestions
    );
  }

  function normalizePinyinAnswer(value) {
    return String(value).normalize('NFC').toLowerCase().replace(/\s+/g, '');
  }

  function normalizeDefinitionAnswer(value) {
    return String(value)
      .normalize('NFKC')
      .toLowerCase()
      .replace(/['’‘]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function removeParentheticalText(value) {
    return String(value).replace(/\s*\([^)]*\)/g, ' ');
  }

  const DEFINITION_MATCH_THRESHOLD = 0.75;
  const DEFINITION_MIN_FUZZY_CHARACTERS = 4;

  function removeOptionalDefinitionLeadWords(value) {
    return String(value).replace(/^(?:to|a|an|the)\s+/i, '').trim();
  }

  function removeOptionalDefinitionWords(value) {
    return String(value)
      .replace(/\b(?:to|be)\b/gi, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function getDefinitionAnswerVariants(value) {
    const normalized = String(value);
    const variants = [
      normalized,
      removeOptionalDefinitionLeadWords(normalized),
      removeOptionalDefinitionWords(normalized),
      removeOptionalDefinitionWords(removeOptionalDefinitionLeadWords(normalized)),
    ];

    return variants.filter(function (variant, index) {
      return variant && variants.indexOf(variant) === index;
    });
  }

  function getAcceptedDefinitionAnswers(definition) {
    const source = String(definition || '');
    const sourceWithoutParentheses = removeParentheticalText(source);
    const candidates = [source, sourceWithoutParentheses];

    [source, sourceWithoutParentheses].forEach(function (candidateSource) {
      candidateSource.split(/[;,/]/).forEach(function (part) {
        candidates.push(part);
      });
    });

    const normalizedCandidates = [];
    candidates.forEach(function (candidate) {
      const normalized = normalizeDefinitionAnswer(candidate);
      getDefinitionAnswerVariants(normalized).forEach(function (variant) {
        if (normalizedCandidates.indexOf(variant) === -1) {
          normalizedCandidates.push(variant);
        }
      });
    });
    return normalizedCandidates;
  }

  function getDefinitionCharacterSimilarity(first, second) {
    if (first === second) return 1;
    if (!first || !second) return 0;

    const previousRow = Array.from({ length: second.length + 1 }, function (_, index) {
      return index;
    });

    for (let firstIndex = 1; firstIndex <= first.length; firstIndex++) {
      const currentRow = [firstIndex];
      for (let secondIndex = 1; secondIndex <= second.length; secondIndex++) {
        const substitutionCost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
        currentRow[secondIndex] = Math.min(
          currentRow[secondIndex - 1] + 1,
          previousRow[secondIndex] + 1,
          previousRow[secondIndex - 1] + substitutionCost
        );
      }
      for (let index = 0; index < currentRow.length; index++) {
        previousRow[index] = currentRow[index];
      }
    }

    return 1 - previousRow[second.length] / Math.max(first.length, second.length);
  }

  function getDefinitionWordSimilarity(first, second) {
    const firstWords = first.split(' ').filter(Boolean);
    const secondWords = second.split(' ').filter(Boolean);
    if (!firstWords.length || !secondWords.length) return 0;

    const remainingWords = secondWords.slice();
    let matchingWords = 0;
    firstWords.forEach(function (word) {
      const matchingIndex = remainingWords.indexOf(word);
      if (matchingIndex === -1) return;
      matchingWords++;
      remainingWords.splice(matchingIndex, 1);
    });

    return 2 * matchingWords / (firstWords.length + secondWords.length);
  }

  function isDefinitionCandidateMatch(answer, candidate) {
    if (answer === candidate) return true;

    const answerCharacterCount = answer.replace(/\s/g, '').length;
    const candidateCharacterCount = candidate.replace(/\s/g, '').length;
    if (
      answerCharacterCount < DEFINITION_MIN_FUZZY_CHARACTERS
      || candidateCharacterCount < DEFINITION_MIN_FUZZY_CHARACTERS
    ) {
      return false;
    }

    return Math.max(
      getDefinitionCharacterSimilarity(answer, candidate),
      getDefinitionWordSimilarity(answer, candidate)
    ) > DEFINITION_MATCH_THRESHOLD;
  }

  function isDefinitionAnswerCorrect(definition, answer) {
    const normalizedAnswer = normalizeDefinitionAnswer(answer);
    if (!normalizedAnswer) return false;

    const answerVariants = getDefinitionAnswerVariants(normalizedAnswer);
    const candidates = getAcceptedDefinitionAnswers(definition);
    return answerVariants.some(function (answerVariant) {
      return candidates.some(function (candidate) {
        return isDefinitionCandidateMatch(answerVariant, candidate);
      });
    });
  }

  function incrementProgressValue(value) {
    return Math.min((Number(value) || 0) + 1, MAX_PROGRESS);
  }

  global.CHINESE_READER_PHRASE_QUIZ_LOGIC = Object.freeze({
    SECTION_SIZE: SECTION_SIZE,
    ITEMS_PER_QUIZ: ITEMS_PER_QUIZ,
    MAX_PROGRESS: MAX_PROGRESS,
    MAX_BONUS_COUNT: MAX_BONUS_COUNT,
    MAX_SKIP_QUESTIONS: MAX_SKIP_QUESTIONS,
    SKIP_PASS_RATIO: SKIP_PASS_RATIO,
    getBonusCount: getBonusCount,
    buildMainIndices: buildMainIndices,
    buildBonusIndices: buildBonusIndices,
    isSectionComplete: isSectionComplete,
    buildQuestionSequence: buildQuestionSequence,
    buildSkipIndices: buildSkipIndices,
    getRandomSkipQuestionType: getRandomSkipQuestionType,
    getRequiredSkipCorrectCount: getRequiredSkipCorrectCount,
    hasPassedSkipQuiz: hasPassedSkipQuiz,
    canStillPassSkipQuiz: canStillPassSkipQuiz,
    normalizePinyinAnswer: normalizePinyinAnswer,
    normalizeDefinitionAnswer: normalizeDefinitionAnswer,
    getAcceptedDefinitionAnswers: getAcceptedDefinitionAnswers,
    getDefinitionCharacterSimilarity: getDefinitionCharacterSimilarity,
    getDefinitionWordSimilarity: getDefinitionWordSimilarity,
    isDefinitionAnswerCorrect: isDefinitionAnswerCorrect,
    incrementProgressValue: incrementProgressValue,
  });
})(window);
