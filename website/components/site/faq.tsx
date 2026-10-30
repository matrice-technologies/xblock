import { PlusIcon } from "lucide-react"

import { LINKS } from "@/lib/site"

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is XBlock really free?",
    a: (
      <>
        Yes. No ads, no premium tier, no data to sell. It&apos;s open source
        under the MIT License. If it saves your sanity, you can{" "}
        <a href={LINKS.coffee}>buy us a coffee</a>.
      </>
    ),
  },
  {
    q: "Do I need an account?",
    a: (
      <>
        No. When you install XBlock, it makes a random key and keeps it in
        Chrome&apos;s sync storage, so it follows you to your other computers.
        The popup shows it too, if you want to paste it somewhere by hand.
      </>
    ),
  },
  {
    q: "What's the difference between Block on X, Mute on X, Hide and Blur?",
    a: (
      <>
        <b>Block on X</b> and <b>Mute on X</b> act on your X account: blocked
        accounts can&apos;t follow you or see your posts, muted ones just
        vanish from your feed without knowing. <b>Hide</b> and <b>Blur</b> only
        happen in your browser: X sees nothing, and you can switch back any
        time. Each subscribed list has its own mode, and the post&apos;s block
        button follows the setting in the popup.
      </>
    ),
  },
  {
    q: "Can X suspend me for blocking a lot of accounts?",
    a: (
      <>
        Blocking is a normal X feature, and XBlock uses it the way x.com does,
        from your own browser. Batches go one account every 6 to 10 seconds and
        pause whenever X says to slow down. We can&apos;t speak for X, but
        that&apos;s the gentlest way there is to block in bulk.
      </>
    ),
  },
  {
    q: "My X is in Spanish (or Japanese, or Arabic). Does it work?",
    a: (
      <>
        Yes. The buttons XBlock adds don&apos;t depend on X&apos;s language,
        and it recognises X&apos;s own Block and Unblock dialogs in any
        language. The popup itself is in English and French for now;
        translations are welcome.
      </>
    ),
  },
  {
    q: "Can I see who's on a list before subscribing?",
    a: (
      <>
        Yes. The popup lets you browse a list&apos;s accounts, with their
        follower counts and whether you&apos;ve already blocked or muted them.
        And the shield button on a post keeps that account safe, whatever your
        lists say.
      </>
    ),
  },
  {
    q: "Which browsers does it run on?",
    a: (
      <>
        Chrome, and the browsers that install from the Chrome Web Store: Edge,
        Brave, Opera, Vivaldi and Arc. On a computer: X&apos;s phone apps
        don&apos;t take extensions.
      </>
    ),
  },
  {
    q: "How do I undo a block?",
    a: (
      <>
        Unblock them on X as usual: XBlock notices X&apos;s Unblock dialog and
        takes them off your list. Or press the shield on one of their posts,
        which takes them off your list and keeps them safe from every list.
        Unsubscribing stops a list from acting from then on; accounts it
        already blocked on X stay blocked until you unblock them.
      </>
    ),
  },
]

/** The questions, each opening in place. Plain details/summary, so it works without JavaScript. */
function Faq() {
  return (
    <div className="divide-y border-b">
      {QUESTIONS.map(({ q, a }) => (
        <details key={q} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-6 px-4 py-6 transition-colors hover:bg-muted/50 sm:px-6 lg:px-10 [&::-webkit-details-marker]:hidden">
            <span className="flex-1 text-lg font-medium tracking-[-0.01em]">{q}</span>
            <PlusIcon className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <div className="max-w-3xl px-4 pb-8 leading-relaxed text-muted-foreground sm:px-6 lg:px-10 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_b]:font-medium [&_b]:text-foreground">
            {a}
          </div>
        </details>
      ))}
    </div>
  )
}

export { Faq }
