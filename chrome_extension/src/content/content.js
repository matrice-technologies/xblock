
// // Add HTML block to the body in the middle of the page
// const middleContainer = document.createElement('div');
// middleContainer.style.position = 'absolute';
// middleContainer.style.top = '50%';
// middleContainer.style.left = '50%';
// middleContainer.style.transform = 'translate(-50%, -50%)';
// middleContainer.style.zIndex = '1000';


// middleContainer.innerHTML = `
//     <div id="zerzerre" style="height: 400px; width: 400px">
//         <button class="colorful-button">Button</button>
//     </div>
// `;

// document.body.appendChild(middleContainer);







// --- Block explosion FX ---
// A full-page canvas overlay running a small particle simulation, only while something
// is on screen: flash, shockwave, shards of the tweet, sparks, embers and smoke.

const FX_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let fxCanvas, fxCtx;
let fxDpr = 1;
let fxItems = [];
let fxFrame = null;
let fxLastTime = 0;
let fxFreezeUntil = 0;

function createParticleCanvas() {
    fxCanvas = document.createElement('canvas');
    fxCanvas.id = 'particleCanvas';
    Object.assign(fxCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '1001',
        pointerEvents: 'none', // keep the page clickable underneath
    });
    fxCtx = fxCanvas.getContext('2d');
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);
    document.body.appendChild(fxCanvas);
}

// Render at device resolution so the debris stays crisp on high-DPI screens
function resizeParticleCanvas() {
    fxDpr = window.devicePixelRatio || 1;
    fxCanvas.width = Math.round(window.innerWidth * fxDpr);
    fxCanvas.height = Math.round(window.innerHeight * fxDpr);
}

createParticleCanvas();

const rand = (min, max) => min + Math.random() * (max - min);
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

// White-hot -> yellow -> orange -> deep red, as debris cools down
const HEAT_RAMP = [[255, 255, 255], [255, 214, 90], [255, 120, 30], [170, 30, 10]];

