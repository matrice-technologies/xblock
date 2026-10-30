// --- Samurai block mode ---
// With the "Samurai" block animation, clicking a tweet's block button lifts the tweet out of the
// timeline onto a dark stage, where the user slices it apart just by sweeping the mouse through it.
// Every piece is a clone of the tweet clipped to a convex polygon, so the cuts go through the real
// post. "Done" (or enough pieces) drops everything and blocks the account; Escape puts it back.
// Loaded after content.js: reuses its FX helpers (rand, stepFx, drawFx, heatColor, pageTheme).

const SAMURAI_STORAGE_KEY = 'xblock_block_animation';
// Blade speed (screen px per ms) needed for a sweep to cut
const SAMURAI_MIN_SPEED = 0.45;
const SAMURAI_MAX_PIECES = 18;
// Pieces smaller than this share of the tweet fall away instead of floating
const SAMURAI_DROP_AREA = 0.05;
// Both halves of a cut must be at least this share of the tweet, so grazes don't count
const SAMURAI_MIN_CUT_AREA = 0.004;
const SAMURAI_TRAIL_MS = 100;
const SAMURAI_INTRO_MS = 560;
// Once the post is cut, this long without a new cut finishes the job, as if Done was clicked
const SAMURAI_IDLE_FINISH_MS = 2000;

// "explode" (long press) or "samurai"; the on/off switch is the user's enableAnimation
let blockAnimationStyle = 'explode';
chrome.storage.sync.get(SAMURAI_STORAGE_KEY, result => {
    blockAnimationStyle = result?.[SAMURAI_STORAGE_KEY] || 'explode';
});
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[SAMURAI_STORAGE_KEY]) {
        blockAnimationStyle = changes[SAMURAI_STORAGE_KEY].newValue || 'explode';
    }
});

let samuraiSession = null;

// --- Polygon helpers (points are {x, y, cut}; `cut` marks the edge to the next point as a cut) ---

function polygonArea(points) {
    let area = 0;
    points.forEach((p, i) => {
        const q = points[(i + 1) % points.length];
        area += p.x * q.y - q.x * p.y;
    });
    return Math.abs(area) / 2;
}

function polygonCentroid(points) {
    let area = 0, x = 0, y = 0;
    points.forEach((p, i) => {
        const q = points[(i + 1) % points.length];
        const cross = p.x * q.y - q.x * p.y;
        area += cross;
        x += (p.x + q.x) * cross;
        y += (p.y + q.y) * cross;
    });
    if (Math.abs(area) < 1e-6) return { x: points[0].x, y: points[0].y };
    return { x: x / (3 * area), y: y / (3 * area) };
}

function pointInPolygon(points, x, y) {
    let sign = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        const cross = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
        if (cross === 0) continue;
        if (sign === 0) sign = Math.sign(cross);
        else if (Math.sign(cross) !== sign) return false;
    }
    return true;
}

function segmentsIntersect(a, b, c, d) {
    const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}

// True when a blade stroke from a to b goes clean through the polygon (in one side, out the other)
function strokeCrossesPolygon(points, a, b) {
    let hits = 0;
    points.forEach((p, i) => {
        if (segmentsIntersect(a, b, p, points[(i + 1) % points.length])) hits++;
    });
    return hits >= 2;
}

// Splits a convex polygon along the line through p with direction d
function splitPolygon(points, p, d) {
    const side = v => d.x * (v.y - p.y) - d.y * (v.x - p.x) || 1e-9;
    const left = [], right = [];
    points.forEach((a, i) => {
        const b = points[(i + 1) % points.length];
        const sa = side(a), sb = side(b);
        (sa > 0 ? left : right).push(a);
        if ((sa > 0) !== (sb > 0)) {
            const t = sa / (sa - sb);
            const x = a.x + (b.x - a.x) * t;
            const y = a.y + (b.y - a.y) * t;
            // The side we leave gets the new cut edge, the side we enter keeps the rest of edge a→b
            (sa > 0 ? left : right).push({ x, y, cut: true });
            (sa > 0 ? right : left).push({ x, y, cut: a.cut });
        }
    });
    return [left, right];
}

