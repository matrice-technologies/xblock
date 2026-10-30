import type { Dict, PolicySection } from "./en"

export const es: Dict = {
  meta: {
    title: "XBlock · Bloquea a los trols de X con un clic",
    description:
      "Bloquea trols, bots y spam en X con un clic, comparte tus listas de bloqueo y suscríbete a las de otras personas. Gratis, de código abierto y sin cuenta.",
  },

  nav: {
    try: "Pruébalo",
    features: "Funciones",
    watch: "Míralo",
    privacy: "Privacidad",
    openSource: "Código abierto",
    faq: "Preguntas",
    github: "GitHub",
    addToChrome: "Agregar a Chrome",
    theme: "Cambiar a modo claro u oscuro (o presiona D)",
    menu: "Abrir el menú",
    language: "Idioma",
    home: "XBlock, inicio",
  },

  hero: {
    eyebrow: "Extensión gratis de Chrome para X",
    titleA: "Bloquea a los trols",
    titleB: "con un clic.",
    lead: "XBlock pone un botón de bloqueo en cada post de X, te deja compartir tu lista de bloqueo con un código y bloquea a todas las cuentas de las listas a las que te suscribes. O, si lo prefieres, antes córtalas en pedazos. Adelante, pruébalo.",
    cta: "Agrégalo a Chrome, es gratis",
    try: "Pruébalo aquí mismo",
    meta: "Funciona con X en cualquier idioma · Chrome, Edge, Brave, Arc",
  },

  // The playable Samurai stage in the hero
  stage: {
    label: "Un post de un trol que puedes cortar, al estilo Samurai",
    takeOver: "Atraviesa el post para tomar el control",
    takeOverShort: "Atraviésalo, te toca",
    sliceMouse: "Córtalo con el cursor",
    sliceFinger: "Córtalo con el dedo",
    sliceShort: "Córtalo",
    cuts: "Cortes: {n}",
    sliced: "{n} cortados",
    blocked: "**@{handle}** bloqueado",
    posts: [
      "Nadie pidió tu opinión. Ratio + L + borra tu cuenta. 🤡",
      "$MOON va a hacer x100 🚀🚀 Última oportunidad para entrar. Escríbeme por DM para la preventa, ¡¡solo quedan 20 lugares!!",
      "Pues mira, como alguien que nunca ha hecho tu trabajo, te explico cómo funciona. 🧐",
      "¡¡¡Gana $5.000 al día desde casa!!! 💸💸 Sin experiencia. Link en la bio 👇",
      "No vas a CREER lo que dijeron esta vez. Hilo 🧵👇 (te va a dar mucha rabia)",
    ],
  },

  ticker: {
    blocked: "bloqueado",
    muted: "silenciado",
  },

  // X's own words, in the look-alike posts
  x: {
    forYou: "Para ti",
    following: "Siguiendo",
    verified: "Verificado",
  },

  try: {
    label: "Zona de pruebas",
    count: "Las animaciones reales",
    eyebrow: "Pruébalo",
    title: "Adelante, bloquea a un ==trol==.",
    lead: "Un x.com de mentira con las animaciones de verdad de XBlock. Mantén presionado el botón de bloqueo de un post hasta que explote, o cambia a **Samurai** y córtalo en pedazos. Nada de esto toca tu cuenta de X.",
    note: "En x.com, ese mismo botón bloquea (o silencia) la cuenta de verdad, a través del propio X, y la agrega a tu lista. El escudo de al lado hace lo contrario: esa cuenta no se bloquea nunca, digan lo que digan tus listas.",
  },

  playground: {
    posts: [
      "Qué atardecer sobre la bahía esta noche. Increíble.",
      "$MOON va a hacer x100 🚀 Última oportunidad para entrar. Escríbeme por DM para la preventa.",
      "¿Alguien me recomienda un buen libro para las vacaciones? Busco ciencia ficción.",
      "Nadie pidió tu opinión. Ratio + L + borra tu cuenta.",
      "¡Mañana sale mi proyecto nuevo, qué ganas de enseñarlo!",
      "¡¡¡Gana $5.000 al día desde casa!!! 💸 Link en la bio",
      "Café, música y a trabajar.",
    ],
    settings: "Configuración de XBlock",
    counter: "Bloqueados en esta demo",
    counterDetail: "{blocked} bloqueados · {muted} silenciados",
    animation: "Animación de bloqueo",
    explode: "Explosión",
    explodeHint: "Mantén presionado para hacerlo explotar",
    samurai: "Samurai",
    samuraiHint: "Haz clic y córtalo",
    off: "Desactivada",
    offHint: "Bloqueo al instante",
    action: "El botón de bloqueo de un post debe",
    block: "Bloquear",
    blockHint: "No podrán seguirte ni ver tus posts",
    mute: "Silenciar",
    muteHint: "Desaparecen de tu cronología sin enterarse",
    hintExplode: "Mantén presionado el botón de bloqueo de un post hasta que explote.",
    hintSamurai: "Haz clic en el botón de bloqueo de un post y córtalo. Esc lo deja como estaba.",
    hintOff: "Haz clic en el botón de bloqueo de un post y desaparece.",
    reset: "Restablecer la cronología de la demo",
    toastBlocked: "@{handle} bloqueado en X",
    toastMuted: "@{handle} silenciado en X",
    toastAllowed: "@{handle} no se bloqueará nunca",
    undo: "Deshacer",
    allow: "Permitir siempre a @{handle}",
    unallow: "Dejar de permitir siempre a @{handle}",
    blockLabel: "Bloquear a @{handle}",
    muteLabel: "Silenciar a @{handle}",
    hold: "(mantén presionado)",
    holdMe: "Mantén presionado",
    clickMe: "Haz clic",
    cleanTitle: "Tu cronología está limpia.",
    cleanBody: "De eso se trata. En x.com, XBlock los bloquea de verdad.",
    cleanButton: "Que vuelvan los trols",
    doneBlock: "Listo · bloquear a @{handle}",
    doneMute: "Listo · silenciar a @{handle}",
  },

  // The Samurai stage's own labels (as in the extension)
  samurai: {
    hintMouse: "Corta el post con el cursor",
    hintFinger: "Corta el post con el dedo",
    cancelKey: "Esc para cancelar",
    cancelTap: "Toca para cancelar",
    cuts: "Cortes: {n}",
  },

  features: {
    label: "Funciones",
    count: "4 módulos",
    lead: "Limpia X una vez, para ti y tus amigos.",
    rest: "Bloquea con un clic, comparte lo que bloqueaste, suscríbete a las listas de la gente en la que confías y deja que un lote se encargue de miles de cuentas mientras haces otra cosa.",
    shareKicker: "Listas compartidas",
    shareTitle: "Bloquea una vez. Quien use tu código queda protegido.",
    shareBody: "Cada cuenta que bloqueas va a tu propia lista, que tiene un código para compartir como `XBK-7Q2M9`. Mándaselo a tus amigos, ponlo en tu bio o pega el código de un creador para suscribirte a su lista. Las nuevas entradas llegan a todos los suscriptores en cuanto se agregan.",
    modesKicker: "Modos",
    modesTitle: "Cada lista decide: bloquear, silenciar, ocultar o difuminar.",
    modesBody: "¿Confías del todo en una lista? Que bloquee en X. ¿No lo tienes claro? Silencia, y ni se enterarán. O deja a X al margen: oculta esos posts, o difumínalos y échales un vistazo con un clic. Si dos listas no coinciden, gana la más estricta.",
    batchKicker: "Lote",
    batchTitle: "Miles de cuentas, mientras sigues con tu día.",
    batchBody: "Un clic y una pequeña ventana de x.com recorre todas las listas configuradas para actuar en X, empezando por las cuentas más grandes, y bloquea o silencia cada una según diga su lista. Procesa una cuenta cada 6 a 10 segundos, se pausa cuando X se lo pide y retoma donde lo dejó. (Aquí la demo va acelerada.)",
    languageKicker: "Cualquier idioma",
    languageTitle: "¿Bloqueaste desde el menú de X? También va a tu lista.",
    languageBody: "Bloquea a alguien como siempre, desde el menú del post, y XBlock también lo agrega a tu lista. Reconoce los diálogos de Bloquear y Desbloquear de X en cualquier idioma, del inglés al japonés.",
  },

  share: {
    posts: ["Nadie preguntó. Ratio + L.", "Bueno, como hombre, te explico…", "¡¡¡Gana $5.000 al día desde casa!!! 💸"],
    youBlock: "Tú los bloqueas, una vez",
    yourList: "Tu lista de bloqueo",
    accounts: "{n} cuentas",
    copy: "Copiar el código para compartir {code}",
    copied: "Copiado",
    subscribers: "Suscriptores",
    people: "1.248 personas",
    gone: "**@{handle}** desaparece para todos ellos.",
    everyone: "Todos los que se suscribieron a tu código.",
  },

  modes: {
    listName: "Bots cripto y spam",
    by: "de @{owner} · {size} cuentas",
    group: "Modo de esta lista",
    autoblock: "Bloquear en X",
    autoblockNote: "Bloqueados en X para siempre. Ellos tampoco pueden verte.",
    automute: "Silenciar en X",
    automuteNote: "Silenciados en X. Desaparecen de tu cronología y nunca se enterarán.",
    hide: "Ocultar",
    hideNote: "Ocultos en tu navegador. En X no cambia nada.",
    blur: "Difuminar",
    blurNote: "Difuminados en tu navegador, con un clic los lees igualmente.",
    blocked: "Bloqueado",
    muted: "Silenciado",
    inBrowser: "En tu navegador",
    blockedIn: "está bloqueado en",
    show: "Mostrar",
    posts: [
      "Hilo rápido con mis herramientas favoritas para trabajar.",
      "$MOON va a hacer x100 🚀 Escríbeme por DM para la preventa.",
      "¡Gracias a todos por los comentarios sobre el proyecto!",
    ],
  },

  batch: {
    title: "XBlock · bloqueo en lote",
    running: "Bloqueando",
    done: "Listo",
    thisRun: "bloqueadas o silenciadas en esta sesión",
    ofLists: "{percent} % de tus listas de Bloquear y Silenciar",
    closing: "se cierra en 3 s",
    left: "Quedan {n}",
    allHandled: "Ya están procesadas todas las cuentas de tus listas de Bloquear y Silenciar",
    blocking: "Bloqueando a **@{handle}**",
    muting: "Silenciando a **@{handle}**",
    followers: "{n} seguidores",
    lists: "Listas",
    recent: "Recientes",
    loading: "Cargando las cuentas a bloquear…",
    listA: "Sabelotodos tech",
    listB: "Bots cripto y spam",
    modeBlock: "Bloquear en X",
    modeMute: "Silenciar en X",
    blocked: "Bloqueado",
    muted: "Silenciado",
  },

  language: {
    added: "@{handle} agregado a tu lista de XBlock",
  },

  watch: {
    label: "Recorrido",
    count: "1 min 51 s",
    eyebrow: "Míralo",
    title: "Todas las funciones en menos de dos minutos.",
    lead: "Grabado con la extensión real: la ventana de la extensión, las listas compartidas, los cuatro modos, el bloqueo en lote y el modo Samurai.",
  },

  how: {
    eyebrow: "Cómo funciona",
    title: "Listo en un minuto",
    steps: [
      {
        label: "Paso 1",
        title: "Instala",
        body: "Agrega XBlock a Chrome. Al instante te crea una clave anónima: sin registro, sin correo, sin contraseña de X.",
      },
      {
        label: "Paso 2",
        title: "Bloquea",
        body: "Cada post de x.com tiene un botón de bloqueo. Bloquea a un trol y pasa a tu propia lista, preparada para compartir.",
      },
      {
        label: "Paso 3",
        title: "Comparte y suscríbete",
        body: "Envía el código de tu lista a tus amigos. Pega el de otra persona para suscribirte y elige qué hace su lista por ti.",
      },
    ],
  },

  privacy: {
    eyebrow: "Privacidad",
    title: "Sin registro. Sin nada que filtrar.",
    lead: "XBlock solo necesita saber de quién son los posts que debe tratar. Nada más.",
    parts: [
      {
        label: "Quién eres",
        title: "Sin cuenta",
        body: "XBlock crea una clave aleatoria en tu navegador. Nuestro servidor solo guarda una huella de ella, nunca la clave en sí.",
      },
      {
        label: "Tu sesión de X",
        title: "Nunca sale de tu navegador",
        body: "Los bloqueos y silenciamientos van de tu navegador directamente a X, con la sesión que ya tienes iniciada. Nunca vemos tu contraseña ni tus cookies de X.",
      },
      {
        label: "Qué lee",
        title: "@usuarios, no posts",
        body: "XBlock mira quién escribió cada post para tratarlo según tus listas. No recopila lo que lees, escribes ni lo que te gusta.",
      },
      {
        label: "La prueba",
        title: "Código abierto",
        body: "Cada línea de la extensión y del servidor está en GitHub, bajo la licencia MIT. Lee el código o monta tu propio servidor.",
      },
    ],
    flowKey: "tu clave",
    flowId: "el único ID que guardamos",
    serverLabel: "En nuestro servidor",
    serverTitle: "La lista completa",
    stored: [
      { what: "Una huella de tu clave", why: "Para que tus listas y ajustes te acompañen en todos tus equipos." },
      { what: "Tus listas y cuentas permitidas", why: "@usuarios de X, los nombres que les pones a tus listas y sus códigos para compartir." },
      { what: "Tus suscripciones", why: "Qué listas sigues y el modo que usa cada una." },
      { what: "Lo que XBlock bloqueó o silenció por ti", why: "Para que un lote nunca procese dos veces la misma cuenta." },
      { what: "Recuentos públicos de seguidores", why: "Vistos en las cronologías y compartidos por todos, para bloquear primero las cuentas más grandes." },
    ],
    details: "Los detalles, y cómo pedir que se borre todo, están en la [política de privacidad]({privacyHref}).",
  },

  oss: {
    label: "Código abierto",
    count: "Licencia MIT",
    eyebrow: "Código abierto",
    title: "Lee cada línea. Monta tu propio servidor.",
    body: "La extensión y su servidor viven en un único repositorio bajo la licencia MIT. Revisa lo que hace, envía una corrección, agrega un idioma o aloja el servidor tú mismo y compila la extensión para usarlo.",
    github: "Ver en GitHub",
    selfHost: "Guía de autoalojamiento",
    builtWith: "Hecho con",
    ownServer: "Tu propio servidor",
    commentApi: "# la API, con su base de datos en un volumen",
    commentExtension: "# la extensión, compilada para usarla",
  },

  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Preguntas, respondidas",
    items: [
      {
        q: "¿XBlock es gratis de verdad?",
        a: "Sí. Sin anuncios, sin versión premium, sin datos que vender. Es de código abierto bajo la licencia MIT. Si te ayuda a conservar la cordura, puedes [invitarnos un café]({coffee}).",
      },
      {
        q: "¿Necesito una cuenta?",
        a: "No. Al instalar XBlock, se crea una clave aleatoria y se guarda en el almacenamiento sincronizado de Chrome, así te acompaña en tus otros equipos. La ventana de la extensión también la muestra, por si quieres pegarla en algún sitio a mano.",
      },
      {
        q: "¿Qué diferencia hay entre Bloquear en X, Silenciar en X, Ocultar y Difuminar?",
        a: "**Bloquear en X** y **Silenciar en X** actúan sobre tu cuenta de X: las cuentas bloqueadas no pueden seguirte ni ver tus posts, y las silenciadas simplemente desaparecen de tu cronología sin enterarse. **Ocultar** y **Difuminar** solo ocurren en tu navegador: X no ve nada y puedes volver atrás cuando quieras. Cada lista suscrita tiene su propio modo, y el botón de bloqueo del post sigue el ajuste que elijas en la ventana de la extensión.",
      },
      {
        q: "¿Puede X suspenderme por bloquear muchas cuentas?",
        a: "Bloquear es una función normal de X, y XBlock la usa igual que x.com, desde tu propio navegador. Los lotes procesan una cuenta cada 6 a 10 segundos y se pausan cada vez que X pide ir más despacio. No podemos hablar por X, pero no existe una forma más suave de bloquear en masa.",
      },
      {
        q: "Mi X está en otro idioma. ¿Funciona?",
        a: "Sí. Los botones que agrega XBlock no dependen del idioma de X, y reconoce los diálogos de Bloquear y Desbloquear de X en cualquier idioma. La extensión en sí habla inglés, francés, español, alemán, japonés, portugués e indonesio, y las traducciones son bienvenidas.",
      },
      {
        q: "¿Puedo ver quién está en una lista antes de suscribirme?",
        a: "Sí. La ventana de la extensión te deja recorrer las cuentas de una lista, con su número de seguidores y si ya las bloqueaste o silenciaste. Y el botón del escudo de un post protege esa cuenta, digan lo que digan tus listas.",
      },
      {
        q: "¿En qué navegadores funciona?",
        a: "En Chrome y en los navegadores que instalan extensiones desde la Chrome Web Store: Edge, Brave, Opera, Vivaldi y Arc. Solo en escritorio: las apps de X para el teléfono no admiten extensiones.",
      },
      {
        q: "¿Cómo deshago un bloqueo?",
        a: "Desbloquea la cuenta en X como siempre: XBlock detecta el diálogo de Desbloquear de X y la quita de tu lista. O presiona el escudo en uno de sus posts, que la quita de tu lista y la protege de todas las listas. Al cancelar la suscripción a una lista, deja de actuar a partir de ese momento; las cuentas que ya bloqueó en X siguen bloqueadas hasta que las desbloquees.",
      },
    ],
  },

  cta: {
    eyebrow: "Consigue XBlock",
    title: "Recupera tu ==cronología==.",
    body: "Gratis, sin cuenta y fuera con un clic si cambias de idea.",
    add: "Agregar a Chrome",
    star: "Dale una estrella en GitHub",
  },

  footer: {
    tagline: "Bloquea trols, bots y spam en X con un clic y comparte tus listas de bloqueo. Gratis y de código abierto.",
    product: "Producto",
    walkthrough: "Video de demostración",
    store: "Chrome Web Store",
    openSource: "Código abierto",
    source: "Código fuente",
    selfHost: "Aloja tu propio servidor",
    bug: "Avisar de un error",
    license: "Licencia MIT",
    about: "Acerca de",
    privacy: "Política de privacidad",
    contact: "Contacto",
    coffee: "Invítanos un café",
    madeBy: "Hecho por",
    notAffiliated: "Sin relación con X Corp.",
    pressD: "Presiona D para el modo oscuro",
  },

  privacyPage: {
    metaTitle: "Política de privacidad",
    metaDescription: "Qué guardan la extensión XBlock y su servidor, por qué y cómo pedir que se borre.",
    eyebrow: "Privacidad",
    title: "Política de privacidad",
    updated: "Última actualización: {date}",
    date: "30 de octubre de 2026",
    // Each section: an optional heading, paragraphs, an optional list, then more paragraphs
    sections: [
      {
        heading: "",
        paragraphs: [
          "XBlock es una extensión de navegador para X (antes Twitter) y un pequeño servidor que guarda tus listas de bloqueo. La desarrolla Matrice Technologies, en Francia, y su código es público en [GitHub]({github}). Esta página explica qué guarda, por qué y cómo pedir que se borre. En resumen: sin cuenta, sin correo electrónico, sin contraseña de X y nada sobre lo que lees.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Quién eres para XBlock",
        paragraphs: [
          "Nadie en particular. Al instalar la extensión, esta crea una clave aleatoria en tu navegador y la guarda en el almacenamiento sincronizado de Chrome, para que tus listas te acompañen en tus otros equipos. La extensión envía esa clave con cada solicitud, y el servidor la convierte en un ID mediante un HMAC-SHA256 unidireccional. El servidor guarda ese ID, nunca la clave. También te asigna un nombre visible aleatorio, como «Brave Otter», que aparece en las listas que compartes.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Qué guarda el servidor",
        paragraphs: [],
        list: [
          "**Tus listas**: los @usuarios de X que bloqueaste con XBlock, el nombre y el código para compartir de la lista y, en las listas curadas, una nota breve por cuenta.",
          "**Tus cuentas permitidas**: los @usuarios que marcaste con el escudo, para que ninguna lista los bloquee nunca.",
          "**Tus suscripciones**: qué listas sigues y el modo que usa cada una (Bloquear en X, Silenciar en X, Ocultar o Difuminar).",
          "**Lo que XBlock bloqueó o silenció por ti en X**, para que un lote nunca procese dos veces la misma cuenta.",
          "**Tus ajustes** (por ejemplo, si las animaciones de bloqueo están activadas), cuándo te uniste y cuándo te conectaste por última vez.",
          "**Recuentos públicos de seguidores** de las cuentas de X que aparecen en las cronologías. No están vinculados a ti: los comparte todo el mundo, para que los lotes puedan empezar por las cuentas más grandes.",
        ],
        after: [
          "Las listas son públicas por diseño: cualquiera que tenga el código para compartir de una lista puede ver los @usuarios que contiene y el nombre visible aleatorio de su propietario.",
        ],
      },
      {
        heading: "Lo que nunca ve",
        paragraphs: [],
        list: [
          "Tu contraseña, tus cookies o tu sesión de X. Los bloqueos y silenciamientos van de tu navegador directamente a X.",
          "Tu dirección de correo electrónico, tu nombre real o tu número de teléfono. XBlock nunca los pide.",
          "Lo que lees, escribes, te gusta o buscas en X, y tu historial de navegación.",
          "Tus mensajes directos.",
        ],
        after: [],
      },
      {
        heading: "Qué pasa en tu navegador",
        paragraphs: [
          "En x.com, la extensión lee quién escribió cada post para poder agregar sus botones y aplicar tus listas. Cuando bloqueas o silencias, llama directamente a X, con la sesión que ya tienes iniciada, exactamente como lo haría x.com. Los ajustes, como la animación que elegiste, se guardan en el almacenamiento de Chrome.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Compartir y vender",
        paragraphs: [
          "No vendemos ni alquilamos nada de esto, no mostramos anuncios y no usamos analíticas ni rastreadores de terceros, ni en la extensión ni en este sitio web. El servidor funciona en una máquina que alquilamos a Hostinger; ese proveedor es el único tercero que trata los datos.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Registros de red",
        paragraphs: [
          "El servidor usa tu dirección IP en memoria para limitar abusos, y nunca la escribe en su base de datos. El propio servidor de XBlock no escribe registros de solicitudes.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Conservación y eliminación",
        paragraphs: [
          "Tus datos se conservan mientras uses XBlock. Para borrarlos, envía tu clave (aparece en la ventana de la extensión) a [{email}](mailto:{email}) y borramos todo lo vinculado a ella: listas, suscripciones, cuentas permitidas e historial de bloqueos. Al desinstalar la extensión, la clave se elimina de tu navegador; sin ella, nadie puede volver a acceder a esos datos.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Tu propio servidor",
        paragraphs: [
          "Si prefieres guardarlo todo tú mismo, el servidor es de código abierto y funciona en cualquier sitio donde funcione Docker. La [guía de autoalojamiento]({selfHost}) explica cómo compilar la extensión para que use tu propio servidor.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Cambios y contacto",
        paragraphs: [
          "Si esta política cambia, la nueva versión se publica en esta página con una fecha nueva. Preguntas: [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    // Shown above a translated policy; empty in English, which is the reference
    translationNote: "Esta página es una traducción, y la versión de referencia es la [política en inglés](/en/privacy).",
  },

  // The Chrome Web Store images (app/[lang]/store), one per frame
  store: {
    badge: "Gratis · Código abierto · Sin cuenta",
    shots: [
      {
        kicker: "Un clic",
        title: "Bloquea trols con ==un clic==.",
        body: "Un botón de bloqueo en cada post. Mantenlo presionado y el post explota.",
      },
      {
        kicker: "Modo Samurai",
        title: "O córtalos ==en pedazos==.",
        body: "Pasa el cursor a través del post. Cuando pares, queda bloqueado.",
      },
      {
        kicker: "Listas compartidas",
        title: "Bloquea una vez, ==protege a todos==.",
        body: "Comparte tu lista con un código. Quien se suscriba también queda cubierto.",
      },
      {
        kicker: "Tus reglas",
        title: "Cuatro modos, ==a tu manera==.",
        body: "Bloquear, silenciar, ocultar o difuminar: cada lista decide qué pasa.",
      },
      {
        kicker: "Lote",
        title: "Miles de cuentas, ==sin tocar nada==.",
        body: "Primero las cuentas más grandes, a un ritmo que a X le parece bien.",
      },
    ],
    promoTitle: "Bloquea trols con ==un clic==.",
    marqueeTitle: "Bloquea trols con ==un clic==.",
    marqueeBody: "Listas de bloqueo compartidas, modo Samurai y un lote que hace el resto. Gratis y de código abierto.",
  },
}
