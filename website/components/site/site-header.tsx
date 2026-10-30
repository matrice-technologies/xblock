"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { LINKS } from "@/lib/site"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ChromeIcon, GitHubIcon } from "@/components/site/brand-icons"
import { XBlockLogo } from "@/components/site/logo"

const NAV = [
  { href: "/#try", label: "Try it" },
  { href: "/#features", label: "Features" },
  { href: "/#watch", label: "Watch" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/#open-source", label: "Open source" },
  { href: "/#faq", label: "FAQ" },
]

const navItem =
  "inline-flex h-9 items-center px-3 font-heading text-[13px] tracking-[0.06em] uppercase transition-colors hover:bg-muted"

function ThemeButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="frame"
      size="icon-lg"
      className={cn("size-10", className)}
      aria-label="Switch light or dark (or press D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* The icon follows the applied theme class, so it renders correctly before hydration. */}
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="XBlock, home">
          <XBlockLogo />
        </Link>

        <nav className="mx-auto hidden lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={navItem}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeButton className="hidden sm:inline-flex" />
          <a
            href={LINKS.github}
            className={cn(buttonVariants({ variant: "frame", size: "cta" }), "hidden sm:inline-flex")}
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
          <a
            href={LINKS.chromeStore}
            className={cn(buttonVariants({ variant: "default", size: "cta" }), "hidden sm:inline-flex")}
          >
            <ChromeIcon className="size-4" />
            Add to Chrome
          </a>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="frame"
                  size="icon-lg"
                  className="size-10 lg:hidden"
                  aria-label="Open menu"
                />
              }
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
                {NAV.map((item) => (
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
                <ThemeButton className="w-full" />
                <a href={LINKS.github} className={buttonVariants({ variant: "frame", size: "cta" })}>
                  <GitHubIcon className="size-4" />
                  GitHub
                </a>
                <a href={LINKS.chromeStore} className={buttonVariants({ variant: "default", size: "cta" })}>
                  <ChromeIcon className="size-4" />
                  Add to Chrome
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
