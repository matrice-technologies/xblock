import type { Dict, PolicySection } from "./en"

export const id: Dict = {
  meta: {
    title: "XBlock · Blokir troll di X cukup sekali klik",
    description:
      "Blokir troll, bot, dan spam di X cukup sekali klik, bagikan daftar blokirmu, dan langganan daftar milik orang lain. Gratis, open source, tanpa akun.",
  },

  nav: {
    try: "Coba",
    features: "Fitur",
    watch: "Tonton",
    privacy: "Privasi",
    openSource: "Open source",
    faq: "FAQ",
    github: "GitHub",
    addToChrome: "Tambahkan ke Chrome",
    theme: "Ganti mode terang atau gelap (atau tekan D)",
    menu: "Buka menu",
    language: "Bahasa",
    home: "XBlock, beranda",
  },

  hero: {
    eyebrow: "Ekstensi Chrome gratis untuk X",
    titleA: "Blokir troll",
    titleB: "cukup sekali klik.",
    lead: "XBlock memasang tombol blokir di setiap postingan di X, bikin kamu bisa membagikan daftar blokirmu lewat sebuah kode, dan memblokir semua akun di daftar yang kamu langgani. Atau, kalau mau, tebas dulu mereka sampai jadi potongan kecil. Ayo, coba sendiri.",
    cta: "Tambahkan ke Chrome, gratis",
    try: "Coba langsung di sini",
    meta: "Jalan di X dengan bahasa apa pun · Chrome, Edge, Brave, Arc",
  },

  stage: {
    label: "Postingan troll yang bisa kamu tebas, ala Samurai",
    takeOver: "Sapu menembus postingan untuk ambil alih",
    takeOverShort: "Sapu, giliranmu",
    sliceMouse: "Tebas pakai mouse",
    sliceFinger: "Tebas pakai jarimu",
    sliceShort: "Tebas",
    cuts: "Tebasan: {n}",
    sliced: "{n} ditebas",
    blocked: "**@{handle}** diblokir",
    posts: [
      "Gak ada yang nanya pendapat lu. Ratio + L + hapus akun sana. 🤡",
      "$MOON bentar lagi 100x 🚀🚀 Kesempatan terakhir buat masuk. DM aku buat presale, sisa 20 slot doang!!",
      "Sebenernya nih, sebagai orang yang gak pernah ngerjain kerjaanmu, sini aku jelasin gimana caranya. 🧐",
      "Cuan Rp5 juta sehari dari rumah!!! 💸💸 Gak perlu skill. Link di bio 👇",
      "Kalian gak bakal PERCAYA mereka ngomong apa kali ini. Utas 🧵👇 (dijamin emosi)",
    ],
  },

  ticker: {
    blocked: "diblokir",
    muted: "dibisukan",
  },

  x: {
    forYou: "Untuk Anda",
    following: "Mengikuti",
    verified: "Terverifikasi",
  },

  try: {
    label: "Arena coba",
    count: "Animasi aslinya",
    eyebrow: "Coba",
    title: "Ayo, blokir satu ==troll==.",
    lead: "x.com tiruan yang menjalankan animasi asli XBlock. Tahan tombol blokir di sebuah postingan sampai meledak, atau ganti ke **Samurai** dan tebas sampai terbelah. Tenang, akun X-mu sama sekali nggak tersentuh.",
    note: "Di x.com, tombol yang sama benar-benar memblokir (atau membisukan) akunnya, lewat X sendiri, lalu menambahkannya ke daftarmu. Tombol perisai di sebelahnya justru kebalikannya: akun itu tidak akan pernah diblokir, apa pun kata daftarmu.",
  },

  playground: {
    posts: [
      "Sunset di pantai sore ini. Cakep parah.",
      "$MOON bentar lagi 100x 🚀 Kesempatan terakhir buat masuk. DM aku buat presale.",
      "Ada rekomendasi buku bagus buat liburan? Lagi nyari sci-fi.",
      "Gak ada yang nanya pendapat lu. Ratio + L + hapus akun sana.",
      "Proyek baru rilis besok, gak sabar mau nunjukin ke kalian!",
      "Cuan Rp5 juta sehari dari rumah!!! 💸 Link di bio",
      "Ngopi, pasang playlist, gas.",
    ],
    settings: "Pengaturan XBlock",
    counter: "Diblokir di demo ini",
    counterDetail: "{blocked} diblokir · {muted} dibisukan",
    animation: "Animasi blokir",
    explode: "Ledakan",
    explodeHint: "Tekan lama untuk meledakkannya",
    samurai: "Samurai",
    samuraiHint: "Klik, lalu tebas",
    off: "Mati",
    offHint: "Langsung blokir",
    action: "Tombol blokir di postingan akan",
    block: "Blokir",
    blockHint: "Mereka tidak bisa mengikutimu atau melihat postinganmu",
    mute: "Bisukan",
    muteHint: "Hilang dari linimasamu, tanpa mereka tahu",
    hintExplode: "Tahan tombol blokir di postingan sampai meledak.",
    hintSamurai: "Klik tombol blokir di postingan, lalu tebas. Esc untuk mengembalikannya.",
    hintOff: "Klik tombol blokir di postingan, langsung hilang.",
    reset: "Atur ulang linimasa demo",
    toastBlocked: "@{handle} diblokir di X",
    toastMuted: "@{handle} dibisukan di X",
    toastAllowed: "@{handle} tidak akan pernah diblokir",
    undo: "Urungkan",
    allow: "Jangan pernah blokir @{handle}",
    unallow: "Izinkan blokir @{handle} lagi",
    blockLabel: "Blokir @{handle}",
    muteLabel: "Bisukan @{handle}",
    hold: "(tahan)",
    holdMe: "Tahan aku",
    clickMe: "Klik aku",
    cleanTitle: "Linimasamu sudah bersih.",
    cleanBody: "Memang itu intinya. Di x.com, XBlock memblokir mereka beneran.",
    cleanButton: "Panggil lagi para troll",
    doneBlock: "Selesai · blokir @{handle}",
    doneMute: "Selesai · bisukan @{handle}",
  },

  samurai: {
    hintMouse: "Tebas postingannya pakai mouse",
    hintFinger: "Tebas postingannya pakai jari",
    cancelKey: "Esc untuk batal",
    cancelTap: "Ketuk untuk batal",
    cuts: "Tebasan: {n}",
  },

  features: {
    label: "Fitur",
    count: "4 modul",
    lead: "Bersihkan X sekali saja, untukmu dan teman-temanmu.",
    rest: "Blokir sekali klik, bagikan siapa saja yang kamu blokir, langganan daftar dari orang yang kamu percaya, dan biarkan blokir massal mengurus ribuan akun selagi kamu sibuk dengan hal lain.",
    shareKicker: "Daftar bersama",
    shareTitle: "Blokir sekali. Semua yang pakai kode daftarmu ikut terlindungi.",
    shareBody: "Setiap akun yang kamu blokir masuk ke daftarmu sendiri, lengkap dengan kode berbagi seperti `XBK-7Q2M9`. Kirim ke teman, pasang di bio, atau tempel kode seorang kreator untuk berlangganan daftarnya. Entri baru langsung sampai ke setiap pelanggan begitu ditambahkan.",
    modesKicker: "Mode",
    modesTitle: "Tiap daftar yang menentukan: blokir, bisukan, sembunyikan, atau buramkan.",
    modesBody: "Percaya penuh sama sebuah daftar? Biarkan daftar itu memblokir di X. Masih ragu? Bisukan saja, biar mereka nggak pernah tahu. Atau jangan libatkan X sama sekali: sembunyikan postingan mereka, atau buramkan dan intip dengan sekali klik. Kalau dua daftar beda pendapat, yang paling tegas yang menang.",
    batchKicker: "Massal",
    batchTitle: "Ribuan akun beres, sementara kamu lanjut beraktivitas.",
    batchBody: "Sekali klik, jendela kecil x.com akan memproses setiap daftar yang diatur untuk bertindak di X, mulai dari akun terbesar, lalu memblokir atau membisukan tiap akun sesuai daftarnya. Satu akun tiap 6 sampai 10 detik, berhenti sejenak kalau X memintanya, dan lanjut lagi dari titik terakhir. (Demo di sini dipercepat.)",
    languageKicker: "Bahasa apa pun",
    languageTitle: "Blokir lewat menu X sendiri? Tetap masuk ke daftarmu.",
    languageBody: "Blokir seseorang dengan cara biasa, dari menu postingan, dan XBlock juga menambahkannya ke daftarmu. XBlock mengenali dialog Blokir dan Buka blokir milik X dalam bahasa apa pun, dari Inggris sampai Jepang.",
  },

  share: {
    posts: ["Siapa yang nanya? Ratio + L.", "Sebenernya nih, sebagai cowok, sini aku jelasin…", "Cuan Rp5 juta sehari dari rumah!!! 💸"],
    youBlock: "Kamu blokir mereka, sekali saja",
    yourList: "Daftar blokirmu",
    accounts: "{n} akun",
    copy: "Salin kode berbagi {code}",
    copied: "Tersalin",
    subscribers: "Pelanggan",
    people: "1.248 orang",
    gone: "**@{handle}** lenyap untuk mereka semua.",
    everyone: "Semua yang berlangganan kodemu.",
  },

  modes: {
    listName: "Bot kripto & spam",
    by: "oleh @{owner} · {size} akun",
    group: "Mode untuk daftar ini",
    autoblock: "Blokir di X",
    autoblockNote: "Diblokir di X, untuk selamanya. Mereka juga nggak bisa melihatmu.",
    automute: "Bisukan di X",
    automuteNote: "Dibisukan di X. Hilang dari linimasamu, dan mereka nggak akan pernah tahu.",
    hide: "Sembunyikan",
    hideNote: "Dilipat di browsermu. Tidak ada yang berubah di X.",
    blur: "Buramkan",
    blurNote: "Diburamkan di browsermu, sekali klik untuk tetap membacanya.",
    blocked: "Diblokir",
    muted: "Dibisukan",
    inBrowser: "Di browsermu",
    blockedIn: "diblokir di",
    show: "Tampilkan",
    posts: [
      "Utas singkat soal tools favoritku buat kerja.",
      "$MOON bentar lagi 100x 🚀 DM aku buat presale.",
      "Makasih semuanya atas masukannya buat proyek ini!",
    ],
  },

  batch: {
    title: "Blokir massal XBlock",
    running: "Memblokir",
    done: "Selesai",
    thisRun: "diblokir atau dibisukan sesi ini",
    ofLists: "{percent}% dari daftar Blokir dan Bisukan-mu",
    closing: "menutup dalam 3 dtk",
    left: "{n} tersisa",
    allHandled: "Semua akun di daftar Blokir dan Bisukan-mu sudah diproses",
    blocking: "Memblokir **@{handle}**",
    muting: "Membisukan **@{handle}**",
    followers: "{n} pengikut",
    lists: "Daftar",
    recent: "Terbaru",
    loading: "Memuat akun yang akan diblokir…",
    listA: "Reply guy dunia tech",
    listB: "Bot kripto & spam",
    modeBlock: "Blokir di X",
    modeMute: "Bisukan di X",
    blocked: "Diblokir",
    muted: "Dibisukan",
  },

  language: {
    added: "@{handle} ditambahkan ke daftar XBlock-mu",
  },

  watch: {
    label: "Tur fitur",
    count: "1 mnt 51 dtk",
    eyebrow: "Tonton",
    title: "Semua fitur, kurang dari dua menit.",
    lead: "Direkam langsung di ekstensi aslinya: popup, daftar bersama, keempat mode, blokir massal, dan mode Samurai.",
  },

  how: {
    eyebrow: "Cara kerjanya",
    title: "Siap dipakai dalam semenit",
    steps: [
      {
        label: "Langkah 1",
        title: "Pasang",
        body: "Tambahkan XBlock ke Chrome. XBlock langsung membuatkanmu kunci anonim: tanpa daftar akun, tanpa email, tanpa password X.",
      },
      {
        label: "Langkah 2",
        title: "Blokir",
        body: "Setiap postingan di x.com dapat tombol blokir. Blokir satu troll, dan dia langsung masuk ke daftarmu sendiri, siap dibagikan.",
      },
      {
        label: "Langkah 3",
        title: "Bagikan dan langganan",
        body: "Kirim kode daftarmu ke teman. Tempel kode orang lain untuk berlangganan, lalu pilih apa yang dilakukan daftar itu untukmu.",
      },
    ],
  },

  privacy: {
    eyebrow: "Privasi",
    title: "Tanpa pendaftaran, tanpa data yang bisa bocor",
    lead: "XBlock cuma perlu tahu postingan siapa yang harus ditangani, selebihnya tidak.",
    parts: [
      {
        label: "Siapa kamu",
        title: "Tanpa akun",
        body: "XBlock membuat kunci acak di browsermu. Server kami hanya menyimpan sidik jarinya, tidak pernah kuncinya.",
      },
      {
        label: "Login X-mu",
        title: "Tidak pernah keluar dari browsermu",
        body: "Blokir dan bisukan dikirim dari browsermu langsung ke X, memakai sesi yang sudah kamu punya. Kami tidak pernah melihat password atau cookie X-mu.",
      },
      {
        label: "Yang dibaca",
        title: "Handle, bukan postingan",
        body: "XBlock melihat siapa penulis setiap postingan, untuk menanganinya sesuai daftarmu. XBlock tidak mengumpulkan apa yang kamu baca, tulis, atau sukai.",
      },
      {
        label: "Bukti",
        title: "Open source",
        body: "Setiap baris kode ekstensi dan servernya ada di GitHub, dengan Lisensi MIT. Baca sendiri, atau jalankan servermu sendiri.",
      },
    ],
    flowKey: "kuncimu",
    flowId: "satu-satunya ID yang kami simpan",
    serverLabel: "Di server kami",
    serverTitle: "Daftar lengkapnya",
    stored: [
      { what: "Sidik jari kuncimu", why: "Supaya daftar dan pengaturanmu ikut ke komputer lain." },
      { what: "Daftar dan akun yang kamu izinkan", why: "Handle X, nama yang kamu berikan untuk daftarmu, dan kode berbaginya." },
      { what: "Langgananmu", why: "Daftar mana yang kamu ikuti, dan mode yang dipakai masing-masing." },
      { what: "Apa yang sudah XBlock blokir atau bisukan untukmu", why: "Supaya blokir massal tidak pernah memproses akun yang sama dua kali." },
      { what: "Jumlah pengikut publik", why: "Terlihat di linimasa, dipakai bersama oleh semua orang, untuk memblokir akun terbesar lebih dulu." },
    ],
    details: "Detailnya, dan cara meminta semua data dihapus, ada di [kebijakan privasi]({privacyHref}).",
  },

  oss: {
    label: "Open source",
    count: "Lisensi MIT",
    eyebrow: "Open source",
    title: "Baca setiap barisnya. Jalankan servermu sendiri.",
    body: "Ekstensi dan servernya ada dalam satu repositori dengan Lisensi MIT. Cek apa yang dilakukannya, kirim perbaikan, tambahkan bahasa, atau host servernya sendiri lalu build ekstensinya untuk server itu.",
    github: "Lihat di GitHub",
    selfHost: "Panduan self-hosting",
    builtWith: "Dibuat dengan",
    ownServer: "Servermu sendiri",
    commentApi: "# API-nya, dengan database di sebuah volume",
    commentExtension: "# ekstensinya, di-build untuk server itu",
  },

  faq: {
    eyebrow: "FAQ",
    title: "Pertanyaan, terjawab",
    items: [
      {
        q: "XBlock beneran gratis?",
        a: "Ya. Tanpa iklan, tanpa versi premium, tanpa data untuk dijual. XBlock open source dengan Lisensi MIT. Kalau XBlock menyelamatkan kewarasanmu, kamu bisa [traktir kami kopi]({coffee}).",
      },
      {
        q: "Perlu bikin akun?",
        a: "Tidak. Saat kamu memasang XBlock, ekstensi ini membuat kunci acak dan menyimpannya di penyimpanan sinkronisasi Chrome, jadi kunci itu ikut ke komputermu yang lain. Popup juga menampilkannya, kalau kamu mau menempelkannya sendiri di tempat lain.",
      },
      {
        q: "Apa bedanya Blokir di X, Bisukan di X, Sembunyikan, dan Buramkan?",
        a: "**Blokir di X** dan **Bisukan di X** bekerja di akun X-mu: akun yang diblokir tidak bisa mengikutimu atau melihat postinganmu, sedangkan akun yang dibisukan cuma menghilang dari linimasamu tanpa mereka tahu. **Sembunyikan** dan **Buramkan** hanya terjadi di browsermu: X tidak melihat apa-apa, dan kamu bisa mengembalikannya kapan saja. Setiap daftar yang kamu langgani punya modenya sendiri, dan tombol blokir di postingan mengikuti pengaturan di popup.",
      },
      {
        q: "Bisakah X menangguhkan akunku karena memblokir banyak akun?",
        a: "Memblokir adalah fitur biasa di X, dan XBlock memakainya persis seperti x.com, dari browsermu sendiri. Blokir massal berjalan satu akun tiap 6 sampai 10 detik dan berhenti sejenak setiap kali X minta pelan-pelan. Kami tidak bisa bicara atas nama X, tapi itulah cara paling halus untuk memblokir secara massal.",
      },
      {
        q: "X-ku pakai bahasa lain. Tetap bisa?",
        a: "Bisa. Tombol yang ditambahkan XBlock tidak bergantung pada bahasa X, dan XBlock mengenali dialog Blokir dan Buka blokir milik X dalam bahasa apa pun. Ekstensinya sendiri tersedia dalam bahasa Inggris, Prancis, Spanyol, Jerman, Jepang, Portugis, dan Indonesia, dan terjemahan baru selalu kami sambut.",
      },
      {
        q: "Bisa lihat siapa saja yang ada di sebuah daftar sebelum berlangganan?",
        a: "Bisa. Lewat popup, kamu bisa menelusuri akun-akun di sebuah daftar, lengkap dengan jumlah pengikutnya dan apakah sudah kamu blokir atau bisukan. Tombol perisai di postingan juga menjaga akun itu tetap aman, apa pun kata daftarmu.",
      },
      {
        q: "Bisa dipakai di browser apa saja?",
        a: "Chrome, dan browser yang bisa memasang ekstensi dari Chrome Web Store: Edge, Brave, Opera, Vivaldi, dan Arc. Khusus di komputer: aplikasi X di ponsel tidak mendukung ekstensi.",
      },
      {
        q: "Bagaimana cara membatalkan blokir?",
        a: "Buka blokir mereka di X seperti biasa: XBlock mendeteksi dialog Buka blokir dari X dan mengeluarkan mereka dari daftarmu. Atau tekan perisai di salah satu postingan mereka, yang mengeluarkan mereka dari daftarmu dan melindungi mereka dari semua daftar. Berhenti berlangganan membuat sebuah daftar berhenti bertindak sejak saat itu; akun yang sudah diblokirnya di X tetap terblokir sampai kamu membuka blokirnya.",
      },
    ],
  },

  cta: {
    eyebrow: "Dapatkan XBlock",
    title: "Rebut kembali ==linimasamu==.",
    body: "Gratis, tanpa akun, dan bisa dihapus sekali klik kalau kamu berubah pikiran.",
    add: "Tambahkan ke Chrome",
    star: "Kasih bintang di GitHub",
  },

  footer: {
    tagline: "Blokir troll, bot, dan spam di X cukup sekali klik, dan bagikan daftar blokirmu. Gratis dan open source.",
    product: "Produk",
    walkthrough: "Video tur fitur",
    store: "Chrome Web Store",
    openSource: "Open source",
    source: "Kode sumber",
    selfHost: "Host servernya sendiri",
    bug: "Laporkan bug",
    license: "Lisensi MIT",
    about: "Tentang",
    privacy: "Kebijakan privasi",
    contact: "Kontak",
    coffee: "Traktir kami kopi",
    madeBy: "Dibuat oleh",
    notAffiliated: "Tidak berafiliasi dengan X Corp.",
    pressD: "Tekan D untuk mode gelap",
  },

  privacyPage: {
    metaTitle: "Kebijakan privasi",
    metaDescription: "Apa saja yang disimpan ekstensi XBlock dan servernya, alasannya, dan cara meminta penghapusannya.",
    eyebrow: "Privasi",
    title: "Kebijakan privasi",
    updated: "Terakhir diperbarui {date}",
    date: "30 Oktober 2026",
    sections: [
      {
        heading: "",
        paragraphs: [
          "XBlock adalah ekstensi browser untuk X (sebelumnya Twitter) dan sebuah server kecil yang menyimpan daftar blokirmu. XBlock dibuat oleh Matrice Technologies, di Prancis, dan kodenya terbuka untuk umum di [GitHub]({github}). Halaman ini menjelaskan apa yang disimpannya, alasannya, dan cara meminta penghapusannya. Versi singkatnya: tanpa akun, tanpa email, tanpa password X, dan tidak ada apa pun tentang apa yang kamu baca.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Siapa kamu, di mata XBlock",
        paragraphs: [
          "Bukan siapa-siapa secara khusus. Saat kamu memasang ekstensi, ekstensi membuat kunci acak di browsermu dan menyimpannya di penyimpanan sinkronisasi Chrome, sehingga daftarmu ikut ke komputermu yang lain. Ekstensi mengirim kunci itu bersama setiap permintaan, dan server mengubahnya menjadi sebuah ID dengan HMAC-SHA256 satu arah. Server menyimpan ID itu, tidak pernah kuncinya. Server juga memberimu nama tampilan acak, seperti “Brave Otter”, yang ditampilkan di daftar yang kamu bagikan.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Yang disimpan server",
        paragraphs: [],
        list: [
          "**Daftarmu**: handle X yang kamu blokir dengan XBlock, nama dan kode berbagi daftar, serta catatan singkat per akun untuk daftar kurasi.",
          "**Akun yang kamu izinkan**: handle yang kamu tandai dengan perisai, supaya tidak ada daftar yang pernah memblokirnya.",
          "**Langgananmu**: daftar mana yang kamu ikuti, dan mode yang dipakai masing-masing (Blokir di X, Bisukan di X, Sembunyikan, atau Buramkan).",
          "**Apa yang sudah XBlock blokir atau bisukan untukmu di X**, supaya blokir massal tidak pernah memproses akun yang sama dua kali.",
          "**Pengaturanmu** (misalnya, apakah animasi blokir aktif), kapan kamu bergabung, dan kapan terakhir kali kamu terhubung.",
          "**Jumlah pengikut publik** dari akun X yang muncul di linimasa. Data ini tidak terkait denganmu: semua orang memakainya bersama, supaya blokir massal bisa dimulai dari akun terbesar.",
        ],
        after: [
          "Daftar memang dirancang untuk publik: siapa pun yang punya kode berbagi sebuah daftar bisa melihat handle di dalamnya dan nama tampilan acak pemiliknya.",
        ],
      },
      {
        heading: "Yang tidak pernah dilihatnya",
        paragraphs: [],
        list: [
          "Password, cookie, atau sesi X-mu. Blokir dan bisukan dikirim dari browsermu langsung ke X.",
          "Alamat email, nama asli, atau nomor teleponmu. XBlock tidak pernah memintanya.",
          "Apa yang kamu baca, tulis, sukai, atau cari di X, maupun riwayat penjelajahanmu.",
          "Pesan langsungmu.",
        ],
        after: [],
      },
      {
        heading: "Yang terjadi di browsermu",
        paragraphs: [
          "Di x.com, ekstensi membaca siapa penulis setiap postingan, supaya bisa menambahkan tombolnya dan menerapkan daftarmu. Saat kamu memblokir atau membisukan, ekstensi memanggil X sendiri, memakai sesi yang sudah kamu punya, persis seperti yang dilakukan x.com. Pengaturan seperti pilihan animasimu disimpan di penyimpanan Chrome.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Berbagi dan menjual data",
        paragraphs: [
          "Kami tidak menjual atau menyewakan data apa pun, tidak menampilkan iklan, dan tidak memakai analitik atau pelacak pihak ketiga, baik di ekstensi maupun di situs web ini. Server berjalan di mesin yang kami sewa dari Hostinger; penyedia hosting itu satu-satunya pihak ketiga yang menangani data.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Log jaringan",
        paragraphs: [
          "Server memakai alamat IP-mu di memori untuk membatasi penyalahgunaan (rate limiting), dan tidak pernah menuliskannya ke database. Server XBlock sendiri tidak menulis log permintaan apa pun.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Penyimpanan dan penghapusan",
        paragraphs: [
          "Datamu disimpan selama kamu memakai XBlock. Untuk menghapusnya, kirim kuncimu (ditampilkan di popup ekstensi) ke [{email}](mailto:{email}), dan kami akan menghapus semua yang terkait dengannya: daftar, langganan, akun yang diizinkan, dan riwayat blokir. Mencopot ekstensi akan menghapus kunci dari browsermu; tanpa kunci itu, tidak ada seorang pun yang bisa mengakses data tersebut lagi.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Jalankan sendiri",
        paragraphs: [
          "Kalau kamu lebih suka menyimpan semuanya sendiri, servernya open source dan bisa berjalan di mana pun Docker bisa berjalan. [Panduan self-hosting]({selfHost}) menunjukkan cara mem-build ekstensi untuk servermu sendiri.",
        ],
        list: [],
        after: [],
      },
      {
        heading: "Perubahan dan kontak",
        paragraphs: [
          "Jika kebijakan ini berubah, versi barunya akan dipasang di halaman ini dengan tanggal baru. Pertanyaan: [{email}](mailto:{email}).",
        ],
        list: [],
        after: [],
      },
    ] as PolicySection[],
    translationNote: "Halaman ini adalah terjemahan, dan jika ada perbedaan, [versi bahasa Inggris](/en/privacy) yang menjadi acuan.",
  },

  store: {
    badge: "Gratis · Open source · Tanpa akun",
    shots: [
      {
        kicker: "Sekali klik",
        title: "Blokir troll ==sekali klik==.",
        body: "Tombol blokir di setiap postingan. Tahan, dan postingannya meledak.",
      },
      {
        kicker: "Mode Samurai",
        title: "Atau tebas ==sampai hancur==.",
        body: "Sapukan mouse menembus postingan. Berhenti, dan langsung terblokir.",
      },
      {
        kicker: "Daftar bersama",
        title: "Blokir sekali, ==semua terlindungi==.",
        body: "Bagikan daftarmu lewat kode. Semua yang berlangganan ikut aman.",
      },
      {
        kicker: "Aturanmu",
        title: "Blokir? Bisukan? ==Kamu yang pilih==.",
        body: "Tiap daftar menentukan: blokir, bisukan, sembunyikan, atau buramkan.",
      },
      {
        kicker: "Massal",
        title: "Ribuan akun, ==tanpa repot==.",
        body: "Akun terbesar duluan, dengan tempo yang bikin X tetap santai.",
      },
    ],
    promoTitle: "Blokir troll ==sekali klik==.",
    marqueeTitle: "Blokir troll ==sekali klik==.",
    marqueeBody: "Daftar blokir bersama, mode Samurai, dan blokir massal yang mengurus sisanya. Gratis dan open source.",
  },
}
