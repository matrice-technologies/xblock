// Every word on the site, in English. The other languages are this same shape
// (`Dict`), so a missing or extra string fails the type check.
//
// Inline markup, rendered by components/site/rich.tsx:
//   **bold**   ==accent== (X red)   `code`   [link text](https://… or /path)
// Placeholders in {braces} are filled in by the code (lib/i18n.ts, fill).

/** One part of the privacy policy: a heading (empty for the intro), paragraphs, a list, paragraphs after it. */
export type PolicySection = { heading: string; paragraphs: string[]; list: string[]; after: string[] }

export const en = {
  meta: {
    title: "XBlock · Block trolls on X in one click",
    description:
      "Block trolls, bots and spam on X in one click, share your block lists, and subscribe to other people's. Free, open source, no account.",
  },

  nav: {
    try: "Try it",
    features: "Features",
    watch: "Watch",
    privacy: "Privacy",
    openSource: "Open source",
    faq: "FAQ",
    github: "GitHub",
    addToChrome: "Add to Chrome",
    theme: "Switch light or dark (or press D)",
    menu: "Open menu",
    language: "Language",
    home: "XBlock, home",
  },

  hero: {
    eyebrow: "Free Chrome extension for X",
    titleA: "Block trolls",
    titleB: "in one click.",
    lead: "XBlock puts a block button on every post on X, lets you share your block list with a code, and blocks everyone on the lists you subscribe to. Or, if you'd rather, slice them to pieces first. Go on, try it.",
    cta: "Add to Chrome, it's free",
    try: "Try it right here",
    meta: "Works with X in any language · Chrome, Edge, Brave, Arc",
  },

  // The playable Samurai stage in the hero
  stage: {
    label: "A troll's post you can slice, Samurai style",
    takeOver: "Swipe through the post to take over",
    takeOverShort: "Swipe it, your turn",
    sliceMouse: "Slice it with your mouse",
    sliceFinger: "Slice it with your finger",
    sliceShort: "Slice it",
    cuts: "Cuts: {n}",
    sliced: "{n} sliced",
    blocked: "**@{handle}** blocked",
    posts: [
      "Nobody asked for your opinion. Ratio + L + delete your account. 🤡",
      "$MOON is about to 100x 🚀🚀 Last chance to get in. DM me for the presale, only 20 spots left!!",
      "Actually, as someone who has never done your job, let me explain how it works. 🧐",
      "Make $5,000 a day from home!!! 💸💸 No skills needed. Link in bio 👇",
      "You won't BELIEVE what they said this time. Thread 🧵👇 (you'll be furious)",
    ],
  },

  ticker: {
    blocked: "blocked",
    muted: "muted",
  },

  // X's own words, in the look-alike posts
  x: {
    forYou: "For you",
    following: "Following",
    verified: "Verified",
  },

  try: {
    label: "Playground",
    count: "The real animations",
    eyebrow: "Try it",
    title: "Go on, block a ==troll==.",
    lead: "A pretend x.com running XBlock's own animations. Hold the block button on a post until it blows, or switch to **Samurai** and slice it apart. Nothing here touches your X account.",
    note: "On x.com, the same button blocks (or mutes) the account for real, through X itself, and adds it to your list. The shield next to it does the opposite: that account is never blocked, whatever your lists say.",
  },

  playground: {
    posts: [
      "Sunset over the bay tonight. Unreal.",
      "$MOON is about to 100x 🚀 Last chance to get in. DM me for the presale.",
      "Anyone got a good book for the holidays? Looking for sci-fi.",
      "Nobody asked for your opinion. Ratio + L + delete your account.",
      "New project goes live tomorrow, can't wait to show you!",
      "Make $5,000 a day from home!!! 💸 Link in bio",
      "Coffee, playlist, and off we go.",
    ],
    settings: "XBlock settings",
    counter: "Blocked in this demo",
    counterDetail: "{blocked} blocked · {muted} muted",
    animation: "Block animation",
    explode: "Explosion",
    explodeHint: "Long press to blow it up",
    samurai: "Samurai",
    samuraiHint: "Click, then slice it",
    off: "Off",
    offHint: "Block instantly",
    action: "The block button on a post should",
    block: "Block",
    blockHint: "They can't follow you or see your posts",
    mute: "Mute",
    muteHint: "Gone from your feed, and they won't know",
    hintExplode: "Hold a post's block button until it blows.",
    hintSamurai: "Click a post's block button, then slice it. Esc puts it back.",
    hintOff: "Click a post's block button and it's gone.",
    reset: "Reset the demo feed",
    toastBlocked: "@{handle} blocked on X",
    toastMuted: "@{handle} muted on X",
    toastAllowed: "@{handle} will never be blocked",
    undo: "Undo",
    allow: "Always allow @{handle}",
    unallow: "Stop always allowing @{handle}",
    blockLabel: "Block @{handle}",
    muteLabel: "Mute @{handle}",
    hold: "(hold)",
    holdMe: "Hold me",
    clickMe: "Click me",
    cleanTitle: "Your feed is clean.",
    cleanBody: "That's the whole idea. On x.com, XBlock blocks them for real.",
    cleanButton: "Bring the trolls back",
    doneBlock: "Done · block @{handle}",
    doneMute: "Done · mute @{handle}",
  },

  // The Samurai stage's own labels (as in the extension)
  samurai: {
    hintMouse: "Slice the post with your mouse",
    hintFinger: "Slice the post with your finger",
    cancelKey: "Esc to cancel",
    cancelTap: "Tap to cancel",
    cuts: "Cuts: {n}",
  },

  features: {
    label: "Features",
    count: "4 modules",
    lead: "Clean up X once, for you and your friends.",
    rest: "Block in one click, share what you blocked, subscribe to the lists of people you trust, and let a batch handle thousands of accounts while you do something else.",
    shareKicker: "Shared lists",
    shareTitle: "Block once. Everyone on your list's code is covered.",
    shareBody: "Every account you block goes into your own list, with a share code like `XBK-7Q2M9`. Send it to friends, post it in a bio, or paste a creator's code to subscribe to theirs. New entries reach every subscriber as they're added.",
    modesKicker: "Modes",
    modesTitle: "Each list decides: block, mute, hide or blur.",
    modesBody: "Trust a list completely? Have it block on X. Not sure? Mute, so they never know. Or keep X out of it: hide those posts, or blur them with one click to peek. When two lists disagree, the stronger one wins.",
    batchKicker: "Batch",
    batchTitle: "Thousands of accounts, while you get on with your day.",
    batchBody: "One click and a small x.com window works through every list set to act on X, biggest accounts first, blocking or muting each as its list says. It goes one account every 6 to 10 seconds, pauses when X asks it to, and picks up where it stopped. (The demo here is sped up.)",
    languageKicker: "Any language",
    languageTitle: "Blocked from X's own menu? It's in your list too.",
    languageBody: "Block someone the usual way, from the post's menu, and XBlock adds them to your list as well. It recognises X's Block and Unblock dialogs in any language, from English to Japanese.",
  },

  share: {
    posts: ["Nobody asked. Ratio + L.", "Actually, as a man, let me explain…", "Make $5,000 a day from home!!! 💸"],
    youBlock: "You block them, once",
    yourList: "Your block list",
    accounts: "{n} accounts",
    copy: "Copy the share code {code}",
    copied: "Copied",
    subscribers: "Subscribers",
    people: "1,248 people",
    gone: "**@{handle}** is gone for all of them.",
    everyone: "Everyone who subscribed to your code.",
  },

  modes: {
    listName: "Crypto bots & spam",
    by: "by @{owner} · {size} accounts",
    group: "Mode for this list",
    autoblock: "Block on X",
    autoblockNote: "Blocked on X, for good. They can't see you either.",
    automute: "Mute on X",
    automuteNote: "Muted on X. Gone from your feed, and they'll never know.",
    hide: "Hide",
    hideNote: "Folded away in your browser. Nothing changes on X.",
    blur: "Blur",
    blurNote: "Blurred in your browser, one click to read it anyway.",
    blocked: "Blocked",
    muted: "Muted",
    inBrowser: "In your browser",
    blockedIn: "is blocked in",
    show: "Show",
    posts: [
      "Quick thread on my favourite tools for work.",
      "$MOON is about to 100x 🚀 DM me for the presale.",
      "Thanks everyone for the feedback on the project!",
    ],
  },

  batch: {
    title: "XBlock batch block",
    running: "Blocking",
    done: "Done",
    thisRun: "blocked or muted this run",
    ofLists: "{percent}% of your Block and Mute lists",
    closing: "closing in 3s",
    left: "{n} left",
    allHandled: "Every account on your Block and Mute lists is handled",
    blocking: "Blocking **@{handle}**",
    muting: "Muting **@{handle}**",
    followers: "{n} followers",
    lists: "Lists",
    recent: "Recent",
    loading: "Loading the accounts to block…",
    listA: "Tech reply guys",
    listB: "Crypto bots & spam",
    modeBlock: "Block on X",
    modeMute: "Mute on X",
    blocked: "Blocked",
    muted: "Muted",
  },

  language: {
    added: "@{handle} added to your XBlock list",
  },

  watch: {
    label: "Walkthrough",
    count: "1 min 51",
    eyebrow: "Watch",
    title: "Every feature, in under two minutes.",
    lead: "Recorded on the real extension: the popup, shared lists, the four modes, batch blocking and Samurai mode.",
  },

  how: {
    eyebrow: "How it works",
    title: "Up and running in a minute",
    steps: [
      {
        label: "Step 1",
        title: "Install",
        body: "Add XBlock to Chrome. It makes you an anonymous key on the spot: no sign-up, no email, no X password.",
      },
      {
        label: "Step 2",
        title: "Block",
        body: "Every post on x.com gets a block button. Block a troll and they land in your own list, ready to share.",
      },
      {
        label: "Step 3",
        title: "Share and subscribe",
        body: "Send your list's code to friends. Paste someone else's to subscribe, and pick what their list does for you.",
      },
    ],
  },

  privacy: {
    eyebrow: "Privacy",
    title: "Nothing to sign up for, nothing to leak",
    lead: "XBlock needs to know whose posts to treat, and nothing else.",
    parts: [
      {
        label: "Who you are",
        title: "No account",
        body: "XBlock makes a random key in your browser. Our server only keeps a fingerprint of it, never the key itself.",
      },
      {
        label: "Your X login",
        title: "Never leaves your browser",
        body: "Blocks and mutes go from your browser straight to X, on the session you already have. We never see your X password or cookies.",
      },
      {
        label: "What it reads",
        title: "Handles, not posts",
        body: "XBlock looks at who wrote each post, to treat it as your lists say. It doesn't collect what you read, write or like.",
      },
      {
        label: "Proof",
        title: "Open source",
        body: "Every line of the extension and the server is on GitHub, under the MIT License. Read it, or run your own server.",
      },
    ],
    flowKey: "your key",
    flowId: "the only ID we keep",
    serverLabel: "On our server",
    serverTitle: "The complete list",
    stored: [
      { what: "A fingerprint of your key", why: "So your lists and settings follow you across computers." },
      { what: "Your lists and allowed accounts", why: "X handles, the names you give your lists, and their share codes." },
      { what: "Your subscriptions", why: "Which lists you follow, and the mode each one uses." },
      { what: "What XBlock blocked or muted for you", why: "So a batch never does the same account twice." },
      { what: "Public follower counts", why: "Seen in feeds, shared by everyone, to block the biggest accounts first." },
    ],
    details: "The details, and how to have it all deleted, are in the [privacy policy]({privacyHref}).",
  },

  oss: {
    label: "Open source",
    count: "MIT License",
    eyebrow: "Open source",
    title: "Read every line. Run your own server.",
    body: "The extension and its server live in one repository under the MIT License. Check what it does, send a fix, add a language, or host the server yourself and build the extension against it.",
    github: "View on GitHub",
    selfHost: "Self-hosting guide",
    builtWith: "Built with",
    ownServer: "Your own server",
    commentApi: "# the API, with its database on a volume",
    commentExtension: "# the extension, built against it",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    items: [
      {
        q: "Is XBlock really free?",
        a: "Yes. No ads, no premium tier, no data to sell. It's open source under the MIT License. If it saves your sanity, you can [buy us a coffee]({coffee}).",
      },
      {
        q: "Do I need an account?",
        a: "No. When you install XBlock, it makes a random key and keeps it in Chrome's sync storage, so it follows you to your other computers. The popup shows it too, if you want to paste it somewhere by hand.",
      },
      {
        q: "What's the difference between Block on X, Mute on X, Hide and Blur?",
        a: "**Block on X** and **Mute on X** act on your X account: blocked accounts can't follow you or see your posts, muted ones just vanish from your feed without knowing. **Hide** and **Blur** only happen in your browser: X sees nothing, and you can switch back any time. Each subscribed list has its own mode, and the post's block button follows the setting in the popup.",
      },
      {
        q: "Can X suspend me for blocking a lot of accounts?",
        a: "Blocking is a normal X feature, and XBlock uses it the way x.com does, from your own browser. Batches go one account every 6 to 10 seconds and pause whenever X says to slow down. We can't speak for X, but that's the gentlest way there is to block in bulk.",
      },
      {
        q: "My X is in another language. Does it work?",
        a: "Yes. The buttons XBlock adds don't depend on X's language, and it recognises X's own Block and Unblock dialogs in any language. The extension itself speaks English, French, Spanish, German, Japanese, Portuguese and Indonesian, and translations are welcome.",
      },
      {
        q: "Can I see who's on a list before subscribing?",
        a: "Yes. The popup lets you browse a list's accounts, with their follower counts and whether you've already blocked or muted them. And the shield button on a post keeps that account safe, whatever your lists say.",
      },
      {
        q: "Which browsers does it run on?",
        a: "Chrome, and the browsers that install from the Chrome Web Store: Edge, Brave, Opera, Vivaldi and Arc. On a computer: X's phone apps don't take extensions.",
      },
      {
        q: "How do I undo a block?",
        a: "Unblock them on X as usual: XBlock notices X's Unblock dialog and takes them off your list. Or press the shield on one of their posts, which takes them off your list and keeps them safe from every list. Unsubscribing stops a list from acting from then on; accounts it already blocked on X stay blocked until you unblock them.",
      },
    ],
  },

  cta: {
    eyebrow: "Get XBlock",
    title: "Take back your ==timeline==.",
    body: "Free, no account, and gone in one click if you change your mind.",
    add: "Add to Chrome",
    star: "Star on GitHub",
  },

  footer: {
    tagline: "Block trolls, bots and spam on X in one click, and share your block lists. Free and open source.",
    product: "Product",
    walkthrough: "Walkthrough video",
    store: "Chrome Web Store",
    openSource: "Open source",
    source: "Source code",
    selfHost: "Self-host the server",
    bug: "Report a bug",
    license: "MIT License",
    about: "About",
    privacy: "Privacy policy",
    contact: "Contact",
    coffee: "Buy us a coffee",
    madeBy: "Made by",
    notAffiliated: "Not affiliated with X Corp.",
    pressD: "Press D for dark mode",
  },

  privacyPage: {
    metaTitle: "Privacy policy",
    metaDescription: "What the XBlock extension and its server keep, why, and how to have it deleted.",
    eyebrow: "Privacy",
    title: "Privacy policy",
    updated: "Last updated {date}",
    date: "30 October 2026",
    // Each section: an optional heading, paragraphs, an optional list, then more paragraphs
    sections: [
      {
        heading: "",
        paragraphs: [
          "XBlock is a browser extension for X (formerly Twitter) and a small server that keeps your block lists. It's made by Matrice Technologies, in France, and its code is public on [GitHub]({github}). This page says what it keeps, why, and how to have it deleted. The short version: no account, no email, no X password, and nothing about what you read.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Who you are, to XBlock",
        paragraphs: [
          "Nobody in particular. When you install the extension, it makes a random key in your browser and keeps it in Chrome's sync storage, so your lists follow you to your other computers. The extension sends that key with each request, and the server turns it into an ID with a one-way HMAC-SHA256. The server stores that ID, never the key. It also gives you a random display name, like “Brave Otter”, shown on the lists you share.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "What the server keeps",
        paragraphs: [],
        list: [
          "**Your lists**: the X handles you blocked with XBlock, the list's name and share code, and for curated lists a short note per account.",
          "**Your allowed accounts**: the handles you marked with the shield, so no list ever blocks them.",
          "**Your subscriptions**: which lists you follow, and the mode each one uses (Block on X, Mute on X, Hide or Blur).",
          "**What XBlock blocked or muted for you on X**, so a batch never does the same account twice.",
          "**Your settings** (whether block animations are on, for instance), when you joined and when you last connected.",
          "**Public follower counts** of X accounts that show up in feeds. They aren't tied to you: everyone shares them, so batches can start with the biggest accounts.",
        ],
        after: [
          "Lists are public by design: anyone with a list's share code can see the handles on it and the owner's random display name.",
        ],
      },
      {
        heading: "What it never sees",
        paragraphs: [],
        list: [
          "Your X password, cookies or session. Blocks and mutes go from your browser straight to X.",
          "Your email address, real name or phone number. XBlock never asks.",
          "What you read, write, like or search on X, and your browsing history.",
          "Your direct messages.",
        ],
        after: [],
      },
      {
        heading: "What happens in your browser",
        paragraphs: [
          "On x.com, the extension reads who wrote each post, so it can add its buttons and apply your lists. When you block or mute, it calls X itself, on the session you already have, exactly as x.com would. Settings such as your choice of animation are kept in Chrome's storage.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Sharing and selling",
        paragraphs: [
          "We don't sell or rent any of it, show no ads, and use no analytics or third-party trackers, in the extension or on this website. The server runs on a machine we rent from Hostinger; that host is the only third party that handles the data.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Network logs",
        paragraphs: [
          "The server uses your IP address in memory to rate-limit abuse, and never writes it to its database. The XBlock server itself writes no request logs.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Keeping and deleting",
        paragraphs: [
          "Your data stays as long as you use XBlock. To delete it, send your key (shown in the extension's popup) to [{email}](mailto:{email}), and we delete everything tied to it: lists, subscriptions, allowed accounts and block history. Uninstalling the extension removes the key from your browser; without it, nobody can reach that data again.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Run your own",
        paragraphs: [
          "If you'd rather keep everything yourself, the server is open source and runs anywhere Docker does. The [self-hosting guide]({selfHost}) shows how to build the extension against your own server.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Changes and contact",
        paragraphs: [
          "If this policy changes, the new version goes up on this page with a new date. Questions: [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    // Shown above a translated policy; empty in English, which is the reference
    translationNote: "",
  },

  // The Chrome Web Store images (app/[lang]/store), one per frame
  store: {
    badge: "Free · Open source · No account",
    shots: [
      {
        kicker: "One click",
        title: "Block trolls in ==one click==.",
        body: "A block button on every post. Hold it, and the post blows up.",
      },
      {
        kicker: "Samurai mode",
        title: "Or slice them ==to pieces==.",
        body: "Sweep your mouse through the post. Stop, and it's blocked.",
      },
      {
        kicker: "Shared lists",
        title: "Block once, ==protect everyone==.",
        body: "Share your list with a code. Everyone who subscribes is covered too.",
      },
      {
        kicker: "Your rules",
        title: "Block, mute, ==hide or blur==.",
        body: "Each list you subscribe to decides what happens to its accounts.",
      },
      {
        kicker: "Batch",
        title: "Thousands of accounts, ==hands-free==.",
        body: "Biggest accounts first, at a pace X is happy with.",
      },
    ],
    promoTitle: "Block trolls in ==one click==.",
    marqueeTitle: "Block trolls in ==one click==.",
    marqueeBody: "Shared block lists, Samurai mode, and a batch that does the rest. Free and open source.",
  },
}

export type Dict = typeof en
