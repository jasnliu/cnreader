const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectUrl = 'https://vpsrblvqivupvnjitvri.supabase.co';
const publishableKey = 'sb_publishable_v3MBtMNMxOjTojtBAl71Cg_2RhYwxAW';

function createStorage(entries) {
  const values = new Map(entries || []);
  return {
    get length() { return values.size; },
    key(index) { return Array.from(values.keys())[index] || null; },
    getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
    setItem(key, value) { values.set(String(key), String(value)); },
    removeItem(key) { values.delete(String(key)); },
  };
}

function createHarness(options) {
  const storage = createStorage(options.entries);
  const requests = [];
  const assignedUrls = [];
  let reloadCount = 0;
  const listeners = {};
  const location = {
    href: 'https://cnreader.vercel.app/',
    origin: 'https://cnreader.vercel.app',
    hash: '',
    search: '',
    pathname: '/',
    assign(url) { assignedUrls.push(url); },
    reload() { reloadCount += 1; },
  };
  const windowFake = {
    location,
    history: { replaceState() {} },
    addEventListener(name, handler) { listeners[name] = handler; },
    setTimeout,
    clearTimeout,
  };
  const context = vm.createContext({
    window: windowFake,
    document: {
      readyState: 'loading',
      getElementById() { return null; },
      addEventListener() {},
    },
    localStorage: storage,
    fetch: async function (url, init) {
      requests.push({ url, init, body: init && init.body ? JSON.parse(init.body) : null });
      const reply = options.replies.shift();
      return {
        ok: reply.ok !== false,
        status: reply.status || 200,
        async json() { return reply.body; },
      };
    },
    URL,
    URLSearchParams,
    atob,
    JSON,
    Math,
    Date,
    console,
    setTimeout,
    clearTimeout,
  });

  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'progress-backup.js'), 'utf8'),
    context,
    { filename: 'progress-backup.js' }
  );
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'account-sync.js'), 'utf8'),
    context,
    { filename: 'account-sync.js' }
  );
  return { storage, requests, assignedUrls, windowFake, get reloadCount() { return reloadCount; } };
}

function activeSession() {
  return JSON.stringify({
    access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImxlYXJuZXJAZXhhbXBsZS5jb20ifQ.',
    refresh_token: 'account-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-0000-0000-000000000001', email: 'learner@example.com' },
  });
}

(async function () {
  const existing = createHarness({
    entries: [
      ['charProgress', '{"0":3}'],
      ['currentUnit', '0'],
      ['cnreaderAccountSession', activeSession()],
    ],
    replies: [{ body: [{ progress: {
      format: 'cnreader-progress',
      version: 1,
      data: { charProgress: '{"0":6}', currentUnit: '1' },
    } }] }],
  });
  await existing.windowFake.CNReaderAccount.initialize();
  assert.equal(existing.storage.getItem('charProgress'), '{"0":6}', 'Existing account progress must replace guest progress');
  assert.equal(existing.storage.getItem('currentUnit'), '1', 'Existing account navigation must be restored');
  assert.equal(existing.reloadCount, 1, 'An existing account restore must redraw the page once');
  assert.match(existing.requests[0].url, /\/rest\/v1\/user_progress\?select=progress/, 'Existing accounts must read their cloud row first');

  const newAccount = createHarness({
    entries: [
      ['charProgress', '{"0":3}'],
      ['cnreaderAccountSession', activeSession()],
    ],
    replies: [
      { body: [] },
      { body: [{ user_id: '00000000-0000-0000-0000-000000000001' }] },
      { body: [{ user_id: '00000000-0000-0000-0000-000000000001' }] },
    ],
  });
  await newAccount.windowFake.CNReaderAccount.initialize();
  assert.equal(newAccount.requests.length, 2, 'A first-time account must create a cloud progress row');
  assert.equal(newAccount.requests[1].body.progress.data.charProgress, '{"0":3}', 'A new account must receive guest progress');
  newAccount.storage.setItem('charProgress', '{"0":4}');
  await new Promise(function (resolve) { setTimeout(resolve, 900); });
  assert.equal(newAccount.requests[2].body.progress.data.charProgress, '{"0":4}', 'Progress made after sign-in must update the account cloud save');

  const guest = createHarness({ entries: [], replies: [] });
  await guest.windowFake.CNReaderAccount.signInWithGoogle();
  assert.equal(
    guest.assignedUrls[0],
    projectUrl + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent('https://cnreader.vercel.app/'),
    'Google sign-in must use the configured Supabase implicit OAuth endpoint'
  );

  assert.equal(
    guest.windowFake.CNReaderAccount.config.projectUrl,
    projectUrl,
    'The account client must target the configured Supabase project'
  );
  assert.equal(
    guest.windowFake.CNReaderAccount.config.publishableKey,
    publishableKey,
    'The account client must use the configured publishable key'
  );

  const pages = ['index.html', 'quiz.html', 'phrase-quiz.html', 'review.html', 'custom-quiz.html', 'custom-test.html', 'select.html', 'worksheet.html'];
  pages.forEach(function (page) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    assert.ok(html.indexOf('progress-backup.js?v=6') < html.indexOf('account-sync.js?v=1'), page + ' must load account sync after progress backup');
  });
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexHtml, /id="accountButton"/, 'The main page must provide a Google sign-in control');
  assert.match(indexHtml, /id="accountStatus"/, 'The main page must provide accessible account-sync status text');
  assert.match(
    indexHtml,
    /#accountControl\s*\{[\s\S]*?top:\s*16px;[\s\S]*?left:\s*16px;/,
    'The account control must be fixed in the top-left corner'
  );
  console.log('account sync tests passed');
})();
