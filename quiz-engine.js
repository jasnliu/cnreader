// ── Quiz Engine ──
// Shared configuration, data, drawing functions, and input utilities
// for all quiz pages (regular quiz, review quiz, custom quiz, skip quiz).

// ── Square Outline Configuration ──
const SQUARE_SIZE = 300;
const SQUARE_LINE_THICKNESS = 2;
const SQUARE_CENTER_X = -200;
const SQUARE_CENTER_Y = 0;

// ── Second Square (Typing Question) ──
const SQUARE2_CENTER_X = 0;
const SQUARE2_CENTER_Y = -100;

// ── Text Box Configuration ──
const TEXTBOX_CENTER_X = 0;
const TEXTBOX_CENTER_Y = 150;
const TEXTBOX_WIDTH = 200;
const TEXTBOX_HEIGHT = 40;
const TEXTBOX_FONT_SIZE = 22;

// ── Listening Question Configuration ──
const LISTENING_BUTTON_CENTER_X = TEXTBOX_CENTER_X;
const LISTENING_BUTTON_CENTER_Y = TEXTBOX_CENTER_Y;
const LISTENING_BUTTON_WIDTH = 200;
const LISTENING_BUTTON_HEIGHT = 44;
const LISTENING_BUTTON_FONT_SIZE = 22;
const LISTENING_REVEAL_FONT_SIZE = 28;
const LISTENING_PINYIN_FONT_SIZE = 22;
const LISTENING_PINYIN_MIN_FONT_SIZE = 14;
const LISTENING_PINYIN_CENTER_Y = SQUARE2_CENTER_Y + SQUARE_SIZE / 2 + 35;

// ── Phrase Definition Answer Configuration ──
const DEFINITION_TEXTBOX_WIDTH = 460;
const DEFINITION_FEEDBACK_FONT_SIZE = 16;
const DEFINITION_FEEDBACK_LINE_HEIGHT = 19;
const DEFINITION_FEEDBACK_TOP_Y = TEXTBOX_CENTER_Y + TEXTBOX_HEIGHT / 2 + 20;
const DEFINITION_FEEDBACK_MAX_WIDTH = 520;
const DEFINITION_HONOR_BUTTON_WIDTH = 132;
const DEFINITION_HONOR_BUTTON_HEIGHT = 34;
const DEFINITION_HONOR_BUTTON_GAP = 14;
const DEFINITION_HONOR_BUTTON_FONT_SIZE = 16;

// ── Button Configuration ──
const BTN_WIDTH = 300;
const BTN_HEIGHT = 55;

const BTN_1_CENTER_X = 200;
const BTN_1_CENTER_Y = -120;

const BTN_2_CENTER_X = 200;
const BTN_2_CENTER_Y = -40;

const BTN_3_CENTER_X = 200;
const BTN_3_CENTER_Y = 40;

const BTN_4_CENTER_X = 200;
const BTN_4_CENTER_Y = 120;

const BUTTON_CENTERS = [
  { x: BTN_1_CENTER_X, y: BTN_1_CENTER_Y },
  { x: BTN_2_CENTER_X, y: BTN_2_CENTER_Y },
  { x: BTN_3_CENTER_X, y: BTN_3_CENTER_Y },
  { x: BTN_4_CENTER_X, y: BTN_4_CENTER_Y },
];

// ── Text Configuration ──
const CHAR_FONT_SIZE = 120;
const CHAR_MIN_FONT_SIZE = 44;
const BTN_FONT_SIZE = 24;
const BTN_MIN_FONT_SIZE = 12;
const PROGRESS_FONT_SIZE = 20;

// ── Button Hover Animation ──
const BTN_HOVER_WIDTH_INCREASE = 60;
const BTN_HOVER_ANIM_DURATION = 0.15;

// ── Slide Animation ──
const SLIDE_ANIM_INITIAL_SPEED = 5000;
const SLIDE_ANIM_ACCELERATION = 12000;

// ── Answer Colors ──
const CORRECT_COLOR = '#4CAF50';
const WRONG_COLOR = '#F44336';
const DONT_KNOW_BORDER_THICKNESS = 4;

// ── Correct Streak Milestone ──
const STREAK_BANNER_WIDTH = 300;
const STREAK_BANNER_HEIGHT = 70;
const STREAK_BANNER_CORNER_RADIUS = 12;
const STREAK_BANNER_BORDER_THICKNESS = 2;
const STREAK_BANNER_TOP_GAP = 18;
const STREAK_BANNER_NUMBER_TILE_SIZE = 46;
const STREAK_BANNER_EXIT_OFFSET = 10;
const STREAK_REQUIRED_CORRECT = 5;
const STREAK_BANNER_5_HOLD_DURATION = 1.35;
const STREAK_BANNER_10_HOLD_DURATION = 1.65;
const STREAK_BANNER_15_HOLD_DURATION = 2.00;
const STREAK_RGB_UNLOCK_COUNT = 15;
const STREAK_RGB_HUE_SPEED = 0.045;
const STREAK_RGB_COLOR_STOPS = 6;
const STREAK_BANNER_TIER_CONFIGS = [
  null,
  { enterDuration: 0.22, holdDuration: STREAK_BANNER_5_HOLD_DURATION, exitDuration: 0.18, enterOffset: 18, startScale: 0.96 },
  { enterDuration: 0.22, holdDuration: STREAK_BANNER_10_HOLD_DURATION, exitDuration: 0.18, enterOffset: 18, startScale: 0.96 },
  { enterDuration: 0.22, holdDuration: STREAK_BANNER_15_HOLD_DURATION, exitDuration: 0.18, enterOffset: 18, startScale: 0.96 },
];
const STREAK_BANNER_ACCENT_COLORS = [null, CORRECT_COLOR, '#E5682F', null];

function getStreakBannerTier(streakCount) {
  return Math.min(3, Math.max(1, Math.floor(streakCount / STREAK_REQUIRED_CORRECT)));
}

function createSlidingRgbGradient(ctx, startX, startY, endX, endY, hueOffset) {
  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  for (let i = 0; i <= STREAK_RGB_COLOR_STOPS; i++) {
    const hue = (hueOffset + i * (360 / STREAK_RGB_COLOR_STOPS)) % 360;
    gradient.addColorStop(i / STREAK_RGB_COLOR_STOPS, 'hsl(' + hue + ', 72%, 48%)');
  }
  return gradient;
}

function getSlidingRgbCssGradient(hueOffset) {
  const colorStops = [];
  for (let i = 0; i <= STREAK_RGB_COLOR_STOPS; i++) {
    const amount = i / STREAK_RGB_COLOR_STOPS;
    const hue = (hueOffset + i * (360 / STREAK_RGB_COLOR_STOPS)) % 360;
    colorStops.push('hsl(' + hue + ', 72%, 48%) ' + (amount * 100) + '%');
  }
  return 'linear-gradient(90deg, ' + colorStops.join(', ') + ')';
}

// ── Shared Characters & Pinyin Data ──
const SHARED_UNIT_DATA = window.CHINESE_READER_UNIT_DATA;
if (!Array.isArray(SHARED_UNIT_DATA) || SHARED_UNIT_DATA.length === 0) {
  throw new Error('Expected shared Chinese character unit data.');
}
const UNIT_DATA = SHARED_UNIT_DATA.map(function (unit) {
  return {
    characters: unit.characters,
    pinyin: unit.quizPinyin || unit.pinyin,
  };
});
const PINYIN_1 = UNIT_DATA[0].pinyin;

// ── Pick random pinyin answers (one correct + 3 wrong, no repeats) ──
function pickAnswers(correctIndex, pinyinArr) {
  pinyinArr = pinyinArr || PINYIN_1;
  const correctPinyin = pinyinArr[correctIndex];

  const wrongOptions = [];
  const seenPinyin = new Set([String(correctPinyin).trim().normalize('NFC').toLowerCase()]);
  for (let i = 0; i < pinyinArr.length; i++) {
    const candidate = pinyinArr[i];
    const candidateKey = String(candidate).trim().normalize('NFC').toLowerCase();
    if (seenPinyin.has(candidateKey)) continue;

    seenPinyin.add(candidateKey);
    wrongOptions.push(candidate);
  }

  if (wrongOptions.length < 3) {
    throw new Error('Multiple-choice questions require at least four unique pinyin answers.');
  }

  for (let i = wrongOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
  }

  const answers = [correctPinyin, ...wrongOptions.slice(0, 3)];

  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }

  return answers;
}

function setFittedQuizFont(ctx, text, maximumSize, minimumSize, family, maximumWidth) {
  let fontSize = maximumSize;
  ctx.font = fontSize + 'px ' + family;
  const measuredWidth = ctx.measureText(String(text)).width;
  if (measuredWidth > maximumWidth) {
    fontSize = Math.max(minimumSize, Math.floor(fontSize * maximumWidth / measuredWidth));
    ctx.font = fontSize + 'px ' + family;
  }
  return fontSize;
}

function wrapQuizAnswer(ctx, text, maximumWidth) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? currentLine + ' ' + word : word;
    if (currentLine && ctx.measureText(candidate).width > maximumWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawQuizAnswer(ctx, text, centerX, centerY, buttonWidth) {
  const maximumWidth = buttonWidth - 24;
  ctx.font = BTN_FONT_SIZE + 'px "Times New Roman", serif';
  if (ctx.measureText(String(text)).width <= maximumWidth) {
    ctx.fillText(text, centerX, centerY);
    return;
  }

  let fontSize = 18;
  let lines = [];
  for (; fontSize >= BTN_MIN_FONT_SIZE; fontSize--) {
    ctx.font = fontSize + 'px "Times New Roman", serif';
    lines = wrapQuizAnswer(ctx, text, maximumWidth);
    const lineHeight = fontSize + 2;
    if (lines.length <= 3 && lines.length * lineHeight <= BTN_HEIGHT - 6) break;
  }

  if (fontSize < BTN_MIN_FONT_SIZE) {
    fontSize = BTN_MIN_FONT_SIZE;
    ctx.font = fontSize + 'px "Times New Roman", serif';
    lines = wrapQuizAnswer(ctx, text, maximumWidth);
  }

  const lineHeight = fontSize + 2;
  const firstLineY = centerY - (lines.length - 1) * lineHeight / 2;
  lines.forEach(function (line, index) {
    ctx.fillText(line, centerX, firstLineY + index * lineHeight);
  });
}

// ── Draw MC Quiz Content ──
function drawQuizContent(ctx, char, answers, correctIdx, btnWidths, isAnswered, clickedIdx, offsetX, dontKnowMode, streakHueOffset) {
  ctx.save();
  ctx.translate(offsetX + window.innerWidth / 2, window.innerHeight / 2);

  const halfSize = SQUARE_SIZE / 2;
  const x = SQUARE_CENTER_X - halfSize;
  const y = SQUARE_CENTER_Y - halfSize;
  ctx.strokeStyle = streakHueOffset === null ?
    'black' :
    createSlidingRgbGradient(ctx, x, y, x + SQUARE_SIZE, y + SQUARE_SIZE, streakHueOffset);
  ctx.lineWidth = SQUARE_LINE_THICKNESS;
  ctx.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

  setFittedQuizFont(
    ctx,
    char,
    CHAR_FONT_SIZE,
    CHAR_MIN_FONT_SIZE,
    '"DFFangSong", serif',
    SQUARE_SIZE - 60
  );
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, SQUARE_CENTER_X, SQUARE_CENTER_Y);

  for (let i = 0; i < BUTTON_CENTERS.length; i++) {
    const btn = BUTTON_CENTERS[i];
    const halfW = btnWidths[i] / 2;
    const halfH = BTN_HEIGHT / 2;
    const btnX = btn.x - halfW;
    const btnY = btn.y - halfH;

    if (isAnswered) {
      if (dontKnowMode) {
        ctx.fillStyle = 'black';
        ctx.fillRect(btnX, btnY, btnWidths[i], BTN_HEIGHT);
        if (i === correctIdx) {
          ctx.strokeStyle = CORRECT_COLOR;
          ctx.lineWidth = DONT_KNOW_BORDER_THICKNESS;
          ctx.strokeRect(btnX + DONT_KNOW_BORDER_THICKNESS / 2, btnY + DONT_KNOW_BORDER_THICKNESS / 2, btnWidths[i] - DONT_KNOW_BORDER_THICKNESS, BTN_HEIGHT - DONT_KNOW_BORDER_THICKNESS);
        }
      } else {
        if (i === correctIdx) {
          ctx.fillStyle = CORRECT_COLOR;
        } else if (i === clickedIdx) {
          ctx.fillStyle = WRONG_COLOR;
        } else {
          ctx.fillStyle = 'black';
        }
        ctx.fillRect(btnX, btnY, btnWidths[i], BTN_HEIGHT);
      }
    } else {
      ctx.fillStyle = 'black';
      ctx.fillRect(btnX, btnY, btnWidths[i], BTN_HEIGHT);
    }
  }

  ctx.fillStyle = 'white';
  for (let i = 0; i < answers.length; i++) {
    const btn = BUTTON_CENTERS[i];
    // Fit against the normal button width so hover growth never changes the
    // answer's font size or line wrapping.
    drawQuizAnswer(ctx, answers[i], btn.x, btn.y, BTN_WIDTH);
  }

  ctx.restore();
}

// ── Draw Typing Quiz Content ──
function drawTypingContent(
  ctx,
  offsetX,
  char,
  state,
  correctPinyin,
  streakHueOffset,
  warningText
) {
  ctx.save();
  ctx.translate(offsetX + window.innerWidth / 2, window.innerHeight / 2);

  const halfSize = SQUARE_SIZE / 2;
  const sx = SQUARE2_CENTER_X - halfSize;
  const sy = SQUARE2_CENTER_Y - halfSize;

  if (state === 'correct') {
    ctx.strokeStyle = CORRECT_COLOR;
  } else if (state === 'wrong') {
    ctx.strokeStyle = WRONG_COLOR;
  } else if (streakHueOffset !== null) {
    ctx.strokeStyle = createSlidingRgbGradient(
      ctx,
      sx,
      sy,
      sx + SQUARE_SIZE,
      sy + SQUARE_SIZE,
      streakHueOffset
    );
  } else {
    ctx.strokeStyle = 'black';
  }
  ctx.lineWidth = SQUARE_LINE_THICKNESS;
  ctx.strokeRect(sx, sy, SQUARE_SIZE, SQUARE_SIZE);

  setFittedQuizFont(
    ctx,
    char,
    CHAR_FONT_SIZE,
    CHAR_MIN_FONT_SIZE,
    '"DFFangSong", serif',
    SQUARE_SIZE - 60
  );
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, SQUARE2_CENTER_X, SQUARE2_CENTER_Y);

  const feedbackText = state === 'wrong' ? correctPinyin : warningText;
  if (feedbackText) {
    ctx.font = TEXTBOX_FONT_SIZE + 'px "Times New Roman", serif';
    ctx.fillStyle = WRONG_COLOR;
    const feedbackY = TEXTBOX_CENTER_Y - TEXTBOX_HEIGHT / 2 - 20;
    ctx.fillText(feedbackText, TEXTBOX_CENTER_X, feedbackY);
  }

  ctx.restore();
}

function getListeningPlayButtonBounds() {
  return {
    x: LISTENING_BUTTON_CENTER_X - LISTENING_BUTTON_WIDTH / 2,
    y: LISTENING_BUTTON_CENTER_Y - LISTENING_BUTTON_HEIGHT / 2,
    width: LISTENING_BUTTON_WIDTH,
    height: LISTENING_BUTTON_HEIGHT,
  };
}

function drawListeningContent(ctx, offsetX, char, pinyin, revealed, unavailable) {
  ctx.save();
  ctx.translate(offsetX + window.innerWidth / 2, window.innerHeight / 2);

  const halfSize = SQUARE_SIZE / 2;
  const squareX = SQUARE2_CENTER_X - halfSize;
  const squareY = SQUARE2_CENTER_Y - halfSize;
  ctx.fillStyle = 'white';
  ctx.fillRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = SQUARE_LINE_THICKNESS;
  ctx.strokeRect(squareX, squareY, SQUARE_SIZE, SQUARE_SIZE);

  if (revealed) {
    setFittedQuizFont(
      ctx,
      char,
      CHAR_FONT_SIZE,
      CHAR_MIN_FONT_SIZE,
      '"DFFangSong", serif',
      SQUARE_SIZE - 60
    );
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, SQUARE2_CENTER_X, SQUARE2_CENTER_Y);
  } else {
    setFittedQuizFont(
      ctx,
      'Click to reveal',
      LISTENING_REVEAL_FONT_SIZE,
      16,
      '"Times New Roman", serif',
      SQUARE_SIZE - 40
    );
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Click to reveal', SQUARE2_CENTER_X, SQUARE2_CENTER_Y);
  }

  setFittedQuizFont(
    ctx,
    pinyin,
    LISTENING_PINYIN_FONT_SIZE,
    LISTENING_PINYIN_MIN_FONT_SIZE,
    '"Times New Roman", serif',
    SQUARE_SIZE - 20
  );
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pinyin, SQUARE2_CENTER_X, LISTENING_PINYIN_CENTER_Y);

  const button = getListeningPlayButtonBounds();
  ctx.fillStyle = 'black';
  ctx.fillRect(button.x, button.y, button.width, button.height);
  ctx.font = LISTENING_BUTTON_FONT_SIZE + 'px "Times New Roman", serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    unavailable ? 'Sound unavailable' : 'Play Sound',
    LISTENING_BUTTON_CENTER_X,
    LISTENING_BUTTON_CENTER_Y
  );
  ctx.restore();
}

