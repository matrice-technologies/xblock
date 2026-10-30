import type { Metadata } from "next"

import { LINKS } from "@/lib/site"
import { Eyebrow } from "@/components/site/section"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What the XBlock extension and its server keep, why, and how to have it deleted.",
}

const UPDATED = "30 October 2026"

export default function PrivacyPage() {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] border-x">
        <div className="border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] font-medium tracking-[-0.03em]">
            Privacy policy
          </h1>
          <p className="mt-5 font-heading text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Last updated {UPDATED}
          </p>
        </div>

        <div className="grid lg:grid-cols-[5rem_minmax(0,1fr)_5rem]">
          <div className="hidden border-r bg-hatch lg:block" aria-hidden="true" />
          <article className="prose-x max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
            <p>
              XBlock is a browser extension for X (formerly Twitter) and a small
              server that keeps your block lists. It&apos;s made by Matrice
              Technologies, in France, and its code is public on{" "}
              <a href={LINKS.github}>GitHub</a>. This page says what it keeps,
              why, and how to have it deleted. The short version: no account, no
              email, no X password, and nothing about what you read.
            </p>

            <h2>Who you are, to XBlock</h2>
            <p>
              Nobody in particular. When you install the extension, it makes a
              random key in your browser and keeps it in Chrome&apos;s sync
              storage, so your lists follow you to your other computers. The
              extension sends that key with each request, and the server turns
              it into an ID with a one-way HMAC-SHA256. The server stores that
              ID, never the key. It also gives you a random display name, like
              &ldquo;Brave Otter&rdquo;, shown on the lists you share.
            </p>

            <h2>What the server keeps</h2>
            <ul>
              <li>
                <strong>Your lists</strong>: the X handles you blocked with
                XBlock, the list&apos;s name and share code, and for curated
                lists a short note per account.
              </li>
              <li>
                <strong>Your allowed accounts</strong>: the handles you marked
                with the shield, so no list ever blocks them.
              </li>
              <li>
                <strong>Your subscriptions</strong>: which lists you follow, and
                the mode each one uses (Block on X, Mute on X, Hide or Blur).
              </li>
              <li>
                <strong>What XBlock blocked or muted for you on X</strong>, so a
                batch never does the same account twice.
              </li>
              <li>
                <strong>Your settings</strong> (whether block animations are
                on, for instance), when you joined and when you last connected.
              </li>
              <li>
                <strong>Public follower counts</strong> of X accounts that show
                up in feeds. They aren&apos;t tied to you: everyone shares them,
                so batches can start with the biggest accounts.
              </li>
            </ul>
            <p>
              Lists are public by design: anyone with a list&apos;s share code
              can see the handles on it and the owner&apos;s random display name.
            </p>

            <h2>What it never sees</h2>
            <ul>
              <li>Your X password, cookies or session. Blocks and mutes go from your browser straight to X.</li>
              <li>Your email address, real name or phone number. XBlock never asks.</li>
              <li>What you read, write, like or search on X, and your browsing history.</li>
              <li>Your direct messages.</li>
            </ul>

            <h2>What happens in your browser</h2>
            <p>
              On x.com, the extension reads who wrote each post, so it can add
              its buttons and apply your lists. When you block or mute, it calls
              X itself, on the session you already have, exactly as x.com
              would. Settings such as your choice of animation are kept in
              Chrome&apos;s storage.
            </p>

            <h2>Sharing and selling</h2>
            <p>
              We don&apos;t sell or rent any of it, show no ads, and use no
              analytics or third-party trackers, in the extension or on this
              website. The server runs on a machine we rent from Hostinger; that
              host is the only third party that handles the data.
            </p>

            <h2>Network logs</h2>
            <p>
              The server uses your IP address in memory to rate-limit abuse, and
              never writes it to its database. The XBlock server itself writes
              no request logs.
            </p>

            <h2>Keeping and deleting</h2>
            <p>
              Your data stays as long as you use XBlock. To delete it, send your
              key (shown in the extension&apos;s popup) to{" "}
              <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>, and we delete
              everything tied to it: lists, subscriptions, allowed accounts and
              block history. Uninstalling the extension removes the key from
              your browser; without it, nobody can reach that data again.
            </p>

            <h2>Run your own</h2>
            <p>
              If you&apos;d rather keep everything yourself, the server is open
              source and runs anywhere Docker does. The{" "}
              <a href={LINKS.selfHost}>self-hosting guide</a> shows how to build
              the extension against your own server.
            </p>

            <h2>Changes and contact</h2>
            <p>
              If this policy changes, the new version goes up on this page with a
              new date. Questions:{" "}
              <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.
            </p>
          </article>
          <div className="hidden border-l bg-hatch lg:block" aria-hidden="true" />
        </div>
      </main>
      <div className="border-t">
        <SiteFooter />
      </div>
    </div>
  )
}
