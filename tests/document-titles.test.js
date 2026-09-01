const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const pages = [
  'index.html',
  'quiz.html',
  'phrase-quiz.html',
  'review.html',
  'custom-quiz.html',
  'custom-test.html',
  'select.html',
  'worksheet.html',
];

for (const page of pages) {
  const html = fs.readFileSync(path.join(projectRoot, page), 'utf8');
  assert.match(html, /<title>CNReader<\/title>/, page + ' must use CNReader as its browser-tab title');
}

for (const script of ['select.js', 'quiz-engine.js']) {
  const source = fs.readFileSync(path.join(projectRoot, script), 'utf8');
  assert.doesNotMatch(source, /document\.title\s*=/, script + ' must not override the shared browser-tab title');
}