function getDefinitionFeedbackLayout(ctx, correctDefinition) {
  const maximumWidth = Math.max(
    180,
    Math.min(DEFINITION_FEEDBACK_MAX_WIDTH, window.innerWidth - 40)
  );
  ctx.font = DEFINITION_FEEDBACK_FONT_SIZE + 'px "Times New Roman", serif';
  const lines = wrapQuizAnswer(ctx, correctDefinition, maximumWidth);
  const feedbackBottom = DEFINITION_FEEDBACK_TOP_Y
    + Math.max(lines.length - 1, 0) * DEFINITION_FEEDBACK_LINE_HEIGHT;
  const buttonTop = feedbackBottom
    + DEFINITION_FEEDBACK_LINE_HEIGHT / 2
    + DEFINITION_HONOR_BUTTON_GAP;

  return {
    lines: lines,
    button: {
      x: -DEFINITION_HONOR_BUTTON_WIDTH / 2,
      y: buttonTop,
      width: DEFINITION_HONOR_BUTTON_WIDTH,
      height: DEFINITION_HONOR_BUTTON_HEIGHT,
    },
  };
}

function drawDefinitionContent(ctx, offsetX, phrase, state, correctDefinition, streakHueOffset) {
  ctx.save();
  ctx.translate(offsetX + window.innerWidth / 2, window.innerHeight / 2);

  const halfSize = SQUARE_SIZE / 2;
  const sx = SQUARE2_CENTER_X - halfSize;
  const sy = SQUARE2_CENTER_Y - halfSize;

  if (state === 'correct') {
    ctx.strokeStyle = CORRECT_COLOR;
  } else if (state === 'wrong') {
    ctx.strokeStyle = WRONG_COLOR;
  } else if (streakHueOffset !== null) {
    ctx.strokeStyle = createSlidingRgbGradient(
      ctx,
      sx,
      sy,
      sx + SQUARE_SIZE,
      sy + SQUARE_SIZE,
      streakHueOffset
    );
  } else {
    ctx.strokeStyle = 'black';
  }
  ctx.lineWidth = SQUARE_LINE_THICKNESS;
  ctx.strokeRect(sx, sy, SQUARE_SIZE, SQUARE_SIZE);

  setFittedQuizFont(
    ctx,
    phrase,
    CHAR_FONT_SIZE,
    CHAR_MIN_FONT_SIZE,
    '"DFFangSong", serif',
    SQUARE_SIZE - 60
  );
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(phrase, SQUARE2_CENTER_X, SQUARE2_CENTER_Y);

  if (state === 'wrong') {
    const layout = getDefinitionFeedbackLayout(ctx, correctDefinition);
    ctx.font = DEFINITION_FEEDBACK_FONT_SIZE + 'px "Times New Roman", serif';
    ctx.fillStyle = WRONG_COLOR;
    layout.lines.forEach(function (line, index) {
      ctx.fillText(
        line,
        TEXTBOX_CENTER_X,
        DEFINITION_FEEDBACK_TOP_Y + index * DEFINITION_FEEDBACK_LINE_HEIGHT
      );
    });

    ctx.fillStyle = WRONG_COLOR;
    ctx.fillRect(
      layout.button.x,
      layout.button.y,
      layout.button.width,
      layout.button.height
    );
    ctx.font = DEFINITION_HONOR_BUTTON_FONT_SIZE + 'px "Times New Roman", serif';
    ctx.fillStyle = 'white';
    ctx.fillText(
      "I'm Correct",
      0,
      layout.button.y + layout.button.height / 2
    );
  }

  ctx.restore();
}

// ── Typing Input Positioning ──
function getTypingInputLayout(questionType) {
  const maximumDefinitionWidth = Math.max(200, window.innerWidth - 40);
  const width = questionType === 'definition'
    ? Math.min(DEFINITION_TEXTBOX_WIDTH, maximumDefinitionWidth)
    : TEXTBOX_WIDTH;
  return {
    left: window.innerWidth / 2 + TEXTBOX_CENTER_X - width / 2,
    top: window.innerHeight / 2 + TEXTBOX_CENTER_Y - TEXTBOX_HEIGHT / 2,
    width: width,
  };
}

function positionTypingInput(inputEl, questionType) {
  const layout = getTypingInputLayout(questionType);
  const left = layout.left;
  const top = window.innerHeight / 2 + TEXTBOX_CENTER_Y - TEXTBOX_HEIGHT / 2;
  inputEl.style.left = left + 'px';
  inputEl.style.top = top + 'px';
  inputEl.style.width = layout.width + 'px';
  inputEl.style.height = TEXTBOX_HEIGHT + 'px';
  inputEl.style.fontSize = TEXTBOX_FONT_SIZE + 'px';
}

function showTypingInput(inputEl, canvasEl, questionType) {
  positionTypingInput(inputEl, questionType);
  inputEl.style.borderColor = 'black';
  inputEl.style.display = 'block';
  inputEl.value = '';
  inputEl.placeholder = questionType === 'definition' ? 'Write Definition' : 'Write Pinyin';
  inputEl.setAttribute('aria-label', inputEl.placeholder);
  inputEl.focus();
  if (canvasEl) canvasEl.style.cursor = 'default';
}

function hideTypingInput(inputEl) {
  inputEl.style.display = 'none';
}

// ── Pinyin Accent Shortcuts ──
const ACCENT_MAP = {
  1: { a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū', ü: 'ǖ', A: 'Ā', E: 'Ē', I: 'Ī', O: 'Ō', U: 'Ū', Ü: 'Ǖ' },
  2: { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', ü: 'ǘ', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Ü: 'Ǘ' },
  3: { a: 'ǎ', e: 'ě', i: 'ǐ', o: 'ǒ', u: 'ǔ', ü: 'ǚ', A: 'Ǎ', E: 'Ě', I: 'Ǐ', O: 'Ǒ', U: 'Ǔ', Ü: 'Ǚ' },
  4: { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', ü: 'ǜ', A: 'À', E: 'È', I: 'Ì', O: 'Ò', U: 'Ù', Ü: 'Ǜ' },
  5: { u: 'ü', U: 'Ü' },
};

function setupPinyinAccents(inputEl, shouldHandle) {
  const heldToneKeys = new Set();

  function isEnabled() {
    return typeof shouldHandle !== 'function' || shouldHandle();
  }

  inputEl.addEventListener('keydown', function (e) {
    if (!isEnabled()) return;
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      const val = inputEl.value;
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const selectedCharacter = end === start + 1 ? val[start] : '';
      const selectedAccent = selectedCharacter
        ? ACCENT_MAP[e.key][selectedCharacter]
        : '';
      const targetIndex = selectedAccent ? start : start - 1;
      if (targetIndex >= 0) {
        const targetCharacter = val[targetIndex];
        const accented = ACCENT_MAP[e.key][targetCharacter];
        if (accented) {
          inputEl.value = val.slice(0, targetIndex) + accented + val.slice(targetIndex + 1);
          inputEl.selectionStart = inputEl.selectionEnd = targetIndex + 1;
          return;
        }
      }
      heldToneKeys.add(e.key);
      return;
    }
    if (heldToneKeys.size > 0 && /^[aeiouüAEIOUÜ]$/.test(e.key)) {
      const toneKey = Array.from(heldToneKeys).pop();
      const accented = ACCENT_MAP[toneKey][e.key];
      if (accented) {
        e.preventDefault();
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        inputEl.value = inputEl.value.slice(0, start) + accented + inputEl.value.slice(end);
        inputEl.selectionStart = inputEl.selectionEnd = start + 1;
        return;
      }
    }
  });

  inputEl.addEventListener('keyup', function (e) {
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      heldToneKeys.delete(e.key);
    }
  });
}

// ── Filter input to only allow pinyin characters ──
const PINYIN_CHAR_REGEX = /[^a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛ ]/g;

function setupPinyinFilter(inputEl, shouldFilter) {
  inputEl.addEventListener('input', function () {
    if (typeof shouldFilter === 'function' && !shouldFilter()) return;
    const oldVal = inputEl.value;
    const filtered = oldVal.replace(PINYIN_CHAR_REGEX, '');
    if (filtered !== oldVal) {
      const oldPos = inputEl.selectionStart;
      const beforeOld = oldVal.slice(0, oldPos);
      const invalidBefore = beforeOld.length - beforeOld.replace(PINYIN_CHAR_REGEX, '').length;
      inputEl.value = filtered;
      inputEl.selectionStart = inputEl.selectionEnd = oldPos - invalidBefore;
    }
  });
}

function normalizeEnglishDefinitionAnswer(value) {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/['’‘]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function removeDefinitionParentheticalText(value) {
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

function getDefinitionAnswerCandidates(definition) {
  const source = String(definition || '');
  const sourceWithoutParentheses = removeDefinitionParentheticalText(source);
  const candidates = [source, sourceWithoutParentheses];

  [source, sourceWithoutParentheses].forEach(function (candidateSource) {
    candidateSource.split(/[;,/]/).forEach(function (part) {
      candidates.push(part);
    });
  });

  const normalizedCandidates = [];
  candidates.forEach(function (candidate) {
    const normalized = normalizeEnglishDefinitionAnswer(candidate);
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

function isAcceptedEnglishDefinition(definition, answer) {
  const normalizedAnswer = normalizeEnglishDefinitionAnswer(answer);
  if (!normalizedAnswer) return false;

  const answerVariants = getDefinitionAnswerVariants(normalizedAnswer);
  const candidates = getDefinitionAnswerCandidates(definition);

  return answerVariants.some(function (answerVariant) {
    return candidates.some(function (candidate) {
      return isDefinitionCandidateMatch(answerVariant, candidate);
    });
  });
}

// ── Hover animation helpers ──
function isInsideButton(mx, my, btnIdx, currentBtnWidths) {
  const halfW = currentBtnWidths[btnIdx] / 2;
  const halfH = BTN_HEIGHT / 2;
  return mx >= BUTTON_CENTERS[btnIdx].x - halfW &&
         mx <= BUTTON_CENTERS[btnIdx].x + halfW &&
         my >= BUTTON_CENTERS[btnIdx].y - halfH &&
         my <= BUTTON_CENTERS[btnIdx].y + halfH;
}

function animateButtons(hoveredBtnIndex, currentBtnWidths, drawScreenFn, animRAFRef) {
  const targetWidth = BTN_WIDTH + BTN_HOVER_WIDTH_INCREASE;
  const normalWidth = BTN_WIDTH;
  const speed = 1 / (BTN_HOVER_ANIM_DURATION * 60);

  let changed = false;
  for (let i = 0; i < 4; i++) {
    const target = (i === hoveredBtnIndex) ? targetWidth : normalWidth;
    const diff = target - currentBtnWidths[i];
    if (Math.abs(diff) < 0.5) {
      currentBtnWidths[i] = target;
    } else {
      currentBtnWidths[i] += diff * speed;
      changed = true;
    }
  }

  drawScreenFn();

  if (changed) {
    animRAFRef.current = requestAnimationFrame(function () {
      animateButtons(hoveredBtnIndex, currentBtnWidths, drawScreenFn, animRAFRef);
    });
  } else {
    animRAFRef.current = null;
  }
}

function startAnimating(hoveredBtnIndex, currentBtnWidths, drawScreenFn, animRAFRef) {
  if (!animRAFRef.current) {
    animRAFRef.current = requestAnimationFrame(function () {
      animateButtons(hoveredBtnIndex, currentBtnWidths, drawScreenFn, animRAFRef);
    });
  }
}

// ── Slide animation helpers ──
function slideAnimateContent(timestamp, state, canvasEl, ctx, slideState, drawScreenFn, onComplete) {
  if (!slideState.startTime) {
    slideState.startTime = timestamp;
  }
  const elapsed = (timestamp - slideState.startTime) / 1000;
  const distance = SLIDE_ANIM_INITIAL_SPEED * elapsed + 0.5 * SLIDE_ANIM_ACCELERATION * elapsed * elapsed;
  slideState.offset = -Math.min(distance, window.innerWidth);

  const dpr = window.devicePixelRatio || 1;
  canvasEl.width = window.innerWidth * dpr;
  canvasEl.height = window.innerHeight * dpr;
  canvasEl.style.width = window.innerWidth + 'px';
  canvasEl.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drawScreenFn(ctx, slideState.offset);

  if (Math.abs(slideState.offset) < window.innerWidth) {
    slideState.raf = requestAnimationFrame(function (ts) {
      slideAnimateContent(ts, state, canvasEl, ctx, slideState, drawScreenFn, onComplete);
    });
  } else {
    slideState.offset = 0;
    slideState.raf = null;
    slideState.startTime = null;
    if (onComplete) onComplete();
  }
}

// ── Mistakes Page ──
const MISSED_CELL_WIDTH = 120;
const MISSED_CELL_HEIGHT = 140;
const MISSED_CELL_FONT_SIZE = 48;
const MISSED_PINYIN_FONT_SIZE = 18;
const MISSED_LINE_THICKNESS = 2;
const MISSED_POPUP_WIDTH = 600;
const MISSED_POPUP_HEIGHT = 450;
const MISSED_POPUP_OUTLINE_THICKNESS = 3;
const MISSED_POPUP_OPEN_ANIM_DURATION = 0.1;
const MISSED_POPUP_CLOSE_ANIM_DURATION = 0.07;
const MISSED_POPUP_BLUR_AMOUNT = 5;

let missedWordPopup = null;
let missedWordPopupAnimRAF = null;

function ensureMissedWordPopup() {
  if (missedWordPopup) return missedWordPopup;

  const overlay = document.createElement('div');
  const popupWindow = document.createElement('div');
  const char = document.createElement('span');
  const pinyin = document.createElement('span');
  const definition = document.createElement('div');
  const examples = document.createElement('div');
  const closeButton = document.createElement('button');

  overlay.id = 'missedWordPopupOverlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '20000',
  });

  popupWindow.id = 'missedWordPopupWindow';
  Object.assign(popupWindow.style, {
    position: 'relative',
    width: MISSED_POPUP_WIDTH + 'px',
    height: MISSED_POPUP_HEIGHT + 'px',
    background: 'white',
    border: MISSED_POPUP_OUTLINE_THICKNESS + 'px solid black',
    transformOrigin: 'center center',
  });

  Object.assign(char.style, {
    position: 'absolute',
    left: '32px',
    top: '32px',
    fontFamily: 'DFFangSong, serif',
    fontSize: '80px',
    color: 'black',
    lineHeight: '1',
    pointerEvents: 'none',
  });

  Object.assign(pinyin.style, {
    position: 'absolute',
    left: '72px',
    top: '127px',
    transform: 'translateX(-50%)',
    fontFamily: 'Times New Roman, serif',
    fontSize: '18px',
    color: 'black',
    lineHeight: '1',
    pointerEvents: 'none',
  });

  Object.assign(definition.style, {
    position: 'absolute',
    left: '37px',
    top: '175px',
    fontFamily: 'Times New Roman, serif',
    fontSize: '20px',
    color: 'black',
    lineHeight: '1',
    pointerEvents: 'none',
  });

  Object.assign(examples.style, {
    position: 'absolute',
    left: '37px',
    top: '215px',
    fontFamily: 'Times New Roman, serif',
    fontSize: '20px',
    color: 'black',
    lineHeight: '1.3',
    pointerEvents: 'none',
  });

  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close word details');
  closeButton.textContent = '\u2715';
  Object.assign(closeButton.style, {
    position: 'absolute',
    left: '555px',
    top: '8px',
    width: '32px',
    height: '32px',
    background: 'black',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Times New Roman, serif',
    fontSize: '18px',
    lineHeight: '1',
  });

  popupWindow.appendChild(char);
  popupWindow.appendChild(pinyin);
  popupWindow.appendChild(definition);
  popupWindow.appendChild(examples);
  popupWindow.appendChild(closeButton);
  overlay.appendChild(popupWindow);
  document.body.appendChild(overlay);

  missedWordPopup = {
    overlay: overlay,
    window: popupWindow,
    char: char,
    pinyin: pinyin,
    definition: definition,
    examples: examples,
    closeButton: closeButton,
  };

  closeButton.addEventListener('click', function (event) {
    event.stopPropagation();
    closeMissedWordPopup();
  });
  overlay.addEventListener('click', function (event) {
    event.stopPropagation();
    if (event.target === overlay) closeMissedWordPopup();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.style.display === 'flex') {
      closeMissedWordPopup();
    }
  });

  return missedWordPopup;
}

function isMissedWordPopupOpen() {
  return Boolean(
    missedWordPopup &&
    missedWordPopup.overlay.style.display === 'flex'
  );
}

function closeMissedWordPopup() {
  if (!missedWordPopup || missedWordPopup.overlay.style.display !== 'flex') return;

  if (missedWordPopupAnimRAF) {
    cancelAnimationFrame(missedWordPopupAnimRAF);
    missedWordPopupAnimRAF = null;
  }

  let startTime = null;
  const duration = MISSED_POPUP_CLOSE_ANIM_DURATION * 1000;

  function animateClose(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const amount = Math.min(elapsed / duration, 1);
    const scale = 1 - amount;
    const blur = MISSED_POPUP_BLUR_AMOUNT * (1 - amount);

    missedWordPopup.window.style.transform = 'scale(' + scale + ')';
    missedWordPopup.overlay.style.backdropFilter = 'blur(' + blur + 'px)';
    missedWordPopup.overlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';

    if (amount < 1) {
      missedWordPopupAnimRAF = requestAnimationFrame(animateClose);
    } else {
      missedWordPopup.overlay.style.display = 'none';
      missedWordPopup.window.style.transform = '';
      missedWordPopup.overlay.style.backdropFilter = '';
      missedWordPopup.overlay.style.webkitBackdropFilter = '';
      missedWordPopupAnimRAF = null;
    }
  }

  missedWordPopupAnimRAF = requestAnimationFrame(animateClose);
}

function openMissedWordPopup(details, originX, originY) {
  const popup = ensureMissedWordPopup();
  const detailText = String(details.char || '');
  const detailCharacterCount = Math.max(1, Array.from(detailText).length);
  const detailExamples = Array.isArray(details.examples) ? details.examples : [];
  popup.char.textContent = details.char;
  popup.pinyin.textContent = details.pinyin;
  popup.pinyin.style.left = (32 + detailCharacterCount * 80 / 2) + 'px';
  popup.definition.textContent = details.definition;
  popup.examples.style.display = detailExamples.length ? 'block' : 'none';
  popup.examples.innerHTML = detailExamples.join('<br>');

  if (missedWordPopupAnimRAF) {
    cancelAnimationFrame(missedWordPopupAnimRAF);
    missedWordPopupAnimRAF = null;
  }

  popup.overlay.style.display = 'flex';
  const startOffsetX = originX - window.innerWidth / 2;
  const startOffsetY = originY - window.innerHeight / 2;
  let startTime = null;
  const duration = MISSED_POPUP_OPEN_ANIM_DURATION * 1000;

  function animateOpen(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const amount = Math.min(elapsed / duration, 1);
    const scale = amount;
    const offsetX = startOffsetX * (1 - amount);
    const offsetY = startOffsetY * (1 - amount);
    const blur = MISSED_POPUP_BLUR_AMOUNT * amount;

    popup.window.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';
    popup.overlay.style.backdropFilter = 'blur(' + blur + 'px)';
    popup.overlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';

    if (amount < 1) {
      missedWordPopupAnimRAF = requestAnimationFrame(animateOpen);
    } else {
      popup.window.style.transform = '';
      missedWordPopupAnimRAF = null;
    }
  }

  missedWordPopupAnimRAF = requestAnimationFrame(animateOpen);
}

function showMissedWordsPage(
  missedChars,
  getChar,
  getPinyin,
  getDefinition,
  getExamples,
  returnUrl,
  correctCount,
  questionCount,
  sessionXp,
  showSessionXp
) {
  const missedPage = document.getElementById('missedPage');
  const missedCanvas = document.getElementById('missedCanvas');
  const okButton = document.getElementById('okButton');
  const missedTitle = document.getElementById('missedTitle');
  const missedAccuracy = document.getElementById('missedAccuracy');
  const missedXp = document.getElementById('missedXp');
  const hasMistakes = missedChars.length > 0;
  const earnedXp = Math.max(0, Math.floor(Number(sessionXp) || 0));

  if (showSessionXp && earnedXp > 0) {
    const xpSystem = window.CHINESE_READER_XP;
    const totalXp = getCurrentXpTotal();
    if (xpSystem && typeof xpSystem.queueXpAnimation === 'function') {
      xpSystem.queueXpAnimation(localStorage, Math.max(0, totalXp - earnedXp), totalXp);
    }
  }

  if (missedTitle) {
    missedTitle.textContent = 'Mistakes';
    missedTitle.style.display = hasMistakes ? 'block' : 'none';
  }
  if (missedAccuracy) {
    const accuracy = questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0;
    missedAccuracy.textContent = 'Accuracy ' + accuracy + '%';
  }
  if (missedXp) {
    missedXp.textContent = String(earnedXp) + ' XP';
    missedXp.style.display = showSessionXp ? 'block' : 'none';
  }

  missedPage.style.display = 'block';

  const cols = Math.max(1, Math.min(missedChars.length, 5));
  const rows = Math.ceil(missedChars.length / cols);
  const gridWidth = cols * MISSED_CELL_WIDTH + MISSED_LINE_THICKNESS;
  const gridHeight = rows * MISSED_CELL_HEIGHT + MISSED_LINE_THICKNESS;

  const dpr = window.devicePixelRatio || 1;
  missedCanvas.width = gridWidth * dpr;
  missedCanvas.height = gridHeight * dpr;
  missedCanvas.style.width = gridWidth + 'px';
  missedCanvas.style.height = gridHeight + 'px';
  missedCanvas.style.cursor = 'pointer';
  missedCanvas.style.display = hasMistakes ? 'block' : 'none';

  const ctx = missedCanvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const offsetX = (window.innerWidth - gridWidth) / 2;
  missedCanvas.style.marginLeft = offsetX + 'px';
  missedCanvas.style.marginTop = '8px';

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = MISSED_LINE_THICKNESS;
  const halfLine = MISSED_LINE_THICKNESS / 2;

  for (let i = 0; i < missedChars.length; i++) {
    const idx = missedChars[i];
    const char = getChar(idx);
    const pinyin = getPinyin(idx);

    const row = Math.floor(i / cols);
    const col = i % cols;
    const cellX = col * MISSED_CELL_WIDTH + halfLine;
    const cellY = row * MISSED_CELL_HEIGHT + halfLine;
    const centerX = col * MISSED_CELL_WIDTH + MISSED_CELL_WIDTH / 2 + halfLine;
    const centerY = row * MISSED_CELL_HEIGHT + MISSED_CELL_HEIGHT / 2 - 12 + halfLine;

    // Drawing only populated cells keeps a partial final row from showing
    // empty boxes while preserving the existing five-column grid layout.
    ctx.strokeRect(cellX, cellY, MISSED_CELL_WIDTH, MISSED_CELL_HEIGHT);

    setFittedQuizFont(
      ctx,
      char,
      MISSED_CELL_FONT_SIZE,
      28,
      '"DFFangSong", serif',
      MISSED_CELL_WIDTH - 20
    );
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, centerX, centerY);

    setFittedQuizFont(
      ctx,
      pinyin,
      MISSED_PINYIN_FONT_SIZE,
      12,
      '"Times New Roman", serif',
      MISSED_CELL_WIDTH - 20
    );
    ctx.fillText(pinyin, centerX, centerY + 38);
  }

  missedCanvas.addEventListener('click', function (event) {
    const rect = missedCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const col = Math.floor(mouseX / MISSED_CELL_WIDTH);
    const row = Math.floor(mouseY / MISSED_CELL_HEIGHT);

    if (col < 0 || col >= cols || row < 0 || row >= rows) return;

    const itemIndex = row * cols + col;
    if (itemIndex >= missedChars.length) return;

    const wordIndex = missedChars[itemIndex];
    const examples = typeof getExamples === 'function' ? getExamples(wordIndex) : [];
    openMissedWordPopup({
      char: getChar(wordIndex),
      pinyin: getPinyin(wordIndex),
      definition: typeof getDefinition === 'function' ? getDefinition(wordIndex) : '',
      examples: Array.isArray(examples) ? examples : [],
    }, rect.left + (col + 0.5) * MISSED_CELL_WIDTH, rect.top + (row + 0.5) * MISSED_CELL_HEIGHT);
  });

  okButton.style.width = '250px';
  okButton.style.height = '75px';
  okButton.style.fontSize = '30px';
  okButton.style.transition = 'width 0.2s, height 0.2s';

  const hoverScale = 1.1;
  okButton.addEventListener('mouseenter', function () {
    okButton.style.width = (250 * hoverScale) + 'px';
    okButton.style.height = (75 * hoverScale) + 'px';
  });

  okButton.addEventListener('mouseleave', function () {
    okButton.style.width = '250px';
    okButton.style.height = '75px';
  });

  okButton.addEventListener('click', function () {
    window.location.href = returnUrl || 'index.html';
  });
}

// ── Enter key to skip MC question ──
// Call once per quiz page. Pass state getters and action callbacks.
function setupEnterKeySkipMC(config) {
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;

    const s = config.getState();
    if (s.answered || s.slideAnimRAF) return;
    if (s.currentQuestionType !== 'mc') return;

    s.setAnswered(true);
    s.setDontKnowMode(true);
    s.setClickedBtnIndex(null);

    const charIdx = s.getCurrentCharIndex();
    s.addMissedChar(charIdx);

    s.drawScreen();

    setTimeout(function () {
      s.moveToNext();
    }, 500);
  });
}

