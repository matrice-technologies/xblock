import * as React from "react"
import {
  BookmarkIcon,
  ChartNoAxesColumnIcon,
  HeartIcon,
  MessageCircleIcon,
  Repeat2Icon,
  ShareIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type Post = {
  id: string
  name: string
  handle: string
  text: string
  /** Avatar colour, one of X's own accents. */
  color: string
  time?: string
  verified?: boolean
  stats?: [string, string, string, string]
  /** A troll, a bot or spam: what the demos pick on. */
  bad?: boolean
}

/** X's verified badge. */
function Verified() {
  return (
    <svg viewBox="0 0 22 22" aria-label="Verified" className="size-[18px] shrink-0 fill-brand">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  )
}

/** XBlock's block button, the person-with-a-cross icon the extension adds to every post. */
function BlockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M14.8086 19.7053L19.127 16.3467M4 21C4 17.134 7.13401 14 11 14M20 18C20 19.6569 18.6569 21 17 21C15.3431 21 14 19.6569 14 18C14 16.3431 15.3431 15 17 15C18.6569 15 20 16.3431 20 18ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" />
    </svg>
  )
}

/** XBlock's "always allow" button: a person with a shield. */
function AllowGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M4 21C4 17.4735 6.60771 14.5561 10 14.0709M19.8726 15.2038C19.8044 15.2079 19.7357 15.21 19.6667 15.21C18.6422 15.21 17.7077 14.7524 17 14C16.2923 14.7524 15.3578 15.2099 14.3333 15.2099C14.2643 15.2099 14.1956 15.2078 14.1274 15.2037C14.0442 15.5853 14 15.9855 14 16.3979C14 18.6121 15.2748 20.4725 17 21C18.7252 20.4725 20 18.6121 20 16.3979C20 15.9855 19.9558 15.5853 19.8726 15.2038ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" />
    </svg>
  )
}

const ACTIONS = [
  { icon: MessageCircleIcon, hover: "hover:text-brand [&:hover>span:first-child]:bg-brand/10" },
  { icon: Repeat2Icon, hover: "hover:text-success [&:hover>span:first-child]:bg-success/10" },
  { icon: HeartIcon, hover: "hover:text-pink [&:hover>span:first-child]:bg-pink/10" },
  { icon: ChartNoAxesColumnIcon, hover: "hover:text-brand [&:hover>span:first-child]:bg-brand/10" },
]

/**
 * A post as X draws it, in X's colours: avatar, name, handle, text, the action
 * row. `xblock` holds XBlock's own buttons, which the extension puts at the
 * start of the action row.
 */
const XPost = React.forwardRef<
  HTMLElement,
  {
    post: Post
    xblock?: React.ReactNode
    className?: string
    compact?: boolean
  } & React.HTMLAttributes<HTMLElement>
>(function XPost({ post, xblock, className, compact = false, ...props }, ref) {
  return (
    <article
      ref={ref}
      className={cn(
        "relative border-b border-x-line bg-x-bg px-4 text-left font-sans text-[15px] leading-5 text-x-text",
        compact ? "py-2.5" : "py-3",
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "grid shrink-0 place-items-center rounded-full font-bold text-white",
            compact ? "size-9 text-sm" : "size-10"
          )}
          style={{ background: post.color }}
          aria-hidden="true"
        >
          {post.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate font-bold">{post.name}</span>
            {post.verified ? <Verified /> : null}
            <span className="truncate text-x-dim">
              @{post.handle} · {post.time ?? "2h"}
            </span>
          </div>
          <p className="mt-0.5 break-words whitespace-pre-line">{post.text}</p>
          {compact ? null : (
            <div className="mt-2 flex items-center justify-between text-[13px] text-x-dim">
              {xblock ? (
                <div className="-ml-2 flex items-center" data-no-clone>
                  {xblock}
                </div>
              ) : null}
              {ACTIONS.map(({ icon: Icon, hover }, i) => (
                <span
                  key={i}
                  className={cn("group flex items-center gap-0.5 transition-colors", hover)}
                  aria-hidden="true"
                >
                  <span className="grid size-[34px] place-items-center rounded-full transition-colors">
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="hidden min-w-6 tabular-nums sm:inline">
                    {post.stats?.[i] ?? ""}
                  </span>
                </span>
              ))}
              <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                <span className="grid size-[34px] place-items-center rounded-full">
                  <BookmarkIcon className="size-[18px]" strokeWidth={1.8} />
                </span>
                <span className="grid size-[34px] place-items-center rounded-full">
                  <ShareIcon className="size-[18px]" strokeWidth={1.8} />
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
})

export { AllowGlyph, BlockGlyph, Verified, XPost }
