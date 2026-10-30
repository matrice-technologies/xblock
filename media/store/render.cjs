// Renders the Chrome Web Store images for every language from the website's
// store frames (website/app/[lang]/store/[frame]) into media/store/<lang>/.
//
// Usage, with the website running (npm run website, or the deployed site):
//   node media/store/render.cjs [baseUrl] [lang ...]
// Needs puppeteer-core (NODE_PATH or a local install), Chrome, and Python with
// Pillow: the store wants 24-bit PNGs without alpha, which Chrome doesn't write.
const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")
const puppeteer = require("puppeteer-core")

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "")
const LANGS = process.argv.slice(3).length ? process.argv.slice(3) : ["en", "fr", "es", "de", "ja", "pt", "id"]
const FRAMES = {
  "screenshot-1": [1280, 800],
  "screenshot-2": [1280, 800],
  "screenshot-3": [1280, 800],
  "screenshot-4": [1280, 800],
  "screenshot-5": [1280, 800],
  "promo-small": [440, 280],
  "promo-marquee": [1400, 560],
}
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage()
  page.on("pageerror", (e) => console.log("  page error:", e.message))
  const written = []
  for (const lang of LANGS) {
    const dir = path.join(__dirname, lang)
    fs.mkdirSync(dir, { recursive: true })
    for (const [frame, [width, height]] of Object.entries(FRAMES)) {
      await page.setViewport({ width, height, deviceScaleFactor: 1 })
      await page.goto(`${BASE}/${lang}/store/${frame}`, { waitUntil: "networkidle0" })
      // No dev-mode badge in the pictures
      await page.addStyleTag({ content: "nextjs-portal { display: none !important }" })
      await page.evaluate(() => document.fonts.ready)
      if (frame === "screenshot-1") {
        // The troll's post, a split second after it blows
        await wait(600)
        await page.evaluate(() => window.__storeAction())
        await wait(170)
      } else if (frame === "screenshot-2" || frame === "promo-marquee") {
        // The Samurai post in four pieces, before it falls
        await page.waitForFunction(() => document.querySelectorAll(".xbs-piece").length >= 4, { timeout: 20000, polling: "raf" })
        await wait(110)
      } else {
        await wait(1400)
      }
      const file = path.join(dir, `${frame}.png`)
      await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height } })
      written.push(file)
      console.log(`${lang}/${frame}.png`)
    }
  }
  await browser.close()

  // RGBA → RGB, as the store asks
  execFileSync("python", ["-c", "import sys\nfrom PIL import Image\nfor f in sys.argv[1:]:\n    Image.open(f).convert('RGB').save(f, optimize=True)", ...written], { stdio: "inherit" })
  console.log(`${written.length} images, 24-bit RGB`)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
