"use client"

import * as React from "react"
import {
  BellIcon,
  BombIcon,
  HomeIcon,
  MailIcon,
  RotateCcwIcon,
  SearchIcon,
  SwordIcon,
  UserIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { XMark } from "@/components/site/logo"
import { chargePost, collapsePost } from "./charge"
import { explode } from "./fx"
import { samuraiActive, startSamurai } from "./samurai"
import { AllowGlyph, BlockGlyph, XPost, type Post } from "./x-post"

type Animation = "explode" | "samurai" | "off"
type Action = "block" | "mute"

const FEED: Post[] = [
  { id: "emma", name: "Emma R.", handle: "emma_r", text: "Sunset over the bay tonight. Unreal.", color: "#794bc4", time: "12m", stats: ["4", "2", "38", "1.2K"] },
  { id: "crypto", name: "Crypto King", handle: "crypto_king99", text: "$MOON is about to 100x 🚀 Last chance to get in. DM me for the presale.", color: "#ff7a00", time: "18m", verified: true, stats: ["212", "1K", "3K", "88K"], bad: true },
  { id: "hugo", name: "Hugo M.", handle: "hugo_m", text: "Anyone got a good book for the holidays? Looking for sci-fi.", color: "#00ba7c", time: "31m", stats: ["27", "3", "64", "2.4K"] },
  { id: "troll", name: "Night Troll", handle: "troll_of_the_night", text: "Nobody asked for your opinion. Ratio + L + delete your account.", color: "#f91880", time: "44m", stats: ["9", "", "2", "640"], bad: true },
  { id: "ines", name: "Ines B.", handle: "ines_b", text: "New project goes live tomorrow, can't wait to show you!", color: "#ffd400", time: "1h", stats: ["15", "8", "121", "5K"] },
  { id: "cash", name: "Fast Cash Daily", handle: "fastcash_daily", text: "Make $5,000 a day from home!!! 💸 Link in bio", color: "#7856ff", time: "1h", stats: ["", "430", "12", "40K"], bad: true },
  { id: "leo", name: "Leo P.", handle: "leo_p", text: "Coffee, playlist, and off we go.", color: "#00ba7c", time: "2h", stats: ["2", "", "19", "880"] },
]

const ANIMATIONS: { value: Animation; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "explode", label: "Explosion", hint: "Long press to blow it up", icon: BombIcon },
  { value: "samurai", label: "Samurai", hint: "Click, then slice it", icon: SwordIcon },
  { value: "off", label: "Off", hint: "Block instantly", icon: ZapIcon },
]

const ACTIONS: { value: Action; label: string; hint: string }[] = [
  { value: "block", label: "Block", hint: "They can't follow you or see your posts" },
  { value: "mute", label: "Mute", hint: "Gone from your feed, and they won't know" },
]

type Toast = { key: number; id: string; text: string; tone: "block" | "mute" | "allow"; undo?: boolean }

