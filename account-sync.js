(function (global) {
  'use strict';

  const CONFIG = Object.freeze({
    projectUrl: 'https://vpsrblvqivupvnjitvri.supabase.co',
    publishableKey: 'sb_publishable_v3MBtMNMxOjTojtBAl71Cg_2RhYwxAW',
  });
  const SESSION_KEY = 'cnreaderAccountSession';
  const HYDRATED_USER_KEY = 'cnreaderAccountHydratedUser';
  const SYNC_DELAY_MS = 800;
  let initializing = null;
  let syncTimer = null;
  let restoringProgress = false;
  let accountButton = null;
  let accountStatus = null;

  const progressStore = global.CNReaderProgressStore;
  if (!progressStore) {
    throw new Error('account-sync.js must load after progress-backup.js.');
  }

  function getSession() {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return session && session.access_token && session.refresh_token ? session : null;
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function decodeJwtPayload(token) {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    try {
      const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
      return JSON.parse(atob(padded));
    } catch (error) {
      return null;
    }
  }

  function getUserId(session) {
    const payload = decodeJwtPayload(session && session.access_token);
    return payload && typeof payload.sub === 'string' ? payload.sub : null;
  }

  function authHeaders(session, contentType) {
    const headers = {
      apikey: CONFIG.publishableKey,
      Authorization: 'Bearer ' + session.access_token,
    };
    if (contentType) headers['Content-Type'] = 'application/json';
    return headers;
  }

  async function responseJson(response) {
    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(data.message || data.error_description || data.error || 'Cloud progress request failed.');
    }
    return data;
  }

  async function refreshSessionIfNeeded(session) {
    const expiresAt = Number(session.expires_at || 0) * 1000;
    if (expiresAt > Date.now() + 60000) return session;
    const response = await fetch(CONFIG.projectUrl + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: CONFIG.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const refreshed = await responseJson(response);
    saveSession(refreshed);
    return refreshed;
  }

  function consumeOAuthReturn() {
    const params = new URLSearchParams(String(global.location.hash || '').replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return false;
    saveSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: Math.floor(Date.now() / 1000) + Number(params.get('expires_in') || 3600),
      token_type: params.get('token_type') || 'bearer',
    });
    global.history.replaceState({}, document.title, global.location.pathname + global.location.search);
    return true;
  }

  async function loadCloudProgress(session) {
    const response = await fetch(CONFIG.projectUrl + '/rest/v1/user_progress?select=progress', {
      headers: authHeaders(session),
    });
    const rows = await responseJson(response);
    return Array.isArray(rows) && rows[0] ? rows[0].progress : null;
  }

  async function saveCloudProgress(session) {
    const userId = getUserId(session);
    if (!userId) throw new Error('Could not determine the signed-in account.');
    const response = await fetch(CONFIG.projectUrl + '/rest/v1/user_progress?on_conflict=user_id', {
      method: 'POST',
      headers: Object.assign(authHeaders(session, true), { Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ user_id: userId, progress: progressStore.readSnapshot() }),
    });
    await responseJson(response);
  }

  function setAccountStatus(message) {
    if (accountStatus) accountStatus.textContent = message || '';
  }

  function updateAccountControl() {
    if (!accountButton) return;
    const session = getSession();
    if (!session) {
      accountButton.textContent = 'Sign in with Google';
      accountButton.setAttribute('aria-label', 'Sign in with Google');
      return;
    }
    const payload = decodeJwtPayload(session.access_token) || {};
    accountButton.textContent = payload.email ? 'Sign out (' + payload.email + ')' : 'Sign out';
    accountButton.setAttribute('aria-label', 'Sign out');
  }

  function scheduleSync() {
    if (restoringProgress || !getSession()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      syncNow().catch(function (error) {
        setAccountStatus('Progress is saved on this device. Cloud sync will retry.');
        console.warn('CNReader cloud progress sync failed:', error);
      });
    }, SYNC_DELAY_MS);
  }

  function observeProgressStorage() {
    const storagePrototype = typeof Storage !== 'undefined' ? Storage.prototype : localStorage;
    if (!storagePrototype || storagePrototype.__cnReaderAccountSyncPatched) return;
    const originalSetItem = storagePrototype.setItem;
    const originalRemoveItem = storagePrototype.removeItem;
    if (typeof originalSetItem !== 'function' || typeof originalRemoveItem !== 'function') return;
    storagePrototype.setItem = function (key, value) {
      const result = originalSetItem.call(this, key, value);
      if (progressStore.isDurableKey(String(key))) scheduleSync();
      return result;
    };
    storagePrototype.removeItem = function (key) {
      const result = originalRemoveItem.call(this, key);
      if (progressStore.isDurableKey(String(key))) scheduleSync();
      return result;
    };
    storagePrototype.__cnReaderAccountSyncPatched = true;
  }

  async function syncNow() {
    const stored = getSession();
    if (!stored) return false;
    const session = await refreshSessionIfNeeded(stored);
    await saveCloudProgress(session);
    setAccountStatus('Saved to your account');
    return true;
  }

  async function initialize() {
    if (initializing) return initializing;
    initializing = (async function () {
      consumeOAuthReturn();
      observeProgressStorage();
      const stored = getSession();
      updateAccountControl();
      if (!stored) return false;
      try {
        const session = await refreshSessionIfNeeded(stored);
        const userId = getUserId(session);
        const cloudProgress = await loadCloudProgress(session);
        if (cloudProgress) {
          if (userId && localStorage.getItem(HYDRATED_USER_KEY) !== userId) {
            restoringProgress = true;
            try {
              progressStore.restoreSnapshot(cloudProgress, false);
            } finally {
              restoringProgress = false;
            }
            localStorage.setItem(HYDRATED_USER_KEY, userId);
            setAccountStatus('Progress restored from your account');
            updateAccountControl();
            global.location.reload();
            return true;
          }
          setAccountStatus('Progress restored from your account');
        } else {
          await saveCloudProgress(session);
          if (userId) localStorage.setItem(HYDRATED_USER_KEY, userId);
          setAccountStatus('Guest progress saved to your new account');
        }
        updateAccountControl();
        return true;
      } catch (error) {
        if (/token|session|jwt|refresh/i.test(String(error && error.message))) clearSession();
        updateAccountControl();
        setAccountStatus('Cloud progress could not be loaded. Your device progress is unchanged.');
        console.warn('CNReader account initialization failed:', error);
        return false;
      }
    })();
    try {
      return await initializing;
    } finally {
      initializing = null;
    }
  }

  async function signInWithGoogle() {
    const redirectTo = global.location.origin + '/';
    global.location.assign(
      CONFIG.projectUrl + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectTo)
    );
  }

  async function signOut() {
    try {
      await syncNow();
    } catch (error) {
      console.warn('CNReader cloud progress could not be saved before sign-out:', error);
    }
    clearSession();
    localStorage.removeItem(HYDRATED_USER_KEY);
    updateAccountControl();
    setAccountStatus('Signed out. Progress stays on this device until another account is used.');
  }

  function bindAccountControl() {
    accountButton = document.getElementById('accountButton');
    accountStatus = document.getElementById('accountStatus');
    if (!accountButton) return;
    accountButton.addEventListener('click', function () {
      if (getSession()) signOut();
      else signInWithGoogle();
    });
    updateAccountControl();
  }

  global.addEventListener('pagehide', function () { syncNow().catch(function () {}); });
  global.CNReaderAccount = Object.freeze({
    config: CONFIG,
    initialize: initialize,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    syncNow: syncNow,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindAccountControl();
      initialize();
    }, { once: true });
  } else {
    bindAccountControl();
    initialize();
  }
})(window);