// ---- Shared quiz runner and page modes ----

function shuffleInPlace(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function addUnique(items, value) {
  if (items.indexOf(value) === -1) {
    items.push(value);
  }
}

function getProgressKeyForUnit(unit) {
  return unit === 0 ? 'charProgress' : 'charProgress_' + unit;
}

function getFlatUnitData() {
  const characters = [];
  const pinyin = [];
  const unitOffsets = [];
  let offset = 0;

  for (let unit = 0; unit < UNIT_DATA.length; unit++) {
    unitOffsets.push(offset);
    characters.push.apply(characters, UNIT_DATA[unit].characters);
    pinyin.push.apply(pinyin, UNIT_DATA[unit].pinyin);
    offset += UNIT_DATA[unit].characters.length;
  }

  return {
    characters: characters,
    pinyin: pinyin,
    unitOffsets: unitOffsets,
    total: offset,
  };
}

function getAllUnitProgress() {
  const result = {};
  let offset = 0;

  for (let unit = 0; unit < UNIT_DATA.length; unit++) {
    const data = JSON.parse(localStorage.getItem(getProgressKeyForUnit(unit)) || '{}');
    const charCount = UNIT_DATA[unit].characters.length;

    for (let i = 0; i < charCount; i++) {
      const value = data[String(i)];
      if (value) {
        result[String(offset + i)] = value;
      }
    }

    offset += charCount;
  }

  return result;
}

function getUnitLocalForGlobal(globalIndex) {
  let offset = 0;

  for (let unit = 0; unit < UNIT_DATA.length; unit++) {
    const charCount = UNIT_DATA[unit].characters.length;
    if (globalIndex < offset + charCount) {
      return {
        unit: unit,
        localIndex: globalIndex - offset,
        offset: offset,
      };
    }
    offset += charCount;
  }

  return {
    unit: UNIT_DATA.length - 1,
    localIndex: UNIT_DATA[UNIT_DATA.length - 1].characters.length - 1,
    offset: offset - UNIT_DATA[UNIT_DATA.length - 1].characters.length,
  };
}

function getGlobalIndexForUnitLocal(unit, localIndex) {
  let offset = 0;
  for (let i = 0; i < unit; i++) {
    offset += UNIT_DATA[i].characters.length;
  }
  return offset + localIndex;
}

const KNOWLEDGE_STORAGE_KEY = 'charKnowledge';
const LEGACY_MISTAKE_STORAGE_KEY = 'charMistakes';

function getStoredNumberMap(storageKey) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  } catch (error) {
    return {};
  }
}

function getCurrentXpTotal() {
  const xpSystem = window.CHINESE_READER_XP;
  return xpSystem && typeof xpSystem.getTotalXp === 'function'
    ? xpSystem.getTotalXp(localStorage)
    : 0;
}

function awardCompletedItemXp(correctItems, getProgressForIndex) {
  const xpSystem = window.CHINESE_READER_XP;
  if (!xpSystem || typeof xpSystem.awardCompletedAnswerXp !== 'function') return;

  const completeProgress = Number(xpSystem.COMPLETE_PROGRESS) || 6;
  const provisionalProgress = new Map();
  correctItems.forEach(function (index) {
    const currentProgress = provisionalProgress.has(index)
      ? provisionalProgress.get(index)
      : Number(getProgressForIndex(index)) || 0;

    if (currentProgress >= completeProgress) {
      xpSystem.awardCompletedAnswerXp(localStorage, currentProgress);
    } else {
      provisionalProgress.set(index, currentProgress + 1);
    }
  });
}

function hasValidStoredNumberMap(storageKey) {
  const storedValue = localStorage.getItem(storageKey);
  if (storedValue === null) return false;

  try {
    const stored = JSON.parse(storedValue);
    return stored && typeof stored === 'object' && !Array.isArray(stored);
  } catch (error) {
    return false;
  }
}

function getTotalCharacterCount() {
  return UNIT_DATA.reduce(function (total, unitData) {
    return total + unitData.characters.length;
  }, 0);
}

function getKnowledgeScores() {
  const hasStoredKnowledge = hasValidStoredNumberMap(KNOWLEDGE_STORAGE_KEY);
  const scores = getStoredNumberMap(KNOWLEDGE_STORAGE_KEY);
  const progress = getAllUnitProgress();
  const legacyMistakes = hasStoredKnowledge ? {} : getStoredNumberMap(LEGACY_MISTAKE_STORAGE_KEY);
  let changed = !hasStoredKnowledge;

  for (let i = 0; i < getTotalCharacterCount(); i++) {
    const key = String(i);
    const storedScore = Number(scores[key]);

    if (Number.isFinite(storedScore)) {
      const normalizedScore = Math.trunc(storedScore);
      if (scores[key] !== normalizedScore) {
        scores[key] = normalizedScore;
        changed = true;
      }
      continue;
    }

    const progressValue = parseInt(progress[key], 10) || 0;
    const legacyMistakeCount = parseInt(legacyMistakes[key], 10) || 0;
    scores[key] = progressValue - legacyMistakeCount;
    changed = true;
  }

  if (changed) {
    localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(scores));
  }

  return scores;
}

function getQuestionGlobalIndex(question) {
  if (!question) return null;

  const unit = Number(question.unit);
  const localIndex = Number(question.localIndex);
  if (
    Number.isInteger(unit) &&
    Number.isInteger(localIndex) &&
    unit >= 0 &&
    unit < UNIT_DATA.length &&
    localIndex >= 0 &&
    localIndex < UNIT_DATA[unit].characters.length
  ) {
    return getGlobalIndexForUnitLocal(unit, localIndex);
  }

  const globalIndex = Number(question.charIndex);
  const totalCharacters = getTotalCharacterCount();
  return Number.isInteger(globalIndex) && globalIndex >= 0 && globalIndex < totalCharacters ?
    globalIndex :
    null;
}

function adjustQuestionKnowledge(question, change) {
  const globalIndex = getQuestionGlobalIndex(question);
  if (globalIndex === null) return;

  const scores = getKnowledgeScores();
  const key = String(globalIndex);
  const previousScore = Number(scores[key]);
  scores[key] = (Number.isFinite(previousScore) ? Math.trunc(previousScore) : 0) + change;
  localStorage.setItem(KNOWLEDGE_STORAGE_KEY, JSON.stringify(scores));
}

function getCharForGlobalIndex(globalIndex) {
  const info = getUnitLocalForGlobal(globalIndex);
  return UNIT_DATA[info.unit].characters[info.localIndex];
}

function getPinyinForGlobalIndex(globalIndex) {
  const info = getUnitLocalForGlobal(globalIndex);
  return UNIT_DATA[info.unit].pinyin[info.localIndex];
}

function getTargetedWordValueRows(includeIneligible) {
  const knowledgeScores = getKnowledgeScores();
  const progress = getAllUnitProgress();
  const rows = [];

  for (let globalIndex = 0; globalIndex < getTotalCharacterCount(); globalIndex++) {
    const info = getUnitLocalForGlobal(globalIndex);
    const progressValue = parseInt(progress[String(globalIndex)], 10) || 0;
    const knowledgeValue = Number(knowledgeScores[String(globalIndex)]) || 0;
    const targetedEligible = progressValue > 0 || knowledgeValue !== 0;

    if (!includeIneligible && !targetedEligible) continue;

    rows.push({
      globalIndex: globalIndex,
      character: getCharForGlobalIndex(globalIndex),
      pinyin: getPinyinForGlobalIndex(globalIndex),
      value: knowledgeValue,
      progress: progressValue,
      targetedEligible: targetedEligible,
      unit: info.unit + 1,
      unitIndex: info.unit,
      wordIndex: info.localIndex,
    });
  }

  rows.sort(function (first, second) {
    return first.value - second.value || first.globalIndex - second.globalIndex;
  });

  return rows.map(function (row, index) {
    return Object.assign({ rank: index + 1 }, row);
  });
}

// Browser-console diagnostics for the values that Targeted review mode uses.
// Call showTargetedWordValues() for the real Targeted pool, or pass true to
// include untouched words that are not yet eligible for Targeted review.
window.getTargetedWordValues = function (includeIneligible) {
  return getTargetedWordValueRows(Boolean(includeIneligible));
};

window.showTargetedWordValues = function (includeIneligible) {
  const rows = getTargetedWordValueRows(Boolean(includeIneligible));
  console.table(rows);
  return rows;
};

const PHRASE_KNOWLEDGE_STORAGE_KEY = 'phraseKnowledge';

function isPhraseQuizContentMode() {
  return new URLSearchParams(window.location.search).get('content') === 'phrases';
}

function getPhraseProgressKeyForUnit(unit) {
  return unit === 0 ? 'phraseProgress' : 'phraseProgress_' + unit;
}

function getFlatPhraseData() {
  const phraseUnits = Array.isArray(window.CHINESE_READER_PHRASE_UNITS)
    ? window.CHINESE_READER_PHRASE_UNITS
    : [];
  const flatData = {
    units: phraseUnits,
    phrases: [],
    pinyin: [],
    definitions: [],
    unitOffsets: [],
    total: 0,
  };

  phraseUnits.forEach(function (unit) {
    if (
      !unit
      || !Array.isArray(unit.phrases)
      || !Array.isArray(unit.pinyin)
      || !Array.isArray(unit.definitions)
      || unit.phrases.length !== unit.pinyin.length
      || unit.phrases.length !== unit.definitions.length
    ) {
      throw new Error('Phrase quiz units must contain aligned phrase, pinyin, and definition arrays.');
    }

    flatData.unitOffsets.push(flatData.total);
    flatData.phrases.push.apply(flatData.phrases, unit.phrases);
    flatData.pinyin.push.apply(flatData.pinyin, unit.pinyin);
    flatData.definitions.push.apply(flatData.definitions, unit.definitions);
    flatData.total += unit.phrases.length;
  });

  return flatData;
}

function getPhraseUnitLocalForGlobal(globalIndex, flatData) {
  for (let unit = flatData.unitOffsets.length - 1; unit >= 0; unit--) {
    const offset = flatData.unitOffsets[unit];
    if (globalIndex >= offset) {
      return { unit: unit, localIndex: globalIndex - offset, offset: offset };
    }
  }
  return { unit: 0, localIndex: globalIndex, offset: 0 };
}

