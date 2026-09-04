// ── Header Layout Configuration ──
const SITE_TITLE_FONT_SIZE = 42;
const SITE_TITLE_TOP_GAP = 38;
const CONTENT_MODE_TOGGLE_WIDTH = 360;
const CONTENT_MODE_TOGGLE_HEIGHT = 30;
const CONTENT_MODE_TOGGLE_FONT_SIZE = 17;
const CONTENT_MODE_TOGGLE_BORDER_RADIUS = 6;
const CONTENT_MODE_TOGGLE_LOGO_GAP = 16; // gap from bottom of logo to top of toggle
const CONTENT_MODE_TOGGLE_GRID_GAP = 10; // gap from bottom of toggle to top of word grid
const WORDS_GRID_HEADER_WIDTH = 350;
const GRID_XP_MIN_WIDTH = 100;
const GRID_XP_DIGIT_WIDTH = 12;
const GRID_XP_LABEL_WIDTH = 32;
const GRID_XP_HORIZONTAL_PADDING = 28;
let displayedGridXpValue = null;
let gridXpAnimationFrame = null;

// ── Reading Configuration ──
const READING_FONT_SIZE = 30;
const READING_LINE_GAP = 16; // additional pixels between excerpt lines
const READING_SIDE_PADDING = 20;
const READING_BOTTOM_PADDING = 80;
const READING_CORNER_OUTLINE_WIDTH = 350;
const READING_CORNER_OUTLINE_HEIGHT = 200;
const READING_CORNER_OUTLINE_MAX_HEIGHT = 520;
const READING_CORNER_OUTLINE_THICKNESS = 3;
const READING_CORNER_OUTLINE_RADIUS = 24;
const READING_CORNER_OUTLINE_ANIMATION_DURATION = 0.35; // seconds
const READING_SELECTION_DRAG_THRESHOLD = 4;
const TRANSFORMERS_JS_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const READING_TRANSLATION_MODEL = 'Xenova/opus-mt-zh-en';
const READING_TRANSLATION_DTYPE = 'q8';
const READING_TRANSLATION_PRELOAD_DELAY = 0; // milliseconds after the page is ready

// The grid position follows the two configurable gaps above.
const TOP_GAP = SITE_TITLE_TOP_GAP
  + SITE_TITLE_FONT_SIZE
  + CONTENT_MODE_TOGGLE_LOGO_GAP
  + CONTENT_MODE_TOGGLE_HEIGHT
  + CONTENT_MODE_TOGGLE_GRID_GAP;

// ── Grid Configuration ──
const ROWS = 10;
const COLS = 10;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 140;
const LINE_THICKNESS = 2;
const BOTTOM_SCROLL_PADDING = 80; // extra scroll space below grid so Start button doesn't cover content

// ── Site Title Configuration ──
const SITE_TITLE_RED_COLOR = '#e71717';
const SITE_TITLE_YELLOW_COLOR = '#f2c230';
const SITE_TITLE_BLACK_COLOR = '#000000';

// ── Character Configuration ──
const FONT_SIZE = 48;
const CHAR_Y_OFFSET = 30; // 0 = centered, positive = higher, negative = lower

// ── Phrase Configuration ──
const PHRASE_FONT_SIZE = 44;
const PHRASE_MIN_FONT_SIZE = 28;
const PHRASE_TEXT_HORIZONTAL_PADDING = 10;
const PHRASE_CURRENT_UNIT_STORAGE_KEY = 'phraseCurrentUnit';

// ── Pinyin Configuration ──
const PINYIN_FONT_SIZE = 18;
const PINYIN_Y_OFFSET = -20; // 0 = centered, positive = higher, negative = lower

// ── Progress Bar Configuration ──
const PROGRESS_BAR_WIDTH = 80;
const PROGRESS_BAR_HEIGHT = 10;
const PROGRESS_BAR_Y_OFFSET = -45;
const PROGRESS_BAR_COLOR = '#cccccc';
const PROGRESS_BAR_RADIUS = 5;
const PROGRESS_FILL_COLOR = '#4CAF50'; // green fill
const COMPLETED_CELL_COLOR = '#e8f5e9'; // light green background for completed cells

// ── Start Button Configuration ──
const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 75;
const BUTTON_FONT_SIZE = 30;
const HOVER_SCALE_PERCENT = 10; // percent increase on hover
const HOVER_TRANSITION_DURATION = 0.2; // seconds
const BUTTON_TOP_LEFT_RADIUS = 15;
const BUTTON_SHADOW_SIZE = 6;

// ── Plus Button Configuration ──
const PLUS_BUTTON_SIDE = BUTTON_HEIGHT;           // square, same height as start button
const PLUS_BUTTON_SIGN_SIZE = 40;                 // size of the "+" sign
const PLUS_BUTTON_CORNER_RADIUS = BUTTON_TOP_LEFT_RADIUS; // same curved corner radius as start

// ── Circle Animation Configuration ──
const CIRCLE_RADIUS = 225;                        // radius of the quarter-circle in px
const CIRCLE_COLOR = '#aaaaaa';                   // gray fill color
const CIRCLE_SHOW_DURATION = 0.1;                 // seconds for rotate-in animation
const CIRCLE_HIDE_DURATION = 0.1;                 // seconds for shrink-out animation
const CIRCLE_LINE_THICKNESS = 2;                  // thickness of the 45° line in px
const CIRCLE_TEXT_FONT_SIZE = 13;                 // font size for section text in px
const CIRCLE_TEXT_RADIAL_OFFSET = 0.65;            // fraction of radius: 0 = center, 1 = edge
const CIRCLE_HOVER_COLOR = '#cccccc';              // lighter gray for hovered section
const CIRCLE_TEXT_HOVER_SIZE_INCREASE = 2;         // px increase in font size on hover
const CIRCLE_HOVER_ANIM_DURATION = 0.15;           // seconds for hover transition
const SLIDE_OUT_SPEED = 1000;                       // px/s for button slide-out animation

// ── Selection Mode Configuration ──
// Selection mode moved to select.html

// ── Navigation Arrow Buttons ──
const NAV_ARROW_SIZE = 24;       // font size of the arrow
const NAV_BUTTON_WIDTH = 40;     // button width
const NAV_BUTTON_HEIGHT = 40;    // button height
const NAV_BUTTON_TOP_GAP = 40;   // gap from top edge of screen
const NAV_BUTTON_GAP = 10;        // gap between right edge of left button and left edge of right button
const NAV_BUTTON_RIGHT_GAP = 40; // gap between right edge of right button and right edge of screen

// ── Popup Configuration ──
const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 450;
const POPUP_OUTLINE_THICKNESS = 3;
const POPUP_X_BUTTON_TOP_GAP = 8;    // gap between top edge of X button and top edge of popup
const POPUP_X_BUTTON_RIGHT_GAP = 10;  // gap between right edge of X button and right edge of popup
const POPUP_X_BUTTON_SIDE = 32;
const POPUP_X_SIGN_SIZE = 18;
const POPUP_CHAR_EDGE_GAP = 35;      // gap between left/top edge of character and left/top edge of popup
const POPUP_CHAR_FONT_SIZE = 80;
const POPUP_PINYIN_GAP = 15;         // gap between bottom of character and top of pinyin
const POPUP_PINYIN_FONT_SIZE = 18;
const POPUP_DEFINITION_GAP = 30;     // gap between bottom of pinyin and top of definition
const POPUP_DEFINITION_LEFT_GAP = 40; // gap between left edge of definition and left edge of popup
const POPUP_DEFINITION_FONT_SIZE = 20;
const POPUP_EXAMPLES_GAP = 20;       // gap between bottom of definition and top of examples
const POPUP_OPEN_ANIM_DURATION = 0.1;   // seconds for opening animation
const POPUP_CLOSE_ANIM_DURATION = 0.07;  // seconds for closing animation
const POPUP_BLUR_AMOUNT = 5;            // max blur in pixels for background when popup is open
const POPUP_SKIP_BTN_WIDTH = 120;
const POPUP_SKIP_BTN_HEIGHT = 40;
const POPUP_SKIP_BTN_FONT_SIZE = 16;
const POPUP_SKIP_BTN_GAP = 15;          // gap from bottom and right edges of popup

// ── Skip Popup Configuration ──
const SKIP_POPUP_WIDTH = 400;
const SKIP_POPUP_HEIGHT = 150;
const SKIP_POPUP_TEXT_FONT_SIZE = 20;
const SKIP_POPUP_TEXT_TOP_GAP = 40;     // gap from top of popup to top of text
const SKIP_POPUP_BTN_TOP_GAP = 40;      // gap from bottom of text to top of buttons
const SKIP_POPUP_BTN_WIDTH = 80;
const SKIP_POPUP_BTN_HEIGHT = 80;       // positional Y (top) of the buttons
const SKIP_POPUP_BTN_DIM_H = 40;        // CSS height of the buttons
const SKIP_POPUP_BTN_GAP = 20;          // gap between the two buttons (total, so each is half from center)
const SKIP_POPUP_BTN_FONT_SIZE = 18;

// ── Shared Unit Data ──
const UNIT_DATA = window.CHINESE_READER_UNIT_DATA;
if (!Array.isArray(UNIT_DATA) || UNIT_DATA.length === 0) {
  throw new Error('Expected shared Chinese character unit data.');
}

const SKIP_LOGIC = window.CHINESE_READER_SKIP_LOGIC;
if (!SKIP_LOGIC || typeof SKIP_LOGIC.canOfferSkipTarget !== 'function') {
  throw new Error('Expected shared skip target logic.');
}

const PHRASE_UNITS = window.CHINESE_READER_PHRASE_UNITS;
if (!Array.isArray(PHRASE_UNITS) || PHRASE_UNITS.length === 0) {
  throw new Error('Expected shared Chinese phrase unit data.');
}

PHRASE_UNITS.forEach(function (unit, unitIndex) {
  if (
    !unit
    || !Array.isArray(unit.phrases)
    || !Array.isArray(unit.pinyin)
    || !Array.isArray(unit.definitions)
    || unit.phrases.length !== 100
    || unit.pinyin.length !== unit.phrases.length
    || unit.definitions.length !== unit.phrases.length
  ) {
    throw new Error(
      'Expected 100 aligned phrases, pinyin readings, and definitions in phrase unit '
      + (unitIndex + 1) + '.'
    );
  }
});

function getCurrentUnit() {
  const data = localStorage.getItem('currentUnit');
  return data ? parseInt(data, 10) : 0;
}

function setCurrentUnit(unit) {
  localStorage.setItem('currentUnit', String(unit));
}

function getCurrentUnitData() {
  return UNIT_DATA[getCurrentUnit()];
}

function getProgressKeyForUnit(unit) {
  return unit === 0 ? 'charProgress' : 'charProgress_' + unit;
}

function getProgressKey() {
  return getProgressKeyForUnit(getCurrentUnit());
}

function getCurrentPhraseUnit() {
  const stored = parseInt(
    localStorage.getItem(PHRASE_CURRENT_UNIT_STORAGE_KEY) || '0',
    10
  );
  return Math.min(
    Math.max(Number.isInteger(stored) ? stored : 0, 0),
    PHRASE_UNITS.length - 1
  );
}

function setCurrentPhraseUnit(unit) {
  const clampedUnit = Math.min(Math.max(Number(unit) || 0, 0), PHRASE_UNITS.length - 1);
  localStorage.setItem(PHRASE_CURRENT_UNIT_STORAGE_KEY, String(clampedUnit));
}

function getPhraseProgressKeyForUnit(unit) {
  return unit === 0 ? 'phraseProgress' : 'phraseProgress_' + unit;
}

// Auto-advance to next unit if current unit is fully completed
(function () {
  var unit = getCurrentUnit();
  while (unit < UNIT_DATA.length - 1) {
    var progress = JSON.parse(localStorage.getItem(unit === 0 ? 'charProgress' : 'charProgress_' + unit) || '{}');
    var allDone = true;
    for (var i = 0; i < UNIT_DATA[unit].characters.length; i++) {
      if ((progress[String(i)] || 0) < 6) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      unit++;
      setCurrentUnit(unit);
    } else {
      break;
    }
  }
})();

// Keep the phrase grid aligned with the first phrase unit that is not complete.
(function () {
  var unit = getCurrentPhraseUnit();
  while (unit < PHRASE_UNITS.length - 1) {
    var progress = JSON.parse(
      localStorage.getItem(getPhraseProgressKeyForUnit(unit)) || '{}'
    );
    var allDone = true;
    for (var i = 0; i < PHRASE_UNITS[unit].phrases.length; i++) {
      if ((progress[String(i)] || 0) < 6) {
        allDone = false;
        break;
      }
    }
    if (allDone) {
      unit++;
      setCurrentPhraseUnit(unit);
    } else {
      break;
    }
  }
})();

