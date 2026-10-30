import * as React from "react"
import Link from "next/link"

// Dictionary strings carry a little inline markup, so translations can move it
// around: **bold**, ==accent==, `code` and [text](href).
const TOKEN = /(\*\*[^*]+\*\*|==[^=]+==|`[^`]+`|\[[^\]]+\]\([^)]+\))/g

/**
 * A dictionary string with its markup rendered. `accent` styles ==…==, `bold`
 * styles **…**; links to /paths go through next/link.
 */
function Rich({
  text,
  accent = "text-block",
  bold = "font-semibold text-foreground",
  code = "bg-muted px-1 font-mono text-[0.9em] text-foreground",
  link = "text-brand underline underline-offset-4",
}: {
  text: string
  accent?: string
  bold?: string
  code?: string
  link?: string
}) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (!part) return null
        if (part.startsWith("**") && part.endsWith("**")) return <b key={i} className={bold}>{part.slice(2, -2)}</b>
        if (part.startsWith("==") && part.endsWith("==")) return <span key={i} className={accent}>{part.slice(2, -2)}</span>
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className={code}>{part.slice(1, -1)}</code>
        const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (match) {
          const [, label, href] = match
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={link}>{label}</Link>
          ) : (
            <a key={i} href={href} className={link}>{label}</a>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

/** The same string with the markup dropped, for attributes and metadata. */
function plain(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

export { plain, Rich }
