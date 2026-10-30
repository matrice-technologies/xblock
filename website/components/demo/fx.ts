// The block explosion, ported from the extension (chrome_extension/src/content/content.js): a
// full-page canvas running a small particle simulation only while something is
// on screen. Flash, shockwave, shards of the post, sparks, embers and smoke.

export const rand = (min: number, max: number) => min + Math.random() * (max - min)
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// White-hot -> yellow -> orange -> deep red, as debris cools down
const HEAT_RAMP = [
  [255, 255, 255],
  [255, 214, 90],
  [255, 120, 30],
  [170, 30, 10],
]

export function heatColor(t: number, alpha: number) {
  const scaled = Math.min(Math.max(t, 0), 1) * (HEAT_RAMP.length - 1)
  const i = Math.min(Math.floor(scaled), HEAT_RAMP.length - 2)
  const f = scaled - i
  const [from, to] = [HEAT_RAMP[i], HEAT_RAMP[i + 1]]
  const channel = (k: number) => Math.round(from[k] + (to[k] - from[k]) * f)
  return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${Math.max(alpha, 0)})`
}

export type Theme = {
  isLight: boolean
  shardFill: string
  smoke: string
  blend: GlobalCompositeOperation
  heat: number
}

/** The page's look, read from the theme class: the debris is drawn in it. */
export function pageTheme(): Theme {
  const isLight = !document.documentElement.classList.contains("dark")
  const [r, g, b] = isLight ? [255, 255, 255] : [0, 0, 0]
  // Shards are the page colour nudged towards the contrast colour, so they read as the card
  const mix = (c: number) => Math.round(isLight ? c * 0.9 : c + (255 - c) * 0.1)
  return {
    isLight,
    shardFill: `${mix(r)}, ${mix(g)}, ${mix(b)}`,
    smoke: isLight ? "90, 90, 90" : "150, 150, 150",
    // Additive glow looks great on dark themes but vanishes on white
    blend: isLight ? "source-over" : "lighter",
    // White-hot is invisible on a white page, so start the heat ramp at orange there
    heat: isLight ? 0.45 : 0,
  }
}

export type FxItem = {
  kind: "smoke" | "shard" | "spark" | "ember" | "ring" | "bloom" | "flash" | "slash" | "glint"
  x: number
  y: number
  vx?: number
  vy?: number
  drag?: number
  gravity?: number
  rot?: number
  vr?: number
  wobble?: number
  phase?: number
  size?: number
  age: number
  life: number
  color?: string
  blend?: GlobalCompositeOperation
  heat?: number
  points?: [number, number][]
  width?: number
  height?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

export function stepFx(item: FxItem, dt: number) {
  item.age += dt
  if (item.vx !== undefined && item.vy !== undefined) {
    const drag = Math.exp(-(item.drag ?? 0) * dt)
    item.vx *= drag
    item.vy = item.vy * drag + (item.gravity ?? 0) * dt
    item.x += item.vx * dt
    item.y += item.vy * dt
  }
  if (item.vr) item.rot = (item.rot ?? 0) + item.vr * dt
  if (item.wobble) item.x += Math.sin(item.age * 6 + (item.phase ?? 0)) * item.wobble * dt
  return item.age < item.life
}

export function drawFx(ctx: CanvasRenderingContext2D, item: FxItem) {
  const t = Math.min(item.age / item.life, 1)
  const size = item.size ?? 0
  ctx.globalCompositeOperation = item.blend || "source-over"

  switch (item.kind) {
    case "smoke": {
      const radius = size * (1 + 1.6 * easeOutCubic(t))
      const alpha = 0.18 * (1 - t) * Math.min(1, t * 6)
      const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, radius)
      gradient.addColorStop(0, `rgba(${item.color}, ${alpha})`)
      gradient.addColorStop(1, `rgba(${item.color}, 0)`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(item.x, item.y, radius, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case "shard": {
      const fade = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35
      const shrink = 1 - 0.3 * t
      ctx.save()
      ctx.translate(item.x, item.y)
      ctx.rotate(item.rot ?? 0)
      ctx.scale(shrink, shrink)
      ctx.beginPath()
      item.points!.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      ctx.closePath()
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = `rgba(${item.color}, ${fade})`
      ctx.fill()
      // Edges start molten and cool faster than the shard fades
      ctx.globalCompositeOperation = item.blend ?? "source-over"
      ctx.strokeStyle = heatColor(Math.max(0.15, item.heat ?? 0) + t * 1.2, fade * (1 - t * 0.6))
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()
      break
    }
    case "spark": {
      // Streak along the velocity so fast sparks read as motion, not dots
      const heat = item.heat ?? 0
      ctx.strokeStyle = heatColor(heat + t * (1 - heat), 1 - t * t)
      ctx.lineWidth = size * (1 - t * 0.6)
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(item.x - (item.vx ?? 0) * 0.025, item.y - (item.vy ?? 0) * 0.025)
      ctx.lineTo(item.x, item.y)
      ctx.stroke()
      break
    }
    case "ember": {
      const flicker = 0.6 + 0.4 * Math.sin(item.age * 30 + (item.phase ?? 0))
      ctx.fillStyle = heatColor(0.35 + t * 0.6, (1 - t) * flicker)
      ctx.beginPath()
      ctx.arc(item.x, item.y, size, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case "ring": {
      const radius = size * easeOutCubic(t)
      ctx.strokeStyle = heatColor(Math.max(0.25, item.heat ?? 0) + t * 0.5, 0.9 * Math.pow(1 - t, 2))
      ctx.lineWidth = 2 + 12 * (1 - t)
      ctx.beginPath()
      ctx.arc(item.x, item.y, radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * Math.pow(1 - t, 3)})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(item.x, item.y, radius * 0.82, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case "bloom": {
      const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, size)
      gradient.addColorStop(0, `rgba(255, 220, 160, ${0.75 * (1 - t)})`)
      gradient.addColorStop(0.4, `rgba(255, 140, 50, ${0.35 * (1 - t)})`)
      gradient.addColorStop(1, "rgba(255, 100, 0, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(item.x, item.y, size, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case "flash": {
      ctx.fillStyle = `rgba(255, 244, 225, ${0.9 * Math.pow(1 - t, 2)})`
      ctx.fillRect(item.x, item.y, item.width ?? 0, item.height ?? 0)
      break
    }
  }
}

// --- The page-wide canvas, created on first use ---

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let dpr = 1
let items: FxItem[] = []
let frame = 0
let lastTime = 0
let freezeUntil = 0

function resize() {
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
}

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "90",
    pointerEvents: "none", // keep the page clickable underneath
  })
  ctx = canvas.getContext("2d")
  resize()
  window.addEventListener("resize", resize)
  document.body.appendChild(canvas)
}

// Debris lives in page coordinates, so scrolling while it flies keeps it in place
let scrollAtSpawn = { x: 0, y: 0 }

function run(time: number) {
  const dt = Math.min((time - lastTime) / 1000, 1 / 30)
  lastTime = time
  // Hit-stop: hold the first frame of the blast for a beat before it flies apart
  const frozen = time < freezeUntil
  const c = ctx!
  c.setTransform(dpr, 0, 0, dpr, 0, 0)
  c.clearRect(0, 0, window.innerWidth, window.innerHeight)
  c.translate(scrollAtSpawn.x - window.scrollX, scrollAtSpawn.y - window.scrollY)

  if (!frozen) items = items.filter((item) => stepFx(item, dt))
  items.forEach((item) => drawFx(c, item))
  c.globalCompositeOperation = "source-over"

  frame = items.length > 0 ? requestAnimationFrame(run) : 0
  if (!frame) c.clearRect(-1e4, -1e4, 2e4, 2e4)
}

function start() {
  if (frame) return
  lastTime = performance.now()
  frame = requestAnimationFrame(run)
}

function spawnShards(rect: DOMRect, originX: number, originY: number, theme: Theme) {
  const cols = Math.max(3, Math.min(8, Math.round(rect.width / 85)))
  const rows = Math.max(2, Math.min(9, Math.round(rect.height / 85)))
  const cellWidth = rect.width / cols
  const cellHeight = rect.height / rows
  const reach = Math.hypot(rect.width, rect.height)

  // Jittered lattice; points on the border stay put so the shards tile the post exactly
  const lattice: [number, number][][] = []
  for (let row = 0; row <= rows; row++) {
    lattice.push([])
    for (let col = 0; col <= cols; col++) {
      const jitterX = col > 0 && col < cols ? rand(-0.35, 0.35) * cellWidth : 0
      const jitterY = row > 0 && row < rows ? rand(-0.35, 0.35) * cellHeight : 0
      lattice[row].push([rect.left + col * cellWidth + jitterX, rect.top + row * cellHeight + jitterY])
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = lattice[row][col]
      const b = lattice[row][col + 1]
      const c = lattice[row + 1][col + 1]
      const d = lattice[row + 1][col]
      const triangles = Math.random() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]

      triangles.forEach((triangle) => {
        const x = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3
        const y = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
        const dx = x - originX
        const dy = y - originY
        const distance = Math.hypot(dx, dy) || 1
        // Pieces closest to the blast fly fastest
        const speed = rand(250, 650) * (1 - Math.min(distance / reach, 1) * 0.5)
        items.push({
          kind: "shard",
          points: triangle.map(([px, py]) => [px - x, py - y] as [number, number]),
          x,
          y,
          vx: (dx / distance) * speed + rand(-60, 60),
          vy: (dy / distance) * speed + rand(-60, 60) - rand(150, 350),
          rot: 0,
          vr: rand(-8, 8),
          drag: 0.4,
          gravity: 1500,
          age: 0,
          life: rand(0.9, 1.5),
          color: theme.shardFill,
          blend: theme.blend,
          heat: theme.heat,
        })
      })
    }
  }
}

/** Blows `el` apart from (pressX, pressY), in viewport coordinates. */
export function explode(el: HTMLElement, pressX?: number, pressY?: number, shakeTarget?: HTMLElement | null) {
  ensureCanvas()
  if (!frame) scrollAtSpawn = { x: window.scrollX, y: window.scrollY }
  // Spawn in the coordinates the canvas is drawn in (the scroll it started at)
  const view = el.getBoundingClientRect()
  const ox = window.scrollX - scrollAtSpawn.x
  const oy = window.scrollY - scrollAtSpawn.y
  const rect = new DOMRect(view.left + ox, view.top + oy, view.width, view.height)
  const theme = pageTheme()
  const amount = reducedMotion() ? 0.4 : 1
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  // Blow outwards from between the post's centre and where it was pressed
  const originX = centerX + ((pressX !== undefined ? pressX + ox : centerX) - centerX) * 0.35
  const originY = centerY + ((pressY !== undefined ? pressY + oy : centerY) - centerY) * 0.35
  const pointIn = () => [rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height]

  // Pushed back-to-front: smoke behind, flash on top
  for (let i = 0; i < 10 * amount; i++) {
    const [x, y] = pointIn()
    items.push({
      kind: "smoke", x, y, vx: rand(-30, 30), vy: rand(-60, -20), drag: 1, gravity: 0,
      size: rand(25, 55), age: 0, life: rand(0.9, 1.6), color: theme.smoke,
    })
  }

  spawnShards(rect, originX, originY, theme)

  const sparkCount = Math.min(Math.max((rect.width * rect.height) / 1500, 80), 220) * amount
  for (let i = 0; i < sparkCount; i++) {
    // Most sparks burst from the blast point, the rest from all over the card
    const [x, y] = Math.random() < 0.6 ? [originX, originY] : pointIn()
    const angle = rand(0, Math.PI * 2)
    const speed = rand(300, 1300)
    items.push({
      kind: "spark", x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 200,
      drag: 2.2, gravity: 900, size: rand(1.2, 2.8), age: 0, life: rand(0.4, 1), blend: theme.blend, heat: theme.heat,
    })
  }

  for (let i = 0; i < 40 * amount; i++) {
    const [x, y] = pointIn()
    items.push({
      kind: "ember", x, y, vx: rand(-80, 80), vy: rand(-160, -40), drag: 0.8, gravity: -30,
      wobble: rand(10, 40), phase: rand(0, Math.PI * 2), size: rand(1, 2.4),
      age: 0, life: rand(1.2, 2.4), blend: theme.blend,
    })
  }

  items.push({
    kind: "ring", x: originX, y: originY, size: Math.hypot(rect.width, rect.height) * 0.6,
    age: 0, life: 0.5, blend: theme.blend, heat: theme.heat,
  })
  items.push({
    kind: "bloom", x: originX, y: originY, size: Math.max(rect.width, rect.height) * 0.6,
    age: 0, life: 0.35, blend: theme.blend,
  })
  items.push({
    kind: "flash", x: rect.left, y: rect.top, width: rect.width, height: rect.height, age: 0, life: 0.22,
  })

  freezeUntil = performance.now() + 55
  start()

  if (!reducedMotion() && shakeTarget) shake(shakeTarget, 8, 380)
}

/** A short decaying jolt, so the blast feels like it hit the page. */
export function shake(el: HTMLElement, amplitude: number, duration: number) {
  const begin = performance.now()
  function step(now: number) {
    const t = (now - begin) / duration
    if (t >= 1) {
      el.style.transform = ""
      return
    }
    const strength = amplitude * Math.pow(1 - t, 2)
    el.style.transform = `translate(${rand(-1, 1) * strength}px, ${rand(-1, 1) * strength}px)`
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
