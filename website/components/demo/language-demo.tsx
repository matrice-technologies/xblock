"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"

import { useInView } from "./use-in-view"

const HANDLE = "troll_of_the_night"

// X's own block confirmation, roughly as it reads in each language
const DIALOGS = [
  { lang: "English", title: `Block @${HANDLE}?`, body: "They will be able to see your public posts, but will no longer be able to engage with them.", block: "Block", cancel: "Cancel" },
  { lang: "Français", title: `Bloquer @${HANDLE} ?`, body: "Ce compte pourra voir vos posts publics, mais ne pourra plus interagir avec eux.", block: "Bloquer", cancel: "Annuler" },
  { lang: "Español", title: `¿Bloquear a @${HANDLE}?`, body: "Podrá ver tus posts públicos, pero ya no podrá interactuar con ellos.", block: "Bloquear", cancel: "Cancelar" },
  { lang: "Deutsch", title: `@${HANDLE} blockieren?`, body: "Der Account kann deine öffentlichen Posts sehen, aber nicht mehr mit ihnen interagieren.", block: "Blockieren", cancel: "Abbrechen" },
  { lang: "日本語", title: `@${HANDLE}さんをブロックしますか？`, body: "公開ポストは表示されますが、反応することはできなくなります。", block: "ブロック", cancel: "キャンセル" },
  { lang: "Italiano", title: `Bloccare @${HANDLE}?`, body: "Potrà vedere i tuoi post pubblici, ma non potrà più interagire con essi.", block: "Blocca", cancel: "Annulla" },
]

const STEP_MS = 2400

/**
 * Blocking from X's own menu still lands in your XBlock list, whatever
 * language X is in: the dialog cycles through languages, the list catches
 * each one.
 */
function LanguageDemo() {
  const [index, setIndex] = React.useState(0)
  const [pressed, setPressed] = React.useState(false)
  const [ref, inView] = useInView<HTMLDivElement>()

  React.useEffect(() => {
    if (!inView) return
    const press = window.setTimeout(() => setPressed(true), STEP_MS * 0.55)
    const next = window.setTimeout(() => {
      setPressed(false)
      setIndex((i) => (i + 1) % DIALOGS.length)
    }, STEP_MS)
    return () => {
      window.clearTimeout(press)
      window.clearTimeout(next)
    }
  }, [index, inView])

  const dialog = DIALOGS[index]

  return (
    <div ref={ref} className="flex w-full max-w-[380px] flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">
        {DIALOGS.map((d, i) => (
          <span
            key={d.lang}
            className={
              i === index
                ? "border border-brand bg-brand/10 px-2 py-0.5 font-heading text-[10px] tracking-[0.08em] text-brand"
                : "border px-2 py-0.5 font-heading text-[10px] tracking-[0.08em] text-muted-foreground"
            }
          >
            {d.lang}
          </span>
        ))}
      </div>

      {/* X's dialog, in X's own shape: round corners, a red pill and an outlined pill */}
      <div key={index} lang={index === 4 ? "ja" : undefined} className="pop-in w-full rounded-[16px] border border-x-line bg-x-bg p-7 font-sans text-x-text shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        <p className="text-xl leading-6 font-extrabold break-words">{dialog.title}</p>
        <p className="mt-2 text-[15px] leading-5 text-x-dim">{dialog.body}</p>
        <div className="mt-6 grid gap-3">
          <span
            className="grid h-11 place-items-center rounded-full bg-block text-[15px] font-bold text-white transition-transform duration-150"
            style={{ transform: pressed ? "scale(0.96)" : "none", filter: pressed ? "brightness(0.85)" : "none" }}
          >
            {dialog.block}
          </span>
          <span className="grid h-11 place-items-center rounded-full border border-x-line text-[15px] font-bold">{dialog.cancel}</span>
        </div>
      </div>

      <p
        className="flex h-8 items-center gap-2 border border-success/40 bg-success/10 px-3 text-[13px] font-medium text-success transition-opacity duration-300"
        style={{ opacity: pressed ? 1 : 0 }}
        aria-live="polite"
      >
        <CheckIcon className="size-3.5" aria-hidden="true" />
        @{HANDLE} added to your XBlock list
      </p>
    </div>
  )
}

export { LanguageDemo }