// ── Word Grid Search ──
const wordsGridSearchInput = document.getElementById('wordsGridSearchInput');
const wordsGridHeaderOutline = document.getElementById('wordsGridHeaderOutline');
const phrasesGridSearchInput = document.getElementById('phrasesGridSearchInput');
const phrasesGridHeaderOutline = document.getElementById('phrasesGridHeaderOutline');
const PINYIN_SEARCH_TONE_MARKS = {
  'ā': ['a', '1'], 'á': ['a', '2'], 'ǎ': ['a', '3'], 'à': ['a', '4'],
  'ē': ['e', '1'], 'é': ['e', '2'], 'ě': ['e', '3'], 'è': ['e', '4'],
  'ī': ['i', '1'], 'í': ['i', '2'], 'ǐ': ['i', '3'], 'ì': ['i', '4'],
  'ō': ['o', '1'], 'ó': ['o', '2'], 'ǒ': ['o', '3'], 'ò': ['o', '4'],
  'ū': ['u', '1'], 'ú': ['u', '2'], 'ǔ': ['u', '3'], 'ù': ['u', '4'],
  'ǖ': ['v', '1'], 'ǘ': ['v', '2'], 'ǚ': ['v', '3'], 'ǜ': ['v', '4'],
  'ü': ['v', ''], 'ń': ['n', '2'], 'ň': ['n', '3'], 'ǹ': ['n', '4'],
  'ḿ': ['m', '2'],
};
// Same numbered-tone shortcuts used by the quiz typing prompt.
const PINYIN_SEARCH_ACCENT_MAP = {
  1: { a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū', ü: 'ǖ', A: 'Ā', E: 'Ē', I: 'Ī', O: 'Ō', U: 'Ū', Ü: 'Ǖ' },
  2: { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', ü: 'ǘ', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Ü: 'Ǘ' },
  3: { a: 'ǎ', e: 'ě', i: 'ǐ', o: 'ǒ', u: 'ǔ', ü: 'ǚ', A: 'Ǎ', E: 'Ě', I: 'Ǐ', O: 'Ǒ', U: 'Ǔ', Ü: 'Ǚ' },
  4: { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', ü: 'ǜ', A: 'À', E: 'È', I: 'Ì', O: 'Ò', U: 'Ù', Ü: 'Ǜ' },
  5: { u: 'ü', U: 'Ü' },
};

let currentGridVisibleItems = [];
let currentGridColumnCount = COLS;
let currentGridRowCount = ROWS;
let currentGridContentOffsetX = 0;
let wordsGridSearchComposing = false;
let pendingWordsGridPointerSelection = null;
let currentPhraseGridVisibleItems = [];
let currentPhraseGridColumnCount = COLS;
let currentPhraseGridRowCount = ROWS;
let currentPhraseGridContentOffsetX = 0;
let phrasesGridSearchComposing = false;
let pendingPhrasesGridPointerSelection = null;

function setupWordsGridPinyinAccents(inputElement) {
  const heldToneKeys = new Set();

  function notifyInputChanged() {
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  }

  inputElement.addEventListener('keydown', function (event) {
    if (['1', '2', '3', '4', '5'].includes(event.key)) {
      event.preventDefault();
      const value = inputElement.value;
      const selectionStart = inputElement.selectionStart;
      const selectionEnd = inputElement.selectionEnd;
      const selectedCharacter = selectionEnd === selectionStart + 1
        ? value[selectionStart]
        : '';
      const selectedAccent = selectedCharacter
        ? PINYIN_SEARCH_ACCENT_MAP[event.key][selectedCharacter]
        : '';
      const targetIndex = selectedAccent ? selectionStart : selectionStart - 1;
      if (targetIndex >= 0) {
        const targetCharacter = value[targetIndex];
        const accentedCharacter = PINYIN_SEARCH_ACCENT_MAP[event.key][targetCharacter];
        if (accentedCharacter) {
          inputElement.value = value.slice(0, targetIndex)
            + accentedCharacter
            + value.slice(targetIndex + 1);
          inputElement.selectionStart = inputElement.selectionEnd = targetIndex + 1;
          notifyInputChanged();
          return;
        }
      }
      heldToneKeys.add(event.key);
      return;
    }

    if (heldToneKeys.size > 0 && /^[aeiouüAEIOUÜ]$/u.test(event.key)) {
      const toneKey = Array.from(heldToneKeys).pop();
      const accentedCharacter = PINYIN_SEARCH_ACCENT_MAP[toneKey][event.key];
      if (accentedCharacter) {
        event.preventDefault();
        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        inputElement.value = inputElement.value.slice(0, start)
          + accentedCharacter
          + inputElement.value.slice(end);
        inputElement.selectionStart = inputElement.selectionEnd = start + 1;
        notifyInputChanged();
        return;
      }
    }
  });

  inputElement.addEventListener('keyup', function (event) {
    if (['1', '2', '3', '4', '5'].includes(event.key)) {
      heldToneKeys.delete(event.key);
    }
  });
}

function normalizePinyinSyllableForSearch(syllable, addNeutralTone) {
  let base = '';
  let markedTone = '';

  Array.from(syllable.toLowerCase().replace(/u:/g, 'v')).forEach(function (character) {
    const toneMark = PINYIN_SEARCH_TONE_MARKS[character];
    if (toneMark) {
      base += toneMark[0];
      if (toneMark[1]) markedTone = toneMark[1];
    } else {
      base += character;
    }
  });

  if (/[0-5]$/u.test(base)) return base;
  if (markedTone) return base + markedTone;
  return addNeutralTone && /^[a-zv]+$/u.test(base) ? base + '5' : base;
}

function normalizePinyinForSearch(value, addNeutralTone) {
  const syllables = value
    .toLowerCase()
    .replace(/u:/g, 'v')
    .match(/[a-zvüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿ0-5]+/gu) || [];

  return syllables.map(function (syllable) {
    return normalizePinyinSyllableForSearch(syllable, addNeutralTone);
  });
}

function matchesOrderedSequence(queryParts, candidateParts) {
  if (!queryParts.length) return false;

  let candidateIndex = 0;
  for (let queryIndex = 0; queryIndex < queryParts.length; queryIndex++) {
    const queryPart = queryParts[queryIndex];
    let matched = false;

    while (candidateIndex < candidateParts.length) {
      if (candidateParts[candidateIndex].includes(queryPart)) {
        matched = true;
        candidateIndex++;
        break;
      }
      candidateIndex++;
    }

    if (!matched) return false;
  }

  return true;
}

function normalizeDefinitionSearchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesDefinitionSearch(query, definitions) {
  const normalizedQuery = normalizeDefinitionSearchText(query);
  if (!normalizedQuery) return false;

  return String(definitions || '').split(';').some(function (definition) {
    return normalizeDefinitionSearchText(definition).includes(normalizedQuery);
  });
}

function getWordsGridVisibleItems() {
  const rawQuery = wordsGridSearchInput.value.trim();
  if (!rawQuery) {
    const currentUnitIndex = getCurrentUnit();
    return UNIT_DATA[currentUnitIndex].characters.map(function (_, index) {
      return { unitIndex: currentUnitIndex, index: index };
    });
  }

  const requestedHanzi = Array.from(rawQuery).filter(function (character) {
    return /\p{Script=Han}/u.test(character);
  });
  const requestedSet = new Set(requestedHanzi);
  const querySyllables = normalizePinyinForSearch(rawQuery, false);
  const visibleItems = [];

  UNIT_DATA.forEach(function (unitData, unitIndex) {
    unitData.characters.forEach(function (character, index) {
      let matches = false;
      if (requestedHanzi.length) {
        matches = requestedSet.has(character);
      } else if (querySyllables.length) {
        const candidateSyllables = normalizePinyinForSearch(unitData.pinyin[index], true);
        const matchesPinyin = querySyllables.every(function (querySyllable) {
          return candidateSyllables.some(function (candidateSyllable) {
            return candidateSyllable.includes(querySyllable);
          });
        });
        matches = matchesPinyin || matchesDefinitionSearch(rawQuery, unitData.definitions[index]);
      }

      if (matches) {
        visibleItems.push({ unitIndex: unitIndex, index: index });
      }
    });
  });

  return visibleItems;
}

function getPhrasesGridVisibleItems() {
  const rawQuery = phrasesGridSearchInput.value.trim();
  if (!rawQuery) {
    const currentUnitIndex = getCurrentPhraseUnit();
    return PHRASE_UNITS[currentUnitIndex].phrases.map(function (_, index) {
      return { unitIndex: currentUnitIndex, index: index };
    });
  }

  const requestedHanzi = Array.from(rawQuery).filter(function (character) {
    return /\p{Script=Han}/u.test(character);
  });
  const hanQuery = requestedHanzi.join('');
  const querySyllables = normalizePinyinForSearch(rawQuery, false);
  const visibleItems = [];

  PHRASE_UNITS.forEach(function (unitData, unitIndex) {
    unitData.phrases.forEach(function (phrase, index) {
      let matches = false;
      if (hanQuery) {
        matches = phrase.includes(hanQuery);
      } else if (querySyllables.length) {
        const candidateSyllables = normalizePinyinForSearch(unitData.pinyin[index], true);
        matches = matchesOrderedSequence(querySyllables, candidateSyllables)
          || matchesDefinitionSearch(rawQuery, unitData.definitions[index]);
      }

      if (matches) {
        visibleItems.push({ unitIndex: unitIndex, index: index });
      }
    });
  });

  return visibleItems;
}

function getGridCellAtCanvasPoint(canvasX, canvasY) {
  if (currentGridColumnCount < 1 || currentGridRowCount < 1) return null;

  const localX = canvasX - currentGridContentOffsetX;
  const col = Math.floor(localX / CELL_WIDTH);
  const row = Math.floor(canvasY / CELL_HEIGHT);
  if (
    localX < 0
    || col < 0
    || col >= currentGridColumnCount
    || row < 0
    || row >= currentGridRowCount
  ) return null;

  const visiblePosition = row * currentGridColumnCount + col;
  const visibleItem = currentGridVisibleItems[visiblePosition];
  if (!visibleItem) return null;

  return {
    unitIndex: visibleItem.unitIndex,
    index: visibleItem.index,
    row: row,
    col: col,
  };
}

// ── Draw Grid ──
function drawGrid() {
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');

  currentGridVisibleItems = getWordsGridVisibleItems();
  currentGridColumnCount = COLS;
  currentGridRowCount = Math.max(
    ROWS,
    Math.ceil(currentGridVisibleItems.length / currentGridColumnCount)
  );
  currentGridContentOffsetX = 0;

  // Search uses the original grid as an invisible layout template. Its width
  // and origin never change, so the search bar stays fixed; extra result rows
  // may extend downward when all units produce more than 100 matches.
  const gridWidth = COLS * CELL_WIDTH + LINE_THICKNESS;
  const gridHeight = currentGridRowCount * CELL_HEIGHT + LINE_THICKNESS;

  // Set canvas size (device pixel ratio for sharp lines)
  const dpr = window.devicePixelRatio || 1;

  canvas.width = gridWidth * dpr;
  canvas.height = gridHeight * dpr;
  canvas.style.width = gridWidth + 'px';
  canvas.style.height = gridHeight + 'px';

  // Reset transform before scaling (prevents multiple scale applications)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Center horizontally, apply top gap
  const offsetX = (window.innerWidth - gridWidth) / 2;
  const offsetY = TOP_GAP;

  canvas.style.marginLeft = offsetX + 'px';
  canvas.style.marginTop = offsetY + 'px';
  positionWordsGridHeaderOutline(offsetX, gridWidth);
  positionGridXpOutline(offsetX);

  // Draw white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  // Draw black cell outlines. Drawing each visible cell separately leaves the
  // final result row ragged instead of adding empty cells.
  ctx.strokeStyle = 'black';
  ctx.lineWidth = LINE_THICKNESS;

  const halfLine = LINE_THICKNESS / 2;

  if (!currentGridVisibleItems.length) {
    // Preserve only the grid segment that serves as the search bar's bottom.
    ctx.beginPath();
    ctx.moveTo(gridWidth - WORDS_GRID_HEADER_WIDTH + halfLine, halfLine);
    ctx.lineTo(gridWidth - halfLine, halfLine);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.font = '18px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No matches', gridWidth / 2, 35);
    return;
  }

  // Read progress from localStorage
  const progressByUnit = UNIT_DATA.map(function (_, unitIndex) {
    return JSON.parse(localStorage.getItem(getProgressKeyForUnit(unitIndex)) || '{}');
  });

  // Fill completed cells with light green background
  currentGridVisibleItems.forEach(function (item, visiblePosition) {
    const charProgress = progressByUnit[item.unitIndex][String(item.index)] || 0;
    if (charProgress >= 6) {
      const row = Math.floor(visiblePosition / currentGridColumnCount);
      const col = visiblePosition % currentGridColumnCount;
      const cellX = currentGridContentOffsetX + col * CELL_WIDTH + LINE_THICKNESS;
      const cellY = row * CELL_HEIGHT + LINE_THICKNESS;
      const cellW = CELL_WIDTH - LINE_THICKNESS;
      const cellH = CELL_HEIGHT - LINE_THICKNESS;
      ctx.fillStyle = COMPLETED_CELL_COLOR;
      ctx.fillRect(cellX, cellY, cellW, cellH);
    }
  });

  currentGridVisibleItems.forEach(function (_, visiblePosition) {
    const row = Math.floor(visiblePosition / currentGridColumnCount);
    const col = visiblePosition % currentGridColumnCount;
    ctx.strokeRect(
      currentGridContentOffsetX + col * CELL_WIDTH + halfLine,
      row * CELL_HEIGHT + halfLine,
      CELL_WIDTH,
      CELL_HEIGHT
    );
  });

  if (wordsGridSearchInput.value.trim()) {
    // Empty result cells remain invisible, but this segment still acts as the
    // bottom edge of the fixed search bar.
    ctx.beginPath();
    ctx.moveTo(gridWidth - WORDS_GRID_HEADER_WIDTH + halfLine, halfLine);
    ctx.lineTo(gridWidth - halfLine, halfLine);
    ctx.stroke();
  }

  // Draw progress bars
  currentGridVisibleItems.forEach(function (item, visiblePosition) {
    const row = Math.floor(visiblePosition / currentGridColumnCount);
    const col = visiblePosition % currentGridColumnCount;
    const barX = currentGridContentOffsetX + col * CELL_WIDTH
      + CELL_WIDTH / 2 - PROGRESS_BAR_WIDTH / 2 + halfLine;
    const barY = row * CELL_HEIGHT + CELL_HEIGHT / 2 - PROGRESS_BAR_HEIGHT / 2 + halfLine - PROGRESS_BAR_Y_OFFSET;

    // Gray background
    ctx.fillStyle = PROGRESS_BAR_COLOR;
    ctx.beginPath();
    ctx.roundRect(barX, barY, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
    ctx.fill();

    // Green fill based on progress
    const charProgress = progressByUnit[item.unitIndex][String(item.index)] || 0;
    if (charProgress > 0) {
      const fillWidth = (charProgress / 6) * PROGRESS_BAR_WIDTH;
      ctx.fillStyle = PROGRESS_FILL_COLOR;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillWidth, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
      ctx.fill();
    }
  });

  // Draw characters
  ctx.font = FONT_SIZE + 'px "DFFangSong", serif';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  currentGridVisibleItems.forEach(function (item, visiblePosition) {
    const row = Math.floor(visiblePosition / currentGridColumnCount);
    const col = visiblePosition % currentGridColumnCount;
    const centerX = currentGridContentOffsetX + col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - CHAR_Y_OFFSET;
    ctx.fillText(UNIT_DATA[item.unitIndex].characters[item.index], centerX, centerY);
  });

  // Draw pinyin
  ctx.font = PINYIN_FONT_SIZE + 'px "Times New Roman", serif';

  currentGridVisibleItems.forEach(function (item, visiblePosition) {
    const row = Math.floor(visiblePosition / currentGridColumnCount);
    const col = visiblePosition % currentGridColumnCount;
    const centerX = currentGridContentOffsetX + col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - PINYIN_Y_OFFSET;
    ctx.fillText(UNIT_DATA[item.unitIndex].pinyin[item.index], centerX, centerY);
  });
}

function getPhraseGridCellAtCanvasPoint(canvasX, canvasY) {
  if (currentPhraseGridColumnCount < 1 || currentPhraseGridRowCount < 1) return null;

  const localX = canvasX - currentPhraseGridContentOffsetX;
  const col = Math.floor(localX / CELL_WIDTH);
  const row = Math.floor(canvasY / CELL_HEIGHT);
  if (
    localX < 0
    || col < 0
    || col >= currentPhraseGridColumnCount
    || row < 0
    || row >= currentPhraseGridRowCount
  ) return null;

  const visiblePosition = row * currentPhraseGridColumnCount + col;
  const visibleItem = currentPhraseGridVisibleItems[visiblePosition];
  if (!visibleItem) return null;

  return {
    unitIndex: visibleItem.unitIndex,
    index: visibleItem.index,
    row: row,
    col: col,
  };
}

function setFittedCanvasFont(ctx, text, maximumSize, minimumSize, family, maximumWidth) {
  let fontSize = maximumSize;
  ctx.font = fontSize + 'px ' + family;
  const measuredWidth = ctx.measureText(text).width;
  if (measuredWidth > maximumWidth) {
    fontSize = Math.max(minimumSize, Math.floor(fontSize * maximumWidth / measuredWidth));
    ctx.font = fontSize + 'px ' + family;
  }
}

// The Phrases view mirrors the 10 × 10 Words grid with independent units and
// progress maps.
function drawPhrasesGrid() {
  const canvas = document.getElementById('phrasesGridCanvas');
  const ctx = canvas.getContext('2d');
  const gridWidth = COLS * CELL_WIDTH + LINE_THICKNESS;
  const dpr = window.devicePixelRatio || 1;
  const halfLine = LINE_THICKNESS / 2;
  const visibleItems = getPhrasesGridVisibleItems();
  currentPhraseGridVisibleItems = visibleItems;
  currentPhraseGridColumnCount = COLS;
  currentPhraseGridRowCount = Math.max(
    ROWS,
    Math.ceil(visibleItems.length / currentPhraseGridColumnCount)
  );
  currentPhraseGridContentOffsetX = 0;
  const gridHeight = currentPhraseGridRowCount * CELL_HEIGHT + LINE_THICKNESS;

  canvas.width = gridWidth * dpr;
  canvas.height = gridHeight * dpr;
  canvas.style.width = gridWidth + 'px';
  canvas.style.height = gridHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const offsetX = (window.innerWidth - gridWidth) / 2;
  canvas.style.marginLeft = offsetX + 'px';
  canvas.style.marginTop = TOP_GAP + 'px';
  positionGridHeaderOutline(document.getElementById('phrasesGridHeaderOutline'), offsetX, gridWidth);
  positionGridXpOutline(offsetX);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, gridWidth, gridHeight);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = LINE_THICKNESS;

  if (!visibleItems.length) {
    ctx.beginPath();
    ctx.moveTo(gridWidth - WORDS_GRID_HEADER_WIDTH + halfLine, halfLine);
    ctx.lineTo(gridWidth - halfLine, halfLine);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.font = '18px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phrasesGridSearchInput.value.trim() ? 'No matches' : '', gridWidth / 2, 35);
    return;
  }

  for (let visiblePosition = 0; visiblePosition < visibleItems.length; visiblePosition++) {
    const row = Math.floor(visiblePosition / currentPhraseGridColumnCount);
    const col = visiblePosition % currentPhraseGridColumnCount;
    ctx.strokeRect(
      currentPhraseGridContentOffsetX + col * CELL_WIDTH + halfLine,
      row * CELL_HEIGHT + halfLine,
      CELL_WIDTH,
      CELL_HEIGHT
    );
  }

  if (phrasesGridSearchInput.value.trim()) {
    ctx.beginPath();
    ctx.moveTo(gridWidth - WORDS_GRID_HEADER_WIDTH + halfLine, halfLine);
    ctx.lineTo(gridWidth - halfLine, halfLine);
    ctx.stroke();
  }

  const progressByUnit = PHRASE_UNITS.map(function (_, unitIndex) {
    return JSON.parse(
      localStorage.getItem(getPhraseProgressKeyForUnit(unitIndex)) || '{}'
    );
  });

  for (let visiblePosition = 0; visiblePosition < visibleItems.length; visiblePosition++) {
    const item = visibleItems[visiblePosition];
    const row = Math.floor(visiblePosition / currentPhraseGridColumnCount);
    const col = visiblePosition % currentPhraseGridColumnCount;
    const progress = progressByUnit[item.unitIndex][String(item.index)] || 0;
    const barX = currentPhraseGridContentOffsetX + col * CELL_WIDTH + CELL_WIDTH / 2 - PROGRESS_BAR_WIDTH / 2 + halfLine;
    const barY = row * CELL_HEIGHT + CELL_HEIGHT / 2
      - PROGRESS_BAR_HEIGHT / 2 + halfLine - PROGRESS_BAR_Y_OFFSET;

    if (progress >= 6) {
      ctx.fillStyle = COMPLETED_CELL_COLOR;
      ctx.fillRect(
        currentPhraseGridContentOffsetX + col * CELL_WIDTH + LINE_THICKNESS,
        row * CELL_HEIGHT + LINE_THICKNESS,
        CELL_WIDTH - LINE_THICKNESS,
        CELL_HEIGHT - LINE_THICKNESS
      );
    }

    ctx.fillStyle = PROGRESS_BAR_COLOR;
    ctx.beginPath();
    ctx.roundRect(barX, barY, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
    ctx.fill();

    if (progress > 0) {
      const fillWidth = Math.min(progress, 6) / 6 * PROGRESS_BAR_WIDTH;
      ctx.fillStyle = PROGRESS_FILL_COLOR;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillWidth, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
      ctx.fill();
    }
  }

  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let visiblePosition = 0; visiblePosition < visibleItems.length; visiblePosition++) {
    const item = visibleItems[visiblePosition];
    const row = Math.floor(visiblePosition / currentPhraseGridColumnCount);
    const col = visiblePosition % currentPhraseGridColumnCount;
    const centerX = currentPhraseGridContentOffsetX + col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - CHAR_Y_OFFSET;
    setFittedCanvasFont(
      ctx,
      PHRASE_UNITS[item.unitIndex].phrases[item.index],
      PHRASE_FONT_SIZE,
      PHRASE_MIN_FONT_SIZE,
      '"DFFangSong", serif',
      CELL_WIDTH - PHRASE_TEXT_HORIZONTAL_PADDING * 2
    );
    ctx.fillText(PHRASE_UNITS[item.unitIndex].phrases[item.index], centerX, centerY);
  }

  for (let visiblePosition = 0; visiblePosition < visibleItems.length; visiblePosition++) {
    const item = visibleItems[visiblePosition];
    const row = Math.floor(visiblePosition / currentPhraseGridColumnCount);
    const col = visiblePosition % currentPhraseGridColumnCount;
    const centerX = currentPhraseGridContentOffsetX + col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - PINYIN_Y_OFFSET;
    setFittedCanvasFont(
      ctx,
      PHRASE_UNITS[item.unitIndex].pinyin[item.index],
      PINYIN_FONT_SIZE,
      13,
      '"Times New Roman", serif',
      CELL_WIDTH - PHRASE_TEXT_HORIZONTAL_PADDING * 2
    );
    ctx.fillText(PHRASE_UNITS[item.unitIndex].pinyin[item.index], centerX, centerY);
  }
}

function positionHeaderControls() {
  const siteTitle = document.getElementById('siteTitle');
  const titleC = document.getElementById('siteTitleC');
  const titleN = document.getElementById('siteTitleN');
  const titleReader = document.getElementById('siteTitleReader');
  const contentModeToggle = document.getElementById('contentModeToggle');

  siteTitle.style.left = '50%';
  siteTitle.style.top = SITE_TITLE_TOP_GAP + 'px';
  siteTitle.style.transform = 'translateX(-50%)';
  siteTitle.style.fontFamily = '"Times New Roman", serif';
  siteTitle.style.fontSize = SITE_TITLE_FONT_SIZE + 'px';
  siteTitle.style.lineHeight = '1';

  titleC.style.color = SITE_TITLE_RED_COLOR;
  titleN.style.color = SITE_TITLE_YELLOW_COLOR;
  titleReader.style.color = SITE_TITLE_BLACK_COLOR;

  contentModeToggle.style.top = (
    SITE_TITLE_TOP_GAP
    + SITE_TITLE_FONT_SIZE
    + CONTENT_MODE_TOGGLE_LOGO_GAP
  ) + 'px';
  contentModeToggle.style.width = CONTENT_MODE_TOGGLE_WIDTH + 'px';
  contentModeToggle.style.height = CONTENT_MODE_TOGGLE_HEIGHT + 'px';
  contentModeToggle.style.fontSize = CONTENT_MODE_TOGGLE_FONT_SIZE + 'px';
  contentModeToggle.style.borderRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';
}

positionHeaderControls();

function positionWordsGridHeaderOutline(gridLeft, gridWidth) {
  positionGridHeaderOutline(document.getElementById('wordsGridHeaderOutline'), gridLeft, gridWidth);
}

function getGridXpHeaderWidth(xp) {
  const digitCount = String(Math.max(0, Math.floor(Number(xp) || 0))).length;
  return Math.max(
    GRID_XP_MIN_WIDTH,
    digitCount * GRID_XP_DIGIT_WIDTH + GRID_XP_LABEL_WIDTH + GRID_XP_HORIZONTAL_PADDING * 2
  );
}

function getCurrentGridXpValue() {
  const xpSystem = window.CHINESE_READER_XP;
  return xpSystem && typeof xpSystem.getTotalXp === 'function'
    ? xpSystem.getTotalXp(localStorage)
    : 0;
}

function getDisplayedGridXpValue() {
  return displayedGridXpValue === null
    ? getCurrentGridXpValue()
    : displayedGridXpValue;
}

function renderGridXpValue(xp) {
  const outline = document.getElementById('gridXpOutline');
  const gridXpValue = document.getElementById('gridXpValue');
  const wholeXp = Math.max(0, Math.floor(Number(xp) || 0));

  gridXpValue.textContent = String(wholeXp) + ' XP';
  outline.style.width = getGridXpHeaderWidth(wholeXp) + 'px';
}

function positionGridXpOutline(gridLeft) {
  const outline = document.getElementById('gridXpOutline');
  const xp = getDisplayedGridXpValue();
  const toggleTop = SITE_TITLE_TOP_GAP
    + SITE_TITLE_FONT_SIZE
    + CONTENT_MODE_TOGGLE_LOGO_GAP;

  renderGridXpValue(xp);
  outline.style.left = gridLeft + 'px';
  outline.style.top = toggleTop + 'px';
  outline.style.height = (TOP_GAP - toggleTop) + 'px';
  outline.style.borderWidth = LINE_THICKNESS + 'px';
  outline.style.borderBottomWidth = '0px';
  outline.style.borderTopLeftRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';
  outline.style.borderTopRightRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';
}

function startPendingGridXpAnimation() {
  const xpSystem = window.CHINESE_READER_XP;
  if (
    !xpSystem
    || typeof xpSystem.takeXpAnimationStart !== 'function'
    || typeof xpSystem.getXpAnimationDuration !== 'function'
    || typeof xpSystem.getXpAnimationValue !== 'function'
  ) return;

  const finalXp = getCurrentGridXpValue();
  const startingXp = xpSystem.takeXpAnimationStart(localStorage, finalXp);
  if (startingXp === null) return;

  const duration = xpSystem.getXpAnimationDuration(startingXp, finalXp);
  if (duration <= 0) return;

  displayedGridXpValue = startingXp;
  renderGridXpValue(startingXp);
  let startTime = null;

  function animateXp(timestamp) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    displayedGridXpValue = xpSystem.getXpAnimationValue(
      startingXp,
      finalXp,
      elapsed,
      duration
    );
    renderGridXpValue(displayedGridXpValue);

    if (displayedGridXpValue < finalXp) {
      gridXpAnimationFrame = requestAnimationFrame(animateXp);
    } else {
      displayedGridXpValue = null;
      gridXpAnimationFrame = null;
      renderGridXpValue(finalXp);
    }
  }

  if (gridXpAnimationFrame !== null) cancelAnimationFrame(gridXpAnimationFrame);
  gridXpAnimationFrame = requestAnimationFrame(animateXp);
}

function positionGridHeaderOutline(outline, gridLeft, gridWidth) {
  const toggleTop = SITE_TITLE_TOP_GAP
    + SITE_TITLE_FONT_SIZE
    + CONTENT_MODE_TOGGLE_LOGO_GAP;

  outline.style.left = (gridLeft + gridWidth - WORDS_GRID_HEADER_WIDTH) + 'px';
  outline.style.top = toggleTop + 'px';
  outline.style.width = WORDS_GRID_HEADER_WIDTH + 'px';
  outline.style.height = (TOP_GAP - toggleTop) + 'px';
  outline.style.borderWidth = LINE_THICKNESS + 'px';
  outline.style.borderBottomWidth = '0px';
  outline.style.borderTopLeftRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';
  outline.style.borderTopRightRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';
}

// Switch between the word grid, phrases view, and reading excerpt.
const contentModeToggle = document.getElementById('contentModeToggle');
const contentModeButtons = Array.from(contentModeToggle.querySelectorAll('[data-content-mode]'));
const requestedContentMode = new URLSearchParams(window.location.search).get('view');
let currentContentMode = ['words', 'phrases', 'reading'].includes(requestedContentMode)
  ? requestedContentMode
  : 'words';

function redrawWordsGridForSearch() {
  if (currentContentMode === 'words') drawGrid();
}

function redrawPhrasesGridForSearch() {
  if (currentContentMode === 'phrases') drawPhrasesGrid();
}

function clearWordsGridSearch() {
  if (!wordsGridSearchInput.value) return;
  wordsGridSearchInput.value = '';
  redrawWordsGridForSearch();
}

function clearPhrasesGridSearch() {
  if (!phrasesGridSearchInput.value) return;
  phrasesGridSearchInput.value = '';
  redrawPhrasesGridForSearch();
}

setupWordsGridPinyinAccents(wordsGridSearchInput);
setupWordsGridPinyinAccents(phrasesGridSearchInput);

wordsGridHeaderOutline.addEventListener('pointerdown', function (event) {
  if (event.target === wordsGridSearchInput) return;
  event.preventDefault();
  wordsGridSearchInput.focus();
});

phrasesGridHeaderOutline.addEventListener('pointerdown', function (event) {
  if (event.target === phrasesGridSearchInput) return;
  event.preventDefault();
  phrasesGridSearchInput.focus();
});

wordsGridSearchInput.addEventListener('compositionstart', function () {
  wordsGridSearchComposing = true;
});

wordsGridSearchInput.addEventListener('compositionend', function () {
  wordsGridSearchComposing = false;
  redrawWordsGridForSearch();
});

wordsGridSearchInput.addEventListener('input', function () {
  if (!wordsGridSearchComposing) redrawWordsGridForSearch();
});

phrasesGridSearchInput.addEventListener('compositionstart', function () {
  phrasesGridSearchComposing = true;
});

phrasesGridSearchInput.addEventListener('compositionend', function () {
  phrasesGridSearchComposing = false;
  redrawPhrasesGridForSearch();
});

phrasesGridSearchInput.addEventListener('input', function () {
  if (!phrasesGridSearchComposing) redrawPhrasesGridForSearch();
});

wordsGridSearchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    wordsGridSearchInput.blur();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    event.stopPropagation();
  }
});

phrasesGridSearchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    phrasesGridSearchInput.blur();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    event.stopPropagation();
  }
});

wordsGridSearchInput.addEventListener('blur', function () {
  const preserveSearchForGridCell = Boolean(
    pendingWordsGridPointerSelection
    && pendingWordsGridPointerSelection.searchWasActive
    && pendingWordsGridPointerSelection.cell
  );

  // Capture whether this blur came from a result cell before the click handler
  // consumes the pending pointer selection.
  window.setTimeout(function () {
    if (document.activeElement === wordsGridSearchInput) return;
    if (preserveSearchForGridCell) return;
    clearWordsGridSearch();
  }, 0);
});

phrasesGridSearchInput.addEventListener('blur', function () {
  const preserveSearchForGridCell = Boolean(
    pendingPhrasesGridPointerSelection
    && pendingPhrasesGridPointerSelection.searchWasActive
    && pendingPhrasesGridPointerSelection.cell
  );

  window.setTimeout(function () {
    if (document.activeElement === phrasesGridSearchInput) return;
    if (preserveSearchForGridCell) return;
    clearPhrasesGridSearch();
  }, 0);
});

document.getElementById('gridCanvas').addEventListener('pointerdown', function (event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const cell = getGridCellAtCanvasPoint(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  pendingWordsGridPointerSelection = {
    searchWasActive: Boolean(wordsGridSearchInput.value.trim()),
    cell: cell ? {
      unitIndex: cell.unitIndex,
      index: cell.index,
      row: cell.row,
      col: cell.col,
      centerX: rect.left + currentGridContentOffsetX + (cell.col + 0.5) * CELL_WIDTH,
      centerY: rect.top + (cell.row + 0.5) * CELL_HEIGHT,
    } : null,
  };
});

document.getElementById('phrasesGridCanvas').addEventListener('pointerdown', function (event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const cell = getPhraseGridCellAtCanvasPoint(
    event.clientX - rect.left,
    event.clientY - rect.top
  );

  pendingPhrasesGridPointerSelection = {
    searchWasActive: Boolean(phrasesGridSearchInput.value.trim()),
    cell: cell ? {
      unitIndex: cell.unitIndex,
      index: cell.index,
      row: cell.row,
      col: cell.col,
      centerX: rect.left + currentPhraseGridContentOffsetX
        + (cell.col + 0.5) * CELL_WIDTH,
      centerY: rect.top + (cell.row + 0.5) * CELL_HEIGHT,
    } : null,
  };
});

// Once a result-cell click has intentionally blurred the search input, keep
// later result-cell and definition-popup interactions from clearing it. Other
// clicks outside the search controls retain the normal reset behavior.
document.addEventListener('pointerdown', function (event) {
  if (!wordsGridSearchInput.value || document.activeElement === wordsGridSearchInput) return;
  if (wordsGridHeaderOutline.contains(event.target)) return;

  const popupOverlayElement = document.getElementById('popupOverlay');
  if (
    popupOverlayElement
    && popupOverlayElement.style.display === 'flex'
    && popupOverlayElement.contains(event.target)
  ) return;

  const gridCanvasElement = document.getElementById('gridCanvas');
  if (event.target === gridCanvasElement) {
    const rect = gridCanvasElement.getBoundingClientRect();
    const cell = getGridCellAtCanvasPoint(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    if (cell) return;
  }

  clearWordsGridSearch();
});

document.addEventListener('pointerdown', function (event) {
  if (!phrasesGridSearchInput.value || document.activeElement === phrasesGridSearchInput) return;
  if (phrasesGridHeaderOutline.contains(event.target)) return;

  const popupOverlayElement = document.getElementById('popupOverlay');
  if (
    popupOverlayElement
    && popupOverlayElement.style.display === 'flex'
    && popupOverlayElement.contains(event.target)
  ) return;

  const phrasesGridCanvasElement = document.getElementById('phrasesGridCanvas');
  if (event.target === phrasesGridCanvasElement) {
    const rect = phrasesGridCanvasElement.getBoundingClientRect();
    const cell = getPhraseGridCellAtCanvasPoint(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    if (cell) return;
  }

  clearPhrasesGridSearch();
});

function updateContentModeToggle() {
  const wordsModeSelected = currentContentMode === 'words';
  const phrasesModeSelected = currentContentMode === 'phrases';
  const readingModeSelected = currentContentMode === 'reading';
  const quizModeSelected = wordsModeSelected || phrasesModeSelected;
  contentModeToggle.classList.toggle('phrases-selected', phrasesModeSelected);
  contentModeToggle.classList.toggle('reading-selected', readingModeSelected);
  contentModeButtons.forEach(function (button) {
    const selected = button.dataset.contentMode === currentContentMode;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  const gridCanvas = document.getElementById('gridCanvas');
  const phrasesGridCanvas = document.getElementById('phrasesGridCanvas');
  const readingContent = document.getElementById('readingContent');
  const gridXpOutline = document.getElementById('gridXpOutline');
  const wordsGridHeaderOutline = document.getElementById('wordsGridHeaderOutline');
  const phrasesGridHeaderOutline = document.getElementById('phrasesGridHeaderOutline');
  const startButtonElement = document.getElementById('startButton');
  const plusButtonElement = document.getElementById('plusButton');
  const navButtonsElement = document.getElementById('navButtons');
  const circleCanvasElement = document.getElementById('circleCanvas');
  gridCanvas.style.display = wordsModeSelected ? 'block' : 'none';
  gridXpOutline.style.display = quizModeSelected ? 'flex' : 'none';
  wordsGridHeaderOutline.style.display = wordsModeSelected ? 'flex' : 'none';
  phrasesGridHeaderOutline.style.display = phrasesModeSelected ? 'flex' : 'none';
  phrasesGridCanvas.style.display = phrasesModeSelected ? 'block' : 'none';
  readingContent.style.display = readingModeSelected ? 'block' : 'none';
  startButtonElement.style.display = quizModeSelected ? 'flex' : 'none';
  plusButtonElement.style.display = quizModeSelected ? 'flex' : 'none';
  navButtonsElement.style.display = quizModeSelected ? 'flex' : 'none';
  circleCanvasElement.style.display = quizModeSelected ? 'block' : 'none';

  if (readingModeSelected) {
    positionReadingContent();
    syncReadingSelectionOutline();
  } else {
    clearCustomReadingSelection();
    if (wordsModeSelected) drawGrid();
    if (phrasesModeSelected) drawPhrasesGrid();
  }

  if (quizModeSelected) startPendingGridXpAnimation();
}

function positionReadingContent() {
  const readingContent = document.getElementById('readingContent');
  const readingCornerOutline = document.getElementById('readingCornerOutline');
  readingContent.style.marginTop = TOP_GAP + 'px';
  readingContent.style.fontSize = READING_FONT_SIZE + 'px';
  readingContent.style.lineHeight = (READING_FONT_SIZE + READING_LINE_GAP) + 'px';
  readingContent.style.paddingLeft = READING_SIDE_PADDING + 'px';
  readingContent.style.paddingRight = READING_SIDE_PADDING + 'px';
  readingContent.style.paddingBottom = READING_BOTTOM_PADDING + 'px';

  readingCornerOutline.style.width = READING_CORNER_OUTLINE_WIDTH + 'px';
  readingCornerOutline.style.height = READING_CORNER_OUTLINE_HEIGHT + 'px';
  readingCornerOutline.style.borderLeftWidth = READING_CORNER_OUTLINE_THICKNESS + 'px';
  readingCornerOutline.style.borderRightWidth = READING_CORNER_OUTLINE_THICKNESS + 'px';
  readingCornerOutline.style.borderBottomWidth = READING_CORNER_OUTLINE_THICKNESS + 'px';
  readingCornerOutline.style.borderBottomLeftRadius = READING_CORNER_OUTLINE_RADIUS + 'px';
  readingCornerOutline.style.borderBottomRightRadius = '0px';
  readingCornerOutline.style.animationDuration = READING_CORNER_OUTLINE_ANIMATION_DURATION + 's';
  readingCornerOutline.style.borderColor = 'black';
}

// The excerpt is packaged as a script asset because browsers block fetch()
// between neighboring files when index.html is opened directly via file://.
const readingContent = document.getElementById('readingContent');
const readingHanziDictionary = window.READING_HANZI_DICTIONARY || {};
const readingPanelContent = document.getElementById('readingPanelContent');
const readingSinglePanel = document.getElementById('readingSinglePanel');
const readingSingleCharacter = document.getElementById('readingSingleCharacter');
const readingSinglePinyin = document.getElementById('readingSinglePinyin');
const readingSingleDefinition = document.getElementById('readingSingleDefinition');
const readingPhrasePanel = document.getElementById('readingPhrasePanel');
const readingPhrasePreview = document.getElementById('readingPhrasePreview');
const readingPhrasePinyin = document.getElementById('readingPhrasePinyin');
const readingPhraseEnglish = document.getElementById('readingPhraseEnglish');
const readingCharacterElements = [];
const readingPhraseTranslationCache = new Map();
let readingTranslatorPromise = null;
let readingTranslatorReady = false;
let readingTranslatorProgressHandler = null;
let customReadingSelectionStart = -1;
let customReadingSelectionEnd = -1;
let readingPanelRequestVersion = 0;
let readingPointerId = null;
let readingPointerButton = -1;
let readingPointerStartIndex = -1;
let readingPointerStartX = 0;
let readingPointerStartY = 0;
let readingPointerDragging = false;
let suppressNextReadingClick = false;

function renderReadingExcerpt(text) {
  const fragment = document.createDocumentFragment();
  readingCharacterElements.length = 0;

  Array.from(text).forEach(function (character, index) {
    const characterElement = document.createElement('span');
    characterElement.className = 'reading-character';
    characterElement.dataset.readingIndex = String(index);
    characterElement.textContent = character;
    readingCharacterElements.push(characterElement);
    fragment.appendChild(characterElement);
  });

  readingContent.replaceChildren(fragment);
}

renderReadingExcerpt(
  typeof window.CH1_EXTRACTED_TEXT === 'string'
    ? window.CH1_EXTRACTED_TEXT
    : 'Unable to load the reading excerpt.'
);

function getCustomReadingSelectionText() {
  if (customReadingSelectionStart < 0) return '';
  return readingCharacterElements
    .slice(customReadingSelectionStart, customReadingSelectionEnd + 1)
    .map(function (element) { return element.textContent; })
    .join('');
}

function getReadingPinyin(text) {
  const tokens = Array.from(text).map(function (character) {
    const entry = readingHanziDictionary[character];
    if (entry && entry.pinyin && entry.pinyin.length) return entry.pinyin[0];
    if (/\s/u.test(character)) return ' ';
    return character;
  });

  return tokens.join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;!?，。！？；：、])/g, '$1')
    .replace(/([“‘（(])\s+/g, '$1')
    .trim();
}

function getReadingTranslator(onProgress) {
  readingTranslatorProgressHandler = onProgress;

  if (!readingTranslatorPromise) {
    readingTranslatorPromise = import(TRANSFORMERS_JS_MODULE_URL)
      .then(function (transformers) {
        // Models are fetched once, then Transformers.js keeps them in the
        // browser cache for later translations without an API or quota.
        transformers.env.allowLocalModels = false;
        transformers.env.useBrowserCache = true;

        return transformers.pipeline('translation', READING_TRANSLATION_MODEL, {
          dtype: READING_TRANSLATION_DTYPE,
          progress_callback: function (progress) {
            if (readingTranslatorProgressHandler) {
              readingTranslatorProgressHandler(progress);
            }
          },
        });
      })
      .then(function (translator) {
        readingTranslatorReady = true;
        return translator;
      })
      .catch(function (error) {
        readingTranslatorPromise = null;
        readingTranslatorReady = false;
        throw error;
      });
  }

  return readingTranslatorPromise;
}

function requestLocalPhraseTranslation(phrase, onProgress) {
  if (readingPhraseTranslationCache.has(phrase)) {
    return readingPhraseTranslationCache.get(phrase);
  }

  const request = getReadingTranslator(onProgress).then(function (translator) {
    return translator(phrase);
  }).then(function (result) {
    const translation = result && result[0] && result[0].translation_text;
    if (!translation) throw new Error('The local model returned no translation.');
    return translation;
  }).catch(function (error) {
    readingPhraseTranslationCache.delete(phrase);
    throw error;
  });

  readingPhraseTranslationCache.set(phrase, request);
  return request;
}

function preloadReadingTranslator() {
  getReadingTranslator(null).catch(function (error) {
    // Preloading is optional. A later phrase selection will retry and show
    // the normal user-facing message if the model is still unavailable.
    console.warn('Local translation model preload failed:', error);
  });
}

// Start downloading and initializing the model as a separate browser task,
// after this script has finished setting up the visible page.
window.setTimeout(preloadReadingTranslator, READING_TRANSLATION_PRELOAD_DELAY);

function resizeReadingSelectionPanel() {
  const outline = document.getElementById('readingCornerOutline');
  if (outline.style.display === 'none') return;

  const maximumHeight = Math.max(
    READING_CORNER_OUTLINE_HEIGHT,
    Math.min(READING_CORNER_OUTLINE_MAX_HEIGHT, window.innerHeight)
  );

  outline.style.height = READING_CORNER_OUTLINE_HEIGHT + 'px';
  readingPanelContent.style.overflowY = 'hidden';
  const requiredHeight = readingPanelContent.scrollHeight
    + READING_CORNER_OUTLINE_THICKNESS;
  const targetHeight = Math.min(
    maximumHeight,
    Math.max(READING_CORNER_OUTLINE_HEIGHT, requiredHeight)
  );

  outline.style.height = targetHeight + 'px';
  readingPanelContent.style.overflowY = requiredHeight > targetHeight ? 'auto' : 'hidden';
}

function updateReadingSelectionPanel(requestTranslation) {
  const selectedText = getCustomReadingSelectionText();
  if (!selectedText) return;

  const requestVersion = ++readingPanelRequestVersion;
  const characters = Array.from(selectedText);
  readingPanelContent.scrollTop = 0;

  if (characters.length === 1) {
    const character = characters[0];
    const entry = readingHanziDictionary[character];
    readingSinglePanel.style.display = 'block';
    readingPhrasePanel.style.display = 'none';
    readingSingleCharacter.textContent = character;
    readingSinglePinyin.textContent = entry && entry.pinyin && entry.pinyin.length
      ? entry.pinyin.join(', ')
      : 'Pinyin unavailable';
    readingSingleDefinition.textContent = entry && entry.definition
      ? entry.definition
      : 'Definition unavailable';
    return;
  }

  const phrase = selectedText.trim();
  readingSinglePanel.style.display = 'none';
  readingPhrasePanel.style.display = 'flex';
  readingPhrasePreview.textContent = selectedText;
  readingPhrasePinyin.textContent = getReadingPinyin(selectedText);

  if (!requestTranslation) {
    readingPhraseEnglish.textContent = 'Release the selection to translate.';
    return;
  }

  readingPhraseEnglish.textContent = readingTranslatorReady
    ? 'Translating locally…'
    : 'Loading the local translation model… This first download may take a minute.';
  resizeReadingSelectionPanel();

  requestLocalPhraseTranslation(phrase, function (progress) {
    if (
      requestVersion !== readingPanelRequestVersion
      || phrase !== getCustomReadingSelectionText().trim()
    ) return;

    if (progress && progress.status === 'ready') {
      readingPhraseEnglish.textContent = 'Translating locally…';
      resizeReadingSelectionPanel();
    }
  }).then(function (translation) {
    if (
      requestVersion !== readingPanelRequestVersion
      || phrase !== getCustomReadingSelectionText().trim()
    ) return;
    readingPhraseEnglish.textContent = translation;
    resizeReadingSelectionPanel();
  }).catch(function (error) {
    if (requestVersion !== readingPanelRequestVersion) return;
    console.error('Local phrase translation failed:', error);
    readingPhraseEnglish.textContent = 'Translation unavailable. Connect to the internet once to download the local model, then try again.';
    resizeReadingSelectionPanel();
  });
}

function hideReadingSelectionOutline() {
  const outline = document.getElementById('readingCornerOutline');
  outline.classList.remove('reading-corner-visible');
  outline.style.display = 'none';
}

function clearCustomReadingSelection() {
  readingPanelRequestVersion++;
  if (customReadingSelectionStart >= 0) {
    for (let i = customReadingSelectionStart; i <= customReadingSelectionEnd; i++) {
      readingCharacterElements[i].classList.remove('reading-character-selected');
    }
  }

  customReadingSelectionStart = -1;
  customReadingSelectionEnd = -1;
  readingPanelContent.style.overflowY = 'hidden';
  hideReadingSelectionOutline();
}

function setCustomReadingSelection(firstIndex, lastIndex) {
  const nextStart = Math.max(0, Math.min(firstIndex, lastIndex));
  const nextEnd = Math.min(
    readingCharacterElements.length - 1,
    Math.max(firstIndex, lastIndex)
  );

  if (customReadingSelectionStart >= 0) {
    for (let i = customReadingSelectionStart; i <= customReadingSelectionEnd; i++) {
      if (i < nextStart || i > nextEnd) {
        readingCharacterElements[i].classList.remove('reading-character-selected');
      }
    }
  }

  for (let i = nextStart; i <= nextEnd; i++) {
    if (
      customReadingSelectionStart < 0
      || i < customReadingSelectionStart
      || i > customReadingSelectionEnd
    ) {
      readingCharacterElements[i].classList.add('reading-character-selected');
    }
  }

  customReadingSelectionStart = nextStart;
  customReadingSelectionEnd = nextEnd;
  updateReadingSelectionPanel(false);
  syncReadingSelectionOutline();
}

function syncReadingSelectionOutline() {
  if (
    currentContentMode !== 'reading'
    || customReadingSelectionStart < 0
    || customReadingSelectionEnd < customReadingSelectionStart
  ) {
    hideReadingSelectionOutline();
    return;
  }

  const range = document.createRange();
  range.setStartBefore(readingCharacterElements[customReadingSelectionStart]);
  range.setEndAfter(readingCharacterElements[customReadingSelectionEnd]);
  const selectionRect = range.getBoundingClientRect();
  if (selectionRect.width === 0 && selectionRect.height === 0) {
    hideReadingSelectionOutline();
    return;
  }

  const outline = document.getElementById('readingCornerOutline');
  const selectionCenterX = selectionRect.left + selectionRect.width / 2;
  const selectionIsOnRight = selectionCenterX >= window.innerWidth / 2;
  const outlineWasOnLeft = outline.classList.contains('reading-corner-left');
  const outlineWasVisible = outline.classList.contains('reading-corner-visible');
  const outlineSideChanged = outlineWasOnLeft !== selectionIsOnRight;

  // The outline appears opposite the selected text.
  outline.classList.toggle('reading-corner-left', selectionIsOnRight);
  outline.style.borderBottomLeftRadius = selectionIsOnRight
    ? '0px'
    : READING_CORNER_OUTLINE_RADIUS + 'px';
  outline.style.borderBottomRightRadius = selectionIsOnRight
    ? READING_CORNER_OUTLINE_RADIUS + 'px'
    : '0px';
  outline.style.display = 'block';
  resizeReadingSelectionPanel();

  if (!outlineWasVisible || outlineSideChanged) {
    outline.classList.remove('reading-corner-visible');
    void outline.offsetWidth;
    outline.classList.add('reading-corner-visible');
  }
}

function getReadingCharacterElement(target) {
  if (!(target instanceof Element)) return null;
  const characterElement = target.closest('.reading-character');
  if (!characterElement || !readingContent.contains(characterElement)) return null;
  return characterElement;
}

function getReadingCharacterIndexAtPoint(clientX, clientY) {
  const pointTarget = document.elementFromPoint(clientX, clientY);
  const characterElement = getReadingCharacterElement(pointTarget);
  return characterElement ? Number(characterElement.dataset.readingIndex) : -1;
}

readingContent.addEventListener('pointerdown', function (event) {
  if (event.button !== 0 && event.button !== 2) return;
  const characterElement = getReadingCharacterElement(event.target);
  if (!characterElement) return;

  if (event.button === 2) event.preventDefault();
  readingPointerId = event.pointerId;
  readingPointerButton = event.button;
  readingPointerStartIndex = Number(characterElement.dataset.readingIndex);
  readingPointerStartX = event.clientX;
  readingPointerStartY = event.clientY;
  readingPointerDragging = false;
});

document.addEventListener('pointermove', function (event) {
  if (event.pointerId !== readingPointerId || readingPointerStartIndex < 0) return;

  if (readingPointerButton === 2) event.preventDefault();

  const distance = Math.hypot(
    event.clientX - readingPointerStartX,
    event.clientY - readingPointerStartY
  );
  if (!readingPointerDragging && distance < READING_SELECTION_DRAG_THRESHOLD) return;

  readingPointerDragging = true;
  const currentIndex = getReadingCharacterIndexAtPoint(event.clientX, event.clientY);
  if (currentIndex >= 0) {
    setCustomReadingSelection(readingPointerStartIndex, currentIndex);
  }
});

document.addEventListener('pointerup', function (event) {
  if (event.pointerId !== readingPointerId) return;

  if (readingPointerDragging) {
    suppressNextReadingClick = true;
    updateReadingSelectionPanel(true);
    resizeReadingSelectionPanel();
    setTimeout(function () {
      suppressNextReadingClick = false;
    }, 0);
  } else if (readingPointerButton === 2) {
    const characterElement = readingCharacterElements[readingPointerStartIndex];
    if (characterElement && !/^\s$/u.test(characterElement.textContent)) {
      setCustomReadingSelection(readingPointerStartIndex, readingPointerStartIndex);
    }
  }

  readingPointerId = null;
  readingPointerButton = -1;
  readingPointerStartIndex = -1;
  readingPointerDragging = false;
});

document.addEventListener('pointercancel', function (event) {
  if (event.pointerId !== readingPointerId) return;
  readingPointerId = null;
  readingPointerButton = -1;
  readingPointerStartIndex = -1;
  readingPointerDragging = false;
});

readingContent.addEventListener('click', function () {
  if (suppressNextReadingClick) {
    suppressNextReadingClick = false;
    return;
  }
  clearCustomReadingSelection();
});

readingContent.addEventListener('dblclick', function (event) {
  const characterElement = getReadingCharacterElement(event.target);
  if (!characterElement || /^\s$/u.test(characterElement.textContent)) return;

  event.preventDefault();
  setCustomReadingSelection(
    Number(characterElement.dataset.readingIndex),
    Number(characterElement.dataset.readingIndex)
  );
});

readingContent.addEventListener('dragstart', function (event) {
  event.preventDefault();
});

readingContent.addEventListener('selectstart', function (event) {
  event.preventDefault();
});

readingContent.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});

document.addEventListener('pointerdown', function (event) {
  const outline = document.getElementById('readingCornerOutline');
  if (
    currentContentMode === 'reading'
    && !readingContent.contains(event.target)
    && !outline.contains(event.target)
  ) {
    clearCustomReadingSelection();
  }
});

contentModeToggle.addEventListener('click', function (event) {
  const selectedButton = event.target.closest('[data-content-mode]');
  if (!selectedButton || !contentModeToggle.contains(selectedButton)) return;
  const selectedMode = selectedButton.dataset.contentMode;
  if (selectedMode === currentContentMode) return;
  currentContentMode = selectedMode;
  const modeUrl = new URL(window.location.href);
  if (currentContentMode === 'words') {
    modeUrl.searchParams.delete('view');
  } else {
    modeUrl.searchParams.set('view', currentContentMode);
  }
  window.history.replaceState(null, '', modeUrl);
  updateContentModeToggle();
  updateNavButtons();
  resetCircleHoverState();
  if (circleState !== 'hidden') redrawCircle();
});

contentModeToggle.addEventListener('keydown', function (event) {
  // Keep keyboard activation on a tab from reaching the page-wide Enter
  // shortcut that starts a quiz.
  if (event.key === 'Enter' || event.key === ' ') {
    event.stopPropagation();
    return;
  }

  const currentButtonIndex = contentModeButtons.indexOf(event.target);
  if (currentButtonIndex < 0) return;

  let nextButtonIndex = -1;
  if (event.key === 'ArrowLeft') {
    nextButtonIndex = (currentButtonIndex - 1 + contentModeButtons.length) % contentModeButtons.length;
  } else if (event.key === 'ArrowRight') {
    nextButtonIndex = (currentButtonIndex + 1) % contentModeButtons.length;
  } else if (event.key === 'Home') {
    nextButtonIndex = 0;
  } else if (event.key === 'End') {
    nextButtonIndex = contentModeButtons.length - 1;
  }

  if (nextButtonIndex >= 0) {
    event.preventDefault();
    event.stopPropagation();
    contentModeButtons[nextButtonIndex].click();
    contentModeButtons[nextButtonIndex].focus();
  }
});

document.body.style.paddingBottom = BOTTOM_SCROLL_PADDING + 'px';
updateContentModeToggle();

// Apply start button dimensions
const startButton = document.getElementById('startButton');
startButton.style.width = BUTTON_WIDTH + 'px';
startButton.style.height = BUTTON_HEIGHT + 'px';
startButton.style.fontSize = BUTTON_FONT_SIZE + 'px';
startButton.style.transition = 'width ' + HOVER_TRANSITION_DURATION + 's, height ' + HOVER_TRANSITION_DURATION + 's';
startButton.style.borderTopLeftRadius = BUTTON_TOP_LEFT_RADIUS + 'px';
startButton.style.boxShadow = '-4px -4px ' + BUTTON_SHADOW_SIZE + 'px rgba(0, 0, 0, 0.3)';

const hoverScale = 1 + HOVER_SCALE_PERCENT / 100;

startButton.addEventListener('mouseenter', function () {
  startButton.style.width = (BUTTON_WIDTH * hoverScale) + 'px';
  startButton.style.height = (BUTTON_HEIGHT * hoverScale) + 'px';
});

startButton.addEventListener('mouseleave', function () {
  startButton.style.width = BUTTON_WIDTH + 'px';
  startButton.style.height = BUTTON_HEIGHT + 'px';
});

startButton.addEventListener('click', function () {
  window.location.href = currentContentMode === 'phrases'
    ? 'phrase-quiz.html'
    : 'quiz.html';
});

// Apply plus button dimensions (square, same height as start button)
const plusButton = document.getElementById('plusButton');
plusButton.style.width = PLUS_BUTTON_SIDE + 'px';
plusButton.style.height = PLUS_BUTTON_SIDE + 'px';
plusButton.style.fontSize = PLUS_BUTTON_SIGN_SIZE + 'px';
plusButton.style.transition = 'width ' + HOVER_TRANSITION_DURATION + 's, height ' + HOVER_TRANSITION_DURATION + 's';
plusButton.style.borderTopRightRadius = PLUS_BUTTON_CORNER_RADIUS + 'px';
plusButton.style.boxShadow = '4px -4px ' + BUTTON_SHADOW_SIZE + 'px rgba(0, 0, 0, 0.3)';

plusButton.addEventListener('mouseenter', function () {
  plusButton.style.width = (PLUS_BUTTON_SIDE * hoverScale) + 'px';
  plusButton.style.height = (PLUS_BUTTON_SIDE * hoverScale) + 'px';
});

plusButton.addEventListener('mouseleave', function () {
  plusButton.style.width = PLUS_BUTTON_SIDE + 'px';
  plusButton.style.height = PLUS_BUTTON_SIDE + 'px';
});

plusButton.addEventListener('click', function () {
  toggleCircle();
});

// ── Circle animation (quarter-circle in the bottom-left corner) ──
// The circle's center is the bottom-left corner of the screen.
// Angle convention: 0 = right along +x, PI/2 = down, PI = left, -PI/2 = up.
// The quarter-circle occupies angles from PI (left edge) down/clockwise to -PI/2 (bottom edge).
// On SHOW: the wedge rotates clockwise, sweeping from PI to -PI/2 (like a rainbow forming).
// On HIDE: the wedge stays at its final angle while the radius shrinks to 0.

const circleCanvas = document.getElementById('circleCanvas');
const circleCtx = circleCanvas.getContext('2d');

let circleState = 'hidden';   // 'hidden' | 'shown' | 'showing' | 'hiding'
let circleAnimStart = 0;

function resizeCircleCanvas() {
  const dpr = window.devicePixelRatio || 1;
  circleCanvas.width = CIRCLE_RADIUS * dpr;
  circleCanvas.height = CIRCLE_RADIUS * dpr;
  circleCanvas.style.width = CIRCLE_RADIUS + 'px';
  circleCanvas.style.height = CIRCLE_RADIUS + 'px';
  // Canvas origin (0,0) is top-left; flip Y so drawing (0,0) is the
  // bottom-left of the canvas (= bottom-left corner of the screen).
  // All drawing done in CSS-pixel units; the dpr transform handles sharpness.
  circleCtx.setTransform(dpr, 0, 0, -dpr, 0, CIRCLE_RADIUS * dpr);
}
resizeCircleCanvas();

// ── Color interpolation helper ──
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return '#' + ((1 << 24) | (rr << 16) | (rg << 8) | rb).toString(16).slice(1);
}

