// Usage (from the repo root, local server running for the popup scenes):
//   npm i --no-save puppeteer-core && node media/walkthrough/capture.js [scene ...]
//
// Records the real XBlock UI for the walkthrough video, one clip per scene:
// - "x-*" scenes load the real content scripts (src/content) on a fake x.com timeline, with the
//   chrome.* API mocked, so the in-page UI (block buttons, animations, list modes, batch overlay)
//   is the actual extension code;
// - "popup-*" scenes drive the built extension's popup (dist/) against the local server.
// Each clip is a folder of screencast frames + clip.json (frame times, mouse track, marks), which
// compose.html turns into the video. The mouse is logged because screenshots don't show it.
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const OUT = process.env.CLIPS_DIR || path.join(__dirname, "clips");
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const messages = JSON.parse(fs.readFileSync(path.join(SRC, "_locales/en/messages.json"), "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => Date.now() / 1000;
const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// ---------- recording ----------

class Recorder {
  constructor(page, name, size) {
    Object.assign(this, { page, name, size, frames: [], cursor: [], marks: {} });
  }
  async start() {
    this.dir = path.join(OUT, this.name);
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
    this.cdp = await this.page.createCDPSession();
    let n = 0;
    this.cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
      const file = `f${String(n++).padStart(5, "0")}.jpg`;
      fs.writeFileSync(path.join(this.dir, file), Buffer.from(data, "base64"));
      this.frames.push({ file, t: (metadata.timestamp || now()) - this.t0 });
      this.cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    });
    await this.page.bringToFront(); // background tabs get no frames (and no requestAnimationFrame)
    this.t0 = now();
    await this.cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 4000, maxHeight: 4000, everyNthFrame: 1 });
    // a first frame even if nothing moves
    await this.page.evaluate(() => { document.body.style.outline = "0.01px solid transparent"; });
  }
  mark(label) { this.marks[label] = now() - this.t0; }
  log(x, y, down, visible = true) { this.cursor.push({ t: now() - this.t0, x, y, down, visible }); }
  async stop() {
    await sleep(300);
    await this.cdp.send("Page.stopScreencast");
    const clip = { name: this.name, size: this.size, duration: now() - this.t0, frames: this.frames, cursor: this.cursor, marks: this.marks };
    fs.writeFileSync(path.join(this.dir, "clip.json"), JSON.stringify(clip));
    console.log(`  ${this.name}: ${this.frames.length} frames, ${clip.duration.toFixed(1)} s`);
  }
}

// A mouse that moves like a hand and logs where it is
class Mouse {
  constructor(page, rec, x, y) { Object.assign(this, { page, rec, x, y, down: false }); }
  async place(x, y) { this.x = x; this.y = y; await this.page.mouse.move(x, y); this.rec.log(x, y, this.down); }
  async moveTo(x, y, ms = 700, curve = ease) {
    const [x0, y0] = [this.x, this.y], start = Date.now();
    for (;;) {
      const p = Math.min(1, (Date.now() - start) / ms), e = curve(p);
      const arc = Math.sin(p * Math.PI) * Math.min(30, Math.hypot(x - x0, y - y0) * 0.08);
      this.x = x0 + (x - x0) * e; this.y = y0 + (y - y0) * e - arc;
      await this.page.mouse.move(this.x, this.y);
      this.rec.log(this.x, this.y, this.down);
      if (p >= 1) break;
      await sleep(8);
    }
  }
  // fast straight swipe (samurai slashes)
  sweep(x1, y1, x2, y2, ms = 110) { return this.moveTo(x2, y2, ms, p => p).then(() => {}); }
  async press() { this.down = true; await this.page.mouse.down(); this.rec.log(this.x, this.y, true); }
  async release() { this.down = false; await this.page.mouse.up(); this.rec.log(this.x, this.y, false); }
  async click(hold = 90) { await this.press(); await sleep(hold); await this.release(); }
  async to(target, ms) { const p = await target; await this.moveTo(p.x, p.y, ms); }
}

