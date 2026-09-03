(function (global) {
  'use strict';

  const CODE_PREFIX = 'CNR1.';
  const BACKUP_FORMAT = 'cnreader-progress';
  const BACKUP_VERSION = 1;

  const FIXED_BACKUP_KEYS = Object.freeze([
    // Word and phrase navigation/progression state.
    'currentUnit',
    'currentSection',
    'quizPosition',
    'maxBonusCount',
    'phraseCurrentUnit',
    'phraseCurrentSection',
    'phraseQuizPosition',
    'phraseMaxBonusCount',

    // Targeted-review values. charMistakes is retained for legacy saves.
    'charKnowledge',
    'phraseKnowledge',
    'charMistakes',
    'cnReaderCompletedAnswerXp',

    // Word review settings.
    'reviewQuizTargeted',
    'reviewQuizMultipleChoice',
    'reviewQuizWriting',
    'reviewQuizDefinition',
    'reviewQuizQuestionCount',

    // Phrase review settings.
    'phraseReviewQuizTargeted',
    'phraseReviewQuizMultipleChoice',
    'phraseReviewQuizWriting',
    'phraseReviewQuizDefinition',
    'phraseReviewQuizQuestionCount',

    // Worksheet/custom-test selections and question settings.
    'worksheetGlobalChars',
    'worksheetSelectionContent',
    'worksheetChars',
    'worksheetUnit',
    'worksheetMC',
    'worksheetWrite',
    'worksheetDefinition',
    'worksheetListening',
    'phraseWorksheetGlobalPhrases',
    'phraseCustomTestGlobalPhrases',
    'phraseCustomTestMC',
    'phraseCustomTestWrite',
    'phraseCustomTestDefinition',
    'phraseCustomTestListening',
  ]);

  // These flags describe a one-time navigation action, not lasting progress.
  // Removing them during restore prevents an old backup from opening a skip quiz.
  const TRANSIENT_KEYS = Object.freeze([
    'skipQuizActive',
    'skipQuizTarget',
    'phraseSkipQuizActive',
    'phraseSkipQuizTarget',
    'worksheetReturn',
  ]);

  const fixedBackupKeySet = new Set(FIXED_BACKUP_KEYS);

  function isProgressMapKey(key) {
    return /^charProgress(?:_\d+)?$/.test(key)
      || /^phraseProgress(?:_\d+)?$/.test(key);
  }

  function isBackupKey(key) {
    return fixedBackupKeySet.has(key) || isProgressMapKey(key);
  }

  function getStoredKeys() {
    const keys = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key !== null) keys.push(key);
    }
    return keys;
  }

  function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(offset, offset + chunkSize)
      );
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  function decodeBase64Url(value) {
    if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) {
      throw new Error('The progress code contains invalid characters.');
    }
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new TextDecoder().decode(bytes);
  }

  function readBackupData() {
    const data = {};
    getStoredKeys().filter(isBackupKey).sort().forEach(function (key) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    });
    return data;
  }

  function readProgressSnapshot() {
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      data: readBackupData(),
    };
  }

  function validateProgressSnapshot(payload) {
    if (
      !payload
      || payload.format !== BACKUP_FORMAT
      || payload.version !== BACKUP_VERSION
      || !payload.data
      || typeof payload.data !== 'object'
      || Array.isArray(payload.data)
    ) {
      throw new Error('This CNReader progress data uses an unsupported format.');
    }

    Object.keys(payload.data).forEach(function (key) {
      if (!isBackupKey(key) || typeof payload.data[key] !== 'string') {
        throw new Error('This CNReader progress data contains unsupported data.');
      }
    });
    return payload;
  }

  function parseProgressCode(code) {
    const normalizedCode = String(code || '').trim();
    if (!normalizedCode.startsWith(CODE_PREFIX)) {
      throw new Error('This is not a CNReader progress code.');
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64Url(normalizedCode.slice(CODE_PREFIX.length)));
    } catch (error) {
      throw new Error('The CNReader progress code is invalid or damaged.');
    }

    try {
      return validateProgressSnapshot(payload);
    } catch (error) {
      throw new Error('This CNReader progress code uses an unsupported format.');
    }
  }

  function getCNReaderProgressCode() {
    const payload = readProgressSnapshot();
    payload.savedAt = new Date().toISOString();
    const code = CODE_PREFIX + encodeBase64Url(JSON.stringify(payload));
    console.log('CNReader progress code (copy the complete line below):');
    console.log(code);
    return code;
  }

  function restoreProgressSnapshot(payload, reloadPage) {
    validateProgressSnapshot(payload);
    const keysToReplace = new Set(FIXED_BACKUP_KEYS.concat(TRANSIENT_KEYS));
    getStoredKeys().filter(isProgressMapKey).forEach(function (key) {
      keysToReplace.add(key);
    });
    Object.keys(payload.data).forEach(function (key) {
      keysToReplace.add(key);
    });

    const previousValues = {};
    keysToReplace.forEach(function (key) {
      previousValues[key] = localStorage.getItem(key);
    });

    try {
      keysToReplace.forEach(function (key) {
        localStorage.removeItem(key);
      });
      Object.keys(payload.data).forEach(function (key) {
        localStorage.setItem(key, payload.data[key]);
      });
    } catch (error) {
      keysToReplace.forEach(function (key) {
        localStorage.removeItem(key);
        if (previousValues[key] !== null) {
          localStorage.setItem(key, previousValues[key]);
        }
      });
      throw error;
    }

    console.info(
      'CNReader progress restored from backup created at '
      + (payload.savedAt || 'an unknown time') + '.'
    );
    if (reloadPage !== false) {
      setTimeout(function () {
        window.location.reload();
      }, 0);
    }
    return true;
  }

  function restoreCNReaderProgress(code, reloadPage) {
    return restoreProgressSnapshot(parseProgressCode(code), reloadPage);
  }

  global.getCNReaderProgressCode = getCNReaderProgressCode;
  global.restoreCNReaderProgress = restoreCNReaderProgress;
  global.CNReaderProgressStore = Object.freeze({
    readSnapshot: readProgressSnapshot,
    restoreSnapshot: restoreProgressSnapshot,
    isDurableKey: isBackupKey,
  });
})(window);
