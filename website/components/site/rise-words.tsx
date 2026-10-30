import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Words that rise into place one after another, each from `start` seconds
 * plus `step` per word before it (globals.css, .rise-word). Plain text in
 * the markup, so it reads and indexes as usual; still with reduced motion.
 */
function RiseWords({
  text,
  start = 0,
  step = 0.07,
  className,
}: {
  text: string
  start?: number
  step?: number
  className?: string
}) {
  const words = text.split(" ")
  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            className={cn("rise-word", className)}
            style={
              { "--rise-delay": `${start + i * step}s` } as React.CSSProperties
            }
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </>
  )
}

export { RiseWords }
