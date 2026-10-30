import type { Locale } from "@/lib/i18n"
import type { Dict } from "./en"

// Loaded on the server only: client components get just the slices they need, as props
const dictionaries: Record<Locale, () => Promise<Dict>> = {
  en: () => import("./en").then((m) => m.en),
  fr: () => import("./fr").then((m) => m.fr),
  es: () => import("./es").then((m) => m.es),
  de: () => import("./de").then((m) => m.de),
  ja: () => import("./ja").then((m) => m.ja),
  pt: () => import("./pt").then((m) => m.pt),
  id: () => import("./id").then((m) => m.id),
}

export const getDictionary = (locale: Locale) => dictionaries[locale]()

export type { Dict }