function getAllPhraseProgressForFlatData(flatData) {
  const progress = {};
  flatData.units.forEach(function (unit, unitIndex) {
    const unitProgress = getStoredNumberMap(getPhraseProgressKeyForUnit(unitIndex));
    const offset = flatData.unitOffsets[unitIndex];
    for (let localIndex = 0; localIndex < unit.phrases.length; localIndex++) {
      const value = Number(unitProgress[String(localIndex)]) || 0;
      if (value > 0) progress[String(offset + localIndex)] = value;
    }
  });
  return progress;
}

function getPhraseKnowledgeScores() {
  const scores = getStoredNumberMap(PHRASE_KNOWLEDGE_STORAGE_KEY);
  let changed = false;

  Object.keys(scores).forEach(function (key) {
    const numericScore = Number(scores[key]);
    if (!Number.isFinite(numericScore)) {
      delete scores[key];
      changed = true;
      return;
    }
    const normalizedScore = Math.trunc(numericScore);
    if (scores[key] !== normalizedScore) {
      scores[key] = normalizedScore;
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(PHRASE_KNOWLEDGE_STORAGE_KEY, JSON.stringify(scores));
  }
  return scores;
}

function getPhraseQuestionGlobalIndex(question, flatData) {
  const trackIndex = Number(
    question && question.trackIndex !== undefined
      ? question.trackIndex
      : question && question.charIndex
  );
  return Number.isInteger(trackIndex) && trackIndex >= 0 && trackIndex < flatData.total
    ? trackIndex
    : null;
}

function adjustPhraseQuestionKnowledge(question, change, flatData) {
  const globalIndex = getPhraseQuestionGlobalIndex(question, flatData);
  if (globalIndex === null) return;

  const scores = getPhraseKnowledgeScores();
  const key = String(globalIndex);
  const previousScore = Number(scores[key]);
  scores[key] = (Number.isFinite(previousScore) ? Math.trunc(previousScore) : 0) + change;
  localStorage.setItem(PHRASE_KNOWLEDGE_STORAGE_KEY, JSON.stringify(scores));
}

function makeFlatPhraseQuestion(globalIndex, type, flatData) {
  const definition = flatData.definitions[globalIndex];
  const question = {
    type: type,
    charIndex: globalIndex,
    trackIndex: globalIndex,
    char: flatData.phrases[globalIndex],
    pinyin: flatData.pinyin[globalIndex],
    definition: definition,
  };

  if (type === 'mc') {
    const answers = pickAnswers(globalIndex, flatData.definitions);
    question.answers = answers;
    question.correctAnswerIndex = answers.indexOf(definition);
  }
  return question;
}

function getTargetedPhraseValueRows(includeIneligible) {
  const flatData = getFlatPhraseData();
  const progress = getAllPhraseProgressForFlatData(flatData);
  const knowledgeScores = getPhraseKnowledgeScores();
  const rows = [];

  for (let globalIndex = 0; globalIndex < flatData.total; globalIndex++) {
    const key = String(globalIndex);
    const info = getPhraseUnitLocalForGlobal(globalIndex, flatData);
    const progressValue = Number(progress[key]) || 0;
    const encountered = progressValue > 0;
    if (!includeIneligible && !encountered) continue;

    rows.push({
      globalIndex: globalIndex,
      phrase: flatData.phrases[globalIndex],
      pinyin: flatData.pinyin[globalIndex],
      definition: flatData.definitions[globalIndex],
      value: Number(knowledgeScores[key]) || 0,
      progress: progressValue,
      targetedEligible: encountered,
      unit: info.unit + 1,
      unitIndex: info.unit,
      phraseIndex: info.localIndex,
    });
  }

  rows.sort(function (first, second) {
    return first.value - second.value || first.globalIndex - second.globalIndex;
  });
  return rows.map(function (row, index) {
    return Object.assign({ rank: index + 1 }, row);
  });
}

window.getTargetedPhraseValues = function (includeIneligible) {
  return getTargetedPhraseValueRows(Boolean(includeIneligible));
};

window.showTargetedPhraseValues = function (includeIneligible) {
  const rows = getTargetedPhraseValueRows(Boolean(includeIneligible));
  console.table(rows);
  return rows;
};

function getWordDetailsForUnitLocal(unit, localIndex) {
  const allDetails = window.WORD_DETAIL_DATA || [];
  const unitDetails = allDetails[unit] || {};
  return {
    definition: (unitDetails.definitions || [])[localIndex] || '',
    examples: (unitDetails.examples || [])[localIndex] || [],
  };
}

function getDefinitionForGlobalIndex(globalIndex) {
  const info = getUnitLocalForGlobal(globalIndex);
  return getWordDetailsForUnitLocal(info.unit, info.localIndex).definition;
}

function getExamplesForGlobalIndex(globalIndex) {
  const info = getUnitLocalForGlobal(globalIndex);
  return getWordDetailsForUnitLocal(info.unit, info.localIndex).examples;
}

function makeFlatQuestion(globalIndex, type, flatData) {
  return {
    type: type,
    charIndex: globalIndex,
    trackIndex: globalIndex,
    answerIndex: globalIndex,
    answerPool: flatData.pinyin,
    char: flatData.characters[globalIndex],
    pinyin: flatData.pinyin[globalIndex],
    definition: getDefinitionForGlobalIndex(globalIndex),
  };
}

function makeUnitQuestion(unit, localIndex, type, trackIndex) {
  const unitData = UNIT_DATA[unit];
  return {
    type: type,
    unit: unit,
    localIndex: localIndex,
    charIndex: trackIndex,
    trackIndex: trackIndex,
    answerIndex: localIndex,
    answerPool: unitData.pinyin,
    char: unitData.characters[localIndex],
    pinyin: unitData.pinyin[localIndex],
    definition: getWordDetailsForUnitLocal(unit, localIndex).definition,
  };
}

function createQuizRunner(config) {
  const canvas = document.getElementById(config.canvasId);
  const typingInput = document.getElementById(config.inputId);
  const questions = config.questions || [];

  if (!canvas || !typingInput) {
    throw new Error('Quiz runner requires valid canvas and input elements.');
  }

  // Pinyin and short definition answers are intentionally outside the
  // browser's natural-language spelling model. Disable native and common
  // third-party writing assistance so correct answers are never underlined.
  typingInput.spellcheck = false;
  typingInput.setAttribute('spellcheck', 'false');
  typingInput.setAttribute('autocomplete', 'off');
  typingInput.setAttribute('autocorrect', 'off');
  typingInput.setAttribute('autocapitalize', 'off');
  typingInput.setAttribute('writingsuggestions', 'false');
  typingInput.setAttribute('data-gramm', 'false');
  typingInput.setAttribute('data-gramm_editor', 'false');
  typingInput.setAttribute('data-enable-grammarly', 'false');

  const ctx = canvas.getContext('2d');
  const correctItems = [];
  const missedItems = [];
  const missedItemCounts = new Map();

  let currentQuestionIndex = 0;
  let displayQuestionNum = 1;
  let currentPrepared = null;
  let nextPrepared = null;

  let answered = false;
  let clickedBtnIndex = null;
  let dontKnowMode = false;
  let typingState = 'active';
  let typingAnswerDone = false;
  let pinyinDefinitionRetryUsed = false;
  let pinyinInputWarning = '';
  let answerRecoverySnapshot = null;
  let waitingForFeedbackAdvance = false;
  let listeningSession = null;
  let listeningUnavailable = false;

  let hoveredBtnIndex = null;
  let currentBtnWidths = [BTN_WIDTH, BTN_WIDTH, BTN_WIDTH, BTN_WIDTH];
  let animRAF = null;

  let slideOffset = 0;
  let slideAnimRAF = null;
  let slideAnimStart = null;

  let correctStreak = 0;
  let streakRgbActive = false;
  let streakRgbPending = false;
  let streakRgbHueOffset = 0;
  let streakRgbRAF = null;
  let streakBannerPhase = 'hidden';
  let streakBannerPhaseStart = null;
  let streakBannerOpacity = 0;
  let streakBannerOffsetY = -STREAK_BANNER_TIER_CONFIGS[1].enterOffset;
  let streakBannerScale = 0.96;
  let streakBannerHueOffset = 0;
  let streakBannerRAF = null;
  let streakBannerCount = STREAK_REQUIRED_CORRECT;
  let streakBannerTier = 1;
  let finishAfterStreakBanner = false;

  // The quiz canvas sits below HTML controls such as typing inputs and the
  // Review options. Render the streak notice as its own top-level layer so
  // its opaque panel covers both canvas content and those controls.
  const streakBannerElement = document.createElement('div');
  const streakBannerForeground = document.createElement('div');
  const streakBannerNumberTile = document.createElement('div');
  const streakBannerLabel = document.createElement('div');
  const streakBannerAccent = document.createElement('div');

  streakBannerElement.id = 'streakBannerOverlay';
  streakBannerElement.setAttribute('role', 'status');
  streakBannerElement.setAttribute('aria-live', 'polite');
  streakBannerElement.setAttribute('aria-hidden', 'true');
  Object.assign(streakBannerElement.style, {
    position: 'fixed',
    top: STREAK_BANNER_TOP_GAP + 'px',
    left: '50%',
    width: STREAK_BANNER_WIDTH + 'px',
    height: STREAK_BANNER_HEIGHT + 'px',
    display: 'none',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: '#ffffff',
    border: STREAK_BANNER_BORDER_THICKNESS + 'px solid #000000',
    borderRadius: STREAK_BANNER_CORNER_RADIUS + 'px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
    opacity: '1',
    isolation: 'isolate',
    pointerEvents: 'none',
    transformOrigin: 'center center',
    zIndex: '9000',
  });

  Object.assign(streakBannerForeground.style, {
    position: 'absolute',
    inset: '0',
    opacity: '0',
  });

  const streakBannerTileInset = (
    STREAK_BANNER_HEIGHT - STREAK_BANNER_NUMBER_TILE_SIZE
  ) / 2 - STREAK_BANNER_BORDER_THICKNESS;
  Object.assign(streakBannerNumberTile.style, {
    position: 'absolute',
    top: streakBannerTileInset + 'px',
    left: streakBannerTileInset + 'px',
    width: STREAK_BANNER_NUMBER_TILE_SIZE + 'px',
    height: STREAK_BANNER_NUMBER_TILE_SIZE + 'px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    borderRadius: '8px',
    color: '#ffffff',
    font: 'bold 24px "Times New Roman", serif',
    lineHeight: '1',
  });

  Object.assign(streakBannerLabel.style, {
    position: 'absolute',
    left: (
      streakBannerTileInset + STREAK_BANNER_NUMBER_TILE_SIZE + 14
    ) + 'px',
    top: '50%',
    color: '#000000',
    font: '22px "Times New Roman", serif',
    lineHeight: '1',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
  });
  streakBannerLabel.textContent = 'in a row';

  Object.assign(streakBannerAccent.style, {
    position: 'absolute',
    left: (13 - STREAK_BANNER_BORDER_THICKNESS) + 'px',
    right: (13 - STREAK_BANNER_BORDER_THICKNESS) + 'px',
    bottom: (4 - STREAK_BANNER_BORDER_THICKNESS / 2) + 'px',
    height: '3px',
    borderRadius: '2px',
  });

  streakBannerForeground.appendChild(streakBannerNumberTile);
  streakBannerForeground.appendChild(streakBannerLabel);
  streakBannerForeground.appendChild(streakBannerAccent);
  streakBannerElement.appendChild(streakBannerForeground);
  document.body.appendChild(streakBannerElement);

  function getQuestionType(question) {
    if (question.type === 'mc') return 'mc';
    if (question.type === 'definition') return 'definition';
    if (question.type === 'listening') return 'listening';
    return 'typing';
  }

  function getTrackIndex(question) {
    if (typeof config.getTrackIndex === 'function') {
      return config.getTrackIndex(question);
    }
    if (question.trackIndex !== undefined) return question.trackIndex;
    return question.charIndex;
  }

  function prepareQuestion(question) {
    const prepared = {
      question: question,
      type: getQuestionType(question),
      char: question.char,
      pinyin: question.pinyin,
      definition: question.definition || '',
      audioUrl: question.audioUrl || '',
      streakRgb: question.type === 'listening' ? false : streakRgbActive,
    };

    if (prepared.type === 'mc') {
      const answers = question.answers ?
        question.answers.slice() :
        pickAnswers(question.answerIndex, question.answerPool);
      prepared.answers = answers;
      prepared.correctAnswerIndex = question.correctAnswerIndex !== undefined ?
        question.correctAnswerIndex :
        answers.indexOf(question.pinyin);
    }

    return prepared;
  }

  function isStreakRgbVisible() {
    if (currentPrepared && currentPrepared.streakRgb) {
      if (currentPrepared.type === 'mc' || typingState === 'active') return true;
    }
    return Boolean(slideAnimRAF && nextPrepared && nextPrepared.streakRgb);
  }

  function updateTypingInputStreakBorder() {
    if (
      !currentPrepared ||
      currentPrepared.type === 'mc' ||
      typingInput.style.display === 'none' ||
      typingState !== 'active'
    ) {
      return;
    }

    if (currentPrepared.streakRgb) {
      typingInput.style.borderColor = 'transparent';
      typingInput.style.borderImageSource = getSlidingRgbCssGradient(streakRgbHueOffset);
      typingInput.style.borderImageSlice = '1';
    } else {
      typingInput.style.borderImage = 'none';
      typingInput.style.borderColor = 'black';
    }
  }

  function animateStreakRgb(timestamp) {
    if (!isStreakRgbVisible()) {
      streakRgbRAF = null;
      return;
    }

    streakRgbHueOffset = (timestamp * STREAK_RGB_HUE_SPEED) % 360;
    updateTypingInputStreakBorder();

    // The slide and streak-banner loops already redraw the canvas while active.
    // Keeping one drawing owner prevents competing frames from shaking content.
    if (!slideAnimRAF && !streakBannerRAF) {
      drawScreen();
    }

    streakRgbRAF = requestAnimationFrame(animateStreakRgb);
  }

  function ensureStreakRgbAnimation() {
    if (!streakRgbRAF && isStreakRgbVisible()) {
      streakRgbRAF = requestAnimationFrame(animateStreakRgb);
    }
  }

  function stopStreakRgbAnimation() {
    if (streakRgbRAF) {
      cancelAnimationFrame(streakRgbRAF);
      streakRgbRAF = null;
    }
  }

  function destroyListeningSession() {
    if (!listeningSession) return;
    listeningSession.destroy();
    listeningSession = null;
    listeningUnavailable = false;
  }

  function startListeningSession(prepared) {
    const listeningApi = window.CHINESE_READER_LISTENING;
    if (!listeningApi || !prepared.audioUrl) {
      throw new Error('Listening question requires a local audio asset.');
    }

    const controller = listeningApi.createAudioController({
      onStateChange: function (state) {
        listeningUnavailable = Boolean(state.error);
        if (currentPrepared && currentPrepared.type === 'listening' && !slideAnimRAF) {
          drawScreen();
        }
      },
    });
    listeningSession = listeningApi.createQuestionSession({
      controller: controller,
      audioUrl: prepared.audioUrl,
    });
    listeningSession.play();
  }

  function resetForPrepared(prepared) {
    destroyListeningSession();
    currentPrepared = prepared;
    hoveredBtnIndex = null;
    pinyinDefinitionRetryUsed = false;
    pinyinInputWarning = '';
    answerRecoverySnapshot = null;
    waitingForFeedbackAdvance = false;
    canvas.style.cursor = 'default';

    if (prepared.type === 'mc') {
      answered = false;
      clickedBtnIndex = null;
      dontKnowMode = false;
      currentBtnWidths = [BTN_WIDTH, BTN_WIDTH, BTN_WIDTH, BTN_WIDTH];
      hideTypingInput(typingInput);
    } else if (prepared.type === 'listening') {
      answered = false;
      typingAnswerDone = false;
      hideTypingInput(typingInput);
      startListeningSession(prepared);
    } else {
      typingState = 'active';
      typingAnswerDone = false;
      showTypingInput(typingInput, canvas, prepared.type);
      updateTypingInputStreakBorder();
    }

    if (typeof config.onQuestionChange === 'function') {
      config.onQuestionChange(currentQuestionIndex + 1, questions.length);
    }

    ensureStreakRgbAnimation();
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(window.innerWidth * dpr);
    const pixelHeight = Math.round(window.innerHeight * dpr);
    const cssWidth = window.innerWidth + 'px';
    const cssHeight = window.innerHeight + 'px';

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;
    if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;

    // Reset the transform without reallocating the canvas on every frame.
    // Reassigning width/height each frame caused intermittent transition stalls.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawProgress() {
    const progressRight = config.progressRight === undefined ? 20 : config.progressRight;
    const progressTop = config.progressTop === undefined ? 20 : config.progressTop;
    ctx.font = PROGRESS_FONT_SIZE + 'px "Times New Roman", serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      displayQuestionNum + '/' + questions.length,
      window.innerWidth - progressRight,
      progressTop
    );
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }

  function drawPrepared(prepared, offsetX, active) {
    if (!prepared) return;

    if (prepared.type === 'mc') {
      const widths = active ? currentBtnWidths : [BTN_WIDTH, BTN_WIDTH, BTN_WIDTH, BTN_WIDTH];
      drawQuizContent(
        ctx,
        prepared.char,
        prepared.answers,
        prepared.correctAnswerIndex,
        widths,
        active ? answered : false,
        active ? clickedBtnIndex : null,
        offsetX,
        active ? dontKnowMode : false,
        prepared.streakRgb ? streakRgbHueOffset : null
      );
      return;
    }

    if (prepared.type === 'listening') {
      drawListeningContent(
        ctx,
        offsetX,
        prepared.char,
        prepared.pinyin,
        Boolean(active && listeningSession && listeningSession.isRevealed()),
        Boolean(active && listeningUnavailable)
      );
    } else if (prepared.type === 'definition') {
      drawDefinitionContent(
        ctx,
        offsetX,
        prepared.char,
        active ? typingState : 'active',
        active ? prepared.definition : '',
        prepared.streakRgb ? streakRgbHueOffset : null
      );
    } else {
      drawTypingContent(
        ctx,
        offsetX,
        prepared.char,
        active ? typingState : 'active',
        active ? prepared.pinyin : '',
        prepared.streakRgb ? streakRgbHueOffset : null,
        active ? pinyinInputWarning : ''
      );
    }
  }

  function drawStreakBanner() {
    if (streakBannerPhase === 'hidden') {
      streakBannerElement.style.display = 'none';
      streakBannerElement.setAttribute('aria-hidden', 'true');
      return;
    }

    streakBannerElement.style.display = 'block';
    streakBannerElement.style.opacity = '1';
    streakBannerElement.style.backgroundColor = '#ffffff';
    streakBannerElement.style.transform = 'translateX(-50%) translateY('
      + streakBannerOffsetY + 'px) scale(' + streakBannerScale + ')';
    streakBannerElement.setAttribute('aria-hidden', 'false');
    streakBannerForeground.style.opacity = String(streakBannerOpacity);
    streakBannerNumberTile.textContent = String(streakBannerCount);

    const solidColor = STREAK_BANNER_ACCENT_COLORS[streakBannerTier];
    if (solidColor) {
      streakBannerAccent.style.backgroundColor = solidColor;
      streakBannerAccent.style.backgroundImage = 'none';
    } else {
      streakBannerAccent.style.backgroundColor = 'transparent';
      streakBannerAccent.style.backgroundImage = getSlidingRgbCssGradient(
        streakBannerHueOffset
      );
    }
  }

  function drawScreen() {
    if (!currentPrepared) return;

    resizeCanvas();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    drawProgress();
    drawPrepared(currentPrepared, 0, true);
    drawStreakBanner();
  }

  function drawSlideFrame() {
    resizeCanvas();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    drawProgress();
    drawPrepared(currentPrepared, slideOffset, true);
    drawPrepared(nextPrepared, slideOffset + window.innerWidth, false);
    drawStreakBanner();
  }

  function drawActiveFrame() {
    if (slideAnimRAF && nextPrepared) {
      drawSlideFrame();
    } else {
      drawScreen();
    }
  }

  function animateStreakBanner(timestamp) {
    if (streakBannerPhaseStart === null) streakBannerPhaseStart = timestamp;
    const elapsed = Math.max(0, (timestamp - streakBannerPhaseStart) / 1000);
    const tierConfig = STREAK_BANNER_TIER_CONFIGS[streakBannerTier];
    if (streakBannerTier >= 3) {
      streakBannerHueOffset = (timestamp * STREAK_RGB_HUE_SPEED) % 360;
    }

    if (streakBannerPhase === 'entering') {
      const progress = Math.min(elapsed / tierConfig.enterDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      streakBannerOpacity = progress;
      streakBannerOffsetY = -tierConfig.enterOffset * (1 - eased);
      streakBannerScale = tierConfig.startScale + (1 - tierConfig.startScale) * eased;

      if (progress >= 1) {
        streakBannerPhase = 'holding';
        streakBannerPhaseStart = timestamp;
        streakBannerOpacity = 1;
        streakBannerOffsetY = 0;
        streakBannerScale = 1;
      }
    } else if (streakBannerPhase === 'holding') {
      streakBannerOpacity = 1;
      streakBannerOffsetY = 0;
      streakBannerScale = 1;

      if (elapsed >= tierConfig.holdDuration) {
        streakBannerPhase = 'exiting';
        streakBannerPhaseStart = timestamp;
      }
    } else if (streakBannerPhase === 'exiting') {
      const progress = Math.min(elapsed / tierConfig.exitDuration, 1);
      const eased = progress * progress;
      streakBannerOpacity = 1 - progress;
      streakBannerOffsetY = -STREAK_BANNER_EXIT_OFFSET * eased;
      streakBannerScale = 1 - 0.02 * eased;

      if (progress >= 1) {
        streakBannerPhase = 'hidden';
        streakBannerPhaseStart = null;
        streakBannerOpacity = 0;
        streakBannerRAF = null;

        if (finishAfterStreakBanner) {
          finishAfterStreakBanner = false;
          finishQuiz();
          return;
        }

        if (!slideAnimRAF) {
          drawActiveFrame();
        }
        return;
      }
    }

    // slideAnimate redraws the banner as part of each transition frame.
    // Avoid a second canvas repaint at the same offset, which can shimmer.
    if (!slideAnimRAF) {
      drawActiveFrame();
    }
    streakBannerRAF = requestAnimationFrame(animateStreakBanner);
  }

  function showStreakBanner(streakCount) {
    if (streakBannerRAF) {
      cancelAnimationFrame(streakBannerRAF);
    }

    streakBannerCount = streakCount;
    streakBannerTier = getStreakBannerTier(streakCount);
    const tierConfig = STREAK_BANNER_TIER_CONFIGS[streakBannerTier];
    streakBannerPhase = 'entering';
    streakBannerPhaseStart = null;
    streakBannerOpacity = 0;
    streakBannerOffsetY = -tierConfig.enterOffset;
    streakBannerScale = tierConfig.startScale;
    streakBannerHueOffset = 0;
    streakBannerRAF = requestAnimationFrame(animateStreakBanner);
  }

  function hideStreakBannerImmediately() {
    if (streakBannerRAF) {
      cancelAnimationFrame(streakBannerRAF);
    }
    streakBannerPhase = 'hidden';
    streakBannerPhaseStart = null;
    streakBannerOpacity = 0;
    streakBannerRAF = null;
    finishAfterStreakBanner = false;
    streakBannerElement.style.display = 'none';
    streakBannerElement.setAttribute('aria-hidden', 'true');
  }

  function finishQuiz() {
    stopStreakRgbAnimation();
    destroyListeningSession();
    hideTypingInput(typingInput);
    if (typeof config.onFinish === 'function') {
      config.onFinish({
        correctItems: correctItems.slice(),
        missedItems: missedItems.slice(),
        questions: questions.slice(),
        answeredCount: getAnsweredCount(),
      });
    } else {
      window.location.href = 'index.html';
    }
  }

  function getAnsweredCount() {
    let missedAnswerCount = 0;
    missedItemCounts.forEach(function (count) {
      missedAnswerCount += count;
    });
    return correctItems.length + missedAnswerCount;
  }

  function shouldFinishEarly() {
    if (typeof config.shouldFinishEarly !== 'function') return false;
    return config.shouldFinishEarly({
      correctItems: correctItems.slice(),
      missedItems: missedItems.slice(),
      questions: questions.slice(),
      answeredCount: getAnsweredCount(),
    });
  }

  function slideAnimate(timestamp) {
    if (slideAnimStart === null) {
      slideAnimStart = timestamp;
      slideAnimRAF = requestAnimationFrame(slideAnimate);
      return;
    }

    const elapsed = (timestamp - slideAnimStart) / 1000;
    const distance = SLIDE_ANIM_INITIAL_SPEED * elapsed + 0.5 * SLIDE_ANIM_ACCELERATION * elapsed * elapsed;
    slideOffset = -Math.min(distance, window.innerWidth);
    streakRgbHueOffset = (timestamp * STREAK_RGB_HUE_SPEED) % 360;

    if (typingInput.style.display !== 'none') {
      const inputLayout = getTypingInputLayout(currentPrepared.type);
      typingInput.style.left = (inputLayout.left + slideOffset) + 'px';
    }

    drawSlideFrame();

    if (Math.abs(slideOffset) < window.innerWidth) {
      slideAnimRAF = requestAnimationFrame(slideAnimate);
    } else {
      currentQuestionIndex++;
      displayQuestionNum++;
      slideOffset = 0;
      slideAnimRAF = null;
      slideAnimStart = null;
      resetForPrepared(nextPrepared);
      nextPrepared = null;
      drawScreen();
      ensureStreakRgbAnimation();
    }
  }

  function moveToNextQuestion() {
    if (shouldFinishEarly()) {
      finishQuiz();
      return;
    }

    if (currentQuestionIndex >= questions.length - 1) {
      if (streakBannerPhase !== 'hidden') {
        finishAfterStreakBanner = true;
        return;
      }

      finishQuiz();
      return;
    }

    if (streakRgbPending) {
      streakRgbActive = true;
      streakRgbPending = false;
    }

    destroyListeningSession();

    nextPrepared = prepareQuestion(questions[currentQuestionIndex + 1]);
    slideAnimStart = null;
    slideAnimRAF = requestAnimationFrame(slideAnimate);
    ensureStreakRgbAnimation();
  }

  function adjustTrackedKnowledge(question, change) {
    if (config.trackKnowledge === false) return;
    if (typeof config.adjustQuestionKnowledge === 'function') {
      config.adjustQuestionKnowledge(question, change);
    } else {
      adjustQuestionKnowledge(question, change);
    }
  }

  function markCorrect(question) {
    stopHoverAnimation();
    const trackIndex = getTrackIndex(question);
    correctItems.push(trackIndex);
    adjustTrackedKnowledge(question, 1);
    correctStreak++;

    if (correctStreak === STREAK_RGB_UNLOCK_COUNT) {
      streakRgbPending = true;
    }

    const isFinalQuestion = currentQuestionIndex >= questions.length - 1;
    if (isFinalQuestion) {
      // A milestone on the final answer only delays completion without helping
      // the learner, so remove any active banner and do not start another one.
      hideStreakBannerImmediately();
    } else if (
      correctStreak >= STREAK_REQUIRED_CORRECT
      && correctStreak % STREAK_REQUIRED_CORRECT === 0
    ) {
      showStreakBanner(correctStreak);
    }

    if (typeof config.onCorrect === 'function') {
      config.onCorrect(question, trackIndex);
    }
  }

  function markMissed(question) {
    stopHoverAnimation();
    const trackIndex = getTrackIndex(question);
    correctStreak = 0;
    streakRgbActive = false;
    streakRgbPending = false;
    if (currentPrepared) currentPrepared.streakRgb = false;
    stopStreakRgbAnimation();
    missedItemCounts.set(trackIndex, (missedItemCounts.get(trackIndex) || 0) + 1);
    addUnique(missedItems, trackIndex);
    adjustTrackedKnowledge(question, -1);
    if (typeof config.onMissed === 'function') {
      config.onMissed(question, trackIndex);
    }
  }

  function removeOneMiss(question) {
    const trackIndex = getTrackIndex(question);
    const remaining = (missedItemCounts.get(trackIndex) || 0) - 1;

    if (remaining > 0) {
      missedItemCounts.set(trackIndex, remaining);
    } else {
      missedItemCounts.delete(trackIndex);
      const missedIndex = missedItems.indexOf(trackIndex);
      if (missedIndex !== -1) missedItems.splice(missedIndex, 1);
    }

    adjustTrackedKnowledge(question, 1);
    if (typeof config.onMissedReversed === 'function') {
      config.onMissedReversed(question, trackIndex);
    }
  }

  function animateHover() {
    if (!currentPrepared || currentPrepared.type !== 'mc' || answered || slideAnimRAF) {
      animRAF = null;
      return;
    }

    const targetWidth = BTN_WIDTH + BTN_HOVER_WIDTH_INCREASE;
    const normalWidth = BTN_WIDTH;
    const speed = 1 / (BTN_HOVER_ANIM_DURATION * 60);
    let changed = false;

    for (let i = 0; i < 4; i++) {
      const target = i === hoveredBtnIndex ? targetWidth : normalWidth;
      const diff = target - currentBtnWidths[i];

      if (Math.abs(diff) < 0.5) {
        currentBtnWidths[i] = target;
      } else {
        currentBtnWidths[i] += diff * speed;
        changed = true;
      }
    }

    drawScreen();

    if (changed) {
      animRAF = requestAnimationFrame(animateHover);
    } else {
      animRAF = null;
    }
  }

  function startHoverAnimation() {
    if (
      !animRAF &&
      currentPrepared &&
      currentPrepared.type === 'mc' &&
      !answered &&
      !slideAnimRAF
    ) {
      animRAF = requestAnimationFrame(animateHover);
    }
  }

  function stopHoverAnimation() {
    if (animRAF) {
      cancelAnimationFrame(animRAF);
      animRAF = null;
    }
    hoveredBtnIndex = null;
  }

  function selectMultipleChoiceAnswer(buttonIndex) {
    if (
      !currentPrepared
      || currentPrepared.type !== 'mc'
      || answered
      || slideAnimRAF
      || !Number.isInteger(buttonIndex)
      || buttonIndex < 0
      || buttonIndex >= BUTTON_CENTERS.length
    ) {
      return false;
    }

    stopHoverAnimation();
    answered = true;
    clickedBtnIndex = buttonIndex;
    hoveredBtnIndex = null;
    canvas.style.cursor = 'default';
    currentBtnWidths.fill(BTN_WIDTH);
    currentBtnWidths[buttonIndex] = BTN_WIDTH + BTN_HOVER_WIDTH_INCREASE;

    if (buttonIndex === currentPrepared.correctAnswerIndex) {
      markCorrect(currentPrepared.question);
    } else {
      markMissed(currentPrepared.question);
    }

    waitingForFeedbackAdvance = true;
    drawScreen();
    return true;
  }

  function canEnterSkipCurrentQuestion() {
    if (!currentPrepared || currentPrepared.type !== 'mc') return false;
    if (typeof config.canSkipQuestion === 'function') {
      return config.canSkipQuestion(currentPrepared.question);
    }
    return true;
  }

  function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - window.innerWidth / 2,
      y: e.clientY - rect.top - window.innerHeight / 2,
    };
  }

  function isInsideDefinitionHonorButton(mouse) {
    if (
      !currentPrepared
      || currentPrepared.type !== 'definition'
      || !typingAnswerDone
      || typingState !== 'wrong'
      || !answerRecoverySnapshot
    ) {
      return false;
    }

    const button = getDefinitionFeedbackLayout(
      ctx,
      currentPrepared.definition
    ).button;
    return mouse.x >= button.x
      && mouse.x <= button.x + button.width
      && mouse.y >= button.y
      && mouse.y <= button.y + button.height;
  }

  function isInsideListeningPlayButton(mouse) {
    if (!currentPrepared || currentPrepared.type !== 'listening') return false;
    const button = getListeningPlayButtonBounds();
    return mouse.x >= button.x
      && mouse.x <= button.x + button.width
      && mouse.y >= button.y
      && mouse.y <= button.y + button.height;
  }

  function creditDefinitionOverride() {
    if (!answerRecoverySnapshot || !currentPrepared) return false;

    const snapshot = answerRecoverySnapshot;
    removeOneMiss(currentPrepared.question);
    correctStreak = snapshot.correctStreak;
    streakRgbActive = snapshot.streakRgbActive;
    streakRgbPending = snapshot.streakRgbPending;
    currentPrepared.streakRgb = snapshot.preparedStreakRgb;
    answerRecoverySnapshot = null;

    typingState = 'correct';
    typingInput.style.borderImage = 'none';
    typingInput.style.borderColor = CORRECT_COLOR;
    markCorrect(currentPrepared.question);
    waitingForFeedbackAdvance = true;
    drawScreen();
    ensureStreakRgbAnimation();
    return true;
  }

  function isInsideCurrentCharacterSquare(mouse) {
    if (!currentPrepared) return false;

    const centerX = currentPrepared.type === 'mc' ? SQUARE_CENTER_X : SQUARE2_CENTER_X;
    const centerY = currentPrepared.type === 'mc' ? SQUARE_CENTER_Y : SQUARE2_CENTER_Y;
    const halfSize = SQUARE_SIZE / 2;
    return mouse.x >= centerX - halfSize &&
      mouse.x <= centerX + halfSize &&
      mouse.y >= centerY - halfSize &&
      mouse.y <= centerY + halfSize;
  }

  function openCurrentQuestionDetails() {
    if (!currentPrepared || !isCurrentQuestionAnswered()) return false;

    let details = null;
    if (typeof config.getQuestionDetails === 'function') {
      details = config.getQuestionDetails(currentPrepared.question, currentPrepared);
    } else {
      const globalIndex = getQuestionGlobalIndex(currentPrepared.question);
      if (globalIndex === null) return false;
      details = {
        char: currentPrepared.char,
        pinyin: currentPrepared.pinyin,
        definition: getDefinitionForGlobalIndex(globalIndex),
        examples: getExamplesForGlobalIndex(globalIndex),
      };
    }
    if (!details) return false;

    const centerX = currentPrepared.type === 'mc' ? SQUARE_CENTER_X : SQUARE2_CENTER_X;
    const centerY = currentPrepared.type === 'mc' ? SQUARE_CENTER_Y : SQUARE2_CENTER_Y;
    openMissedWordPopup(details, window.innerWidth / 2 + centerX, window.innerHeight / 2 + centerY);
    return true;
  }

  function getCurrentQuestionType() {
    return currentPrepared ? currentPrepared.type : null;
  }

  function isCurrentQuestionAnswered() {
    if (!currentPrepared) return false;
    if (currentPrepared.type === 'listening') {
      return Boolean(listeningSession && listeningSession.isRevealed());
    }
    return currentPrepared.type === 'mc' ? answered : typingAnswerDone;
  }

  function replaceRemainingQuestions(buildQuestions, replaceCurrent) {
    if (typeof buildQuestions !== 'function' || !currentPrepared) return false;

    let startIndex = replaceCurrent ? currentQuestionIndex : currentQuestionIndex + 1;

    // Once feedback or a slide has begun, keep the answered question in place and
    // apply the new type selection to the incoming question instead.
    if (isCurrentQuestionAnswered() || slideAnimRAF) {
      startIndex = currentQuestionIndex + 1;
    }

    const prefix = questions.slice(0, startIndex);
    const replacements = buildQuestions({
      completedQuestions: prefix.slice(),
      currentQuestionIndex: startIndex,
      currentQuestionCount: questions.length,
    }) || [];

    if (startIndex === currentQuestionIndex && replacements.length === 0) {
      return false;
    }

    questions.splice.apply(
      questions,
      [startIndex, questions.length - startIndex].concat(replacements)
    );

    if (slideAnimRAF) {
      if (questions[currentQuestionIndex + 1]) {
        nextPrepared = prepareQuestion(questions[currentQuestionIndex + 1]);
        drawSlideFrame();
      }
      return true;
    }

    if (startIndex === currentQuestionIndex) {
      displayQuestionNum = currentQuestionIndex + 1;
      resetForPrepared(prepareQuestion(questions[currentQuestionIndex]));
    }

    drawScreen();
    return true;
  }

  window.addEventListener('resize', function () {
    positionTypingInput(
      typingInput,
      currentPrepared ? currentPrepared.type : 'typing'
    );
    if (slideAnimRAF && nextPrepared) {
      if (typingInput.style.display !== 'none') {
        const inputLayout = getTypingInputLayout(currentPrepared.type);
        typingInput.style.left = (inputLayout.left + slideOffset) + 'px';
      }
      drawSlideFrame();
    } else {
      drawScreen();
    }
  });

  function isPinyinInputActive() {
    return Boolean(currentPrepared && currentPrepared.type === 'typing');
  }

  setupPinyinAccents(typingInput, isPinyinInputActive);
  setupPinyinFilter(typingInput, isPinyinInputActive);

  function isCorrectDefinitionSubmission(answer) {
    if (!currentPrepared || !currentPrepared.definition) return false;
    if (typeof config.evaluateDefinitionAnswer === 'function') {
      return config.evaluateDefinitionAnswer(currentPrepared.question, answer);
    }
    return isAcceptedEnglishDefinition(currentPrepared.definition, answer);
  }

  typingInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (
      !currentPrepared
      || (currentPrepared.type !== 'typing' && currentPrepared.type !== 'definition')
    ) return;
    if (typingAnswerDone) return;

    // The key that submits a writing answer must not also bubble up and count
    // as the separate keypress required to leave the answer-feedback screen.
    e.preventDefault();
    e.stopPropagation();

    const rawUserAnswer = typingInput.value.trim();
    let isCorrect = false;

    if (currentPrepared.type === 'definition') {
      isCorrect = isCorrectDefinitionSubmission(rawUserAnswer);
    } else {
      const normalizeTypingAnswer = typeof config.normalizeTypingAnswer === 'function'
        ? config.normalizeTypingAnswer
        : function (value) { return value; };
      const userAnswer = normalizeTypingAnswer(rawUserAnswer);
      const expectedAnswer = normalizeTypingAnswer(currentPrepared.pinyin);
      isCorrect = userAnswer === expectedAnswer;
    }

    if (
      currentPrepared.type === 'typing'
      && !isCorrect
      && !pinyinDefinitionRetryUsed
      && isCorrectDefinitionSubmission(rawUserAnswer)
    ) {
      pinyinDefinitionRetryUsed = true;
      pinyinInputWarning = 'Answer with pinyin, try again';
      typingInput.value = '';
      typingInput.style.borderImage = 'none';
      typingInput.style.borderColor = 'black';
      updateTypingInputStreakBorder();
      drawScreen();
      typingInput.focus();
      return;
    }

    pinyinInputWarning = '';
    typingAnswerDone = true;
    typingInput.blur();

    if (isCorrect) {
      answerRecoverySnapshot = null;
      typingState = 'correct';
      typingInput.style.borderImage = 'none';
      typingInput.style.borderColor = CORRECT_COLOR;
      markCorrect(currentPrepared.question);
    } else {
      if (currentPrepared.type === 'definition') {
        answerRecoverySnapshot = {
          correctStreak: correctStreak,
          streakRgbActive: streakRgbActive,
          streakRgbPending: streakRgbPending,
          preparedStreakRgb: currentPrepared.streakRgb,
        };
      }
      typingState = 'wrong';
      typingInput.style.borderImage = 'none';
      typingInput.style.borderColor = WRONG_COLOR;
      markMissed(currentPrepared.question);
    }

    waitingForFeedbackAdvance = true;
    drawScreen();
  });

  document.addEventListener('keydown', function (e) {
    if (isMissedWordPopupOpen()) return;

    if (waitingForFeedbackAdvance) {
      if (e.repeat || slideAnimRAF) return;
      if (typeof e.preventDefault === 'function') e.preventDefault();
      waitingForFeedbackAdvance = false;
      moveToNextQuestion();
      return;
    }

    const keyboardButtonIndex = ['1', '2', '3', '4'].indexOf(e.key);
    if (keyboardButtonIndex !== -1) {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      if (!selectMultipleChoiceAnswer(keyboardButtonIndex)) return;
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      return;
    }

    if (e.key !== 'Enter') return;

    if (!canEnterSkipCurrentQuestion()) return;
    if (answered || slideAnimRAF) return;

    answered = true;
    dontKnowMode = true;
    clickedBtnIndex = null;
    markMissed(currentPrepared.question);
    waitingForFeedbackAdvance = true;
    drawScreen();
  });

  document.addEventListener('click', function () {
    if (isMissedWordPopupOpen()) return;
    if (!waitingForFeedbackAdvance || slideAnimRAF) return;
    waitingForFeedbackAdvance = false;
    moveToNextQuestion();
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!currentPrepared || slideAnimRAF) {
      canvas.style.cursor = 'default';
      return;
    }

    const mouse = getMousePosition(e);

    if (isCurrentQuestionAnswered()) {
      stopHoverAnimation();
      canvas.style.cursor = (
        isInsideCurrentCharacterSquare(mouse)
        || isInsideListeningPlayButton(mouse)
        || isInsideDefinitionHonorButton(mouse)
      ) ? 'pointer' : 'default';
      return;
    }

    if (currentPrepared.type === 'listening') {
      canvas.style.cursor = (
        isInsideCurrentCharacterSquare(mouse)
        || isInsideListeningPlayButton(mouse)
      ) ? 'pointer' : 'default';
      return;
    }

    if (currentPrepared.type !== 'mc') {
      canvas.style.cursor = 'default';
      return;
    }

    let newHover = null;

    for (let i = 0; i < BUTTON_CENTERS.length; i++) {
      if (isInsideButton(mouse.x, mouse.y, i, currentBtnWidths)) {
        newHover = i;
        break;
      }
    }

    if (newHover !== hoveredBtnIndex) {
      hoveredBtnIndex = newHover;
      canvas.style.cursor = hoveredBtnIndex !== null ? 'pointer' : 'default';
      startHoverAnimation();
    }
  });

  canvas.addEventListener('mouseleave', function () {
    canvas.style.cursor = 'default';
    if (!currentPrepared || currentPrepared.type !== 'mc') return;
    if (answered || slideAnimRAF) return;
    hoveredBtnIndex = null;
    startHoverAnimation();
  });

  canvas.addEventListener('click', function (e) {
    if (!currentPrepared || slideAnimRAF) return;

    const mouse = getMousePosition(e);

    if (currentPrepared.type === 'listening') {
      if (isInsideListeningPlayButton(mouse)) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (listeningSession) listeningSession.play();
        return;
      }
      if (isInsideCurrentCharacterSquare(mouse)) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (listeningSession && listeningSession.isRevealed()) {
          openCurrentQuestionDetails();
        } else if (listeningSession) {
          listeningSession.reveal();
          waitingForFeedbackAdvance = true;
          drawScreen();
        }
      }
      return;
    }

    if (isCurrentQuestionAnswered()) {
      if (isInsideDefinitionHonorButton(mouse)) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        creditDefinitionOverride();
        return;
      }
      if (isInsideCurrentCharacterSquare(mouse)) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        openCurrentQuestionDetails();
      }
      return;
    }

    if (currentPrepared.type !== 'mc') return;

    for (let i = 0; i < BUTTON_CENTERS.length; i++) {
      if (!isInsideButton(mouse.x, mouse.y, i, currentBtnWidths)) continue;

      // Do not let the click that created wrong-answer feedback bubble to the
      // document-level click handler and dismiss that feedback immediately.
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      selectMultipleChoiceAnswer(i);
      break;
    }
  });

  if (questions.length === 0) {
    finishQuiz();
  } else {
    resetForPrepared(prepareQuestion(questions[0]));
    drawScreen();
  }

  return {
    drawScreen: drawScreen,
    moveToNextQuestion: moveToNextQuestion,
    getCurrentQuestionType: getCurrentQuestionType,
    replaceRemainingQuestions: replaceRemainingQuestions,
  };
}