// --- Pieces ---
// A piece maps its polygon's local coordinates to the stage: R(angle)·(q − c) + c + (x, y)

function pieceToStage(piece, x, y) {
    const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle);
    const ux = x - piece.cx, uy = y - piece.cy;
    return { x: ux * cos - uy * sin + piece.cx + piece.x, y: ux * sin + uy * cos + piece.cy + piece.y };
}

function stageToPiece(piece, x, y) {
    const cos = Math.cos(-piece.angle), sin = Math.sin(-piece.angle);
    const ux = x - piece.cx - piece.x, uy = y - piece.cy - piece.y;
    return { x: ux * cos - uy * sin + piece.cx, y: ux * sin + uy * cos + piece.cy };
}

function setPiecePolygon(piece, points) {
    // Moving the rotation origin to the new centroid must not move the piece on screen
    const centroid = polygonCentroid(points);
    const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle);
    const dx = centroid.x - piece.cx, dy = centroid.y - piece.cy;
    piece.x += dx * cos - dy * sin - dx;
    piece.y += dx * sin + dy * cos - dy;
    piece.cx = centroid.x;
    piece.cy = centroid.y;
    piece.points = points;
    piece.area = polygonArea(points);
    piece.el.style.transformOrigin = `${piece.cx}px ${piece.cy}px`;
    piece.clip.style.clipPath = `polygon(${points.map(p => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(', ')})`;
}

function renderPiece(piece) {
    piece.el.style.transform = `translate(${piece.x.toFixed(2)}px, ${piece.y.toFixed(2)}px) rotate(${piece.angle.toFixed(4)}rad)`;
    if (piece.opacity !== undefined) piece.el.style.opacity = piece.opacity;
}

// --- Session ---

function startSamuraiBlock(tweet, username, onBlock) {
    if (samuraiSession) return;
    const rect = tweet.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return onBlock();

    const theme = pageTheme();
    const tweetStyle = getComputedStyle(tweet);
    const width = rect.width, height = rect.height;

    const overlay = document.createElement('div');
    overlay.className = 'xbs-overlay';
    overlay.innerHTML = `
        <div class="xbs-backdrop"></div>
        <div class="xbs-kanji">斬</div>
        <div class="xbs-stage"></div>
        <canvas class="xbs-canvas"></canvas>
        <div class="xbs-esc">${escapeHtml(i18n('samuraiCancel'))}</div>
        <div class="xbs-hud">
            <span class="xbs-hint">⚔ ${escapeHtml(i18n('samuraiHint'))}</span>
            <span class="xbs-count"></span>
            <button class="xbs-done">${escapeHtml(i18n(xAction === 'mute' ? 'samuraiDoneMute' : 'samuraiDone', username))}</button>
        </div>`;
    const stage = overlay.querySelector('.xbs-stage');
    const canvas = overlay.querySelector('.xbs-canvas');
    const counter = overlay.querySelector('.xbs-count');
    Object.assign(stage.style, { width: `${width}px`, height: `${height}px` });

    // The card: a clone of the tweet on the page's own background, with the inherited text styles
    const piece = { x: 0, y: 0, angle: 0, cx: 0, cy: 0, vx: 0, vy: 0, va: 0, falling: false, cutAt: 0, entry: null };
    piece.el = document.createElement('div');
    piece.el.className = 'xbs-piece';
    piece.clip = document.createElement('div');
    piece.clip.className = 'xbs-clip';
    const card = document.createElement('div');
    card.className = 'xbs-card';
    Object.assign(card.style, {
        width: `${width}px`,
        height: `${height}px`,
        background: `rgb(${getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)?.slice(0, 3).join(', ') || '0, 0, 0'})`,
        color: tweetStyle.color,
        fontFamily: tweetStyle.fontFamily,
        borderColor: theme.isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    });
    const clone = tweet.cloneNode(true);
    // hideProblematicTweets() walks every <article>, clones included; this makes it skip them
    clone.dataset.xblockExploded = 'true';
    clone.querySelectorAll('canvas, video').forEach(el => el.remove());
    Object.assign(clone.style, { margin: '0', width: `${width}px`, transform: 'none', filter: 'none', visibility: 'visible', pointerEvents: 'none' });
    card.appendChild(clone);
    piece.clip.appendChild(card);
    piece.el.appendChild(piece.clip);
    stage.appendChild(piece.el);
    setPiecePolygon(piece, [
        { x: 0, y: 0, cut: false }, { x: width, y: 0, cut: false },
        { x: width, y: height, cut: false }, { x: 0, y: height, cut: false },
    ]);

    document.body.appendChild(overlay);
    tweet.style.visibility = 'hidden';

    const scale = Math.min(1.3, (window.innerWidth * 0.86) / width, (window.innerHeight * 0.7) / height);
    const session = samuraiSession = {
        tweet, username, onBlock, overlay, stage, canvas, counter, theme,
        ctx: canvas.getContext('2d'),
        dpr: window.devicePixelRatio || 1,
        width, height,
        totalArea: width * height,
        pieces: [piece],
        fx: [],
        trail: [],
        pointer: null,
        cuts: 0,
        state: 'intro',
        startedAt: performance.now(),
        from: { x: rect.left, y: rect.top, s: 1 },
        to: { x: (window.innerWidth - width * scale) / 2, y: (window.innerHeight - height * scale) / 2 - 24, s: scale },
        view: { x: rect.left, y: rect.top, s: 1, rot: 0 },
        freezeUntil: 0,
        shakeUntil: 0,
        lastTime: performance.now(),
    };
    resizeSamuraiCanvas(session);
    updateSamuraiCounter(session);

    overlay.addEventListener('pointermove', event => onSamuraiPointer(session, event));
    overlay.addEventListener('pointerleave', () => { session.pointer = null; });
    overlay.addEventListener('wheel', event => event.preventDefault(), { passive: false });
    overlay.querySelector('.xbs-done').addEventListener('click', event => {
        event.stopPropagation();
        finishSamurai(session);
    });
    session.onKey = event => {
        // Keep X's keyboard shortcuts out while the stage is up
        event.stopImmediatePropagation();
        if (event.key === 'Escape') cancelSamurai(session);
        else if (event.key === 'Enter') finishSamurai(session);
    };
    session.onResize = () => resizeSamuraiCanvas(session);
    window.addEventListener('keydown', session.onKey, true);
    window.addEventListener('resize', session.onResize);

    requestAnimationFrame(() => overlay.classList.add('xbs-open'));
    session.frame = requestAnimationFrame(time => samuraiLoop(session, time));
}

