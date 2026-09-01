const isCustomTest = window.location.pathname.includes('custom-test');
const isWorksheetSelectionPage = !isCustomTest;

// ── Header Layout Configuration ──
const SITE_TITLE_FONT_SIZE = 42;
const SITE_TITLE_TOP_GAP = 38;
const CONTENT_MODE_TOGGLE_WIDTH = 360;
const CONTENT_MODE_TOGGLE_HEIGHT = 30;
const CONTENT_MODE_TOGGLE_FONT_SIZE = 17;
const CONTENT_MODE_TOGGLE_BORDER_RADIUS = 6;
const CONTENT_MODE_TOGGLE_LOGO_GAP = 16;
const CONTENT_MODE_TOGGLE_GRID_GAP = 10;

// ── Grid Configuration ──
const ROWS = 10;
const COLS = 10;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 140;
const LINE_THICKNESS = 2;
const TOP_GAP = isWorksheetSelectionPage
  ? SITE_TITLE_TOP_GAP
    + SITE_TITLE_FONT_SIZE
    + CONTENT_MODE_TOGGLE_LOGO_GAP
    + CONTENT_MODE_TOGGLE_HEIGHT
    + CONTENT_MODE_TOGGLE_GRID_GAP
  : 120;
const BOTTOM_SCROLL_PADDING = 80; // extra scroll space below grid so Continue button doesn't cover content

// ── Site Title Configuration ──
const SITE_TITLE_RED_COLOR = '#e71717';
const SITE_TITLE_YELLOW_COLOR = '#f2c230';
const SITE_TITLE_BLACK_COLOR = '#000000';

// ── Character Configuration ──
const FONT_SIZE = 48;
const CHAR_Y_OFFSET = 30; // 0 = centered, positive = higher, negative = lower

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

// ── Button Configuration (shared with index) ──
const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 75;
const BUTTON_FONT_SIZE = 30;
const HOVER_SCALE_PERCENT = 10; // percent increase on hover
const HOVER_TRANSITION_DURATION = 0.2; // seconds
const BUTTON_TOP_LEFT_RADIUS = 15;
const BUTTON_SHADOW_SIZE = 6;

// ── Selection Mode Configuration ──
const SELECTION_COLOR = '#d0e4f7';                 // light blue background for selected cells
const SELECTION_BAR_WIDTH = 300;                   // width of the black selection bar (px)
const SELECTION_BAR_HEIGHT = 60;                   // height of the black selection bar (px)
const SELECTION_PROMPT_FONT_SIZE = 24;             // font size for "Please select characters"

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

// ── Shared Unit Data ──
const selectionParams = new URLSearchParams(window.location.search);
const requestedWorksheetContent = selectionParams.get('view')
  || selectionParams.get('content')
  || localStorage.getItem('worksheetSelectionContent');
let isPhraseSelection = isCustomTest
  ? selectionParams.get('content') === 'phrases'
  : requestedWorksheetContent === 'phrases';
const WORD_UNIT_DATA = window.CHINESE_READER_UNIT_DATA;
const PHRASE_UNIT_DATA = window.CHINESE_READER_PHRASE_UNITS;
const PHRASE_SELECTION_UNIT_DATA = Array.isArray(PHRASE_UNIT_DATA)
  ? PHRASE_UNIT_DATA.map(function (unit) {
    return {
      characters: unit.phrases,
      pinyin: unit.pinyin,
      definitions: unit.definitions,
      examples: unit.phrases.map(function () { return []; }),
    };
  })
  : [];
let UNIT_DATA = isPhraseSelection
  ? PHRASE_SELECTION_UNIT_DATA
  : WORD_UNIT_DATA;

if (!Array.isArray(WORD_UNIT_DATA) || WORD_UNIT_DATA.length === 0
  || !Array.isArray(PHRASE_SELECTION_UNIT_DATA) || PHRASE_SELECTION_UNIT_DATA.length === 0) {
  throw new Error('Expected shared Chinese word and phrase unit data.');
}

function getCurrentUnit() {
  const data = localStorage.getItem(
    isPhraseSelection ? 'phraseCurrentUnit' : 'currentUnit'
  );
  const unit = data ? parseInt(data, 10) : 0;
  return Number.isInteger(unit) && unit >= 0 && unit < UNIT_DATA.length ? unit : 0;
}