function heatColor(t, alpha) {
    const scaled = Math.min(Math.max(t, 0), 1) * (HEAT_RAMP.length - 1);
    const i = Math.min(Math.floor(scaled), HEAT_RAMP.length - 2);
    const f = scaled - i;
    const [from, to] = [HEAT_RAMP[i], HEAT_RAMP[i + 1]];
    const channel = k => Math.round(from[k] + (to[k] - from[k]) * f);
    return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${Math.max(alpha, 0)})`;
}

function pageTheme() {
    const values = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
    const [r, g, b] = values ? values.map(Number) : [0, 0, 0];
    const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 128;
    // Shards are the page colour nudged towards the contrast colour, so they read as the card
    const mix = c => Math.round(isLight ? c * 0.9 : c + (255 - c) * 0.1);
    return {
        isLight,
        shardFill: `${mix(r)}, ${mix(g)}, ${mix(b)}`,
        smoke: isLight ? '90, 90, 90' : '150, 150, 150',
        // Additive glow looks great on dark themes but vanishes on white
        blend: isLight ? 'source-over' : 'lighter',
        // White-hot is invisible on a white page, so start the heat ramp at orange there
        heat: isLight ? 0.45 : 0,
    };
}

function stepFx(item, dt) {
    item.age += dt;
    if (item.vx !== undefined) {
        const drag = Math.exp(-item.drag * dt);
        item.vx *= drag;
        item.vy = item.vy * drag + item.gravity * dt;
        item.x += item.vx * dt;
        item.y += item.vy * dt;
    }
    if (item.vr) item.rot += item.vr * dt;
    if (item.wobble) item.x += Math.sin(item.age * 6 + item.phase) * item.wobble * dt;
    return item.age < item.life;
}

function drawFx(ctx, item) {
    const t = Math.min(item.age / item.life, 1);
    ctx.globalCompositeOperation = item.blend || 'source-over';

    switch (item.kind) {
        case 'smoke': {
            const radius = item.size * (1 + 1.6 * easeOutCubic(t));
            const alpha = 0.18 * (1 - t) * Math.min(1, t * 6);
            const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, radius);
            gradient.addColorStop(0, `rgba(${item.color}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${item.color}, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'shard': {
            const fade = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
            const shrink = 1 - 0.3 * t;
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rot);
            ctx.scale(shrink, shrink);
            ctx.beginPath();
            item.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
            ctx.closePath();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = `rgba(${item.color}, ${fade})`;
            ctx.fill();
            // Edges start molten and cool faster than the shard fades
            ctx.globalCompositeOperation = item.blend;
            ctx.strokeStyle = heatColor(Math.max(0.15, item.heat) + t * 1.2, fade * (1 - t * 0.6));
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
            break;
        }
        case 'spark': {
            // Streak along the velocity so fast sparks read as motion, not dots
            ctx.strokeStyle = heatColor(item.heat + t * (1 - item.heat), 1 - t * t);
            ctx.lineWidth = item.size * (1 - t * 0.6);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(item.x - item.vx * 0.025, item.y - item.vy * 0.025);
            ctx.lineTo(item.x, item.y);
            ctx.stroke();
            break;
        }
        case 'ember': {
            const flicker = 0.6 + 0.4 * Math.sin(item.age * 30 + item.phase);
            ctx.fillStyle = heatColor(0.35 + t * 0.6, (1 - t) * flicker);
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'ring': {
            const radius = item.size * easeOutCubic(t);
            ctx.strokeStyle = heatColor(Math.max(0.25, item.heat) + t * 0.5, 0.9 * Math.pow(1 - t, 2));
            ctx.lineWidth = 2 + 12 * (1 - t);
            ctx.beginPath();
            ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * Math.pow(1 - t, 3)})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(item.x, item.y, radius * 0.82, 0, Math.PI * 2);
            ctx.stroke();
            break;
        }
        case 'bloom': {
            const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.size);
            gradient.addColorStop(0, `rgba(255, 220, 160, ${0.75 * (1 - t)})`);
            gradient.addColorStop(0.4, `rgba(255, 140, 50, ${0.35 * (1 - t)})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
            ctx.fill();
            break;
        }
        case 'flash': {
            ctx.fillStyle = `rgba(255, 244, 225, ${0.9 * Math.pow(1 - t, 2)})`;
            ctx.fillRect(item.x, item.y, item.width, item.height);
            break;
        }
    }
}

function runFx(time) {
    const dt = Math.min((time - fxLastTime) / 1000, 1 / 30);
    fxLastTime = time;
    // Hit-stop: hold the first frame of the blast for a beat before it flies apart
    const frozen = time < fxFreezeUntil;

    fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (!frozen) fxItems = fxItems.filter(item => stepFx(item, dt));
    fxItems.forEach(item => drawFx(fxCtx, item));
    fxCtx.globalCompositeOperation = 'source-over';

    fxFrame = fxItems.length > 0 ? requestAnimationFrame(runFx) : null;
}

function startFx() {
    if (fxFrame) return;
    fxLastTime = performance.now();
    fxFrame = requestAnimationFrame(runFx);
}

function spawnShards(rect, originX, originY, theme) {
    const cols = Math.max(3, Math.min(8, Math.round(rect.width / 85)));
    const rows = Math.max(2, Math.min(9, Math.round(rect.height / 85)));
    const cellWidth = rect.width / cols;
    const cellHeight = rect.height / rows;
    const reach = Math.hypot(rect.width, rect.height);

    // Jittered lattice; points on the border stay put so the shards tile the tweet exactly
    const lattice = [];
    for (let row = 0; row <= rows; row++) {
        lattice.push([]);
        for (let col = 0; col <= cols; col++) {
            const jitterX = col > 0 && col < cols ? rand(-0.35, 0.35) * cellWidth : 0;
            const jitterY = row > 0 && row < rows ? rand(-0.35, 0.35) * cellHeight : 0;
            lattice[row].push([rect.left + col * cellWidth + jitterX, rect.top + row * cellHeight + jitterY]);
        }
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const a = lattice[row][col];
            const b = lattice[row][col + 1];
            const c = lattice[row + 1][col + 1];
            const d = lattice[row + 1][col];
            const triangles = Math.random() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];

            triangles.forEach(triangle => {
                const x = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3;
                const y = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3;
                const dx = x - originX;
                const dy = y - originY;
                const distance = Math.hypot(dx, dy) || 1;
                // Pieces closest to the blast fly fastest
                const speed = rand(250, 650) * (1 - Math.min(distance / reach, 1) * 0.5);

                fxItems.push({
                    kind: 'shard',
                    points: triangle.map(([px, py]) => [px - x, py - y]),
                    x,
                    y,
                    vx: (dx / distance) * speed + rand(-60, 60),
                    vy: (dy / distance) * speed + rand(-60, 60) - rand(150, 350),
                    rot: 0,
                    vr: rand(-8, 8),
                    drag: 0.4,
                    gravity: 1500,
                    age: 0,
                    life: rand(0.9, 1.5),
                    color: theme.shardFill,
                    blend: theme.blend,
                    heat: theme.heat,
                });
            });
        }
    }
}

function explodeTweet(tweet, pressX, pressY) {
    const rect = tweet.getBoundingClientRect();
    const theme = pageTheme();
    const amount = FX_REDUCED_MOTION ? 0.4 : 1;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Blow outwards from between the tweet's centre and where it was pressed
    const originX = centerX + ((pressX ?? centerX) - centerX) * 0.35;
    const originY = centerY + ((pressY ?? centerY) - centerY) * 0.35;
    const pointInTweet = () => [rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height];

    // Pushed back-to-front: smoke behind, flash on top
    for (let i = 0; i < 10 * amount; i++) {
        const [x, y] = pointInTweet();
        fxItems.push({
            kind: 'smoke', x, y, vx: rand(-30, 30), vy: rand(-60, -20), drag: 1, gravity: 0,
            size: rand(25, 55), age: 0, life: rand(0.9, 1.6), color: theme.smoke,
        });
    }

    spawnShards(rect, originX, originY, theme);

    const sparkCount = Math.min(Math.max((rect.width * rect.height) / 1500, 80), 220) * amount;
    for (let i = 0; i < sparkCount; i++) {
        // Most sparks burst from the blast point, the rest from all over the card
        const [x, y] = Math.random() < 0.6 ? [originX, originY] : pointInTweet();
        const angle = rand(0, Math.PI * 2);
        const speed = rand(300, 1300);
        fxItems.push({
            kind: 'spark', x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 200,
            drag: 2.2, gravity: 900, size: rand(1.2, 2.8), age: 0, life: rand(0.4, 1), blend: theme.blend, heat: theme.heat,
        });
    }

    for (let i = 0; i < 40 * amount; i++) {
        const [x, y] = pointInTweet();
        fxItems.push({
            kind: 'ember', x, y, vx: rand(-80, 80), vy: rand(-160, -40), drag: 0.8, gravity: -30,
            wobble: rand(10, 40), phase: rand(0, Math.PI * 2), size: rand(1, 2.4),
            age: 0, life: rand(1.2, 2.4), blend: theme.blend,
        });
    }

    fxItems.push({
        kind: 'ring', x: originX, y: originY, size: Math.hypot(rect.width, rect.height) * 0.6,
        age: 0, life: 0.5, blend: theme.blend, heat: theme.heat,
    });
    fxItems.push({
        kind: 'bloom', x: originX, y: originY, size: Math.max(rect.width, rect.height) * 0.6,
        age: 0, life: 0.35, blend: theme.blend,
    });
    fxItems.push({
        kind: 'flash', x: rect.left, y: rect.top, width: rect.width, height: rect.height, age: 0, life: 0.22,
    });

    fxFreezeUntil = performance.now() + 55;
    startFx();

    if (!FX_REDUCED_MOTION) {
        shakeElement(document.querySelector('[data-testid="primaryColumn"]') || document.querySelector('main'), 8, 380);
    }
}

// A short decaying jolt, so the blast feels like it hit the page
function shakeElement(el, amplitude, duration) {
    if (!el) return;
    const start = performance.now();
    function frame(now) {
        const t = (now - start) / duration;
        if (t >= 1) {
            el.style.transform = '';
            return;
        }
        const strength = amplitude * Math.pow(1 - t, 2);
        el.style.transform = `translate(${rand(-1, 1) * strength}px, ${rand(-1, 1) * strength}px)`;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// Close the gap the tweet leaves, so the timeline slides up under the debris.
// hideProblematicTweets() skips exploded tweets so it doesn't reset these styles.
function collapseTweet(tweet) {
    tweet.dataset.xblockExploded = 'true';
    tweet.style.visibility = 'hidden';
    tweet.style.pointerEvents = 'none';
    tweet.style.overflow = 'hidden';
    tweet.style.minHeight = '0';
    tweet.style.height = `${tweet.offsetHeight}px`;
    tweet.offsetHeight; // commit the starting height before transitioning
    tweet.style.transition = 'height 420ms cubic-bezier(0.65, 0, 0.35, 1) 120ms';
    tweet.style.height = '0px';
}


















let longPressTimers = new WeakMap();
let shakeAnim

let user = null //localStorage.getItem('x_block_blocked_users') ? JSON.parse(localStorage.getItem('x_block_user')) : { hidingMethod: "X_BLOCK" }; ;
let blockedUsers = [] //localStorage.getItem('x_block_blocked_users') ? JSON.parse(localStorage.getItem('x_block_blocked_users')) : [];
let whiteListedUsers = [] //localStorage.getItem('x_block_white_listed_users') ? JSON.parse(localStorage.getItem('x_block_white_listed_users')) : [];
let banlistId = null//localStorage.getItem('x_block_list_id') ? localStorage.getItem('x_block_list_id') : null;
let banlists = []//localStorage.getItem('x_block_list_id') ? localStorage.getItem('x_block_list_id') : null;
let autoBlockOnX = true;
let pendingBlockList = []; // Flag to track if a block action is pending
let pendingWhiteList = []; // Flag to track if a whitelist action is pending
let xManipulationStates = {}

let blockQueue = []; // Queue to store tweets
let alreadyBlocked = []; // Queue to store tweets
let isProcessing = false; // Flag to track processing state

// Observer to handle infinite scrolling on Twitter
const observer = new MutationObserver(() => hideProblematicTweets());
observer.observe(document.body, { childList: true, subtree: true });

function loadInitialData(retryCount = 0) {
    chrome.runtime.sendMessage({ action: "loadInitialData" }, (response) => {
        if (response && response.status === "success") {
            console.log("Initial data loaded:", response.data);
            user = response.data.user;
            banlistId = response.data.banlists[0].id;

            // get the user banListIn, in banlists where the user is the owner
            let userBanlist = response.data.banlists.find(banlist => banlist.ownerId === user.id);
            banlistId = userBanlist ? userBanlist.id : null;
            banlists = response.data.banlists;

            if(blockedUsers.length !== 0) {
                blockUsers(blockedUsers);   
            }

            if (whiteListedUsers.length !== 0) {
                unblockUsers(whiteListedUsers);
            }

            blockedUsers = [...new Set([...blockedUsers, ...response.data.banlists.map(banlist => banlist.bannedUsers).flat()])];
            whiteListedUsers = [...new Set([...whiteListedUsers, ...response.data.user.whiteListedUsers])];

            localStorage.setItem('x_block_user', JSON.stringify(user));
            localStorage.setItem('x_block_blocked_users', JSON.stringify(blockedUsers));
            localStorage.setItem('x_block_white_listed_users', JSON.stringify(whiteListedUsers));
            localStorage.setItem('x_block_list_id', banlistId);

            hideProblematicTweets();
        } else {
            console.error("Error loading initial data:", response?.message || 'Unknown error');
            if (retryCount < 5) {
                const delay = Math.pow(2, retryCount) * 1000; // e.g., 1s, 2s, 4s, 8s, 16s
                setTimeout(() => loadInitialData(retryCount + 1), delay);
            } else {
                console.error("Max retry attempts reached. Failed to load initial data.");
            }
        }
    });
}

// Start the process
loadInitialData();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "userOptionUpdate") {
        let data = message.data;
        user = {...user, ...data};
        hideProblematicTweets();
    }
});




function toggleBlockUser(tweet, username) {
    if (blockedUsers.includes(username)) {
        unblockUsers([username]);
    } else {
        blockUsers([username]);
        if (autoBlockOnX) {
            blockUserOnX(tweet)
        }
    }
    hideProblematicTweets();
}


function unblockUserFromTweet(tweet, username) {
    unblockUsers([username]);
    hideProblematicTweets();
}



function blockUserFromTweet(tweet, username) {
    blockUsers([username]);
    if (autoBlockOnX) {
        blockUserOnX(tweet)
    }
    hideProblematicTweets();
}


function unblockUsers(usernames) {
    blockedUsers = blockedUsers.filter(user => !usernames.includes(user));
    whiteListedUsers.push(...usernames);
    if(user)
        serverHandleRemoveUsersFromBanList(usernames);
}

function blockUsers(usernames) {
    console.log(user)
    blockedUsers.push(...usernames); // Spreading so we don't get nested arrays
    whiteListedUsers = whiteListedUsers.filter(user => !usernames.includes(user));
    if(user)
        serverHandleAddUsersToBanList(usernames)
}


// Subscription modes, weakest to strongest: when lists disagree about an account, the strongest wins
const MODE_STRENGTH = { blur: 1, hide: 2, automute: 3, autoblock: 4 };

// Queues an account to block or mute on X (once per page)
function addToQueue(username, action) {
    if (blockQueue.some(item => item.username === username) || alreadyBlocked.includes(username)) {
        alreadyBlocked.push(username);
        return;
    }

    blockQueue.push({ username, action });
}

// Function to process the queue one by one using async/await
async function processQueue() {
    if (blockQueue.length === 0) {
    } else {
        const { username, action } = blockQueue.shift();
        await blockUserOnX(username, action);
        // remove all occurences of that username from the queue
        blockQueue = blockQueue.filter(item => item.username !== username);
    }

    // Process next tweet after a delay
    setTimeout(() => {
        processQueue();
    }, 100); // Adjust delay as needed
}
processQueue();


// Blocks (or mutes, per the user's setting) through X's API (no menus popping up, works
// off-screen) and saves the follower count; a failed block falls back to the tweet's menu
async function blockUserOnX(username, action = xAction) {
    try {
        const { followersCount, status } = await xApiBlock(username, action);
        recordBlocked(username, followersCount, status);
        return;
    } catch (error) {
        if (error.kind === 'unavailable') {
            recordBlocked(username, undefined, 'unavailable');
            return;
        }
        if (action === 'mute') {
            console.warn(`XBlock: could not mute ${username}:`, error.message);
            return;
        }
        console.warn(`XBlock: API block of ${username} failed (${error.message}), using the tweet menu instead`);
    }
    await blockUserOnXViaMenu(username);
}

async function blockUserOnXViaMenu(username) {
    let foundTweet = Array.from(document.querySelectorAll('article')).find(tweet =>
        tweet.querySelector(`a[href*="/${username}"]`)
    );

    if (!foundTweet) {
        console.log("User not found:", username);
        return;
    }

    try {
        let dropdownButton = await waitForElementWithObserver('button[data-testid="caret"]', foundTweet);
        dropdownButton.click();

        let blockButton = await waitForElementWithObserver('div[data-testid="block"]');
        blockButton.click();

        // wait for 1 second
        

        let confirmButton = await waitForElementWithObserver('button[data-testid="confirmationSheetConfirm"]');
        confirmButton.click();
        recordBlocked(username);

        let adDivModal = await waitForElementWithObserver('div[data-testid="sheetDialog"]');
        if(adDivModal) {
            // inside the adDivModal, find the button with a[href="/i/premium_sign_up"]
            let subButton = adDivModal.querySelector('a[href="/i/premium_sign_up"]');
            let adDivCloseButton = subButton?.nextElementSibling;
            // get the button next to adFDivCloseButton
            adDivCloseButton.click();
        }


        // foundTweet.closest('div').remove();

    } catch (error) {
        console.error("Error blocking user:", error);
    }
}

function waitForElementWithObserver(selector, parent = document, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = parent.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver((mutations, obs) => {
            const foundElement = parent.querySelector(selector);
            if (foundElement) {
                obs.disconnect();
                resolve(foundElement);
            }
        });

        observer.observe(parent, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(`Timeout waiting for element: ${selector}`);
        }, timeout);
    });
}



function hideProblematicTweets() {
    document.querySelectorAll('article').forEach(tweet => {
        if (tweet.dataset.xblockExploded === 'true') return;
        let usernameElement = tweet.querySelector('a[href*="/"]:not([dir])');
        if (usernameElement) {
            let username = usernameElement.getAttribute('href').substring(1);
            let isBlocked = blockedUsers.includes(username) && !whiteListedUsers.includes(username);

            // get the blocklist containing the user
            let blockListsContainingUser = banlists.filter(banlist => banlist.bannedUsers.includes(username));

         
            let tweetContainer = tweet.closest('div');
            if (!tweetContainer) return;

            let isAllowedTweet = tweet.getAttribute('data-allowed-tweet') === 'true';

            // reset to default styles before applying new styles
            tweet.style.filter = 'none';
            tweet.style.pointerEvents = 'auto';
            tweet.style.userSelect = 'auto';
            tweet.style.display = 'block';
            tweet.style.border = '0px solid rgba(255, 0, 0, 0.3)';
            tweet.style.height = 'auto';
            tweet.style.overflow = '';

            let blockIndicator = tweetContainer.querySelector('.blocked-user-icon-indicator');
            if (blockedUsers.includes(username)) {
                if (!blockIndicator) {
                    // get array of blockListsContainingUser names
                    let blockListsContainingUserNames = blockListsContainingUser.map(banlist => {
                        return banlist.name;
                    });
                    tweetContainer.insertAdjacentHTML('afterBegin', `
                        <button class="allow-tweet-button blocked-user-icon-indicator disable-hover-icon" title="${escapeHtml(i18n('tweetBlockedBy', username, blockListsContainingUserNames.join(', ')))}">
                            <span class="icon default-icon">
                                <!-- Default icon -->
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px;">
                                <g><path d="M14.8086 19.7053L19.127 16.3467M4 21C4 17.134 7.13401 14 11 14M20 18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18C14 16.3431 15.3431 15 17 15C18.6569 15 20 16.3431 20 18ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>
                                </svg>
                            </span>
                            <span class="icon hover-icon">
                                <!-- Hover icon -->
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g><path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
                                    <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g>
                                </svg>
                            </span>
                        </button>
                    `);
                    blockIndicator = tweetContainer.querySelector('.blocked-user-icon-indicator');
                }
            }

            if (isBlocked && !isAllowedTweet) {

                // find the banlist 
                let banlistsWithUser = banlists.filter(banlist => {
                    return banlist.bannedUsers.includes(username);
                });

                // The strongest mode among the lists with this account wins. The user's own list
                // follows the post button's Block / Mute setting.
                const modes = banlistsWithUser.map(banlist => user.subscriptions.find(sub => sub.blockListId === banlist.id)?.mode);
                let userBanlist = banlists.find(banlist => banlist.ownerId === user.id);
                if (userBanlist.bannedUsers.includes(username)) {
                    modes.push(xAction === 'mute' ? 'automute' : 'autoblock');
                }
                let blockMode = modes.reduce((strongest, mode) =>
                    (MODE_STRENGTH[mode] || 0) > MODE_STRENGTH[strongest] ? mode : strongest, 'blur');

                tweetContainer.style.position = 'relative';
                if (blockMode == "blur") {
                    blockIndicator.classList.remove('disable-hover-icon');
                    tweet.style.filter = 'blur(5px) brightness(60%)';
                    tweet.style.pointerEvents = 'none';
                    tweet.style.userSelect = 'none';
                
                    let existingButtons = tweetContainer.querySelector('.block-action-buttons');
                    if (!existingButtons) {

                        // get array of blockListsContainingUser names
                        let blockListsContainingUserNames = blockListsContainingUser.map(banlist => {
                            return banlist.name;
                        });
                        // Inject inline HTML
                        tweetContainer.insertAdjacentHTML('beforeend', `
                            <div class="block-action-buttons">
                                <div class="block-message">
                                    <span class="badge-red">${escapeHtml(username)}</span> ${escapeHtml(i18n('tweetIsBlockedIn'))}
                                    ${blockListsContainingUserNames.map(name => `<span class="badge-grey">${escapeHtml(name)}</span>`).join(', ')}
                                </div>
                            </div>
                        `);
                        blockIndicator.addEventListener('click', (event) => {
                            event.stopPropagation();
                            tweet.style.height = 'auto';
                            tweet.setAttribute('data-allowed-tweet', 'true');
                            blockIndicator.classList.add('locked');
                            hideProblematicTweets();
                        });
                        
                    }
                } else if (blockMode == "hide") {
                    // remove class  disable-hover-icon from blockIndicator
                    blockIndicator.classList.remove('disable-hover-icon');
                    tweet.style.height = '4px';
                    tweet.style.overflow = 'hidden'; // or the post spills over the next one
                    tweet.style.pointerEvents = 'none';
                    tweet.style.userSelect = 'none';
                    tweet.style.border = '3px solid rgba(255, 0, 0, 0.3)';
                    blockIndicator.addEventListener('click', (event) => {
                        event.stopPropagation();
                        tweet.style.height = 'auto';
                        tweet.setAttribute('data-allowed-tweet', 'true');
                        blockIndicator.classList.add('locked');
                        hideProblematicTweets();
                    });
                } else if (blockMode == "autoblock" || blockMode == "automute") {
                    tweet.style.display = 'none';
                    addToQueue(username, blockMode == "automute" ? 'mute' : 'block');
                }
               
            } else if (!isBlocked || isAllowedTweet) {
                let existingButtons = tweetContainer.querySelector('.block-action-buttons');
                if (existingButtons) existingButtons.remove();
            }

            addBlockButton(tweet, username, isBlocked);
        }
    });
}


// Function to add the block/unblock button
function addBlockButton(tweet, username, isBlocked) {
    let tweetContainer = tweet.closest('div'); // Get the parent container
    if (!tweetContainer) return;

    // inside the tweet container, find the caret data id
    let caretButton = tweetContainer.querySelector('button[data-testid="caret"]');

    if (!caretButton) {
        return;
    }

    // take the 5th parent of the caret button
    let tweetActions = caretButton?.closest('div')?.parentElement?.parentElement?.parentElement;

   

    // let debugDiv = tweetContainer.querySelector('.debug-div');
    // if (!debugDiv) {
    //      // prepend a 30px div square for debug 
    //     let debugDiv = document.createElement('div');
    //     debugDiv.style.width = '30px';
    //     debugDiv.style.height = '30px';
    //     debugDiv.style.backgroundColor = 'red';
    //     debugDiv.classList.add('debug-div');
        
    //     tweetActions.prepend(debugDiv);
    // }



    let existingButton = tweetContainer.querySelector('.block-user-icon');
    let blockButton = tweetContainer.querySelector('.block-user-icon');
    let whitelistButton = tweetContainer.querySelector('.whitelist-user-icon');
    
    if (!existingButton) {
        tweetActions.insertAdjacentHTML('afterbegin', `
            <button class="block-user-icon" title="${escapeHtml(i18n('tweetBlockButton'))}">
                <svg  xmlns="http://www.w3.org/2000/svg" title="Block User" width="20px" height="20px" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    <g id="SVGRepo_iconCarrier"> <path d="M14.8086 19.7053L19.127 16.3467M4 21C4 17.134 7.13401 14 11 14M20 18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18C14 16.3431 15.3431 15 17 15C18.6569 15 20 16.3431 20 18ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>
                </svg>
            </button>
        `);

        tweetActions.insertAdjacentHTML('afterbegin', `
            <button class="whitelist-user-icon" title="${escapeHtml(i18n('tweetWhitelistButton'))}">
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 21C4 17.4735 6.60771 14.5561 10 14.0709M19.8726 15.2038C19.8044 15.2079 19.7357 15.21 19.6667 15.21C18.6422 15.21 17.7077 14.7524 17 14C16.2923 14.7524 15.3578 15.2099 14.3333 15.2099C14.2643 15.2099 14.1956 15.2078 14.1274 15.2037C14.0442 15.5853 14 15.9855 14 16.3979C14 18.6121 15.2748 20.4725 17 21C18.7252 20.4725 20 18.6121 20 16.3979C20 15.9855 19.9558 15.5853 19.8726 15.2038ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
           </button>
        `);
        blockButton = tweetContainer.querySelector('.block-user-icon');
        whitelistButton = tweetContainer.querySelector('.whitelist-user-icon');
        
        blockButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if(!user.enableAnimation) {
                return false;
            }
            if (blockAnimationStyle === 'samurai') {
                startSamuraiBlock(tweet, username, () => blockFromTweet(username));
                return;
            }
            const pressX = e.clientX;
            const pressY = e.clientY;

            // add <canvas class="border-loader"></canvas> to the tweet 
            let canvas = document.createElement('canvas');

            // add this to canvas: data-dis-type='simultaneous' data-dis-particle-type='ExplodingParticle' data-dis-reduction-factor='111'
            canvas.setAttribute('data-dis-type', 'simultaneous');
            canvas.setAttribute('data-dis-particle-type', 'ExplodingParticle');
            canvas.setAttribute('data-dis-reduction-factor', '111');

            canvas.classList.add('border-loader');
            // append to tweet element 
            tweet.appendChild(canvas);
            //triger event to disintegrate
            document.dispatchEvent(new Event('testEvent'));


            const card = tweet;
            const ctx = canvas.getContext('2d');
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;



            const duration = 1000;


            // start the smooth JS shake
            shakeAnim = startOrganicShake(card, {
                duration: duration,
                maxScale: 1.02,
                maxRotation: 1,
                frequency : 1000,
                maxTranslate: 2
            });
            

            let progress = 0;
            const startTime = performance.now();

            
            const cracks = [];


            function startOrganicShake(el, options = {}) {
                let {
                    duration = 1000,
                    maxScale = 1.04,
                    maxRotation = 4,
                    maxTranslate = 1.1,
                    frequency = 30
                } = options;
            
                const startTime = performance.now();
                let lastUpdate = 0;
                const interval = 1000 / frequency;
            
                let frameId;
                let cancelled = false;
            
                function easeInCubic(t) {
                    return t * t * t;
                }
            
                function animate(time) {
                    if (cancelled) {
                        el.style.transform = '';
                        return;
                    }
            
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = easeInCubic(progress);
            
                    if (time - lastUpdate >= interval) {
                        const scale = 1 + (maxScale - 1) * eased;
                        const rotation = maxRotation * eased * Math.sin(time * 0.03);
                        const tx = (Math.random() - 0.5) * maxTranslate * 2 * progress;
                        const ty = (Math.random() - 0.5) * maxTranslate * 2 * progress;
            
                        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(${scale})`;
                        lastUpdate = time;
                    }
            
                    if (progress < 1) {
                        frameId = requestAnimationFrame(animate);
                    } else {
                        el.style.transform = '';
                    }
                }
            
                frameId = requestAnimationFrame(animate);
            
                return {
                    cancel: () => {
                        cancelled = true;
                        cancelAnimationFrame(frameId);
                        el.style.transform = '';
                    }
                };
            }



            function generateCracks(count = 5) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
            
                for (let i = 0; i < count; i++) {
                    // Choose a side randomly: 0 = top, 1 = right, 2 = bottom, 3 = left
                    const side = Math.floor(Math.random() * 4);
                    let x, y;
            
                    switch (side) {
                        case 0: // top
                            x = Math.random() * canvas.width;
                            y = 0;
                            break;
                        case 1: // right
                            x = canvas.width;
                            y = Math.random() * canvas.height;
                            break;
                        case 2: // bottom
                            x = Math.random() * canvas.width;
                            y = canvas.height;
                            break;
                        case 3: // left
                            x = 0;
                            y = Math.random() * canvas.height;
                            break;
                    }
            
                    // Angle roughly towards the center with some jitter
                    const dx = centerX - x;
                    const dy = centerY - y;
                    const baseAngle = Math.atan2(dy, dx);
                    const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 6); // add small randomness
            
                    cracks.push({
                        x,
                        y,
                        angle,
                        length: 0,
                        maxLength: 30 + Math.random() * 70,
                        path: [],
                    });
                }
            }
            
            function drawCracks() {
                ctx.save();
                ctx.shadowBlur = 8;
            
                cracks.forEach(crack => {
                    const progress = crack.length / crack.maxLength;
                    const easedProgress = Math.pow(progress, 2); // ease-in: slow to fast
            
                    // Jitter in angle
                    crack.angle += (Math.random() - 0.5) * 0.6;
            
                    const baseSegment = 0.2 + Math.random() * 0.5;
                    const segmentLength = baseSegment + easedProgress * 4; // grows faster as it progresses
                    const dx = Math.cos(crack.angle) * segmentLength;
                    const dy = Math.sin(crack.angle) * segmentLength;
            
                    // New point
                    const lastX = crack.path.length ? crack.path[crack.path.length - 1].x : crack.x;
                    const lastY = crack.path.length ? crack.path[crack.path.length - 1].y : crack.y;
                    const newX = lastX + dx;
                    const newY = lastY + dy;
            
                    crack.path.push({ x: newX, y: newY });
            
                    // Draw crack with dynamic width: thick at the start, thin at the tip
                    for (let i = 0; i < crack.path.length - 1; i++) {
                        const p1 = i === 0 ? { x: crack.x, y: crack.y } : crack.path[i - 1];
                        const p2 = crack.path[i];
            
                        const ageProgress = 1 - i / crack.path.length;
                        const lineWidth = 1 + ageProgress * 10;
            
                        ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                        ctx.shadowColor = 'orange';
                        ctx.lineWidth = lineWidth;
            
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
            
                    // White inner line when matured
                    for (let i = 0; i < crack.path.length - 1; i++) {
                        const p1 = i === 0 ? { x: crack.x, y: crack.y } : crack.path[i - 1];
                        const p2 = crack.path[i];
            
                        ctx.strokeStyle = 'white';
                        ctx.shadowColor = 'white';
                        ctx.lineWidth = 1;
            
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
            
                    crack.length++;
                });
            
                ctx.restore();
            }
            

            function drawBorderLoader(timestamp) {
                let t = timestamp - startTime;
                progress = Math.min(t / duration, 1);

                
              

                ctx.clearRect(0, 0, canvas.width, canvas.height);


                if (progress > 0.3) {
                    if (cracks.length === 0) generateCracks(30);
                    drawCracks();

                    
                }


                 // Dynamically grow line width based on progress
                 ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
                 ctx.lineWidth = 0.01 + 9 * progress; // from 1 to 10 over time
                 
                 ctx.beginPath();
                 ctx.moveTo(0, 0);
                 ctx.lineTo(canvas.width, 0);
                 ctx.lineTo(canvas.width, canvas.height);
                 ctx.lineTo(0, canvas.height);
                 ctx.lineTo(0, 0);
                 ctx.stroke();

                

                

               
               


             


                if (progress < 1) {
                longPressTimers.set(card, requestAnimationFrame(drawBorderLoader));
                } else {
                canvas.remove();
                explodeTweet(tweet, pressX, pressY);
                collapseTweet(tweet);
                blockFromTweet(username);
                }
            }

            const timerId = requestAnimationFrame(drawBorderLoader);
            longPressTimers.set(card, timerId);
        });

        document.addEventListener('mouseup', (e) => {
            if(!user.enableAnimation) {
                return false;
            }
            const card = tweet
            if (card && longPressTimers.has(card)) {
            cancelAnimationFrame(longPressTimers.get(card));
            longPressTimers.delete(card);
            shakeAnim.cancel()
            const canvas = card.querySelector('canvas');
            // remove canvas from tweet element
            // canvas.remove();
            }
        });

        // No animation: the post just folds away
        blockButton.addEventListener('click', (e) => {
            if(user.enableAnimation) {
                return false;
            }
            collapseTweet(tweet);
            blockFromTweet(username);
        });


        whitelistButton.addEventListener('click', (e) => {
            unblockUsers([username])
            hideProblematicTweets();
        });

        tweetContainer.style.position = 'relative';
        // tweetContainer.appendChild(existingButton);
        tweetActions.prepend(blockButton);

    }

    // if the user is in user.whitelistedUsers  
    if(whiteListedUsers.includes(username)) {
        whitelistButton.classList.add('active');
    }

    if (isBlocked) {
        blockButton.style.display = 'flex';
    } else {
        blockButton.style.display = 'flex';
    }
}


