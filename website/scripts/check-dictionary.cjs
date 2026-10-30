// Checks a translated dictionary against the English one: same shape (keys, array
// lengths), and in every string the same {placeholders}, the same inline markup
// (**bold**, ==accent==, `code`, [links](…)) and the same link targets.
//
// Usage: node scripts/check-dictionary.cjs fr [es de …]   (no argument: every language)
const fs = require("fs")
const path = require("path")
const ts = require("typescript")

const DIR = path.join(__dirname, "..", "lib", "dictionaries")

function load(code) {
  const file = path.join(DIR, `${code}.ts`)
  const out = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  new Function("module", "exports", "require", out)(module, module.exports, () => ({}))
  const value = module.exports[code === "en" ? "en" : code]
  if (!value) throw new Error(`${file} must export const ${code}`)
  return value
}

const count = (s, re) => (s.match(re) || []).length
function signature(s) {
  return {
    placeholders: (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join(" "),
    bold: count(s, /\*\*/g),
    accent: count(s, /==/g),
    code: count(s, /`/g),
    links: (s.match(/\]\(([^)]+)\)/g) || []).sort().join(" "),
  }
}

function compare(en, other, where, problems) {
  if (typeof en === "string") {
    if (typeof other !== "string") return problems.push(`${where}: expected a string`)
    // Empty in English on purpose, checked on its own below
    if (where.endsWith(".translationNote")) return
    if (en.trim() && !other.trim()) problems.push(`${where}: empty translation`)
    const a = signature(en), b = signature(other)
    for (const k of Object.keys(a)) if (a[k] !== b[k]) problems.push(`${where}: ${k} differ, English has "${a[k]}", translation has "${b[k]}"`)
    return
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(other)) return problems.push(`${where}: expected an array`)
    if (en.length !== other.length) problems.push(`${where}: ${en.length} items in English, ${other.length} here`)
    en.forEach((item, i) => other[i] !== undefined && compare(item, other[i], `${where}[${i}]`, problems))
    return
  }
  for (const key of Object.keys(en)) {
    if (!(key in other)) problems.push(`${where}.${key}: missing`)
    else compare(en[key], other[key], `${where}.${key}`, problems)
  }
  for (const key of Object.keys(other)) if (!(key in en)) problems.push(`${where}.${key}: not in English`)
}

const en = load("en")
const codes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(DIR).filter((f) => /^[a-z]{2}\.ts$/.test(f) && f !== "en.ts").map((f) => f.slice(0, 2))
let failed = false
for (const code of codes) {
  const problems = []
  compare(en, load(code), code, problems)
  // English only, by design: the policy's note sits above translations
  if (!load(code).privacyPage.translationNote.trim()) problems.push(`${code}.privacyPage.translationNote: must say the English policy is the reference`)
  console.log(problems.length ? `${code}: ${problems.length} problem(s)\n  ${problems.join("\n  ")}` : `${code}: ok`)
  failed ||= problems.length > 0
}
process.exit(failed ? 1 : 0)
