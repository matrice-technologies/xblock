import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** The small red badge that names a section. */
function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-[6px] bg-brand/10 px-2 py-0.5 text-sm font-medium text-brand dark:bg-brand/15",
        className
      )}
    >
      {children}
    </p>
  )
}

/** The dashed strip that opens a section: its label, and a count on the right. */
function LabelStrip({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed px-4 py-5 font-heading text-[11px] tracking-[0.14em] uppercase sm:px-6 lg:px-10">
      <span className="flex items-center gap-2">
        <span className="text-block" aria-hidden="true">
          ⦸
        </span>
        {label}
      </span>
      <span className="text-muted-foreground">{"// " + count}</span>
    </div>
  )
}

function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow: string
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div
      id={id}
      className="scroll-mt-16 border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10"
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 max-w-3xl text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.02em]">
        {title}
      </h2>
      {children ? (
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          {children}
        </p>
      ) : null}
    </div>
  )
}

/**
 * A section of explanatory rows, each pairing copy with a diagram: a label strip,
 * a two-tone statement, then rows framed by hatched gutters.
 */
function ModuleSection({
  id,
  label,
  eyebrow,
  count,
  lead,
  rest,
  children,
}: {
  id?: string
  label: string
  eyebrow?: string
  count: string
  lead: string
  rest: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-b">
      <LabelStrip label={label} count={count} />
      <div className="border-b px-4 py-16 sm:px-6 sm:py-24 lg:px-[calc(2.5rem+5rem)]">
        <Eyebrow className="mb-6">{eyebrow ?? label}</Eyebrow>
        <p className="max-w-3xl text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.3] font-medium tracking-[-0.015em] text-balance">
          <span className="text-foreground">{lead}</span>{" "}
          <span className="text-muted-foreground">{rest}</span>
        </p>
      </div>
      <div className="grid lg:grid-cols-[5rem_minmax(0,1fr)_5rem]">
        <div className="hidden border-r bg-hatch lg:block" aria-hidden="true" />
        <div className="divide-y">{children}</div>
        <div className="hidden border-l bg-hatch lg:block" aria-hidden="true" />
      </div>
    </section>
  )
}

/**
 * A section built around one wide figure: the label strip, a heading beside
 * its lead, the figure across the frame, and a closing note under it.
 */
function FigureSection({
  id,
  label,
  count,
  eyebrow,
  title,
  lead,
  note,
  children,
  className,
}: {
  id: string
  label: string
  count: string
  eyebrow: string
  title: React.ReactNode
  lead: React.ReactNode
  note?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-16 border-b"
    >
      <LabelStrip label={label} count={count} />
      <div className="grid gap-x-16 gap-y-6 border-b px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-end lg:px-10">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2
            id={`${id}-title`}
            className="mt-4 max-w-xl text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.02em]"
          >
            {title}
          </h2>
        </div>
        <div className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          {lead}
        </div>
      </div>
      <div className={cn("px-4 py-12 sm:px-6 sm:py-16 lg:px-10", className)}>
        {children}
      </div>
      {note ? (
        <div className="border-t px-4 py-10 sm:px-6 lg:px-10">
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {note}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function ModuleRow({
  title,
  children,
  link,
  diagram,
  kicker,
}: {
  title: string
  children: React.ReactNode
  link?: { href: string; label: string }
  diagram: React.ReactNode
  kicker?: string
}) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-4 px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        {kicker ? (
          <p className="font-heading text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {kicker}
          </p>
        ) : null}
        <h3 className="max-w-sm text-lg leading-snug font-semibold tracking-[0.01em]">
          {title}
        </h3>
        <div className="max-w-md leading-relaxed text-muted-foreground">
          {children}
        </div>
        {link ? (
          <Link
            href={link.href}
            className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium hover:text-brand lg:mt-auto"
          >
            {link.label}
            <ArrowRightIcon className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="flex min-h-[26rem] min-w-0 items-center justify-center overflow-hidden border-t bg-dots px-4 py-12 sm:px-8 lg:border-t-0 lg:border-l">
        {diagram}
      </div>
    </div>
  )
}

export {
  Eyebrow,
  FigureSection,
  LabelStrip,
  ModuleRow,
  ModuleSection,
  SectionHeading,
}
