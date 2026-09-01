// ── Worksheet Configuration ──
const WORKSHEET_HEIGHT = 700;          // height of the A4 outline in px
const OUTLINE_THICKNESS = 3;           // thickness of the black outline in px
const INNER_RECT_THICKNESS = 1;        // thickness of the inner black rectangle outlines in px
const INNER_RECT_HEIGHT = 47;          // height/width of each writing square in px
const CELLS_PER_ROW = 10;              // leading example squares plus remaining practice squares
const CHARACTER_FONT_SIZE = 32;        // font size for worksheet characters in px
const GUIDE_LINE_COLOR = '#d0d0d0';    // light gray for guide lines
const CHARS_PER_PAGE = 12;             // max character rows per page

// ── Site Title Configuration ──
const WORKSHEET_TOP_GAP = 100;
const SITE_TITLE_FONT_SIZE = 42;
const SITE_TITLE_RED_COLOR = '#e71717';
const SITE_TITLE_YELLOW_COLOR = '#f2c230';
const SITE_TITLE_BLACK_COLOR = '#000000';

// A4 paper ratio: height / width = √2 → width = height / √2
const WORKSHEET_WIDTH = WORKSHEET_HEIGHT / Math.SQRT2;

// ── Shared Word/Phrase Data ──
const WORD_WORKSHEET_ITEMS = Array.isArray(window.CHINESE_READER_UNIT_DATA)
  ? window.CHINESE_READER_UNIT_DATA.map(function (unit) { return unit.characters; })
  : [];
const PHRASE_WORKSHEET_ITEMS = Array.isArray(window.CHINESE_READER_PHRASE_UNITS)
  ? window.CHINESE_READER_PHRASE_UNITS.map(function (unit) { return unit.phrases; })
  : [];

if (WORD_WORKSHEET_ITEMS.length === 0 || PHRASE_WORKSHEET_ITEMS.length === 0) {
  throw new Error('Expected shared Chinese word and phrase worksheet data.');
}

// ── Page State ──
let currentPage = 0;
let totalPages = 1;

// Read unit-safe global selections, with a fallback for older single-unit saves.
function getWorksheetTotalItemCount(sourceItems) {
  return sourceItems.reduce(function (total, items) {
    return total + items.length;
  }, 0);
}

function getWorksheetItem(sourceItems, globalIndex) {
  let offset = 0;
  for (let unit = 0; unit < sourceItems.length; unit++) {
    const items = sourceItems[unit];
    if (globalIndex < offset + items.length) {
      return items[globalIndex - offset];
    }
    offset += items.length;
  }
  return null;
}

function getStoredWorksheetGlobalIndices(storageKey, sourceItems, allowLegacyWords) {
  const storedGlobalSelections = localStorage.getItem(storageKey);
  let selectedIndices = [];

  if (storedGlobalSelections !== null) {
    try {
      const parsed = JSON.parse(storedGlobalSelections);
      if (Array.isArray(parsed)) selectedIndices = parsed;
    } catch (error) {
      selectedIndices = [];
    }
  } else if (allowLegacyWords) {
    const worksheetUnit = parseInt(localStorage.getItem('worksheetUnit') || '0', 10);
    const unit = Number.isInteger(worksheetUnit) && worksheetUnit >= 0 && worksheetUnit < sourceItems.length ?
      worksheetUnit :
      0;
    let unitOffset = 0;
    for (let i = 0; i < unit; i++) unitOffset += sourceItems[i].length;

    try {
      const legacyIndices = JSON.parse(localStorage.getItem('worksheetChars') || '[]');
      if (Array.isArray(legacyIndices)) {
        selectedIndices = legacyIndices.map(function (localIndex) {
          return unitOffset + parseInt(localIndex, 10);
        });
      }
    } catch (error) {
      selectedIndices = [];
    }
  }

  const totalItems = getWorksheetTotalItemCount(sourceItems);
  return Array.from(new Set(selectedIndices.map(function (value) {
    return parseInt(value, 10);
  }).filter(function (globalIndex) {
    return Number.isInteger(globalIndex) && globalIndex >= 0 && globalIndex < totalItems;
  })));
}