/** A small segmented choice, like the extension's popup: boxes with an icon, a name and a hint. */
function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
  columns,
}: {
  label: string
  value: T
  options: { value: T; label: string; hint: string; icon?: LucideIcon }[]
  onChange: (value: T) => void
  columns: 2 | 3
}) {
  return (
    <fieldset>
      <legend className="font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </legend>
      <div className={cn("mt-3 grid gap-px border bg-border", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
        {options.map((option) => {
          const selected = option.value === value
          const Icon = option.icon
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 bg-background p-3 transition-colors hover:bg-muted",
                selected && "bg-muted"
              )}
            >
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 transition-colors",
                  selected ? "bg-block" : "bg-transparent"
                )}
                aria-hidden="true"
              />
              {Icon ? (
                <Icon className={cn("size-4", selected ? "text-block" : "text-muted-foreground")} aria-hidden="true" />
              ) : null}
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-[12px] leading-snug text-muted-foreground">{option.hint}</span>
              <span className="pointer-events-none absolute inset-0 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-inset" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

const RAIL: LucideIcon[] = [HomeIcon, SearchIcon, BellIcon, MailIcon, UserIcon]

/**
 * The extension on a pretend x.com: XBlock's buttons on every post, the
 * popup's animation and action settings beside it. Blocking here runs the
 * extension's own animations (ported), and nothing leaves the page.
 */
function Playground() {
  const [animation, setAnimation] = React.useState<Animation>("explode")
  const [action, setAction] = React.useState<Action>("block")
  const [round, setRound] = React.useState(0)
  const [gone, setGone] = React.useState<Set<string>>(() => new Set())
  const [allowed, setAllowed] = React.useState<Set<string>>(() => new Set())
  const [counts, setCounts] = React.useState({ block: 0, mute: 0 })
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [charging, setCharging] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)

  const posts = React.useRef(new Map<string, HTMLElement>())
  const frameRef = React.useRef<HTMLDivElement>(null)
  const charge = React.useRef<{ cancel: () => void } | null>(null)
  const toastKey = React.useRef(0)

  const badLeft = FEED.filter((p) => p.bad && !gone.has(p.id)).length

  const toast = React.useCallback((next: Omit<Toast, "key">) => {
    const key = ++toastKey.current
    setToasts((list) => [...list.slice(-2), { ...next, key }])
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.key !== key)), 3200)
  }, [])

  /** The post is gone from the feed: count it and say so. */
  const handled = React.useCallback(
    (post: Post, how: Action) => {
      setGone((set) => new Set(set).add(post.id))
      setCounts((c) => ({ ...c, [how]: c[how] + 1 }))
      toast({
        id: post.id,
        text: `@${post.handle} ${how === "mute" ? "muted" : "blocked"} on X`,
        tone: how,
        undo: true,
      })
    },
    [toast]
  )

  function block(post: Post, event?: { clientX: number; clientY: number }) {
    const el = posts.current.get(post.id)
    if (!el || gone.has(post.id) || allowed.has(post.id) || samuraiActive()) return
    setTouched(true)
    const how = action
    if (animation === "samurai") {
      startSamurai(el, {
        doneLabel: `Done · ${how} @${post.handle}`,
        onFinish: () => collapsePost(el, () => handled(post, how)),
      })
    } else if (animation === "explode") {
      explode(el, event?.clientX, event?.clientY, frameRef.current)
      collapsePost(el, () => handled(post, how))
    } else {
      collapsePost(el, () => handled(post, how))
    }
  }

  function startCharge(post: Post, event: React.PointerEvent) {
    if (event.button !== 0 || animation !== "explode") return
    const el = posts.current.get(post.id)
    if (!el || gone.has(post.id) || allowed.has(post.id)) return
    event.preventDefault()
    setCharging(post.id)
    const press = { clientX: event.clientX, clientY: event.clientY }
    charge.current = chargePost(el, () => {
      charge.current = null
      setCharging(null)
      block(post, press)
    })
  }

  function stopCharge() {
    charge.current?.cancel()
    charge.current = null
    setCharging(null)
  }

  function undo(id: string) {
    const el = posts.current.get(id)
    if (el) {
      el.removeAttribute("style")
      el.animate(
        [
          { opacity: 0, transform: "translateY(-8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      )
    }
    setGone((set) => {
      const next = new Set(set)
      next.delete(id)
      return next
    })
    setToasts((list) => list.filter((t) => t.id !== id))
  }

  function toggleAllow(post: Post) {
    setAllowed((set) => {
      const next = new Set(set)
      if (next.has(post.id)) next.delete(post.id)
      else {
        next.add(post.id)
        toast({ id: post.id, text: `@${post.handle} will never be blocked`, tone: "allow" })
      }
      return next
    })
  }

  function reset() {
    stopCharge()
    setGone(new Set())
    setAllowed(new Set())
    setToasts([])
    setRound((r) => r + 1)
  }

  React.useEffect(() => () => charge.current?.cancel(), [])

  const firstBad = FEED.find((p) => p.bad && !gone.has(p.id) && !allowed.has(p.id))

  return (
    <div className="grid border lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* The pretend x.com */}
      <div className="min-w-0 bg-x-bg">
        <div className="flex items-center gap-3 border-b border-x-line px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-x-line" />
            <span className="size-2.5 rounded-full bg-x-line" />
            <span className="size-2.5 rounded-full bg-x-line" />
          </span>
          <span className="mx-auto flex min-w-0 items-center gap-2 rounded-full bg-muted px-4 py-1 font-mono text-[12px] text-x-dim">
            <XMark className="size-3 text-x-text" />
            x.com/home
          </span>
          <span className="w-12" aria-hidden="true" />
        </div>

        <div ref={frameRef} className="relative grid sm:grid-cols-[68px_minmax(0,1fr)]">
          <nav className="hidden flex-col items-center gap-2 border-r border-x-line py-3 sm:flex" aria-hidden="true">
            <span className="grid size-12 place-items-center">
              <XMark className="size-7 text-x-text" />
            </span>
            {RAIL.map((Icon, i) => (
              <span key={i} className="grid size-12 place-items-center rounded-full text-x-text">
                <Icon className="size-[22px]" strokeWidth={i === 0 ? 2.4 : 1.8} />
              </span>
            ))}
          </nav>

          <div className="relative min-w-0">
            <div className="grid grid-cols-2 border-b border-x-line text-[15px]">
              <span className="relative py-3.5 text-center font-bold text-x-text">
                For you
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-brand" />
              </span>
              <span className="py-3.5 text-center text-x-dim">Following</span>
            </div>

            <div key={round} className="min-h-[540px]">
              {FEED.map((post) => {
                const isAllowed = allowed.has(post.id)
                const guide = !touched && post === firstBad
                return (
                  <XPost
                    key={post.id}
                    post={post}
                    ref={(el) => {
                      if (el) posts.current.set(post.id, el)
                    }}
                    xblock={
                      <>
                        <button
                          type="button"
                          aria-label={isAllowed ? `Stop always allowing @${post.handle}` : `Always allow @${post.handle}`}
                          aria-pressed={isAllowed}
                          onClick={() => toggleAllow(post)}
                          className={cn(
                            "grid size-[34px] place-items-center rounded-full transition-colors hover:bg-success/10 hover:text-success",
                            isAllowed && "text-success"
                          )}
                        >
                          <AllowGlyph className="size-[18px]" />
                        </button>
                        <span className="relative">
                          <button
                            type="button"
                            aria-label={`${action === "mute" ? "Mute" : "Block"} @${post.handle}${animation === "explode" ? " (hold)" : ""}`}
                            disabled={isAllowed}
                            onPointerDown={(e) => startCharge(post, e)}
                            onPointerUp={stopCharge}
                            onPointerLeave={stopCharge}
                            onPointerCancel={stopCharge}
                            onContextMenu={(e) => e.preventDefault()}
                            onClick={(e) => {
                              // The explosion is a long press; from the keyboard it goes off at once
                              if (animation !== "explode" || e.detail === 0) block(post)
                            }}
                            className={cn(
                              "grid size-[34px] touch-none place-items-center rounded-full transition-colors select-none [-webkit-touch-callout:none] hover:bg-block/10 hover:text-block disabled:opacity-30",
                              charging === post.id && "bg-block/15 text-block"
                            )}
                          >
                            <BlockGlyph className="size-[18px]" />
                          </button>
                          {guide ? (
                            // Beside the button, on the action row, so it never covers the post's text
                            <span className="pointer-events-none absolute top-1/2 left-full z-10 ml-1 flex -translate-y-1/2 items-center motion-safe:animate-[nudge_1s_ease-in-out_infinite]">
                              <span className="block size-0 border-y-[6px] border-r-[6px] border-y-transparent border-r-block" />
                              <span className="block bg-block px-2.5 py-1 font-heading text-[11px] tracking-[0.08em] whitespace-nowrap text-white uppercase">
                                {animation === "explode" ? "Hold me" : "Click me"}
                              </span>
                            </span>
                          ) : null}
                        </span>
                      </>
                    }
                  />
                )
              })}

              {badLeft === 0 ? (
                <div className="pop-in flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <p className="text-[17px] font-bold text-x-text">Your feed is clean.</p>
                  <p className="max-w-xs text-sm text-x-dim">
                    That&apos;s the whole idea. On x.com, XBlock blocks them for real.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-1 inline-flex items-center gap-2 rounded-full border border-x-line px-4 py-2 text-sm font-bold text-x-text hover:bg-x-hover"
                  >
                    <RotateCcwIcon className="size-4" aria-hidden="true" />
                    Bring the trolls back
                  </button>
                </div>
              ) : null}
            </div>

            {/* X's toasts, at the bottom of the feed */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 px-4" aria-live="polite">
              {toasts.map((t) => (
                <div
                  key={t.key}
                  className={cn(
                    "pop-in pointer-events-auto flex items-center gap-3 rounded-[4px] px-4 py-2.5 text-[15px] text-white shadow-lg",
                    t.tone === "block" && "bg-brand",
                    t.tone === "mute" && "bg-brand",
                    t.tone === "allow" && "bg-success"
                  )}
                >
                  <span>{t.text}</span>
                  {t.undo ? (
                    <button type="button" onClick={() => undo(t.id)} className="font-bold underline-offset-2 hover:underline">
                      Undo
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* The extension's settings, as in its popup */}
      <aside className="flex flex-col gap-8 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l" aria-label="XBlock settings">
        <div>
          <p className="font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Blocked in this demo
          </p>
          <p className="mt-2 flex items-baseline gap-3">
            <span className="font-heading text-6xl font-medium tracking-[-0.04em] tabular-nums">
              {counts.block + counts.mute}
            </span>
            <span className="text-sm text-muted-foreground">
              {counts.block} blocked · {counts.mute} muted
            </span>
          </p>
        </div>

        <Choice label="Block animation" value={animation} options={ANIMATIONS} onChange={setAnimation} columns={3} />
        <Choice label="The block button on a post should" value={action} options={ACTIONS} onChange={setAction} columns={2} />

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-5">
          <p className="text-[13px] leading-snug text-muted-foreground">
            {animation === "explode"
              ? "Hold a post's block button until it blows."
              : animation === "samurai"
                ? "Click a post's block button, then slice it. Esc puts it back."
                : "Click a post's block button and it's gone."}
          </p>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset the demo feed"
            className="grid size-9 shrink-0 place-items-center border hover:bg-muted"
          >
            <RotateCcwIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  )
}

export { Playground }
