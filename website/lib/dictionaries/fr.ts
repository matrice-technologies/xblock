import type { Dict, PolicySection } from "./en"

export const fr: Dict = {
  meta: {
    title: "XBlock · Bloquez les trolls sur X en un clic",
    description:
      "Bloquez trolls, bots et spam sur X en un clic, partagez vos listes de blocage et abonnez-vous à celles des autres. Gratuit, open source, sans compte.",
  },

  nav: {
    try: "Essayer",
    features: "Fonctionnalités",
    watch: "Vidéo",
    privacy: "Confidentialité",
    openSource: "Open source",
    faq: "FAQ",
    github: "GitHub",
    addToChrome: "Ajouter à Chrome",
    theme: "Passer en clair ou en sombre (ou touche D)",
    menu: "Ouvrir le menu",
    language: "Langue",
    home: "XBlock, accueil",
  },

  hero: {
    eyebrow: "Extension Chrome gratuite pour X",
    titleA: "Bloquez les trolls",
    titleB: "en un clic.",
    lead: "XBlock ajoute un bouton bloquer sur chaque post de X, vous permet de partager votre liste de blocage avec un code, et bloque tous les comptes des listes auxquelles vous vous abonnez. Ou, si vous préférez, découpez-les d’abord en rondelles. Allez-y, essayez.",
    cta: "Ajouter à Chrome, c’est gratuit",
    try: "Essayer ici même",
    meta: "Fonctionne avec X dans toutes les langues · Chrome, Edge, Brave, Arc",
  },

  // The playable Samurai stage in the hero
  stage: {
    label: "Un post de troll à trancher, façon Samurai",
    takeOver: "Tranchez le post pour prendre la main",
    takeOverShort: "Tranchez, à vous",
    sliceMouse: "Tranchez-le avec la souris",
    sliceFinger: "Tranchez-le avec le doigt",
    sliceShort: "Tranchez-le",
    cuts: "Coupes : {n}",
    sliced: "{n} au tapis",
    blocked: "**@{handle}** bloqué",
    posts: [
      "Personne t’a demandé ton avis. Ratio + L + supprime ton compte. 🤡",
      "$MOON va faire x100 🚀🚀 Dernière chance de monter à bord. Écris-moi en DM pour la prévente, plus que 20 places !!",
      "Alors en fait, moi qui n’ai jamais fait ton métier, je vais t’expliquer comment ça marche. 🧐",
      "Gagnez 5 000 € par jour depuis chez vous !!! 💸💸 Aucune compétence requise. Lien en bio 👇",
      "Vous n’allez JAMAIS CROIRE ce qu’ils ont osé dire cette fois. Thread 🧵👇 (vous allez halluciner)",
    ],
  },

  ticker: {
    blocked: "bloqué",
    muted: "masqué",
  },

  // X's own words, in the look-alike posts
  x: {
    forYou: "Pour vous",
    following: "Abonnements",
    verified: "Certifié",
  },

  try: {
    label: "Bac à sable",
    count: "Les vraies animations",
    eyebrow: "Essayer",
    title: "Allez-y, bloquez un ==troll==.",
    lead: "Un faux x.com qui tourne avec les animations de XBlock. Maintenez le bouton bloquer d’un post jusqu’à ce qu’il explose, ou passez en mode **Samurai** et découpez-le en morceaux. Rien ici ne touche à votre compte X.",
    note: "Sur x.com, le même bouton bloque (ou masque) le compte pour de vrai, via X lui-même, et l’ajoute à votre liste. Le bouclier juste à côté fait l’inverse : ce compte n’est jamais bloqué, quoi que disent vos listes.",
  },

  playground: {
    posts: [
      "Coucher de soleil sur la baie ce soir. Irréel.",
      "$MOON va faire x100 🚀 Dernière chance de monter à bord. Écris-moi en DM pour la prévente.",
      "Quelqu’un aurait un bon livre pour les vacances ? Je cherche de la SF.",
      "Personne t’a demandé ton avis. Ratio + L + supprime ton compte.",
      "Mon nouveau projet sort demain, trop hâte de vous le montrer !",
      "Gagnez 5 000 € par jour depuis chez vous !!! 💸 Lien en bio",
      "Café, playlist, et c’est parti.",
    ],
    settings: "Réglages XBlock",
    counter: "Bloqués dans cette démo",
    counterDetail: "Bloqués : {blocked} · masqués : {muted}",
    animation: "Animation de blocage",
    explode: "Explosion",
    explodeHint: "Appui long pour le faire exploser",
    samurai: "Samurai",
    samuraiHint: "Clic, puis tranchez-le",
    off: "Désactivée",
    offHint: "Blocage immédiat",
    action: "Le bouton bloquer d’un post doit",
    block: "Bloquer",
    blockHint: "Ils ne peuvent plus vous suivre ni voir vos posts",
    mute: "Masquer",
    muteHint: "Disparus de votre fil, sans qu’ils le sachent",
    hintExplode: "Maintenez le bouton bloquer d’un post jusqu’à ce qu’il explose.",
    hintSamurai: "Cliquez sur le bouton bloquer d’un post, puis tranchez-le. Échap le remet en place.",
    hintOff: "Cliquez sur le bouton bloquer d’un post, et hop, il disparaît.",
    reset: "Réinitialiser le fil de démo",
    toastBlocked: "@{handle} bloqué sur X",
    toastMuted: "@{handle} masqué sur X",
    toastAllowed: "@{handle} ne sera jamais bloqué",
    undo: "Annuler",
    allow: "Ne jamais bloquer @{handle}",
    unallow: "Autoriser à nouveau le blocage de @{handle}",
    blockLabel: "Bloquer @{handle}",
    muteLabel: "Masquer @{handle}",
    hold: "(maintenir)",
    holdMe: "Restez appuyé",
    clickMe: "Cliquez ici",
    cleanTitle: "Votre fil est tout propre.",
    cleanBody: "C’est tout l’intérêt. Sur x.com, XBlock les bloque pour de vrai.",
    cleanButton: "Faire revenir les trolls",
    doneBlock: "Terminé · bloquer @{handle}",
    doneMute: "Terminé · masquer @{handle}",
  },

  // The Samurai stage's own labels (as in the extension)
  samurai: {
    hintMouse: "Tranchez le post avec la souris",
    hintFinger: "Tranchez le post avec le doigt",
    cancelKey: "Échap pour annuler",
    cancelTap: "Touchez pour annuler",
    cuts: "Coupes : {n}",
  },

  features: {
    label: "Fonctionnalités",
    count: "4 modules",
    lead: "Faites le ménage sur X une bonne fois, pour vous et vos amis.",
    rest: "Bloquez en un clic, partagez ce que vous avez bloqué, abonnez-vous aux listes des gens en qui vous avez confiance, et laissez le blocage groupé traiter des milliers de comptes pendant que vous faites autre chose.",
    shareKicker: "Listes partagées",
    shareTitle: "Bloquez une fois. Tous les abonnés à votre code sont protégés.",
    shareBody: "Chaque compte que vous bloquez rejoint votre propre liste, avec un code de partage comme `XBK-7Q2M9`. Envoyez-le à vos amis, mettez-le dans votre bio, ou collez le code d’un créateur pour vous abonner à sa liste. Chaque nouvel ajout arrive aussitôt chez tous les abonnés.",
    modesKicker: "Modes",
    modesTitle: "Chaque liste choisit : bloquer, masquer, cacher ou flouter.",
    modesBody: "Vous avez toute confiance en une liste ? Qu’elle bloque sur X. Un doute ? Masquez, ils n’en sauront rien. Ou laissez X en dehors de tout ça : cachez ces posts, ou floutez-les, un clic suffit pour jeter un œil. Quand deux listes ne sont pas d’accord, la plus stricte l’emporte.",
    batchKicker: "Blocage groupé",
    batchTitle: "Des milliers de comptes, pendant que vous vivez votre vie.",
    batchBody: "Un clic, et une petite fenêtre x.com passe en revue toutes les listes réglées pour agir sur X, les plus gros comptes d’abord, et bloque ou masque chacun selon sa liste. Elle traite un compte toutes les 6 à 10 secondes, fait une pause quand X le demande, et reprend là où elle s’était arrêtée. (Ici, la démo est accélérée.)",
    languageKicker: "Toutes les langues",
    languageTitle: "Bloqué depuis le menu de X ? Il est aussi dans votre liste.",
    languageBody: "Bloquez quelqu’un comme d’habitude, depuis le menu du post, et XBlock l’ajoute aussi à votre liste. Il reconnaît les fenêtres Bloquer et Débloquer de X dans toutes les langues, du français au japonais.",
  },

  share: {
    posts: ["Personne t’a demandé. Ratio + L.", "Alors, en tant qu’homme, laisse-moi t’expliquer…", "Gagnez 5 000 € par jour depuis chez vous !!! 💸"],
    youBlock: "Vous les bloquez, une fois",
    yourList: "Votre liste de blocage",
    accounts: "{n} comptes",
    copy: "Copier le code de partage {code}",
    copied: "Copié",
    subscribers: "Abonnés",
    people: "1 248 personnes",
    gone: "**@{handle}** disparaît pour eux tous.",
    everyone: "Tous ceux qui se sont abonnés à votre code.",
  },

  modes: {
    listName: "Bots crypto & spam",
    by: "par @{owner} · {size} comptes",
    group: "Mode de cette liste",
    autoblock: "Bloquer sur X",
    autoblockNote: "Bloqués sur X, pour de bon. Ils ne peuvent plus vous voir non plus.",
    automute: "Masquer sur X",
    automuteNote: "Masqués sur X. Disparus de votre fil, et ils n’en sauront jamais rien.",
    hide: "Cacher",
    hideNote: "Repliés dans votre navigateur. Rien ne change sur X.",
    blur: "Flouter",
    blurNote: "Floutés dans votre navigateur, un clic pour les lire quand même.",
    blocked: "Bloqué",
    muted: "Masqué",
    inBrowser: "Dans votre navigateur",
    blockedIn: "est bloqué dans",
    show: "Afficher",
    posts: [
      "Petit thread sur mes outils préférés pour bosser.",
      "$MOON va faire x100 🚀 Écris-moi en DM pour la prévente.",
      "Merci à tous pour vos retours sur le projet !",
    ],
  },

  batch: {
    title: "XBlock · blocage groupé",
    running: "En cours",
    done: "Terminé",
    thisRun: "bloqués ou masqués pendant cette session",
    ofLists: "{percent} % de vos listes Bloquer et Masquer",
    closing: "fermeture dans 3 s",
    left: "{n} restants",
    allHandled: "Tous les comptes de vos listes Bloquer et Masquer sont traités",
    blocking: "Blocage de **@{handle}**",
    muting: "Masquage de **@{handle}**",
    followers: "{n} abonnés",
    lists: "Listes",
    recent: "Récents",
    loading: "Chargement des comptes à bloquer…",
    listA: "Donneurs de leçons de la tech",
    listB: "Bots crypto & spam",
    modeBlock: "Bloquer sur X",
    modeMute: "Masquer sur X",
    blocked: "Bloqué",
    muted: "Masqué",
  },

  language: {
    added: "@{handle} ajouté à votre liste XBlock",
  },

  watch: {
    label: "Démo vidéo",
    count: "1 min 51 s",
    eyebrow: "Vidéo",
    title: "Toutes les fonctionnalités, en moins de deux minutes.",
    lead: "Filmé sur la vraie extension : la popup, les listes partagées, les quatre modes, le blocage groupé et le mode Samurai.",
  },

  how: {
    eyebrow: "Comment ça marche",
    title: "Prêt en une minute",
    steps: [
      {
        label: "Étape 1",
        title: "Installez",
        body: "Ajoutez XBlock à Chrome. Il vous crée aussitôt une clé anonyme : pas d’inscription, pas d’e-mail, pas de mot de passe X.",
      },
      {
        label: "Étape 2",
        title: "Bloquez",
        body: "Chaque post sur x.com reçoit un bouton bloquer. Bloquez un troll et il atterrit dans votre propre liste, prête à être partagée.",
      },
      {
        label: "Étape 3",
        title: "Partagez et abonnez-vous",
        body: "Envoyez le code de votre liste à vos amis. Collez celui de quelqu’un d’autre pour vous abonner, et choisissez ce que sa liste fait pour vous.",
      },
    ],
  },

  privacy: {
    eyebrow: "Confidentialité",
    title: "Aucun compte à créer, rien qui puisse fuiter",
    lead: "XBlock a seulement besoin de savoir qui a écrit les posts à traiter. Rien d’autre.",
    parts: [
      {
        label: "Qui vous êtes",
        title: "Pas de compte",
        body: "XBlock crée une clé aléatoire dans votre navigateur. Notre serveur n’en garde qu’une empreinte, jamais la clé elle-même.",
      },
      {
        label: "Votre connexion X",
        title: "Ne quitte jamais votre navigateur",
        body: "Les blocages et masquages partent de votre navigateur directement vers X, avec la session que vous avez déjà. Nous ne voyons jamais votre mot de passe X ni vos cookies.",
      },
      {
        label: "Ce qu’il lit",
        title: "Des pseudos, pas des posts",
        body: "XBlock regarde qui a écrit chaque post, pour le traiter comme le veulent vos listes. Il ne collecte pas ce que vous lisez, écrivez ou aimez.",
      },
      {
        label: "La preuve",
        title: "Open source",
        body: "Chaque ligne de l’extension et du serveur est sur GitHub, sous licence MIT. Lisez-les, ou faites tourner votre propre serveur.",
      },
    ],
    flowKey: "votre clé",
    flowId: "le seul identifiant que nous gardons",
    serverLabel: "Sur notre serveur",
    serverTitle: "La liste complète",
    stored: [
      { what: "Une empreinte de votre clé", why: "Pour que vos listes et vos réglages vous suivent d’un ordinateur à l’autre." },
      { what: "Vos listes et vos comptes autorisés", why: "Des pseudos X, les noms que vous donnez à vos listes, et leurs codes de partage." },
      { what: "Vos abonnements", why: "Les listes que vous suivez, et le mode de chacune." },
      { what: "Ce que XBlock a bloqué ou masqué pour vous", why: "Pour qu’un blocage groupé ne traite jamais deux fois le même compte." },
      { what: "Les nombres d’abonnés publics", why: "Vus dans les fils, partagés par tous, pour bloquer les plus gros comptes d’abord." },
    ],
    details: "Les détails, et la marche à suivre pour tout faire supprimer, sont dans la [politique de confidentialité]({privacyHref}).",
  },

  oss: {
    label: "Open source",
    count: "Licence MIT",
    eyebrow: "Open source",
    title: "Lisez chaque ligne. Hébergez votre propre serveur.",
    body: "L’extension et son serveur vivent dans un seul dépôt, sous licence MIT. Vérifiez ce qu’elle fait, envoyez un correctif, ajoutez une langue, ou hébergez le serveur vous-même et compilez l’extension pour qu’elle l’utilise.",
    github: "Voir sur GitHub",
    selfHost: "Guide d’auto-hébergement",
    builtWith: "Construit avec",
    ownServer: "Votre propre serveur",
    commentApi: "# l’API, avec sa base de données sur un volume",
    commentExtension: "# l’extension, compilée pour l’utiliser",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Vos questions, nos réponses",
    items: [
      {
        q: "XBlock est vraiment gratuit ?",
        a: "Oui. Pas de pub, pas de version premium, pas de données à vendre. Il est open source, sous licence MIT. S’il préserve votre santé mentale, vous pouvez nous [offrir un café]({coffee}).",
      },
      {
        q: "Faut-il un compte ?",
        a: "Non. À l’installation, XBlock crée une clé aléatoire et la garde dans le stockage synchronisé de Chrome, pour qu’elle vous suive sur vos autres ordinateurs. La popup l’affiche aussi, si vous voulez la coller quelque part à la main.",
      },
      {
        q: "Quelle différence entre Bloquer sur X, Masquer sur X, Cacher et Flouter ?",
        a: "**Bloquer sur X** et **Masquer sur X** agissent sur votre compte X : les comptes bloqués ne peuvent plus vous suivre ni voir vos posts, les comptes masqués disparaissent simplement de votre fil, sans le savoir. **Cacher** et **Flouter** se passent uniquement dans votre navigateur : X ne voit rien, et vous pouvez revenir en arrière à tout moment. Chaque liste suivie a son propre mode, et le bouton bloquer des posts suit le réglage choisi dans la popup.",
      },
      {
        q: "X peut-il me suspendre si je bloque beaucoup de comptes ?",
        a: "Bloquer est une fonction normale de X, et XBlock l’utilise comme le fait x.com, depuis votre propre navigateur. Le blocage groupé traite un compte toutes les 6 à 10 secondes et fait une pause dès que X demande de ralentir. Nous ne pouvons pas parler au nom de X, mais c’est la façon la plus douce qui soit de bloquer en masse.",
      },
      {
        q: "Mon X est dans une autre langue. Ça marche ?",
        a: "Oui. Les boutons ajoutés par XBlock ne dépendent pas de la langue de X, et il reconnaît les fenêtres Bloquer et Débloquer de X dans toutes les langues. L’extension elle-même parle anglais, français, espagnol, allemand, japonais, portugais et indonésien, et les traductions sont les bienvenues.",
      },
      {
        q: "Peut-on voir qui est dans une liste avant de s’abonner ?",
        a: "Oui. La popup vous permet de parcourir les comptes d’une liste, avec leur nombre d’abonnés, et de voir si vous les avez déjà bloqués ou masqués. Et le bouclier sur un post protège ce compte, quoi que disent vos listes.",
      },
      {
        q: "Sur quels navigateurs fonctionne-t-il ?",
        a: "Chrome, et les navigateurs qui installent depuis le Chrome Web Store : Edge, Brave, Opera, Vivaldi et Arc. Sur ordinateur uniquement : les applis mobiles de X n’acceptent pas les extensions.",
      },
      {
        q: "Comment annuler un blocage ?",
        a: "Débloquez le compte sur X comme d’habitude : XBlock repère la fenêtre Débloquer de X et le retire de votre liste. Ou appuyez sur le bouclier de l’un de ses posts : le compte quitte votre liste et devient intouchable pour toutes les listes. Se désabonner d’une liste l’empêche d’agir à partir de ce moment ; les comptes qu’elle a déjà bloqués sur X le restent jusqu’à ce que vous les débloquiez.",
      },
    ],
  },

  cta: {
    eyebrow: "Installer XBlock",
    title: "Reprenez votre ==fil== en main.",
    body: "Gratuit, sans compte, et désinstallé en un clic si vous changez d’avis.",
    add: "Ajouter à Chrome",
    star: "Une étoile sur GitHub",
  },

  footer: {
    tagline: "Bloquez trolls, bots et spam sur X en un clic, et partagez vos listes de blocage. Gratuit et open source.",
    product: "Produit",
    walkthrough: "Vidéo de démo",
    store: "Chrome Web Store",
    openSource: "Open source",
    source: "Code source",
    selfHost: "Héberger votre serveur",
    bug: "Signaler un bug",
    license: "Licence MIT",
    about: "À propos",
    privacy: "Politique de confidentialité",
    contact: "Contact",
    coffee: "Offrez-nous un café",
    madeBy: "Fait par",
    notAffiliated: "Sans lien avec X Corp.",
    pressD: "Touche D pour le mode sombre",
  },

  privacyPage: {
    metaTitle: "Politique de confidentialité",
    metaDescription: "Ce que l’extension XBlock et son serveur conservent, pourquoi, et comment le faire supprimer.",
    eyebrow: "Confidentialité",
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour le {date}",
    date: "30 octobre 2026",
    // Each section: an optional heading, paragraphs, an optional list, then more paragraphs
    sections: [
      {
        heading: "",
        paragraphs: [
          "XBlock est une extension de navigateur pour X (anciennement Twitter), accompagnée d’un petit serveur qui conserve vos listes de blocage. Il est développé par Matrice Technologies, en France, et son code est public sur [GitHub]({github}). Cette page explique ce qu’il conserve, pourquoi, et comment le faire supprimer. En bref : pas de compte, pas d’e-mail, pas de mot de passe X, et rien sur ce que vous lisez.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Qui vous êtes, pour XBlock",
        paragraphs: [
          "Personne en particulier. À l’installation, l’extension crée une clé aléatoire dans votre navigateur et la garde dans le stockage synchronisé de Chrome, pour que vos listes vous suivent sur vos autres ordinateurs. L’extension envoie cette clé avec chaque requête, et le serveur la transforme en identifiant par un HMAC-SHA256 à sens unique. Le serveur stocke cet identifiant, jamais la clé. Il vous attribue aussi un nom d’affichage aléatoire, comme « Brave Otter », visible sur les listes que vous partagez.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Ce que le serveur conserve",
        paragraphs: [],
        list: [
          "**Vos listes** : les pseudos X que vous avez bloqués avec XBlock, le nom et le code de partage de la liste et, pour les listes curatées, une courte note par compte.",
          "**Vos comptes autorisés** : les pseudos que vous avez marqués avec le bouclier, pour qu’aucune liste ne les bloque jamais.",
          "**Vos abonnements** : les listes que vous suivez, et le mode de chacune (Bloquer sur X, Masquer sur X, Cacher ou Flouter).",
          "**Ce que XBlock a bloqué ou masqué pour vous sur X**, pour qu’un blocage groupé ne traite jamais deux fois le même compte.",
          "**Vos réglages** (si les animations de blocage sont activées, par exemple), la date de votre arrivée et celle de votre dernière connexion.",
          "**Les nombres d’abonnés publics** des comptes X qui apparaissent dans les fils. Ils ne sont pas liés à vous : tout le monde les partage, pour que les blocages groupés puissent commencer par les plus gros comptes.",
        ],
        after: [
          "Les listes sont publiques par nature : toute personne qui a le code de partage d’une liste peut voir les pseudos qu’elle contient et le nom d’affichage aléatoire de son propriétaire.",
        ],
      },
      {
        heading: "Ce qu’il ne voit jamais",
        paragraphs: [],
        list: [
          "Votre mot de passe X, vos cookies ou votre session. Les blocages et masquages partent de votre navigateur directement vers X.",
          "Votre adresse e-mail, votre vrai nom ou votre numéro de téléphone. XBlock ne les demande jamais.",
          "Ce que vous lisez, écrivez, aimez ou recherchez sur X, et votre historique de navigation.",
          "Vos messages privés.",
        ],
        after: [],
      },
      {
        heading: "Ce qui se passe dans votre navigateur",
        paragraphs: [
          "Sur x.com, l’extension lit qui a écrit chaque post, pour pouvoir ajouter ses boutons et appliquer vos listes. Quand vous bloquez ou masquez, elle appelle X directement, avec la session que vous avez déjà, exactement comme le ferait x.com. Les réglages, comme votre choix d’animation, sont conservés dans le stockage de Chrome.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Partage et vente",
        paragraphs: [
          "Nous n’en vendons ni n’en louons rien, n’affichons aucune publicité et n’utilisons aucun outil d’analyse ni traceur tiers, que ce soit dans l’extension ou sur ce site. Le serveur tourne sur une machine que nous louons chez Hostinger ; cet hébergeur est le seul tiers qui traite les données.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Journaux réseau",
        paragraphs: [
          "Le serveur utilise votre adresse IP en mémoire pour limiter les abus, et ne l’écrit jamais dans sa base de données. Le serveur XBlock lui-même n’écrit aucun journal de requêtes.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Conservation et suppression",
        paragraphs: [
          "Vos données sont conservées tant que vous utilisez XBlock. Pour les supprimer, envoyez votre clé (affichée dans la popup de l’extension) à [{email}](mailto:{email}), et nous supprimons tout ce qui y est lié : listes, abonnements, comptes autorisés et historique de blocage. Désinstaller l’extension retire la clé de votre navigateur ; sans elle, plus personne ne peut accéder à ces données.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Hébergez le vôtre",
        paragraphs: [
          "Si vous préférez tout garder chez vous, le serveur est open source et tourne partout où Docker tourne. Le [guide d’auto-hébergement]({selfHost}) explique comment compiler l’extension pour votre propre serveur.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Modifications et contact",
        paragraphs: [
          "Si cette politique change, la nouvelle version est publiée sur cette page avec une nouvelle date. Pour toute question : [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    // Shown above a translated policy; empty in English, which is the reference
    translationNote: "Ceci est une traduction : en cas de différence, c’est la [version anglaise](/en/privacy) qui fait foi.",
  },

  // The Chrome Web Store images (app/[lang]/store), one per frame
  store: {
    badge: "Gratuit · Open source · Sans compte",
    shots: [
      {
        kicker: "Un clic",
        title: "Bloquez les trolls en ==un clic==.",
        body: "Un bouton bloquer sur chaque post. Maintenez-le, et le post explose.",
      },
      {
        kicker: "Mode Samurai",
        title: "Ou découpez-les ==en rondelles==.",
        body: "Balayez le post avec la souris. Arrêtez-vous, et il est bloqué.",
      },
      {
        kicker: "Listes partagées",
        title: "Bloquez une fois, ==pour tous==.",
        body: "Partagez votre liste avec un code. Ses abonnés sont protégés aussi.",
      },
      {
        kicker: "Vos règles",
        title: "Bloquez, masquez, ==cachez, floutez==.",
        body: "Chaque liste suivie décide du sort de ses comptes.",
      },
      {
        kicker: "Blocage groupé",
        title: "Blocage en masse, ==sans les mains==.",
        body: "Les plus gros comptes d’abord, à un rythme qui convient à X.",
      },
    ],
    promoTitle: "Bloquez les trolls en ==un clic==.",
    marqueeTitle: "Bloquez les trolls en ==un clic==.",
    marqueeBody: "Listes partagées, mode Samurai et un blocage groupé qui fait le reste. Gratuit et open source.",
  },
}
