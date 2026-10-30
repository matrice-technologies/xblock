import Link from "next/link"

import { LINKS } from "@/lib/site"
import { XBlockLogo } from "@/components/site/logo"

const columns = [
  {
    title: "Product",
    items: [
      ["Try it", "/#try"],
      ["Features", "/#features"],
      ["Walkthrough video", "/#watch"],
      ["FAQ", "/#faq"],
      ["Chrome Web Store", LINKS.chromeStore],
    ],
  },
  {
    title: "Open source",
    items: [
      ["Source code", LINKS.github],
      ["Self-host the server", LINKS.selfHost],
      ["Report a bug", LINKS.issues],
      ["MIT License", LINKS.license],
    ],
  },
  {
    title: "About",
    items: [
      ["Privacy policy", "/privacy"],
      ["Contact", `mailto:${LINKS.email}`],
      ["Buy us a coffee", LINKS.coffee],
      ["Matrice Technologies", LINKS.matrice],
    ],
  },
]

function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1400px] border-x px-4 sm:px-6 lg:px-10">
      <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <XBlockLogo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Block trolls, bots and spam on X in one click, and share your block
            lists. Free and open source.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
            <p className="font-heading text-xs tracking-[0.14em] uppercase">{column.title}</p>
            {column.items.map(([label, href]) => (
              <Link key={label} href={href} className="text-sm text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t py-6 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        <span>
          © 2026 XBlock · Made by{" "}
          <a href={LINKS.matrice} className="hover:text-foreground">
            Matrice Technologies
          </a>
        </span>
        <span>Not affiliated with X Corp. · Press D for dark mode</span>
      </div>
    </footer>
  )
}

export { SiteFooter }
