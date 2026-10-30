"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { fill } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { Rich } from "@/components/site/rich"
import { drawFx, easeOutCubic, heatColor, rand, reducedMotion, stepFx, type FxItem } from "./fx"
import {
  polygonArea,
  polygonCentroid,
  pointInPolygon,
  splitPolygon,
  strokeCrossesPolygon,
  type Point,
} from "./samurai"
import { BlockGlyph, XPost, type Post } from "./x-post"

// The hero: Samurai mode, playable in the page. A troll's post floats on the
// stage; sweep the pointer through it to cut it (the extension's own geometry,
// from samurai.ts). Enough cuts and it falls, blocked, and the next one drops
// in. Left alone, a ghost blade slices it, so the hero is never still.

const TROLLS: Post[] = [
  { id: "h1", name: "Night Troll", handle: "troll_of_the_night", text: "Nobody asked for your opinion. Ratio + L + delete your account. 🤡", color: "#f91880", time: "2m", stats: ["9", "", "2", "640"] },
  { id: "h2", name: "Crypto King", handle: "crypto_king99", text: "$MOON is about to 100x 🚀🚀 Last chance to get in. DM me for the presale, only 20 spots left!!", color: "#ff7a00", time: "5m", verified: true, stats: ["212", "1K", "3K", "88K"] },
  { id: "h3", name: "Reply Guy", handle: "reply_guy_3000", text: "Actually, as someone who has never done your job, let me explain how it works. 🧐", color: "#7856ff", time: "8m", stats: ["41", "", "1", "2K"] },
  { id: "h4", name: "Fast Cash Daily", handle: "fastcash_daily", text: "Make $5,000 a day from home!!! 💸💸 No skills needed. Link in bio 👇", color: "#00ba7c", time: "11m", stats: ["", "430", "12", "40K"] },
  { id: "h5", name: "Rage Bait Daily", handle: "rage_bait_daily", text: "You won't BELIEVE what they said this time. Thread 🧵👇 (you'll be furious)", color: "#e0245e", time: "14m", stats: ["2K", "880", "5K", "1M"] },
]

// Blade speed (px per ms) needed for a sweep to cut, as in the extension
const MIN_SPEED = 0.45
const MIN_CUT_AREA = 0.004
const DROP_AREA = 0.05
// The post gives way after this many cuts, or this many floating pieces
const CUTS_TO_FINISH = 5
const PIECES_TO_FINISH = 8
const TRAIL_MS = 110
const INTRO_MS = 520
const NEXT_MS = 1300
// The ghost blade waits this long after a post lands, and after the visitor's last move
const AUTO_DELAY_MS = 1400
const USER_IDLE_MS = 6000

type Piece = {
  el: HTMLDivElement
  clip: HTMLDivElement
  points: Point[]
  area: number
  x: number
  y: number
  angle: number
  cx: number
  cy: number
  vx: number
  vy: number
  va: number
  falling: boolean
  cutAt: number
  entry: Point | null
}

type Round = {
  post: Post
  layer: HTMLDivElement
  pieces: Piece[]
  width: number
  height: number
  origin: { x: number; y: number }
  bornAt: number
  state: "intro" | "live" | "done"
  cuts: number
  /** Scripted slashes still to come, from the ghost blade. */
  script: { at: number; from: Point; to: Point }[]
}

type Callbacks = {
  onCut: (cuts: number) => void
  onSliced: (post: Post) => void
  onSpawn: (post: Post) => void
  /** Who holds the blade: the ghost, or the visitor (with a mouse, a pen or a finger). */
  onDriver: (driver: "ghost" | "you", pointer?: string) => void
}

function setPolygon(piece: Piece, points: Point[]) {
  // Moving the rotation origin to the new centroid must not move the piece on screen
  const centroid = polygonCentroid(points)
  const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle)
  const dx = centroid.x - piece.cx, dy = centroid.y - piece.cy
  piece.x += dx * cos - dy * sin - dx
  piece.y += dx * sin + dy * cos - dy
  piece.cx = centroid.x
  piece.cy = centroid.y
  piece.points = points
  piece.area = polygonArea(points)
  piece.el.style.transformOrigin = `${piece.cx}px ${piece.cy}px`
  piece.clip.style.clipPath = `polygon(${points.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(", ")})`
}