function getCircleMenuSections() {
  const contentQuery = '?content=' + (currentContentMode === 'phrases' ? 'phrases' : 'words');
  if (currentContentMode === 'phrases') {
    return [
      {
        startAngle: Math.PI / 2,
        endAngle: Math.PI / 3,
        lines: ['Review'],
        href: 'review.html' + contentQuery,
      },
      {
        startAngle: Math.PI / 3,
        endAngle: Math.PI / 6,
        lines: ['Custom', 'Test'],
        href: 'custom-test.html' + contentQuery,
      },
      {
        startAngle: Math.PI / 6,
        endAngle: 0,
        lines: ['Writing', 'Worksheet'],
        href: 'select.html?view=phrases&fresh=1',
      },
    ];
  }

  return [
    {
      startAngle: Math.PI / 2,
      endAngle: Math.PI / 3,
      lines: ['Review'],
      href: 'review.html' + contentQuery,
    },
    {
      startAngle: Math.PI / 3,
      endAngle: Math.PI / 6,
      lines: ['Custom', 'Test'],
      href: 'custom-test.html' + contentQuery,
    },
    {
      startAngle: Math.PI / 6,
      endAngle: 0,
      lines: ['Writing', 'Worksheet'],
      href: 'select.html?view=words&fresh=1',
    },
  ];
}

