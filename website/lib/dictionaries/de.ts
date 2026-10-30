import type { Dict, PolicySection } from "./en"

export const de: Dict = {
  meta: {
    title: "XBlock · Trolle auf X mit einem Klick blocken",
    description:
      "Trolle, Bots und Spam auf X mit einem Klick blockieren, Blocklisten teilen und die Listen anderer abonnieren. Kostenlos, Open Source, ohne Konto.",
  },

  nav: {
    try: "Ausprobieren",
    features: "Funktionen",
    watch: "Video",
    privacy: "Datenschutz",
    openSource: "Open Source",
    faq: "FAQ",
    github: "GitHub",
    addToChrome: "Zu Chrome hinzufügen",
    theme: "Hell oder dunkel (oder drück D)",
    menu: "Menü öffnen",
    language: "Sprache",
    home: "XBlock, Startseite",
  },

  hero: {
    eyebrow: "Kostenlose Chrome-Erweiterung für X",
    titleA: "Trolle blocken",
    titleB: "mit einem Klick.",
    lead: "XBlock setzt einen Block-Button an jeden Post auf X, lässt dich deine Blockliste per Code teilen und blockiert alle auf den Listen, die du abonnierst. Oder du zerlegst sie vorher in Stücke, wenn dir das lieber ist. Na los, probier's aus.",
    cta: "Kostenlos zu Chrome hinzufügen",
    try: "Gleich hier ausprobieren",
    meta: "Läuft mit X in jeder Sprache · Chrome, Edge, Brave, Arc",
  },

  // The playable Samurai stage in the hero
  stage: {
    label: "Ein Troll-Post, den du im Samurai-Stil zerschneiden kannst",
    takeOver: "Wisch durch den Post und übernimm",
    takeOverShort: "Wisch drüber, du bist dran",
    sliceMouse: "Zerschneide ihn mit der Maus",
    sliceFinger: "Zerschneide ihn mit dem Finger",
    sliceShort: "Zerschneide ihn",
    cuts: "Schnitte: {n}",
    sliced: "{n} zerlegt",
    blocked: "**@{handle}** blockiert",
    posts: [
      "Hat keiner nach deiner Meinung gefragt. Ratio + L + lösch deinen Account. 🤡",
      "$MOON macht gleich 100x 🚀🚀 Letzte Chance zum Einstieg. Schreib mir per DM für den Presale, nur noch 20 Plätze!!",
      "Also, als jemand, der deinen Job noch nie gemacht hat: Ich erklär dir mal, wie das läuft. 🧐",
      "Verdiene 5.000 € am Tag von zu Hause!!! 💸💸 Keine Vorkenntnisse nötig. Link in Bio 👇",
      "Du wirst NICHT GLAUBEN, was die diesmal gesagt haben. Thread 🧵👇 (du wirst ausrasten)",
    ],
  },

  ticker: {
    blocked: "blockiert",
    muted: "stummgeschaltet",
  },

  // X's own words, in the look-alike posts
  x: {
    forYou: "Für dich",
    following: "Folge ich",
    verified: "Verifiziert",
  },

  try: {
    label: "Spielwiese",
    count: "Die echten Animationen",
    eyebrow: "Ausprobieren",
    title: "Na los, blockier einen ==Troll==.",
    lead: "Ein nachgebautes x.com mit den echten Animationen von XBlock. Halte den Block-Button eines Posts gedrückt, bis er explodiert, oder wechsle zu **Samurai** und zerschneide ihn. Dein X-Account bleibt dabei unberührt.",
    note: "Auf x.com blockiert derselbe Button den Account wirklich (oder schaltet ihn stumm), über X selbst, und setzt ihn auf deine Liste. Das Schild daneben macht das Gegenteil: Dieser Account wird nie blockiert, egal was deine Listen sagen.",
  },

  playground: {
    posts: [
      "Sonnenuntergang am See heute Abend. Unwirklich.",
      "$MOON macht gleich 100x 🚀 Letzte Chance zum Einstieg. Schreib mir per DM für den Presale.",
      "Hat wer einen guten Buchtipp für die Feiertage? Suche Sci-Fi.",
      "Hat keiner nach deiner Meinung gefragt. Ratio + L + lösch deinen Account.",
      "Morgen geht das neue Projekt live, ich kann's kaum erwarten, es euch zu zeigen!",
      "Verdiene 5.000 € am Tag von zu Hause!!! 💸 Link in Bio",
      "Kaffee, Playlist, und los geht's.",
    ],
    settings: "XBlock-Einstellungen",
    counter: "In dieser Demo blockiert",
    counterDetail: "{blocked} blockiert · {muted} stummgeschaltet",
    animation: "Block-Animation",
    explode: "Explosion",
    explodeHint: "Lange drücken zum Sprengen",
    samurai: "Samurai",
    samuraiHint: "Klicken, dann zerschneiden",
    off: "Aus",
    offHint: "Sofort blockieren",
    action: "Der Block-Button an einem Post soll",
    block: "Blockieren",
    blockHint: "Sie können dir nicht folgen und deine Posts nicht sehen",
    mute: "Stummschalten",
    muteHint: "Weg aus deiner Timeline, ohne dass sie es merken",
    hintExplode: "Halte den Block-Button eines Posts gedrückt, bis er explodiert.",
    hintSamurai: "Klick auf den Block-Button eines Posts und zerschneide ihn. Mit Esc kommt er zurück.",
    hintOff: "Klick auf den Block-Button eines Posts, und weg ist er.",
    reset: "Demo-Timeline zurücksetzen",
    toastBlocked: "@{handle} auf X blockiert",
    toastMuted: "@{handle} auf X stummgeschaltet",
    toastAllowed: "@{handle} wird nie blockiert",
    undo: "Rückgängig",
    allow: "@{handle} nie blockieren",
    unallow: "Blockieren von @{handle} wieder erlauben",
    blockLabel: "@{handle} blockieren",
    muteLabel: "@{handle} stummschalten",
    hold: "(halten)",
    holdMe: "Halt mich",
    clickMe: "Klick mich",
    cleanTitle: "Deine Timeline ist sauber.",
    cleanBody: "Genau darum geht's. Auf x.com blockiert XBlock sie wirklich.",
    cleanButton: "Trolle zurückholen",
    doneBlock: "Fertig · @{handle} blockieren",
    doneMute: "Fertig · @{handle} stummschalten",
  },

  // The Samurai stage's own labels (as in the extension)
  samurai: {
    hintMouse: "Zerschneide den Post mit der Maus",
    hintFinger: "Zerschneide den Post mit dem Finger",
    cancelKey: "Esc zum Abbrechen",
    cancelTap: "Tippen zum Abbrechen",
    cuts: "Schnitte: {n}",
  },

  features: {
    label: "Funktionen",
    count: "4 Module",
    lead: "Räum X einmal auf, für dich und deine Freunde.",
    rest: "Mit einem Klick blockieren, teilen, was du blockiert hast, die Listen von Leuten abonnieren, denen du vertraust, und Tausende Accounts abarbeiten lassen, während du was anderes machst.",
    shareKicker: "Geteilte Listen",
    shareTitle: "Einmal blockieren. Alle mit deinem Code sind geschützt.",
    shareBody: "Jeder Account, den du blockierst, landet in deiner eigenen Liste, mit einem Code zum Teilen wie `XBK-7Q2M9`. Schick ihn Freunden, pack ihn in deine Bio oder füg den Code eines Creators ein, um seine Liste zu abonnieren. Neue Einträge erreichen alle Abonnenten, sobald sie dazukommen.",
    modesKicker: "Modi",
    modesTitle: "Jede Liste entscheidet: blockieren, stummschalten, ausblenden oder weichzeichnen.",
    modesBody: "Du vertraust einer Liste voll und ganz? Lass sie auf X blockieren. Unsicher? Stummschalten, dann merken sie nichts. Oder halt X ganz raus: Blende die Posts aus oder zeichne sie weich, mit einem Klick zum Reinschauen. Widersprechen sich zwei Listen, gewinnt die strengere.",
    batchKicker: "Massenblockierung",
    batchTitle: "Tausende Accounts, während du dich um anderes kümmerst.",
    batchBody: "Ein Klick, und ein kleines x.com-Fenster arbeitet jede Liste ab, die auf X wirken soll, die größten Accounts zuerst, und blockiert jeden oder schaltet ihn stumm, je nachdem, was seine Liste sagt. Alle 6 bis 10 Sekunden ist ein Account dran, es pausiert, wenn X darum bittet, und macht da weiter, wo es aufgehört hat. (Die Demo hier läuft im Zeitraffer.)",
    languageKicker: "Jede Sprache",
    languageTitle: "Übers Menü von X blockiert? Landet trotzdem auf deiner Liste.",
    languageBody: "Blockier jemanden ganz normal über das Menü des Posts, und XBlock setzt ihn auch auf deine Liste. Es erkennt die Dialoge von X zum Blockieren und Entblocken in jeder Sprache, von Englisch bis Japanisch.",
  },

  share: {
    posts: ["Hat keiner gefragt. Ratio + L.", "Also, als Mann erklär ich dir das mal…", "Verdiene 5.000 € am Tag von zu Hause!!! 💸"],
    youBlock: "Du blockierst sie einmal",
    yourList: "Deine Blockliste",
    accounts: "{n} Accounts",
    copy: "Code zum Teilen {code} kopieren",
    copied: "Kopiert",
    subscribers: "Abonnenten",
    people: "1.248 Personen",
    gone: "**@{handle}** ist für alle weg.",
    everyone: "Alle, die deinen Code abonniert haben.",
  },

  modes: {
    listName: "Krypto-Bots & Spam",
    by: "von @{owner} · {size} Accounts",
    group: "Modus für diese Liste",
    autoblock: "Auf X blockieren",
    autoblockNote: "Auf X blockiert, für immer. Sie sehen dich auch nicht mehr.",
    automute: "Auf X stummschalten",
    automuteNote: "Auf X stummgeschaltet. Weg aus deiner Timeline, und sie merken es nie.",
    hide: "Ausblenden",
    hideNote: "In deinem Browser eingeklappt. Auf X ändert sich nichts.",
    blur: "Weichzeichnen",
    blurNote: "In deinem Browser weichgezeichnet, mit einem Klick trotzdem lesbar.",
    blocked: "Blockiert",
    muted: "Stummgeschaltet",
    inBrowser: "In deinem Browser",
    blockedIn: "ist blockiert in",
    show: "Anzeigen",
    posts: [
      "Kurzer Thread zu meinen Lieblingstools für die Arbeit.",
      "$MOON macht gleich 100x 🚀 Schreib mir per DM für den Presale.",
      "Danke euch allen für das Feedback zum Projekt!",
    ],
  },

  batch: {
    title: "XBlock · Massenblockierung",
    running: "Läuft",
    done: "Fertig",
    thisRun: "in diesem Durchlauf blockiert oder stummgeschaltet",
    ofLists: "{percent} % deiner Blockier- und Stummschalt-Listen",
    closing: "schließt in 3 s",
    left: "Noch {n}",
    allHandled: "Alle Accounts deiner Blockier- und Stummschalt-Listen sind erledigt",
    blocking: "**@{handle}** wird blockiert",
    muting: "**@{handle}** wird stummgeschaltet",
    followers: "{n} Follower",
    lists: "Listen",
    recent: "Zuletzt",
    loading: "Zu blockierende Accounts werden geladen…",
    listA: "Tech-Besserwisser",
    listB: "Krypto-Bots & Spam",
    modeBlock: "Auf X blockieren",
    modeMute: "Auf X stummschalten",
    blocked: "Blockiert",
    muted: "Stummgeschaltet",
  },

  language: {
    added: "@{handle} zu deiner XBlock-Liste hinzugefügt",
  },

  watch: {
    label: "Rundgang",
    count: "1:51 Min.",
    eyebrow: "Video",
    title: "Alle Funktionen in unter zwei Minuten.",
    lead: "Aufgenommen mit der echten Erweiterung: das Popup, geteilte Listen, die vier Modi, die Massenblockierung und der Samurai-Modus.",
  },

  how: {
    eyebrow: "So funktioniert's",
    title: "In einer Minute startklar",
    steps: [
      {
        label: "Schritt 1",
        title: "Installieren",
        body: "Füg XBlock zu Chrome hinzu. Es erstellt dir sofort einen anonymen Schlüssel: keine Anmeldung, keine E-Mail, kein X-Passwort.",
      },
      {
        label: "Schritt 2",
        title: "Blockieren",
        body: "Jeder Post auf x.com bekommt einen Block-Button. Blockier einen Troll, und er landet in deiner eigenen Liste, bereit zum Teilen.",
      },
      {
        label: "Schritt 3",
        title: "Teilen und abonnieren",
        body: "Schick den Code deiner Liste an Freunde. Füg den Code von jemand anderem ein, um zu abonnieren, und wähl, was die Liste für dich tut.",
      },
    ],
  },

  privacy: {
    eyebrow: "Datenschutz",
    title: "Keine Anmeldung, nichts, was leaken kann",
    lead: "XBlock muss wissen, wessen Posts es behandeln soll, und sonst nichts.",
    parts: [
      {
        label: "Wer du bist",
        title: "Kein Konto",
        body: "XBlock erstellt in deinem Browser einen zufälligen Schlüssel. Unser Server speichert nur einen Fingerabdruck davon, nie den Schlüssel selbst.",
      },
      {
        label: "Dein X-Login",
        title: "Verlässt nie deinen Browser",
        body: "Blockieren und Stummschalten gehen direkt von deinem Browser an X, über deine bestehende Sitzung. Dein X-Passwort und deine Cookies sehen wir nie.",
      },
      {
        label: "Was es liest",
        title: "Handles, keine Posts",
        body: "XBlock schaut nur, wer einen Post geschrieben hat, um ihn so zu behandeln, wie deine Listen es sagen. Was du liest, schreibst oder likest, sammelt es nicht.",
      },
      {
        label: "Beweis",
        title: "Open Source",
        body: "Jede Zeile der Erweiterung und des Servers liegt auf GitHub, unter der MIT-Lizenz. Lies sie oder betreib deinen eigenen Server.",
      },
    ],
    flowKey: "dein Schlüssel",
    flowId: "die einzige ID, die wir speichern",
    serverLabel: "Auf unserem Server",
    serverTitle: "Die vollständige Liste",
    stored: [
      { what: "Ein Fingerabdruck deines Schlüssels", why: "Damit dir deine Listen und Einstellungen auf andere Computer folgen." },
      { what: "Deine Listen und erlaubten Accounts", why: "X-Handles, die Namen deiner Listen und ihre Codes zum Teilen." },
      { what: "Deine Abos", why: "Welchen Listen du folgst und welchen Modus jede davon nutzt." },
      { what: "Was XBlock für dich blockiert oder stummgeschaltet hat", why: "Damit ein Durchlauf nie denselben Account zweimal bearbeitet." },
      { what: "Öffentliche Follower-Zahlen", why: "Aus den Timelines, von allen geteilt, um die größten Accounts zuerst zu blockieren." },
    ],
    details: "Die Details und wie du alles löschen lassen kannst, stehen in der [Datenschutzerklärung]({privacyHref}).",
  },

  oss: {
    label: "Open Source",
    count: "MIT-Lizenz",
    eyebrow: "Open Source",
    title: "Lies jede Zeile. Betreib deinen eigenen Server.",
    body: "Die Erweiterung und ihr Server liegen in einem Repository unter der MIT-Lizenz. Prüf, was sie tut, schick einen Fix, füg eine Sprache hinzu oder hoste den Server selbst und bau die Erweiterung dafür.",
    github: "Auf GitHub ansehen",
    selfHost: "Anleitung zum Selbsthosten",
    builtWith: "Gebaut mit",
    ownServer: "Dein eigener Server",
    commentApi: "# die API, mit ihrer Datenbank auf einem Volume",
    commentExtension: "# die Erweiterung, dafür gebaut",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Fragen und Antworten",
    items: [
      {
        q: "Ist XBlock wirklich kostenlos?",
        a: "Ja. Keine Werbung, kein Premium-Abo, keine Daten zum Verkaufen. Es ist Open Source unter der MIT-Lizenz. Wenn es deine Nerven rettet, kannst du [uns einen Kaffee spendieren]({coffee}).",
      },
      {
        q: "Brauche ich ein Konto?",
        a: "Nein. Bei der Installation erstellt XBlock einen zufälligen Schlüssel und legt ihn im Sync-Speicher von Chrome ab, damit er dir auf deine anderen Computer folgt. Das Popup zeigt ihn auch an, falls du ihn irgendwo von Hand einfügen willst.",
      },
      {
        q: "Was ist der Unterschied zwischen „Auf X blockieren“, „Auf X stummschalten“, „Ausblenden“ und „Weichzeichnen“?",
        a: "**Auf X blockieren** und **Auf X stummschalten** wirken auf deinen X-Account: Blockierte Accounts können dir nicht folgen und deine Posts nicht sehen, stummgeschaltete verschwinden einfach aus deiner Timeline, ohne es zu merken. **Ausblenden** und **Weichzeichnen** passieren nur in deinem Browser: X bekommt nichts mit, und du kannst jederzeit zurückwechseln. Jede abonnierte Liste hat ihren eigenen Modus, und der Block-Button eines Posts folgt der Einstellung im Popup.",
      },
      {
        q: "Kann X mich sperren, wenn ich viele Accounts blockiere?",
        a: "Blockieren ist eine ganz normale Funktion von X, und XBlock nutzt sie genauso wie x.com, aus deinem eigenen Browser. Bei der Massenblockierung ist alle 6 bis 10 Sekunden ein Account dran, und sie pausiert, sobald X ein langsameres Tempo verlangt. Wir können nicht für X sprechen, aber sanfter lässt sich nicht massenhaft blockieren.",
      },
      {
        q: "Mein X ist auf eine andere Sprache eingestellt. Klappt das trotzdem?",
        a: "Ja. Die Buttons, die XBlock hinzufügt, hängen nicht von der Sprache von X ab, und es erkennt die Dialoge von X zum Blockieren und Entblocken in jeder Sprache. Die Erweiterung selbst spricht Englisch, Französisch, Spanisch, Deutsch, Japanisch, Portugiesisch und Indonesisch, und Übersetzungen sind willkommen.",
      },
      {
        q: "Kann ich sehen, wer auf einer Liste steht, bevor ich sie abonniere?",
        a: "Ja. Im Popup kannst du die Accounts einer Liste durchsehen, mit ihren Follower-Zahlen und ob du sie schon blockiert oder stummgeschaltet hast. Und der Schild-Button an einem Post schützt diesen Account, egal was deine Listen sagen.",
      },
      {
        q: "In welchen Browsern läuft es?",
        a: "In Chrome und den Browsern, die aus dem Chrome Web Store installieren: Edge, Brave, Opera, Vivaldi und Arc. Auf dem Computer, denn die Handy-Apps von X unterstützen keine Erweiterungen.",
      },
      {
        q: "Wie mache ich eine Blockierung rückgängig?",
        a: "Entblocke den Account wie gewohnt auf X: XBlock bemerkt den Entblocken-Dialog von X und nimmt ihn von deiner Liste. Oder drück das Schild an einem seiner Posts: Das nimmt ihn von deiner Liste und schützt ihn vor allen Listen. Beendest du ein Abo, wirkt die Liste ab dann nicht mehr; Accounts, die sie schon auf X blockiert hat, bleiben blockiert, bis du sie entblockst.",
      },
    ],
  },

  cta: {
    eyebrow: "Hol dir XBlock",
    title: "Hol dir deine ==Timeline== zurück.",
    body: "Kostenlos, ohne Konto und mit einem Klick wieder weg, falls du es dir anders überlegst.",
    add: "Zu Chrome hinzufügen",
    star: "Stern auf GitHub geben",
  },

  footer: {
    tagline: "Trolle, Bots und Spam auf X mit einem Klick blockieren und Blocklisten teilen. Kostenlos und Open Source.",
    product: "Produkt",
    walkthrough: "Video-Rundgang",
    store: "Chrome Web Store",
    openSource: "Open Source",
    source: "Quellcode",
    selfHost: "Server selbst hosten",
    bug: "Fehler melden",
    license: "MIT-Lizenz",
    about: "Über uns",
    privacy: "Datenschutzerklärung",
    contact: "Kontakt",
    coffee: "Spendier uns einen Kaffee",
    madeBy: "Gemacht von",
    notAffiliated: "Nicht mit X Corp. verbunden.",
    pressD: "Drück D für den Dark Mode",
  },

  privacyPage: {
    metaTitle: "Datenschutzerklärung",
    metaDescription: "Was die XBlock-Erweiterung und ihr Server speichern, warum, und wie du es löschen lassen kannst.",
    eyebrow: "Datenschutz",
    title: "Datenschutzerklärung",
    updated: "Zuletzt aktualisiert am {date}",
    date: "30. Oktober 2026",
    // Each section: an optional heading, paragraphs, an optional list, then more paragraphs
    sections: [
      {
        heading: "",
        paragraphs: [
          "XBlock ist eine Browser-Erweiterung für X (ehemals Twitter) und ein kleiner Server, der deine Blocklisten speichert. Entwickelt wird es von Matrice Technologies in Frankreich, und der Code ist öffentlich auf [GitHub]({github}). Diese Seite erklärt, was gespeichert wird, warum, und wie du es löschen lassen kannst. Die Kurzfassung: kein Konto, keine E-Mail, kein X-Passwort und nichts darüber, was du liest.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Wer du für XBlock bist",
        paragraphs: [
          "Niemand Bestimmtes. Bei der Installation erstellt die Erweiterung in deinem Browser einen zufälligen Schlüssel und legt ihn im Sync-Speicher von Chrome ab, damit dir deine Listen auf deine anderen Computer folgen. Die Erweiterung sendet diesen Schlüssel mit jeder Anfrage, und der Server macht daraus per Einweg-HMAC-SHA256 eine ID. Der Server speichert diese ID, nie den Schlüssel. Außerdem bekommst du einen zufälligen Anzeigenamen wie „Brave Otter“, der auf den Listen erscheint, die du teilst.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Was der Server speichert",
        paragraphs: [],
        list: [
          "**Deine Listen**: die X-Handles, die du mit XBlock blockiert hast, den Namen der Liste, ihren Code zum Teilen und bei kuratierten Listen eine kurze Notiz pro Account.",
          "**Deine erlaubten Accounts**: die Handles, die du mit dem Schild markiert hast, damit keine Liste sie je blockiert.",
          "**Deine Abos**: welchen Listen du folgst und welchen Modus jede davon nutzt (Auf X blockieren, Auf X stummschalten, Ausblenden oder Weichzeichnen).",
          "**Was XBlock auf X für dich blockiert oder stummgeschaltet hat**, damit ein Durchlauf nie denselben Account zweimal bearbeitet.",
          "**Deine Einstellungen** (zum Beispiel, ob Block-Animationen an sind), wann du dazugekommen bist und wann du zuletzt verbunden warst.",
          "**Öffentliche Follower-Zahlen** von X-Accounts, die in Timelines auftauchen. Sie sind nicht mit dir verknüpft: Alle teilen sie, damit Durchläufe mit den größten Accounts beginnen können.",
        ],
        after: [
          "Listen sind absichtlich öffentlich: Wer den Code zum Teilen einer Liste hat, sieht die Handles darauf und den zufälligen Anzeigenamen des Besitzers.",
        ],
      },
      {
        heading: "Was er nie sieht",
        paragraphs: [],
        list: [
          "Dein X-Passwort, deine Cookies oder deine Sitzung. Blockieren und Stummschalten gehen direkt von deinem Browser an X.",
          "Deine E-Mail-Adresse, deinen echten Namen oder deine Telefonnummer. XBlock fragt nie danach.",
          "Was du auf X liest, schreibst, likest oder suchst, und deinen Browserverlauf.",
          "Deine Direktnachrichten.",
        ],
        after: [],
      },
      {
        heading: "Was in deinem Browser passiert",
        paragraphs: [
          "Auf x.com liest die Erweiterung, wer jeden Post geschrieben hat, damit sie ihre Buttons hinzufügen und deine Listen anwenden kann. Wenn du blockierst oder stummschaltest, ruft sie X selbst auf, über deine bestehende Sitzung, genau wie x.com es tun würde. Einstellungen wie deine Wahl der Animation werden im Speicher von Chrome abgelegt.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Weitergabe und Verkauf",
        paragraphs: [
          "Wir verkaufen oder vermieten nichts davon, zeigen keine Werbung und nutzen weder Analyse-Tools noch Tracker von Dritten, weder in der Erweiterung noch auf dieser Website. Der Server läuft auf einer Maschine, die wir bei Hostinger mieten; dieser Hoster ist der einzige Dritte, der mit den Daten in Berührung kommt.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Netzwerk-Logs",
        paragraphs: [
          "Der Server nutzt deine IP-Adresse im Arbeitsspeicher, um Missbrauch per Rate-Limit zu bremsen, und schreibt sie nie in seine Datenbank. Der XBlock-Server selbst schreibt keine Request-Logs.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Aufbewahrung und Löschung",
        paragraphs: [
          "Deine Daten bleiben gespeichert, solange du XBlock nutzt. Um sie zu löschen, schick deinen Schlüssel (er steht im Popup der Erweiterung) an [{email}](mailto:{email}), und wir löschen alles, was damit verknüpft ist: Listen, Abos, erlaubte Accounts und Block-Verlauf. Wenn du die Erweiterung deinstallierst, wird der Schlüssel aus deinem Browser entfernt; ohne ihn kann niemand mehr auf diese Daten zugreifen.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Selbst betreiben",
        paragraphs: [
          "Wenn du lieber alles selbst behältst: Der Server ist Open Source und läuft überall, wo Docker läuft. Die [Anleitung zum Selbsthosten]({selfHost}) zeigt, wie du die Erweiterung für deinen eigenen Server baust.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Änderungen und Kontakt",
        paragraphs: [
          "Wenn sich diese Erklärung ändert, erscheint die neue Version mit neuem Datum auf dieser Seite. Fragen: [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    // Shown above a translated policy; empty in English, which is the reference
    translationNote: "Dies ist eine Übersetzung; maßgeblich ist die [englische Fassung](/en/privacy).",
  },

  // The Chrome Web Store images (app/[lang]/store), one per frame
  store: {
    badge: "Kostenlos · Open Source · Kein Konto",
    shots: [
      {
        kicker: "Ein Klick",
        title: "Trolle blocken mit ==einem Klick==.",
        body: "Ein Block-Button an jedem Post. Gedrückt halten, und der Post explodiert.",
      },
      {
        kicker: "Samurai-Modus",
        title: "Oder zerleg sie in ==Einzelteile==.",
        body: "Zieh die Maus durch den Post. Hör auf, und er ist blockiert.",
      },
      {
        kicker: "Geteilte Listen",
        title: "Einmal blocken, ==alle geschützt==.",
        body: "Teil deine Liste per Code. Wer sie abonniert, ist auch geschützt.",
      },
      {
        kicker: "Deine Regeln",
        title: "Vier Modi, ==du entscheidest==.",
        body: "Blockieren, stummschalten, ausblenden oder weichzeichnen, Liste für Liste.",
      },
      {
        kicker: "Massenblockierung",
        title: "Tausende Accounts, ==von allein==.",
        body: "Die größten Accounts zuerst, in einem Tempo, das X mitmacht.",
      },
    ],
    promoTitle: "Trolle blocken mit ==einem Klick==.",
    marqueeTitle: "Trolle blocken mit ==einem Klick==.",
    marqueeBody: "Geteilte Blocklisten, Samurai-Modus und Massenblockierung. Kostenlos und Open Source.",
  },
}