function setCurrentUnit(unit) {
  localStorage.setItem(
    isPhraseSelection ? 'phraseCurrentUnit' : 'currentUnit',
    String(unit)
  );
}

function getCurrentUnitData() {
  return UNIT_DATA[getCurrentUnit()];
}

function getProgressKey() {
  const unit = getCurrentUnit();
  if (isPhraseSelection) {
    return unit === 0 ? 'phraseProgress' : 'phraseProgress_' + unit;
  }
  return unit === 0 ? 'charProgress' : 'charProgress_' + unit;
}

// ── Selection mode state ──
let selectionMode = true; // always in selection mode on this page
const selectedCellsByContent = {
  words: new Set(),
  phrases: new Set(),
};
let selectedCells = selectedCellsByContent[isPhraseSelection ? 'phrases' : 'words'];

function getGlobalSelectionsKey(phraseMode) {
  if (phraseMode) {
    return isCustomTest ? 'phraseCustomTestGlobalPhrases' : 'phraseWorksheetGlobalPhrases';
  }
  return 'worksheetGlobalChars';
}

function getUnitOffset(unit, unitData) {
  const sourceUnits = unitData || UNIT_DATA;
  let offset = 0;
  for (let i = 0; i < unit; i++) {
    offset += sourceUnits[i].characters.length;
  }
  return offset;
}

function getGlobalSelectionIndex(unit, localIndex, unitData) {
  return getUnitOffset(unit, unitData) + localIndex;
}

function getCurrentGlobalSelectionIndex(localIndex) {
  return getGlobalSelectionIndex(getCurrentUnit(), localIndex);
}

function getTotalCharacterCount(unitData) {
  const sourceUnits = unitData || UNIT_DATA;
  return sourceUnits.reduce(function (total, itemUnitData) {
    return total + itemUnitData.characters.length;
  }, 0);
}

function loadStoredGlobalSelections(phraseMode) {
  const sourceUnits = phraseMode ? PHRASE_SELECTION_UNIT_DATA : WORD_UNIT_DATA;
  const targetSelections = selectedCellsByContent[phraseMode ? 'phrases' : 'words'];
  const storedGlobalSelections = localStorage.getItem(getGlobalSelectionsKey(phraseMode));
  let selectedIndices = [];
  targetSelections.clear();

  if (storedGlobalSelections !== null) {
    try {
      const parsed = JSON.parse(storedGlobalSelections);
      if (Array.isArray(parsed)) selectedIndices = parsed;
    } catch (error) {
      selectedIndices = [];
    }
  } else if (!phraseMode) {
    const storedLegacyUnit = parseInt(localStorage.getItem('worksheetUnit') || '0', 10);
    const legacyUnit = Number.isInteger(storedLegacyUnit) &&
      storedLegacyUnit >= 0 &&
      storedLegacyUnit < sourceUnits.length ?
      storedLegacyUnit :
      0;
    try {
      const legacyIndices = JSON.parse(localStorage.getItem('worksheetChars') || '[]');
      if (Array.isArray(legacyIndices)) {
        selectedIndices = legacyIndices.map(function (localIndex) {
          return getGlobalSelectionIndex(legacyUnit, parseInt(localIndex, 10), sourceUnits);
        });
      }
    } catch (error) {
      selectedIndices = [];
    }
  }

  const totalCharacters = getTotalCharacterCount(sourceUnits);
  for (const value of selectedIndices) {
    const globalIndex = parseInt(value, 10);
    if (Number.isInteger(globalIndex) && globalIndex >= 0 && globalIndex < totalCharacters) {
      targetSelections.add(globalIndex);
    }
  }
}

function saveSelectionsForMode(phraseMode) {
  const selections = selectedCellsByContent[phraseMode ? 'phrases' : 'words'];
  const sortedSelections = Array.from(selections).sort(function (a, b) { return a - b; });
  localStorage.setItem(getGlobalSelectionsKey(phraseMode), JSON.stringify(sortedSelections));
  return sortedSelections;
}

function saveActiveSelections() {
  return saveSelectionsForMode(isPhraseSelection);
}

function clearWorksheetSelections() {
  selectedCellsByContent.words.clear();
  selectedCellsByContent.phrases.clear();
  localStorage.setItem('worksheetGlobalChars', '[]');
  localStorage.setItem('phraseWorksheetGlobalPhrases', '[]');
  localStorage.removeItem('worksheetChars');
  localStorage.removeItem('worksheetUnit');
}

