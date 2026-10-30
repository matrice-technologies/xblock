import Link from "next/link"

import { LINKS } from "@/lib/site"
import type { Locale } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { XBlockLogo } from "@/components/site/logo"

function SiteFooter({ lang, t, nav }: { lang: Locale; t: Dict["footer"]; nav: Dict["nav"] }) {
  const columns = [
    {
      title: t.product,
      items: [
        [nav.try, `/${lang}#try`],
        [nav.features, `/${lang}#features`],
        [t.walkthrough, `/${lang}#watch`],
        [nav.faq, `/${lang}#faq`],
        [t.store, LINKS.chromeStore],
      ],
    },
    {
      title: t.openSource,
      items: [
        [t.source, LINKS.github],
        [t.selfHost, LINKS.selfHost],
        [t.bug, LINKS.issues],
        [t.license, LINKS.license],
      ],
    },
    {
      title: t.about,
      items: [
        [t.privacy, `/${lang}/privacy`],
        [t.contact, `mailto:${LINKS.email}`],
        [t.coffee, LINKS.coffee],
        ["Matrice Technologies", LINKS.matrice],
      ],
    },
  ]

  return (
    <footer className="mx-auto max-w-[1400px] border-x px-4 sm:px-6 lg:px-10">
      <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <XBlockLogo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.tagline}</p>
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
          © 2026 XBlock · {t.madeBy}{" "}
          <a href={LINKS.matrice} className="hover:text-foreground">
            Matrice Technologies
          </a>
        </span>
        <span>
          {t.notAffiliated} · {t.pressD}
        </span>
      </div>
    </footer>
  )
}

export { SiteFooter }
