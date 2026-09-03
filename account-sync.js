(function (global) {
  'use strict';

  const CONFIG = Object.freeze({
    projectUrl: 'https://vpsrblvqivupvnjitvri.supabase.co',
    publishableKey: 'sb_publishable_v3MBtMNMxOjTojtBAl71Cg_2RhYwxAW',
  });
  const SESSION_KEY = 'cnreaderAccountSession';
  const HYDRATED_USER_KEY = 'cnreaderAccountHydratedUser';
  const PROFILE_CACHE_KEY_PREFIX = 'cnreaderAccountProfile_';
  const SYNC_DELAY_MS = 800;
  const ACCOUNT_SETTINGS_CLOSE_DURATION_MS = 70;
  const ACCOUNT_SETTINGS_BLUR_AMOUNT = 5;
  let initializing = null;
  let syncTimer = null;
  let restoringProgress = false;
  let accountButton = null;
  let accountStatus = null;
  let accountAvatar = null;
  let accountName = null;
  let accountEmail = null;
  let accountGuestLabel = null;
  let accountProfile = null;
  let accountSettingsOverlay = null;
  let accountSettingsWindow = null;
  let accountSettingsClose = null;
  let accountSettingsName = null;
  let accountSettingsEmail = null;
  let accountSettingsAvatar = null;
  let accountSettingsSave = null;
  let accountSettingsSignOut = null;
  let accountSettingsMessage = null;
  let accountSettingsAnimationFrame = null;

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

  function getAccountProfileCacheKey(session) {
    const userId = getUserId(session);
    return userId ? PROFILE_CACHE_KEY_PREFIX + userId : null;
  }

  function readCachedAccountProfile(session) {
    const cacheKey = getAccountProfileCacheKey(session);
    if (!cacheKey) return null;
    try {
      const profile = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : null;
    } catch (error) {
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  function saveCachedAccountProfile(session, profile) {
    const cacheKey = getAccountProfileCacheKey(session);
    if (!cacheKey || !profile || typeof profile !== 'object') return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(profile));
    } catch (error) {
      console.warn('CNReader account profile cache could not be saved:', error);
    }
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

  async function loadAccountProfile(session) {
    if (!accountName || !accountEmail || !accountAvatar) return null;
    const response = await fetch(CONFIG.projectUrl + '/auth/v1/user', {
      headers: authHeaders(session),
    });
    return responseJson(response);
  }

  function getAccountDetails(session) {
    const payload = decodeJwtPayload(session && session.access_token) || {};
    const metadata = accountProfile && accountProfile.user_metadata || {};
    const email = accountProfile && accountProfile.email || payload.email || '';
    return {
      name: metadata.full_name || metadata.name || (accountProfile ? email : ''),
      email: email,
      avatarUrl: metadata.avatar_url || metadata.picture || '',
    };
  }

  function updateAccountControl() {
    if (!accountButton) return;
    const session = getSession();
    if (!session) {
      accountProfile = null;
      accountButton.removeAttribute('data-signed-in');
      accountButton.setAttribute('aria-label', 'Sign in with Google');
      if (accountGuestLabel) accountGuestLabel.hidden = false;
      if (accountAvatar) {
        accountAvatar.hidden = true;
        accountAvatar.removeAttribute('src');
      }
      if (accountName) {
        accountName.textContent = '';
        accountName.hidden = false;
      }
      if (accountEmail) accountEmail.textContent = '';
      return;
    }
    const details = getAccountDetails(session);
    accountButton.setAttribute('data-signed-in', 'true');
    accountButton.setAttribute('aria-label', 'Account settings for ' + (details.name || details.email));
    if (accountGuestLabel) accountGuestLabel.hidden = true;
    if (accountName) {
      accountName.textContent = details.name;
      accountName.hidden = !details.name;
    }
    if (accountEmail) accountEmail.textContent = details.email;
    if (accountAvatar) {
      accountAvatar.hidden = !details.avatarUrl;
      if (details.avatarUrl) accountAvatar.src = details.avatarUrl;
      else accountAvatar.removeAttribute('src');
    }
  }

  function setAccountSettingsMessage(message) {
    if (accountSettingsMessage) accountSettingsMessage.textContent = message || '';
  }

  function scheduleAccountSettingsFrame(callback) {
    if (typeof global.requestAnimationFrame === 'function') {
      return global.requestAnimationFrame(callback);
    }
    return global.setTimeout(callback, 0);
  }

  function cancelAccountSettingsFrame() {
    if (accountSettingsAnimationFrame === null) return;
    if (typeof global.cancelAnimationFrame === 'function') {
      global.cancelAnimationFrame(accountSettingsAnimationFrame);
    } else {
      global.clearTimeout(accountSettingsAnimationFrame);
    }
    accountSettingsAnimationFrame = null;
  }

  function openAccountSettings() {
    const session = getSession();
    if (!session || !accountSettingsOverlay || !accountSettingsWindow || !accountSettingsName) return;
    const details = getAccountDetails(session);
    cancelAccountSettingsFrame();
    accountSettingsName.value = details.name;
    if (accountSettingsEmail) accountSettingsEmail.textContent = details.email;
    if (accountSettingsAvatar) {
      accountSettingsAvatar.hidden = !details.avatarUrl;
      if (details.avatarUrl) accountSettingsAvatar.src = details.avatarUrl;
      else accountSettingsAvatar.removeAttribute('src');
    }
    setAccountSettingsMessage('');
    const rect = accountButton && accountButton.getBoundingClientRect();
    const centerX = global.innerWidth / 2;
    const centerY = global.innerHeight / 2;
    const originX = rect ? rect.left + rect.width / 2 - centerX : 0;
    const originY = rect ? rect.top + rect.height / 2 - centerY : 0;
    accountSettingsOverlay.style.display = 'flex';
    accountSettingsOverlay.setAttribute('aria-hidden', 'false');
    accountSettingsWindow.style.transition = 'transform 0.1s linear';
    accountSettingsOverlay.style.transition = 'backdrop-filter 0.1s linear, -webkit-backdrop-filter 0.1s linear';
    accountSettingsWindow.style.transform = 'translate(' + originX + 'px, ' + originY + 'px) scale(0)';
    accountSettingsOverlay.style.backdropFilter = 'blur(0px)';
    accountSettingsOverlay.style.webkitBackdropFilter = 'blur(0px)';
    accountSettingsAnimationFrame = scheduleAccountSettingsFrame(function () {
      accountSettingsWindow.style.transform = 'translate(0px, 0px) scale(1)';
      accountSettingsOverlay.style.backdropFilter = 'blur(' + ACCOUNT_SETTINGS_BLUR_AMOUNT + 'px)';
      accountSettingsOverlay.style.webkitBackdropFilter = 'blur(' + ACCOUNT_SETTINGS_BLUR_AMOUNT + 'px)';
      accountSettingsAnimationFrame = null;
      if (accountSettingsName && typeof accountSettingsName.focus === 'function') accountSettingsName.focus();
    });
  }

  function closeAccountSettings() {
    if (!accountSettingsOverlay || !accountSettingsWindow || accountSettingsOverlay.style.display !== 'flex') return;
    cancelAccountSettingsFrame();
    accountSettingsWindow.style.transition = 'none';
    accountSettingsOverlay.style.transition = 'none';
    let startTime = null;

    function animateClose(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / ACCOUNT_SETTINGS_CLOSE_DURATION_MS, 1);
      const scale = 1 - progress;
      const blur = ACCOUNT_SETTINGS_BLUR_AMOUNT * (1 - progress);
      accountSettingsWindow.style.transform = 'scale(' + scale + ')';
      accountSettingsOverlay.style.backdropFilter = 'blur(' + blur + 'px)';
      accountSettingsOverlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';

      if (progress < 1) {
        accountSettingsAnimationFrame = scheduleAccountSettingsFrame(animateClose);
      } else {
        accountSettingsOverlay.style.display = 'none';
        accountSettingsOverlay.setAttribute('aria-hidden', 'true');
        accountSettingsWindow.style.transform = '';
        accountSettingsOverlay.style.backdropFilter = '';
        accountSettingsOverlay.style.webkitBackdropFilter = '';
        accountSettingsWindow.style.transition = '';
        accountSettingsOverlay.style.transition = '';
        accountSettingsAnimationFrame = null;
      }
    }

    accountSettingsAnimationFrame = scheduleAccountSettingsFrame(animateClose);
  }

  async function saveAccountProfile() {
    const stored = getSession();
    const name = String(accountSettingsName && accountSettingsName.value || '').trim();
    if (!stored || !name) {
      setAccountSettingsMessage('Enter a display name before saving.');
      return false;
    }
    if (accountSettingsSave) accountSettingsSave.disabled = true;
    setAccountSettingsMessage('');
    try {
      const session = await refreshSessionIfNeeded(stored);
      const response = await fetch(CONFIG.projectUrl + '/auth/v1/user', {
        method: 'PUT',
        headers: authHeaders(session, true),
        body: JSON.stringify({ data: { full_name: name } }),
      });
      const updated = await responseJson(response);
      const updatedUser = updated && updated.user || updated || {};
      const currentMetadata = accountProfile && accountProfile.user_metadata || {};
      accountProfile = Object.assign({}, accountProfile || {}, updatedUser, {
        email: updatedUser.email || accountProfile && accountProfile.email || getAccountDetails(session).email,
        user_metadata: Object.assign({}, currentMetadata, updatedUser.user_metadata || {}, { full_name: name }),
      });
      saveCachedAccountProfile(session, accountProfile);
      updateAccountControl();
      setAccountSettingsMessage('Saved.');
      return true;
    } catch (error) {
      setAccountSettingsMessage('Your name could not be saved. Please try again.');
      console.warn('CNReader account name could not be saved:', error);
      return false;
    } finally {
      if (accountSettingsSave) accountSettingsSave.disabled = false;
    }
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
      accountProfile = readCachedAccountProfile(stored);
      updateAccountControl();
      if (!stored) return false;
      try {
        const session = await refreshSessionIfNeeded(stored);
        const userId = getUserId(session);
        const cloudProgressPromise = loadCloudProgress(session);
        const profilePromise = loadAccountProfile(session).then(function (profile) {
          if (profile) {
            accountProfile = profile;
            saveCachedAccountProfile(session, profile);
            updateAccountControl();
          }
          return profile;
        }).catch(function (error) {
          console.warn('CNReader account profile could not be loaded:', error);
          return null;
        });
        const cloudProgress = await cloudProgressPromise;
        await profilePromise;
        if (cloudProgress) {
          if (userId && localStorage.getItem(HYDRATED_USER_KEY) !== userId) {
            restoringProgress = true;
            try {
              progressStore.restoreSnapshot(cloudProgress, false);
            } finally {
              restoringProgress = false;
            }
            localStorage.setItem(HYDRATED_USER_KEY, userId);
            updateAccountControl();
            global.location.reload();
            return true;
          }
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
    accountProfile = null;
    localStorage.removeItem(HYDRATED_USER_KEY);
    updateAccountControl();
    setAccountStatus('Signed out. Progress stays on this device until another account is used.');
  }

  function bindAccountControl() {
    accountButton = document.getElementById('accountButton');
    accountStatus = document.getElementById('accountStatus');
    accountAvatar = document.getElementById('accountAvatar');
    accountName = document.getElementById('accountName');
    accountEmail = document.getElementById('accountEmail');
    accountGuestLabel = document.getElementById('accountGuestLabel');
    accountSettingsOverlay = document.getElementById('accountSettingsOverlay');
    accountSettingsWindow = document.getElementById('accountSettingsWindow');
    accountSettingsClose = document.getElementById('accountSettingsClose');
    accountSettingsName = document.getElementById('accountSettingsName');
    accountSettingsEmail = document.getElementById('accountSettingsEmail');
    accountSettingsAvatar = document.getElementById('accountSettingsAvatar');
    accountSettingsSave = document.getElementById('accountSettingsSave');
    accountSettingsSignOut = document.getElementById('accountSettingsSignOut');
    accountSettingsMessage = document.getElementById('accountSettingsMessage');
    if (!accountButton) return;
    accountButton.addEventListener('click', function () {
      if (getSession()) openAccountSettings();
      else signInWithGoogle();
    });
    if (accountSettingsClose) accountSettingsClose.addEventListener('click', closeAccountSettings);
    if (accountSettingsOverlay) {
      accountSettingsOverlay.addEventListener('click', function (event) {
        if (event.target === accountSettingsOverlay) closeAccountSettings();
      });
    }
    if (accountSettingsSave) accountSettingsSave.addEventListener('click', saveAccountProfile);
    if (accountSettingsSignOut) {
      accountSettingsSignOut.addEventListener('click', async function () {
        closeAccountSettings();
        await signOut();
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAccountSettings();
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
    openSettings: openAccountSettings,
    closeSettings: closeAccountSettings,
    saveProfileName: saveAccountProfile,
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
