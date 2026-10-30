// Usage (from the repo root): npm i --no-save puppeteer-core && node media/promo/record.js
// Needs Chrome and ffmpeg installed. CHROME_PATH overrides the Chrome location.
//
// Records xblock-promo.html frame by frame at an exact 60 fps: each frame renders renderAt(i / 60),
// is captured, and piped into ffmpeg (H.264, yuv420p) — no real-time capture, so no dropped frames.
const { spawn } = require("child_process");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const FPS = 60;
const PAGE = pathToFileURL(path.join(__dirname, "xblock-promo.html")).href + "?capture=1";
const OUT = process.argv[2] || path.join(__dirname, "xblock-promo.mp4");

(async () => {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(PAGE, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);
  const cdp = await page.createCDPSession();

  const ffmpeg = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-vf", "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-r", String(FPS), "-movflags", "+faststart", OUT,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((resolve, reject) => ffmpeg.on("close", code => (code === 0 ? resolve() : reject(new Error("ffmpeg exited " + code)))));

  const started = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => renderAt(t), i / FPS);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, optimizeForSpeed: true });
    if (!ffmpeg.stdin.write(Buffer.from(data, "base64"))) await new Promise(r => ffmpeg.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`frame ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  }
  ffmpeg.stdin.end();
  await done;
  await browser.close();
  console.log(`done: ${frames} frames, ${duration} s @ ${FPS} fps in ${((Date.now() - started) / 1000).toFixed(0)} s → ${OUT}`);
  console.log("page errors:", errors.length ? errors : "none");
})().catch(e => { console.error(e); process.exit(1); });
