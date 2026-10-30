"use client"

import * as React from "react"
import { BanIcon, EyeIcon, EyeOffIcon, VolumeXIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useInView } from "./use-in-view"
import { XPost, type Post } from "./x-post"

type Mode = "autoblock" | "automute" | "hide" | "blur"

const MODES: { value: Mode; label: string; icon: LucideIcon; tone: string; note: string }[] = [
  { value: "autoblock", label: "Block on X", icon: BanIcon, tone: "text-block border-block bg-block/10", note: "Blocked on X, for good. They can't see you either." },
  { value: "automute", label: "Mute on X", icon: VolumeXIcon, tone: "text-mute border-mute bg-mute/10", note: "Muted on X. Gone from your feed, and they'll never know." },
  { value: "hide", label: "Hide", icon: EyeOffIcon, tone: "text-foreground border-foreground bg-foreground/10", note: "Folded away in your browser. Nothing changes on X." },
  { value: "blur", label: "Blur", icon: EyeIcon, tone: "text-purple border-purple bg-purple/10", note: "Blurred in your browser, one click to read it anyway." },
]

const LIST = { name: "Crypto bots & spam", code: "XBK-9C07E", owner: "tom.debates", size: "3,902" }

const FEED: Post[] = [
  { id: "a", name: "Emma R.", handle: "emma_r", text: "Quick thread on my favourite tools for work.", color: "#794bc4", time: "4m" },
  { id: "b", name: "Crypto King", handle: "crypto_king99", text: "$MOON is about to 100x 🚀 DM me for the presale.", color: "#ff7a00", time: "9m", verified: true, bad: true },
  { id: "c", name: "Hugo M.", handle: "hugo_m", text: "Thanks everyone for the feedback on the project!", color: "#00ba7c", time: "20m" },
]

const CYCLE_MS = 3400

/**
 * One subscribed list, four ways to apply it: pick a mode and watch what
 * happens to the post of an account on the list. Cycles on its own until
 * someone picks a mode.
 */
function ModesDemo() {
  const [mode, setMode] = React.useState<Mode>("autoblock")
  const [auto, setAuto] = React.useState(true)
  const [revealed, setRevealed] = React.useState(false)
  const [ref, inView] = useInView<HTMLDivElement>()

  React.useEffect(() => {
    if (!auto || !inView) return
    const timer = window.setInterval(() => {
      setRevealed(false)
      setMode((m) => MODES[(MODES.findIndex((x) => x.value === m) + 1) % MODES.length].value)
    }, CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [auto, inView])

  const current = MODES.find((m) => m.value === mode)!
  const onX = mode === "autoblock" || mode === "automute"

  return (
    <div ref={ref} className="w-full max-w-[460px] border bg-background shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
      {/* The subscription, as in the popup's list */}
      <div className="flex items-center gap-3 border-b p-4">
        <span className="grid size-10 shrink-0 place-items-center bg-gradient-to-br from-mute to-block font-heading text-sm font-bold text-white" aria-hidden="true">
          T
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-semibold">
            {LIST.name}
            <span className="bg-block px-1.5 py-px font-heading text-[10px] tracking-[0.06em] text-white">{LIST.code}</span>
          </p>
          <p className="truncate text-[12px] text-muted-foreground">
            by @{LIST.owner} · {LIST.size} accounts
          </p>
        </div>
      </div>

      <div role="radiogroup" aria-label="Mode for this list" className="grid grid-cols-4 gap-px border-b bg-border">
        {MODES.map((m) => {
          const selected = m.value === mode
          const Icon = m.icon
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setAuto(false)
                setRevealed(false)
                setMode(m.value)
              }}
              className={cn(
                "relative flex flex-col items-center gap-1 bg-background px-1 py-2.5 text-[11px] font-semibold transition-colors hover:bg-muted",
                selected ? m.tone.split(" ")[0] : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {m.label}
              {selected ? (
                <span key={auto ? mode : "picked"} className="absolute inset-x-0 bottom-0 h-0.5 bg-current" style={auto ? { animation: `story-progress ${CYCLE_MS}ms linear both`, transformOrigin: "left" } : undefined} />
              ) : null}
            </button>
          )
        })}
      </div>

      {/* The feed, with the listed account's post treated as the mode says */}
      <div className="bg-x-bg">
        {FEED.map((post) => {
          if (!post.bad) return <XPost key={post.id} post={post} compact />
          const collapsed = onX
          const hidden = mode === "hide"
          const blurred = mode === "blur" && !revealed
          return (
            <div
              key={post.id}
              className="relative overflow-hidden transition-[max-height,border-color] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
              style={{
                maxHeight: collapsed ? 0 : hidden ? 4 : 140,
                borderBottom: hidden ? "3px solid rgba(255, 0, 0, 0.3)" : "0 solid transparent",
              }}
            >
              <XPost
                post={post}
                compact
                className={cn("transition-[filter] duration-500", blurred && "pointer-events-none [filter:blur(5px)_brightness(60%)]")}
              />
              {mode === "blur" && !revealed ? (
                <div className="pop-in absolute inset-0 grid place-items-center p-3">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[12px] text-white backdrop-blur">
                    <span className="rounded-full bg-block px-2 py-px font-semibold">crypto_king99</span>
                    is blocked in
                    <span className="rounded-full bg-white/15 px-2 py-px">{LIST.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuto(false)
                        setRevealed(true)
                      }}
                      className="ml-1 font-semibold text-brand hover:underline"
                    >
                      Show
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex min-h-[3.75rem] items-center gap-3 border-t px-4 py-3" aria-live="polite">
        <span className={cn("shrink-0 border px-1.5 py-0.5 font-heading text-[10px] tracking-[0.08em] uppercase", current.tone)}>
          {onX ? (mode === "autoblock" ? "Blocked" : "Muted") : "In your browser"}
        </span>
        <p className="text-[13px] leading-snug text-muted-foreground">{current.note}</p>
      </div>
    </div>
  )
}

export { ModesDemo }
