// The long press before an explosion, ported from the extension
// (src/content/content.js, the block button's mousedown): the post trembles
// more and more, a red frame thickens around it and cracks run in from its
// edges. Let go early and nothing happens; hold to the end and it blows.

type Crack = { x: number; y: number; angle: number; length: number; maxLength: number; path: { x: number; y: number }[] }

export const CHARGE_MS = 1000

export function chargePost(post: HTMLElement, onComplete: () => void) {
  const canvas = document.createElement("canvas")
  canvas.className = "charge-frame"
  canvas.setAttribute("aria-hidden", "true")
  post.appendChild(canvas)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = post.offsetWidth
  const height = post.offsetHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext("2d")!
  ctx.scale(dpr, dpr)

  const startTime = performance.now()
  const cracks: Crack[] = []
  let frame = 0
  let lastShake = 0
  let done = false

  function generateCracks(count: number) {
    const centerX = width / 2
    const centerY = height / 2
    for (let i = 0; i < count; i++) {
      // From a random spot on a random side, roughly towards the middle
      const side = Math.floor(Math.random() * 4)
      const x = side === 1 ? width : side === 3 ? 0 : Math.random() * width
      const y = side === 0 ? 0 : side === 2 ? height : Math.random() * height
      const angle = Math.atan2(centerY - y, centerX - x) + (Math.random() - 0.5) * (Math.PI / 6)
      cracks.push({ x, y, angle, length: 0, maxLength: 30 + Math.random() * 70, path: [] })
    }
  }

  function drawCracks() {
    ctx.save()
    ctx.shadowBlur = 8
    cracks.forEach((crack) => {
      const eased = Math.pow(crack.length / crack.maxLength, 2)
      crack.angle += (Math.random() - 0.5) * 0.6
      const segment = 0.2 + Math.random() * 0.5 + eased * 4
      const last = crack.path.length ? crack.path[crack.path.length - 1] : crack
      crack.path.push({ x: last.x + Math.cos(crack.angle) * segment, y: last.y + Math.sin(crack.angle) * segment })

      // Thick and molten at the start, thin at the tip, a white core once it has grown
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < crack.path.length - 1; i++) {
          const p1 = i === 0 ? crack : crack.path[i - 1]
          const p2 = crack.path[i]
          ctx.strokeStyle = pass === 0 ? "rgba(255, 100, 0, 0.8)" : "white"
          ctx.shadowColor = pass === 0 ? "orange" : "white"
          ctx.lineWidth = pass === 0 ? 1 + (1 - i / crack.path.length) * 10 : 1
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
      crack.length++
    })
    ctx.restore()
  }

  function step(time: number) {
    const progress = Math.min((time - startTime) / CHARGE_MS, 1)
    const eased = progress * progress * progress

    // The tremble: a little scale, a wobble and a jitter, all growing
    if (time - lastShake >= 16) {
      const scale = 1 + 0.02 * eased
      const rotation = eased * Math.sin(time * 0.03)
      const tx = (Math.random() - 0.5) * 4 * progress
      const ty = (Math.random() - 0.5) * 4 * progress
      post.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(${scale})`
      lastShake = time
    }

    ctx.clearRect(0, 0, width, height)
    if (progress > 0.3) {
      if (cracks.length === 0) generateCracks(30)
      drawCracks()
    }
    ctx.strokeStyle = "rgba(255, 100, 0, 0.8)"
    ctx.lineWidth = 0.01 + 9 * progress
    ctx.strokeRect(0, 0, width, height)

    if (progress < 1) {
      frame = requestAnimationFrame(step)
    } else {
      done = true
      cleanup()
      onComplete()
    }
  }

  function cleanup() {
    cancelAnimationFrame(frame)
    canvas.remove()
    post.style.transform = ""
  }

  frame = requestAnimationFrame(step)
  return {
    cancel() {
      if (!done) cleanup()
    },
  }
}

/**
 * Closes the gap a post leaves, so the feed slides up under the debris
 * (collapseTweet in the extension).
 */
export function collapsePost(post: HTMLElement, onDone?: () => void) {
  post.style.visibility = "hidden"
  post.style.pointerEvents = "none"
  post.style.overflow = "hidden"
  post.style.height = `${post.offsetHeight}px`
  void post.offsetHeight // commit the starting height before transitioning
  post.style.transition = "height 420ms cubic-bezier(0.65, 0, 0.35, 1) 120ms, border-width 0s 540ms"
  post.style.height = "0px"
  post.style.borderBottomWidth = "0px"
  window.setTimeout(() => onDone?.(), 560)
}
