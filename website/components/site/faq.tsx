import { PlusIcon } from "lucide-react"

import { fill } from "@/lib/i18n"
import { LINKS } from "@/lib/site"
import type { Dict } from "@/lib/dictionaries/en"
import { Rich } from "@/components/site/rich"

/** The questions, each opening in place. Plain details/summary, so it works without JavaScript. */
function Faq({ items }: { items: Dict["faq"]["items"] }) {
  return (
    <div className="divide-y border-b">
      {items.map(({ q, a }) => (
        <details key={q} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-6 px-4 py-6 transition-colors hover:bg-muted/50 sm:px-6 lg:px-10 [&::-webkit-details-marker]:hidden">
            <span className="flex-1 text-lg font-medium tracking-[-0.01em]">{q}</span>
            <PlusIcon className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="max-w-3xl px-4 pb-8 leading-relaxed text-muted-foreground sm:px-6 lg:px-10">
            <Rich text={fill(a, { coffee: LINKS.coffee })} bold="font-medium text-foreground" />
          </p>
        </details>
      ))}
    </div>
  )
}

export { Faq }