function getCircleMenuSectionAt(angle) {
  return getCircleMenuSections().findIndex(function (section) {
    return angle >= section.endAngle && angle <= section.startAngle;
  });
}

// ── Hover state ──
let hoveredCircleSection = -1;
const circleSectionHoverT = [0, 0, 0];       // 0 → 1 animated
let lastHoverTime = 0, hoverAnimRunning = false;

function resetCircleHoverState() {
  hoveredCircleSection = -1;
  for (let index = 0; index < circleSectionHoverT.length; index++) {
    circleSectionHoverT[index] = 0;
  }
}

// ── Current circle state (stored so hover redraws can use it) ──
let currentCircleRadius = 0;
let currentCircleEndAngle = 0;

function redrawCircle() {
  drawCircleWedge(currentCircleRadius, currentCircleEndAngle);
}

// ── Hover animation loop ──
function hoverAnimFrame(ts) {
  if (lastHoverTime === 0) lastHoverTime = ts;
  const dt = Math.min((ts - lastHoverTime) / 1000, 0.1);
  lastHoverTime = ts;

  const speed = 1 / CIRCLE_HOVER_ANIM_DURATION;
  let continueAnimating = false;
  for (let index = 0; index < circleSectionHoverT.length; index++) {
    const isHovered = index === hoveredCircleSection;
    circleSectionHoverT[index] += (isHovered ? speed : -speed) * dt;
    circleSectionHoverT[index] = Math.max(0, Math.min(1, circleSectionHoverT[index]));
    if ((isHovered && circleSectionHoverT[index] < 1)
      || (!isHovered && circleSectionHoverT[index] > 0)) {
      continueAnimating = true;
    }
  }

  redrawCircle();

  if (continueAnimating) {
    requestAnimationFrame(hoverAnimFrame);
  } else {
    hoverAnimRunning = false;
  }
}

