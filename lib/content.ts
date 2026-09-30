export const NAV_LINKS = [
  { label: "Ekosistem", href: "#ekosistem" },
  { label: "Prestasi", href: "#prestasi" },
  { label: "Kompetisi", href: "#kompetisi" },
  { label: "UKM", href: "#ukm" },
  { label: "Fasilitas", href: "#kemahasiswaan" },
  { label: "AIK", href: "#aik" },
  { label: "Pilar AIK", href: "#pilar-aik" },
] as const;

export const HERO = {
  eyebrow: "Biro Kemahasiswaan & AIK SiberMu",
  title: "Menjadi Perguruan Tinggi Siber Terpercaya, Terdepan, dan Terkemuka.",
  subtitle:
    "Menyediakan akses pendidikan berkualitas secara luas berdasarkan nilai-nilai Islam berkemajuan serta membina potensi mahasiswa melalui kegiatan ilmiah, minat bakat, dan UKM.",
  scrollLabel: "Gulir",
  scrollTarget: "#ekosistem",
} as const;

export type StickySplitItem = {
  title: string;
  body: string;
  meta?: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

export const KEMAHASISWAAN_INTRO = {
  eyebrow: "Kemahasiswaan & AIK",
  heading: "Wadah Kreasi, Prestasi, dan Karakter Mahasiswa Berkemajuan.",
  intro:
    "Membentuk akhlak mulia dan keunggulan mahasiswa dalam IPTEK berlandaskan nilai-nilai Islam melalui Catur Dharma Perguruan Tinggi.",
} as const;

export type PrestasiItem = {
  title: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// Capaian prestasi riil mahasiswa yang tercatat dalam dokumen laporan
export const PRESTASI: PrestasiItem[] = [
  {
    title: "Juara 1 Essay Writing Competition Adrenaline 2023 (Regional Jawa-Bali) - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 1 Essay Adrenaline 2023 FK UKWMS (1/1)",
    src: "/assets/prestasi05.jpg",
    alt: "Sertifikat Juara 1 Essay Adrenaline 2023",
  },
  {
    title: "Juara 2 MEDJONSON (Medical Djogja Scientific Competition) Tingkat Nasional 2023 - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 2 MEDJONSON 2023 FKK UMY (1/1)",
    src: "/assets/prestasi04.jpg",
    alt: "Sertifikat Juara 2 MEDJONSON 2023",
  },
  {
    title: "Juara 3 MAJESTYNAS (Muhammadiyah Jakarta Scientific Competition Nasional) 2023 - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 3 MAJESTYNAS 2023 FKK UMJ (1/1)",
    src: "/assets/prestasi03.jpg",
    alt: "Sertifikat Juara 3 MAJESTYNAS 2023",
  },
  {
    title: "Juara 1 Essay Competition Tingkat Nasional 2023 - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 1 Essay Competition 2023 FEB UWKS (1/1)",
    src: "/assets/prestasi02.jpg",
    alt: "Sertifikat Juara 1 Essay Competition 2023",
  },
  {
    title: "Juara 2 GEBYAR EKONOMI BEM FEB Tingkat Nasional 2023 - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 2 GEBYAR EKONOMI BEM FEB UNISNU (1/1)",
    src: "/assets/prestasi01.jpg",
    alt: "Sertifikat Juara 2 GEBYAR EKONOMI BEM FEB UNISNU 2023",
  },
];

export type KompetisiItem = {
  title: string;
  body: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// Ajang kompetisi resmi yang diikuti mahasiswa SiberMu (Puspresnas / PTMA)
export const KOMPETISI: KompetisiItem[] = [
  {
    title: "PIMNAS & PKM",
    body: "Pekan Ilmiah Mahasiswa Nasional dan Program Kreativitas Mahasiswa — ajang penalaran ilmiah tertinggi bagi mahasiswa se-Indonesia. Mahasiswa SiberMu berkompetisi melalui karya tulis, penelitian, dan inovasi yang berdampak bagi masyarakat.",
    mediaLabel: "Slot logo PIMNAS & PKM (1/1)",
    src: "/logo/PIMNAS.jpg",
  },
  {
    title: "GEMASTIK",
    body: "Pagelaran Mahasiswa Nasional Bidang Teknologi Informasi dan Komunikasi yang diselenggarakan Kemendikbudristek. Mencakup kategori pemrograman, keamanan siber, data mining, hingga pengembangan aplikasi inovatif.",
    mediaLabel: "Slot logo GEMASTIK (1/1)",
    src: "/logo/GEMASTIK.png",
  },
  {
    title: "LIDM",
    body: "Lomba Inovasi Digital Mahasiswa yang mendorong terciptanya solusi teknologi untuk dunia pendidikan. Mahasiswa mengembangkan prototipe digital mulai dari aplikasi pembelajaran hingga platform edukasi berbasis AI.",
    mediaLabel: "Slot logo LIDM (1/1)",
    src: "/logo/LIDM.webp",
  },
  {
    title: "SATRIA DATA",
    body: "Statistika Ria dan Festival Sains Data — kompetisi nasional di bidang statistika dan ilmu data. Peserta mengolah dataset nyata untuk menghasilkan insight dan solusi berbasis data yang aplikatif.",
    mediaLabel: "Slot logo SATRIA DATA (1/1)",
    src: "/logo/SATRIA.jpeg",
  },
  {
    title: "KBMI & KBMK",
    body: "Kompetisi Bisnis Mahasiswa Indonesia serta Kompetisi Nasional Mahasiswa Bidang Ilmu Bisnis, Manajemen, dan Keuangan. Wadah bagi mahasiswa untuk mengembangkan ide bisnis inovatif dan mempresentasikan rencana usaha di tingkat nasional.",
    mediaLabel: "Slot logo KBMI & KBMK (1/1)",
    src: "/logo/KBMK.webp",
  },
  {
    title: "MAWAPRES & KDMI",
    body: "Pemilihan Mahasiswa Berprestasi dan Kompetisi Debat Mahasiswa Indonesia. Mengasah kemampuan berpikir kritis, public speaking, dan argumentasi dalam isu-isu strategis nasional maupun global.",
    mediaLabel: "Slot logo MAWAPRES & KDMI (1/1)",
    src: "/logo/KDMI.webp",
  },
  {
    title: "Ajang PUSPRESMA PTMA",
    body: "Berbagai kompetisi ilmiah yang diselenggarakan oleh Pusat Prestasi Perguruan Tinggi Muhammadiyah dan 'Aisyiyah. Ajang ini menjadi wadah unjuk prestasi mahasiswa di lingkungan PTMA se-Indonesia dalam bidang akademik dan non-akademik.",
    mediaLabel: "Slot logo Ajang PUSPRESMA PTMA (1/1)",
    src: "/logo/PTMA.jpeg",
  },
  {
    title: "MTQMN",
    body: "Musabaqah Tilawatil Qur’an Mahasiswa Nasional — ajang syiar keislaman dan pemuliaan kitab suci Al-Qur’an di tingkat perguruan tinggi se-Indonesia. Mahasiswa mengasah kemampuan dalam cabang tilawah, hifzh, hingga karya tulis ilmiah kandungan Al-Qur’an.",
    mediaLabel: "Slot logo MTQMN (1/1)",
    src: "/logo/MTQMN.jpg",
  },
  {
    title: "Pekan Seni Mahasiswa PTMA",
    body: "Ajang unjuk bakat seni antar-Perguruan Tinggi Muhammadiyah dan 'Aisyiyah. Mencakup seni tari, musik, teater, dan seni rupa sebagai ekspresi kreativitas mahasiswa yang berkarakter Islami.",
    mediaLabel: "Slot logo Pekan Seni Mahasiswa PTMA (1/1)",
    src: "/logo/PekanSeniPTMA.jpeg",
  },
  {
    title: "Global Youth Action",
    body: "Ajang dan program kepemudaan tingkat internasional yang mempertemukan mahasiswa dari berbagai negara. Mahasiswa SiberMu berkolaborasi dalam proyek sosial lintas budaya dan kepemimpinan global.",
    mediaLabel: "Slot logo Global Youth Action (1/1)",
    src: "/logo/GlobalYouthAction.png",
  },
  {
    title: "Youth Innovation Forum",
    body: "Forum inovasi pemuda di tingkat internasional yang mendorong pertukaran ide kreatif dan solusi global. Mahasiswa mempresentasikan proyek inovatif di hadapan delegasi dari berbagai universitas dunia.",
    mediaLabel: "Slot logo Youth Innovation Forum (1/1)",
    src: "/logo/GlobalYouthInnovationForum.png",
  },
  {
    title: "Student Exchange & Student Mobility",
    body: "Program pertukaran dan mobilitas mahasiswa tingkat internasional untuk memperluas wawasan akademik lintas negara. Mahasiswa mendapat pengalaman belajar di kampus mitra luar negeri dan membangun jejaring global.",
    mediaLabel: "Slot logo Student Exchange & Student Mobility (1/1)",
    src: "/logo/StudentExchange.jpeg",
  }
];

export type KegiatanInternasionalItem = {
  mediaLabel: string;
  src?: string;
  alt?: string;
};

export const FASILITAS_MAHASISWA: StickySplitItem[] = [
  {
    title: "Learning Management System (LMS) Handal",
    body: "Platform e-learning terpadu (solusi.sibermu.ac.id) untuk pembelajaran asinkronus, forum diskusi, modul modular, serta materi pembelajaran mandiri.",
    meta: "Akses 24/7 • solusi.sibermu.ac.id",
    src: "/assets/LMS.png",
    mediaLabel: "Slot foto layar antarmuka e-learning solusi.sibermu.ac.id (4/3)",
  },
  {
    title: "Sinkronus & Metaverse Learning SiberMu",
    body: "Perkuliahan interaktif berbasis Video Conference dan pembelajaran imersif AR/VR melalui akses kampus virtual (sibermu.ac.id/versimu).",
    meta: "Immersive Learning • sibermu.ac.id/versimu",
    src: "/assets/VR.jpg",
    mediaLabel: "Slot visual mahasiswa menggunakan headset VR dan Metaverse SiberMu (4/3)",
  },
  {
    title: "Helpdesk & Layanan Bantuan Terpadu",
    body: "Sistem Layanan Bantuan Terpadu Universitas Siber Muhammadiyah untuk penanganan tiket transparan, pengajuan surat online, tanda tangan digital, Turnitin, hingga legalisir dengan notifikasi cepat via Email dan Telegram.",
    meta: "Siap MembantuMu • helpdesk.sibermu.ac.id",
    mediaLabel: "Slot antarmuka portal layanan Helpdesk SiberMu (4/3)",
    src: "/assets/Helpdesk.png",
    alt: "Portal Layanan Helpdesk SiberMu",
  },
];

export const KEGIATAN_MAHASISWA: StickySplitItem[] = [
  {
    title: "Pengenalan Kehidupan Kampus Mahasiswa Baru (PKKMB)",
    body: "Orientasi sistem PJJ, pendalaman LMS, pengenalan kurikulum prodi, serta pembinaan karakter berbasis nilai-nilai religius dan etika kampus.",
    meta: "Wajib • Mahasiswa Baru SiberMu",
    mediaLabel: "Slot media pelaksanaan orientasi PKKMB daring SiberMu (4/3)",
  },
  {
    title: "Program Merdeka Belajar Kampus Merdeka (MBKM)",
    body: "Fasilitasi pertukaran mahasiswa, magang bersertifikat, studi independen, program kewirausahaan, hingga proyek kemanusiaan di luar kampus.",
    meta: "Program MBKM SiberMu",
    mediaLabel: "Slot dokumentasi kegiatan MBKM mahasiswa SiberMu (4/3)",
  },
  {
    title: "Kegiatan Minat Bakat & MTQMN",
    body: "Penyaluran minat dan bakat religius melalui Musabaqah Tilawatil Qur’an Mahasiswa Nasional serta Pekan Seni Mahasiswa PTMA.",
    meta: "Minat Bakat • Nasional & PTMA",
    mediaLabel: "Slot dokumentasi kegiatan minat bakat mahasiswa (4/3)",
  },
];

export type UkmItem = {
  name: string;
  description: string;
  pembina: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// Daftar resmi Unit Kegiatan Mahasiswa (UKM) beserta nama pembina resmi berdasarkan SK Pengesahan SiberMu
export const UKM_LIST: UkmItem[] = [
  {
    name: "UKM English Club",
    description:
      "Wadah bagi mahasiswa dalam menyalurkan minat, bakat, serta pengetahuan di bidang Bahasa Inggris, terutama untuk meningkatkan keterampilan berbicara di depan umum (public speaking).",
    pembina: "Afriansyah Tanjung, S.H., M.Kn. & Muhammad Fauzan Gustafi, M.Kom.",
    mediaLabel: "Slot logo dan dokumentasi kegiatan UKM English Club SiberMu",
    src: "/assets/ukm04.jpg",
    alt: "Kegiatan UKM English Club SiberMu",
  },
  {
    name: "UKM Bisnis Digital",
    description:
      "Wadah pengembangan potensi kewirausahaan digital melalui program kerja pelatihan bisnis digital, workshop e-commerce, kompetisi bisnis, dan pelatihan keuangan bisnis.",
    pembina: "Rakhmat Prasetyo Agung Nugroho, M.Kom. & Amalina Nur Arifah, S.E., M.Sc.",
    mediaLabel: "Slot dokumentasi kegiatan UKM Bisnis Digital SiberMu",
    src: "/assets/ukm03.jpg",
    alt: "Kegiatan UKM Bisnis Digital SiberMu",
  },
  {
    name: "UKM Digital Creator",
    description:
      "Wadah kreativitas mahasiswa dalam bidang desain grafis, teknologi imersif, dan pembuatan konten kreatif digital.",
    pembina: "Khairina Eka Setyaputri, S.T., M.Kom. & Desy Eliana, S.KM., M.PH.",
    mediaLabel: "Slot dokumentasi karya dan kegiatan UKM Digital Creator SiberMu",
    src: "/assets/ukm02.jpg",
    alt: "Kegiatan UKM Digital Creator SiberMu",
  },
  {
    name: "UKM Coding",
    description:
      "Wadah pengembangan minat dan bakat mahasiswa dalam bidang pemrograman, pengembangan perangkat lunak, dan eksplorasi teknologi komputasi.",
    pembina: "",
    mediaLabel: "Slot dokumentasi karya dan kegiatan UKM Coding SiberMu",
    src: "/assets/ukm01.jpg",
    alt: "Kegiatan UKM Coding SiberMu",
  },
];

// ─── Section AIK (Al-Islam & Kemuhammadiyahan) ──────────────────────────────

export const AIK_HERO = {
  badge: "Al-Islam & Kemuhammadiyahan",
  heading: "AIK SiberMu",
  intro:
    "AIK adalah ajaran Islam sebagaimana dipahami oleh Muhammadiyah yang menjadi sumber nilai dan kerangka rujukan perilaku bagi sivitas akademika dalam seluruh aktivitas Catur Dharma perguruan tinggi.",
  imageSrc: "/assets/HeroAIK.png",
  imageAlt: "Gedung Universitas Siber Muhammadiyah",
} as const;

export type SubAikItem = {
  title: string;
  points: string[];
};

export const SUB_AIK_ITEMS: SubAikItem[] = [
  {
    title: "Al-Islam",
    points: [
      "Aqidah (keimanan dan tauhid)",
      "Ibadah",
      "Akhlak",
      "Muamalah (hubungan sosial dan kehidupan bermasyarakat)",
    ],
  },
  {
    title: "Kemuhammadiyahan",
    points: [
      "Sejarah berdirinya Muhammadiyah",
      "Ideologi dan cita-cita Muhammadiyah",
      "Gerakan dakwah dan tajdid (pembaruan)",
      "Peran Muhammadiyah dalam pendidikan, kesehatan, sosial, dan kemanusiaan",
    ],
  },
];

export type PillarAikItem = {
  title: string;
  body: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

export const PILLAR_AIK_ITEMS: PillarAikItem[] = [
  {
    title: "Muhammadiyah sebagai Gerakan Islam",
    body: "Muhammadiyah berlandaskan ajaran Islam, dengan seluruh aktivitasnya merujuk pada Al-Qur’an dan As-Sunah. Tujuannya adalah mewujudkan kehidupan Islam yang sebenar-benarnya melalui berbagai bidang kehidupan.",
    mediaLabel: "Slot foto Muhammadiyah sebagai Gerakan Islam (9/16)",
    src: "/assets/Pilar1.webp",
    alt: "Muhammadiyah sebagai Gerakan Islam",
  },
  {
    title: "Muhammadiyah sebagai Gerakan Dakwah Amar Ma’ruf Nahi Munkar",
    body: "Pilar ini menegaskan peran Muhammadiyah dalam mengajak kepada kebaikan dan mencegah kemungkaran.",
    mediaLabel: "Slot foto Gerakan Dakwah Amar Ma’ruf Nahi Munkar (9/16)",
    src: "/assets/Pilar2.jpeg",
    alt: "Gerakan Dakwah Amar Ma’ruf Nahi Munkar",
  },
  {
    title: "Muhammadiyah sebagai Gerakan Tajdid (Pembaruan)",
    body: "Tajdid berarti pembaruan. Menurut Abdul Mu’ti, pembaruan Muhammadiyah mencakup:\nPembaruan pemikiran → mengembangkan gagasan Islam yang responsif terhadap zaman\nPembaruan dalam beragama → memahami dan mengamalkan ajaran Islam secara kontekstual\nPembaruan dalam bergerak → membuat inovasi organisasi dan pelayanan masyarakat",
    mediaLabel: "Slot foto Gerakan Tajdid Pembaruan Muhammadiyah (9/16)",
    src: "/assets/Pilar3.jpg",
    alt: "Muhammadiyah sebagai Gerakan Tajdid",
  },
];