// Keep curriculum order within each group and always render words before phrases.
const selectedWordIndices = getStoredWorksheetGlobalIndices(
  'worksheetGlobalChars',
  WORD_WORKSHEET_ITEMS,
  true
).sort((a, b) => a - b);
const selectedPhraseIndices = getStoredWorksheetGlobalIndices(
  'phraseWorksheetGlobalPhrases',
  PHRASE_WORKSHEET_ITEMS,
  false
).sort((a, b) => a - b);
const allSelectedItems = selectedWordIndices
  .map(function (globalIndex) { return getWorksheetItem(WORD_WORKSHEET_ITEMS, globalIndex); })
  .filter(Boolean)
  .concat(selectedPhraseIndices
    .map(function (globalIndex) { return getWorksheetItem(PHRASE_WORKSHEET_ITEMS, globalIndex); })
    .filter(Boolean))
  .slice(0, 100);

function getPageItems() {
  const start = currentPage * CHARS_PER_PAGE;
  return allSelectedItems.slice(start, start + CHARS_PER_PAGE);
}

function updateArrows() {
  totalPages = Math.ceil(allSelectedItems.length / CHARS_PER_PAGE) || 1;
  const leftArrow = document.getElementById('leftArrow');
  const rightArrow = document.getElementById('rightArrow');
  const pageIndicator = document.getElementById('pageIndicator');
  if (leftArrow) leftArrow.style.visibility = currentPage > 0 ? 'visible' : 'hidden';
  if (rightArrow) rightArrow.style.visibility = currentPage < totalPages - 1 ? 'visible' : 'hidden';
  if (pageIndicator) pageIndicator.textContent = (currentPage + 1) + ' / ' + totalPages;
}

function goToPage(page) {
  if (page < 0 || page >= totalPages) return;
  currentPage = page;
  updateArrows();
  draw();
}

// ── Arrow Buttons (HTML elements) ──
function createArrowButtons() {
  const leftArrow = document.createElement('div');
  leftArrow.id = 'leftArrow';
  leftArrow.innerHTML = '&lt;';
  leftArrow.addEventListener('click', () => goToPage(currentPage - 1));

  const rightArrow = document.createElement('div');
  rightArrow.id = 'rightArrow';
  rightArrow.innerHTML = '&gt;';
  rightArrow.addEventListener('click', () => goToPage(currentPage + 1));

  const pageIndicator = document.createElement('div');
  pageIndicator.id = 'pageIndicator';

  document.body.appendChild(leftArrow);
  document.body.appendChild(rightArrow);
  document.body.appendChild(pageIndicator);
  updateArrows();
}

createArrowButtons();
const canvas = document.getElementById('worksheetCanvas');
const ctx = canvas.getContext('2d');

function positionSiteTitle() {
  const siteTitle = document.getElementById('siteTitle');
  const titleC = document.getElementById('siteTitleC');
  const titleN = document.getElementById('siteTitleN');
  const titleReader = document.getElementById('siteTitleReader');

  siteTitle.style.left = '50%';
  siteTitle.style.top = (WORKSHEET_TOP_GAP / 2) + 'px';
  siteTitle.style.transform = 'translate(-50%, -50%)';
  siteTitle.style.fontFamily = '"Times New Roman", serif';
  siteTitle.style.fontSize = SITE_TITLE_FONT_SIZE + 'px';
  siteTitle.style.lineHeight = '1';

  titleC.style.color = SITE_TITLE_RED_COLOR;
  titleN.style.color = SITE_TITLE_YELLOW_COLOR;
  titleReader.style.color = SITE_TITLE_BLACK_COLOR;
}

function getWorksheetPreviewLayout() {
  const canvasHeight = Math.max(
    window.innerHeight,
    WORKSHEET_TOP_GAP + WORKSHEET_HEIGHT
  );

  return {
    canvasHeight: canvasHeight,
    x: (window.innerWidth - WORKSHEET_WIDTH) / 2,
    y: WORKSHEET_TOP_GAP,
  };
}

