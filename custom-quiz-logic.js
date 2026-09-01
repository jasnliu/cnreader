(function (global) {
  'use strict';

  const SETTING_SUFFIXES = Object.freeze({
    mc: 'MC',
    typing: 'Write',
    definition: 'Definition',
    listening: 'Listening',
  });

  function readFormatSettings(storage, prefix) {
    const settings = {};
    Object.keys(SETTING_SUFFIXES).forEach(function (name) {
      settings[name] = storage.getItem(prefix + SETTING_SUFFIXES[name]) !== 'false';
    });
    return settings;
  }

  function writeFormatSettings(storage, prefix, settings) {
    Object.keys(SETTING_SUFFIXES).forEach(function (name) {
      storage.setItem(prefix + SETTING_SUFFIXES[name], String(settings[name]));
    });
  }

  function filterQuestionTypes(phraseMode, selectedTypes) {
    return selectedTypes.filter(function (type) {
      return phraseMode || type !== 'definition';
    });
  }

  function configureDefinitionControl(phraseMode, option, checkbox) {
    if (option) {
      option.hidden = !phraseMode;
      option.style.display = phraseMode ? '' : 'none';
    }
    if (!phraseMode && checkbox) checkbox.checked = false;
  }

  function buildQuestions(options) {
    const questions = [];
    options.selectedGlobalIndices.forEach(function (globalIndex) {
      options.selectedTypes.forEach(function (type) {
        questions.push(options.makeQuestion(globalIndex, type));
      });
    });
    return questions;
  }

  function bindListeningAudio(question, globalIndex, entries, expectedPinyin) {
    const entry = Array.isArray(entries) ? entries[globalIndex] : null;
    if (!entry || typeof entry.path !== 'string' || entry.path.length === 0) {
      throw new Error('Missing listening audio for global index ' + globalIndex + '.');
    }

    const requiredPinyin = expectedPinyin === undefined
      ? question.pinyin
      : expectedPinyin;
    if (entry.text !== question.char || entry.pinyin !== requiredPinyin) {
      throw new Error(
        'Listening audio does not match quiz content at global index ' + globalIndex + '.'
      );
    }

    return Object.assign({}, question, { audioUrl: entry.path });
  }

  global.CHINESE_READER_CUSTOM_QUIZ_LOGIC = {
    readFormatSettings: readFormatSettings,
    writeFormatSettings: writeFormatSettings,
    filterQuestionTypes: filterQuestionTypes,
    configureDefinitionControl: configureDefinitionControl,
    buildQuestions: buildQuestions,
    bindListeningAudio: bindListeningAudio,
  };
})(window);
