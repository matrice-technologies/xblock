// The Chrome Web Store's image formats, by name and exact size. A plain module,
// so the server page (app/[lang]/store/[frame]) and the client frame share it.
export const FRAMES = {
  "screenshot-1": { width: 1280, height: 800 },
  "screenshot-2": { width: 1280, height: 800 },
  "screenshot-3": { width: 1280, height: 800 },
  "screenshot-4": { width: 1280, height: 800 },
  "screenshot-5": { width: 1280, height: 800 },
  "promo-small": { width: 440, height: 280 },
  "promo-marquee": { width: 1400, height: 560 },
} as const
export type Frame = keyof typeof FRAMES