function resizeSamuraiCanvas(session) {
    session.dpr = window.devicePixelRatio || 1;
    session.canvas.width = Math.round(window.innerWidth * session.dpr);
    session.canvas.height = Math.round(window.innerHeight * session.dpr);
}

function updateSamuraiCounter(session) {
    session.counter.textContent = i18n('samuraiCuts', session.cuts);
    session.counter.classList.toggle('xbs-hidden', session.cuts === 0);
}

function stagePoint(session, x, y) {
    return { x: (x - session.view.x) / session.view.s, y: (y - session.view.y) / session.view.s };
}

function onSamuraiPointer(session, event) {
    const now = performance.now();
    const point = { x: event.clientX, y: event.clientY, t: now };
    session.trail.push(point);
    const previous = session.pointer;
    session.pointer = point;
    if (!previous || session.state !== 'slicing') return;

    const speed = Math.hypot(point.x - previous.x, point.y - previous.y) / Math.max(now - previous.t, 1);
    const fast = speed >= SAMURAI_MIN_SPEED;
    const a = stagePoint(session, previous.x, previous.y);
    const b = stagePoint(session, point.x, point.y);

    // Copy: cutting adds pieces while we iterate
    [...session.pieces].forEach(piece => {
        if (piece.falling) return;
        const from = stageToPiece(piece, a.x, a.y);
        const to = stageToPiece(piece, b.x, b.y);
        const wasInside = pointInPolygon(piece.points, from.x, from.y);
        const isInside = pointInPolygon(piece.points, to.x, to.y);

        if (!wasInside && isInside) {
            piece.entry = from;
        } else if (wasInside && isInside) {
            // Dawdling inside: the cut will start where the fast sweep begins
            if (!fast || !piece.entry) piece.entry = to;
        } else if (wasInside && !isInside) {
            if (fast && piece.entry) cutPiece(session, piece, piece.entry, to);
            piece.entry = null;
        } else if (fast && strokeCrossesPolygon(piece.points, from, to)) {
            cutPiece(session, piece, from, to);
        }
    });
}

