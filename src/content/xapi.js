// --- X web API + account stats ---
// Loaded before content.js. Blocks (or mutes) accounts through the endpoints x.com's own
// Block/Mute buttons use, with the user's logged-in session, so an account can be handled
// without its tweet being on screen. Also keeps the follower counts that xdata.js sees in X's
// responses.

// Localised string from _locales (shared by every content script, which all load after this one)
function i18n(key, ...substitutions) {
    return chrome.i18n.getMessage(key, substitutions.map(String)) || key;
}

const UI_LANGUAGE = chrome.i18n.getUILanguage();

// For anything inserted into x.com as HTML: list names are chosen by other users
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Public token x.com's web app sends with every API call; the user's cookies do the auth
const X_WEB_BEARER = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
const X_AUTH_ERROR_CODES = [32, 89, 215, 326, 353];
const X_UNAVAILABLE_ERROR_CODES = [17, 50, 63];
const ACCOUNT_REPORT_INTERVAL = 5000;
const ACCOUNT_REPORT_BATCH = 500;

// What a post's block button does on X: "block" (default) or "mute". A per-browser setting
// chosen in the popup; subscribed lists carry their own choice in their mode.
const X_ACTION_KEY = 'xblock_x_action';
const X_ACTION_ENDPOINTS = {
    block: 'https://x.com/i/api/1.1/blocks/create.json',
    mute: 'https://x.com/i/api/1.1/mutes/users/create.json',
};
let xAction = 'block';
const readXAction = value => (value === 'mute' ? 'mute' : 'block');
chrome.storage.sync.get(X_ACTION_KEY, result => { xAction = readXAction(result?.[X_ACTION_KEY]); });
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[X_ACTION_KEY]) xAction = readXAction(changes[X_ACTION_KEY].newValue);
});

class XApiError extends Error {
    /**
     * @param {"auth"|"rate-limited"|"unavailable"|"error"} kind
     * @param {string} message
     * @param {number} [resumeAt] - When a rate limit lifts (ms timestamp)
     */
    constructor(kind, message, resumeAt) {
        super(message);
        this.kind = kind;
        this.resumeAt = resumeAt;
    }
}

function sendToBackground(message) {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(message, response => {
                if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
                if (response?.status === 'success') resolve(response);
                else reject(new Error(response?.message || i18n('unknownError')));
            });
        } catch (error) {
            // "Extension context invalidated" after the extension is reloaded
            reject(error);
        }
    });
}

/**
 * Blocks or mutes an account on X
 * @param {"block"|"mute"} action
 * @returns {Promise<{followersCount: number|undefined, status: "blocked"|"muted"}>}
 * @throws {XApiError}
 */
async function xApiBlock(username, action = xAction) {
    const csrfToken = document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/)?.[1];
    if (!csrfToken) throw new XApiError('auth', i18n('xErrLoggedOut'));

    let response;
    try {
        response = await fetch(X_ACTION_ENDPOINTS[action], {
            method: 'POST',
            credentials: 'include',
            headers: {
                'authorization': `Bearer ${X_WEB_BEARER}`,
                'x-csrf-token': csrfToken,
                'x-twitter-auth-type': 'OAuth2Session',
                'x-twitter-active-user': 'yes',
                'content-type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ screen_name: username, skip_status: '1' }),
        });
    } catch (error) {
        throw new XApiError('error', i18n('xErrNetwork', error.message));
    }

    const data = await response.json().catch(() => ({}));
    const xError = data.errors?.[0];

    if (response.ok && !xError) {
        const relation = action === 'mute' ? { muting: true } : { blocking: true };
        noteAccount({ username, followersCount: data.followers_count, ...relation }, false);
        return { followersCount: data.followers_count, status: action === 'mute' ? 'muted' : 'blocked' };
    }
    if (response.status === 429 || xError?.code === 88) {
        const reset = Number(response.headers.get('x-rate-limit-reset'));
        throw new XApiError('rate-limited', i18n('xErrRateLimited'), reset ? reset * 1000 : Date.now() + 15 * 60 * 1000);
    }
    if (response.status === 404 || X_UNAVAILABLE_ERROR_CODES.includes(xError?.code)) {
        throw new XApiError('unavailable', xError?.message || i18n('xErrNotFound'));
    }
    if (response.status === 401 || X_AUTH_ERROR_CODES.includes(xError?.code)) {
        throw new XApiError('auth', xError?.message || i18n('xErrSession'));
    }
    throw new XApiError('error', xError?.message || i18n('xErrStatus', response.status));
}

// --- Account stats seen in X's responses (posted by xdata.js) ---

// lowercased username -> { followersCount, blocking, muting }
const xAccountStats = new Map();
const pendingAccountReports = new Map();

/**
 * Merges what we learnt about an account; known values are never overwritten by unknown ones
 * @param {boolean} report - Queue it for the server (false when the caller records it itself)
 */
function noteAccount({ username, followersCount, blocking, muting }, report = true) {
    if (typeof username !== 'string' || !username) return;
    const key = username.toLowerCase();
    const previous = xAccountStats.get(key) || {};
    const next = {
        followersCount: Number.isInteger(followersCount) ? followersCount : previous.followersCount,
        blocking: typeof blocking === 'boolean' ? blocking : previous.blocking,
        muting: typeof muting === 'boolean' ? muting : previous.muting,
    };
    if (next.followersCount === previous.followersCount && next.blocking === previous.blocking && next.muting === previous.muting) return;
    xAccountStats.set(key, next);
    if (report) pendingAccountReports.set(key, { username: key, ...next });
}

function followersCountOf(username) {
    return xAccountStats.get(username.toLowerCase())?.followersCount;
}

window.addEventListener('message', event => {
    if (event.source !== window || event.data?.source !== 'xblock-xdata' || !Array.isArray(event.data.accounts)) return;
    event.data.accounts.forEach(account => noteAccount(account));
});

setInterval(() => {
    if (pendingAccountReports.size === 0) return;
    const accounts = [...pendingAccountReports.values()].slice(0, ACCOUNT_REPORT_BATCH);
    accounts.forEach(account => pendingAccountReports.delete(account.username));
    // Best effort: anything lost is seen again the next time X sends it
    sendToBackground({ action: 'reportObservedAccounts', accounts }).catch(() => {});
}, ACCOUNT_REPORT_INTERVAL);

/**
 * Tells the server an account is now blocked or muted on X (or can't be), with its follower count
 * @param {"blocked"|"muted"|"unavailable"} status
 */
function recordBlocked(username, followersCount = followersCountOf(username), status = 'blocked') {
    return sendToBackground({ action: 'recordBlocks', blocks: [{ username, followersCount, status }] })
        .catch(error => console.error(`XBlock: could not record block of ${username}:`, error.message));
}