function toLayer(piece: Piece, x: number, y: number) {
  const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle)
  const ux = x - piece.cx, uy = y - piece.cy
  return { x: ux * cos - uy * sin + piece.cx + piece.x, y: ux * sin + uy * cos + piece.cy + piece.y }
}

function toPiece(piece: Piece, x: number, y: number) {
  const cos = Math.cos(-piece.angle), sin = Math.sin(-piece.angle)
  const ux = x - piece.cx - piece.x, uy = y - piece.cy - piece.y
  return { x: ux * cos - uy * sin + piece.cx, y: ux * sin + uy * cos + piece.cy }
}

/** Runs the stage inside `stage`, cloning posts from `source`'s children. Returns a cleanup. */
function createField(stage: HTMLDivElement, source: HTMLDivElement, callbacks: Callbacks) {
  const canvas = document.createElement("canvas")
  canvas.className = "pointer-events-none absolute inset-0 z-20 h-full w-full"
  canvas.setAttribute("aria-hidden", "true")
  stage.appendChild(canvas)
  const ctx = canvas.getContext("2d")!
  const still = reducedMotion()

  let width = 0, height = 0, dpr = 1
  let rounds: Round[] = []
  let fx: FxItem[] = []
  let trail: { x: number; y: number; t: number }[] = []
  let blade: { x: number; y: number; t: number } | null = null
  let ghost: { x: number; y: number; t: number } | null = null
  let next = 0
  let lastUserAt = -Infinity
  let driver: "ghost" | "you" = "ghost"
  let freezeUntil = 0
  let shakeUntil = 0
  let frame = 0
  let running = false
  let visible = true
  let lastTime = performance.now()
  let spawnTimer = 0

  function resize() {
    const rect = stage.getBoundingClientRect()
    width = rect.width
    height = rect.height
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
  }

  function spawn() {
    const index = next++ % TROLLS.length
    const template = source.children[index] as HTMLElement | undefined
    if (!template) return
    const w = template.offsetWidth, h = template.offsetHeight
    const layer = document.createElement("div")
    layer.className = "pointer-events-none absolute top-0 left-0 z-10"
    Object.assign(layer.style, { width: `${w}px`, height: `${h}px`, willChange: "transform, opacity" })
    const piece: Piece = {
      el: document.createElement("div"), clip: document.createElement("div"), points: [], area: 0,
      x: 0, y: 0, angle: 0, cx: 0, cy: 0, vx: 0, vy: 0, va: 0, falling: false, cutAt: 0, entry: null,
    }
    piece.el.className = "xbs-piece"
    piece.clip.className = "xbs-clip"
    const card = template.cloneNode(true) as HTMLElement
    card.removeAttribute("aria-hidden")
    piece.clip.appendChild(card)
    piece.el.appendChild(piece.clip)
    layer.appendChild(piece.el)
    stage.appendChild(layer)
    setPolygon(piece, [
      { x: 0, y: 0, cut: false }, { x: w, y: 0, cut: false },
      { x: w, y: h, cut: false }, { x: 0, y: h, cut: false },
    ])
    const round: Round = {
      post: TROLLS[index], layer, pieces: [piece], width: w, height: h,
      origin: { x: (width - w) / 2, y: (height - h) / 2 }, bornAt: performance.now(),
      state: "intro", cuts: 0, script: [],
    }
    rounds.push(round)
    callbacks.onSpawn(round.post)
  }

  function live() {
    return rounds.find((r) => r.state !== "done")
  }

  /** One blade movement from a to b (stage coordinates), from the visitor or the ghost. */
  function stroke(a: { x: number; y: number; t: number }, b: { x: number; y: number; t: number }) {
    const round = live()
    if (!round || round.state !== "live" || round.cuts >= CUTS_TO_FINISH) return
    const fast = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(b.t - a.t, 1) >= MIN_SPEED
    const la = { x: a.x - round.origin.x, y: a.y - round.origin.y }
    const lb = { x: b.x - round.origin.x, y: b.y - round.origin.y }
    ;[...round.pieces].forEach((piece) => {
      if (piece.falling) return
      const from = toPiece(piece, la.x, la.y)
      const to = toPiece(piece, lb.x, lb.y)
      const wasInside = pointInPolygon(piece.points, from.x, from.y)
      const isInside = pointInPolygon(piece.points, to.x, to.y)
      if (!wasInside && isInside) piece.entry = from
      else if (wasInside && isInside) {
        // Dawdling inside: the cut will start where the fast sweep begins
        if (!fast || !piece.entry) piece.entry = to
      } else if (wasInside && !isInside) {
        if (fast && piece.entry) cut(round, piece, piece.entry, to)
        piece.entry = null
      } else if (fast && strokeCrossesPolygon(piece.points, from, to)) cut(round, piece, from, to)
    })
  }

  function cut(round: Round, piece: Piece, start: Point, end: Point) {
    const length = Math.hypot(end.x - start.x, end.y - start.y)
    if (length < 8) return
    const direction = { x: (end.x - start.x) / length, y: (end.y - start.y) / length }
    const [left, right] = splitPolygon(piece.points, start, direction)
    if (left.length < 3 || right.length < 3) return
    const total = round.width * round.height
    if (polygonArea(left) < MIN_CUT_AREA * total || polygonArea(right) < MIN_CUT_AREA * total) return

    const chordIndex = left.findIndex((p) => p.cut === true && right.some((q) => q.x === p.x && q.y === p.y))
    const chordStart = left[chordIndex] || start
    const chordEnd = left[(chordIndex + 1) % left.length] || end

    const twinEl = piece.el.cloneNode(true) as HTMLDivElement
    const twin: Piece = { ...piece, el: twinEl, clip: twinEl.firstChild as HTMLDivElement, entry: null }
    round.layer.appendChild(twin.el)
    round.pieces.push(twin)
    setPolygon(piece, left)
    setPolygon(twin, right)
    piece.entry = null

    // Halves spring apart along the cut's normal, dragged a little along the blade
    const cos = Math.cos(piece.angle), sin = Math.sin(piece.angle)
    const normal = { x: -direction.y * cos - direction.x * sin, y: -direction.y * sin + direction.x * cos }
    const along = { x: direction.x * cos - direction.y * sin, y: direction.x * sin + direction.y * cos }
    const push = rand(60, 105)
    const spin = rand(0.15, 0.5) * (Math.random() < 0.5 ? -1 : 1)
    ;([[piece, 1], [twin, -1]] as const).forEach(([half, sign]) => {
      half.vx += normal.x * push * sign + along.x * 25
      half.vy += normal.y * push * sign + along.y * 25
      half.va += spin * sign
      half.cutAt = performance.now()
      if (half.area < DROP_AREA * total) drop(half, 0.6)
    })

    round.cuts++
    callbacks.onCut(round.cuts)
    slashFx(round, piece, chordStart, chordEnd)
    const floating = round.pieces.filter((p) => !p.falling).length
    if (round.cuts >= CUTS_TO_FINISH || floating >= PIECES_TO_FINISH) window.setTimeout(() => finish(round), 260)
  }

  function drop(piece: Piece, strength = 1) {
    piece.falling = true
    piece.vx += rand(-160, 160) * strength
    piece.vy -= rand(120, 380) * strength
    piece.va += rand(-3, 3) * strength
  }

  function slashFx(round: Round, piece: Piece, chordStart: Point, chordEnd: Point) {
    const screen = (p: Point) => {
      const q = toLayer(piece, p.x, p.y)
      return { x: q.x + round.origin.x, y: q.y + round.origin.y }
    }
    const a = screen(chordStart), b = screen(chordEnd)
    const dx = b.x - a.x, dy = b.y - a.y
    fx.push({ kind: "slash", x: 0, y: 0, x1: a.x - dx * 0.25, y1: a.y - dy * 0.25, x2: b.x + dx * 0.25, y2: b.y + dy * 0.25, age: 0, life: 0.3 })
    for (let i = 0; i < (still ? 10 : 26); i++) {
      const t = Math.random()
      const angle = Math.atan2(dy, dx) + ((Math.random() < 0.5 ? 1 : -1) * Math.PI) / 2 + rand(-0.9, 0.9)
      const speed = rand(200, 900)
      fx.push({
        kind: "spark", x: a.x + dx * t, y: a.y + dy * t, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        drag: 3, gravity: 900, size: rand(1, 2.4), age: 0, life: rand(0.25, 0.6), blend: "lighter", heat: 0,
      })
    }
    freezeUntil = performance.now() + (still ? 0 : 45)
    shakeUntil = performance.now() + (still ? 0 : 160)
  }

  function finish(round: Round) {
    if (round.state === "done") return
    round.state = "done"
    round.script = []
    round.pieces.forEach((piece) => {
      if (!piece.falling) drop(piece)
      piece.vy -= rand(0, 200)
    })
    callbacks.onSliced(round.post)
    window.clearTimeout(spawnTimer)
    spawnTimer = window.setTimeout(spawn, NEXT_MS)
  }

  /** The ghost blade's plan for a post: a few slashes through it at different angles. */
  function plan(round: Round, now: number) {
    const cx = round.width / 2, cy = round.height / 2
    const angles = [-0.35, 0.5, 1.45, -1.1, 0.15].sort(() => Math.random() - 0.5)
    round.script = angles.slice(0, CUTS_TO_FINISH).map((angle, i) => {
      const reach = Math.max(round.width, round.height) * 0.75
      const ox = rand(-0.18, 0.18) * round.width, oy = rand(-0.2, 0.2) * round.height
      return {
        at: now + i * 520,
        from: { x: cx + ox - Math.cos(angle) * reach, y: cy + oy - Math.sin(angle) * reach },
        to: { x: cx + ox + Math.cos(angle) * reach, y: cy + oy + Math.sin(angle) * reach },
      }
    })
  }

  // The ghost blade: each planned slash is a fast sweep, fed through stroke() like a real one
  const SLASH_MS = 150
  function runGhost(round: Round, now: number) {
    if (driver === "you" || still) return
    if (round.state === "live" && round.script.length === 0 && round.cuts === 0 && now - round.bornAt > INTRO_MS + AUTO_DELAY_MS) {
      plan(round, now)
    }
    const slash = round.script[0]
    if (!slash || now < slash.at) {
      ghost = null
      return
    }
    const t = Math.min((now - slash.at) / SLASH_MS, 1)
    const e = easeOutCubic(t)
    const point = {
      x: round.origin.x + slash.from.x + (slash.to.x - slash.from.x) * e,
      y: round.origin.y + slash.from.y + (slash.to.y - slash.from.y) * e,
      t: now,
    }
    if (ghost) stroke(ghost, point)
    ghost = point
    trail.push(point)
    if (t >= 1) {
      round.script.shift()
      ghost = null
    }
  }

  function local(event: PointerEvent) {
    const rect = stage.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, t: performance.now() }
  }

  function takeOver(pointer: string) {
    lastUserAt = performance.now()
    if (driver !== "you") {
      driver = "you"
      ghost = null
      rounds.forEach((r) => (r.script = []))
      callbacks.onDriver("you", pointer)
    }
  }

  function onMove(event: PointerEvent) {
    const point = local(event)
    takeOver(event.pointerType)
    trail.push(point)
    if (blade) stroke(blade, point)
    blade = point
  }
  function onDown(event: PointerEvent) {
    takeOver(event.pointerType)
    blade = local(event)
    trail.push(blade)
  }
  function onUp(event: PointerEvent) {
    if (event.pointerType !== "mouse") blade = null
  }
  function onLeave() {
    blade = null
  }

  function loop(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now
    // Hand the blade back to the ghost once the visitor has gone quiet
    if (driver === "you" && now - lastUserAt > USER_IDLE_MS) {
      driver = "ghost"
      callbacks.onDriver("ghost")
    }

    const jitter = now < shakeUntil ? 5 * ((shakeUntil - now) / 160) : 0
    rounds = rounds.filter((round) => {
      // Centred, bobbing gently while it waits
      const bob = still ? 0 : Math.sin((now - round.bornAt) / 520) * 6
      if (round.state !== "done") {
        round.origin.x = (width - round.width) / 2
        round.origin.y = (height - round.height) / 2 - 10 + bob
      }
      let scale = 1, opacity = 1
      if (round.state === "intro") {
        const t = Math.min((now - round.bornAt) / INTRO_MS, 1)
        scale = 0.82 + 0.18 * (1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2))
        opacity = Math.min(1, t * 1.6)
        round.origin.y -= (1 - easeOutCubic(t)) * 40
        if (t >= 1) {
          round.state = "live"
          fx.push({ kind: "glint", x: 0, y: 0, age: 0, life: 0.5 })
        }
      }
      round.layer.style.opacity = String(opacity)
      round.layer.style.transform = `translate(${round.origin.x + rand(-1, 1) * jitter}px, ${round.origin.y + rand(-1, 1) * jitter}px) scale(${scale})`

      runGhost(round, now)

      if (now >= freezeUntil) {
        round.pieces = round.pieces.filter((piece) => {
          const damping = Math.exp((piece.falling ? -0.3 : -4.5) * dt)
          piece.vx *= damping
          piece.vy = piece.vy * damping + (piece.falling ? 2600 : 0) * dt
          piece.va *= piece.falling ? 1 : damping
          if (!piece.falling) {
            // A soft spring keeps floating pieces on the stage
            const x = round.origin.x + piece.cx + piece.x, y = round.origin.y + piece.cy + piece.y
            const m = 40
            const overX = x < m ? m - x : Math.min(width - m - x, 0)
            const overY = y < m ? m - y : Math.min(height - m - y, 0)
            piece.vx += overX * 40 * dt
            piece.vy += overY * 40 * dt
          }
          piece.x += piece.vx * dt
          piece.y += piece.vy * dt
          piece.angle += piece.va * dt
          if (piece.falling && round.origin.y + piece.y > height + 900) {
            piece.el.remove()
            return false
          }
          piece.el.style.transform = `translate(${piece.x.toFixed(2)}px, ${piece.y.toFixed(2)}px) rotate(${piece.angle.toFixed(4)}rad)`
          return true
        })
      }
      if (round.state === "done" && round.pieces.length === 0) {
        round.layer.remove()
        return false
      }
      return true
    })

    draw(now, dt)
    frame = requestAnimationFrame(loop)
  }

  function draw(now: number, dt: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Cut edges: a hot glow that cools into a thin bright line
    rounds.forEach((round) => {
      round.pieces.forEach((piece) => {
        const heat = Math.min((now - piece.cutAt) / 450, 1)
        ctx.save()
        ctx.translate(round.origin.x + piece.x + piece.cx, round.origin.y + piece.y + piece.cy)
        ctx.rotate(piece.angle)
        ctx.translate(-piece.cx, -piece.cy)
        ctx.lineCap = "round"
        piece.points.forEach((p, i) => {
          if (!p.cut) return
          const q = piece.points[(i + 1) % piece.points.length]
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          if (heat < 1) {
            ctx.strokeStyle = heatColor(0.2 + heat, 1 - heat)
            ctx.shadowColor = "rgba(255, 90, 40, 0.9)"
            ctx.shadowBlur = 14 * (1 - heat)
            ctx.lineWidth = 4 - 2.5 * heat
            ctx.stroke()
          }
          ctx.shadowBlur = 0
          ctx.strokeStyle = "rgba(255, 255, 255, 0.35)"
          ctx.lineWidth = 1
          ctx.stroke()
        })
        ctx.restore()
      })
    })

    const round = live()
    fx = fx.filter((item) => {
      const alive = now < freezeUntil ? true : stepFx(item, dt)
      const t = Math.min(item.age / item.life, 1)
      if (item.kind === "slash") {
        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        ctx.lineCap = "round"
        ctx.shadowColor = "rgba(255, 45, 85, 0.95)"
        ctx.shadowBlur = 24
        ctx.strokeStyle = `rgba(255, 70, 100, ${0.8 * (1 - t)})`
        ctx.lineWidth = 10 * (1 - t)
        ctx.beginPath()
        ctx.moveTo(item.x1!, item.y1!)
        ctx.lineTo(item.x2!, item.y2!)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - t})`
        ctx.lineWidth = 2.5 * (1 - t * 0.7)
        ctx.stroke()
        ctx.restore()
      } else if (item.kind === "glint") {
        if (!round) return false
        // A blade-like sheen sweeping across the card
        const { x: ox, y: oy } = round.origin
        const x = ox - 200 + (round.width + 400) * easeOutCubic(t)
        const gradient = ctx.createLinearGradient(x - 120, 0, x + 120, 0)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.22 * (1 - t)})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.save()
        ctx.beginPath()
        ctx.rect(ox, oy, round.width, round.height)
        ctx.clip()
        ctx.globalCompositeOperation = "lighter"
        ctx.setTransform(dpr, 0, -0.35 * dpr, dpr, 0, 0)
        ctx.fillStyle = gradient
        ctx.fillRect(x - 120 + oy * 0.35, oy, 240 + round.height * 0.35, round.height)
        ctx.restore()
      } else {
        drawFx(ctx, item)
        ctx.globalCompositeOperation = "source-over"
      }
      return alive
    })

    // The blade: a tapered streak along the last few positions, and its tip
    trail = trail.filter((p) => now - p.t < TRAIL_MS)
    if (trail.length > 1) {
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      ctx.lineCap = "round"
      ctx.shadowColor = "rgba(255, 45, 85, 0.9)"
      ctx.shadowBlur = 16
      for (let i = 1; i < trail.length; i++) {
        const life = 1 - (now - trail[i].t) / TRAIL_MS
        ctx.strokeStyle = `rgba(255, 235, 240, ${0.9 * life})`
        ctx.lineWidth = 1 + 5 * life
        ctx.beginPath()
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
        ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()
      }
      ctx.restore()
    }
    const tip = driver === "you" ? blade : ghost
    if (tip) {
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      ctx.shadowColor = "rgba(255, 45, 85, 1)"
      ctx.shadowBlur = 12
      ctx.fillStyle = "rgba(255, 240, 245, 0.95)"
      ctx.beginPath()
      ctx.arc(tip.x, tip.y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function play() {
    if (running || !visible || document.hidden) return
    running = true
    lastTime = performance.now()
    frame = requestAnimationFrame(loop)
  }
  function pause() {
    running = false
    cancelAnimationFrame(frame)
  }
  function onVisibility() {
    if (document.hidden) pause()
    else play()
  }

  resize()
  const resizer = new ResizeObserver(resize)
  resizer.observe(stage)
  const watcher = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) play()
    else pause()
  })
  watcher.observe(stage)
  stage.addEventListener("pointermove", onMove)
  stage.addEventListener("pointerdown", onDown)
  stage.addEventListener("pointerup", onUp)
  stage.addEventListener("pointerleave", onLeave)
  document.addEventListener("visibilitychange", onVisibility)

  // Wait for the fonts, so the cloned posts are measured as they'll look
  let alive = true
  ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
    if (!alive) return
    spawn()
    play()
  })

  return () => {
    alive = false
    pause()
    window.clearTimeout(spawnTimer)
    resizer.disconnect()
    watcher.disconnect()
    stage.removeEventListener("pointermove", onMove)
    stage.removeEventListener("pointerdown", onDown)
    stage.removeEventListener("pointerup", onUp)
    stage.removeEventListener("pointerleave", onLeave)
    document.removeEventListener("visibilitychange", onVisibility)
    rounds.forEach((r) => r.layer.remove())
    canvas.remove()
  }
}

/** The playable Samurai stage of the hero. */
/** `hud`: show the prompt and score under the stage (the store images leave it out). */
function HeroSamurai({ t, verifiedLabel, hud = true, className }: { t: Dict["stage"]; verifiedLabel: string; hud?: boolean; className?: string }) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const sourceRef = React.useRef<HTMLDivElement>(null)
  const [cuts, setCuts] = React.useState(0)
  const [sliced, setSliced] = React.useState(0)
  const [driver, setDriver] = React.useState<"ghost" | "you">("ghost")
  const [toast, setToast] = React.useState<{ key: number; handle: string } | null>(null)
  const toastKey = React.useRef(0)
  const [finger, setFinger] = React.useState(false)

  React.useEffect(() => {
    const stage = stageRef.current
    const source = sourceRef.current
    if (!stage || !source) return
    return createField(stage, source, {
      onCut: setCuts,
      onSpawn: () => {
        setCuts(0)
        setToast(null)
      },
      onSliced: (post) => {
        setSliced((n) => n + 1)
        setToast({ key: ++toastKey.current, handle: post.handle })
      },
      onDriver: (next, pointer) => {
        setDriver(next)
        if (pointer) setFinger(pointer === "touch")
      },
    })
  }, [])

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div
        ref={stageRef}
        className="relative h-[340px] w-full cursor-none touch-pan-y select-none sm:h-[420px] lg:h-[480px]"
        aria-label={t.label}
        role="img"
      >
        {/* The stage's kanji, as in the extension: 斬, to cut */}
        <span
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] font-['Hiragino_Mincho_ProN','Yu_Mincho','Noto_Serif_JP',serif] text-[min(30rem,80vw)] leading-none font-black text-[rgba(255,45,85,0.07)]"
          aria-hidden="true"
        >
          斬
        </span>

        {/* The posts to clone, measured off-screen at the size they'll float at */}
        <div ref={sourceRef} aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0 w-[min(500px,calc(100%-32px))]">
          {TROLLS.map((post, i) => (
            <div key={post.id} className="xbs-card w-full bg-black text-x-text" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}>
              <XPost
                post={{ ...post, text: t.posts[i] ?? post.text }}
                verifiedLabel={verifiedLabel}
                className="border-b-0 bg-transparent"
                xblock={
                  <span className="grid size-[34px] place-items-center rounded-full bg-block/15 text-block">
                    <BlockGlyph className="size-[18px]" />
                  </span>
                }
              />
            </div>
          ))}
        </div>

        {toast ? (
          <div key={toast.key} className="pop-in absolute inset-x-0 bottom-6 z-30 flex justify-center">
            <span className="flex items-center gap-2 rounded-full border border-success/50 bg-[#0f1419] px-4 py-2 text-sm font-semibold text-success shadow-lg">
              ✓ <Rich text={fill(t.blocked, { handle: toast.handle })} bold="font-bold text-white" />
            </span>
          </div>
        ) : null}
      </div>

      {/* The HUD, like the extension's: what to do, and the score */}
      <div hidden={!hud} className="relative z-10 mx-auto -mt-2 flex items-center gap-3 rounded-full border border-white/12 bg-[rgba(12,12,16,0.72)] py-1.5 pr-1.5 pl-4 text-[13px] text-white/85 backdrop-blur-md">
        <span className="whitespace-nowrap">
          ⚔{" "}
          <span className="sm:hidden">{driver === "ghost" ? t.takeOverShort : t.sliceShort}</span>
          <span className="hidden sm:inline">
            {driver === "ghost" ? t.takeOver : finger ? t.sliceFinger : t.sliceMouse}
          </span>
        </span>
        <span className="font-bold whitespace-nowrap text-[#ff5577] tabular-nums">{fill(t.cuts, { n: cuts })}</span>
        <span className="whitespace-nowrap rounded-full bg-gradient-to-br from-[#ff2d55] to-[#c1121f] px-3 py-1.5 font-bold text-white tabular-nums shadow-[0_4px_18px_rgba(255,45,85,0.4)]">
          {fill(t.sliced, { n: sliced })}
        </span>
      </div>
    </div>
  )
}

export { HeroSamurai }
