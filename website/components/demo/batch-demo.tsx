"use client"

import * as React from "react"
import { BanIcon, MinusIcon, VolumeXIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { fill } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { XBlockMark } from "@/components/site/logo"
import { Rich } from "@/components/site/rich"
import { useInView } from "./use-in-view"

type Account = { handle: string; followers: number; list: 0 | 1 }

// Biggest first, as the real queue is ordered; list 0 blocks, list 1 mutes
const QUEUE: Account[] = [
  { handle: "crypto_king99", followers: 2_100_000, list: 0 },
  { handle: "promo_flash", followers: 980_000, list: 1 },
  { handle: "rage_bait_daily", followers: 412_000, list: 0 },
  { handle: "bot_army_42", followers: 156_000, list: 1 },
  { handle: "spam_deals", followers: 52_300, list: 1 },
  { handle: "troll_of_the_night", followers: 12_000, list: 0 },
  { handle: "fake_news_24", followers: 8_400, list: 0 },
  { handle: "reply_guy_3000", followers: 3_100, list: 0 },
  { handle: "giveaway_free", followers: 2_400, list: 1 },
  { handle: "user5512093", followers: 1_800, list: 0 },
  { handle: "link_in_bio", followers: 950, list: 1 },
  { handle: "bot_8812", followers: 410, list: 1 },
]

// Each list's share of the queue
const LIST_TOTALS = [6, 6]

const STEP_MS = 950

/**
 * The batch overlay the extension opens on x.com, replayed: it works through
 * every account on the lists set to act on X, biggest first, blocking or
 * muting each as its list says. Sped up: the real one waits 6 to 10 seconds
 * between accounts.
 */
/** `still`: hold at that many accounts done instead of playing the run. */
function BatchDemo({ t, lang, still }: { t: Dict["batch"]; lang: string; still?: number }) {
  const compact = new Intl.NumberFormat(lang, { notation: "compact", maximumFractionDigits: 1 })
  const lists = [
    { name: t.listA, mode: t.modeBlock, total: LIST_TOTALS[0] },
    { name: t.listB, mode: t.modeMute, total: LIST_TOTALS[1] },
  ]
  const [playing, setDone] = React.useState(0)
  const done = still ?? playing
  const [ref, inView] = useInView<HTMLDivElement>()

  React.useEffect(() => {
    if (!inView || still !== undefined) return
    const finished = done >= QUEUE.length
    // At the end it holds on "Done" a moment, then starts over
    const timer = window.setTimeout(() => setDone((d) => (d >= QUEUE.length ? 0 : d + 1)), finished ? 3200 : done === 0 ? 700 : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [done, inView, still])

  const finished = done >= QUEUE.length
  const current = QUEUE[done]
  const recent = QUEUE.slice(0, done).reverse().slice(0, 5)
  const percent = Math.round((done / QUEUE.length) * 100)
  const perList = lists.map((_, i) => QUEUE.slice(0, done).filter((a) => a.list === i).length)

  return (
    <div ref={ref} className="w-full max-w-[460px] border bg-background p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] sm:p-6">
      <div className="flex items-center gap-3">
        <XBlockMark className="size-6 text-foreground" />
        <span className="flex-1 text-sm font-semibold">{t.title}</span>
        <span
          className={cn(
            "flex items-center gap-2 border px-2 py-0.5 font-heading text-[10px] tracking-[0.1em] uppercase",
            finished ? "border-success/40 text-success" : "border-block/40 text-block"
          )}
        >
          <span className={cn("size-1.5 rounded-full", finished ? "bg-success" : "live-dot bg-block")} />
          {finished ? t.done : t.running}
        </span>
      </div>

      <p className="mt-5 flex items-baseline gap-3">
        <span className="font-heading text-6xl font-medium tracking-[-0.04em] tabular-nums">{done}</span>
        <span className="text-sm text-muted-foreground">{t.thisRun}</span>
      </p>

      <div className="mt-3 h-2 bg-muted">
        <div className="fill-drift h-full transition-[width] duration-700 ease-out" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-muted-foreground tabular-nums">
        <span>{fill(t.ofLists, { percent })}</span>
        <span>{finished ? t.closing : fill(t.left, { n: QUEUE.length - done })}</span>
      </div>

      <div className="mt-5 flex min-h-11 items-center gap-3 bg-muted px-3.5 py-2.5 text-sm">
        <span className={cn("size-2 shrink-0 rounded-full", finished ? "bg-success" : "live-dot bg-block")} />
        {finished ? (
          <span>{t.allHandled}</span>
        ) : current ? (
          <span className="truncate">
            <Rich text={fill(current.list === 1 ? t.muting : t.blocking, { handle: current.handle })} bold="font-bold" />
            <span className="text-muted-foreground"> · {fill(t.followers, { n: compact.format(current.followers) })}</span>
          </span>
        ) : null}
      </div>

      <p className="mt-5 font-heading text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{t.lists}</p>
      <div className="mt-2 grid gap-2">
        {lists.map((list, i) => (
          <div key={list.name} className="grid grid-cols-[minmax(0,1fr)_88px_44px] items-center gap-3 text-[13px]">
            <span className="truncate">
              {list.name} <span className={cn("text-[11px]", i === 0 ? "text-block" : "text-mute")}>· {list.mode}</span>
            </span>
            <span className="h-1.5 bg-muted">
              <span className="fill-drift block h-full transition-[width] duration-700" style={{ width: `${(perList[i] / list.total) * 100}%` }} />
            </span>
            <span className="text-right text-muted-foreground tabular-nums">
              {perList[i]}/{list.total}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 font-heading text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{t.recent}</p>
      <ul className="mt-2 grid h-[150px] content-start gap-1 overflow-hidden">
        {recent.length === 0 ? (
          <li className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <MinusIcon className="size-3.5" aria-hidden="true" /> {t.loading}
          </li>
        ) : null}
        {recent.map((account, i) => {
          const muted = account.list === 1
          const Icon = muted ? VolumeXIcon : BanIcon
          return (
            <li
              key={account.handle}
              className={cn("flex h-7 items-center gap-2.5 text-[13px] transition-opacity", i === 0 && "pop-in")}
              style={{ opacity: 1 - i * 0.16 }}
            >
              <Icon className={cn("size-3.5 shrink-0", muted ? "text-mute" : "text-block")} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">@{account.handle}</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">{compact.format(account.followers)}</span>
              <span
                className={cn(
                  "w-[62px] border px-1.5 py-px text-center font-heading text-[9px] tracking-[0.1em] uppercase",
                  muted ? "border-mute/40 text-mute" : "border-block/40 text-block"
                )}
              >
                {muted ? t.muted : t.blocked}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { BatchDemo }