window.CHINESE_READER_QUIZ_TEST_API = Object.freeze({
  createQuizRunner: createQuizRunner,
  buildSkipQuizQuestions: buildSkipQuizQuestions,
  completeSkippedWords: completeSkippedWords,
});

function startRegularQuizPage() {
  if (localStorage.getItem('skipQuizActive')) {
    startSkipQuizPage();
    return;
  }

  const flatData = getFlatUnitData();
  const SECTION_SIZE = 20;
  const WORDS_PER_QUIZ = 5;

  function getCurrentSection() {
    const data = localStorage.getItem('currentSection');
    return data ? parseInt(data, 10) : 0;
  }

  function saveCurrentSection(section) {
    localStorage.setItem('currentSection', String(section));
  }

  function getQuizPosition() {
    const data = localStorage.getItem('quizPosition');
    return data ? parseInt(data, 10) : 0;
  }

  function saveQuizPosition(pos) {
    localStorage.setItem('quizPosition', String(pos));
  }

  function getBonusCount() {
    const current = Math.min(getCurrentSection() + 1, 5);
    const stored = parseInt(localStorage.getItem('maxBonusCount') || '1', 10);
    const max = Math.max(stored, current);
    localStorage.setItem('maxBonusCount', String(max));
    return max;
  }

  function buildQuizWords() {
    const progress = getAllUnitProgress();
    const section = getCurrentSection();
    const sectionStart = section * SECTION_SIZE;
    const sectionEnd = Math.min(sectionStart + SECTION_SIZE, flatData.total);
    const quizPos = getQuizPosition();
    const start = sectionStart + quizPos * WORDS_PER_QUIZ;
    const words = [];

    for (let i = start; i < start + WORDS_PER_QUIZ && i < sectionEnd; i++) {
      if ((progress[String(i)] || 0) < 6) {
        words.push(i);
      }
    }

    if (words.length < WORDS_PER_QUIZ) {
      for (let offset = WORDS_PER_QUIZ; offset < SECTION_SIZE && words.length < WORDS_PER_QUIZ; offset++) {
        const i = sectionStart + ((quizPos * WORDS_PER_QUIZ + offset) % SECTION_SIZE);
        if (i < sectionEnd && (progress[String(i)] || 0) < 6 && words.indexOf(i) === -1) {
          words.push(i);
        }
      }
    }

    return words;
  }

  function isSectionComplete(section) {
    const progress = getAllUnitProgress();
    const sectionStart = section * SECTION_SIZE;
    const sectionEnd = Math.min(sectionStart + SECTION_SIZE, flatData.total);

    for (let i = sectionStart; i < sectionEnd; i++) {
      if ((progress[String(i)] || 0) < 6) {
        return false;
      }
    }

    return true;
  }

  function handleEmptyQuizWords() {
    const section = getCurrentSection();

    if (isSectionComplete(section)) {
      const maxSection = Math.floor((flatData.total - 1) / SECTION_SIZE);
      if (section < maxSection) {
        saveCurrentSection(section + 1);
        saveQuizPosition(0);
        window.location.reload();
      } else {
        window.location.href = 'index.html';
      }
      return;
    }

    window.location.href = 'index.html';
  }

  function buildBonusQuestions(quizWords) {
    const bonusPool = [];
    let globalOffset = 0;

    for (let unit = 0; unit < UNIT_DATA.length; unit++) {
      const progress = JSON.parse(localStorage.getItem(getProgressKeyForUnit(unit)) || '{}');
      const charCount = UNIT_DATA[unit].characters.length;

      for (let i = 0; i < charCount; i++) {
        const globalIndex = globalOffset + i;
        if ((progress[String(i)] || 0) > 0 && quizWords.indexOf(globalIndex) === -1) {
          bonusPool.push({
            unit: unit,
            localIndex: i,
            globalIndex: globalIndex,
          });
        }
      }

      globalOffset += charCount;
    }

    const bonusCount = getBonusCount();
    if (bonusCount <= 0 || bonusPool.length < bonusCount) {
      return [];
    }

    shuffleInPlace(bonusPool);
    return bonusPool.slice(0, bonusCount).map(function (entry) {
      const format = Math.random() < 0.5 ? 'mc' : 'typing';
      const question = makeUnitQuestion(entry.unit, entry.localIndex, format, entry.globalIndex);
      question.isBonus = true;
      return question;
    });
  }

  function saveProgress(correctItems) {
    const byUnit = {};

    for (const globalIndex of correctItems) {
      const info = getUnitLocalForGlobal(globalIndex);
      if (!byUnit[info.unit]) byUnit[info.unit] = [];
      byUnit[info.unit].push(info.localIndex);
    }

    for (const unitStr in byUnit) {
      const unit = parseInt(unitStr, 10);
      const progress = JSON.parse(localStorage.getItem(getProgressKeyForUnit(unit)) || '{}');

      for (const localIndex of byUnit[unitStr]) {
        const key = String(localIndex);
        progress[key] = Math.min((progress[key] || 0) + 1, 6);
      }

      localStorage.setItem(getProgressKeyForUnit(unit), JSON.stringify(progress));
    }
  }

  function finishRegularQuiz(result) {
    const xpTotalBefore = getCurrentXpTotal();
    awardCompletedItemXp(result.correctItems, function (globalIndex) {
      const info = getUnitLocalForGlobal(globalIndex);
      const progress = getStoredNumberMap(getProgressKeyForUnit(info.unit));
      return progress[String(info.localIndex)];
    });
    saveProgress(result.correctItems);
    const sessionXp = getCurrentXpTotal() - xpTotalBefore;

    const section = getCurrentSection();
    if (isSectionComplete(section)) {
      const maxSection = Math.floor((flatData.total - 1) / SECTION_SIZE);
      if (section < maxSection) {
        saveCurrentSection(section + 1);
      }
      saveQuizPosition(0);
    } else {
      saveQuizPosition((getQuizPosition() + 1) % (SECTION_SIZE / WORDS_PER_QUIZ));
    }

    showMissedWordsPage(
      result.missedItems,
      getCharForGlobalIndex,
      getPinyinForGlobalIndex,
      getDefinitionForGlobalIndex,
      getExamplesForGlobalIndex,
      'index.html',
      result.correctItems.length,
      result.questions.length,
      sessionXp,
      true
    );
  }

  const overlay = document.getElementById('debugOverlay');
  if (overlay) overlay.style.display = 'none';

  const quizWords = buildQuizWords();
  if (quizWords.length === 0) {
    handleEmptyQuizWords();
    return;
  }

  const questions = [];
  for (const globalIndex of quizWords) {
    questions.push(makeFlatQuestion(globalIndex, 'mc', flatData));
  }
  for (const globalIndex of quizWords) {
    questions.push(makeFlatQuestion(globalIndex, 'typing', flatData));
  }
  questions.push.apply(questions, buildBonusQuestions(quizWords));

  createQuizRunner({
    canvasId: 'quizCanvas',
    inputId: 'typingInput',
    questions: questions,
    canSkipQuestion: function (question) {
      return !question.isBonus;
    },
    onFinish: finishRegularQuiz,
  });
}

