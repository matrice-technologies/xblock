"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { GlobeIcon, MenuIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { LINKS } from "@/lib/site"
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES, switchLocalePath, type Locale } from "@/lib/i18n"
import type { Dict } from "@/lib/dictionaries/en"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChromeIcon, GitHubIcon } from "@/components/site/brand-icons"
import { XBlockLogo } from "@/components/site/logo"

const navItem =
  "inline-flex h-9 items-center px-3 font-heading text-[13px] tracking-[0.06em] uppercase transition-colors hover:bg-muted"

function ThemeButton({ label, className }: { label: string; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="frame"
      size="icon-lg"
      className={cn("size-10", className)}
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* The icon follows the applied theme class, so it renders correctly before hydration. */}
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}

/** Picks the language: remembers it (proxy.ts reads the cookie) and opens this page in it. */
function LanguageMenu({ lang, label, className }: { lang: Locale; label: string; className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="frame" size="cta" className={cn("h-10 gap-1.5 px-3", className)} aria-label={label} />
        }
      >
        <GlobeIcon className="size-4" />
        {lang.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-none p-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {label}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={lang}
            onValueChange={(value) => {
              const next = value as Locale
              document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
              router.push(switchLocalePath(pathname, next) + window.location.hash)
            }}
          >
            {LOCALES.map((locale) => (
              <DropdownMenuRadioItem key={locale} value={locale} className="rounded-none py-2 text-sm">
                <span className="w-6 font-heading text-[11px] text-muted-foreground uppercase">{locale}</span>
                {LOCALE_NAMES[locale]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SiteHeader({ lang, t }: { lang: Locale; t: Dict["nav"] }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const closeMenu = () => setMenuOpen(false)
  const nav = [
    { href: `/${lang}#try`, label: t.try },
    { href: `/${lang}#features`, label: t.features },
    { href: `/${lang}#watch`, label: t.watch },
    { href: `/${lang}#privacy`, label: t.privacy },
    { href: `/${lang}#open-source`, label: t.openSource },
    { href: `/${lang}#faq`, label: t.faq },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <Link href={`/${lang}`} aria-label={t.home}>
          <XBlockLogo />
        </Link>

        <nav className="mx-auto hidden xl:flex" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={navItem}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <LanguageMenu lang={lang} label={t.language} />
          <ThemeButton label={t.theme} className="hidden sm:inline-flex" />
          <a href={LINKS.github} className={cn(buttonVariants({ variant: "frame", size: "cta" }), "hidden md:inline-flex")}>
            <GitHubIcon className="size-4" />
            {t.github}
          </a>
          <a href={LINKS.chromeStore} className={cn(buttonVariants({ variant: "default", size: "cta" }), "hidden sm:inline-flex")}>
            <ChromeIcon className="size-4" />
            {t.addToChrome}
          </a>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={<Button variant="frame" size="icon-lg" className="size-10 xl:hidden" aria-label={t.menu} />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="gap-0">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <XBlockLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="border-b px-4 py-4 font-heading text-sm tracking-[0.06em] uppercase hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 p-4">
                <ThemeButton label={t.theme} className="w-full" />
                <a href={LINKS.github} className={buttonVariants({ variant: "frame", size: "cta" })}>
                  <GitHubIcon className="size-4" />
                  {t.github}
                </a>
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  {t.addToChrome}
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