function startHoverAnim() {
  if (!hoverAnimRunning) {
    hoverAnimRunning = true;
    lastHoverTime = 0;
    requestAnimationFrame(hoverAnimFrame);
  }
}

// ── Hover detection ──
circleCanvas.addEventListener('mousemove', function (e) {
  const rect = circleCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  // Convert screen pixels (top-left origin) to drawing coords (bottom-left origin).
  const drawX = mx;
  const drawY = CIRCLE_RADIUS - my;
  const dist = Math.sqrt(drawX * drawX + drawY * drawY);
  const angle = Math.atan2(drawY, drawX);

  const previousSection = hoveredCircleSection;
  hoveredCircleSection = dist <= CIRCLE_RADIUS
    ? getCircleMenuSectionAt(angle)
    : -1;

  if (hoveredCircleSection !== previousSection) {
    startHoverAnim();
  }
});

circleCanvas.addEventListener('mouseleave', function () {
  if (hoveredCircleSection !== -1) {
    hoveredCircleSection = -1;
    startHoverAnim();
  }
});

// ── Click handler for sections ──
circleCanvas.addEventListener('click', function (e) {
  const rect = circleCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const drawX = mx;
  const drawY = CIRCLE_RADIUS - my;
  const dist = Math.sqrt(drawX * drawX + drawY * drawY);
  const angle = Math.atan2(drawY, drawX);

  if (dist > CIRCLE_RADIUS) return;
  const sectionIndex = getCircleMenuSectionAt(angle);
  const section = getCircleMenuSections()[sectionIndex];
  if (section) window.location.href = section.href;
});

// startAngle=PI/2 (up along left edge), endAngle=0 (right along bottom edge).
// In drawing coords (x-right, y-up): drawing from PI/2 to 0 with anticlockwise=true
// produces a wedge that grows in the visible first quadrant (up & right of corner).
const CIRCLE_SHOW_START_ANGLE = Math.PI / 2;
const CIRCLE_SHOW_END_ANGLE = 0;