// After a post's block button (instant, explosion or samurai): add the account to the user's
// list and block (or mute) it on X
function blockFromTweet(username) {
    alreadyBlocked.push(username); // the timeline's autoblock queue must not block it twice
    banlists.find(banlist => banlist.ownerId === user.id)?.bannedUsers.push(username);
    blockUsers([username]);
    blockUserOnX(username);
    hideProblematicTweets();
}

// Add user to selected banlist
function serverHandleAddUsersToBanList(userIds) {
    console.log("rrrrrrrrr")
    chrome.runtime.sendMessage({ action: "addUsersToBanlist", banlistId, userIds }, (response) => {
        console.log(response);
    });
}

// Remove user from selected banlist
function serverHandleRemoveUsersFromBanList(userIds) {
    chrome.runtime.sendMessage({ action: "removeUsersFromBanlist", banlistId, userIds }, (response) => {
        console.log(response);
    });
}


/// TRACK BLOCK Page

function trackBlockedUsersButton() {
    const observerBlockPage = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Ensure it's an element node
                        checkAndAttachListener_BlockPage(node);
                    }
                });
            }
        });
    });

    observerBlockPage.observe(document.body, { childList: true, subtree: true });
}

function checkAndAttachListener_BlockPage(element) {
    if (element.matches('div[data-testid="cellInnerDiv"]')) {
        attachClickListener_BlockPage(element);
    }

    // Check within the added element in case it contains multiple buttons
    const buttons = element.querySelectorAll('button[data-testid="confirmationSheetConfirm"]');
    buttons.forEach(attachClickListener_BlockModal);
}

