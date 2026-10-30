"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const CLOUD_GLYPHS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const PULSE_GLYPHS = "×X/\\|#%01[]<>"
const LEVELS = 12

// Cloud look
const NOISE_SCALE = 0.0052
const DRIFT_PX_PER_S = 14
const MORPH_PER_S = 0.07
const BASE_ALPHA = 0.26
// Hover highlight
const HOVER_RADIUS = 170
const HOVER_GAIN = 0.62
// Click pulse
const PULSE_SPEED = 620
const PULSE_BAND = 40
const PULSE_LIFE = 1.9
const PULSE_PUSH = 26
const MAX_PULSES = 6
// Intro: the cloud materialises outward from the clear area, character by character
const REVEAL_DELAY = 0.15
const REVEAL_SPEED = 780
const REVEAL_BAND = 170
const REVEAL_JITTER = 280
// Words: now and then one surfaces in the cloud's brightest zone, letter by
// letter, breathes with the cloud under it, and gives its cells back
const WORD_FIRST = 1
const WORD_GAP = [1.3, 3] as const
const WORD_MAX = 2
const WORD_IN_STEP = 0.07
const WORD_HOLD = 2.2
const WORD_OUT_STEP = 0.1
const WORD_FADE = 0.45
const WORD_ALPHA = 0.85
/** Places a new word may try, and how deep in the cloud the best must be (its thinnest cell, letters and the rows around them). */
const WORD_TRIES = 160
const WORD_DENSITY = 0.42
/** The breath: how deep, and how fast. */
const WORD_PULSE = 0.22
const WORD_PULSE_SPEED = 2.4
/** How much of the cloud's own letter gives way under a word's. */
const WORD_COVER = 0.8

type Clear = {
  x: number
  y: number
  rx: number
  ry: number
  /** Upper bound for the horizontal radius in px, so the clear area stays text-sized on wide screens. */
  maxRx?: number
}
type Pulse = { x: number; y: number; born: number }
type Word = {
  text: string
  col: number
  row: number
  born: number
  /** Where in its breath it starts, so no two words pulse together. */
  phase: number
}

/** How much of a word's letter `j` shows at `t`: typed in, held, then handed back. */
function letterShown(word: Word, j: number, t: number) {
  const inAt = word.born + j * WORD_IN_STEP
  const outAt =
    word.born + word.text.length * WORD_IN_STEP + WORD_HOLD + j * WORD_OUT_STEP
  return (
    smoothstep(inAt, inAt + WORD_FADE, t) *
    (1 - smoothstep(outAt, outAt + WORD_FADE, t))
  )
}
const wordDone = (word: Word) =>
  word.born +
  word.text.length * (WORD_IN_STEP + WORD_OUT_STEP) +
  WORD_HOLD +
  WORD_FADE