// ── Format checkbox state (custom-test only) ──
const customQuizLogic = window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;
const customTestStoragePrefix = isPhraseSelection ? 'phraseCustomTest' : 'worksheet';
const initialFormatSettings = isCustomTest && customQuizLogic
  ? customQuizLogic.readFormatSettings(localStorage, customTestStoragePrefix)
  : { mc: true, typing: true, definition: true, listening: true };
let mcSelected = initialFormatSettings.mc;
let writeSelected = initialFormatSettings.typing;
let definitionSelected = isPhraseSelection && initialFormatSettings.definition;
let listeningSelected = initialFormatSettings.listening;

if (isCustomTest && !isPhraseSelection && !mcSelected && !writeSelected && !listeningSelected) {
  mcSelected = true;
  writeSelected = true;
  listeningSelected = true;
}

if (isCustomTest) {

  customQuizLogic.configureDefinitionControl(
    isPhraseSelection,
    document.getElementById('definitionCheckbox')
  );

  [
    ['mcBox', mcSelected],
    ['writeBox', writeSelected],
    ['definitionBox', definitionSelected],
    ['listeningBox', listeningSelected],
  ].forEach(function (entry) {
    document.getElementById(entry[0]).classList.toggle('unselected', !entry[1]);
  });

  document.getElementById('mcCheckbox').addEventListener('click', function () {
    mcSelected = !mcSelected;
    const box = document.getElementById('mcBox');
    if (mcSelected) {
      box.classList.remove('unselected');
    } else {
      box.classList.add('unselected');
    }
  });

  document.getElementById('writeCheckbox').addEventListener('click', function () {
    writeSelected = !writeSelected;
    const box = document.getElementById('writeBox');
    if (writeSelected) {
      box.classList.remove('unselected');
    } else {
      box.classList.add('unselected');
    }
  });

  document.getElementById('definitionCheckbox').addEventListener('click', function () {
    definitionSelected = !definitionSelected;
    const box = document.getElementById('definitionBox');
    if (definitionSelected) {
      box.classList.remove('unselected');
    } else {
      box.classList.add('unselected');
    }
  });

  document.getElementById('listeningCheckbox').addEventListener('click', function () {
    listeningSelected = !listeningSelected;
    const box = document.getElementById('listeningBox');
    if (listeningSelected) {
      box.classList.remove('unselected');
    } else {
      box.classList.add('unselected');
    }
  });
}

function setFittedSelectionFont(ctx, text, maximumSize, minimumSize, family, maximumWidth) {
  let fontSize = maximumSize;
  ctx.font = fontSize + 'px ' + family;
  const measuredWidth = ctx.measureText(String(text)).width;
  if (measuredWidth > maximumWidth) {
    fontSize = Math.max(minimumSize, Math.floor(fontSize * maximumWidth / measuredWidth));
    ctx.font = fontSize + 'px ' + family;
  }
}