function drawCircleWedge(radius, endAngle) {
  // Clear with identity transform so clearRect spans the full canvas.
  circleCtx.save();
  circleCtx.setTransform(1, 0, 0, 1, 0, 0);
  circleCtx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
  circleCtx.restore();
  if (radius <= 0) return;

  const sections = getCircleMenuSections();
  sections.forEach(function (section, index) {
    const visibleEnd = Math.max(endAngle, section.endAngle);
    if (visibleEnd >= section.startAngle) return;

    circleCtx.beginPath();
    circleCtx.moveTo(0, 0);
    circleCtx.arc(0, 0, radius, section.startAngle, visibleEnd, true);
    circleCtx.closePath();
    circleCtx.fillStyle = lerpColor(
      CIRCLE_COLOR,
      CIRCLE_HOVER_COLOR,
      circleSectionHoverT[index]
    );
    circleCtx.fill();
  });

  sections.slice(0, -1).forEach(function (section) {
    const separatorAngle = section.endAngle;
    circleCtx.beginPath();
    circleCtx.moveTo(0, 0);
    circleCtx.lineTo(
      radius * Math.cos(separatorAngle),
      radius * Math.sin(separatorAngle)
    );
    circleCtx.strokeStyle = 'black';
    circleCtx.lineWidth = CIRCLE_LINE_THICKNESS;
    circleCtx.stroke();
  });

  // Section texts — rotate about the circle center as the wedge sweeps in.
  const t = (CIRCLE_SHOW_START_ANGLE - endAngle) / (CIRCLE_SHOW_START_ANGLE - CIRCLE_SHOW_END_ANGLE);
  sections.forEach(function (section, index) {
    const targetAngle = (section.startAngle + section.endAngle) / 2;
    const animatedAngle = Math.PI / 2 - (Math.PI / 2 - targetAngle) * t;
    const fontSize = CIRCLE_TEXT_FONT_SIZE
      + CIRCLE_TEXT_HOVER_SIZE_INCREASE * circleSectionHoverT[index];
    drawSectionText(
      radius,
      animatedAngle,
      animatedAngle - targetAngle,
      fontSize,
      section.lines
    );
  });
}

// Draw two lines of text at the center of a wedge section.
function drawSectionText(radius, sectionAngle, rotation, fontSize, lines) {
  const dist = radius * CIRCLE_TEXT_RADIAL_OFFSET;
  const cx = dist * Math.cos(sectionAngle);
  const cy = dist * Math.sin(sectionAngle);

  circleCtx.save();
  circleCtx.translate(cx, cy);
  circleCtx.rotate(rotation);
  circleCtx.scale(1, -1);  // undo the global Y-flip so text is right-side-up
  circleCtx.font = fontSize + "px 'Times New Roman', serif";
  circleCtx.fillStyle = 'black';
  circleCtx.textAlign = 'center';
  circleCtx.textBaseline = 'middle';

  const lineHeight = fontSize * 1.3;
  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = -totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    circleCtx.fillText(lines[i], 0, startY + i * lineHeight);
  }

  circleCtx.restore();
}

function circleAnimFrame(ts) {
  if (circleState === 'showing') {
    const elapsed = (ts - circleAnimStart) / 1000;
    const t = Math.min(elapsed / CIRCLE_SHOW_DURATION, 1);
    currentCircleEndAngle = CIRCLE_SHOW_START_ANGLE +
      (CIRCLE_SHOW_END_ANGLE - CIRCLE_SHOW_START_ANGLE) * t;
    currentCircleRadius = CIRCLE_RADIUS;
    drawCircleWedge(currentCircleRadius, currentCircleEndAngle);
    if (t < 1) {
      requestAnimationFrame(circleAnimFrame);
    } else {
      circleState = 'shown';
    }
  } else if (circleState === 'hiding') {
    const elapsed = (ts - circleAnimStart) / 1000;
    const t = Math.min(elapsed / CIRCLE_HIDE_DURATION, 1);
    currentCircleRadius = CIRCLE_RADIUS * (1 - t);
    currentCircleEndAngle = CIRCLE_SHOW_END_ANGLE;
    drawCircleWedge(currentCircleRadius, currentCircleEndAngle);
    if (t < 1) {
      requestAnimationFrame(circleAnimFrame);
    } else {
      circleState = 'hidden';
      circleCanvas.style.pointerEvents = 'none';
      circleCanvas.style.cursor = 'default';
      // Reset hover state.
      resetCircleHoverState();
      // Final clear using identity transform.
      circleCtx.save();
      circleCtx.setTransform(1, 0, 0, 1, 0, 0);
      circleCtx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
      circleCtx.restore();
    }
  }
}

function toggleCircle() {
  const now = performance.now();
  if (circleState === 'hidden' || circleState === 'hiding') {
    circleState = 'showing';
    circleAnimStart = now;
    circleCanvas.style.pointerEvents = 'auto';
    circleCanvas.style.cursor = 'pointer';
    requestAnimationFrame(circleAnimFrame);
  } else if (circleState === 'shown' || circleState === 'showing') {
    circleState = 'hiding';
    circleAnimStart = now;
    requestAnimationFrame(circleAnimFrame);
  }
}

// Apply nav button styles
const navButtonsContainer = document.getElementById('navButtons');
navButtonsContainer.style.top = NAV_BUTTON_TOP_GAP + 'px';
navButtonsContainer.style.right = NAV_BUTTON_RIGHT_GAP + 'px';
navButtonsContainer.style.gap = NAV_BUTTON_GAP + 'px';

const navLeft = document.getElementById('navLeft');
const navRight = document.getElementById('navRight');
[navLeft, navRight].forEach(function (btn) {
  btn.style.width = NAV_BUTTON_WIDTH + 'px';
  btn.style.height = NAV_BUTTON_HEIGHT + 'px';
  btn.style.fontSize = NAV_ARROW_SIZE + 'px';
});

function getVisibleUnitNavigationState() {
  if (currentContentMode === 'phrases') {
    return {
      unit: getCurrentPhraseUnit(),
      unitCount: PHRASE_UNITS.length,
    };
  }
  return {
    unit: getCurrentUnit(),
    unitCount: UNIT_DATA.length,
  };
}

// Update nav button states for the visible word or phrase unit.
function updateNavButtons() {
  const navigation = getVisibleUnitNavigationState();
  const atFirst = navigation.unit === 0;
  const atLast = navigation.unit >= navigation.unitCount - 1;
  navLeft.style.opacity = atFirst ? '0.3' : '1';
  navLeft.style.cursor = atFirst ? 'default' : 'pointer';
  navRight.style.opacity = atLast ? '0.3' : '1';
  navRight.style.cursor = atLast ? 'default' : 'pointer';
}

navLeft.addEventListener('click', function () {
  const navigation = getVisibleUnitNavigationState();
  const unit = navigation.unit;
  if (unit > 0) {
    if (currentContentMode === 'phrases') {
      setCurrentPhraseUnit(unit - 1);
      drawPhrasesGrid();
    } else {
      setCurrentUnit(unit - 1);
      drawGrid();
    }
    updateNavButtons();
  }
});

navRight.addEventListener('click', function () {
  const navigation = getVisibleUnitNavigationState();
  const unit = navigation.unit;
  if (unit < navigation.unitCount - 1) {
    if (currentContentMode === 'phrases') {
      setCurrentPhraseUnit(unit + 1);
      drawPhrasesGrid();
    } else {
      setCurrentUnit(unit + 1);
      drawGrid();
    }
    updateNavButtons();
  }
});

updateNavButtons();

// Redraw on resize (centering may change)
window.addEventListener('resize', function () {
  if (currentContentMode === 'reading') {
    positionReadingContent();
    syncReadingSelectionOutline();
  } else if (currentContentMode === 'words') {
    drawGrid();
  } else if (currentContentMode === 'phrases') {
    drawPhrasesGrid();
  }
});

// ── Dev Controls: Shift+Click/Drag to complete cells ──
const DEV_COMPLETE_ENABLED = true;
{
  const gridCanvas = document.getElementById('gridCanvas');
  let isDragging = false;

  function cellFromEvent(e) {
    const rect = gridCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cell = getGridCellAtCanvasPoint(mx, my);
    return cell;
  }

  function completeCell(cell) {
    const progressKey = getProgressKeyForUnit(cell.unitIndex);
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    const key = String(cell.index);
    if ((progress[key] || 0) >= 6) {
      // Already completed: remove progress entirely (treat as never seen)
      delete progress[key];
    } else {
      progress[key] = 6;
    }
    localStorage.setItem(progressKey, JSON.stringify(progress));
    drawGrid();
  }

  gridCanvas.addEventListener('mousedown', function (e) {
    if (!DEV_COMPLETE_ENABLED || !e.shiftKey) return;
    isDragging = true;
    const cell = cellFromEvent(e);
    if (cell) completeCell(cell);
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging || !e.shiftKey) return;
    const cell = cellFromEvent(e);
    if (cell) completeCell(cell);
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
  });
}

// ── Popup Logic ──
const popupOverlay = document.getElementById('popupOverlay');
const popupWindow = document.getElementById('popupWindow');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const popupChar = document.getElementById('popupChar');
const popupPinyin = document.getElementById('popupPinyin');
const popupDefinition = document.getElementById('popupDefinition');
const popupExamples = document.getElementById('popupExamples');

// Apply popup config
popupWindow.style.width = POPUP_WIDTH + 'px';
popupWindow.style.height = POPUP_HEIGHT + 'px';
popupWindow.style.border = POPUP_OUTLINE_THICKNESS + 'px solid black';

// X button position: gap from top and right edges
const xBtnTop = POPUP_X_BUTTON_TOP_GAP;
const xBtnLeft = POPUP_WIDTH - POPUP_OUTLINE_THICKNESS - POPUP_X_BUTTON_RIGHT_GAP - POPUP_X_BUTTON_SIDE;
popupCloseBtn.style.left = xBtnLeft + 'px';
popupCloseBtn.style.top = xBtnTop + 'px';
popupCloseBtn.style.width = POPUP_X_BUTTON_SIDE + 'px';
popupCloseBtn.style.height = POPUP_X_BUTTON_SIDE + 'px';
popupCloseBtn.style.fontSize = POPUP_X_SIGN_SIZE + 'px';

// Character position: gap from left and top edges (accounting for border)
const charLeft = POPUP_CHAR_EDGE_GAP - POPUP_OUTLINE_THICKNESS;
const charTop = POPUP_CHAR_EDGE_GAP - POPUP_OUTLINE_THICKNESS;
popupChar.style.left = charLeft + 'px';
popupChar.style.top = charTop + 'px';
popupChar.style.fontSize = POPUP_CHAR_FONT_SIZE + 'px';

// Pinyin position: centered below the character
const pinyinLeft = charLeft + POPUP_CHAR_FONT_SIZE / 2;
const pinyinTop = charTop + POPUP_CHAR_FONT_SIZE + POPUP_PINYIN_GAP;
popupPinyin.style.left = pinyinLeft + 'px';
popupPinyin.style.top = pinyinTop + 'px';
popupPinyin.style.fontSize = POPUP_PINYIN_FONT_SIZE + 'px';
popupPinyin.style.transform = 'translateX(-50%)';

// Definition position: below pinyin
const definitionLeft = POPUP_DEFINITION_LEFT_GAP - POPUP_OUTLINE_THICKNESS;
const definitionTop = pinyinTop + POPUP_PINYIN_FONT_SIZE + POPUP_DEFINITION_GAP;
popupDefinition.style.left = definitionLeft + 'px';
popupDefinition.style.top = definitionTop + 'px';
popupDefinition.style.fontSize = POPUP_DEFINITION_FONT_SIZE + 'px';

// Examples position: below definition, same font and left position
const examplesTop = definitionTop + POPUP_DEFINITION_FONT_SIZE + POPUP_EXAMPLES_GAP;
popupExamples.style.left = definitionLeft + 'px';
popupExamples.style.top = examplesTop + 'px';
popupExamples.style.fontSize = POPUP_DEFINITION_FONT_SIZE + 'px';

// Skip button position: bottom right with gap
const popupSkipBtn = document.getElementById('popupSkipBtn');
const skipBtnRight = POPUP_SKIP_BTN_GAP;
const skipBtnBottom = POPUP_SKIP_BTN_GAP;
popupSkipBtn.style.right = skipBtnRight + 'px';
popupSkipBtn.style.bottom = skipBtnBottom + 'px';
popupSkipBtn.style.width = POPUP_SKIP_BTN_WIDTH + 'px';
popupSkipBtn.style.height = POPUP_SKIP_BTN_HEIGHT + 'px';
popupSkipBtn.style.fontSize = POPUP_SKIP_BTN_FONT_SIZE + 'px';

// ── Skip Popup Logic ──
const skipPopupOverlay = document.getElementById('skipPopupOverlay');
const skipPopupWindow = document.getElementById('skipPopupWindow');

// Apply skip popup dimensions
skipPopupWindow.style.width = SKIP_POPUP_WIDTH + 'px';
skipPopupWindow.style.height = SKIP_POPUP_HEIGHT + 'px';
skipPopupWindow.style.border = POPUP_OUTLINE_THICKNESS + 'px solid black';

