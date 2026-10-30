// The site's languages. A language is the first segment of every URL (/fr/…);
// proxy.ts sends visitors without one to theirs.

export const LOCALES = ["en", "fr", "es", "de", "ja", "pt", "id"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

/** What the language switcher shows: each language in its own words. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
  pt: "Português",
  id: "Bahasa Indonesia",
}

/** The page's lang attribute and Open Graph locale. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  es: "es",
  de: "de",
  ja: "ja",
  pt: "pt-BR",
  id: "id",
}
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  ja: "ja_JP",
  pt: "pt_BR",
  id: "id_ID",
}

/** The cookie that remembers a language picked in the switcher. */
export const LOCALE_COOKIE = "xblock_lang"

export const isLocale = (value: string | undefined): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value)

/** Fills {name} placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{([a-zA-Z]+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  )
}

/** The best of our languages for an Accept-Language header ("pt-BR,pt;q=0.9,en;q=0.8"). */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  const wanted = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=")
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 }
    })
    .filter((w) => w.lang && !Number.isNaN(w.q))
    .sort((a, b) => b.q - a.q)
  return wanted.map((w) => w.lang).find(isLocale) ?? DEFAULT_LOCALE
}

/** The same page in another language: /fr/privacy → /ja/privacy. */
export function switchLocalePath(pathname: string, locale: Locale) {
  const parts = pathname.split("/")
  if (isLocale(parts[1])) parts[1] = locale
  else parts.splice(1, 0, locale)
  return parts.join("/") || `/${locale}`
}
