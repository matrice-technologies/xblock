import type { Dict, PolicySection } from "./en"

export const pt: Dict = {
  meta: {
    title: "XBlock · Bloqueie trolls no X com um clique",
    description:
      "Bloqueie trolls, bots e spam no X com um clique, compartilhe suas listas de bloqueio e assine as de outras pessoas. Grátis, código aberto, sem conta.",
  },

  nav: {
    try: "Experimente",
    features: "Recursos",
    watch: "Assista",
    privacy: "Privacidade",
    openSource: "Código aberto",
    faq: "Dúvidas",
    github: "GitHub",
    addToChrome: "Adicionar ao Chrome",
    theme: "Alternar entre claro e escuro (ou aperte D)",
    menu: "Abrir menu",
    language: "Idioma",
    home: "XBlock, início",
  },

  hero: {
    eyebrow: "Extensão grátis do Chrome para o X",
    titleA: "Bloqueie trolls",
    titleB: "com um clique.",
    lead: "O XBlock coloca um botão de bloquear em todo post do X, deixa você compartilhar sua lista de bloqueio com um código e bloqueia todo mundo das listas que você assina. Ou, se preferir, corta tudo em pedacinhos antes. Vai, testa aí.",
    cta: "Adicionar ao Chrome, é grátis",
    try: "Teste aqui mesmo",
    meta: "Funciona com o X em qualquer idioma · Chrome, Edge, Brave, Arc",
  },

  // The playable Samurai stage in the hero
  stage: {
    label: "Um post de troll para você fatiar, estilo Samurai",
    takeOver: "Passe pelo post para assumir o controle",
    takeOverShort: "Corta aí, sua vez",
    sliceMouse: "Fatie com o mouse",
    sliceFinger: "Fatie com o dedo",
    sliceShort: "Fatie",
    cuts: "Cortes: {n}",
    sliced: "{n} fatiados",
    blocked: "**@{handle}** bloqueado",
    posts: [
      "Ninguém pediu sua opinião. Ratio + L + apaga essa conta. 🤡",
      "$MOON vai fazer 100x 🚀🚀 Última chance de entrar. Chama na DM pra pré-venda, só restam 20 vagas!!",
      "Na verdade, como alguém que nunca fez o seu trabalho, deixa eu te explicar como funciona. 🧐",
      "Ganhe R$ 5.000 por dia sem sair de casa!!! 💸💸 Não precisa de experiência. Link na bio 👇",
      "Você NÃO VAI ACREDITAR no que eles falaram dessa vez. Segue o fio 🧵👇 (você vai ficar revoltado)",
    ],
  },

  ticker: {
    blocked: "bloqueado",
    muted: "silenciado",
  },

  // X's own words, in the look-alike posts
  x: {
    forYou: "Para você",
    following: "Seguindo",
    verified: "Verificado",
  },

  try: {
    label: "Área de testes",
    count: "As animações de verdade",
    eyebrow: "Experimente",
    title: "Vai, bloqueia um ==troll==.",
    lead: "Um x.com de mentirinha rodando as animações do próprio XBlock. Segure o botão de bloquear de um post até ele explodir, ou mude para o **Samurai** e corte o post em pedaços. Nada aqui mexe na sua conta do X.",
    note: "No x.com, o mesmo botão bloqueia (ou silencia) a conta de verdade, pelo próprio X, e coloca ela na sua lista. O escudo ao lado faz o contrário: aquela conta nunca é bloqueada, digam o que disserem suas listas.",
  },

  playground: {
    posts: [
      "Pôr do sol na orla hoje. Surreal.",
      "$MOON vai fazer 100x 🚀 Última chance de entrar. Chama na DM pra pré-venda.",
      "Alguém indica um livro bom pras férias? Tô procurando ficção científica.",
      "Ninguém pediu sua opinião. Ratio + L + apaga essa conta.",
      "Projeto novo sai amanhã, não vejo a hora de mostrar pra vocês!",
      "Ganhe R$ 5.000 por dia sem sair de casa!!! 💸 Link na bio",
      "Café, playlist e bora.",
    ],
    settings: "Configurações do XBlock",
    counter: "Bloqueados nesta demo",
    counterDetail: "{blocked} bloqueados · {muted} silenciados",
    animation: "Animação de bloqueio",
    explode: "Explosão",
    explodeHint: "Toque e segure para explodir",
    samurai: "Samurai",
    samuraiHint: "Clique e corte",
    off: "Desativada",
    offHint: "Bloqueia na hora",
    action: "O botão de bloqueio de um post deve",
    block: "Bloquear",
    blockHint: "Não poderão seguir você nem ver seus posts",
    mute: "Silenciar",
    muteHint: "Somem da sua timeline, sem ficarem sabendo",
    hintExplode: "Segure o botão de bloquear de um post até ele explodir.",
    hintSamurai: "Clique no botão de bloquear de um post e corte ele. Esc devolve o post.",
    hintOff: "Clique no botão de bloquear de um post e pronto, sumiu.",
    reset: "Reiniciar o feed da demo",
    toastBlocked: "@{handle} bloqueado no X",
    toastMuted: "@{handle} silenciado no X",
    toastAllowed: "@{handle} nunca será bloqueado",
    undo: "Desfazer",
    allow: "Sempre permitir @{handle}",
    unallow: "Deixar de sempre permitir @{handle}",
    blockLabel: "Bloquear @{handle}",
    muteLabel: "Silenciar @{handle}",
    hold: "(segure)",
    holdMe: "Segura aqui",
    clickMe: "Clica aqui",
    cleanTitle: "Seu feed está limpo.",
    cleanBody: "A ideia é exatamente essa. No x.com, o XBlock bloqueia de verdade.",
    cleanButton: "Trazer os trolls de volta",
    doneBlock: "Pronto · bloquear @{handle}",
    doneMute: "Pronto · silenciar @{handle}",
  },

  // The Samurai stage's own labels (as in the extension)
  samurai: {
    hintMouse: "Corte o post com o mouse",
    hintFinger: "Corte o post com o dedo",
    cancelKey: "Esc para cancelar",
    cancelTap: "Toque para cancelar",
    cuts: "Cortes: {n}",
  },

  features: {
    label: "Recursos",
    count: "4 módulos",
    lead: "Faça a faxina no X uma vez só, para você e seus amigos.",
    rest: "Bloqueie com um clique, compartilhe quem você bloqueou, assine as listas de quem você confia e deixe o bloqueio em massa dar conta de milhares de contas enquanto você faz outra coisa.",
    shareKicker: "Listas compartilhadas",
    shareTitle: "Bloqueie uma vez. Quem usa o código da sua lista fica protegido também.",
    shareBody: "Toda conta que você bloqueia entra na sua lista, com um código de compartilhamento tipo `XBK-7Q2M9`. Mande para os amigos, coloque na bio ou cole o código de um criador para assinar a lista dele. Cada conta nova chega a todos os assinantes assim que é adicionada.",
    modesKicker: "Modos",
    modesTitle: "Cada lista decide: bloquear, silenciar, ocultar ou desfocar.",
    modesBody: "Confia totalmente numa lista? Deixe ela bloquear no X. Na dúvida? Silencie, e ninguém fica sabendo. Ou deixe o X fora disso: oculte esses posts, ou desfoque e espie com um clique. Quando duas listas discordam, vale a mais forte.",
    batchKicker: "Em massa",
    batchTitle: "Milhares de contas, enquanto você segue com o seu dia.",
    batchBody: "Um clique e uma janelinha do x.com percorre todas as listas configuradas para agir no X, começando pelas maiores contas, e bloqueia ou silencia cada uma como a lista manda. Vai uma conta a cada 6 a 10 segundos, pausa quando o X pede e continua de onde parou. (Aqui a demo está acelerada.)",
    languageKicker: "Qualquer idioma",
    languageTitle: "Bloqueou pelo menu do próprio X? Entra na sua lista também.",
    languageBody: "Bloqueie alguém do jeito de sempre, pelo menu do post, e o XBlock coloca a pessoa na sua lista também. Ele reconhece as janelas de Bloquear e Desbloquear do X em qualquer idioma, do inglês ao japonês.",
  },

  share: {
    posts: ["Ninguém perguntou. Ratio + L.", "Na verdade, como homem, deixa eu te explicar…", "Ganhe R$ 5.000 por dia sem sair de casa!!! 💸"],
    youBlock: "Você bloqueia, uma vez só",
    yourList: "Sua lista de bloqueio",
    accounts: "{n} contas",
    copy: "Copiar o código {code}",
    copied: "Copiado",
    subscribers: "Assinantes",
    people: "1.248 pessoas",
    gone: "**@{handle}** sumiu para todos eles.",
    everyone: "Todo mundo que assinou o seu código.",
  },

  modes: {
    listName: "Bots de cripto e spam",
    by: "por @{owner} · {size} contas",
    group: "Modo desta lista",
    autoblock: "Bloquear no X",
    autoblockNote: "Bloqueado no X, de vez. E também não consegue mais te ver.",
    automute: "Silenciar no X",
    automuteNote: "Silenciado no X. Some do seu feed, e nem fica sabendo.",
    hide: "Ocultar",
    hideNote: "Recolhido no seu navegador. Nada muda no X.",
    blur: "Desfocar",
    blurNote: "Desfocado no seu navegador, um clique para ler mesmo assim.",
    blocked: "Bloqueado",
    muted: "Silenciado",
    inBrowser: "No seu navegador",
    blockedIn: "está bloqueado em",
    show: "Mostrar",
    posts: [
      "Fio rápido sobre minhas ferramentas favoritas de trabalho.",
      "$MOON vai fazer 100x 🚀 Chama na DM pra pré-venda.",
      "Valeu a todos pelo feedback no projeto!",
    ],
  },

  batch: {
    title: "XBlock · bloqueio em massa",
    running: "Bloqueando",
    done: "Pronto",
    thisRun: "bloqueadas ou silenciadas nesta sessão",
    ofLists: "{percent}% das suas listas Bloquear e Silenciar",
    closing: "fechando em 3 s",
    left: "Faltam {n}",
    allHandled: "Todas as contas das suas listas Bloquear e Silenciar foram processadas",
    blocking: "Bloqueando **@{handle}**",
    muting: "Silenciando **@{handle}**",
    followers: "{n} seguidores",
    lists: "Listas",
    recent: "Recentes",
    loading: "Carregando as contas a bloquear…",
    listA: "Sabe-tudo da tecnologia",
    listB: "Bots de cripto e spam",
    modeBlock: "Bloquear no X",
    modeMute: "Silenciar no X",
    blocked: "Bloqueado",
    muted: "Silenciado",
  },

  language: {
    added: "@{handle} adicionado à sua lista do XBlock",
  },

  watch: {
    label: "Demonstração",
    count: "1min51s",
    eyebrow: "Assista",
    title: "Todos os recursos em menos de dois minutos.",
    lead: "Gravado na extensão de verdade: o pop-up, as listas compartilhadas, os quatro modos, o bloqueio em massa e o modo Samurai.",
  },

  how: {
    eyebrow: "Como funciona",
    title: "Pronto para usar em um minuto",
    steps: [
      {
        label: "Passo 1",
        title: "Instale",
        body: "Adicione o XBlock ao Chrome. Ele cria uma chave anônima para você na hora: sem cadastro, sem e-mail, sem senha do X.",
      },
      {
        label: "Passo 2",
        title: "Bloqueie",
        body: "Todo post no x.com ganha um botão de bloquear. Bloqueie um troll e ele cai direto na sua lista, pronta para compartilhar.",
      },
      {
        label: "Passo 3",
        title: "Compartilhe e assine",
        body: "Mande o código da sua lista para os amigos. Cole o de outra pessoa para assinar e escolha o que a lista dela faz por você.",
      },
    ],
  },

  privacy: {
    eyebrow: "Privacidade",
    title: "Nada para cadastrar, nada para vazar",
    lead: "O XBlock só precisa saber de quem são os posts que ele deve tratar, e mais nada.",
    parts: [
      {
        label: "Quem você é",
        title: "Sem conta",
        body: "O XBlock cria uma chave aleatória no seu navegador. Nosso servidor guarda só uma impressão digital dela, nunca a chave em si.",
      },
      {
        label: "Seu login do X",
        title: "Nunca sai do seu navegador",
        body: "Bloqueios e silenciamentos vão do seu navegador direto para o X, na sessão que você já tem aberta. Nunca vemos sua senha nem seus cookies do X.",
      },
      {
        label: "O que ele lê",
        title: "Nomes de usuário, não posts",
        body: "O XBlock olha quem escreveu cada post, para tratá-lo como suas listas mandam. Ele não coleta o que você lê, escreve ou curte.",
      },
      {
        label: "Prova",
        title: "Código aberto",
        body: "Cada linha da extensão e do servidor está no GitHub, sob a licença MIT. Leia o código ou rode seu próprio servidor.",
      },
    ],
    flowKey: "sua chave",
    flowId: "o único ID que guardamos",
    serverLabel: "No nosso servidor",
    serverTitle: "A lista completa",
    stored: [
      { what: "Uma impressão digital da sua chave", why: "Para suas listas e configurações te acompanharem em outros computadores." },
      { what: "Suas listas e contas permitidas", why: "Nomes de usuário do X, os nomes que você dá às suas listas e os códigos de compartilhamento delas." },
      { what: "Suas assinaturas", why: "Quais listas você segue e o modo de cada uma." },
      { what: "O que o XBlock bloqueou ou silenciou para você", why: "Para o bloqueio em massa nunca tratar a mesma conta duas vezes." },
      { what: "Números públicos de seguidores", why: "Vistos nos feeds, compartilhados por todos, para bloquear as maiores contas primeiro." },
    ],
    details: "Os detalhes, e como pedir para apagar tudo, estão na [política de privacidade]({privacyHref}).",
  },

  oss: {
    label: "Código aberto",
    count: "Licença MIT",
    eyebrow: "Código aberto",
    title: "Leia cada linha. Rode seu próprio servidor.",
    body: "A extensão e o servidor dela ficam num único repositório, sob a licença MIT. Confira o que ela faz, mande uma correção, adicione um idioma, ou hospede o servidor você mesmo e compile a extensão apontando para ele.",
    github: "Ver no GitHub",
    selfHost: "Guia de auto-hospedagem",
    builtWith: "Feito com",
    ownServer: "Seu próprio servidor",
    commentApi: "# a API, com o banco de dados num volume",
    commentExtension: "# a extensão, compilada apontando para ela",
  },

  faq: {
    eyebrow: "Dúvidas",
    title: "Perguntas e respostas",
    items: [
      {
        q: "O XBlock é grátis mesmo?",
        a: "Sim. Sem anúncios, sem plano premium, sem dados para vender. É código aberto, sob a licença MIT. Se ele salvar sua sanidade, você pode [nos pagar um café]({coffee}).",
      },
      {
        q: "Preciso criar uma conta?",
        a: "Não. Quando você instala o XBlock, ele cria uma chave aleatória e a guarda no armazenamento sincronizado do Chrome, então ela te acompanha nos seus outros computadores. O pop-up também mostra a chave, se você quiser colar em algum lugar na mão.",
      },
      {
        q: "Qual a diferença entre Bloquear no X, Silenciar no X, Ocultar e Desfocar?",
        a: "**Bloquear no X** e **Silenciar no X** agem na sua conta do X: contas bloqueadas não podem te seguir nem ver seus posts, e as silenciadas simplesmente somem do seu feed sem saber. **Ocultar** e **Desfocar** acontecem só no seu navegador: o X não vê nada, e você pode voltar atrás quando quiser. Cada lista assinada tem seu próprio modo, e o botão de bloquear dos posts segue a configuração do pop-up.",
      },
      {
        q: "O X pode me suspender por bloquear muitas contas?",
        a: "Bloquear é um recurso normal do X, e o XBlock usa ele do mesmo jeito que o x.com, a partir do seu próprio navegador. O bloqueio em massa vai uma conta a cada 6 a 10 segundos e pausa sempre que o X pede para ir mais devagar. Não podemos falar pelo X, mas não existe jeito mais suave de bloquear em massa.",
      },
      {
        q: "Meu X está em outro idioma. Funciona?",
        a: "Sim. Os botões que o XBlock adiciona não dependem do idioma do X, e ele reconhece as janelas de Bloquear e Desbloquear do próprio X em qualquer idioma. A extensão em si fala inglês, francês, espanhol, alemão, japonês, português e indonésio, e traduções são bem-vindas.",
      },
      {
        q: "Dá para ver quem está numa lista antes de assinar?",
        a: "Sim. O pop-up deixa você navegar pelas contas de uma lista, com o número de seguidores de cada uma e se você já bloqueou ou silenciou. E o botão de escudo num post deixa aquela conta protegida, digam o que disserem suas listas.",
      },
      {
        q: "Em quais navegadores funciona?",
        a: "No Chrome e nos navegadores que instalam pela Chrome Web Store: Edge, Brave, Opera, Vivaldi e Arc. Só no computador: os apps do X para celular não aceitam extensões.",
      },
      {
        q: "Como desfaço um bloqueio?",
        a: "Desbloqueie pelo X, como sempre: o XBlock percebe a janela de Desbloquear do X e tira a pessoa da sua lista. Ou toque no escudo de um dos posts dela, que tira a conta da sua lista e a protege de todas as listas. Cancelar a assinatura impede que uma lista aja daí em diante; as contas que ela já bloqueou no X continuam bloqueadas até você desbloqueá-las.",
      },
    ],
  },

  cta: {
    eyebrow: "Instale o XBlock",
    title: "Pegue sua ==timeline== de volta.",
    body: "Grátis, sem conta, e sai com um clique se você mudar de ideia.",
    add: "Adicionar ao Chrome",
    star: "Dar uma estrela no GitHub",
  },

  footer: {
    tagline: "Bloqueie trolls, bots e spam no X com um clique e compartilhe suas listas de bloqueio. Grátis e de código aberto.",
    product: "Produto",
    walkthrough: "Vídeo de demonstração",
    store: "Chrome Web Store",
    openSource: "Código aberto",
    source: "Código-fonte",
    selfHost: "Hospede o servidor",
    bug: "Relatar um bug",
    license: "Licença MIT",
    about: "Sobre",
    privacy: "Política de privacidade",
    contact: "Contato",
    coffee: "Pague um café pra gente",
    madeBy: "Feito por",
    notAffiliated: "Sem vínculo com a X Corp.",
    pressD: "Aperte D para o modo escuro",
  },

  privacyPage: {
    metaTitle: "Política de privacidade",
    metaDescription: "O que a extensão XBlock e o servidor dela guardam, por quê e como pedir para apagar.",
    eyebrow: "Privacidade",
    title: "Política de privacidade",
    updated: "Última atualização: {date}",
    date: "30 de outubro de 2026",
    // Each section: an optional heading, paragraphs, an optional list, then more paragraphs
    sections: [
      {
        heading: "",
        paragraphs: [
          "O XBlock é uma extensão de navegador para o X (antigo Twitter) e um pequeno servidor que guarda suas listas de bloqueio. Ele é feito pela Matrice Technologies, na França, e o código dele é público no [GitHub]({github}). Esta página diz o que ele guarda, por quê e como pedir para apagar. Resumindo: sem conta, sem e-mail, sem senha do X e nada sobre o que você lê.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Quem você é, para o XBlock",
        paragraphs: [
          "Ninguém em especial. Quando você instala a extensão, ela cria uma chave aleatória no seu navegador e a guarda no armazenamento sincronizado do Chrome, para que suas listas te acompanhem nos seus outros computadores. A extensão envia essa chave a cada requisição, e o servidor a transforma em um ID com um HMAC-SHA256 de mão única. O servidor armazena esse ID, nunca a chave. Ele também te dá um nome de exibição aleatório, como “Brave Otter”, mostrado nas listas que você compartilha.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "O que o servidor guarda",
        paragraphs: [],
        list: [
          "**Suas listas**: os nomes de usuário do X que você bloqueou com o XBlock, o nome e o código de compartilhamento da lista e, nas listas com curadoria, uma breve nota por conta.",
          "**Suas contas permitidas**: os nomes de usuário que você marcou com o escudo, para que nenhuma lista nunca os bloqueie.",
          "**Suas assinaturas**: quais listas você segue e o modo de cada uma (Bloquear no X, Silenciar no X, Ocultar ou Desfocar).",
          "**O que o XBlock bloqueou ou silenciou para você no X**, para que o bloqueio em massa nunca trate a mesma conta duas vezes.",
          "**Suas configurações** (se as animações de bloqueio estão ativadas, por exemplo), quando você entrou e quando se conectou pela última vez.",
          "**Números públicos de seguidores** das contas do X que aparecem nos feeds. Eles não estão ligados a você: são compartilhados por todos, para que o bloqueio em massa possa começar pelas maiores contas.",
        ],
        after: [
          "As listas são públicas por natureza: qualquer pessoa com o código de compartilhamento de uma lista pode ver os nomes de usuário nela e o nome de exibição aleatório do dono.",
        ],
      },
      {
        heading: "O que ele nunca vê",
        paragraphs: [],
        list: [
          "Sua senha, seus cookies ou sua sessão do X. Bloqueios e silenciamentos vão do seu navegador direto para o X.",
          "Seu endereço de e-mail, nome real ou número de telefone. O XBlock nunca pergunta.",
          "O que você lê, escreve, curte ou pesquisa no X, e seu histórico de navegação.",
          "Suas mensagens diretas.",
        ],
        after: [],
      },
      {
        heading: "O que acontece no seu navegador",
        paragraphs: [
          "No x.com, a extensão lê quem escreveu cada post, para poder adicionar os botões dela e aplicar suas listas. Quando você bloqueia ou silencia, ela chama o próprio X, na sessão que você já tem aberta, exatamente como o x.com faria. Configurações como a animação escolhida ficam guardadas no armazenamento do Chrome.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Compartilhamento e venda",
        paragraphs: [
          "Não vendemos nem alugamos nada disso, não mostramos anúncios e não usamos ferramentas de análise nem rastreadores de terceiros, nem na extensão nem neste site. O servidor roda numa máquina que alugamos da Hostinger; essa hospedagem é o único terceiro que lida com os dados.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Registros de rede",
        paragraphs: [
          "O servidor usa seu endereço IP em memória para limitar abusos, e nunca o grava no banco de dados. O próprio servidor do XBlock não grava registros de requisições.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Guarda e exclusão",
        paragraphs: [
          "Seus dados ficam guardados enquanto você usar o XBlock. Para apagá-los, envie sua chave (mostrada no pop-up da extensão) para [{email}](mailto:{email}), e apagamos tudo o que estiver ligado a ela: listas, assinaturas, contas permitidas e histórico de bloqueios. Desinstalar a extensão remove a chave do seu navegador; sem ela, ninguém consegue acessar esses dados de novo.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Tenha o seu próprio servidor",
        paragraphs: [
          "Se você preferir guardar tudo por conta própria, o servidor é de código aberto e roda em qualquer lugar onde o Docker roda. O [guia de auto-hospedagem]({selfHost}) mostra como compilar a extensão apontando para o seu próprio servidor.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Alterações e contato",
        paragraphs: [
          "Se esta política mudar, a nova versão é publicada nesta página com uma nova data. Dúvidas: [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    // Shown above a translated policy; empty in English, which is the reference
    translationNote: "Esta página é uma tradução, e a [versão em inglês](/en/privacy) é a referência em caso de divergência.",
  },

  // The Chrome Web Store images (app/[lang]/store), one per frame
  store: {
    badge: "Grátis · Código aberto · Sem conta",
    shots: [
      {
        kicker: "Um clique",
        title: "Bloqueie trolls com ==um clique==.",
        body: "Um botão de bloquear em todo post. Segure, e o post explode.",
      },
      {
        kicker: "Modo Samurai",
        title: "Ou corte tudo em ==pedacinhos==.",
        body: "Passe o mouse pelo post. Parou, está bloqueado.",
      },
      {
        kicker: "Listas compartilhadas",
        title: "Bloqueie uma vez, ==proteja todos==.",
        body: "Compartilhe sua lista com um código. Quem assinar fica protegido também.",
      },
      {
        kicker: "Suas regras",
        title: "Do bloqueio ao ==desfoque==.",
        body: "Bloquear, silenciar, ocultar ou desfocar: cada lista assinada decide.",
      },
      {
        kicker: "Em massa",
        title: "Milhares de contas no ==automático==.",
        body: "As maiores contas primeiro, num ritmo que o X aceita numa boa.",
      },
    ],
    promoTitle: "Bloqueie trolls com ==um clique==.",
    marqueeTitle: "Bloqueie trolls com ==um clique==.",
    marqueeBody: "Listas de bloqueio compartilhadas, modo Samurai e um bloqueio em massa que faz o resto. Grátis e de código aberto.",
  },
}