function getLatestSeenGlobalIndex() {
  let latestSeenGlobal = -1;
  let globalOffset = 0;

  for (let unit = 0; unit < UNIT_DATA.length; unit++) {
    const progress = JSON.parse(localStorage.getItem(getProgressKeyForUnit(unit)) || '{}');

    for (const key in progress) {
      if (!Object.prototype.hasOwnProperty.call(progress, key)) continue;
      if ((Number(progress[key]) || 0) <= 0) continue;
      const globalIndex = globalOffset + parseInt(key, 10);
      if (globalIndex > latestSeenGlobal) {
        latestSeenGlobal = globalIndex;
      }
    }

    globalOffset += UNIT_DATA[unit].characters.length;
  }

  return latestSeenGlobal;
}

function buildSkipQuizQuestions(targetGlobal, startingLatestSeenGlobal) {
  const latestSeenGlobal = Number.isInteger(startingLatestSeenGlobal)
    ? startingLatestSeenGlobal
    : getLatestSeenGlobalIndex();
  const skipLogic = window.CHINESE_READER_SKIP_LOGIC;
  if (!skipLogic || typeof skipLogic.buildSkipQuizIndices !== 'function') {
    throw new Error('Expected shared skip quiz logic.');
  }
  const skipWords = skipLogic.buildSkipQuizIndices(
    latestSeenGlobal,
    targetGlobal,
    getTotalCharacterCount(),
    Math.random
  );

  return skipWords.map(function (globalIndex) {
    const info = getUnitLocalForGlobal(globalIndex);
    const type = skipLogic.pickRandomQuestionType(['mc', 'typing'], Math.random);
    return makeUnitQuestion(info.unit, info.localIndex, type, globalIndex);
  });
}

