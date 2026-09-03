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
  const animationFrames = [];
  let reloadCount = 0;
  const listeners = {};
  const elements = {};
  if (options.accountUi) {
    [
      'accountButton', 'accountAvatar', 'accountName', 'accountEmail', 'accountGuestLabel', 'accountStatus',
      'accountSettingsOverlay', 'accountSettingsWindow', 'accountSettingsClose', 'accountSettingsName',
      'accountSettingsEmail', 'accountSettingsAvatar', 'accountSettingsSave', 'accountSettingsSignOut', 'accountSettingsMessage',
    ].forEach(function (id) {
      elements[id] = {
        hidden: false,
        textContent: '',
        value: '',
        disabled: false,
        src: '',
        alt: '',
        attributes: {},
        style: {},
        handlers: {},
        addEventListener(name, handler) { this.handlers[name] = handler; },
        click() { return this.handlers.click && this.handlers.click({ target: this, preventDefault() {} }); },
        focus() {},
        getBoundingClientRect() { return { left: 16, top: 16, width: 200, height: 46 }; },
        setAttribute(name, value) { this.attributes[name] = String(value); },
        removeAttribute(name) { delete this.attributes[name]; },
      };
    });
  }
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
    innerWidth: 1000,
    innerHeight: 800,
    history: { replaceState() {} },
    addEventListener(name, handler) { listeners[name] = handler; },
    requestAnimationFrame(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
    cancelAnimationFrame() {},
    setTimeout,
    clearTimeout,
  };
  const context = vm.createContext({
    window: windowFake,
    document: {
      readyState: options.accountUi ? 'complete' : 'loading',
      getElementById(id) { return elements[id] || null; },
      addEventListener(name, handler) { listeners[name] = handler; },
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
  return {
    storage,
    requests,
    assignedUrls,
    windowFake,
    elements,
    runNextAnimationFrame(timestamp) {
      const callback = animationFrames.shift();
      if (callback) callback(timestamp);
    },
    get animationFrameCount() { return animationFrames.length; },
    get reloadCount() { return reloadCount; },
  };
}

function activeSession() {
  return JSON.stringify({
    access_token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImxlYXJuZXJAZXhhbXBsZS5jb20ifQ.',
    refresh_token: 'account-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: '00000000-0000-0000-0000-000000000001', email: 'learner@example.com' },
  });
}

const ACCOUNT_PROFILE_CACHE_KEY = 'cnreaderAccountProfile_00000000-0000-0000-0000-000000000001';

function accountProfile(fullName) {
  return {
    email: 'learner@example.com',
    user_metadata: {
      full_name: fullName,
      avatar_url: 'https://example.com/learner.png',
    },
  };
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

  const cachedProfile = createHarness({
    accountUi: true,
    entries: [
      ['cnreaderAccountSession', activeSession()],
      [ACCOUNT_PROFILE_CACHE_KEY, JSON.stringify(accountProfile('Cached Reader'))],
    ],
    replies: [
      { body: [] },
      { body: accountProfile('Fresh Reader') },
      { body: [{ user_id: '00000000-0000-0000-0000-000000000001' }] },
    ],
  });
  assert.equal(cachedProfile.elements.accountName.textContent, 'Cached Reader', 'A profile cache must render before network requests finish');
  assert.equal(cachedProfile.elements.accountAvatar.src, 'https://example.com/learner.png', 'A profile cache must render the saved avatar immediately');
  await cachedProfile.windowFake.CNReaderAccount.initialize();
  assert.equal(cachedProfile.elements.accountName.textContent, 'Fresh Reader', 'Supabase must refresh the locally cached display name');
  assert.deepEqual(
    JSON.parse(cachedProfile.storage.getItem(ACCOUNT_PROFILE_CACHE_KEY)),
    accountProfile('Fresh Reader'),
    'A successful Supabase profile fetch must refresh the user-scoped cache'
  );

  const profile = createHarness({
    accountUi: true,
    entries: [['cnreaderAccountSession', activeSession()]],
    replies: [
      { body: [] },
      { body: accountProfile('Learner Example') },
      { body: [{ user_id: '00000000-0000-0000-0000-000000000001' }] },
      { body: accountProfile('New Reader Name') },
    ],
  });
  await profile.windowFake.CNReaderAccount.initialize();
  assert.match(profile.requests[1].url, /\/auth\/v1\/user$/, 'The account control must load the signed-in user profile');
  assert.equal(profile.elements.accountName.textContent, 'Learner Example', 'The account button must show the Google full name');
  assert.equal(profile.elements.accountEmail.textContent, 'learner@example.com', 'The account button must show the signed-in email');
  assert.equal(profile.elements.accountAvatar.src, 'https://example.com/learner.png', 'The account button must show the Google avatar');
  assert.equal(profile.elements.accountAvatar.hidden, false, 'The Google avatar must be visible after loading');
  await profile.elements.accountButton.click();
  assert.equal(profile.storage.getItem('cnreaderAccountSession'), activeSession(), 'Opening account settings must not sign the user out');
  assert.equal(profile.elements.accountSettingsOverlay.style.display, 'flex', 'Clicking the signed-in profile must open account settings');
  assert.equal(profile.elements.accountSettingsWindow.style.transition, 'transform 0.1s linear', 'Account settings must retain the original CSS opening transition');
  assert.equal(profile.elements.accountSettingsOverlay.style.transition, 'backdrop-filter 0.1s linear, -webkit-backdrop-filter 0.1s linear', 'Account settings blur must retain the original CSS opening transition');
  assert.equal(profile.elements.accountSettingsName.value, 'Learner Example', 'Account settings must begin with the saved name');
  profile.runNextAnimationFrame(0);
  const framesBeforeClosingSettings = profile.animationFrameCount;
  profile.elements.accountSettingsClose.click();
  assert.equal(
    profile.animationFrameCount,
    framesBeforeClosingSettings + 1,
    'Account settings must use the same frame-based close animation as grid popups'
  );
  profile.elements.accountSettingsName.value = 'New Reader Name';
  assert.equal(profile.elements.accountName.textContent, 'Learner Example', 'Editing a draft name must not update the profile button before Save');
  profile.elements.accountSettingsSave.click();
  await new Promise(function (resolve) { setTimeout(resolve, 0); });
  assert.equal(profile.requests[3].init.method, 'PUT', 'Save must update the signed-in user profile');
  assert.match(profile.requests[3].url, /\/auth\/v1\/user$/, 'Save must target Supabase user metadata');
  assert.deepEqual(profile.requests[3].body, { data: { full_name: 'New Reader Name' } }, 'Save must persist only the chosen display name');
  assert.equal(profile.elements.accountName.textContent, 'New Reader Name', 'The profile button must update only after a successful save');
  assert.deepEqual(
    JSON.parse(profile.storage.getItem(ACCOUNT_PROFILE_CACHE_KEY)),
    accountProfile('New Reader Name'),
    'A successfully saved name must refresh only that account\'s local profile cache'
  );

  const returningProfile = createHarness({
    accountUi: true,
    entries: [['cnreaderAccountSession', activeSession()]],
    replies: [
      { body: [] },
      { body: accountProfile('New Reader Name') },
      { body: [{ user_id: '00000000-0000-0000-0000-000000000001' }] },
    ],
  });
  await returningProfile.windowFake.CNReaderAccount.initialize();
  assert.match(returningProfile.requests[1].url, /\/auth\/v1\/user$/, 'A returning session must load profile data from Supabase');
  assert.equal(returningProfile.elements.accountName.textContent, 'New Reader Name', 'A returning session must show the name saved in Supabase');

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

  const accountClientSource = fs.readFileSync(path.join(__dirname, '..', 'account-sync.js'), 'utf8');
  assert.doesNotMatch(
    accountClientSource,
    /Progress restored from your account/,
    'Account restoration must not leave a status message beneath the profile button'
  );

  const pages = ['index.html', 'quiz.html', 'phrase-quiz.html', 'review.html', 'custom-quiz.html', 'custom-test.html', 'select.html', 'worksheet.html'];
  pages.forEach(function (page) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    assert.ok(html.indexOf('progress-backup.js?v=6') < html.indexOf('account-sync.js?v=3'), page + ' must load the current account sync after progress backup');
  });
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(indexHtml, /id="accountButton"/, 'The main page must provide a Google sign-in control');
  assert.match(indexHtml, /id="accountAvatar"/, 'The main page must provide a profile avatar in the account button');
  assert.match(indexHtml, /id="accountName"/, 'The main page must provide the signed-in name in the account button');
  assert.match(indexHtml, /id="accountEmail"/, 'The main page must provide the signed-in email in the account button');
  assert.match(indexHtml, /id="accountSettingsOverlay"/, 'The main page must provide an account settings popup');
  assert.match(indexHtml, /id="accountSettingsClose"/, 'The account settings popup must provide the same-position close control');
  assert.match(indexHtml, /id="accountSettingsSave"/, 'The account settings popup must provide a Save control');
  assert.match(indexHtml, /id="accountSettingsSignOut"/, 'The account settings popup must provide a Sign out control');
  assert.match(indexHtml, /id="accountStatus"/, 'The main page must provide accessible account-sync status text');
  assert.match(
    indexHtml,
    /#accountControl\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*16px;[\s\S]*?left:\s*16px;/,
    'The account control must be page-attached in the top-left corner'
  );
  console.log('account sync tests passed');
})();