// X's Block / Unblock confirmation dialog has the same buttons either way, and its title is in the
// user's language. So we remember which item they picked in X's menu (by data-testid, which doesn't
// change with the language) and only fall back to reading the title, in X's main languages.
let pendingXMenuAction = null;
document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const item = target?.closest('[data-testid="block"], [data-testid="unblock"]');
    if (item) pendingXMenuAction = { action: item.dataset.testid, at: Date.now() };
    else if (target?.closest('[data-testid="confirmationSheetCancel"]')) pendingXMenuAction = null;
}, true);

const X_UNBLOCK_WORDS = ['unblock', 'débloquer', 'desbloquear', 'sblocca', 'deblokkeren', 'odblokuj', 'blockierung aufheben', 'entsperren',
    'nicht mehr blockieren', 'aufheben', 'batalkan blokir', 'buka blokir', // aufheben: "Blockierung von @x aufheben"
    'разблокировать', 'engeli kaldır', '解除', '해제', 'إلغاء حظر']; // 解除 / 해제: "release" (ja, zh, ko)
const X_BLOCK_WORDS = ['block', 'bloquer', 'bloquear', 'blocca', 'blokkeren', 'zablokuj', 'blockieren', 'blokir', 'заблокировать', 'engelle',
    'ブロック', '차단', '封鎖', '屏蔽', 'حظر'];