function completeSkippedWords(targetGlobal, startingLatestSeenGlobal) {
  const latestSeenGlobal = Number.isInteger(startingLatestSeenGlobal)
    ? startingLatestSeenGlobal
    : getLatestSeenGlobalIndex();
  const skipLogic = window.CHINESE_READER_SKIP_LOGIC;
  if (!skipLogic || typeof skipLogic.buildSkipRangeIndices !== 'function') {
    throw new Error('Expected shared skip quiz logic.');
  }
  const byUnit = {};
  const skippedWords = skipLogic.buildSkipRangeIndices(
    latestSeenGlobal,
    targetGlobal,
    getTotalCharacterCount()
  );

  for (const globalIndex of skippedWords) {
    const info = getUnitLocalForGlobal(globalIndex);
    if (!byUnit[info.unit]) byUnit[info.unit] = [];
    byUnit[info.unit].push(info.localIndex);
  }

  for (const unitStr in byUnit) {
    const unit = parseInt(unitStr, 10);
    const progress = JSON.parse(localStorage.getItem(getProgressKeyForUnit(unit)) || '{}');

    for (const localIndex of byUnit[unitStr]) {
      progress[String(localIndex)] = 6;
    }

    localStorage.setItem(getProgressKeyForUnit(unit), JSON.stringify(progress));
  }
}

function startSkipQuizPage() {
  localStorage.removeItem('skipQuizActive');
  const targetGlobal = parseInt(localStorage.getItem('skipQuizTarget') || '0', 10);
  localStorage.removeItem('skipQuizTarget');
  const latestSeenGlobal = getLatestSeenGlobalIndex();
  const skipLogic = window.CHINESE_READER_SKIP_LOGIC;

  const xpTotalBefore = getCurrentXpTotal();
  createQuizRunner({
    canvasId: 'quizCanvas',
    inputId: 'typingInput',
    questions: buildSkipQuizQuestions(targetGlobal, latestSeenGlobal),
    shouldFinishEarly: function (result) {
      return !skipLogic.canStillPassSkipQuiz(
        result.correctItems.length,
        result.answeredCount,
        result.questions.length
      );
    },
    onFinish: function (result) {
      if (skipLogic.hasPassedSkipQuiz(result.correctItems.length, result.questions.length)) {
        completeSkippedWords(targetGlobal, latestSeenGlobal);
      }
      const sessionXp = getCurrentXpTotal() - xpTotalBefore;
      showMissedWordsPage(
        result.missedItems,
        getCharForGlobalIndex,
        getPinyinForGlobalIndex,
        getDefinitionForGlobalIndex,
        getExamplesForGlobalIndex,
        'index.html',
        result.correctItems.length,
        result.questions.length,
        sessionXp,
        true
      );
    },
  });
}

function startReviewQuizPage() {
  const phraseMode = isPhraseQuizContentMode();
  const questionTypeLogic = window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;
  const flatData = phraseMode ? getFlatPhraseData() : getFlatUnitData();
  const progress = phraseMode
    ? getAllPhraseProgressForFlatData(flatData)
    : getAllUnitProgress();
  const returnUrl = phraseMode ? 'index.html?view=phrases' : 'index.html';
  const pool = [];
  const targetedPool = [];
  const reviewControls = document.getElementById('reviewTypeControls');
  const targetedModeSwitch = document.getElementById('reviewTargetedMode');
  const reviewModeText = document.getElementById('reviewModeText');
  const multipleChoiceCheckbox = document.getElementById('reviewMultipleChoice');
  const writingCheckbox = document.getElementById('reviewWriting');
  const definitionCheckbox = document.getElementById('reviewDefinition');
  const definitionOption = document.getElementById('reviewDefinitionOption');
  const questionCountInput = document.getElementById('reviewQuestionCount');
  const storagePrefix = phraseMode ? 'phraseReviewQuiz' : 'reviewQuiz';
  const reviewTargetedStorageKey = storagePrefix + 'Targeted';
  const reviewMultipleChoiceStorageKey = storagePrefix + 'MultipleChoice';
  const reviewWritingStorageKey = storagePrefix + 'Writing';
  const reviewDefinitionStorageKey = storagePrefix + 'Definition';
  const reviewQuestionCountStorageKey = storagePrefix + 'QuestionCount';
  let reviewQuestionCount = 0;
  let reviewQuestionMinimum = 1;
  const xpTotalBefore = getCurrentXpTotal();

  function incrementReviewProgress(globalIndex) {
    const info = phraseMode
      ? getPhraseUnitLocalForGlobal(globalIndex, flatData)
      : getUnitLocalForGlobal(globalIndex);
    const storageKey = phraseMode
      ? getPhraseProgressKeyForUnit(info.unit)
      : getProgressKeyForUnit(info.unit);
    const unitProgress = getStoredNumberMap(storageKey);
    const key = String(info.localIndex);
    const currentProgress = Number(unitProgress[key]) || 0;

    if (currentProgress >= 6) return;

    unitProgress[key] = Math.min(currentProgress + 1, 6);
    localStorage.setItem(storageKey, JSON.stringify(unitProgress));
  }

  if (!questionTypeLogic) {
    throw new Error('Expected shared quiz question-type logic.');
  }
  questionTypeLogic.configureDefinitionControl(
    phraseMode,
    definitionOption,
    definitionCheckbox
  );

  if (phraseMode && flatData.total === 0) {
    throw new Error('Expected phrase data for phrase review.');
  }

  if (reviewControls) {
    reviewControls.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    reviewControls.addEventListener('keydown', function (event) {
      event.stopPropagation();
    });
  }

  function updateReviewModeText() {
    if (reviewModeText) {
      reviewModeText.textContent = targetedModeSwitch && targetedModeSwitch.checked ?
        'Targeted' :
        'Random';
    }
  }

  if (targetedModeSwitch) {
    targetedModeSwitch.checked = localStorage.getItem(reviewTargetedStorageKey) === 'true';
    localStorage.setItem(reviewTargetedStorageKey, String(targetedModeSwitch.checked));
    updateReviewModeText();
  }

  if (multipleChoiceCheckbox && writingCheckbox && definitionCheckbox) {
    const storedMultipleChoice = localStorage.getItem(reviewMultipleChoiceStorageKey);
    const storedWriting = localStorage.getItem(reviewWritingStorageKey);
    const storedDefinition = localStorage.getItem(reviewDefinitionStorageKey);
    let multipleChoiceSelected = storedMultipleChoice === null ? true : storedMultipleChoice === 'true';
    let writingSelected = storedWriting === null ? true : storedWriting === 'true';
    let definitionSelected = phraseMode
      && (storedDefinition === null ? true : storedDefinition === 'true');

    if (!multipleChoiceSelected && !writingSelected && !definitionSelected) {
      multipleChoiceSelected = true;
      writingSelected = true;
      definitionSelected = phraseMode;
    }

    multipleChoiceCheckbox.checked = multipleChoiceSelected;
    writingCheckbox.checked = writingSelected;
    definitionCheckbox.checked = definitionSelected;
    localStorage.setItem(reviewMultipleChoiceStorageKey, String(multipleChoiceSelected));
    localStorage.setItem(reviewWritingStorageKey, String(writingSelected));
    localStorage.setItem(reviewDefinitionStorageKey, String(definitionSelected));
  }

  for (let i = 0; i < flatData.total; i++) {
    const isComplete = (progress[String(i)] || 0) >= 6;
    if (isComplete) {
      pool.push(i);
      targetedPool.push(i);
    }
  }

  shuffleInPlace(pool);
  shuffleInPlace(targetedPool);

  if (pool.length === 0) {
    window.location.href = returnUrl;
    return;
  }

  function getSelectedReviewTypes() {
    const types = [];
    if (multipleChoiceCheckbox && multipleChoiceCheckbox.checked) types.push('mc');
    if (writingCheckbox && writingCheckbox.checked) types.push('typing');
    if (definitionCheckbox && definitionCheckbox.checked) types.push('definition');
    return questionTypeLogic.filterQuestionTypes(phraseMode, types);
  }

  function isTargetedReviewMode() {
    return Boolean(targetedModeSwitch && targetedModeSwitch.checked);
  }

  function getOrderedReviewPool(targetedMode) {
    if (!targetedMode) return pool;

    const knowledgeScores = phraseMode
      ? getPhraseKnowledgeScores()
      : getKnowledgeScores();
    return targetedPool.slice().sort(function (firstIndex, secondIndex) {
      const firstScore = Number(knowledgeScores[String(firstIndex)]) || 0;
      const secondScore = Number(knowledgeScores[String(secondIndex)]) || 0;
      return firstScore - secondScore;
    });
  }

  function getReviewQuestionLimit() {
    return pool.length;
  }

  function getEffectiveReviewQuestionLimit() {
    return Math.max(
      getReviewQuestionLimit(),
      reviewQuestionMinimum
    );
  }

  function syncReviewQuestionCount(selectedTypes, targetedMode, useMaximum) {
    const questionLimit = getEffectiveReviewQuestionLimit();
    const questionMinimum = Math.min(questionLimit, Math.max(1, reviewQuestionMinimum));
    const requestedCount = parseInt(questionCountInput ? questionCountInput.value : '', 10);

    if (useMaximum) {
      reviewQuestionCount = questionLimit;
    } else if (!Number.isFinite(requestedCount)) {
      reviewQuestionCount = Math.min(
        questionLimit,
        Math.max(questionMinimum, reviewQuestionCount || questionLimit)
      );
    } else {
      reviewQuestionCount = Math.min(questionLimit, Math.max(questionMinimum, requestedCount));
    }

    if (questionCountInput) {
      questionCountInput.min = String(questionMinimum);
      questionCountInput.max = String(questionLimit);
      questionCountInput.value = String(reviewQuestionCount);
      questionCountInput.disabled = questionLimit === 0;
    }
    localStorage.setItem(reviewQuestionCountStorageKey, String(reviewQuestionCount));

    return questionLimit;
  }

  function getReviewQuestionKey(question) {
    return question.type + ':' + question.charIndex;
  }

  function buildReviewQuestions(selectedTypes, targetedMode, state) {
    const targetQuestionCount = Math.min(
      reviewQuestionCount,
      getEffectiveReviewQuestionLimit()
    );
    const wordLimit = Math.ceil(targetQuestionCount / selectedTypes.length);
    const selectedWords = getOrderedReviewPool(targetedMode).slice(0, wordLimit);
    const usedQuestionKeys = new Set(
      state.completedQuestions.map(getReviewQuestionKey)
    );
    const candidates = [];

    for (const globalIndex of selectedWords) {
      for (const type of selectedTypes) {
        const question = phraseMode
          ? makeFlatPhraseQuestion(globalIndex, type, flatData)
          : makeFlatQuestion(globalIndex, type, flatData);
        if (!usedQuestionKeys.has(getReviewQuestionKey(question))) {
          candidates.push(question);
        }
      }
    }

    shuffleInPlace(candidates);
    const remainingQuestionCount = Math.max(0, targetQuestionCount - state.currentQuestionIndex);

    return candidates.slice(0, remainingQuestionCount);
  }

  const initialTypes = getSelectedReviewTypes();
  const storedQuestionCount = parseInt(
    localStorage.getItem(reviewQuestionCountStorageKey) || '',
    10
  );
  const hasStoredQuestionCount = Number.isFinite(storedQuestionCount) && storedQuestionCount > 0;
  if (hasStoredQuestionCount) {
    reviewQuestionCount = storedQuestionCount;
    if (questionCountInput) questionCountInput.value = String(storedQuestionCount);
  }
  syncReviewQuestionCount(initialTypes, isTargetedReviewMode(), !hasStoredQuestionCount);
  const questions = buildReviewQuestions(initialTypes, isTargetedReviewMode(), {
    completedQuestions: [],
    currentQuestionIndex: 0,
    currentQuestionCount: 0,
  });

  const runnerConfig = {
    canvasId: 'reviewCanvas',
    inputId: 'reviewTypingInput',
    questions: questions,
    onQuestionChange: function (questionNumber) {
      reviewQuestionMinimum = Math.max(1, questionNumber);
      syncReviewQuestionCount(getSelectedReviewTypes(), isTargetedReviewMode(), false);
    },
    onCorrect: function (question, globalIndex) {
      awardCompletedItemXp([globalIndex], function (index) {
        const info = phraseMode
          ? getPhraseUnitLocalForGlobal(index, flatData)
          : getUnitLocalForGlobal(index);
        const storageKey = phraseMode
          ? getPhraseProgressKeyForUnit(info.unit)
          : getProgressKeyForUnit(info.unit);
        return getStoredNumberMap(storageKey)[String(info.localIndex)];
      });
      incrementReviewProgress(globalIndex);
    },
    onFinish: function (result) {
      const sessionXp = getCurrentXpTotal() - xpTotalBefore;
      showMissedWordsPage(
        result.missedItems,
        getCharForGlobalIndex,
        getPinyinForGlobalIndex,
        getDefinitionForGlobalIndex,
        getExamplesForGlobalIndex,
        returnUrl,
        result.correctItems.length,
        result.questions.length,
        sessionXp,
        true
      );
    },
  };

  if (phraseMode) {
    const phraseLogic = window.CHINESE_READER_PHRASE_QUIZ_LOGIC;
    runnerConfig.normalizeTypingAnswer = phraseLogic
      ? phraseLogic.normalizePinyinAnswer
      : function (value) { return String(value).normalize('NFC').toLowerCase().replace(/\s+/g, ''); };
    runnerConfig.evaluateDefinitionAnswer = function (question, answer) {
      return phraseLogic
        ? phraseLogic.isDefinitionAnswerCorrect(question.definition, answer)
        : isAcceptedEnglishDefinition(question.definition, answer);
    };
    runnerConfig.adjustQuestionKnowledge = function (question, change) {
      adjustPhraseQuestionKnowledge(question, change, flatData);
    };
    runnerConfig.getQuestionDetails = function (question) {
      return {
        char: question.char,
        pinyin: question.pinyin,
        definition: question.definition,
        examples: [],
      };
    };
    runnerConfig.onFinish = function (result) {
      const sessionXp = getCurrentXpTotal() - xpTotalBefore;
      showMissedWordsPage(
        result.missedItems,
        function (index) { return flatData.phrases[index]; },
        function (index) { return flatData.pinyin[index]; },
        function (index) { return flatData.definitions[index]; },
        function () { return []; },
        returnUrl,
        result.correctItems.length,
        result.questions.length,
        sessionXp,
        true
      );
    };
  }

  const runner = createQuizRunner(runnerConfig);

  function handleReviewTypeChange(event) {
    if (!multipleChoiceCheckbox || !writingCheckbox || !definitionCheckbox) return;

    if (getSelectedReviewTypes().length === 0) {
      event.currentTarget.checked = true;
      return;
    }

    localStorage.setItem(reviewMultipleChoiceStorageKey, String(multipleChoiceCheckbox.checked));
    localStorage.setItem(reviewWritingStorageKey, String(writingCheckbox.checked));
    localStorage.setItem(reviewDefinitionStorageKey, String(definitionCheckbox.checked));

    const selectedTypes = getSelectedReviewTypes();
    syncReviewQuestionCount(selectedTypes, isTargetedReviewMode(), false);
    const currentType = runner.getCurrentQuestionType();
    const replaceCurrent = selectedTypes.indexOf(currentType) === -1;

    runner.replaceRemainingQuestions(function (state) {
      return buildReviewQuestions(selectedTypes, isTargetedReviewMode(), state);
    }, replaceCurrent);
  }

  function handleReviewModeChange() {
    if (!targetedModeSwitch) return;

    localStorage.setItem(reviewTargetedStorageKey, String(targetedModeSwitch.checked));
    updateReviewModeText();
    const selectedTypes = getSelectedReviewTypes();
    syncReviewQuestionCount(selectedTypes, isTargetedReviewMode(), false);

    runner.replaceRemainingQuestions(function (state) {
      return buildReviewQuestions(selectedTypes, isTargetedReviewMode(), state);
    }, true);
  }

  function handleReviewQuestionCountChange() {
    const selectedTypes = getSelectedReviewTypes();
    syncReviewQuestionCount(selectedTypes, isTargetedReviewMode(), false);

    runner.replaceRemainingQuestions(function (state) {
      return buildReviewQuestions(selectedTypes, isTargetedReviewMode(), state);
    }, false);
  }

  if (multipleChoiceCheckbox && writingCheckbox && definitionCheckbox) {
    multipleChoiceCheckbox.addEventListener('change', handleReviewTypeChange);
    writingCheckbox.addEventListener('change', handleReviewTypeChange);
    definitionCheckbox.addEventListener('change', handleReviewTypeChange);
  }
  if (targetedModeSwitch) {
    targetedModeSwitch.addEventListener('change', handleReviewModeChange);
  }
  if (questionCountInput) {
    questionCountInput.addEventListener('change', handleReviewQuestionCountChange);
    questionCountInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      questionCountInput.blur();
    });
  }
}

