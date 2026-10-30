// --- Batch blocking ---
// Works through every account on the user's subscribed lists in Block or Mute mode, most
// followers first, blocking or muting each one (per its lists) through X's API (xapi.js). It only runs in the dedicated x.com
// window the background opens, and draws a progress overlay on top of X there. The popup and
// the overlay start and pause it through chrome.storage; when everything is blocked the
// window closes itself.

const BATCH_DELAY_MS = [6000, 10000]; // random pause between two blocks, to stay under X's radar
const BATCH_PAGE_SIZE = 100;
const BATCH_MAX_CONSECUTIVE_ERRORS = 5;
const BATCH_CLOSE_DELAY = 3;          // seconds the "done" screen stays up
const BATCH_RECENT_LIMIT = 6;
const BATCH_RUNNER_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const BATCH_ACTIVE_STATES = ['running', 'rate-limited'];

let batchLoopActive = false;
let batchStatus = {};
let batchRecent = [];

const storageGet = key => new Promise(resolve => chrome.storage.local.get(key, items => resolve(items[key])));
const storageSet = items => new Promise(resolve => chrome.storage.local.set(items, resolve));

async function batchRequested() {
    return !!(await storageGet('xblockBatch'))?.running;
}

async function setBatchRequested(running) {
    await storageSet({ xblockBatch: { running } });
}

async function publishBatchStatus(update) {
    batchStatus = { ...batchStatus, ...update, runnerId: BATCH_RUNNER_ID, heartbeat: Date.now() };
    await storageSet({ xblockBatchStatus: batchStatus });
    // Heartbeat-only updates change nothing on screen
    if (Object.keys(update).length > 0) renderBatchOverlay();
}

// Waits while keeping the heartbeat fresh; false if the batch was paused in the meantime
async function batchWait(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        if (!(await batchRequested())) return false;
        await publishBatchStatus({});
        await new Promise(resolve => setTimeout(resolve, Math.min(5000, end - Date.now())));
    }
    return batchRequested();
}

async function failBatch(message) {
    await publishBatchStatus({ state: 'error', current: null, message });
    await setBatchRequested(false);
}

let batchRecentId = 0;

function rememberBatchResult(account, result) {
    batchRecent = [{ ...account, result, id: ++batchRecentId }, ...batchRecent].slice(0, BATCH_RECENT_LIMIT);
}

