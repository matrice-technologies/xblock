// Usage (from the repo root): node media/walkthrough/render.js [out.mp4] [--stills t1,t2,…]
// Needs Chrome, ffmpeg and the clips from capture.js (CLIPS_DIR, default media/walkthrough/clips).
//
// Renders compose.html frame by frame at 30 fps (each frame: renderAt(i / 30), awaited until the
// clip images are decoded), piped into ffmpeg. --stills saves PNGs at the given times instead.
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const FPS = 30;
const CLIPS = process.env.CLIPS_DIR || path.join(__dirname, "clips");
const args = process.argv.slice(2);
const stillsArg = args.indexOf("--stills");
const stills = stillsArg >= 0 ? args[stillsArg + 1].split(",").map(Number) : null;
const OUT = args.find(a => a.endsWith(".mp4")) || path.join(__dirname, "xblock-walkthrough.mp4");

(async () => {
  const clips = {};
  for (const name of fs.readdirSync(CLIPS)) {
    const file = path.join(CLIPS, name, "clip.json");
    if (fs.existsSync(file)) clips[name] = JSON.parse(fs.readFileSync(file, "utf8"));
  }
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  page.on("pageerror", e => console.log("PAGE ERROR:", e.message));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(pathToFileURL(path.join(__dirname, "compose.html")).href, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate((clips, base) => setup(clips, base), clips, pathToFileURL(CLIPS).href);
  console.log(`duration ${duration.toFixed(1)} s`);

  if (stills) {
    for (const t of stills) {
      await page.evaluate(t => renderAt(t), t);
      await page.screenshot({ path: path.join(CLIPS, "..", `still-${t}.png`) });
    }
    await browser.close();
    return console.log("stills saved next to the clips folder");
  }

  const cdp = await page.createCDPSession();
  const ffmpeg = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-vf", "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-r", String(FPS), "-movflags", "+faststart", OUT,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((resolve, reject) => ffmpeg.on("close", code => (code === 0 ? resolve() : reject(new Error("ffmpeg exited " + code)))));
  const frames = Math.round(duration * FPS), started = Date.now();
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => renderAt(t), i / FPS);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 94, optimizeForSpeed: true });
    if (!ffmpeg.stdin.write(Buffer.from(data, "base64"))) await new Promise(r => ffmpeg.stdin.once("drain", r));
    if (i % 300 === 0) console.log(`frame ${i}/${frames} (${((Date.now() - started) / 1000).toFixed(0)} s)`);
  }
  ffmpeg.stdin.end();
  await done;
  await browser.close();
  console.log(`done: ${frames} frames → ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