// ── Back Button ──
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', function () {
  localStorage.setItem('worksheetReturn', 'true');
  window.location.href = 'select.html';
});

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const layout = getWorksheetPreviewLayout();
  document.body.style.minHeight = layout.canvasHeight + 'px';
  positionSiteTitle();
  canvas.width = window.innerWidth * dpr;
  canvas.height = layout.canvasHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = layout.canvasHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();

  // Keep page controls aligned with the worksheet after reserving the logo area.
  const outlineRight = layout.x + WORKSHEET_WIDTH;
  const outlineCenterY = layout.y + WORKSHEET_HEIGHT / 2;
  ['leftArrow', 'rightArrow'].forEach(function (id) {
    const arrow = document.getElementById(id);
    if (!arrow) return;
    arrow.style.position = 'absolute';
    arrow.style.top = outlineCenterY + 'px';
  });

  const downloadGap = 20; // constant gap between worksheet right edge and button left edge
  const downloadButton = document.getElementById('downloadButton');
  if (downloadButton) {
    downloadButton.style.position = 'absolute';
    downloadButton.style.top = (layout.y + WORKSHEET_HEIGHT - downloadButton.offsetHeight) + 'px';
    downloadButton.style.bottom = 'auto';
    downloadButton.style.left = (outlineRight + downloadGap) + 'px';
    downloadButton.style.right = 'auto';
  }
}

function drawPrefilledWorksheetItem(targetContext, item, rectX, rectY) {
  targetContext.fillStyle = 'black';
  targetContext.strokeStyle = 'black';
  targetContext.lineWidth = INNER_RECT_THICKNESS;
  const charY = rectY + INNER_RECT_HEIGHT / 2;
  Array.from(item).slice(0, CELLS_PER_ROW).forEach(function (character, index) {
    const charX = rectX + (index + 0.5) * INNER_RECT_HEIGHT;
    targetContext.fillText(character, charX, charY);
  });
}

function draw() {
  const layout = getWorksheetPreviewLayout();

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, window.innerWidth, layout.canvasHeight);

  // Center the A4 rectangle in the area below the site logo.
  const x = layout.x;
  const y = layout.y;

  // Black outline
  ctx.strokeStyle = 'black';
  ctx.lineWidth = OUTLINE_THICKNESS;
  ctx.strokeRect(x, y, WORKSHEET_WIDTH, WORKSHEET_HEIGHT);

  // Paper area inside the outline (strokeRect centers the stroke on the path)
  const innerX = x + OUTLINE_THICKNESS / 2;
  const innerY = y + OUTLINE_THICKNESS / 2;
  const innerWidth = WORKSHEET_WIDTH - OUTLINE_THICKNESS;
  const innerHeight = WORKSHEET_HEIGHT - OUTLINE_THICKNESS;
  const sectionHeight = innerHeight / CHARS_PER_PAGE;

  // Read selected word or phrase indices from localStorage.
  const selectedItems = getPageItems();

  // Draw black rectangular outlines, one per selected word or phrase.
  const rectW = INNER_RECT_HEIGHT * CELLS_PER_ROW;
  const rectH = INNER_RECT_HEIGHT;
  const rectX = innerX + (innerWidth - rectW) / 2;

  ctx.strokeStyle = 'black';
  ctx.lineWidth = INNER_RECT_THICKNESS;
  ctx.font = CHARACTER_FONT_SIZE + 'px "DFFangSong", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  for (let i = 0; i < selectedItems.length; i++) {
    const sectionTop = innerY + i * sectionHeight;
    const rectY = sectionTop + (sectionHeight - rectH) / 2;
    ctx.strokeRect(rectX, rectY, rectW, rectH);

    // Divide the row into 10 writing squares.
    ctx.beginPath();
    for (let j = 1; j < CELLS_PER_ROW; j++) {
      const lineX = rectX + j * INNER_RECT_HEIGHT;
      ctx.moveTo(lineX, rectY);
      ctx.lineTo(lineX, rectY + rectH);
    }
    ctx.stroke();

    // Guide lines in all 10 squares (dotted, light gray)
    ctx.strokeStyle = GUIDE_LINE_COLOR;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    for (let j = 0; j < CELLS_PER_ROW; j++) {
      const sqX = rectX + j * INNER_RECT_HEIGHT;
      const sqY = rectY;
      const sqW = INNER_RECT_HEIGHT;
      const sqH = INNER_RECT_HEIGHT;
      const cx = sqX + sqW / 2;
      const cy = sqY + sqH / 2;

      ctx.beginPath();
      // Diagonals (X)
      ctx.moveTo(sqX, sqY); ctx.lineTo(sqX + sqW, sqY + sqH);
      ctx.moveTo(sqX + sqW, sqY); ctx.lineTo(sqX, sqY + sqH);
      // Horizontal through center
      ctx.moveTo(sqX, cy); ctx.lineTo(sqX + sqW, cy);
      // Vertical through center
      ctx.moveTo(cx, sqY); ctx.lineTo(cx, sqY + sqH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Prefill one square per character in the selected word or phrase.
    drawPrefilledWorksheetItem(ctx, selectedItems[i], rectX, rectY);
  }
}

