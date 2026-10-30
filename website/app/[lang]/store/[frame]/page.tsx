import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale, LOCALES } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { FRAMES, type Frame } from "@/components/store/frames"
import { StoreFrame } from "@/components/store/store-frame"

// The Chrome Web Store images, one page per frame and language, for
// media/store/render.cjs to screenshot. Not meant for search engines.

export const metadata: Metadata = { title: "Store image", robots: { index: false, follow: false } }

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => Object.keys(FRAMES).map((frame) => ({ lang, frame })))
}

export default async function StorePage({ params }: PageProps<"/[lang]/store/[frame]">) {
  const { lang, frame } = await params
  if (!isLocale(lang) || !(frame in FRAMES)) notFound()
  const t = await getDictionary(lang)
  return <StoreFrame t={t} lang={lang} frame={frame as Frame} />
}