// ── Draw Grid ──
function drawGrid() {
  const unitData = getCurrentUnitData();
  const chars = unitData.characters;
  const pinyin = unitData.pinyin;

  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');

  // Calculate grid dimensions
  const gridWidth = COLS * CELL_WIDTH + LINE_THICKNESS;
  const gridHeight = ROWS * CELL_HEIGHT + LINE_THICKNESS;

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

  // Draw white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  // Draw black grid lines
  ctx.strokeStyle = 'black';
  ctx.lineWidth = LINE_THICKNESS;

  const halfLine = LINE_THICKNESS / 2;

  // Vertical lines
  for (let c = 0; c <= COLS; c++) {
    const x = c * CELL_WIDTH + halfLine;
    ctx.beginPath();
    ctx.moveTo(x, halfLine);
    ctx.lineTo(x, gridHeight - halfLine);
    ctx.stroke();
  }

  // Horizontal lines
  for (let r = 0; r <= ROWS; r++) {
    const y = r * CELL_HEIGHT + halfLine;
    ctx.beginPath();
    ctx.moveTo(halfLine, y);
    ctx.lineTo(gridWidth - halfLine, y);
    ctx.stroke();
  }

  // Read progress from localStorage
  const progress = JSON.parse(localStorage.getItem(getProgressKey()) || '{}');

  // Fill completed cells with light green background
  for (let i = 0; i < chars.length; i++) {
    const charProgress = progress[String(i)] || 0;
    if (charProgress >= 6) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const cellX = col * CELL_WIDTH + LINE_THICKNESS;
      const cellY = row * CELL_HEIGHT + LINE_THICKNESS;
      const cellW = CELL_WIDTH - LINE_THICKNESS;
      const cellH = CELL_HEIGHT - LINE_THICKNESS;
      ctx.fillStyle = COMPLETED_CELL_COLOR;
      ctx.fillRect(cellX, cellY, cellW, cellH);
    }
  }

  // Highlight selected cells (selection mode)
  if (selectionMode) {
    const unitOffset = getUnitOffset(getCurrentUnit());
    for (let localIndex = 0; localIndex < chars.length; localIndex++) {
      if (!selectedCells.has(unitOffset + localIndex)) continue;
      const row = Math.floor(localIndex / COLS);
      const col = localIndex % COLS;
      const cellX = col * CELL_WIDTH + LINE_THICKNESS;
      const cellY = row * CELL_HEIGHT + LINE_THICKNESS;
      const cellW = CELL_WIDTH - LINE_THICKNESS;
      const cellH = CELL_HEIGHT - LINE_THICKNESS;
      ctx.fillStyle = SELECTION_COLOR;
      ctx.fillRect(cellX, cellY, cellW, cellH);
    }
  }

  // Draw progress bars
  for (let i = 0; i < chars.length; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const barX = col * CELL_WIDTH + CELL_WIDTH / 2 - PROGRESS_BAR_WIDTH / 2 + halfLine;
    const barY = row * CELL_HEIGHT + CELL_HEIGHT / 2 - PROGRESS_BAR_HEIGHT / 2 + halfLine - PROGRESS_BAR_Y_OFFSET;

    // Gray background
    ctx.fillStyle = PROGRESS_BAR_COLOR;
    ctx.beginPath();
    ctx.roundRect(barX, barY, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
    ctx.fill();

    // Green fill based on progress
    const charProgress = progress[String(i)] || 0;
    if (charProgress > 0) {
      const fillWidth = (charProgress / 6) * PROGRESS_BAR_WIDTH;
      ctx.fillStyle = PROGRESS_FILL_COLOR;
      ctx.beginPath();
      ctx.roundRect(barX, barY, fillWidth, PROGRESS_BAR_HEIGHT, PROGRESS_BAR_RADIUS);
      ctx.fill();
    }
  }

  // Draw characters
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < chars.length; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const centerX = col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - CHAR_Y_OFFSET;
    setFittedSelectionFont(
      ctx,
      chars[i],
      FONT_SIZE,
      isPhraseSelection ? 28 : FONT_SIZE,
      '"DFFangSong", serif',
      CELL_WIDTH - 20
    );
    ctx.fillText(chars[i], centerX, centerY);
  }

  // Draw pinyin
  for (let i = 0; i < pinyin.length; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const centerX = col * CELL_WIDTH + CELL_WIDTH / 2 + halfLine;
    const centerY = row * CELL_HEIGHT + CELL_HEIGHT / 2 + halfLine - PINYIN_Y_OFFSET;
    setFittedSelectionFont(
      ctx,
      pinyin[i],
      PINYIN_FONT_SIZE,
      12,
      '"Times New Roman", serif',
      CELL_WIDTH - 20
    );
    ctx.fillText(pinyin[i], centerX, centerY);
  }
}

// ── Selection bar setup ──
const selectionBar = document.getElementById('selectionBar');
const selectionPrompt = document.getElementById('selectionPrompt');
selectionBar.style.width = SELECTION_BAR_WIDTH + 'px';
selectionBar.style.height = SELECTION_BAR_HEIGHT + 'px';
selectionBar.style.borderBottomRightRadius = BUTTON_TOP_LEFT_RADIUS + 'px';
selectionPrompt.style.fontSize = SELECTION_PROMPT_FONT_SIZE + 'px';
selectionPrompt.style.left = (SELECTION_BAR_WIDTH / 2) + 'px';
selectionPrompt.style.top = (SELECTION_BAR_HEIGHT / 2) + 'px';

function updateSelectionPrompt() {
  selectionPrompt.textContent = isPhraseSelection
    ? 'Please select phrases'
    : 'Please select words';
}

updateSelectionPrompt();

// Always show selection UI on this page
selectionBar.style.display = 'block';
selectionPrompt.style.display = 'block';