async function center(page, selector, index = 0) {
  return page.evaluate((selector, index) => {
    const el = typeof selector === "string" ? document.querySelectorAll(selector)[index] : null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, selector, index);
}

// ---------- fake x.com ----------

const COLORS = ["#1d9bf0", "#f91880", "#00ba7c", "#7856ff", "#ff7a1a", "#ffad1f", "#e0245e", "#17bf63"];
function tweetHTML(t, i) {
  const color = t.color || COLORS[i % COLORS.length];
  const media = t.img ? `<div class="media" style="background:${t.img}"></div>` : "";
  return `<div class="cell"><article><div class="tw">
    <div class="av" style="background:linear-gradient(135deg, ${color}, #222)">${t.name.replace(/[^a-z]/i, "")[0]}</div>
    <div class="body">
      <div class="head">
        <div class="names"><b>${t.name}</b>${t.verified ? '<i class="fa-solid fa-circle-check" style="color:#1d9bf0;font-size:15px"></i>' : ""}<a href="/${t.handle}">@${t.handle}</a><span>· ${t.time || "2h"}</span></div>
        <div class="acts"><div><div><div class="caret-row"><div><button data-testid="caret"><i class="fa-solid fa-ellipsis"></i></button></div></div></div></div></div>
      </div>
      <div class="text">${t.text}</div>${media}
      <div class="bar"><span><i class="fa-regular fa-comment"></i>${t.c || 48}</span><span><i class="fa-solid fa-retweet"></i>${t.r || 210}</span><span><i class="fa-regular fa-heart"></i>${t.l || "1.4K"}</span><span><i class="fa-solid fa-chart-simple"></i>${t.v || "52K"}</span><span><i class="fa-regular fa-bookmark"></i></span></div>
    </div>
  </div></article></div>`;
}

function xPage(tweets) {
  const nav = [["fa-house", "Home", 1], ["fa-magnifying-glass", "Explore"], ["fa-bell", "Notifications"], ["fa-envelope", "Messages"], ["fa-bookmark", "Bookmarks"], ["fa-user", "Profile"], ["fa-circle-dot", "More"]];
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<link rel="stylesheet" href="https://x.com/xb/general.css"><link rel="stylesheet" href="https://x.com/xb/disintegrate.css"><link rel="stylesheet" href="https://x.com/xb/samurai.css">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #000; color: #e7e9ea; font: 15px/20px "Segoe UI", -apple-system, sans-serif; overflow: hidden; }
  a { color: inherit; text-decoration: none; }
  .layout { display: flex; justify-content: center; height: 100vh; }
  .nav { width: 260px; padding: 6px 12px; display: flex; flex-direction: column; gap: 2px; }
  .logo { font: 900 30px/1 "Segoe UI", sans-serif; padding: 12px; }
  .nav a { display: flex; align-items: center; gap: 18px; padding: 11px 12px; border-radius: 999px; font-size: 19px; }
  .nav a i { width: 26px; font-size: 22px; text-align: center; }
  .nav a.on { font-weight: 700; }
  .post { margin-top: 12px; width: 220px; padding: 14px; border-radius: 999px; background: #eff3f4; color: #0f1419; font-weight: 700; font-size: 16px; text-align: center; }
  main { width: 600px; border-left: 1px solid #2f3336; border-right: 1px solid #2f3336; }
  .tabs { display: flex; border-bottom: 1px solid #2f3336; position: sticky; top: 0; background: rgba(0,0,0,.85); backdrop-filter: blur(12px); z-index: 5; }
  .tabs div { flex: 1; text-align: center; padding: 16px 0; color: #71767b; font-weight: 500; }
  .tabs div.on { color: #e7e9ea; font-weight: 700; position: relative; }
  .tabs div.on::after { content: ""; position: absolute; left: 50%; bottom: 0; width: 56px; height: 4px; margin-left: -28px; border-radius: 4px; background: #1d9bf0; }
  .compose { display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #2f3336; color: #71767b; font-size: 20px; align-items: center; }
  .compose .av { width: 40px; height: 40px; }
  .cell { border-bottom: 1px solid #2f3336; }
  .tw { display: flex; gap: 12px; padding: 12px 16px; }
  .av { width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center; font-weight: 700; color: #fff; }
  .body { flex: 1; min-width: 0; }
  .head { display: flex; justify-content: space-between; align-items: center; }
  .names { display: flex; gap: 4px; align-items: center; white-space: nowrap; overflow: hidden; }
  .names a, .names span { color: #71767b; }
  .acts > div > div { display: flex; align-items: center; }
  .acts { display: flex; } .acts > div { display: flex; align-items: center; gap: 10px; }
  [data-testid="caret"] { background: none; border: none; color: #71767b; font-size: 15px; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }
  .text { margin-top: 2px; white-space: pre-line; }
  .media { height: 230px; border-radius: 16px; border: 1px solid #2f3336; margin-top: 12px; }
  .bar { display: flex; justify-content: space-between; color: #71767b; margin-top: 12px; max-width: 470px; font-size: 13px; }
  .bar span { display: flex; gap: 8px; align-items: center; }
  .side { width: 350px; padding: 8px 0 0 28px; display: flex; flex-direction: column; gap: 16px; }
  .search { padding: 11px 18px; border-radius: 999px; border: 1px solid #2f3336; color: #71767b; }
  .box { border: 1px solid #2f3336; border-radius: 16px; padding: 12px 16px; }
  .box h3 { margin: 0 0 10px; font-size: 20px; }
  .trend { padding: 8px 0; } .trend small { color: #71767b; display: block; font-size: 13px; } .trend b { font-size: 15px; }
</style></head><body>
<div class="layout">
  <div class="nav"><div class="logo">𝕏</div>${nav.map(([icon, label, on]) => `<a class="${on ? "on" : ""}"><i class="fa-solid ${icon}"></i>${label}</a>`).join("")}<div class="post">Post</div></div>
  <main><div class="tabs"><div class="on">For you</div><div>Following</div></div>
    <div class="compose"><div class="av" style="background:linear-gradient(135deg,#f4212e,#ff7a1a)">J</div>What is happening?!</div>
    <div data-testid="primaryColumn">${tweets.map(tweetHTML).join("")}</div>
  </main>
  <div class="side"><div class="search"><i class="fa-solid fa-magnifying-glass"></i>&nbsp; Search</div>
    <div class="box"><h3>What's happening</h3>
      <div class="trend"><small>Technology · Trending</small><b>#ChromeExtensions</b></div>
      <div class="trend"><small>Trending in France</small><b>Clean timeline</b></div>
      <div class="trend"><small>Entertainment · Trending</small><b>Samurai</b></div>
      <div class="trend"><small>Sports · Trending</small><b>Marathon</b></div></div>
  </div>
</div></body></html>`;
}

const FEED = [
  { name: "Emma R.", handle: "emma_r", text: "Sunset over the bay tonight. Unreal. 🌅", color: "#1d9bf0" },
  { name: "Fast Cash Daily", handle: "fastcash_daily", text: "Make $5,000 a day from home!!! 💸💸 Link in bio", color: "#7856ff" },
  { name: "Hugo M.", handle: "hugo_m", text: "Anyone got a good book for the holidays? Looking for sci-fi.", color: "#00ba7c" },
  { name: "Night Troll", handle: "troll_of_the_night", text: "Nobody asked for your opinion. Ratio + L + delete your account.", color: "#f91880" },
  { name: "Leo P.", handle: "leo_p", text: "Coffee, playlist, and off we go. ☕", img: "linear-gradient(160deg,#ff9a3c,#ff4f58 45%,#5b2a86)", color: "#1d9bf0" },
  { name: "Ines B.", handle: "ines_b", text: "New project goes live tomorrow, can't wait to show you!", color: "#ffad1f" },
];

const OWN_LIST = { id: "48ED2", ownerId: "me", name: "My block list", bannedUsers: [] };
const baseUser = { id: "me", enableAnimation: true, subscriptions: [], whiteListedUsers: [] };

async function openX(browser, { feed, data, sync = {}, local = {}, isBatchTab = false, batch = null }) {
  const page = await browser.newPage();
  page.on("pageerror", e => console.log("    PAGE ERROR:", e.message));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1.5 });
  await page.setRequestInterception(true);
  const html = xPage(feed);
  page.on("request", req => {
    const url = req.url();
    if (url === "https://x.com/home") return req.respond({ contentType: "text/html", body: html });
    if (url.startsWith("https://x.com/xb/")) return req.respond({ contentType: "text/css", body: fs.readFileSync(path.join(SRC, "css", url.split("/").pop())) });
    if (url.startsWith("https://x.com/xbext/")) return req.respond({ contentType: "image/png", body: fs.readFileSync(path.join(SRC, "..", url.slice("https://x.com/xbext/".length))) });
    if (/\/i\/api\/1\.1\/(blocks\/create|mutes\/users\/create)\.json/.test(url)) {
      const screenName = new URLSearchParams(req.postData() || "").get("screen_name");
      return req.respond({ contentType: "application/json", body: JSON.stringify({ screen_name: screenName, followers_count: 1000 + Math.round(Math.random() * 90000) }) });
    }
    if (url.startsWith("https://x.com/")) return req.respond({ status: 404, body: "" });
    req.continue();
  });
  await page.setCookie({ name: "ct0", value: "csrf-demo", domain: "x.com" });
  await page.evaluateOnNewDocument(cfg => {
    window.__sent = [];
    const store = { sync: { ...cfg.sync }, local: { ...cfg.local } };
    const changeListeners = [];
    const getMessage = (key, subs = []) => (cfg.messages[key]?.message || "").replace(/\$(\d)/g, (_, n) => subs[n - 1] ?? "");
    const area = name => ({
      get(keys, cb) {
        const list = keys == null ? Object.keys(store[name]) : typeof keys === "string" ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
        const res = {};
        list.forEach(k => { if (k in store[name]) res[k] = structuredClone(store[name][k]); });
        if (cb) setTimeout(() => cb(res), 0);
        return Promise.resolve(res);
      },
      set(items, cb) {
        const changes = {};
        for (const k in items) { changes[k] = { oldValue: store[name][k], newValue: structuredClone(items[k]) }; store[name][k] = structuredClone(items[k]); }
        setTimeout(() => changeListeners.forEach(fn => fn(changes, name)), 0);
        if (cb) setTimeout(cb, 0);
        return Promise.resolve();
      },
      remove(keys, cb) { [].concat(keys).forEach(k => delete store[name][k]); if (cb) setTimeout(cb, 0); return Promise.resolve(); },
    });
    const batch = cfg.batch;
    const handle = message => {
      switch (message.action) {
        case "loadInitialData": return { status: "success", data: cfg.data };
        case "isBatchTab": return { status: "success", isBatchTab: cfg.isBatchTab };
        case "loadBatchBlock": return { status: "success", batch: { lists: batch.lists.map(l => ({ ...l })), queue: batch.queue.slice(0, message.limit || 100), remaining: batch.queue.length } };
        case "recordBlocks":
          if (batch) message.blocks.forEach(b => {
            const i = batch.queue.findIndex(q => q.username === b.username);
            if (i < 0) return;
            batch.lists.forEach(l => { if (batch.queue[i].lists.includes(l.id)) l.done++; });
            batch.queue.splice(i, 1);
          });
          return { status: "success" };
        default: return { status: "success" };
      }
    };
    Object.defineProperty(window, "chrome", { configurable: true, value: {
      runtime: {
        lastError: null,
        onMessage: { addListener() {} },
        getURL: p => "https://x.com/xbext/" + p,
        sendMessage(message, cb) { window.__sent.push(message); const r = handle(message); setTimeout(() => cb && cb(r), 5); return Promise.resolve(r); },
      },
      i18n: { getMessage, getUILanguage: () => "en" },
      storage: { sync: area("sync"), local: area("local"), onChanged: { addListener: fn => changeListeners.push(fn) } },
    } });
  }, { messages, data, sync, local, isBatchTab, batch });

  await page.bringToFront();
  await page.goto("https://x.com/home", { waitUntil: "networkidle0" });
  // the manifest's content_scripts, in order; the batch pauses are shortened for the video
  for (const file of ["xapi.js", "content.js", "samurai.js", "observer.js", "batch.js"]) {
    let code = fs.readFileSync(path.join(SRC, "content", file), "utf8");
    if (file === "batch.js") code = code.replace("const BATCH_DELAY_MS = [6000, 10000];", "const BATCH_DELAY_MS = [450, 650];");
    await page.addScriptTag({ content: code });
  }
  await sleep(700);
  return page;
}

const blockBtn = (page, handle, cls = "block-user-icon") => page.evaluate((handle, cls) => {
  const article = [...document.querySelectorAll("article")].find(a => a.querySelector(`a[href="/${handle}"]`));
  const r = article.closest(".cell").querySelector(`.${cls}`).getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}, handle, cls);

// ---------- scenes ----------

const SCENES = {
  // One click on a post's block button: gone, and on your list
  async "x-instant"(browser) {
    const page = await openX(browser, { feed: FEED, data: { user: { ...baseUser, enableAnimation: false }, banlists: [OWN_LIST] } });
    const rec = new Recorder(page, "x-instant", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(900);
    await m.to(blockBtn(page, "fastcash_daily"), 900); await sleep(500);
    rec.mark("click1"); await m.click(); await sleep(1300);
    await m.to(blockBtn(page, "troll_of_the_night"), 800); await sleep(450);
    rec.mark("click2"); await m.click(); await sleep(1500);
    await m.moveTo(1180, 700, 700); await sleep(500);
    await rec.stop(); await page.close();
  },

  // Hold the button: the post cracks and explodes
  async "x-explode"(browser) {
    const page = await openX(browser, { feed: FEED, data: { user: baseUser, banlists: [OWN_LIST] }, sync: { xblock_block_animation: "explode" } });
    const rec = new Recorder(page, "x-explode", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(700);
    await m.to(blockBtn(page, "troll_of_the_night"), 900); await sleep(350);
    rec.mark("press"); await m.press(); await sleep(1150); await m.release(); rec.mark("boom");
    await sleep(2200);
    await rec.stop(); await page.close();
  },

  // Samurai: the post comes out, gets sliced, Done
  async "x-samurai"(browser) {
    const page = await openX(browser, { feed: FEED, data: { user: baseUser, banlists: [OWN_LIST] }, sync: { xblock_block_animation: "samurai" } });
    const rec = new Recorder(page, "x-samurai", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(700);
    await m.to(blockBtn(page, "troll_of_the_night"), 900); await sleep(300);
    rec.mark("click"); await m.click(); await sleep(900);
    const stage = await page.evaluate(() => { const r = document.querySelector(".xbs-stage").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const at = (fx, fy) => [stage.x + stage.w * fx, stage.y + stage.h * fy];
    const cuts = [[-0.15, 0.15, 1.15, 0.8], [0.4, -0.35, 0.58, 1.35], [1.15, 0.2, -0.15, 0.55], [0.15, 1.3, 0.8, -0.3], [-0.15, 0.6, 1.15, 0.35]];
    rec.mark("slice");
    for (const [x1, y1, x2, y2] of cuts) {
      const [ax, ay] = at(x1, y1), [bx, by] = at(x2, y2);
      await m.moveTo(ax, ay, 320); await sleep(60);
      await m.moveTo(bx, by, 120, p => p); await sleep(260);
    }
    await sleep(300);
    await m.to(center(page, ".xbs-done"), 650); await sleep(250);
    rec.mark("done"); await m.click(); await sleep(2000);
    await rec.stop(); await page.close();
  },

  // A share code in a post becomes a Subscribe button
  async "x-share"(browser) {
    const feed = [FEED[0], { name: "Léa Creates", handle: "lea_creates", verified: true, color: "#ff7a1a", text: "Tired of reply guys and crypto spam? I keep a block list of the worst ones.\nSubscribe with XBlock 👉 XBK-6061A", l: "3.2K" }, FEED[2], FEED[4]];
    const page = await openX(browser, { feed, data: { user: baseUser, banlists: [OWN_LIST] } });
    const rec = new Recorder(page, "x-share", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(1200);
    await m.to(center(page, ".button-not-subscribed"), 1000); await sleep(600);
    rec.mark("click"); await m.click(); await sleep(1600);
    await m.moveTo(1150, 660, 800); await sleep(500);
    await rec.stop(); await page.close();
  },

  // Subscribed lists in Blur / Hide / Block mode, then "show it" and "never block"
  async "x-modes"(browser) {
    const feed = [FEED[0], { name: "Rage Bait Daily", handle: "rage_bait_daily", text: "You won't BELIEVE what they said this time. Thread 🧵👇", color: "#e0245e" }, FEED[2],
      { name: "Moon Shill", handle: "moon_shill", text: "$MOON 100x incoming 🚀🚀", color: "#ffad1f" }, { name: "Bot 4242", handle: "bot_army_42", text: "follow back 100%", color: "#536471" }, FEED[4], FEED[5]];
    const data = {
      user: { ...baseUser, subscriptions: [{ blockListId: "6061A", mode: "blur" }, { blockListId: "5AE7F", mode: "hide" }, { blockListId: "DF8AC", mode: "autoblock" }] },
      banlists: [OWN_LIST,
        { id: "6061A", ownerId: "lea", name: "Political spam", bannedUsers: ["rage_bait_daily"] },
        { id: "5AE7F", ownerId: "tom", name: "Crypto scams", bannedUsers: ["moon_shill"] },
        { id: "DF8AC", ownerId: "nora", name: "Bot farm", bannedUsers: ["bot_army_42"] }],
    };
    const page = await openX(browser, { feed, data });
    const rec = new Recorder(page, "x-modes", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(2600);
    rec.mark("reveal");
    await m.to(blockBtn(page, "rage_bait_daily", "blocked-user-icon-indicator"), 1000); await sleep(500);
    await m.click(); await sleep(1300);
    rec.mark("shield");
    await m.to(blockBtn(page, "rage_bait_daily", "whitelist-user-icon"), 800); await sleep(450);
    await m.click(); await sleep(1600);
    await rec.stop(); await page.close();
  },

  // The batch window: blocks every account on your lists, most followed first
  async "x-batch"(browser) {
    const names = [["crypto_king99", 2100000, "5AE7F"], ["promo_flash", 980000, "6061A"], ["rage_bait_daily", 412000, "6061A"], ["bot_army_42", 156000, "5AE7F"], ["spam_deals", 52300, "5AE7F"],
      ["troll_of_the_night", 12000, "6061A"], ["fake_news_24", 8400, "6061A"], ["reply_guy_3000", 3100, "6061A"], ["giveaway_free", 2400, "5AE7F"], ["link_in_bio", 950, "5AE7F"], ["bot_8812", 410, "5AE7F"], ["user5512093", 180, "6061A"]];
    const batch = { lists: [{ id: "6061A", name: "Political spam", total: 412, done: 118 }, { id: "5AE7F", name: "Crypto scams", total: 1218, done: 64 }],
      queue: [...names, ...Array.from({ length: 40 }, (_, i) => [`spam_bot_${4100 + i * 37}`, 300 - i * 5, i % 2 ? "6061A" : "5AE7F"])]
        .map(([username, followersCount, list]) => ({ username, followersCount, lists: [list] })) };
    const page = await openX(browser, { feed: FEED, data: { user: baseUser, banlists: [OWN_LIST] }, isBatchTab: true, local: { xblockBatch: { running: true } }, batch });
    const rec = new Recorder(page, "x-batch", { w: 1280, h: 720 });
    await rec.start();
    const m = new Mouse(page, rec, 1150, 690); await m.place(1150, 690);
    await sleep(5200);
    rec.mark("minimize");
    await m.to(page.evaluate(() => {
      const r = document.querySelector("#xblock-batch-overlay").shadowRoot.querySelector('[data-action="minimize"]').getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }), 900);
    await sleep(300); await m.click(); await sleep(2200);
    await rec.stop(); await page.close();
  },
};

// ---------- popup scenes (real extension, local server) ----------

async function openPopup() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, enableExtensions: true, args: ["--lang=en", "--force-device-scale-factor=2"], env: { ...process.env, LANGUAGE: "en" } });
  const id = await browser.installExtension(DIST);
  const page = await browser.newPage();
  page.on("pageerror", e => console.log("    PAGE ERROR:", e.message));
  page.on("dialog", d => d.dismiss());
  await page.setViewport({ width: 700, height: 590, deviceScaleFactor: 2 });
  await page.goto(`chrome-extension://${id}/popup.html`);
  await sleep(2500);
  await page.evaluate(async () => {
    const send = msg => new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));
    const { data } = await send({ action: "loadInitialData" });
    const own = data.banlists.find(b => b.ownerId === data.user.id);
    await send({ action: "blockListUpdate", id: own.id, data: { name: "Jb's block list" } });
    await send({ action: "addUsersToBanlist", banlistId: own.id, userIds: ["troll_of_the_night", "fastcash_daily", "crypto_king99", "rage_bait_daily", "bot_army_42", "promo_flash", "reply_guy_3000"] });
    await send({ action: "addUsersToWhitelist", userIds: ["emma_r", "hugo_m", "ines_b"] });
    await send({ action: "subscribeToBanlist", banlistId: "6061A", mode: "autoblock" });
    await send({ action: "reportObservedAccounts", accounts: [["troll_of_the_night", 12000], ["fastcash_daily", 84000], ["crypto_king99", 2100000], ["rage_bait_daily", 412000], ["bot_army_42", 156000], ["promo_flash", 980000], ["reply_guy_3000", 3100]].map(([username, followersCount]) => ({ username, followersCount })) });
    localStorage.clear();
  });
  await page.reload();
  await sleep(3500);
  return { browser, page };
}

const POPUP = { w: 700, h: 590 };
const POPUP_SCENES = {
  async "popup-home"(page) {
    const rec = new Recorder(page, "popup-home", POPUP); await rec.start();
    const m = new Mouse(page, rec, 640, 560); await m.place(640, 560);
    await sleep(1500);
    rec.mark("scroll");
    for (let y = 0; y <= 330; y += 6) { await page.evaluate(y => document.querySelector(".tab-content").scrollTo(0, y), y); await sleep(12); }
    await sleep(700);
    rec.mark("animation");
    await m.to(center(page, 'label[for="blockAnimationSamurai"]'), 800); await sleep(300); await m.click(); await sleep(1000);
    rec.mark("xaction");
    await m.to(center(page, 'label[for="xActionMute"]'), 800); await sleep(300); await m.click(); await sleep(1300);
    await m.to(center(page, 'label[for="xActionBlock"]'), 700); await sleep(300); await m.click(); await sleep(1200);
    await rec.stop();
  },
  async "popup-list"(page) {
    await page.evaluate(() => document.querySelector(".tab-content").scrollTo(0, 0));
    const rec = new Recorder(page, "popup-list", POPUP); await rec.start();
    const m = new Mouse(page, rec, 400, 300); await m.place(400, 300);
    await sleep(700);
    rec.mark("copy");
    await m.to(center(page, "#blockListCodeInput"), 900); await sleep(300); await m.click(); await sleep(1300);
    rec.mark("tab");
    await m.to(center(page, '.stat[data-goto="tab_blocked_users"]'), 900); await sleep(250); await m.click(); await sleep(1300);
    rec.mark("search");
    await m.to(center(page, "#blockedUsersSearchInput"), 700); await m.click(); await sleep(200);
    await page.keyboard.type("troll", { delay: 110 }); await sleep(1200);
    for (let i = 0; i < 5; i++) { await page.keyboard.press("Backspace"); await sleep(60); }
    await sleep(800);
    await rec.stop();
  },
  async "popup-subscribe"(page) {
    await page.click('.footer-tab-btn[data-tab="tab3"]'); await sleep(800);
    const rec = new Recorder(page, "popup-subscribe", POPUP); await rec.start();
    const m = new Mouse(page, rec, 400, 400); await m.place(400, 400);
    await sleep(800);
    rec.mark("type");
    await m.to(center(page, "#subscribeCodeInput"), 800); await m.click(); await sleep(200);
    await page.keyboard.type("XBK-5AE7F", { delay: 95 }); await sleep(400);
    await m.to(center(page, "#addSubscribeBtn"), 500); await sleep(200); rec.mark("add"); await m.click(); await sleep(1600);
    rec.mark("mode");
    const select = '#blocklistsTable tr[data-banlist-id="5AE7F"] .banlist-mode-select';
    await m.to(center(page, select), 800); await sleep(300); await m.click(60); await page.keyboard.press("Escape");
    await page.select(select, "automute"); await sleep(1300);
    rec.mark("browse");
    await m.to(center(page, '#blocklistsTable tr[data-banlist-id="6061A"] .browse-list-link'), 900); await sleep(200); await m.click(); await sleep(1700);
    rec.mark("shield");
    await m.to(center(page, "#listBrowserTable .toggle-whitelist-btn", 2), 900); await sleep(300); await m.click(); await sleep(1500);
    await m.to(center(page, "#listBrowserBackBtn"), 800); await sleep(200); await m.click(); await sleep(1000);
    await rec.stop();
  },
  async "popup-batch"(page) {
    const rec = new Recorder(page, "popup-batch", POPUP); await rec.start();
    const m = new Mouse(page, rec, 300, 450); await m.place(300, 450);
    await sleep(800);
    await m.to(center(page, "#batchBlockBtn"), 1000); await sleep(1400);
    rec.mark("click"); await m.click(); await sleep(900); // the confirm dialog is dismissed: the batch window is the x-batch clip
    await rec.stop();
  },
  async "popup-sync"(page) {
    await page.evaluate(() => { localStorage.removeItem("syncCardHidden"); document.getElementById("syncCard").style.display = ""; });
    await page.click('.footer-tab-btn[data-tab="tab1"]'); await sleep(600);
    const rec = new Recorder(page, "popup-sync", POPUP); await rec.start();
    const m = new Mouse(page, rec, 500, 450); await m.place(500, 450);
    await sleep(700);
    await m.to(center(page, "#syncCard .openXBlockListPageBtn"), 1000); await sleep(1800);
    await rec.stop();
  },
};

(async () => {
  const only = process.argv.slice(2);
  const wanted = name => only.length === 0 || only.some(o => name.startsWith(o));
  fs.mkdirSync(OUT, { recursive: true });

  const xScenes = Object.keys(SCENES).filter(wanted);
  if (xScenes.length) {
    // one browser per scene: after a page closes, headless Chrome stops painting the next one
    for (const name of xScenes) {
      console.log("scene", name);
      const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--force-device-scale-factor=1.5"] });
      await SCENES[name](browser);
      await browser.close();
    }
  }
  const popupScenes = Object.keys(POPUP_SCENES).filter(wanted);
  if (popupScenes.length) {
    const { browser, page } = await openPopup();
    for (const name of popupScenes) { console.log("scene", name); await POPUP_SCENES[name](page); }
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
