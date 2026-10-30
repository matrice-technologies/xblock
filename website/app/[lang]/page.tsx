import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRightIcon, BanIcon, VolumeXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { LINKS } from "@/lib/site"
import { fill, isLocale } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { buttonVariants } from "@/components/ui/button"
import { BatchDemo } from "@/components/demo/batch-demo"
import { HeroSamurai } from "@/components/demo/hero-samurai"
import { LanguageDemo } from "@/components/demo/language-demo"
import { ModesDemo } from "@/components/demo/modes-demo"
import { Playground } from "@/components/demo/playground"
import { ShareDemo } from "@/components/demo/share-demo"
import { AsciiField } from "@/components/site/ascii-field"
import { ChromeIcon, GitHubIcon } from "@/components/site/brand-icons"
import { Faq } from "@/components/site/faq"
import { Rich } from "@/components/site/rich"
import { RiseWords } from "@/components/site/rise-words"
import {
  Eyebrow,
  FigureSection,
  LabelStrip,
  ModuleRow,
  ModuleSection,
  SectionHeading,
} from "@/components/site/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

/** The band under the hero: accounts going, one after another. */
const TICKER: [string, "block" | "mute"][] = [
  ["crypto_king99", "block"],
  ["promo_flash", "mute"],
  ["rage_bait_daily", "block"],
  ["bot_army_42", "block"],
  ["spam_deals", "mute"],
  ["troll_of_the_night", "block"],
  ["fake_news_24", "block"],
  ["giveaway_free", "mute"],
  ["reply_guy_3000", "block"],
  ["link_in_bio", "mute"],
]

/** When a block of the hero rises in, in seconds (globals.css, .rise). */
const rise = (delay: number) => ({ "--rise-delay": `${delay}s` }) as React.CSSProperties

