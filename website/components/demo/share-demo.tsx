"use client"

import * as React from "react"
import { ArrowDownIcon, CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { fill } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { Rich } from "@/components/site/rich"
import { useInView } from "./use-in-view"
import { BlockGlyph, XPost, type Post } from "./x-post"

const TROLLS: Post[] = [
  { id: "t1", name: "Night Troll", handle: "troll_of_the_night", text: "Nobody asked. Ratio + L.", color: "#f91880", time: "3m" },
  { id: "t2", name: "Reply Guy", handle: "reply_guy_3000", text: "Actually, as a man, let me explain…", color: "#7856ff", time: "6m" },
  { id: "t3", name: "Fast Cash Daily", handle: "fastcash_daily", text: "Make $5,000 a day from home!!! 💸", color: "#ff7a00", time: "9m" },
]

const SUBSCRIBERS = ["#794bc4", "#00ba7c", "#f91880", "#ffd400", "#7856ff", "#ff7a00", "#e0245e", "#00ba7c", "#f91880", "#7856ff", "#ffd400", "#ff7a00"]
const CODE = "XBK-7Q2M9"
// Block, then the list takes it, then every subscriber has it
const BEAT_MS = 1100

/**
 * One block, many people covered: you block a troll, it lands in your list,
 * and everyone subscribed to the list gets it too.
 */
/** `still`: hold on one moment of the loop (a tick count) instead of playing it. */
function ShareDemo({ t, lang, still }: { t: Dict["share"]; lang: string; still?: number }) {
  const [playing, setTick] = React.useState(0)
  const tick = still ?? playing
  const [copied, setCopied] = React.useState(false)
  const [ref, inView] = useInView<HTMLDivElement>()

  React.useEffect(() => {
    if (!inView || still !== undefined) return
    const timer = window.setInterval(() => setTick((t) => t + 1), BEAT_MS)
    return () => window.clearInterval(timer)
  }, [inView, still])

  const beat = tick % 3
  const round = Math.floor(tick / 3)
  const index = round % TROLLS.length
  const troll = { ...TROLLS[index], text: t.posts[index] ?? TROLLS[index].text }
  const listed = 127 + round + (beat >= 1 ? 1 : 0)

  async function copy() {
    try {
      await navigator.clipboard.writeText(CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // No clipboard (an insecure origin or a refusal): the code stays readable on the button
    }
  }

  return (
    <div ref={ref} className="flex w-full max-w-[460px] flex-col items-stretch">
      <div className={cn("border bg-background transition-shadow duration-300", beat === 0 && "shadow-[0_0_0_3px_color-mix(in_oklch,var(--block)_35%,transparent)]")}>
        <XPost
          key={troll.id}
          post={troll}
          compact
          className="pop-in border-b-0"
        />
        <div className="flex items-center justify-between border-t border-x-line bg-x-bg px-4 py-2 text-[12px] text-x-dim">
          <span>{t.youBlock}</span>
          <span className={cn("grid size-7 place-items-center rounded-full transition-colors", beat === 0 ? "bg-block/15 text-block" : "")}>
            <BlockGlyph className="size-4" />
          </span>
        </div>
      </div>

      <ArrowDownIcon className={cn("mx-auto my-3 size-4 transition-colors", beat >= 1 ? "text-block" : "text-muted-foreground")} aria-hidden="true" />

      <div className={cn("flex items-center gap-3 border bg-background p-4 transition-shadow duration-300", beat === 1 && "shadow-[0_0_0_3px_color-mix(in_oklch,var(--brand)_35%,transparent)]")}>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{t.yourList}</p>
          <p className="mt-1 text-sm">
            <span key={listed} className="pop-in inline-block">
              <Rich text={fill(t.accounts, { n: `**${listed.toLocaleString(lang)}**` })} bold="font-semibold tabular-nums" />
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-2 bg-block px-3 py-2 font-heading text-[12px] tracking-[0.08em] text-white hover:bg-block/85"
          aria-label={fill(t.copy, { code: CODE })}
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          {copied ? t.copied : CODE}
        </button>
      </div>

      <ArrowDownIcon className={cn("mx-auto my-3 size-4 transition-colors", beat === 2 ? "text-brand" : "text-muted-foreground")} aria-hidden="true" />

      <div className="border bg-background p-4">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{t.subscribers}</p>
          <p className="text-[12px] text-muted-foreground tabular-nums">{t.people}</p>
        </div>
        <div className="mt-3 grid grid-cols-12 gap-1.5">
          {SUBSCRIBERS.map((color, i) => (
            <span
              key={i}
              className="relative aspect-square rounded-full transition-transform duration-300"
              style={{
                background: color,
                transform: beat === 2 ? "scale(1.12)" : "scale(1)",
                transitionDelay: beat === 2 ? `${i * 30}ms` : "0ms",
              }}
              aria-hidden="true"
            >
              <span
                className="absolute -right-0.5 -bottom-0.5 grid size-3 place-items-center rounded-full bg-block text-[8px] text-white transition-opacity duration-300"
                style={{ opacity: beat === 2 ? 1 : 0, transitionDelay: beat === 2 ? `${i * 30}ms` : "0ms" }}
              >
                ⦸
              </span>
            </span>
          ))}
        </div>
        <p className="mt-3 min-h-5 text-[13px] text-muted-foreground">
          {beat === 2 ? (
            <span className="pop-in inline-block">
              <Rich text={fill(t.gone, { handle: troll.handle })} bold="font-bold text-foreground" />
            </span>
          ) : (
            t.everyone
          )}
        </p>
      </div>
    </div>
  )
}

export { ShareDemo }