function cutPiece(session, piece, start, end) {
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (length < 8) return false;
    const direction = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
    const [left, right] = splitPolygon(piece.points, start, direction);
    if (left.length < 3 || right.length < 3) return false;
    const minArea = SAMURAI_MIN_CUT_AREA * session.totalArea;
    if (polygonArea(left) < minArea || polygonArea(right) < minArea) return false;

    // The chord, for the slash flash (in screen coordinates)
    const chordIndex = left.findIndex(p => p.cut === true && right.some(q => q.x === p.x && q.y === p.y));
    const chordStart = left[chordIndex] || start;
    const chordEnd = left[(chordIndex + 1) % left.length] || end;

    const twin = {
        ...piece,
        el: piece.el.cloneNode(true),
        entry: null,
    };
    twin.clip = twin.el.firstChild;
    session.stage.appendChild(twin.el);
    session.pieces.push(twin);

    setPiecePolygon(piece, left);
    setPiecePolygon(twin, right);
    piece.entry = null;

    // Halves spring apart along the cut's normal, dragged a little along the blade
    const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle);
    const normal = { x: -direction.y * cos - direction.x * sin, y: -direction.y * sin + direction.x * cos };
    const along = { x: direction.x * cos - direction.y * sin, y: direction.x * sin + direction.y * cos };
    const push = rand(70, 120);
    const spin = rand(0.15, 0.5) * (Math.random() < 0.5 ? -1 : 1);
    [[piece, 1], [twin, -1]].forEach(([half, sign]) => {
        half.vx += normal.x * push * sign + along.x * 25;
        half.vy += normal.y * push * sign + along.y * 25;
        half.va += spin * sign;
        half.cutAt = performance.now();
        if (half.area < SAMURAI_DROP_AREA * session.totalArea) dropPiece(half, 0.6);
    });

    session.cuts++;
    updateSamuraiCounter(session);
    samuraiSlashFx(session, piece, chordStart, chordEnd);
    clearTimeout(session.idleTimer);
    session.idleTimer = setTimeout(() => finishSamurai(session), SAMURAI_IDLE_FINISH_MS);

    const floating = session.pieces.filter(p => !p.falling).length;
    if (floating >= SAMURAI_MAX_PIECES) setTimeout(() => finishSamurai(session), 350);
    return true;
}

function dropPiece(piece, strength = 1) {
    piece.falling = true;
    piece.vx += rand(-160, 160) * strength;
    piece.vy -= rand(120, 380) * strength;
    piece.va += rand(-3, 3) * strength;
}

function samuraiSlashFx(session, piece, chordStart, chordEnd) {
    const toScreen = point => {
        const p = pieceToStage(piece, point.x, point.y);
        return { x: session.view.x + p.x * session.view.s, y: session.view.y + p.y * session.view.s };
    };
    const a = toScreen(chordStart), b = toScreen(chordEnd);
    const dx = b.x - a.x, dy = b.y - a.y;
    session.fx.push({
        kind: 'slash', x1: a.x - dx * 0.25, y1: a.y - dy * 0.25, x2: b.x + dx * 0.25, y2: b.y + dy * 0.25,
        age: 0, life: 0.3,
    });

    const amount = FX_REDUCED_MOTION ? 0.4 : 1;
    for (let i = 0; i < 26 * amount; i++) {
        // Sparks along the cut, thrown mostly sideways from the blade
        const t = Math.random();
        const angle = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2 + rand(-0.9, 0.9);
        const speed = rand(200, 900);
        session.fx.push({
            kind: 'spark', x: a.x + dx * t, y: a.y + dy * t, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            drag: 3, gravity: 900, size: rand(1, 2.4), age: 0, life: rand(0.25, 0.6), blend: 'lighter', heat: 0,
        });
    }

    // Hit-stop and a jolt, so each cut lands
    session.freezeUntil = performance.now() + (FX_REDUCED_MOTION ? 0 : 45);
    session.shakeUntil = performance.now() + (FX_REDUCED_MOTION ? 0 : 160);
}

