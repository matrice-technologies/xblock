import Link from "next/link"
import { ArrowRightIcon, BanIcon, VolumeXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { LINKS } from "@/lib/site"
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

const steps = [
  {
    label: "Step 1",
    title: "Install",
    body: "Add XBlock to Chrome. It makes you an anonymous key on the spot: no sign-up, no email, no X password.",
  },
  {
    label: "Step 2",
    title: "Block",
    body: "Every post on x.com gets a block button. Block a troll and they land in your own list, ready to share.",
  },
  {
    label: "Step 3",
    title: "Share and subscribe",
    body: "Send your list's code to friends. Paste someone else's to subscribe, and pick what their list does for you.",
  },
]

const privacy = [
  {
    label: "Who you are",
    title: "No account",
    body: "XBlock makes a random key in your browser. Our server only keeps a fingerprint of it, never the key itself.",
  },
  {
    label: "Your X login",
    title: "Never leaves your browser",
    body: "Blocks and mutes go from your browser straight to X, on the session you already have. We never see your X password or cookies.",
  },
  {
    label: "What it reads",
    title: "Handles, not posts",
    body: "XBlock looks at who wrote each post, to treat it as your lists say. It doesn't collect what you read, write or like.",
  },
  {
    label: "Proof",
    title: "Open source",
    body: "Every line of the extension and the server is on GitHub, under the MIT License. Read it, or run your own server.",
  },
]

const stored = [
  { what: "A fingerprint of your key", why: "So your lists and settings follow you across computers." },
  { what: "Your lists and allowed accounts", why: "X handles, the names you give your lists, and their share codes." },
  { what: "Your subscriptions", why: "Which lists you follow, and the mode each one uses." },
  { what: "What XBlock blocked or muted for you", why: "So a batch never does the same account twice." },
  { what: "Public follower counts", why: "Seen in feeds, shared by everyone, to block the biggest accounts first." },
]

/** When a block of the hero rises in, in seconds (globals.css, .rise). */
const rise = (delay: number) => ({ "--rise-delay": `${delay}s` }) as React.CSSProperties

function Ticker() {
  const row = TICKER.map(([handle, how]) => (
    <span key={handle} className="flex shrink-0 items-center gap-2 px-6 font-heading text-[12px] tracking-[0.06em]">
      {how === "block" ? (
        <BanIcon className="size-3.5 text-block" aria-hidden="true" />
      ) : (
        <VolumeXIcon className="size-3.5 text-mute" aria-hidden="true" />
      )}
      <span className="text-foreground">@{handle}</span>
      <span className="text-muted-foreground uppercase">{how === "block" ? "blocked" : "muted"}</span>
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

export default function Page() {
  return (
    <div className="min-h-svh">
      <SiteHeader />

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
                <Eyebrow>Free Chrome extension for X</Eyebrow>
              </div>
              <h1 className="mt-6 text-[clamp(2.3rem,5.4vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.035em]">
                <RiseWords text="Block trolls" start={0.25} />{" "}
                <RiseWords text="in one click." start={0.4} className="text-block" />
              </h1>
            </div>
            <div className="rise self-center lg:col-start-2 lg:row-span-2 lg:row-start-1" style={rise(0.5)}>
              <HeroSamurai />
            </div>
            <div className="flex flex-col items-start lg:col-start-1 lg:row-start-2">
              <p className="rise max-w-xl text-lg leading-relaxed text-muted-foreground lg:mt-6" style={rise(0.75)}>
                XBlock puts a block button on every post on X, lets you share
                your block list with a code, and blocks everyone on the lists
                you subscribe to. Or, if you&apos;d rather, slice them to pieces
                first. Go on, try it.
              </p>
              <div className="rise mt-10 flex flex-wrap gap-3" style={rise(0.9)}>
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  Add to Chrome, it&apos;s free
                </a>
                <Link href="#try" className={buttonVariants({ variant: "frame", size: "cta" })}>
                  Try it right here
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>
              <p className="rise mt-8 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase" style={rise(1.05)}>
                Works with X in any language · Chrome, Edge, Brave, Arc
              </p>
            </div>
          </div>
        </section>

        <Ticker />

        <div className="mx-auto max-w-[1400px] border-x">
          {/* The playground */}
          <FigureSection
            id="try"
            label="Playground"
            count="The real animations"
            eyebrow="Try it"
            title={
              <>
                Go on, block a <span className="text-block">troll</span>.
              </>
            }
            lead={
              <p>
                A pretend x.com running XBlock&apos;s own animations. Hold the
                block button on a post until it blows, or switch to{" "}
                <b className="font-medium text-foreground">Samurai</b> and slice
                it apart. Nothing here touches your X account.
              </p>
            }
            note={
              <>
                On x.com, the same button blocks (or mutes) the account for
                real, through X itself, and adds it to your list. The shield
                next to it does the opposite: that account is never blocked,
                whatever your lists say.
              </>
            }
            className="px-0 py-0 sm:px-0 sm:py-0 lg:px-0"
          >
            <Playground />
          </FigureSection>

          {/* Features */}
          <ModuleSection
            id="features"
            label="Features"
            count="4 modules"
            lead="Clean up X once, for you and your friends."
            rest="Block in one click, share what you blocked, subscribe to the lists of people you trust, and let a batch handle thousands of accounts while you do something else."
          >
            <ModuleRow
              kicker="Shared lists"
              title="Block once. Everyone on your list's code is covered."
              diagram={<ShareDemo />}
            >
              <p>
                Every account you block goes into your own list, with a share
                code like <code className="bg-muted px-1 font-mono text-[0.9em] text-foreground">XBK-7Q2M9</code>.
                Send it to friends, post it in a bio, or paste a creator&apos;s
                code to subscribe to theirs. New entries reach every subscriber
                as they&apos;re added.
              </p>
            </ModuleRow>
            <ModuleRow
              kicker="Modes"
              title="Each list decides: block, mute, hide or blur."
              diagram={<ModesDemo />}
            >
              <p>
                Trust a list completely? Have it block on X. Not sure? Mute, so
                they never know. Or keep X out of it: hide those posts, or blur
                them with one click to peek. When two lists disagree, the
                stronger one wins.
              </p>
            </ModuleRow>
            <ModuleRow
              kicker="Batch"
              title="Thousands of accounts, while you get on with your day."
              diagram={<BatchDemo />}
            >
              <p>
                One click and a small x.com window works through every list set
                to act on X, biggest accounts first, blocking or muting each as
                its list says. It goes one account every 6 to 10 seconds, pauses
                when X asks it to, and picks up where it stopped. (The demo
                here is sped up.)
              </p>
            </ModuleRow>
            <ModuleRow
              kicker="Any language"
              title="Blocked from X's own menu? It's in your list too."
              diagram={<LanguageDemo />}
            >
              <p>
                Block someone the usual way, from the post&apos;s menu, and
                XBlock adds them to your list as well. It recognises X&apos;s
                Block and Unblock dialogs in any language, from English to
                Japanese.
              </p>
            </ModuleRow>
          </ModuleSection>

          {/* Walkthrough video */}
          <FigureSection
            id="watch"
            label="Walkthrough"
            count="1 min 51"
            eyebrow="Watch"
            title="Every feature, in under two minutes."
            lead={<p>Recorded on the real extension: the popup, shared lists, the four modes, batch blocking and Samurai mode.</p>}
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
            <SectionHeading
              id="how"
              eyebrow="How it works"
              title={<span id="how-title">Up and running in a minute</span>}
            />
            <ol className="grid border-b md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.label}
                  className={cn(
                    "flex flex-col gap-3 px-4 py-10 sm:px-6 lg:px-10",
                    index > 0 && "border-t md:border-t-0 md:border-l"
                  )}
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
              eyebrow="Privacy"
              title={<span id="privacy-title">Nothing to sign up for, nothing to leak</span>}
            >
              XBlock needs to know whose posts to treat, and nothing else.
            </SectionHeading>
            <div className="grid border-b lg:grid-cols-[1.5fr_1fr]">
              <div className="grid sm:grid-cols-2">
                {privacy.map((part, index) => (
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
                  <span className="border px-3 py-2">your key</span>
                  <ArrowRightIcon className="size-4 text-brand" aria-hidden="true" />
                  <span className="border border-foreground bg-foreground px-3 py-2 text-background">HMAC-SHA256</span>
                  <ArrowRightIcon className="size-4 text-brand" aria-hidden="true" />
                  <span className="border px-3 py-2">the only ID we keep</span>
                </div>
              </div>
              <div className="flex flex-col border-t lg:border-t-0 lg:border-l">
                <div className="border-b px-4 py-8 sm:px-6 lg:px-10">
                  <p className="font-heading text-[11px] tracking-[0.18em] text-muted-foreground uppercase">On our server</p>
                  <h3 className="mt-3 text-lg font-semibold tracking-[0.02em]">The complete list</h3>
                </div>
                <dl className="divide-y border-b">
                  {stored.map((row) => (
                    <div key={row.what} className="grid gap-1 px-4 py-4 sm:px-6 lg:px-10">
                      <dt className="font-heading text-sm text-brand">{row.what}</dt>
                      <dd className="text-sm text-muted-foreground">{row.why}</dd>
                    </div>
                  ))}
                </dl>
                <p className="px-4 py-6 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-10">
                  The details, and how to have it all deleted, are in the{" "}
                  <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-brand">
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Open source */}
          <section id="open-source" aria-labelledby="oss-title" className="scroll-mt-16 border-b">
            <LabelStrip label="Open source" count="MIT License" />
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
                <Eyebrow>Open source</Eyebrow>
                <h2 id="oss-title" className="max-w-xl text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.02em]">
                  Read every line. Run your own server.
                </h2>
                <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">
                  The extension and its server live in one repository under the
                  MIT License. Check what it does, send a fix, add a language,
                  or host the server yourself and build the extension against it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={LINKS.github} className={buttonVariants({ variant: "default", size: "cta" })}>
                    <GitHubIcon className="size-4" />
                    View on GitHub
                  </a>
                  <a href={LINKS.selfHost} className={buttonVariants({ variant: "frame", size: "cta" })}>
                    Self-hosting guide
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </div>
                <ul className="mt-2 flex flex-wrap gap-2 font-heading text-[11px] tracking-[0.08em] uppercase" aria-label="Built with">
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
                    <span>Your own server</span>
                    <span>bash</span>
                  </figcaption>
                  <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
                    <code>
                      <span className="text-muted-foreground"># the API, with its database on a volume</span>
                      {"\n"}git clone {LINKS.github}
                      {"\n"}docker build -t xblock-server xblock/server
                      {"\n"}docker run -d -p 3000:3000 -v xblock-data:/data \
                      {"\n"}  -e XBLOCK_SECRET=<span className="text-brand">$(openssl rand -hex 32)</span> \
                      {"\n"}  xblock-server
                      {"\n\n"}
                      <span className="text-muted-foreground"># the extension, built against it</span>
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
            <SectionHeading id="faq" eyebrow="FAQ" title={<span id="faq-title">Questions, answered</span>} />
            <Faq />
          </section>

          {/* Closing call */}
          <section aria-labelledby="cta-title" className="relative isolate overflow-hidden border-b">
            <AsciiField clear={{ x: 0.25, y: 0.5, rx: 0.4, ry: 0.75, maxRx: 620 }} />
            <div className="relative z-10 flex max-w-xl flex-col gap-6 px-4 py-20 sm:px-6 sm:py-28 lg:px-10">
              <Eyebrow>Get XBlock</Eyebrow>
              <h2 id="cta-title" className="text-[clamp(1.9rem,4.4vw,3.2rem)] leading-[1.05] font-medium tracking-[-0.03em]">
                Take back your <span className="text-block">timeline</span>.
              </h2>
              <p className="text-[17px] leading-relaxed text-muted-foreground">
                Free, no account, and gone in one click if you change your mind.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  Add to Chrome
                </a>
                <a href={LINKS.github} className={buttonVariants({ variant: "frame", size: "cta" })}>
                  <GitHubIcon className="size-4" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
