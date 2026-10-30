/** Where the site points to. One place, so a move (a new repo, a store ID) is one edit. */
export const LINKS = {
  chromeStore:
    "https://chromewebstore.google.com/detail/xblock/mabmaplbljlpcabbdioomjilodkhaajj",
  github: "https://github.com/matrice-technologies/xblock",
  issues: "https://github.com/matrice-technologies/xblock/issues",
  selfHost:
    "https://github.com/matrice-technologies/xblock/blob/main/DEPLOY.md",
  license: "https://github.com/matrice-technologies/xblock/blob/main/LICENSE",
  coffee: "https://buymeacoffee.com/jbcollet",
  matrice: "https://matricetechnologies.com",
  email: "xblock.extension@gmail.com",
} as const

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://xblock.matricetechnologies.com"