function finishSamurai(session) {
    if (session.state === 'finishing' || session.state === 'closing') return;
    session.state = 'finishing';
    session.overlay.classList.add('xbs-finishing');
    session.pieces.forEach(piece => {
        if (!piece.falling) dropPiece(piece);
        piece.vy -= rand(0, 200);
    });
    session.fx.push({ kind: 'glint', age: 0, life: 0.35 });
    collapseTweet(session.tweet);
    session.onBlock();
    setTimeout(() => closeSamurai(session), 1100);
}

function cancelSamurai(session) {
    if (session.state === 'finishing' || session.state === 'closing') return;
    session.state = 'closing';
    session.overlay.classList.remove('xbs-open');
    if (session.cuts === 0) {
        // Put the card back where it came from
        const rect = session.tweet.getBoundingClientRect();
        session.from = { ...session.to };
        session.to = { x: rect.left, y: rect.top, s: 1 };
        session.startedAt = performance.now();
        setTimeout(() => closeSamurai(session), 380);
    } else {
        session.overlay.classList.add('xbs-fading');
        setTimeout(() => closeSamurai(session), 320);
    }
}

function closeSamurai(session) {
    cancelAnimationFrame(session.frame);
    clearTimeout(session.idleTimer);
    window.removeEventListener('keydown', session.onKey, true);
    window.removeEventListener('resize', session.onResize);
    session.overlay.remove();
    if (session.state === 'closing') session.tweet.style.visibility = '';
    samuraiSession = null;
}

const easeOutBack = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

function samuraiLoop(session, time) {
    const dt = Math.min((time - session.lastTime) / 1000, 1 / 30);
    session.lastTime = time;
    const view = session.view;

    // Lift-off (and the way back on cancel): position eases out, scale overshoots a touch
    if (session.state === 'intro' || (session.state === 'closing' && session.cuts === 0)) {
        const duration = session.state === 'intro' ? SAMURAI_INTRO_MS : 340;
        const t = Math.min((time - session.startedAt) / duration, 1);
        const move = easeOutCubic(t);
        const grow = session.state === 'intro' ? easeOutBack(t) : move;
        view.x = session.from.x + (session.to.x - session.from.x) * move;
        view.y = session.from.y + (session.to.y - session.from.y) * move;
        view.s = session.from.s + (session.to.s - session.from.s) * grow;
        view.rot = session.state === 'intro' ? -2.5 * Math.sin(Math.PI * t) * (1 - t) : 0;
        if (t >= 1 && session.state === 'intro') {
            session.state = 'slicing';
            session.fx.push({ kind: 'glint', age: 0, life: 0.5 });
        }
    }

    const shaking = time < session.shakeUntil;
    const jitter = shaking ? 5 * ((session.shakeUntil - time) / 160) : 0;
    session.stage.style.transform =
        `translate(${view.x + rand(-1, 1) * jitter}px, ${view.y + rand(-1, 1) * jitter}px) scale(${view.s}) rotate(${view.rot}deg)`;

    if (time >= session.freezeUntil) {
        session.pieces = session.pieces.filter(piece => {
            const damping = Math.exp((piece.falling ? -0.3 : -4.5) * dt);
            piece.vx *= damping;
            piece.vy = piece.vy * damping + (piece.falling ? 2600 / view.s : 0) * dt;
            piece.va *= piece.falling ? 1 : damping;
            if (!piece.falling) keepPieceOnScreen(session, piece, dt);
            piece.x += piece.vx * dt;
            piece.y += piece.vy * dt;
            piece.angle += piece.va * dt;
            // Gone below the screen
            if (piece.falling && view.y + (piece.y - session.height) * view.s > window.innerHeight + 50) {
                piece.el.remove();
                return false;
            }
            renderPiece(piece);
            return true;
        });
    }

    drawSamuraiCanvas(session, time, dt);
    session.frame = requestAnimationFrame(t => samuraiLoop(session, t));
}