// Position skip popup text: centered horizontally, top gap from top
const skipPopupText = document.getElementById('skipPopupText');
skipPopupText.style.left = '0px';
skipPopupText.style.top = SKIP_POPUP_TEXT_TOP_GAP + 'px';
skipPopupText.style.width = SKIP_POPUP_WIDTH + 'px';
skipPopupText.style.fontSize = SKIP_POPUP_TEXT_FONT_SIZE + 'px';

// Position skip popup buttons: equidistant from center
const skipPopupYesBtn = document.getElementById('skipPopupYesBtn');
const skipPopupNoBtn = document.getElementById('skipPopupNoBtn');
const halfGap = SKIP_POPUP_BTN_GAP / 2;
const skipPopupCenterX = SKIP_POPUP_WIDTH / 2;

// Yes button: to the left of center
skipPopupYesBtn.style.left = (skipPopupCenterX - halfGap - SKIP_POPUP_BTN_WIDTH) + 'px';
skipPopupYesBtn.style.top = SKIP_POPUP_BTN_HEIGHT + 'px';
skipPopupYesBtn.style.width = SKIP_POPUP_BTN_WIDTH + 'px';
skipPopupYesBtn.style.height = SKIP_POPUP_BTN_DIM_H + 'px';
skipPopupYesBtn.style.fontSize = SKIP_POPUP_BTN_FONT_SIZE + 'px';

// No button: to the right of center
skipPopupNoBtn.style.left = (skipPopupCenterX + halfGap) + 'px';
skipPopupNoBtn.style.top = SKIP_POPUP_BTN_HEIGHT + 'px';
skipPopupNoBtn.style.width = SKIP_POPUP_BTN_WIDTH + 'px';
skipPopupNoBtn.style.height = SKIP_POPUP_BTN_DIM_H + 'px';
skipPopupNoBtn.style.fontSize = SKIP_POPUP_BTN_FONT_SIZE + 'px';

// Open skip popup with zoom-in animation
var skipPopupAnimRAF = null;

function openSkipPopup() {
  if (skipPopupAnimRAF) {
    cancelAnimationFrame(skipPopupAnimRAF);
    skipPopupAnimRAF = null;
  }

  skipPopupOverlay.style.display = 'flex';

  var startTime = null;
  var duration = POPUP_OPEN_ANIM_DURATION * 1000;

  function animateOpen(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var t = Math.min(elapsed / duration, 1);

    // Scale from 0 to 1
    var scale = t;

    skipPopupWindow.style.transform = 'scale(' + scale + ')';

    if (t < 1) {
      skipPopupAnimRAF = requestAnimationFrame(animateOpen);
    } else {
      skipPopupWindow.style.transform = '';
      skipPopupAnimRAF = null;
    }
  }

  skipPopupAnimRAF = requestAnimationFrame(animateOpen);
}

// Skip button click handler
popupSkipBtn.addEventListener('click', function () {
  openSkipPopup();
});

// No button closes the skip popup
skipPopupNoBtn.addEventListener('click', function () {
  skipPopupOverlay.style.display = 'none';
});

// Yes button: start the skip quiz
skipPopupYesBtn.addEventListener('click', function () {
  var target = popupSkipBtn._skipTargetGlobal;
  if (typeof target === 'number') {
    if (popupSkipBtn._skipMode === 'phrases') {
      localStorage.setItem('phraseSkipQuizTarget', String(target));
      localStorage.setItem('phraseSkipQuizActive', '1');
      window.location.href = 'phrase-quiz.html';
    } else {
      localStorage.setItem('skipQuizTarget', String(target));
      localStorage.setItem('skipQuizActive', '1');
      window.location.href = 'quiz.html';
    }
  }
});

// Close skip popup when clicking outside
skipPopupOverlay.addEventListener('click', function (e) {
  if (e.target === skipPopupOverlay) {
    skipPopupOverlay.style.display = 'none';
  }
});

// Close popup with zoom-out animation
var popupAnimRAF = null;

function closePopup() {
  if (popupAnimRAF) {
    cancelAnimationFrame(popupAnimRAF);
    popupAnimRAF = null;
  }

  var startTime = null;
  var duration = POPUP_CLOSE_ANIM_DURATION * 1000;

  function animateClose(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var t = Math.min(elapsed / duration, 1);

    // Scale from 1 down to 0
    var scale = 1 - t;

    // Blur reduces from full to 0
    var blur = POPUP_BLUR_AMOUNT * (1 - t);

    popupWindow.style.transform = 'scale(' + scale + ')';
    popupOverlay.style.backdropFilter = 'blur(' + blur + 'px)';
    popupOverlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';

    if (t < 1) {
      popupAnimRAF = requestAnimationFrame(animateClose);
    } else {
      popupOverlay.style.display = 'none';
      popupWindow.style.transform = '';
      popupOverlay.style.backdropFilter = '';
      popupOverlay.style.webkitBackdropFilter = '';
      popupAnimRAF = null;
    }
  }

  popupAnimRAF = requestAnimationFrame(animateClose);
}

popupCloseBtn.addEventListener('click', closePopup);

// Close popup on Esc key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && popupOverlay.style.display === 'flex') {
    closePopup();
  }
});

// Start the quiz for the selected grid on Enter when no popup is open.
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'Enter'
    && (currentContentMode === 'words' || currentContentMode === 'phrases')
    && popupOverlay.style.display !== 'flex'
  ) {
    window.location.href = currentContentMode === 'phrases'
      ? 'phrase-quiz.html'
      : 'quiz.html';
  }
});

// Close popup when clicking outside the window
popupOverlay.addEventListener('click', function (e) {
  if (e.target === popupOverlay) {
    closePopup();
  }
});

function openPopupFromCell(cellCenterX, cellCenterY) {
  if (popupAnimRAF) {
    cancelAnimationFrame(popupAnimRAF);
    popupAnimRAF = null;
  }

  popupOverlay.style.display = 'flex';

  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;
  const startOffsetX = cellCenterX - screenCenterX;
  const startOffsetY = cellCenterY - screenCenterY;
  let startTime = null;
  const duration = POPUP_OPEN_ANIM_DURATION * 1000;

  function animateOpen(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const t = Math.min(elapsed / duration, 1);
    const scale = t;
    const offsetX = startOffsetX * (1 - t);
    const offsetY = startOffsetY * (1 - t);
    const blur = POPUP_BLUR_AMOUNT * t;

    popupWindow.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';
    popupOverlay.style.backdropFilter = 'blur(' + blur + 'px)';
    popupOverlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';

    if (t < 1) {
      popupAnimRAF = requestAnimationFrame(animateOpen);
    } else {
      popupWindow.style.transform = '';
      popupAnimRAF = null;
    }
  }

  popupAnimRAF = requestAnimationFrame(animateOpen);
}

// Open popup on cell click with zoom-in animation
gridCanvas.addEventListener('click', function (e) {
  if (e.shiftKey) {
    pendingWordsGridPointerSelection = null;
    return; // don't interfere with dev controls
  }

  var rect = gridCanvas.getBoundingClientRect();
  var mx = e.clientX - rect.left;
  var my = e.clientY - rect.top;
  var pointerSelection = pendingWordsGridPointerSelection;
  pendingWordsGridPointerSelection = null;
  var selectedCell = pointerSelection && pointerSelection.searchWasActive
    ? pointerSelection.cell
    : getGridCellAtCanvasPoint(mx, my);
  if (!selectedCell) return;
  var col = selectedCell.col;
  var row = selectedCell.row;
  var idx = selectedCell.index;
  var selectedUnitIndex = selectedCell.unitIndex;
  var selectedUnitData = UNIT_DATA[selectedUnitIndex];

  popupChar.style.fontSize = POPUP_CHAR_FONT_SIZE + 'px';
  popupPinyin.style.left = pinyinLeft + 'px';
  popupChar.textContent = selectedUnitData.characters[idx];
  popupPinyin.textContent = selectedUnitData.pinyin[idx];
  popupDefinition.textContent = selectedUnitData.definitions[idx];
  popupExamples.style.display = 'block';
  popupExamples.innerHTML = selectedUnitData.examples[idx].join('<br>');

  // Show the skip button once 50 new words, including the target, are available.
  // Find the latest global index with any progress entry across all units
  var latestSeenGlobal = -1;
  var goff = 0;
  for (var u = 0; u < UNIT_DATA.length; u++) {
    var key = u === 0 ? 'charProgress' : 'charProgress_' + u;
    var unitProgress = JSON.parse(localStorage.getItem(key) || '{}');
    for (var k in unitProgress) {
      if (unitProgress.hasOwnProperty(k) && (Number(unitProgress[k]) || 0) > 0) {
        var globalIdx = goff + parseInt(k, 10);
        if (globalIdx > latestSeenGlobal) {
          latestSeenGlobal = globalIdx;
        }
      }
    }
    goff += UNIT_DATA[u].characters.length;
  }
  // Calculate the current unit's starting global index using actual character counts
  var currentUnit = selectedUnitIndex;
  if (isNaN(currentUnit)) currentUnit = 0;
  var currentUnitOffset = 0;
  for (var u = 0; u < currentUnit; u++) {
    currentUnitOffset += UNIT_DATA[u].characters.length;
  }
  var selectedGlobalIndex = currentUnitOffset + idx;
  var showSkip = SKIP_LOGIC.canOfferSkipTarget(
    selectedGlobalIndex,
    latestSeenGlobal,
    goff
  );
  popupSkipBtn.style.display = showSkip ? 'flex' : 'none';
  // Store the global target index for the Yes button handler
  if (showSkip) {
    popupSkipBtn._skipTargetGlobal = selectedGlobalIndex;
    popupSkipBtn._skipMode = 'words';
  }

  // Center of clicked cell in viewport coordinates
  var cellCenterX = pointerSelection && pointerSelection.searchWasActive
    ? selectedCell.centerX
    : rect.left + currentGridContentOffsetX + (col + 0.5) * CELL_WIDTH;
  var cellCenterY = pointerSelection && pointerSelection.searchWasActive
    ? selectedCell.centerY
    : rect.top + (row + 0.5) * CELL_HEIGHT;

  openPopupFromCell(cellCenterX, cellCenterY);
});

// Phrase popups use the same window geometry, animation, and skip control as
// word popups, without examples.
const phrasesGridCanvas = document.getElementById('phrasesGridCanvas');
phrasesGridCanvas.addEventListener('click', function (event) {
  const rect = phrasesGridCanvas.getBoundingClientRect();
  const pointerSelection = pendingPhrasesGridPointerSelection;
  pendingPhrasesGridPointerSelection = null;
  const selectedCell = pointerSelection && pointerSelection.searchWasActive
    ? pointerSelection.cell
    : getPhraseGridCellAtCanvasPoint(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  if (!selectedCell) return;

  const index = selectedCell.index;
  const selectedUnitIndex = selectedCell.unitIndex;
  const selectedUnitData = PHRASE_UNITS[selectedUnitIndex];
  const phrase = selectedUnitData.phrases[index];
  const phraseCharacterCount = Array.from(phrase).length;
  popupChar.style.fontSize = POPUP_CHAR_FONT_SIZE + 'px';
  popupPinyin.style.left = (
    charLeft + phraseCharacterCount * POPUP_CHAR_FONT_SIZE / 2
  ) + 'px';
  popupChar.textContent = phrase;
  popupPinyin.textContent = selectedUnitData.pinyin[index];
  popupDefinition.textContent = selectedUnitData.definitions[index];
  popupExamples.textContent = '';
  popupExamples.style.display = 'none';

  let latestSeenGlobal = -1;
  let globalOffset = 0;
  PHRASE_UNITS.forEach(function (unit, unitIndex) {
    const key = getPhraseProgressKeyForUnit(unitIndex);
    const unitProgress = JSON.parse(localStorage.getItem(key) || '{}');
    Object.keys(unitProgress).forEach(function (localIndex) {
      if ((Number(unitProgress[localIndex]) || 0) <= 0) return;
      const globalIndex = globalOffset + parseInt(localIndex, 10);
      if (globalIndex > latestSeenGlobal) latestSeenGlobal = globalIndex;
    });
    globalOffset += unit.phrases.length;
  });

  let selectedUnitOffset = 0;
  for (let unitIndex = 0; unitIndex < selectedUnitIndex; unitIndex++) {
    selectedUnitOffset += PHRASE_UNITS[unitIndex].phrases.length;
  }
  const selectedGlobalIndex = selectedUnitOffset + index;
  const showSkip = SKIP_LOGIC.canOfferSkipTarget(
    selectedGlobalIndex,
    latestSeenGlobal,
    globalOffset
  );
  popupSkipBtn.style.display = showSkip ? 'flex' : 'none';
  if (showSkip) {
    popupSkipBtn._skipTargetGlobal = selectedGlobalIndex;
    popupSkipBtn._skipMode = 'phrases';
  }

  openPopupFromCell(
    pointerSelection && pointerSelection.searchWasActive
      ? selectedCell.centerX
      : rect.left + currentPhraseGridContentOffsetX
        + (selectedCell.col + 0.5) * CELL_WIDTH,
    pointerSelection && pointerSelection.searchWasActive
      ? selectedCell.centerY
      : rect.top + (selectedCell.row + 0.5) * CELL_HEIGHT
  );
});