async function runBatch() {
    if (batchLoopActive) return;
    batchLoopActive = true;
    try {
        await publishBatchStatus({ state: 'running', message: '', current: null, resumeAt: null });

        let consecutiveErrors = 0;
        const failedThisRun = new Set();

        while (await batchRequested()) {
            let batch;
            try {
                ({ batch } = await sendToBackground({ action: 'loadBatchBlock', limit: BATCH_PAGE_SIZE }));
            } catch (error) {
                return await failBatch(i18n('batchMsgLoadFailed', error.message));
            }

            const lists = batch.lists;
            const queue = batch.queue.filter(account => !failedThisRun.has(account.username));
            await publishBatchStatus({ state: 'running', lists, remaining: batch.remaining, message: '' });

            if (queue.length === 0) {
                await publishBatchStatus({
                    state: 'done',
                    current: null,
                    message: lists.length === 0
                        ? i18n('batchMsgNoBlockLists')
                        : failedThisRun.size > 0
                            ? i18n('batchMsgDoneExcept', failedThisRun.size)
                            : i18n('batchMsgAllBlocked'),
                });
                await setBatchRequested(false);
                return closeBatchWindowSoon();
            }

            for (const account of queue) {
                if (!(await batchRequested())) break;
                await publishBatchStatus({ state: 'running', current: account, resumeAt: null });

                let handled = false;
                try {
                    const { followersCount, status } = await xApiBlock(account.username, account.action || 'block');
                    await recordBlocked(account.username, followersCount, status);
                    rememberBatchResult({ ...account, followersCount: followersCount ?? account.followersCount }, status);
                    handled = true;
                    consecutiveErrors = 0;
                } catch (error) {
                    if (error.kind === 'unavailable') {
                        await recordBlocked(account.username, undefined, 'unavailable');
                        rememberBatchResult(account, 'unavailable');
                        handled = true;
                        consecutiveErrors = 0;
                    } else if (error.kind === 'rate-limited') {
                        await publishBatchStatus({ state: 'rate-limited', current: null, resumeAt: error.resumeAt, message: error.message });
                        await batchWait(Math.max(error.resumeAt - Date.now(), 60000));
                        break; // reload the queue once the limit lifts
                    } else if (error.kind === 'auth') {
                        return await failBatch(error.message);
                    } else {
                        failedThisRun.add(account.username);
                        rememberBatchResult(account, 'failed');
                        console.warn(`XBlock: batch block of ${account.username} failed:`, error.message);
                        if (++consecutiveErrors >= BATCH_MAX_CONSECUTIVE_ERRORS) {
                            return await failBatch(i18n('batchMsgTooManyErrors', consecutiveErrors, error.message));
                        }
                    }
                }

                if (handled) {
                    lists.forEach(list => {
                        if (account.lists.includes(list.id)) list.done++;
                    });
                    await publishBatchStatus({
                        lists,
                        remaining: Math.max(0, (batchStatus.remaining ?? 1) - 1),
                        blockedCount: (batchStatus.blockedCount ?? 0) + 1,
                    });
                }

                const [minDelay, maxDelay] = BATCH_DELAY_MS;
                if (!(await batchWait(minDelay + Math.random() * (maxDelay - minDelay)))) break;
            }
        }

        if (BATCH_ACTIVE_STATES.includes(batchStatus.state)) {
            await publishBatchStatus({ state: 'paused', current: null, resumeAt: null, message: '' });
        }
    } catch (error) {
        // e.g. the extension was reloaded under this tab
        console.error('XBlock: batch blocking stopped:', error);
    } finally {
        batchLoopActive = false;
    }
}

function closeBatchWindowSoon() {
    let secondsLeft = BATCH_CLOSE_DELAY;
    batchOverlay.closingIn = secondsLeft;
    renderBatchOverlay();
    const timer = setInterval(() => {
        batchOverlay.closingIn = --secondsLeft;
        renderBatchOverlay();
        if (secondsLeft <= 0) {
            clearInterval(timer);
            sendToBackground({ action: 'closeBatchWindow' }).catch(() => {});
        }
    }, 1000);
}

// --- Overlay ---

// lastRecentId: newest "Recent" entry already on screen, so only new rows slide in
const batchOverlay = { root: null, minimized: false, closingIn: null, lastRecentId: 0 };