// "block", "unblock" or null for the confirmation dialog the user just accepted
function confirmedXAction(title) {
    const pending = pendingXMenuAction;
    pendingXMenuAction = null;
    if (pending && Date.now() - pending.at < 30000) return pending.action;
    // unblock words first: most of them contain the block word ("Desbloquear" ⊃ "bloquear")
    const text = title.toLowerCase();
    if (X_UNBLOCK_WORDS.some(word => text.includes(word))) return 'unblock';
    if (X_BLOCK_WORDS.some(word => text.includes(word))) return 'block';
    return null;
}

function attachClickListener_BlockModal(button) {

   

    if (!button.dataset.listenerAttached) {
        button.addEventListener('click', () => {

            // get the first parent with data-testid="confirmationSheetDialog" as div
            let modal = button.closest('div[data-testid="confirmationSheetDialog"]');
            // get the first h1
            let usernameElement = modal.querySelector('h1');
            // Get the text content
            let usernameText = usernameElement.textContent;
            // Extract the username after the first @ and remove the question mark at the end if present
            // let username = usernameText.split('@')[1]?.replace(/\?$/, '');

            // X handles are letters, digits and underscores (works whatever punctuation the language uses)
            let match = usernameText.match(/@(\w{1,15})/);
            let username = match ? match[1] : null;
            if (!username) return;

            const action = confirmedXAction(usernameText);
            if (action === 'unblock') {
                console.log('Unblock user found:', username);
                console.log('button modal:', blockedUsers);
                unblockUsers([username]);
                // Unblocked on X: batch blocking may block them again if a Block-mode list has them
                noteAccount({ username, blocking: false });
            } else if (action === 'block') {
                console.log('block user found:', username);
                blockUsers([username]);
                // Blocked through X's own menu: save it with the follower count we've seen
                recordBlocked(username);
            }


        });
    }
}

