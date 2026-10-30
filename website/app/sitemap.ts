import type { MetadataRoute } from "next"

import { HTML_LANG, LOCALES } from "@/lib/i18n"
import { SITE_URL } from "@/lib/site"

// Every page in every language, each pointing at its translations
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy"].flatMap((page) =>
    LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${page}`,
      changeFrequency: "monthly" as const,
      priority: page ? 0.4 : 1,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `${SITE_URL}/${l}${page}`])),
      },
    }))
  )
}