function startCustomQuizPage() {
  const phraseMode = isPhraseQuizContentMode();
  const storagePrefix = phraseMode ? 'phraseCustomTest' : 'worksheet';
  const customQuizLogic = window.CHINESE_READER_CUSTOM_QUIZ_LOGIC;
  const listeningManifest = window.CHINESE_READER_LISTENING_AUDIO;
  const selectionStorageKey = phraseMode
    ? 'phraseCustomTestGlobalPhrases'
    : 'worksheetGlobalChars';
  const returnUrl = phraseMode ? 'index.html?view=phrases' : 'index.html';
  if (!customQuizLogic) {
    throw new Error('Expected shared Custom Test question logic.');
  }
  const formatSettings = customQuizLogic.readFormatSettings(localStorage, storagePrefix);
  const requestedTypes = [];
  if (formatSettings.mc) requestedTypes.push('mc');
  if (formatSettings.typing) requestedTypes.push('typing');
  if (formatSettings.definition) requestedTypes.push('definition');
  if (formatSettings.listening) requestedTypes.push('listening');
  const selectedTypes = customQuizLogic.filterQuestionTypes(phraseMode, requestedTypes);
  const listeningEntries = listeningManifest
    ? (phraseMode ? listeningManifest.phrases : listeningManifest.words)
    : null;
  if (formatSettings.listening && !Array.isArray(listeningEntries)) {
    throw new Error('Expected the generated local listening audio manifest.');
  }
  const questions = [];
  const storedGlobalSelections = localStorage.getItem(selectionStorageKey);
  const phraseFlatData = phraseMode ? getFlatPhraseData() : null;
  let selectedGlobalIndices = [];

  if (storedGlobalSelections !== null) {
    try {
      const parsed = JSON.parse(storedGlobalSelections);
      if (Array.isArray(parsed)) selectedGlobalIndices = parsed;
    } catch (error) {
      selectedGlobalIndices = [];
    }
  } else if (!phraseMode) {
    const storedLegacyUnit = parseInt(localStorage.getItem('worksheetUnit') || '0', 10);
    const legacyUnit = Number.isInteger(storedLegacyUnit) &&
      storedLegacyUnit >= 0 &&
      storedLegacyUnit < UNIT_DATA.length ?
      storedLegacyUnit :
      0;
    try {
      const legacyIndices = JSON.parse(localStorage.getItem('worksheetChars') || '[]');
      if (Array.isArray(legacyIndices)) {
        selectedGlobalIndices = legacyIndices.map(function (localIndex) {
          return getGlobalIndexForUnitLocal(legacyUnit, parseInt(localIndex, 10));
        });
      }
    } catch (error) {
      selectedGlobalIndices = [];
    }
  }

  selectedGlobalIndices = Array.from(new Set(selectedGlobalIndices.map(function (value) {
    return parseInt(value, 10);
  }).filter(function (globalIndex) {
    return Number.isInteger(globalIndex) &&
      globalIndex >= 0 &&
      globalIndex < (phraseMode ? phraseFlatData.total : getTotalCharacterCount());
  })));

  if (selectedGlobalIndices.length === 0) {
    window.location.href = returnUrl;
    return;
  }

  questions.push.apply(questions, customQuizLogic.buildQuestions({
    selectedGlobalIndices: selectedGlobalIndices,
    selectedTypes: selectedTypes,
    makeQuestion: function (globalIndex, type) {
      let question;
      let expectedPinyin;
      if (phraseMode) {
        question = makeFlatPhraseQuestion(globalIndex, type, phraseFlatData);
        expectedPinyin = phraseFlatData.pinyin[globalIndex];
      } else {
        const wordInfo = getUnitLocalForGlobal(globalIndex);
        question = makeUnitQuestion(wordInfo.unit, wordInfo.localIndex, type, globalIndex);
        expectedPinyin = UNIT_DATA[wordInfo.unit].pinyin[wordInfo.localIndex];
      }
      return type === 'listening'
        ? customQuizLogic.bindListeningAudio(
          question,
          globalIndex,
          listeningEntries,
          expectedPinyin
        )
        : question;
    },
  }));

  shuffleInPlace(questions);

  if (questions.length === 0) {
    window.location.href = returnUrl;
    return;
  }

  const runnerConfig = {
    canvasId: 'quizCanvas',
    inputId: 'quizTypingInput',
    questions: questions,
    onFinish: function (result) {
      if (result.missedItems.length > 0) {
        showMissedWordsPage(
          result.missedItems,
          getCharForGlobalIndex,
          getPinyinForGlobalIndex,
          getDefinitionForGlobalIndex,
          getExamplesForGlobalIndex,
          returnUrl,
          result.correctItems.length,
          result.questions.length
        );
      } else {
        window.location.href = returnUrl;
      }
    },
  };

  if (phraseMode) {
    const phraseLogic = window.CHINESE_READER_PHRASE_QUIZ_LOGIC;
    runnerConfig.normalizeTypingAnswer = phraseLogic
      ? phraseLogic.normalizePinyinAnswer
      : function (value) { return String(value).normalize('NFC').toLowerCase().replace(/\s+/g, ''); };
    runnerConfig.evaluateDefinitionAnswer = function (question, answer) {
      return phraseLogic
        ? phraseLogic.isDefinitionAnswerCorrect(question.definition, answer)
        : isAcceptedEnglishDefinition(question.definition, answer);
    };
    runnerConfig.adjustQuestionKnowledge = function (question, change) {
      adjustPhraseQuestionKnowledge(question, change, phraseFlatData);
    };
    runnerConfig.getQuestionDetails = function (question) {
      return {
        char: question.char,
        pinyin: question.pinyin,
        definition: question.definition,
        examples: [],
      };
    };
    runnerConfig.onFinish = function (result) {
      if (result.missedItems.length > 0) {
        showMissedWordsPage(
          result.missedItems,
          function (index) { return phraseFlatData.phrases[index]; },
          function (index) { return phraseFlatData.pinyin[index]; },
          function (index) { return phraseFlatData.definitions[index]; },
          function () { return []; },
          returnUrl,
          result.correctItems.length,
          result.questions.length
        );
      } else {
        window.location.href = returnUrl;
      }
    };
  }

  createQuizRunner(runnerConfig);
}

function startPhraseQuizPage() {
  const phraseUnits = Array.isArray(window.CHINESE_READER_PHRASE_UNITS)
    ? window.CHINESE_READER_PHRASE_UNITS
    : [];
  const logic = window.CHINESE_READER_PHRASE_QUIZ_LOGIC;
  const returnUrl = 'index.html?view=phrases';

  if (!phraseUnits.length || !logic) {
    throw new Error('Expected phrase units and phrase quiz logic.');
  }

  const flatData = {
    phrases: [],
    pinyin: [],
    definitions: [],
    unitOffsets: [],
    total: 0,
  };

  phraseUnits.forEach(function (unit) {
    if (
      !unit
      || !Array.isArray(unit.phrases)
      || !Array.isArray(unit.pinyin)
      || !Array.isArray(unit.definitions)
      || unit.phrases.length !== unit.pinyin.length
      || unit.phrases.length !== unit.definitions.length
    ) {
      throw new Error('Phrase quiz units must contain aligned phrase, pinyin, and definition arrays.');
    }

    flatData.unitOffsets.push(flatData.total);
    flatData.phrases.push.apply(flatData.phrases, unit.phrases);
    flatData.pinyin.push.apply(flatData.pinyin, unit.pinyin);
    flatData.definitions.push.apply(flatData.definitions, unit.definitions);
    flatData.total += unit.phrases.length;
  });

  function getPhraseProgressKey(unit) {
    return unit === 0 ? 'phraseProgress' : 'phraseProgress_' + unit;
  }

  function getPhraseUnitLocal(globalIndex) {
    for (let unit = phraseUnits.length - 1; unit >= 0; unit--) {
      const offset = flatData.unitOffsets[unit];
      if (globalIndex >= offset) {
        return { unit: unit, localIndex: globalIndex - offset };
      }
    }
    return { unit: 0, localIndex: globalIndex };
  }

  function getAllPhraseProgress() {
    const progress = {};
    phraseUnits.forEach(function (unit, unitIndex) {
      const unitProgress = JSON.parse(
        localStorage.getItem(getPhraseProgressKey(unitIndex)) || '{}'
      );
      const offset = flatData.unitOffsets[unitIndex];
      for (let localIndex = 0; localIndex < unit.phrases.length; localIndex++) {
        const value = Number(unitProgress[String(localIndex)]) || 0;
        if (value > 0) progress[String(offset + localIndex)] = value;
      }
    });
    return progress;
  }

  function getLatestSeenPhraseGlobalIndex() {
    const progress = getAllPhraseProgress();
    let latestSeenGlobal = -1;

    Object.keys(progress).forEach(function (key) {
      const globalIndex = parseInt(key, 10);
      if (Number.isInteger(globalIndex) && globalIndex > latestSeenGlobal) {
        latestSeenGlobal = globalIndex;
      }
    });
    return latestSeenGlobal;
  }

  function getCurrentSection() {
    const maximumSection = Math.max(0, Math.ceil(flatData.total / logic.SECTION_SIZE) - 1);
    const stored = parseInt(localStorage.getItem('phraseCurrentSection') || '0', 10);
    return Math.min(Math.max(Number.isInteger(stored) ? stored : 0, 0), maximumSection);
  }

  function saveCurrentSection(section) {
    localStorage.setItem('phraseCurrentSection', String(section));
  }

  function getQuizPosition() {
    const stored = parseInt(localStorage.getItem('phraseQuizPosition') || '0', 10);
    const positionsPerSection = logic.SECTION_SIZE / logic.ITEMS_PER_QUIZ;
    return Math.min(Math.max(Number.isInteger(stored) ? stored : 0, 0), positionsPerSection - 1);
  }

  function saveQuizPosition(position) {
    localStorage.setItem('phraseQuizPosition', String(position));
  }

  function getBonusCount() {
    const storedMaximum = parseInt(
      localStorage.getItem('phraseMaxBonusCount') || '0',
      10
    );
    const count = logic.getBonusCount(getCurrentSection(), storedMaximum);
    localStorage.setItem('phraseMaxBonusCount', String(count));
    return count;
  }

  function makePhraseQuestion(globalIndex, type, isBonus) {
    const definition = flatData.definitions[globalIndex];
    const question = {
      type: type,
      charIndex: globalIndex,
      trackIndex: globalIndex,
      char: flatData.phrases[globalIndex],
      pinyin: flatData.pinyin[globalIndex],
      definition: definition,
      isBonus: Boolean(isBonus),
    };

    if (type === 'mc') {
      const answers = pickAnswers(globalIndex, flatData.definitions);
      question.answers = answers;
      question.correctAnswerIndex = answers.indexOf(definition);
    }
    return question;
  }

  function completeSkippedPhrases(latestSeenGlobal, targetGlobal) {
    const progressByUnit = {};
    const skipLogic = window.CHINESE_READER_SKIP_LOGIC;
    if (!skipLogic || typeof skipLogic.buildSkipRangeIndices !== 'function') {
      throw new Error('Expected shared skip quiz logic.');
    }
    const skippedPhrases = skipLogic.buildSkipRangeIndices(
      latestSeenGlobal,
      targetGlobal,
      flatData.total
    );

    skippedPhrases.forEach(function (globalIndex) {
      const info = getPhraseUnitLocal(globalIndex);
      if (!progressByUnit[info.unit]) {
        progressByUnit[info.unit] = JSON.parse(
          localStorage.getItem(getPhraseProgressKey(info.unit)) || '{}'
        );
      }
      progressByUnit[info.unit][String(info.localIndex)] = logic.MAX_PROGRESS;
    });

    Object.keys(progressByUnit).forEach(function (unit) {
      localStorage.setItem(
        getPhraseProgressKey(Number(unit)),
        JSON.stringify(progressByUnit[unit])
      );
    });

    const completedTarget = skippedPhrases.length
      ? skippedPhrases[skippedPhrases.length - 1]
      : latestSeenGlobal;
    const nextPhraseIndex = Math.min(
      completedTarget + 1,
      Math.max(flatData.total - 1, 0)
    );
    const nextSection = Math.floor(nextPhraseIndex / logic.SECTION_SIZE);
    const nextPosition = Math.floor(
      (nextPhraseIndex % logic.SECTION_SIZE) / logic.ITEMS_PER_QUIZ
    );
    saveCurrentSection(nextSection);
    saveQuizPosition(nextPosition);
  }

  function startPhraseSkipQuiz() {
    localStorage.removeItem('phraseSkipQuizActive');
    const targetGlobal = parseInt(
      localStorage.getItem('phraseSkipQuizTarget') || '0',
      10
    );
    localStorage.removeItem('phraseSkipQuizTarget');

    const latestSeenGlobal = getLatestSeenPhraseGlobalIndex();
    const skipIndices = logic.buildSkipIndices(
      latestSeenGlobal,
      targetGlobal,
      flatData.total
    );
    const questions = skipIndices.map(function (globalIndex) {
      return makePhraseQuestion(
        globalIndex,
        logic.getRandomSkipQuestionType(),
        false
      );
    });

    if (!questions.length) {
      window.location.href = returnUrl;
      return;
    }

    const xpTotalBefore = getCurrentXpTotal();
    createQuizRunner({
      canvasId: 'quizCanvas',
      inputId: 'typingInput',
      questions: questions,
      adjustQuestionKnowledge: function (question, change) {
        adjustPhraseQuestionKnowledge(question, change, flatData);
      },
      normalizeTypingAnswer: logic.normalizePinyinAnswer,
      evaluateDefinitionAnswer: function (question, answer) {
        return logic.isDefinitionAnswerCorrect(question.definition, answer);
      },
      getQuestionDetails: function (question) {
        return {
          char: question.char,
          pinyin: question.pinyin,
          definition: question.definition,
          examples: [],
        };
      },
      shouldFinishEarly: function (result) {
        return !logic.canStillPassSkipQuiz(
          result.correctItems.length,
          result.answeredCount,
          result.questions.length
        );
      },
      onFinish: function (result) {
        if (logic.hasPassedSkipQuiz(result.correctItems.length, result.questions.length)) {
          completeSkippedPhrases(latestSeenGlobal, targetGlobal);
        }
        const sessionXp = getCurrentXpTotal() - xpTotalBefore;
        showMissedWordsPage(
          result.missedItems,
          function (index) { return flatData.phrases[index]; },
          function (index) { return flatData.pinyin[index]; },
          function (index) { return flatData.definitions[index]; },
          function () { return []; },
          returnUrl,
          result.correctItems.length,
          result.questions.length,
          sessionXp,
          true
        );
      },
    });
  }

  function saveProgress(correctItems) {
    const progressByUnit = {};

    correctItems.forEach(function (globalIndex) {
      const info = getPhraseUnitLocal(globalIndex);
      if (!progressByUnit[info.unit]) {
        progressByUnit[info.unit] = JSON.parse(
          localStorage.getItem(getPhraseProgressKey(info.unit)) || '{}'
        );
      }
      const key = String(info.localIndex);
      progressByUnit[info.unit][key] = logic.incrementProgressValue(
        progressByUnit[info.unit][key]
      );
    });

    Object.keys(progressByUnit).forEach(function (unit) {
      localStorage.setItem(
        getPhraseProgressKey(Number(unit)),
        JSON.stringify(progressByUnit[unit])
      );
    });
  }

  function handleEmptyMainQuestions() {
    const section = getCurrentSection();
    const progress = getAllPhraseProgress();
    const maximumSection = Math.max(0, Math.ceil(flatData.total / logic.SECTION_SIZE) - 1);

    if (logic.isSectionComplete(progress, flatData.total, section) && section < maximumSection) {
      saveCurrentSection(section + 1);
      saveQuizPosition(0);
      window.location.reload();
      return;
    }

    window.location.href = returnUrl;
  }

  function finishPhraseQuiz(result) {
    const xpTotalBefore = getCurrentXpTotal();
    awardCompletedItemXp(result.correctItems, function (globalIndex) {
      const info = getPhraseUnitLocal(globalIndex);
      const progress = getStoredNumberMap(getPhraseProgressKey(info.unit));
      return progress[String(info.localIndex)];
    });
    saveProgress(result.correctItems);
    const sessionXp = getCurrentXpTotal() - xpTotalBefore;
    const section = getCurrentSection();
    const updatedProgress = getAllPhraseProgress();
    const maximumSection = Math.max(0, Math.ceil(flatData.total / logic.SECTION_SIZE) - 1);

    if (logic.isSectionComplete(updatedProgress, flatData.total, section)) {
      if (section < maximumSection) saveCurrentSection(section + 1);
      saveQuizPosition(0);
    } else {
      const positionsPerSection = logic.SECTION_SIZE / logic.ITEMS_PER_QUIZ;
      saveQuizPosition((getQuizPosition() + 1) % positionsPerSection);
    }

    showMissedWordsPage(
      result.missedItems,
      function (index) { return flatData.phrases[index]; },
      function (index) { return flatData.pinyin[index]; },
      function (index) { return flatData.definitions[index]; },
      function () { return []; },
      returnUrl,
      result.correctItems.length,
      result.questions.length,
      sessionXp,
      true
    );
  }

  if (localStorage.getItem('phraseSkipQuizActive')) {
    startPhraseSkipQuiz();
    return;
  }

  const progress = getAllPhraseProgress();
  const mainIndices = logic.buildMainIndices(
    progress,
    flatData.total,
    getCurrentSection(),
    getQuizPosition()
  );
  if (!mainIndices.length) {
    handleEmptyMainQuestions();
    return;
  }

  const bonusIndices = logic.buildBonusIndices(
    progress,
    flatData.total,
    mainIndices,
    getBonusCount()
  );
  const questions = logic.buildQuestionSequence(mainIndices, bonusIndices).map(function (entry) {
    return makePhraseQuestion(entry.index, entry.type, entry.isBonus);
  });

  createQuizRunner({
    canvasId: 'quizCanvas',
    inputId: 'typingInput',
    questions: questions,
    adjustQuestionKnowledge: function (question, change) {
      adjustPhraseQuestionKnowledge(question, change, flatData);
    },
    normalizeTypingAnswer: logic.normalizePinyinAnswer,
    evaluateDefinitionAnswer: function (question, answer) {
      return logic.isDefinitionAnswerCorrect(question.definition, answer);
    },
    canSkipQuestion: function (question) {
      return !question.isBonus;
    },
    getQuestionDetails: function (question) {
      return {
        char: question.char,
        pinyin: question.pinyin,
        definition: question.definition,
        examples: [],
      };
    },
    onFinish: finishPhraseQuiz,
  });
}

function startQuizMode(mode) {
  if (mode === 'regular') {
    startRegularQuizPage();
  } else if (mode === 'review') {
    startReviewQuizPage();
  } else if (mode === 'custom') {
    startCustomQuizPage();
  } else if (mode === 'phrases') {
    startPhraseQuizPage();
  }
}

(function () {
  const script = document.currentScript;
  if (!script) return;

  const mode = script.getAttribute('data-quiz-mode');
  if (mode) {
    startQuizMode(mode);
  }
})();
