const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'custom-test.html'),
  'utf8'
);
const panelRule = html.match(/#formatCheckboxes\s*\{([^}]*)\}/);

assert.ok(panelRule, 'custom-test.html must style the shared checkbox container');
assert.match(panelRule[1], /background\s*:\s*white\s*;/, 'checkbox panel must hide the grid with a white background');
assert.match(panelRule[1], /border\s*:\s*2px\s+solid\s+black\s*;/, 'checkbox panel must have a black outline');
assert.match(panelRule[1], /padding\s*:\s*\d+px\s*;/, 'checkbox panel must keep its controls away from the outline');

console.log('custom-test checkbox panel styling is present');
