export const NAV_LINKS = [
  { label: "Kemahasiswaan", href: "#kemahasiswaan" },
  { label: "AIK", href: "#aik" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const HERO = {
  eyebrow: "Biro Kemahasiswaan & AIK SiberMu",
  title: "Menjadi Perguruan Tinggi Siber Terpercaya, Terdepan, dan Terkemuka.",
  subtitle:
    "Menyediakan akses pendidikan berkualitas secara luas berdasarkan nilai-nilai Islam berkemajuan serta membina potensi mahasiswa melalui kegiatan ilmiah, minat bakat, dan UKM.",
  scrollLabel: "Gulir",
  scrollTarget: "#kemahasiswaan",
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
    mediaLabel: "Slot foto piagam Juara 1 Essay Adrenaline 2023 FK UKWMS (4/3)",
  },
  {
    title: "Juara 3 UI Science Olympiad Bidang Essay Ilmiah Nasional 2023 - Rahmat Simbolon (Administrasi Kesehatan)",
    mediaLabel: "Slot foto sertifikat Juara 3 UI Science Olympiad BEM FMIPA UI (4/3)",
  },
  {
    title: "18 Prestasi Mahasiswa (1 Regional, 16 Nasional, 1 Internasional) Periode 2021-2024",
    mediaLabel: "Slot grafis rekapitulasi prestasi mahasiswa SiberMu 2021-2024 (4/3)",
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
    body: "Pekan Ilmiah Mahasiswa Nasional dan Program Kreativitas Mahasiswa sebagai wadah penalaran ilmiah nasional.",
    mediaLabel: "Slot logo PIMNAS & PKM (1/1)",
  },
  {
    title: "GEMASTIK",
    body: "Pagelaran Mahasiswa Nasional Bidang Teknologi Informasi dan Komunikasi bagi talenta digital mahasiswa SiberMu.",
    mediaLabel: "Slot logo GEMASTIK (1/1)",
  },
  {
    title: "LIDM",
    body: "Lomba Inovasi Digital Mahasiswa untuk mendorong inovasi pendidikan berbasis teknologi.",
    mediaLabel: "Slot logo LIDM (1/1)",
  },
  {
    title: "KDMI & NUDC",
    body: "Kompetisi Debat Mahasiswa Indonesia dan National University Debating Championship untuk mengasah kemampuan komunikasi dan daya kritis.",
    mediaLabel: "Slot logo KDMI & NUDC (1/1)",
  },
  {
    title: "Kompetisi PUSPRESMA PTMA",
    body: "Berbagai ajang kejuaraan dan kompetisi yang diselenggarakan oleh Pusat Prestasi Perguruan Tinggi Muhammadiyah dan 'Aisyiyah.",
    mediaLabel: "Slot logo PUSPRESMA PTMA (1/1)",
  },
];

export type KegiatanInternasionalItem = {
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// Program internasional resmi mahasiswa SiberMu
export const KEGIATAN_INTERNASIONAL: KegiatanInternasionalItem[] = [
  {
    mediaLabel: "Slot dokumentasi program Global Youth Action",
    alt: "Global Youth Action SiberMu",
  },
  {
    mediaLabel: "Slot dokumentasi kegiatan Youth Innovation Forum",
    alt: "Youth Innovation Forum SiberMu",
  },
  {
    mediaLabel: "Slot dokumentasi Student Exchange & Student Mobility",
    alt: "Student Exchange dan Mobility SiberMu",
  },
];

export const FASILITAS_MAHASISWA: StickySplitItem[] = [
  {
    title: "Learning Management System (LMS) Handal",
    body: "Platform e-learning terpadu (solusi.sibermu.ac.id) untuk pembelajaran asinkronus, forum diskusi, modul modular, serta materi pembelajaran mandiri.",
    meta: "Akses 24/7 • solusi.sibermu.ac.id",
    mediaLabel: "Slot foto layar antarmuka e-learning solusi.sibermu.ac.id (4/3)",
  },
  {
    title: "Sinkronus & Metaverse Learning SiberMu",
    body: "Perkuliahan interaktif berbasis Video Conference dan pembelajaran imersif AR/VR melalui akses kampus virtual (sibermu.ac.id/versimu).",
    meta: "Immersive Learning • sibermu.ac.id/versimu",
    mediaLabel: "Slot visual mahasiswa menggunakan headset VR dan Metaverse SiberMu (4/3)",
  },
  {
    title: "Portal Akademik & Monitoring Orang Tua",
    body: "Sistem informasi student.sibermu.ac.id untuk administrasi KRS mahasiswa serta akses pemantauan perkembangan studi bagi orang tua.",
    meta: "Portal Mahasiswa & Orang Tua • student.sibermu.ac.id",
    mediaLabel: "Slot antarmuka portal student.sibermu.ac.id (4/3)",
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
    mediaLabel: "Slot logo dan dokumentasi kegiatan UKM English Club SiberMu (16/10)",
    alt: "Kegiatan UKM English Club SiberMu",
  },
  {
    name: "UKM Bisnis Digital",
    description:
      "Wadah pengembangan potensi kewirausahaan digital melalui program kerja pelatihan bisnis digital, workshop e-commerce, kompetisi bisnis, dan pelatihan keuangan bisnis.",
    pembina: "Rakhmat Prasetyo Agung Nugroho, M.Kom. & Amalina Nur Arifah, S.E., M.Sc.",
    mediaLabel: "Slot dokumentasi kegiatan UKM Bisnis Digital SiberMu (16/10)",
    alt: "Kegiatan UKM Bisnis Digital SiberMu",
  },
  {
    name: "UKM Digital Creator",
    description:
      "Wadah kreativitas mahasiswa dalam bidang desain grafis, teknologi imersif, dan pembuatan konten kreatif digital.",
    pembina: "Khairina Eka Setyaputri, S.T., M.Kom. & Desy Eliana, S.KM., M.PH.",
    mediaLabel: "Slot dokumentasi karya dan kegiatan UKM Digital Creator SiberMu (16/10)",
    alt: "Kegiatan UKM Digital Creator SiberMu",
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
  body: string;
};

export const SUB_AIK_ITEMS: SubAikItem[] = [
  {
    title: "Kerangka Rujukan & Ibadah Praktis",
    body: "AIK menjadi rujukan perilaku sehari-hari dan akademik bagi warga kampus dalam menjalankan ibadah praktis sesuai tuntunan Muhammadiyah.",
  },
  {
    title: "Internalisasi Nilai Islam Berkemajuan",
    body: "Menjadikan AIK sebagai basis nilai spiritual dan moral yang terintegrasi pada kegiatan pendidikan, penelitian, dan pengabdian kepada masyarakat.",
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
    title: "Pembelajaran Terprogram AIK",
    body: "Bahan pembelajaran yang diajarkan dan dididikkan kepada mahasiswa secara terprogram dalam kurikulum perkuliahan semester.",
    mediaLabel: "Slot foto perkuliahan daring Al-Islam dan Kemuhammadiyahan (9/16)",
    alt: "Pembelajaran AIK SiberMu",
  },
  {
    title: "Pengkajian AIK & Pengembangan Dakwah",
    body: "Kontribusi aktif sivitas akademika dalam kajian keislaman dan pengembangan dakwah berkemajuan di era siber.",
    mediaLabel: "Slot foto kegiatan kajian dakwah digital (9/16)",
    alt: "Kajian AIK dan Dakwah SiberMu",
  },
  {
    title: "Keterlibatan dalam Persyarikatan Muhammadiyah",
    body: "Mendorong partisipasi aktif sivitas akademika dalam gerakan persyarikatan untuk mewujudkan Islam sebagai rahmat bagi semesta alam.",
    mediaLabel: "Slot foto aktivitas civitas akademika dalam persyarikatan (9/16)",
    alt: "Aktivitas Persyarikatan Muhammadiyah",
  },
];