// Floating pieces drift apart cut after cut; a soft spring keeps their centres on screen
function keepPieceOnScreen(session, piece, dt) {
    const { view } = session;
    const margin = 70;
    const x = view.x + (piece.cx + piece.x) * view.s;
    const y = view.y + (piece.cy + piece.y) * view.s;
    const overX = x < margin ? margin - x : Math.min(window.innerWidth - margin - x, 0);
    const overY = y < margin ? margin - y : Math.min(window.innerHeight - 110 - y, 0);
    piece.vx += (overX / view.s) * 40 * dt;
    piece.vy += (overY / view.s) * 40 * dt;
}

function drawSamuraiCanvas(session, time, dt) {
    const { ctx, dpr, view } = session;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Cut edges: a hot glow that cools into a thin bright line
    session.pieces.forEach(piece => {
        const heat = Math.min((time - piece.cutAt) / 450, 1);
        ctx.save();
        ctx.translate(view.x, view.y);
        ctx.scale(view.s, view.s);
        ctx.translate(piece.x + piece.cx, piece.y + piece.cy);
        ctx.rotate(piece.angle);
        ctx.translate(-piece.cx, -piece.cy);
        ctx.lineCap = 'round';
        piece.points.forEach((p, i) => {
            if (!p.cut) return;
            const q = piece.points[(i + 1) % piece.points.length];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            if (heat < 1) {
                ctx.strokeStyle = heatColor(0.2 + heat, 1 - heat);
                ctx.shadowColor = 'rgba(255, 90, 40, 0.9)';
                ctx.shadowBlur = 14 * (1 - heat);
                ctx.lineWidth = (4 - 2.5 * heat) / view.s;
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1 / view.s;
            ctx.stroke();
        });
        ctx.restore();
    });

    session.fx = session.fx.filter(item => {
        const alive = time < session.freezeUntil ? true : stepFx(item, dt);
        const t = Math.min(item.age / item.life, 1);
        if (item.kind === 'slash') {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(255, 45, 85, 0.95)';
            ctx.shadowBlur = 24;
            ctx.strokeStyle = `rgba(255, 70, 100, ${0.8 * (1 - t)})`;
            ctx.lineWidth = 10 * (1 - t);
            ctx.beginPath();
            ctx.moveTo(item.x1, item.y1);
            ctx.lineTo(item.x2, item.y2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - t})`;
            ctx.lineWidth = 2.5 * (1 - t * 0.7);
            ctx.stroke();
            ctx.restore();
        } else if (item.kind === 'glint') {
            // A blade-like sheen sweeping across the card
            const x = view.x - 200 + (session.width * view.s + 400) * easeOutCubic(t);
            const gradient = ctx.createLinearGradient(x - 120, 0, x + 120, 0);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.22 * (1 - t)})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.save();
            ctx.beginPath();
            ctx.rect(view.x, view.y, session.width * view.s, session.height * view.s);
            ctx.clip();
            ctx.globalCompositeOperation = 'lighter';
            ctx.setTransform(dpr, 0, -0.35 * dpr, dpr, 0, 0);
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 120 + view.y * 0.35, view.y, 240 + session.height * view.s * 0.35, session.height * view.s);
            ctx.restore();
        } else {
            drawFx(ctx, item);
            ctx.globalCompositeOperation = 'source-over';
        }
        return alive;
    });

    // The blade: a tapered streak along the last few pointer positions
    const now = performance.now();
    session.trail = session.trail.filter(point => now - point.t < SAMURAI_TRAIL_MS);
    const trail = session.trail;
    if (trail.length > 1 && session.state !== 'closing') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(255, 45, 85, 0.9)';
        ctx.shadowBlur = 16;
        for (let i = 1; i < trail.length; i++) {
            const life = 1 - (now - trail[i].t) / SAMURAI_TRAIL_MS;
            ctx.strokeStyle = `rgba(255, 235, 240, ${0.9 * life})`;
            ctx.lineWidth = 1 + 5 * life;
            ctx.beginPath();
            ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
            ctx.lineTo(trail[i].x, trail[i].y);
            ctx.stroke();
        }
        ctx.restore();
    }
    if (session.pointer && session.state !== 'closing') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = 'rgba(255, 45, 85, 1)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(255, 240, 245, 0.95)';
        ctx.beginPath();
        ctx.arc(session.pointer.x, session.pointer.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
