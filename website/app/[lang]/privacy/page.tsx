import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LINKS } from "@/lib/site"
import { fill, HTML_LANG, isLocale, LOCALES } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { Rich } from "@/components/site/rich"
import { Eyebrow } from "@/components/site/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = await getDictionary(lang)
  return {
    title: t.privacyPage.metaTitle,
    description: t.privacyPage.metaDescription,
    alternates: {
      canonical: `/${lang}/privacy`,
      languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `/${l}/privacy`])),
    },
  }
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = await getDictionary(lang)
  const p = t.privacyPage
  const links = { github: LINKS.github, email: LINKS.email, selfHost: LINKS.selfHost }
  const rich = (text: string) => <Rich text={fill(text, links)} bold="font-semibold text-foreground" link="" />

  return (
    <div className="min-h-svh">
      <SiteHeader lang={lang} t={t.nav} />
      <main className="mx-auto max-w-[1400px] border-x">
        <div className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.03em]">{p.title}</h1>
          <p className="mt-5 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {fill(p.updated, { date: p.date })}
          </p>
        </div>

        <div className="grid lg:grid-cols-[5rem_minmax(0,1fr)_5rem]">
          <div className="hidden border-r bg-hatch lg:block" aria-hidden="true" />
          <article className="prose-x max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
            {p.translationNote ? (
              <p className="border-l-2 border-brand pl-4 text-sm text-muted-foreground">{rich(p.translationNote)}</p>
            ) : null}
            {p.sections.map((section, i) => (
              <section key={i} className="contents">
                {section.heading ? <h2>{section.heading}</h2> : null}
                {section.paragraphs.map((text, j) => (
                  <p key={j}>{rich(text)}</p>
                ))}
                {section.list.length ? (
                  <ul>
                    {section.list.map((text, j) => (
                      <li key={j}>{rich(text)}</li>
                    ))}
                  </ul>
                ) : null}
                {section.after.map((text, j) => (
                  <p key={j}>{rich(text)}</p>
                ))}
              </section>
            ))}
          </article>
          <div className="hidden border-l bg-hatch lg:block" aria-hidden="true" />
        </div>
      </main>
      <div className="border-t">
        <SiteFooter lang={lang} t={t.footer} nav={t.nav} />
      </div>
    </div>
  )
}
