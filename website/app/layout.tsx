import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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

const description =
  "Block trolls, bots and spam on X in one click, share your block lists, and subscribe to other people's. Free, open source, no account."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XBlock · Block trolls on X in one click",
    template: "%s · XBlock",
  },
  description,
  applicationName: "XBlock",
  keywords: ["X", "Twitter", "block", "mute", "blocklist", "block list", "Chrome extension", "trolls", "spam", "bots"],
  openGraph: {
    type: "website",
    siteName: "XBlock",
    title: "XBlock · Block trolls on X in one click",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "XBlock · Block trolls on X in one click",
    description,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        jetbrainsMonoHeading.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