function Ticker({ blocked, muted }: { blocked: string; muted: string }) {
  const row = TICKER.map(([handle, how]) => (
    <span key={handle} className="flex shrink-0 items-center gap-2 px-6 font-heading text-[12px] tracking-[0.06em]">
      {how === "block" ? (
        <BanIcon className="size-3.5 text-block" aria-hidden="true" />
      ) : (
        <VolumeXIcon className="size-3.5 text-mute" aria-hidden="true" />
      )}
      <span className="text-foreground">@{handle}</span>
      <span className="text-muted-foreground uppercase">{how === "block" ? blocked : muted}</span>
    </span>
  ))
  return (
    <div className="overflow-hidden border-b bg-muted/40 py-3.5" aria-hidden="true">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  )
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const t = await getDictionary(lang)

  return (
    <div className="min-h-svh">
      <SiteHeader lang={lang} t={t.nav} />

      <main>
        {/* Hero: the Samurai stage, always dark, beside the pitch. From lg up
            it fills the screen under the header and above the ticker. */}
        <section className="dark relative isolate overflow-hidden border-b bg-background text-foreground lg:min-h-[calc(100svh-4rem-1px-3.25rem)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(120,8,28,0.5)_0%,rgba(40,6,14,0.35)_35%,transparent_70%)]"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-stems" aria-hidden="true" />
          {/* Three blocks: on a phone the stage comes right after the headline;
              from lg up it takes the right column beside both text blocks. */}
          <div className="relative z-10 mx-auto grid max-w-[1400px] gap-y-4 px-4 pt-14 pb-10 sm:px-6 lg:min-h-[inherit] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-[1fr_1fr] lg:gap-x-8 lg:gap-y-0 lg:px-10 lg:py-12">
            <div className="flex flex-col items-start lg:col-start-1 lg:row-start-1 lg:justify-end">
              <div className="rise" style={rise(0.1)}>
                <Eyebrow>{t.hero.eyebrow}</Eyebrow>
              </div>
              <h1 className="mt-6 text-[clamp(2.3rem,5.4vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.035em]">
                <RiseWords text={t.hero.titleA} start={0.25} />
                {lang === "ja" ? null : " "}
                <RiseWords text={t.hero.titleB} start={0.4} className="text-block" />
              </h1>
            </div>
            <div className="rise self-center lg:col-start-2 lg:row-span-2 lg:row-start-1" style={rise(0.5)}>
              <HeroSamurai t={t.stage} verifiedLabel={t.x.verified} />
            </div>
            <div className="flex flex-col items-start lg:col-start-1 lg:row-start-2">
              <p className="rise max-w-xl text-lg leading-relaxed text-muted-foreground lg:mt-6" style={rise(0.75)}>
                {t.hero.lead}
              </p>
              <div className="rise mt-10 flex flex-wrap gap-3" style={rise(0.9)}>
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  {t.hero.cta}
                </a>
                <Link href="#try" className={buttonVariants({ variant: "frame", size: "cta" })}>
                  {t.hero.try}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>
              <p className="rise mt-8 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase" style={rise(1.05)}>
                {t.hero.meta}
              </p>
            </div>
          </div>
        </section>

        <Ticker blocked={t.ticker.blocked} muted={t.ticker.muted} />

        <div className="mx-auto max-w-[1400px] border-x">
          {/* The playground */}
          <FigureSection
            id="try"
            label={t.try.label}
            count={t.try.count}
            eyebrow={t.try.eyebrow}
            title={<Rich text={t.try.title} />}
            lead={
              <p>
                <Rich text={t.try.lead} bold="font-medium text-foreground" />
              </p>
            }
            note={t.try.note}
            className="px-0 py-0 sm:px-0 sm:py-0 lg:px-0"
          >
            <Playground t={t.playground} x={t.x} samurai={t.samurai} />
          </FigureSection>

          {/* Features */}
          <ModuleSection id="features" label={t.features.label} count={t.features.count} lead={t.features.lead} rest={t.features.rest}>
            <ModuleRow kicker={t.features.shareKicker} title={t.features.shareTitle} diagram={<ShareDemo t={t.share} lang={lang} />}>
              <p>
                <Rich text={t.features.shareBody} />
              </p>
            </ModuleRow>
            <ModuleRow kicker={t.features.modesKicker} title={t.features.modesTitle} diagram={<ModesDemo t={t.modes} lang={lang} />}>
              <p>
                <Rich text={t.features.modesBody} />
              </p>
            </ModuleRow>
            <ModuleRow kicker={t.features.batchKicker} title={t.features.batchTitle} diagram={<BatchDemo t={t.batch} lang={lang} />}>
              <p>
                <Rich text={t.features.batchBody} />
              </p>
            </ModuleRow>
            <ModuleRow kicker={t.features.languageKicker} title={t.features.languageTitle} diagram={<LanguageDemo added={t.language.added} />}>
              <p>
                <Rich text={t.features.languageBody} />
              </p>
            </ModuleRow>
          </ModuleSection>

          {/* Walkthrough video */}
          <FigureSection
            id="watch"
            label={t.watch.label}
            count={t.watch.count}
            eyebrow={t.watch.eyebrow}
            title={t.watch.title}
            lead={<p>{t.watch.lead}</p>}
          >
            <div className="border bg-black p-1.5 sm:p-2">
              <video
                className="block aspect-video w-full"
                src="/media/walkthrough.mp4"
                poster="/media/walkthrough-poster.jpg"
                controls
                preload="none"
                playsInline
              >
                <track kind="captions" />
              </video>
            </div>
          </FigureSection>

          {/* How it works */}
          <section aria-labelledby="how-title">
            <SectionHeading id="how" eyebrow={t.how.eyebrow} title={<span id="how-title">{t.how.title}</span>} />
            <ol className="grid border-b md:grid-cols-3">
              {t.how.steps.map((step, index) => (
                <li
                  key={step.label}
                  className={cn("flex flex-col gap-3 px-4 py-10 sm:px-6 lg:px-10", index > 0 && "border-t md:border-t-0 md:border-l")}
                >
                  <span className="font-heading text-xs tracking-[0.14em] text-brand uppercase">{step.label}</span>
                  <h3 className="text-2xl font-medium tracking-[-0.01em]">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Privacy */}
          <section aria-labelledby="privacy-title">
            <SectionHeading
              id="privacy"
              eyebrow={t.privacy.eyebrow}
              title={<span id="privacy-title">{t.privacy.title}</span>}
            >
              {t.privacy.lead}
            </SectionHeading>
            <div className="grid border-b lg:grid-cols-[1.5fr_1fr]">
              <div className="grid sm:grid-cols-2">
                {t.privacy.parts.map((part, index) => (
                  <div
                    key={part.title}
                    className={cn("flex flex-col gap-3 border-b px-4 py-8 sm:px-6 lg:px-10", index % 2 === 1 && "sm:border-l")}
                  >
                    <p className="font-heading text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{part.label}</p>
                    <h3 className="text-lg font-semibold tracking-[0.02em]">{part.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{part.body}</p>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3 px-4 py-6 font-heading text-xs tracking-[0.08em] uppercase sm:col-span-2 sm:px-6 lg:px-10">
                  <span className="border px-3 py-2">{t.privacy.flowKey}</span>
                  <ArrowRightIcon className="size-4 text-brand" aria-hidden="true" />
                  <span className="border border-foreground bg-foreground px-3 py-2 text-background">HMAC-SHA256</span>
                  <ArrowRightIcon className="size-4 text-brand" aria-hidden="true" />
                  <span className="border px-3 py-2">{t.privacy.flowId}</span>
                </div>
              </div>
              <div className="flex flex-col border-t lg:border-t-0 lg:border-l">
                <div className="border-b px-4 py-8 sm:px-6 lg:px-10">
                  <p className="font-heading text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{t.privacy.serverLabel}</p>
                  <h3 className="mt-3 text-lg font-semibold tracking-[0.02em]">{t.privacy.serverTitle}</h3>
                </div>
                <dl className="divide-y border-b">
                  {t.privacy.stored.map((row) => (
                    <div key={row.what} className="grid gap-1 px-4 py-4 sm:px-6 lg:px-10">
                      <dt className="font-heading text-sm text-brand">{row.what}</dt>
                      <dd className="text-sm text-muted-foreground">{row.why}</dd>
                    </div>
                  ))}
                </dl>
                <p className="px-4 py-6 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-10">
                  <Rich
                    text={fill(t.privacy.details, { privacyHref: `/${lang}/privacy` })}
                    link="text-foreground underline underline-offset-4 hover:text-brand"
                  />
                </p>
              </div>
            </div>
          </section>

          {/* Open source */}
          <section id="open-source" aria-labelledby="oss-title" className="scroll-mt-16 border-b">
            <LabelStrip label={t.oss.label} count={t.oss.count} />
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
                <Eyebrow>{t.oss.eyebrow}</Eyebrow>
                <h2 id="oss-title" className="max-w-xl text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.02em]">
                  {t.oss.title}
                </h2>
                <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">{t.oss.body}</p>
                <div className="flex flex-wrap gap-3">
                  <a href={LINKS.github} className={buttonVariants({ variant: "default", size: "cta" })}>
                    <GitHubIcon className="size-4" />
                    {t.oss.github}
                  </a>
                  <a href={LINKS.selfHost} className={buttonVariants({ variant: "frame", size: "cta" })}>
                    {t.oss.selfHost}
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </div>
                <ul className="mt-2 flex flex-wrap gap-2 font-heading text-[11px] tracking-[0.08em] uppercase" aria-label={t.oss.builtWith}>
                  {["Chrome MV3", "Express", "Prisma", "SQLite", "Docker"].map((tech) => (
                    <li key={tech} className="border px-2.5 py-1 text-muted-foreground">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex min-w-0 items-center border-t bg-dots px-4 py-12 sm:px-8 lg:border-t-0 lg:border-l">
                <figure className="w-full min-w-0 border bg-background">
                  <figcaption className="flex items-center justify-between border-b px-4 py-2.5 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    <span>{t.oss.ownServer}</span>
                    <span>bash</span>
                  </figcaption>
                  <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
                    <code>
                      <span className="text-muted-foreground">{t.oss.commentApi}</span>
                      {"\n"}git clone {LINKS.github}
                      {"\n"}docker build -t xblock-server xblock/server
                      {"\n"}docker run -d -p 3000:3000 -v xblock-data:/data \
                      {"\n"}  -e XBLOCK_SECRET=<span className="text-brand">$(openssl rand -hex 32)</span> \
                      {"\n"}  xblock-server
                      {"\n\n"}
                      <span className="text-muted-foreground">{t.oss.commentExtension}</span>
                      {"\n"}cd xblock/chrome_extension && npm install
                      {"\n"}XBLOCK_API_URL=<span className="text-brand">https://your-domain</span> npm run package
                    </code>
                  </pre>
                </figure>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-title">
            <SectionHeading id="faq" eyebrow={t.faq.eyebrow} title={<span id="faq-title">{t.faq.title}</span>} />
            <Faq items={t.faq.items} />
          </section>

          {/* Closing call */}
          <section aria-labelledby="cta-title" className="relative isolate overflow-hidden border-b">
            <AsciiField clear={{ x: 0.25, y: 0.5, rx: 0.4, ry: 0.75, maxRx: 620 }} />
            <div className="relative z-10 flex max-w-xl flex-col gap-6 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
              <Eyebrow>{t.cta.eyebrow}</Eyebrow>
              <h2 id="cta-title" className="text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.05] font-medium tracking-[-0.03em]">
                <Rich text={t.cta.title} />
              </h2>
              <p className="text-[17px] leading-relaxed text-muted-foreground">{t.cta.body}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  {t.cta.add}
                </a>
                <a href={LINKS.github} className={buttonVariants({ variant: "frame", size: "cta" })}>
                  <GitHubIcon className="size-4" />
                  {t.cta.star}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t.footer} nav={t.nav} />
    </div>
  )
}