function attachClickListener_BlockPage(button) {

    if(!button) {
        return;
    }
    // get the first a/href element
    let usernameElement = button.querySelector('a[href*="/"]');

    if(!usernameElement) {
        return;
    }
    // get the href attribute
    let username = usernameElement.getAttribute('href').substring(1);
    // console.log('Blocked user found:', usernameElement);


    //get the first button inside
    let cardButton = button.querySelector('button');
    if (!cardButton) {
        return
    }

    updateBlockCounter()


    // get the first next button. It's the block/unblock button
    let blockButton = cardButton.querySelector('button');

    if (blockButton && !button.dataset.listenerAttached) {

        // to check  if the user is banned or not, check if the button has a background where transparency is total
        if (blockButton.style.backgroundColor == "rgba(0, 0, 0, 0)") {
            xManipulationStates[username] = "unbanned";
        } else {
            xManipulationStates[username] = "banned";
        }

        
        button.dataset.listenerAttached = 'true'; // Prevent multiple listeners
        button.addEventListener('click', () => {
          
            if (xManipulationStates[username] == "banned") {
                xManipulationStates[username] = "unbanned";
                unblockUsers([username]);
            } else {
                xManipulationStates[username] = "banned";
                blockUsers([username]);
            }
        });

        
    }
}
// Run the tracking function when the script loads
trackBlockedUsersButton();