resize();
window.addEventListener('resize', resize);

// ── Download PDF Button ──
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', function() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;

  // Render at high resolution matching the worksheet's A4 ratio
  const scale = 4;
  const canvasW = WORKSHEET_WIDTH * scale;
  const canvasH = WORKSHEET_HEIGHT * scale;

  // Split selected words or phrases into worksheet pages.
  const charsPerPage = CHARS_PER_PAGE;
  const numPages = Math.ceil(allSelectedItems.length / charsPerPage) || 1;

  for (let page = 0; page < numPages; page++) {
    if (page > 0) pdf.addPage();

    const offscreen = document.createElement('canvas');
    offscreen.width = canvasW;
    offscreen.height = canvasH;
    const offCtx = offscreen.getContext('2d');
    offCtx.setTransform(scale, 0, 0, scale, 0, 0);

    // White background
    offCtx.fillStyle = 'white';
    offCtx.fillRect(0, 0, WORKSHEET_WIDTH, WORKSHEET_HEIGHT);

    // Paper area (same as draw() but no outer black outline)
    const innerX = OUTLINE_THICKNESS / 2;
    const innerY = OUTLINE_THICKNESS / 2;
    const innerWidth = WORKSHEET_WIDTH - OUTLINE_THICKNESS;
    const innerHeight = WORKSHEET_HEIGHT - OUTLINE_THICKNESS;
    const sectionHeight = innerHeight / CHARS_PER_PAGE;

    const startIdx = page * charsPerPage;
    const endIdx = Math.min(startIdx + charsPerPage, allSelectedItems.length);
    const pageItems = allSelectedItems.slice(startIdx, endIdx);

    const rectW = INNER_RECT_HEIGHT * CELLS_PER_ROW;
    const rectH = INNER_RECT_HEIGHT;
    const rectX = innerX + (innerWidth - rectW) / 2;

    offCtx.strokeStyle = 'black';
    offCtx.lineWidth = INNER_RECT_THICKNESS;
    offCtx.font = CHARACTER_FONT_SIZE + 'px "DFFangSong", serif';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = 'black';

    for (let i = 0; i < pageItems.length; i++) {
      const sectionTop = innerY + i * sectionHeight;
      const rectY = sectionTop + (sectionHeight - rectH) / 2;
      offCtx.strokeRect(rectX, rectY, rectW, rectH);

      // Divide the row into 10 writing squares.
      offCtx.beginPath();
      for (let j = 1; j < CELLS_PER_ROW; j++) {
        const lineX = rectX + j * INNER_RECT_HEIGHT;
        offCtx.moveTo(lineX, rectY);
        offCtx.lineTo(lineX, rectY + rectH);
      }
      offCtx.stroke();

      // Guide lines in all 10 squares (dotted, light gray)
      offCtx.strokeStyle = GUIDE_LINE_COLOR;
      offCtx.lineWidth = 0.5;
      offCtx.setLineDash([4, 4]);
      for (let j = 0; j < CELLS_PER_ROW; j++) {
        const sqX = rectX + j * INNER_RECT_HEIGHT;
        const sqY = rectY;
        const sqW = INNER_RECT_HEIGHT;
        const sqH = INNER_RECT_HEIGHT;
        const cx = sqX + sqW / 2;
        const cy = sqY + sqH / 2;

        offCtx.beginPath();
        // Diagonals (X)
        offCtx.moveTo(sqX, sqY); offCtx.lineTo(sqX + sqW, sqY + sqH);
        offCtx.moveTo(sqX + sqW, sqY); offCtx.lineTo(sqX, sqY + sqH);
        // Horizontal through center
        offCtx.moveTo(sqX, cy); offCtx.lineTo(sqX + sqW, cy);
        // Vertical through center
        offCtx.moveTo(cx, sqY); offCtx.lineTo(cx, sqY + sqH);
        offCtx.stroke();
      }
      offCtx.setLineDash([]);

      // Prefill one square per character in the selected word or phrase.
      drawPrefilledWorksheetItem(offCtx, pageItems[i], rectX, rectY);
    }

    // Convert to image and add to PDF
    const imgData = offscreen.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, a4Width, a4Height);
  }

  // Save PDF
  const now = new Date();
  const dateStr = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  pdf.save('worksheet_' + dateStr + '.pdf');
});