const isReturningFromWorksheet = isWorksheetSelectionPage
  && localStorage.getItem('worksheetReturn') === 'true';
const isFreshWorksheetEntry = isWorksheetSelectionPage
  && selectionParams.get('fresh') === '1'
  && !isReturningFromWorksheet;

if (isFreshWorksheetEntry) {
  clearWorksheetSelections();
}

if (isWorksheetSelectionPage) {
  loadStoredGlobalSelections(false);
  loadStoredGlobalSelections(true);
}

// Clear the one-time return marker after restoring both worksheet selection sets.
if (isReturningFromWorksheet) {
  localStorage.removeItem('worksheetReturn');
}

function positionSiteTitle() {
  const siteTitle = document.getElementById('siteTitle');
  const titleC = document.getElementById('siteTitleC');
  const titleN = document.getElementById('siteTitleN');
  const titleReader = document.getElementById('siteTitleReader');

  if (!siteTitle || !titleC || !titleN || !titleReader) return;

  siteTitle.style.left = '50%';
  siteTitle.style.top = (isWorksheetSelectionPage ? SITE_TITLE_TOP_GAP : TOP_GAP / 2) + 'px';
  siteTitle.style.transform = isWorksheetSelectionPage
    ? 'translateX(-50%)'
    : 'translate(-50%, -50%)';
  siteTitle.style.fontFamily = '"Times New Roman", serif';
  siteTitle.style.fontSize = SITE_TITLE_FONT_SIZE + 'px';
  siteTitle.style.lineHeight = '1';

  titleC.style.color = SITE_TITLE_RED_COLOR;
  titleN.style.color = SITE_TITLE_YELLOW_COLOR;
  titleReader.style.color = SITE_TITLE_BLACK_COLOR;
}

positionSiteTitle();

const contentModeToggle = document.getElementById('contentModeToggle');
const contentModeButtons = contentModeToggle
  ? Array.from(contentModeToggle.querySelectorAll('[data-content-mode]'))
  : [];

