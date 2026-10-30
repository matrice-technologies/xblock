import { cn } from "@/lib/utils"

/** X's mark, as drawn in the extension's icon. */
const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"

/**
 * The extension's icon, redrawn: X's mark in a square, struck through by the
 * red bar of a "no" sign. Square corners, like the rest of the site.
 */
function XBlockMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        fill="none"
        stroke="var(--block)"
        strokeWidth="3"
      />
      <path d={X_PATH} transform="translate(6.2 6.2) scale(0.82)" fill="currentColor" />
      <path d="M4 4 28 28" stroke="var(--block)" strokeWidth="3" />
    </svg>
  )
}

function XBlockLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <XBlockMark className="size-[22px] text-foreground" />
      {/* Trim the line box to the cap height so the caps center on the mark. */}
      <span className="font-heading text-[15px] leading-none font-bold tracking-[0.14em] [text-box:trim-both_cap_alphabetic]">
        XBLOCK
      </span>
    </span>
  )
}

/** X's mark alone, for the look-alike X UI in the demos. */
function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={X_PATH} fill="currentColor" />
    </svg>
  )
}

export { XBlockLogo, XBlockMark, XMark }
