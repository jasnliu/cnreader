# Google Account Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google sign-in and secure Supabase progress synchronization while preserving local guest progress.

**Architecture:** `progress-backup.js` exposes the canonical durable snapshot. A dependency-free `account-sync.js` runs after it on every page, owns OAuth/session/sync behavior, and renders the main-page account control. Supabase's RLS-protected `user_progress` table stores one versioned snapshot per user.

**Tech Stack:** Vanilla browser JavaScript, Supabase Auth REST API, Supabase PostgREST API, Node VM tests.

**Spec:** `docs/superpowers/specs/2026-09-02-google-account-progress-design.md`

## Global Constraints

- Retain `localStorage` as the complete guest-mode store.
- Do not add data arrays to consumer scripts.
- Use only the supplied Supabase Project URL and publishable key; never add a secret/service key.
- Preserve the existing console backup format and omit auth/transient keys from cloud snapshots.
- Load the account script after `progress-backup.js` on every HTML page that loads progress.

---

### Task 1: Test the cloud-account contract

**Files:**
- Create: `tests/account-sync.test.js`
- Test: `tests/account-sync.test.js`

**Interfaces:**
- Consumes: `window.CNReaderProgressStore`, `window.CNReaderAccount`.
- Produces: executable behavior tests for account creation, existing-account restoration, OAuth navigation, and cloud writes.

- [ ] **Step 1: Write the failing test**

```js
assert.equal(fetchCalls[0].url.includes('/rest/v1/user_progress?select=progress'), true);
assert.equal(storage.getItem('charProgress'), '{"0":6}');
assert.equal(fetchCalls.at(-1).body.progress.data.charProgress, '{"0":3}');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/account-sync.test.js`

Expected: FAIL because `account-sync.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create the script interface required by the test; no UI work in this task.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/account-sync.test.js`

Expected: PASS.

### Task 2: Expose the durable snapshot boundary

**Files:**
- Modify: `progress-backup.js`
- Test: `tests/account-sync.test.js`

**Interfaces:**
- Produces: `window.CNReaderProgressStore.readSnapshot()` and `restoreSnapshot(snapshot)`.

- [ ] **Step 1: Extend the failing test**

```js
assert.deepEqual(progressStore.readSnapshot().data, { charProgress: '{"0":3}' });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/account-sync.test.js`

Expected: FAIL because the durable snapshot interface is missing.

- [ ] **Step 3: Implement the snapshot interface**

Reuse the existing validation and restore behavior without changing the backup-code API.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/account-sync.test.js`

Expected: PASS.

### Task 3: Add account UI and load the synchronizer

**Files:**
- Create: `account-sync.js`
- Modify: `index.html`, `quiz.html`, `phrase-quiz.html`, `review.html`, `custom-quiz.html`, `custom-test.html`, `select.html`, `worksheet.html`
- Test: `tests/account-sync.test.js`

**Interfaces:**
- Produces: `window.CNReaderAccount.signInWithGoogle()` and `signOut()`.

- [ ] **Step 1: Add a failing HTML/load-order assertion**

```js
assert.match(indexHtml, /id="accountButton"/);
assert.ok(indexHtml.indexOf('progress-backup.js') < indexHtml.indexOf('account-sync.js'));
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node tests/account-sync.test.js`

Expected: FAIL because the account control and shared load are absent.

- [ ] **Step 3: Implement the HTML and UI binding**

Add a compact main-page sign-in/account button and load `account-sync.js` after the backup script on all progress pages.

- [ ] **Step 4: Run it to verify it passes**

Run: `node tests/account-sync.test.js`

Expected: PASS.

### Task 4: Verify the integrated site

**Files:**
- Modify: cache keys in affected HTML files
- Test: `tests/account-sync.test.js`

- [ ] **Step 1: Run feature and existing tests**

Run: `node tests/account-sync.test.js && for test in tests/*.test.js; do node "$test"; done`

Expected: every JavaScript test passes.

- [ ] **Step 2: Run syntax verification**

Run: `node --check account-sync.js && node --check progress-backup.js`

Expected: both commands exit 0.

- [ ] **Step 3: Smoke-test the deployed flow**

Open the Vercel site, create guest progress, sign in with a first-time Google account, and confirm a database row is created; then sign in on another browser and confirm the row restores the account state.