function createBlockPopup() {
    if (document.getElementById('blockPopup')) return;

    const imageUrl = chrome.runtime.getURL('src/media/scroll_down.gif');

    const popupHTML = `
        <div id="blockPopup" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 260px;
            height: 200px;
            padding: 15px;
            background: rgb(22, 22, 22);
            border: 2px solid rgb(173, 0, 0);
            color: white;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
            font-size: 14px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        ">
            <div id="popupContent" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <p style="margin: 0 0 10px; text-align: center;">
                    ${escapeHtml(i18n('syncScrollHint'))}
                </p>    
                <div class="scrolldown-wrapper">
                    <div class="scrolldown">
                        <svg height="30" width="10">
                            <circle class="scrolldown-p1" cx="5" cy="15" r="2" />
                            <circle class="scrolldown-p2" cx="5" cy="15" r="2" />
                        </svg>
                    </div>
                </div>
                <p id="blockCount" style="margin: 5px 0; font-weight: bold;"></p>
                <button style="
                    background: rgb(229, 0, 0);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                " id="syncBlockListBtn">
                    ${escapeHtml(i18n('syncButton'))}
                </button>
            </div>

            <div id="syncStatus" style="
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                height: 100%;
                width: 100%;
            ">
                <div class="spinner"></div>
                <span style="margin-top: 10px;">${escapeHtml(i18n('syncInProgress'))}</span>
            </div>



            <div id="doneStatus" style="
                position: relative;
                display: none;
                height: 100%;
                width: 100%;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
            ">
                <img src="${imageUrl}" alt="Scroll Icon" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 200px;
                    max-height: 200px;
                " />
               
            </div>
        </div>

        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: spin 1s linear infinite;
            }
        </style>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = popupHTML.trim();
    const popup = tempDiv.firstChild;

    popup.querySelector('#syncBlockListBtn').addEventListener('click', () => {
        const popupContent = popup.querySelector('#popupContent');
        const syncStatus = popup.querySelector('#syncStatus');
        const doneStatus = popup.querySelector('#doneStatus');

        popupContent.style.display = 'none';
        syncStatus.style.display = 'flex';

        blockUsers(Object.keys(xManipulationStates).filter(user => xManipulationStates[user] === "banned"));

        setTimeout(() => {
            syncStatus.style.display = 'none';
            doneStatus.style.display = 'flex';

            const checkIcon = document.querySelector(".check-icon");
            checkIcon.style.display = "none";
            setTimeout(() => {
                checkIcon.style.display = "block";
            }, 10);
        }, 2000);
    });

    document.body.appendChild(popup);
    updateBlockCounter();
}

function updateBlockCounter() {
    let blockedUsers = Object.values(xManipulationStates).filter(state => state === "banned").length;
    let countText = document.getElementById('blockCount');
    if (countText) {
        countText.innerText = i18n('syncCollected', blockedUsers);
    }
}
function observeBlockPage() {
    if (window.location.href === "https://x.com/settings/blocked/all") {
        createBlockPopup();
        let observer = new MutationObserver(() => {
            updateBlockCounter();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}



// observeBlockPage();
(function() {
    let lastUrl = location.href;

    // Check the initial URL when the script loads
    if (lastUrl === "https://x.com/settings/blocked/all") {
        createBlockPopup();
    }

    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            console.log("URL changed to:", location.href);
            lastUrl = location.href;

            if (lastUrl === "https://x.com/settings/blocked/all") {
                createBlockPopup();
            } else {
                let popup = document.getElementById('blockPopup');
                if (popup) {
                    popup.remove();
                }
            }
        }
    }).observe(document, { subtree: true, childList: true });

    window.addEventListener("popstate", () => {
        console.log("URL changed (popstate) to:", location.href);
        if (location.href === "https://x.com/settings/blocked/all") {
            createBlockPopup();
        } else {
            let popup = document.getElementById('blockPopup');
            if (popup) {
                popup.remove();
            }
        }
    });

    const pushState = history.pushState;
    history.pushState = function() {
        pushState.apply(this, arguments);
        window.dispatchEvent(new Event("pushstate"));
    };

    window.addEventListener("pushstate", () => {
        console.log("URL changed (pushstate) to:", location.href);
        if (location.href === "https://x.com/settings/blocked/all") {
            createBlockPopup();
        } else {
            let popup = document.getElementById('blockPopup');
            if (popup) {
                popup.remove();
            }
        }
    });
})();




/// TRACK BLOCK

function trackNewElements() {
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Ensure it's an element node
                        checkAndAttachListener(node);
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function checkAndAttachListener(element) {
    if (element.matches('button[data-testid$="-unblock"]')) {
        attachClickListener(element);
    }
    
    // Check within the added element in case it contains multiple buttons
    const buttons = element.querySelectorAll('button[data-testid$="-unblock"]');
    buttons.forEach(attachClickListener);
}

function attachClickListener(button) {
    if (!button.dataset.listenerAttached) {
        button.dataset.listenerAttached = 'true'; // Prevent multiple listeners
        button.addEventListener('click', () => {
            console.log('Unblock button clicked:', button);
        });
    }
}

// Run the observer to track dynamically added elements
trackNewElements();