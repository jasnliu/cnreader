// Shared definitions and examples for quiz result popups.
(function (global) {
  'use strict';

  const units = global.CHINESE_READER_UNIT_DATA;
  if (!Array.isArray(units) || units.length === 0) {
    throw new Error('Expected shared Chinese character unit data.');
  }

  global.WORD_DETAIL_DATA = units.map(function (unit) {
    return {
      definitions: unit.definitions,
      examples: unit.examples,
    };
  });
})(window);
