const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(projectRoot, 'script.js'), 'utf8');

assert.match(html, /<div id="gridXpOutline"[^>]*>\s*<span id="gridXpValue">0 XP<\/span>\s*<\/div>/);
assert.match(html, /<script src="xp-system\.js\?v=xp-animation-duration-1"><\/script>/);
assert.match(html, /#gridXpOutline[\s\S]*?border-style: solid solid none/);
assert.match(html, /#gridXpOutline[\s\S]*?font-family: 'Times New Roman', serif/);

assert.match(script, /function getCurrentGridXpValue\(\)/);
assert.match(script, /gridXpValue\.textContent = String\(wholeXp\) \+ ' XP';/);
assert.match(script, /function getGridXpHeaderWidth\(xp\)/);
assert.match(script, /function positionGridXpOutline\(gridLeft\)/);
assert.match(script, /outline\.style\.left = gridLeft \+ 'px';/);
assert.match(script, /gridXpOutline\.style\.display = quizModeSelected \? 'flex' : 'none';/);
