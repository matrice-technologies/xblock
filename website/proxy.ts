import { NextResponse, type NextRequest } from "next/server"

import { isLocale, LOCALE_COOKIE, matchLocale } from "@/lib/i18n"

// Every page lives under its language (/en, /fr/privacy…). A path without one
// goes to the language picked in the switcher before, else the browser's.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isLocale(pathname.split("/")[1])) return

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = isLocale(remembered) ? remembered : matchLocale(request.headers.get("accept-language"))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Not Next's own files, the media folder, or anything with an extension (icon.png, robots.txt…)
  matcher: ["/((?!_next|media|.*\\..*).*)"],
}