function hash3(x: number, y: number, z: number) {
  let h =
    Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function valueNoise(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = x - xi
  const yf = y - yi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const w = zf * zf * (3 - 2 * zf)

  const c000 = hash3(xi, yi, zi)
  const c100 = hash3(xi + 1, yi, zi)
  const c010 = hash3(xi, yi + 1, zi)
  const c110 = hash3(xi + 1, yi + 1, zi)
  const c001 = hash3(xi, yi, zi + 1)
  const c101 = hash3(xi + 1, yi, zi + 1)
  const c011 = hash3(xi, yi + 1, zi + 1)
  const c111 = hash3(xi + 1, yi + 1, zi + 1)

  const x00 = c000 + (c100 - c000) * u
  const x10 = c010 + (c110 - c010) * u
  const x01 = c001 + (c101 - c001) * u
  const x11 = c011 + (c111 - c011) * u
  const y0 = x00 + (x10 - x00) * v
  const y1 = x01 + (x11 - x01) * v
  return y0 + (y1 - y0) * w
}

function fbm(x: number, y: number, z: number) {
  return (
    0.55 * valueNoise(x, y, z) +
    0.3 * valueNoise(x * 2.03 + 17.1, y * 2.03 + 5.3, z * 1.7) +
    0.15 * valueNoise(x * 4.11 + 3.7, y * 4.11 + 11.9, z * 2.3)
  )
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * A drifting cloud of ASCII characters drawn on a canvas that fills its parent.
 * Hovering brightens the cloud under the pointer; clicking sends a pulse ring
 * of characters across the field. Pointer events are read from the parent, so
 * content layered above the canvas stays interactive.
 */
function AsciiField({
  className,
  clear,
  intro = false,
  words,
}: {
  className?: string
  /** Ellipse (fractions of the field) where the cloud thins out to keep text legible. */
  clear?: Clear
  /**
   * Materialise the cloud outward from the clear area's centre, each
   * character flickering in before it settles, and fire one pulse from there.
   */
  intro?: boolean
  /** Words that now and then surface in the cloud, in the brand's colour, then dissolve back into it. */
  words?: string[]
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const clearRef = React.useRef(clear)
  const wordsRef = React.useRef(words)

  React.useEffect(() => {
    clearRef.current = clear
  }, [clear])

  React.useEffect(() => {
    wordsRef.current = words
  }, [words])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext("2d")
    if (!canvas || !host || !ctx) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let cellW = 7
    let cellH = 13
    let fontSize = 11
    let glyphs = new Uint8Array(0)
    let buckets: Int32Array[] = []
    const counts = new Int32Array(LEVELS * 2)
    // Words in the cloud: the cloud's density last frame (where a word can surface), and how much of each cell a word holds now.
    let densities = new Float32Array(0)
    let wordCover = new Float32Array(0)
    let activeWords: Word[] = []
    let nextWordAt = WORD_FIRST

    let fg = "#171717"
    let accent = "#f4212e"
    let hot = "#f4212e"
    let fontFamily = "ui-monospace, monospace"

    let pulses: Pulse[] = []
    let pointerX = -9999
    let pointerY = -9999
    let targetX = -9999
    let targetY = -9999
    let pointerInside = false
    let hover = 0

    let frameId = 0
    let running = false
    let visible = true
    const start = performance.now()

    function readTheme() {
      const styles = getComputedStyle(canvas!)
      fg = styles.getPropertyValue("--foreground").trim() || fg
      accent = styles.getPropertyValue("--brand").trim() || accent
      hot = styles.getPropertyValue("--block").trim() || hot
      fontFamily = styles.getPropertyValue("--font-mono").trim() || fontFamily
    }

    function resize() {
      const rect = host!.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.floor(width * dpr)
      canvas!.height = Math.floor(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      fontSize = width < 640 ? 10 : 11
      cellW = Math.round(fontSize * 0.66)
      cellH = Math.round(fontSize * 1.2)
      cols = Math.ceil(width / cellW)
      rows = Math.ceil(height / cellH)

      const total = cols * rows
      glyphs = new Uint8Array(total)
      for (let i = 0; i < total; i++) {
        glyphs[i] = (Math.random() * CLOUD_GLYPHS.length) | 0
      }
      buckets = Array.from({ length: LEVELS * 2 }, () => new Int32Array(total))
      densities = new Float32Array(total)
      wordCover = new Float32Array(total)
      activeWords = []
      if (!running) draw(performance.now())
    }

    function draw(now: number) {
      const t = (now - start) / 1000
      const clearArea = clearRef.current

      pointerX += (targetX - pointerX) * 0.2
      pointerY += (targetY - pointerY) * 0.2
      hover += ((pointerInside ? 1 : 0) - hover) * 0.08
      pulses = pulses.filter((p) => t - p.born < PULSE_LIFE)

      counts.fill(0)
      const drift = t * DRIFT_PX_PER_S
      const z = t * MORPH_PER_S
      const hoverR2 = HOVER_RADIUS * HOVER_RADIUS

      // The intro's front, going out from the clear area until it has passed every corner.
      const revealFront = (t - REVEAL_DELAY) * REVEAL_SPEED
      const revealing =
        intro &&
        !reducedMotion &&
        revealFront < Math.hypot(width, height) + REVEAL_JITTER + REVEAL_BAND
      const revealX = (clearArea?.x ?? 0.5) * width
      const revealY = (clearArea?.y ?? 0.5) * height

      // Words: retire the finished, now and then surface a new one in the
      // middle of the cloud's brightest zone, and mark the cells each holds.
      const wordList = wordsRef.current
      if (wordList?.length && !reducedMotion) {
        activeWords = activeWords.filter((w) => t < wordDone(w))
        if (t >= nextWordAt && activeWords.length < WORD_MAX) {
          const text = wordList[(Math.random() * wordList.length) | 0]
          // Of many places, the one deepest in the cloud: scored by its
          // thinnest cell, the letters' and the rows above and below them,
          // so a word sits in the heart of a bright zone, not on its edge.
          let best = { score: 0, col: 0, row: 0 }
          for (let attempt = 0; attempt < WORD_TRIES; attempt++) {
            const col = 1 + ((Math.random() * (cols - text.length - 2)) | 0)
            const row = 2 + ((Math.random() * (rows - 4)) | 0)
            if (col < 1 || row < 2) continue
            const apart = activeWords.every(
              (w) =>
                Math.abs(w.row - row) >= 3 ||
                col >= w.col + w.text.length + 2 ||
                w.col >= col + text.length + 2
            )
            if (!apart) continue
            let score = 1
            for (let j = -1; j <= text.length && score > best.score; j++) {
              for (let dr = -1; dr <= 1; dr++) {
                score = Math.min(score, densities[(row + dr) * cols + col + j])
              }
            }
            if (score > best.score) best = { score, col, row }
          }
          if (best.score >= WORD_DENSITY) {
            activeWords.push({
              text,
              col: best.col,
              row: best.row,
              born: t,
              phase: Math.random() * Math.PI * 2,
            })
            nextWordAt =
              t + WORD_GAP[0] + Math.random() * (WORD_GAP[1] - WORD_GAP[0])
          } else {
            // No zone bright enough yet: look again shortly.
            nextWordAt = t + 0.25
          }
        }
      }
      wordCover.fill(0)
      for (const w of activeWords) {
        for (let j = 0; j < w.text.length; j++) {
          wordCover[w.row * cols + w.col + j] = letterShown(w, j, t)
        }
      }

      for (let r = 0; r < rows; r++) {
        const y = r * cellH + cellH / 2
        for (let c = 0; c < cols; c++) {
          const x = c * cellW + cellW / 2
          const i = r * cols + c

          let ring = 0
          let pushX = 0
          let pushY = 0
          for (let p = 0; p < pulses.length; p++) {
            const pulse = pulses[p]
            const dx = x - pulse.x
            const dy = y - pulse.y
            const d = Math.sqrt(dx * dx + dy * dy) || 1
            const age = t - pulse.born
            const radius = age * PULSE_SPEED
            const life = (1 - age / PULSE_LIFE) ** 2
            const front = (d - radius) / PULSE_BAND
            const echo = (d - radius * 0.62) / (PULSE_BAND * 0.8)
            const k = Math.exp(-front * front) * life
            ring += k + Math.exp(-echo * echo) * life * 0.45
            const push = (k * PULSE_PUSH) / d
            pushX += dx * push
            pushY += dy * push
          }

          const n = fbm(
            (x - pushX + drift) * NOISE_SCALE,
            (y - pushY) * NOISE_SCALE * 1.25,
            z
          )
          let density = smoothstep(0.5, 0.7, n)
          let openness = 1

          if (clearArea) {
            // Text spans the full width on phones, so the clear area does too.
            const rx =
              width < 640
                ? Math.max(clearArea.rx, 0.75)
                : Math.min(clearArea.rx, (clearArea.maxRx ?? Infinity) / width)
            const ex = (x / width - clearArea.x) / rx
            const ey = (y / height - clearArea.y) / clearArea.ry
            openness = smoothstep(0.55, 1.3, ex * ex + ey * ey)
            density *= 0.12 + 0.88 * openness
          }
          densities[i] = density

          let lift = 0
          if (hover > 0.01) {
            const hx = x - pointerX
            const hy = y - pointerY
            lift = Math.exp(-(hx * hx + hy * hy) / hoverR2) * hover
          }

          if (Math.random() < 0.0025 + lift * 0.06) {
            glyphs[i] = (Math.random() * CLOUD_GLYPHS.length) | 0
          }

          let alpha: number
          let layer: number
          if (ring > 0.12) {
            alpha =
              Math.min(1, ring) *
              (0.4 + 0.6 * Math.min(1, density * 1.4 + 0.15)) *
              (0.35 + 0.65 * openness)
            layer = LEVELS
          } else if (density > 0.02) {
            alpha = density * (BASE_ALPHA + lift * HOVER_GAIN)
            layer = 0
            if (revealing) {
              // Each character arrives a little after the front, at its own moment.
              const d =
                Math.hypot(x - revealX, y - revealY) +
                hash3(c, r, 11) * REVEAL_JITTER
              const reveal = smoothstep(0, 1, (revealFront - d) / REVEAL_BAND)
              // A word may only surface where the cloud has fully arrived.
              if (reveal < 0.7) densities[i] = 0
              if (reveal <= 0) continue
              if (reveal < 0.55) {
                // First a flicker in the brand's colour, scrambling...
                alpha =
                  Math.min(1, density * 2 + 0.15) *
                  Math.sin((Math.PI * reveal) / 0.55) *
                  0.85
                layer = LEVELS
              } else {
                // ...then it settles into the cloud.
                alpha *= smoothstep(0.55, 1, reveal)
              }
            }
            // Under a word, the cloud's own letter gives way, and comes back as the word lets go.
            if (wordCover[i] > 0) alpha *= 1 - WORD_COVER * wordCover[i]
          } else {
            continue
          }
          if (alpha < 0.03) continue

          const level = Math.min(LEVELS - 1, (alpha * LEVELS) | 0)
          const slot = layer + level
          buckets[slot][counts[slot]++] = i
        }
      }

      ctx!.clearRect(0, 0, width, height)
      ctx!.font = `${fontSize}px ${fontFamily}`
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"

      for (let layer = 0; layer < 2; layer++) {
        // Pulses and the intro's flicker in X red, like the words (below)
        ctx!.fillStyle = layer === 0 ? fg : hot
        for (let level = 0; level < LEVELS; level++) {
          const slot = layer * LEVELS + level
          const count = counts[slot]
          if (count === 0) continue
          ctx!.globalAlpha = (level + 0.5) / LEVELS
          const list = buckets[slot]
          for (let j = 0; j < count; j++) {
            const i = list[j]
            const c = i % cols
            const r = (i / cols) | 0
            const glyph =
              layer === 0
                ? CLOUD_GLYPHS[glyphs[i]]
                : PULSE_GLYPHS[(Math.random() * PULSE_GLYPHS.length) | 0]
            ctx!.fillText(glyph, c * cellW + cellW / 2, r * cellH + cellH / 2)
          }
        }
      }

      // The words, in the brand's colour: each letter as much as it shows,
      // as thick as the cloud under it is now (so it swells and thins with
      // the cloud, and fades if the cloud drifts away), and breathing.
      ctx!.fillStyle = accent
      for (const w of activeWords) {
        for (let j = 0; j < w.text.length; j++) {
          const cell = w.row * cols + w.col + j
          const shown = wordCover[cell]
          if (shown < 0.02) continue
          const cloud = 0.15 + 0.85 * smoothstep(0.05, 0.75, densities[cell])
          const breath =
            1 -
            WORD_PULSE +
            WORD_PULSE *
              (0.5 + 0.5 * Math.sin(t * WORD_PULSE_SPEED + w.phase + j * 0.45))
          ctx!.globalAlpha = shown * WORD_ALPHA * cloud * breath
          ctx!.fillText(
            w.text[j],
            (w.col + j) * cellW + cellW / 2,
            w.row * cellH + cellH / 2
          )
        }
      }
      ctx!.globalAlpha = 1
    }

    function loop(now: number) {
      draw(now)
      frameId = requestAnimationFrame(loop)
    }

    function play() {
      if (running || reducedMotion || !visible || document.hidden) return
      running = true
      frameId = requestAnimationFrame(loop)
    }

    function pause() {
      running = false
      cancelAnimationFrame(frameId)
    }

    function localPoint(event: PointerEvent) {
      const rect = host!.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    function onPointerMove(event: PointerEvent) {
      const point = localPoint(event)
      if (!pointerInside) {
        pointerX = point.x
        pointerY = point.y
      }
      targetX = point.x
      targetY = point.y
      pointerInside = true
    }

    function onPointerLeave() {
      pointerInside = false
    }

    function addPulse(x: number, y: number) {
      const t = (performance.now() - start) / 1000
      pulses.push({ x, y, born: t })
      if (pulses.length > MAX_PULSES) pulses.shift()
    }

    function onPointerDown(event: PointerEvent) {
      if (reducedMotion) return
      const target = event.target as HTMLElement | null
      if (
        target?.closest("a, button, input, textarea, select, [role=button]")
      ) {
        return
      }
      const point = localPoint(event)
      addPulse(point.x, point.y)
    }

    function onVisibility() {
      if (document.hidden) pause()
      else play()
    }

    readTheme()
    resize()

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(host)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
      else pause()
    })
    intersection.observe(host)

    const themeObserver = new MutationObserver(() => {
      readTheme()
      if (!running) draw(performance.now())
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    host.addEventListener("pointermove", onPointerMove)
    host.addEventListener("pointerleave", onPointerLeave)
    host.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("visibilitychange", onVisibility)
    document.fonts?.ready.then(() => {
      readTheme()
      if (!running) draw(performance.now())
    })

    let introTimer = 0
    if (intro && !reducedMotion) {
      introTimer = window.setTimeout(() => {
        const area = clearRef.current
        addPulse((area?.x ?? 0.5) * width, (area?.y ?? 0.5) * height)
      }, 450)
    }

    play()

    return () => {
      pause()
      window.clearTimeout(introTimer)
      resizeObserver.disconnect()
      intersection.disconnect()
      themeObserver.disconnect()
      host.removeEventListener("pointermove", onPointerMove)
      host.removeEventListener("pointerleave", onPointerLeave)
      host.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [intro])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        className
      )}
    />
  )
}

export { AsciiField }
