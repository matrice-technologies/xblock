import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getDictionary } from "@/lib/dictionaries"
import { HTML_LANG, isLocale, LOCALES, OG_LOCALE } from "@/lib/i18n"
import { SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

const jetbrainsMonoHeading = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
})

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const t = await getDictionary(lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s · XBlock" },
    description: t.meta.description,
    applicationName: "XBlock",
    keywords: ["X", "Twitter", "block", "mute", "blocklist", "Chrome extension", "trolls", "spam", "bots"],
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: "XBlock",
      title: t.meta.title,
      description: t.meta.description,
      url: `/${lang}`,
      locale: OG_LOCALE[lang],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return (
    <html
      lang={HTML_LANG[lang]}
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, jetbrainsMonoHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
