"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { fill } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { BatchDemo } from "@/components/demo/batch-demo"
import { explode } from "@/components/demo/fx"
import { HeroSamurai } from "@/components/demo/hero-samurai"
import { ModesDemo } from "@/components/demo/modes-demo"
import { ShareDemo } from "@/components/demo/share-demo"
import { AllowGlyph, BlockGlyph, XPost, type Post } from "@/components/demo/x-post"
import { XBlockLogo, XBlockMark, XMark } from "@/components/site/logo"
import { Rich } from "@/components/site/rich"
import { FRAMES, type Frame } from "./frames"

// The Chrome Web Store's images, one per frame, at their exact sizes. Each is a
// real page (app/[lang]/store/[frame]) rendered from the site's own demos, so
// media/store/render.cjs can screenshot every frame in every language.


/** The dark stage every frame sits on: X black, a red glow, fine stems. */
function Backdrop({ glow = "72% 50%", kanji = false }: { glow?: string; kanji?: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at ${glow}, rgba(120,8,28,0.55) 0%, rgba(40,6,14,0.35) 35%, transparent 70%)` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-stems" aria-hidden="true" />
      {kanji ? (
        <span
          className="pointer-events-none absolute top-1/2 right-[8%] -translate-y-[54%] font-['Hiragino_Mincho_ProN','Yu_Mincho','Noto_Serif_JP',serif] text-[520px] leading-none font-black text-[rgba(255,45,85,0.07)]"
          aria-hidden="true"
        >
          斬
        </span>
      ) : null}
    </>
  )
}

/** The pitch on the left of a screenshot: kicker, title, body, and the badge at the foot. */
function Pitch({ kicker, title, body, badge, className }: { kicker: string; title: string; body: string; badge: string; className?: string }) {
  return (
    <div className={cn("flex h-full flex-col justify-center", className)}>
      <p className="font-heading text-[15px] tracking-[0.18em] text-block uppercase">{kicker}</p>
      <h1 className="mt-5 text-[50px] leading-[1.04] font-medium tracking-[-0.03em] uppercase [word-break:auto-phrase]">
        <Rich text={title} />
      </h1>
      <p className="mt-6 max-w-[440px] text-[22px] leading-snug text-muted-foreground">{body}</p>
      <p className="mt-10 w-fit border border-white/20 px-3 py-1.5 font-heading text-[12px] tracking-[0.12em] text-muted-foreground uppercase">
        {badge}
      </p>
    </div>
  )
}

/** Screenshot 1: a pretend x.com with a troll's post blowing up. */
function ExplodingFeed({ t }: { t: Dict }) {
  const troll = React.useRef<HTMLElement>(null)
  const posts: Post[] = [
    { id: "emma", name: "Emma R.", handle: "emma_r", text: t.playground.posts[0], color: "#794bc4", time: "12m", stats: ["4", "2", "38", "1.2K"] },
    { id: "crypto", name: "Crypto King", handle: "crypto_king99", text: t.playground.posts[1], color: "#ff7a00", time: "18m", verified: true, stats: ["212", "1K", "3K", "88K"] },
    { id: "hugo", name: "Hugo M.", handle: "hugo_m", text: t.playground.posts[2], color: "#00ba7c", time: "31m", stats: ["27", "3", "64", "2.4K"] },
    { id: "ines", name: "Ines B.", handle: "ines_b", text: t.playground.posts[4], color: "#ffd400", time: "1h", stats: ["15", "8", "121", "5K"] },
  ]

  // The capture script calls this, then waits a beat for the debris to fly
  React.useEffect(() => {
    ;(window as unknown as { __storeAction?: () => void }).__storeAction = () => {
      const el = troll.current
      if (!el) return
      const button = el.querySelector("[data-block]")!.getBoundingClientRect()
      explode(el, button.left + button.width / 2, button.top + button.height / 2)
      el.style.visibility = "hidden"
    }
  }, [])

  return (
    <div className="relative w-[600px] overflow-hidden border border-white/15 bg-x-bg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-x-line px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-x-line" />
          <span className="size-2.5 rounded-full bg-x-line" />
          <span className="size-2.5 rounded-full bg-x-line" />
        </span>
        <span className="mx-auto flex items-center gap-2 rounded-full bg-muted px-4 py-1 font-mono text-[12px] text-x-dim">
          <XMark className="size-3 text-x-text" />
          x.com/home
        </span>
        <span className="w-12" />
      </div>
      <div className="grid grid-cols-2 border-b border-x-line text-[15px]">
        <span className="relative py-3.5 text-center font-bold text-x-text">
          {t.x.forYou}
          <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-brand" />
        </span>
        <span className="py-3.5 text-center text-x-dim">{t.x.following}</span>
      </div>
      {posts.map((post) => (
        <XPost
          key={post.id}
          post={post}
          verifiedLabel={t.x.verified}
          ref={post.id === "crypto" ? troll : undefined}
          xblock={
            <>
              <span className="grid size-[34px] place-items-center rounded-full">
                <AllowGlyph className="size-[18px]" />
              </span>
              <span data-block className={cn("grid size-[34px] place-items-center rounded-full", post.id === "crypto" && "bg-block/15 text-block")}>
                <BlockGlyph className="size-[18px]" />
              </span>
            </>
          }
        />
      ))}
      <div className="absolute inset-x-0 bottom-5 flex justify-center">
        <span className="rounded-[4px] bg-brand px-4 py-2.5 text-[15px] text-white shadow-lg">
          {fill(t.playground.toastBlocked, { handle: "crypto_king99" })}
        </span>
      </div>
    </div>
  )
}

function Screenshot({ t, lang, index }: { t: Dict; lang: string; index: number }) {
  const shot = t.store.shots[index]
  const demos = [
    <ExplodingFeed key="feed" t={t} />,
    <div key="samurai" className="w-[640px]">
      <HeroSamurai t={t.stage} verifiedLabel={t.x.verified} hud={false} />
    </div>,
    <div key="share" className="origin-center scale-[1.18]">
      <ShareDemo t={t.share} lang={lang} still={2} />
    </div>,
    <div key="modes" className="origin-center scale-[1.22]">
      <ModesDemo t={t.modes} lang={lang} still="blur" />
    </div>,
    <div key="batch" className="origin-center scale-[1.08]">
      <BatchDemo t={t.batch} lang={lang} still={7} />
    </div>,
  ]
  return (
    <>
      <Backdrop kanji={index === 1} />
      <div className="absolute top-12 left-16">
        <XBlockLogo className="scale-125 origin-left" />
      </div>
      <div className="relative grid h-full grid-cols-[500px_1fr] gap-10 px-16">
        <Pitch kicker={shot.kicker} title={shot.title} body={shot.body} badge={t.store.badge} />
        <div className="flex items-center justify-center">{demos[index]}</div>
      </div>
    </>
  )
}

function PromoSmall({ t }: { t: Dict }) {
  return (
    <>
      <Backdrop glow="82% 30%" />
      <XBlockMark className="absolute top-5 right-6 size-[118px] rotate-[-8deg] text-white/90 drop-shadow-[0_0_36px_rgba(244,33,46,0.5)]" />
      <div className="relative flex h-full flex-col justify-between p-7">
        <span className="font-heading text-[20px] leading-none font-bold tracking-[0.16em]">XBLOCK</span>
        <p className="font-heading text-[32px] leading-[1.06] font-medium tracking-[-0.02em] text-balance uppercase [word-break:auto-phrase]">
          <Rich text={t.store.promoTitle} />
        </p>
      </div>
    </>
  )
}

function PromoMarquee({ t }: { t: Dict }) {
  return (
    <>
      <Backdrop glow="74% 50%" kanji />
      <div className="relative grid h-full grid-cols-[600px_1fr] gap-8 px-16">
        <div className="flex flex-col justify-center">
          <XBlockLogo className="origin-left scale-150" />
          <h1 className="mt-10 text-[58px] leading-[1.02] font-medium tracking-[-0.03em] uppercase [word-break:auto-phrase]">
            <Rich text={t.store.marqueeTitle} />
          </h1>
          <p className="mt-6 max-w-[520px] text-[21px] leading-snug text-muted-foreground">{t.store.marqueeBody}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-[640px]">
            <HeroSamurai t={t.stage} verifiedLabel={t.x.verified} hud={false} />
          </div>
        </div>
      </div>
    </>
  )
}

function StoreFrame({ t, lang, frame }: { t: Dict; lang: string; frame: Frame }) {
  const { width, height } = FRAMES[frame]
  return (
    <div
      className="dark relative overflow-hidden bg-background font-sans text-foreground"
      style={{ width, height }}
      data-frame={frame}
    >
      {frame === "promo-small" ? (
        <PromoSmall t={t} />
      ) : frame === "promo-marquee" ? (
        <PromoMarquee t={t} />
      ) : (
        <Screenshot t={t} lang={lang} index={Number(frame.slice(-1)) - 1} />
      )}
    </div>
  )
}

export { StoreFrame }