function updateWorksheetContentToggle() {
  if (!contentModeToggle) return;
  contentModeToggle.classList.toggle('phrases-selected', isPhraseSelection);
  contentModeButtons.forEach(function (button) {
    const selected = button.dataset.contentMode === (isPhraseSelection ? 'phrases' : 'words');
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function switchWorksheetContent(mode) {
  if (!isWorksheetSelectionPage) return;
  const phraseMode = mode === 'phrases';
  if (phraseMode === isPhraseSelection) return;

  saveActiveSelections();
  isPhraseSelection = phraseMode;
  UNIT_DATA = phraseMode ? PHRASE_SELECTION_UNIT_DATA : WORD_UNIT_DATA;
  selectedCells = selectedCellsByContent[phraseMode ? 'phrases' : 'words'];
  localStorage.setItem('worksheetSelectionContent', phraseMode ? 'phrases' : 'words');

  const selectionUrl = new URL(window.location.href);
  selectionUrl.searchParams.delete('content');
  selectionUrl.searchParams.set('view', phraseMode ? 'phrases' : 'words');
  window.history.replaceState(null, '', selectionUrl);

  updateSelectionPrompt();
  updateWorksheetContentToggle();
  drawGrid();
  updateNavButtons();
}

if (contentModeToggle) {
  contentModeToggle.style.top = (
    SITE_TITLE_TOP_GAP + SITE_TITLE_FONT_SIZE + CONTENT_MODE_TOGGLE_LOGO_GAP
  ) + 'px';
  contentModeToggle.style.width = CONTENT_MODE_TOGGLE_WIDTH + 'px';
  contentModeToggle.style.height = CONTENT_MODE_TOGGLE_HEIGHT + 'px';
  contentModeToggle.style.fontSize = CONTENT_MODE_TOGGLE_FONT_SIZE + 'px';
  contentModeToggle.style.borderRadius = CONTENT_MODE_TOGGLE_BORDER_RADIUS + 'px';

  contentModeToggle.addEventListener('click', function (event) {
    const selectedButton = event.target.closest('[data-content-mode]');
    if (!selectedButton || !contentModeToggle.contains(selectedButton)) return;
    switchWorksheetContent(selectedButton.dataset.contentMode);
  });

  contentModeToggle.addEventListener('keydown', function (event) {
    const currentButtonIndex = contentModeButtons.indexOf(event.target);
    if (currentButtonIndex < 0) return;
    let nextButtonIndex = -1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      nextButtonIndex = (currentButtonIndex + 1) % contentModeButtons.length;
    } else if (event.key === 'Home') {
      nextButtonIndex = 0;
    } else if (event.key === 'End') {
      nextButtonIndex = contentModeButtons.length - 1;
    }
    if (nextButtonIndex >= 0) {
      event.preventDefault();
      contentModeButtons[nextButtonIndex].click();
      contentModeButtons[nextButtonIndex].focus();
    }
  });

  localStorage.setItem('worksheetSelectionContent', isPhraseSelection ? 'phrases' : 'words');
  updateWorksheetContentToggle();
}

// Always draw grid on page load
drawGrid();
document.body.style.paddingBottom = BOTTOM_SCROLL_PADDING + 'px';

// ── Continue Button (centered, bottom edge) ─
const continueButton = document.getElementById('continueButton');
continueButton.style.width = BUTTON_WIDTH + 'px';
continueButton.style.height = BUTTON_HEIGHT + 'px';
continueButton.style.fontSize = BUTTON_FONT_SIZE + 'px';
continueButton.style.transition = 'width ' + HOVER_TRANSITION_DURATION + 's, height ' + HOVER_TRANSITION_DURATION + 's';
continueButton.style.borderTopLeftRadius = BUTTON_TOP_LEFT_RADIUS + 'px';
continueButton.style.borderTopRightRadius = BUTTON_TOP_LEFT_RADIUS + 'px';
continueButton.style.boxShadow = '0px -4px ' + BUTTON_SHADOW_SIZE + 'px rgba(0, 0, 0, 0.3)';
continueButton.style.display = 'flex';

const hoverScale = 1 + HOVER_SCALE_PERCENT / 100;

continueButton.addEventListener('mouseenter', function () {
  continueButton.style.width = (BUTTON_WIDTH * hoverScale) + 'px';
  continueButton.style.height = (BUTTON_HEIGHT * hoverScale) + 'px';
});

continueButton.addEventListener('mouseleave', function () {
  continueButton.style.width = BUTTON_WIDTH + 'px';
  continueButton.style.height = BUTTON_HEIGHT + 'px';
});

continueButton.addEventListener('click', function () {
  const wordSelections = selectedCellsByContent.words;
  const phraseSelections = selectedCellsByContent.phrases;
  if (isCustomTest) {
    if (selectedCells.size === 0) return;
  } else if (wordSelections.size === 0 && phraseSelections.size === 0) {
    return;
  }

  const selectedGlobalIndices = saveActiveSelections();
  if (isWorksheetSelectionPage) {
    saveSelectionsForMode(false);
    saveSelectionsForMode(true);
  }

  if (!isPhraseSelection || isWorksheetSelectionPage) {
    // Keep the legacy values current for older saved sessions while all new
    // selection behavior uses the global, cross-unit list above.
    const wordUnitText = localStorage.getItem('currentUnit');
    const parsedWordUnit = wordUnitText ? parseInt(wordUnitText, 10) : 0;
    const wordUnit = Number.isInteger(parsedWordUnit)
      && parsedWordUnit >= 0
      && parsedWordUnit < WORD_UNIT_DATA.length
      ? parsedWordUnit
      : 0;
    const wordUnitOffset = getUnitOffset(wordUnit, WORD_UNIT_DATA);
    const wordUnitLength = WORD_UNIT_DATA[wordUnit].characters.length;
    const sortedWordSelections = Array.from(wordSelections).sort(function (a, b) { return a - b; });
    const currentUnitIndices = sortedWordSelections
      .filter(function (globalIndex) {
        return globalIndex >= wordUnitOffset &&
          globalIndex < wordUnitOffset + wordUnitLength;
      })
      .map(function (globalIndex) {
        return globalIndex - wordUnitOffset;
      });
    localStorage.setItem('worksheetChars', JSON.stringify(currentUnitIndices));
    localStorage.setItem('worksheetUnit', String(wordUnit));
  }

  if (isCustomTest) {
    // Store format preferences and navigate to custom quiz
    const storagePrefix = isPhraseSelection ? 'phraseCustomTest' : 'worksheet';
    customQuizLogic.writeFormatSettings(localStorage, storagePrefix, {
      mc: mcSelected,
      typing: writeSelected,
      definition: definitionSelected,
      listening: listeningSelected,
    });
    window.location.href = 'custom-quiz.html?content=' + (
      isPhraseSelection ? 'phrases' : 'words'
    );
  } else {
    window.location.href = 'worksheet.html';
  }
});

// ── Back Button (bottom-right, returns to index.html) ──
const backButton = document.getElementById('backButton');
backButton.style.width = BUTTON_WIDTH + 'px';
backButton.style.height = BUTTON_HEIGHT + 'px';
backButton.style.fontSize = BUTTON_FONT_SIZE + 'px';
backButton.style.transition = 'width ' + HOVER_TRANSITION_DURATION + 's, height ' + HOVER_TRANSITION_DURATION + 's';
backButton.style.borderTopLeftRadius = BUTTON_TOP_LEFT_RADIUS + 'px';
backButton.style.boxShadow = '-4px -4px ' + BUTTON_SHADOW_SIZE + 'px rgba(0, 0, 0, 0.3)';

backButton.addEventListener('mouseenter', function () {
  backButton.style.width = (BUTTON_WIDTH * hoverScale) + 'px';
  backButton.style.height = (BUTTON_HEIGHT * hoverScale) + 'px';
});

backButton.addEventListener('mouseleave', function () {
  backButton.style.width = BUTTON_WIDTH + 'px';
  backButton.style.height = BUTTON_HEIGHT + 'px';
});

backButton.addEventListener('click', function () {
  if (isWorksheetSelectionPage) {
    clearWorksheetSelections();
  } else {
    selectedCells.clear();
  }
  window.location.href = isPhraseSelection ? 'index.html?view=phrases' : 'index.html';
});

// ── Navigation buttons ──
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

// Update nav button states based on current unit
function updateNavButtons() {
  const unit = getCurrentUnit();
  const atFirst = unit === 0;
  const atLast = unit >= UNIT_DATA.length - 1;
  navLeft.style.opacity = atFirst ? '0.3' : '1';
  navLeft.style.cursor = atFirst ? 'default' : 'pointer';
  navRight.style.opacity = atLast ? '0.3' : '1';
  navRight.style.cursor = atLast ? 'default' : 'pointer';
}

navLeft.addEventListener('click', function () {
  const unit = getCurrentUnit();
  if (unit > 0) {
    setCurrentUnit(unit - 1);
    drawGrid();
    updateNavButtons();
  }
});

navRight.addEventListener('click', function () {
  const unit = getCurrentUnit();
  if (unit < UNIT_DATA.length - 1) {
    setCurrentUnit(unit + 1);
    drawGrid();
    updateNavButtons();
  }
});

updateNavButtons();

// Redraw on resize (centering may change)
window.addEventListener('resize', drawGrid);

// ── Dev Controls: Shift+Click/Drag to complete cells ──
const DEV_COMPLETE_ENABLED = true;
{
  const gridCanvas = document.getElementById('gridCanvas');
  let isDragging = false;

  function cellFromEvent(e) {
    const rect = gridCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor(mx / CELL_WIDTH);
    const row = Math.floor(my / CELL_HEIGHT);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    const idx = row * COLS + col;
    if (idx >= getCurrentUnitData().characters.length) return null;
    return idx;
  }

  function completeCell(idx) {
    const progress = JSON.parse(localStorage.getItem(getProgressKey()) || '{}');
    progress[String(idx)] = 6;
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
    drawGrid();
  }

  gridCanvas.addEventListener('mousedown', function (e) {
    if (!DEV_COMPLETE_ENABLED || !e.shiftKey) return;
    isDragging = true;
    const idx = cellFromEvent(e);
    if (idx !== null) completeCell(idx);
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging || !e.shiftKey) return;
    const idx = cellFromEvent(e);
    if (idx !== null) completeCell(idx);
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
  });
}

// ── Selection Mode: Drag to select cells ──
{
  const gridCanvas = document.getElementById('gridCanvas');
  let selectionDragActive = false;
  let selectionDragMode = null;  // 'select' or 'deselect' — determined on mousedown

  function selectionCellFromEvent(e) {
    const rect = gridCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor(mx / CELL_WIDTH);
    const row = Math.floor(my / CELL_HEIGHT);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    const idx = row * COLS + col;
    if (idx >= getCurrentUnitData().characters.length) return null;
    return idx;
  }

  function applyDragAction(idx) {
    const globalIndex = getCurrentGlobalSelectionIndex(idx);
    if (selectionDragMode === 'select' && !selectedCells.has(globalIndex)) {
      selectedCells.add(globalIndex);
      saveActiveSelections();
      drawGrid();
    } else if (selectionDragMode === 'deselect' && selectedCells.has(globalIndex)) {
      selectedCells.delete(globalIndex);
      saveActiveSelections();
      drawGrid();
    }
  }

  gridCanvas.addEventListener('mousedown', function (e) {
    if (!selectionMode || e.shiftKey) return;
    selectionDragActive = true;
    const idx = selectionCellFromEvent(e);
    if (idx !== null) {
      const globalIndex = getCurrentGlobalSelectionIndex(idx);
      // Determine drag mode based on the initial cell's state
      if (selectedCells.has(globalIndex)) {
        selectionDragMode = 'deselect';
        selectedCells.delete(globalIndex);
      } else {
        selectionDragMode = 'select';
        selectedCells.add(globalIndex);
      }
      saveActiveSelections();
      drawGrid();
    }
  });

  window.addEventListener('mousemove', function (e) {
    if (!selectionDragActive) return;
    const idx = selectionCellFromEvent(e);
    if (idx !== null) applyDragAction(idx);
  });

  window.addEventListener('mouseup', function () {
    selectionDragActive = false;
    selectionDragMode = null;
  });

  // Double-click a cell to select the entire row
  gridCanvas.addEventListener('dblclick', function (e) {
    if (!selectionMode || e.shiftKey) return;
    const rect = gridCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor(mx / CELL_WIDTH);
    const row = Math.floor(my / CELL_HEIGHT);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    const startIdx = row * COLS;
    const endIdx = Math.min(startIdx + COLS, getCurrentUnitData().characters.length);
    for (let i = startIdx; i < endIdx; i++) {
      selectedCells.add(getCurrentGlobalSelectionIndex(i));
    }
    saveActiveSelections();
    drawGrid();
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
      document.body.style.overflow = '';
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

// Close popup when clicking outside the window
popupOverlay.addEventListener('click', function (e) {
  if (e.target === popupOverlay) {
    closePopup();
  }
});

// Open popup on cell click with zoom-in animation
{
  const gridCanvas = document.getElementById('gridCanvas');
  gridCanvas.addEventListener('click', function (e) {
    if (e.shiftKey) return; // don't interfere with dev controls
    if (selectionMode) return; // selection mode uses mousedown/mousemove

    var rect = gridCanvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var col = Math.floor(mx / CELL_WIDTH);
    var row = Math.floor(my / CELL_HEIGHT);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    var idx = row * COLS + col;
    if (idx >= getCurrentUnitData().characters.length) return;

    popupChar.textContent = getCurrentUnitData().characters[idx];
    popupPinyin.textContent = getCurrentUnitData().pinyin[idx];
    popupDefinition.textContent = getCurrentUnitData().definitions[idx];
    popupExamples.innerHTML = (getCurrentUnitData().examples[idx] || []).join('<br>');

    if (popupAnimRAF) {
      cancelAnimationFrame(popupAnimRAF);
      popupAnimRAF = null;
    }

    popupOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Center of clicked cell in viewport coordinates
    var cellCenterX = rect.left + (col + 0.5) * CELL_WIDTH;
    var cellCenterY = rect.top + (row + 0.5) * CELL_HEIGHT;

    // Center of screen in viewport coordinates
    var screenCenterX = window.innerWidth / 2;
    var screenCenterY = window.innerHeight / 2;

    // Translation needed (in pixels) to move from screen center to cell center
    // The overlay centers the popup at screen center, so we offset from there
    var startOffsetX = cellCenterX - screenCenterX;
    var startOffsetY = cellCenterY - screenCenterY;

    var startTime = null;
    var duration = POPUP_OPEN_ANIM_DURATION * 1000;

    function animateOpen(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var t = Math.min(elapsed / duration, 1);

      // Scale from 0 to 1
      var scale = t;

      // Translate from cell center to screen center (offset goes to 0)
      var offsetX = startOffsetX * (1 - t);
      var offsetY = startOffsetY * (1 - t);

      // Blur increases from 0 to full
      var blur = POPUP_BLUR_AMOUNT * t;

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
  });
}