const BATCH_OVERLAY_CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .backdrop {
        position: fixed; inset: 0; z-index: 0;
        background: radial-gradient(ellipse at center, rgba(40, 6, 14, 0.55) 0%, rgba(4, 4, 8, 0.88) 75%);
        backdrop-filter: blur(6px);
    }
    .card {
        position: fixed; z-index: 1; left: 50%; top: 50%; transform: translate(-50%, -50%);
        width: min(480px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto;
        background: radial-gradient(circle at 0% 0%, rgba(244, 33, 46, 0.16), transparent 55%), #15181c;
        color: #e7e9ea; border: 1px solid #2f3336; border-radius: 22px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), 0 0 70px rgba(244, 33, 46, 0.14);
        font: 15px/1.4 "TwitterChirp", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        padding: 20px 22px 18px;
    }
    header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    header .logo { width: 28px; height: 28px; border-radius: 8px; box-shadow: 0 0 18px rgba(244, 33, 46, 0.55); }
    header .title { font-weight: 800; font-size: 18px; letter-spacing: -0.2px; flex: 1; }
    header .badge { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #2f3336; color: #e7e9ea; }
    header .badge.running { background: rgba(244, 33, 46, 0.15); color: #ff6b75; }
    header .badge.done { background: rgba(0, 186, 124, 0.15); color: #2fd894; }
    header .badge.error, header .badge.rate-limited { background: rgba(255, 173, 31, 0.15); color: #ffc46b; }
    .icon-btn { all: unset; cursor: pointer; color: #71767b; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; font-size: 18px; }
    .icon-btn:hover { background: #2f3336; color: #e7e9ea; }
    .big { display: flex; align-items: baseline; gap: 8px; }
    .big b { font-size: 46px; line-height: 1.05; font-weight: 800; letter-spacing: -1px; font-variant-numeric: tabular-nums; }
    .big span { color: #71767b; }
    .bar { height: 8px; border-radius: 999px; background: #2f3336; overflow: hidden; margin: 10px 0 8px; }
    .fill {
        height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        background: linear-gradient(90deg, #ff7a1a, #f4212e);
    }
    .running .fill {
        background: linear-gradient(90deg, #ff7a1a, #f4212e, #ff7a1a);
        background-size: 200% 100%; animation: flow 1.6s linear infinite;
    }
    .done .fill { background: #00ba7c; }
    @keyframes flow { to { background-position: -200% 0; } }
    .meta { display: flex; justify-content: space-between; color: #71767b; font-size: 13px; }
    .now {
        margin: 14px 0; padding: 12px 14px; border-radius: 12px; background: #1e2226;
        display: flex; align-items: center; gap: 10px; min-height: 48px;
    }
    .now .dot { width: 8px; height: 8px; border-radius: 50%; background: #f4212e; flex-shrink: 0; }
    .running .now .dot { animation: pulse 1s ease-in-out infinite; }
    .done .now .dot { background: #00ba7c; }
    .error .now .dot, .rate-limited .now .dot { background: #ffad1f; }
    .paused .now .dot { background: #71767b; }
    @keyframes pulse { 50% { transform: scale(1.8); opacity: 0.4; } }
    .now .text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .muted { color: #71767b; }
    h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #71767b; margin: 16px 0 8px; }
    .list { display: grid; grid-template-columns: 1fr 110px 72px; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 8px; }
    .list .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .list .bar { margin: 0; height: 6px; }
    .list .count { text-align: right; color: #71767b; font-variant-numeric: tabular-nums; }
    .recent { font-size: 13px; }
    .recent div { display: flex; gap: 8px; padding: 3px 0; }
    .recent div.fresh { animation: slide-in 0.35s ease-out; }
    .recent .tag { font-weight: 700; width: 16px; text-align: center; }
    .recent .result-blocked .tag { color: #f4212e; }
    .recent .result-muted .tag { color: #ff7a1a; }
    .recent .result-unavailable .tag, .recent .result-failed .tag { color: #71767b; }
    .recent .who { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .recent .kind { width: 64px; text-align: center; padding: 1px 0; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .recent .result-blocked .kind { background: rgba(244, 33, 46, 0.15); color: #ff6b75; }
    .recent .result-muted .kind { background: rgba(255, 122, 26, 0.15); color: #ffa45c; }
    @keyframes slide-in { from { opacity: 0; transform: translateY(-6px); } }
    footer { display: flex; gap: 10px; margin-top: 18px; }
    .btn { all: unset; cursor: pointer; flex: 1; text-align: center; padding: 9px 0; border-radius: 999px; font-weight: 700; font-size: 14px; }
    .btn.primary { background: #eff3f4; color: #0f1419; }
    .btn.primary:hover { background: #d7dbdc; }
    .btn.danger { background: linear-gradient(135deg, #ff2d55, #c1121f); color: #fff; box-shadow: 0 4px 18px rgba(255, 45, 85, 0.4); }
    .btn.danger:hover { filter: brightness(1.1); }
    .btn.ghost { border: 1px solid #536471; color: #eff3f4; }
    .btn.ghost:hover { background: rgba(239, 243, 244, 0.1); }
    .pill {
        all: unset; cursor: pointer; position: fixed; z-index: 1; right: 16px; bottom: 16px;
        display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px;
        background: rgba(21, 24, 28, 0.9); backdrop-filter: blur(12px);
        border: 1px solid rgba(244, 33, 46, 0.35); color: #e7e9ea;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 30px rgba(244, 33, 46, 0.15);
        font: 700 14px/1 "TwitterChirp", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .pill .logo { width: 20px; height: 20px; border-radius: 6px; }
    .pill .bar { width: 90px; margin: 0; height: 6px; }
`;

const BATCH_LOGO_URL = chrome.runtime.getURL('src/icons/get_started256.png');

function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function formatFollowers(count) {
    if (typeof count !== 'number') return '';
    return i18n('followersCount', new Intl.NumberFormat(UI_LANGUAGE, { notation: 'compact', maximumFractionDigits: 1 }).format(count));
}

function formatDuration(seconds) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 1) return i18n('durationUnderMinute');
    if (minutes < 60) return i18n('durationMinutes', minutes);
    return i18n('durationHours', Math.floor(minutes / 60), minutes % 60);
}

function mountBatchOverlay() {
    const host = document.createElement('div');
    host.id = 'xblock-batch-overlay';
    host.style.cssText = 'position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;';
    batchOverlay.root = host.attachShadow({ mode: 'open' });
    document.documentElement.appendChild(host);

    batchOverlay.root.addEventListener('click', async event => {
        const action = event.target.closest('[data-action]')?.dataset.action;
        if (action === 'pause') await setBatchRequested(false);
        if (action === 'resume') await setBatchRequested(true);
        if (action === 'minimize' || action === 'expand') {
            batchOverlay.minimized = action === 'minimize';
            renderBatchOverlay();
        }
        if (action === 'stop') {
            await setBatchRequested(false);
            sendToBackground({ action: 'closeBatchWindow' }).catch(() => {});
        }
    });

    // Countdowns (rate limit, closing) tick on their own
    setInterval(() => {
        if (batchStatus.state === 'rate-limited') renderBatchOverlay();
    }, 1000);
    renderBatchOverlay();
}

// "blocked", "muted" or "blocked or muted", depending on the modes of the lists being handled
function countLabelKey(lists) {
    const modes = new Set(lists.map(list => list.mode));
    if (!modes.has('automute')) return 'overlayBlockedThisRun';
    return modes.has('autoblock') ? 'overlayHandledThisRun' : 'overlayMutedThisRun';
}

function renderBatchOverlay() {
    const root = batchOverlay.root;
    if (!root) return;

    const state = batchStatus.state || 'running';
    const lists = batchStatus.lists || [];
    const total = lists.reduce((sum, list) => sum + list.total, 0);
    const done = lists.reduce((sum, list) => sum + list.done, 0);
    const percent = total ? Math.round((done / total) * 100) : state === 'done' ? 100 : 0;
    const remaining = batchStatus.remaining ?? 0;
    const blockedCount = batchStatus.blockedCount ?? 0;
    const [minDelay, maxDelay] = BATCH_DELAY_MS;
    const eta = remaining * ((minDelay + maxDelay) / 2 + 500) / 1000;
    const current = batchStatus.current;

    const badge = {
        running: i18n('overlayStateRunning'),
        'rate-limited': i18n('overlayStateRateLimited'),
        paused: i18n('batchPaused'),
        error: i18n('overlayStateError'),
        done: i18n('batchDone'),
    }[state] || state;
    let now;
    if (state === 'running') {
        now = current
            ? `${i18n(current.action === 'mute' ? 'overlayMutingAccount' : 'overlayBlockingAccount', `<b>@${escapeText(current.username)}</b>`)} <span class="muted">${escapeText(formatFollowers(current.followersCount))}</span>`
            : i18n('overlayLoading');
    } else if (state === 'rate-limited') {
        const seconds = Math.max(0, Math.round(((batchStatus.resumeAt || Date.now()) - Date.now()) / 1000));
        now = i18n('overlayRateLimited', `<b>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</b>`);
    } else if (state === 'done') {
        now = `${escapeText(batchStatus.message || i18n('batchDone'))}${batchOverlay.closingIn !== null ? ` <span class="muted">· ${i18n('overlayClosingIn', batchOverlay.closingIn)}</span>` : ''}`;
    } else if (state === 'error') {
        now = `${escapeText(batchStatus.message)}. <span class="muted">${escapeText(i18n('overlayFixAndResume'))}</span>`;
    } else {
        now = escapeText(batchStatus.message || i18n('batchPaused'));
    }

    if (batchOverlay.minimized) {
        root.innerHTML = `<style>${BATCH_OVERLAY_CSS}</style>
            <button class="pill ${state}" data-action="expand" style="pointer-events: auto;" title="${escapeText(i18n('overlayExpand'))}">
                <img class="logo" src="${BATCH_LOGO_URL}" alt="">
                <span>XBlock · ${escapeText(badge)}</span>
                <div class="bar"><div class="fill" style="width: ${percent}%"></div></div>
                <span>${percent}%</span>
            </button>`;
        return;
    }

    const isActive = BATCH_ACTIVE_STATES.includes(state);
    root.innerHTML = `<style>${BATCH_OVERLAY_CSS}</style>
        <div class="backdrop" style="pointer-events: auto;"></div>
        <div class="card ${state}" style="pointer-events: auto;">
            <header>
                <img class="logo" src="${BATCH_LOGO_URL}" alt="">
                <span class="title">${escapeText(i18n('overlayTitle'))}</span>
                <span class="badge ${state}">${escapeText(badge)}</span>
                <button class="icon-btn" data-action="minimize" title="${escapeText(i18n('overlayMinimize'))}">–</button>
            </header>
            <div class="big"><b>${blockedCount}</b><span>${escapeText(i18n(countLabelKey(lists)))}</span></div>
            <div class="bar"><div class="fill" style="width: ${percent}%"></div></div>
            <div class="meta">
                <span>${escapeText(i18n('overlayPercentOfLists', percent))}</span>
                <span>${remaining > 0 ? escapeText(i18n('overlayLeft', remaining, formatDuration(eta))) : ''}</span>
            </div>
            <div class="now"><span class="dot"></span><span class="text">${now}</span></div>
            ${lists.length ? `<h3>${escapeText(i18n('overlayLists'))}</h3>${lists.map(list => `
                <div class="list">
                    <span class="name">${escapeText(list.name)}</span>
                    <div class="bar"><div class="fill" style="width: ${list.total ? Math.round((list.done / list.total) * 100) : 100}%"></div></div>
                    <span class="count">${list.done}/${list.total}</span>
                </div>`).join('')}` : ''}
            ${batchRecent.length ? `<h3>${escapeText(i18n('overlayRecent'))}</h3><div class="recent">${batchRecent.map(entry => `
                <div class="result-${entry.result}${entry.id > batchOverlay.lastRecentId ? ' fresh' : ''}">
                    <span class="tag">${entry.result === 'blocked' ? '⦸' : entry.result === 'muted' ? '🔇' : '–'}</span>
                    <span class="who">@${escapeText(entry.username)}</span>
                    ${['blocked', 'muted'].includes(entry.result)
                        ? `<span class="muted">${escapeText(formatFollowers(entry.followersCount))}</span><span class="kind">${escapeText(i18n(entry.result === 'muted' ? 'statusMuted' : 'statusBlocked'))}</span>`
                        : `<span class="muted">${escapeText(i18n(entry.result === 'unavailable' ? 'overlayNotFound' : 'overlayFailed'))}</span>`}
                </div>`).join('')}</div>` : ''}
            <footer>
                ${state === 'done'
                    ? `<button class="btn primary" data-action="stop">${escapeText(i18n('overlayCloseNow'))}</button>`
                    : `<button class="btn primary" data-action="${isActive ? 'pause' : 'resume'}">${escapeText(i18n(isActive ? 'batchPause' : 'batchResume'))}</button>
                       <button class="btn danger" data-action="stop">${escapeText(i18n('overlayStopAndClose'))}</button>`}
            </footer>
        </div>`;
    batchOverlay.lastRecentId = batchRecent[0]?.id ?? batchOverlay.lastRecentId;
}

// --- Start-up: only the batch window runs the batch ---

(async () => {
    let isBatchTab = false;
    try {
        ({ isBatchTab } = await sendToBackground({ action: 'isBatchTab' }));
    } catch (error) {
        return;
    }
    if (!isBatchTab) return;

    batchStatus = (await storageGet('xblockBatchStatus')) || {};
    mountBatchOverlay();

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local' || !changes.xblockBatch) return;
        if (changes.xblockBatch.newValue?.running) runBatch();
        else renderBatchOverlay();
    });

    if (await batchRequested()) runBatch();
})();
