export const NAV_LINKS = [
  { label: "Kemahasiswaan", href: "#kemahasiswaan" },
  { label: "AIK", href: "#aik" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const HERO = {
  eyebrow: "Lomba Landing Page SiberMu 2026",
  title: "Aktif Berorganisasi. Tumbuh dalam Nilai Islam.",
  subtitle:
    "Satu halaman untuk mengenal organisasi, UKM, prestasi, layanan, dan kehidupan AIK di Universitas Siber Muhammadiyah.",
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
  eyebrow: "Kemahasiswaan",
  heading: "Hidup kampus yang aktif, terarah, dan bermakna.",
  intro:
    "Dari organisasi hingga pengabdian — setiap kegiatan membentuk karakter mahasiswa SiberMu.",
} as const;

export type PrestasiItem = {
  title: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// 8 slot foto prestasi — foto final dari pemilik proyek (belum ada).
// Judul "Prestasi 01..08" adalah placeholder jujur, bukan data ilustratif.
export const PRESTASI: PrestasiItem[] = [
  { title: "Prestasi 01", mediaLabel: "Slot foto prestasi 01 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 02", mediaLabel: "Slot foto prestasi 02 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 03", mediaLabel: "Slot foto prestasi 03 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 04", mediaLabel: "Slot foto prestasi 04 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 05", mediaLabel: "Slot foto prestasi 05 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 06", mediaLabel: "Slot foto prestasi 06 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 07", mediaLabel: "Slot foto prestasi 07 — dari pemilik proyek (4/3)" },
  { title: "Prestasi 08", mediaLabel: "Slot foto prestasi 08 — dari pemilik proyek (4/3)" },
];

export type KompetisiItem = {
  title: string;
  body: string;
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// 5 slot logo + deskripsi kompetisi — logo final dari pemilik proyek (belum ada).
// Judul "Kompetisi 01..05" dan body lorem ipsum adalah placeholder jujur, bukan data final.
export const KOMPETISI: KompetisiItem[] = [
  {
    title: "Kompetisi 01",
    body: "Deskripsi kompetisi 1 adalah lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    mediaLabel: "Slot logo kompetisi 01 — dari pemilik proyek (1/1)",
  },
  {
    title: "Kompetisi 02",
    body: "Deskripsi kompetisi 2 adalah lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    mediaLabel: "Slot logo kompetisi 02 — dari pemilik proyek (1/1)",
  },
  {
    title: "Kompetisi 03",
    body: "Deskripsi kompetisi 3 adalah lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    mediaLabel: "Slot logo kompetisi 03 — dari pemilik proyek (1/1)",
  },
  {
    title: "Kompetisi 04",
    body: "Deskripsi kompetisi 4 adalah lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    mediaLabel: "Slot logo kompetisi 04 — dari pemilik proyek (1/1)",
  },
  {
    title: "Kompetisi 05",
    body: "Deskripsi kompetisi 5 adalah lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    mediaLabel: "Slot logo kompetisi 05 — dari pemilik proyek (1/1)",
  },
];

export type KegiatanInternasionalItem = {
  mediaLabel: string;
  src?: string;
  alt?: string;
};

// Slot foto kegiatan internasional — foto final dari pemilik proyek (belum ada).
export const KEGIATAN_INTERNASIONAL: KegiatanInternasionalItem[] = [
  { mediaLabel: "Slot foto kegiatan internasional 01 — dari pemilik proyek", alt: "Kegiatan internasional 01" },
  { mediaLabel: "Slot foto kegiatan internasional 02 — dari pemilik proyek", alt: "Kegiatan internasional 02" },
  { mediaLabel: "Slot foto kegiatan internasional 03 — dari pemilik proyek", alt: "Kegiatan internasional 03" },
  { mediaLabel: "Slot foto kegiatan internasional 04 — dari pemilik proyek", alt: "Kegiatan internasional 04" },
];

export const KEGIATAN_MAHASISWA: StickySplitItem[] = [
  {
    title: "Orientasi & Pembinaan Karakter",
    body: "Masa pengenalan kampus yang membangun kedisiplinan, ukhuwah, dan kesiapan belajar daring sejak hari pertama.",
    meta: "Wajib • Mahasiswa baru",
    mediaLabel: "Slot media kegiatan — orientasi & pembinaan (4/3)",
  },
  {
    title: "Organisasi & Kepemimpinan",
    body: "BEM dan ormawa melatih mahasiswa memimpin rapat, mengelola program, dan mengambil keputusan bersama.",
    meta: "BEM • Ormawa",
    mediaLabel: "Slot media kegiatan — organisasi mahasiswa (4/3)",
  },
  {
    title: "UKM & Komunitas Minat Bakat",
    body: "Wadah minat, bakat, dan keilmuan — dari teknologi dan seni hingga olahraga dan kewirausahaan kampus.",
    meta: "4–6 UKM • Terbuka semua prodi",
    mediaLabel: "Slot media kegiatan — UKM & komunitas (4/3)",
  },
  {
    title: "Prestasi & Pengabdian",
    body: "Prestasi akademik dan non-akademik yang didampingi, lalu disalurkan kembali lewat pengabdian masyarakat.",
    meta: "Akademik • Non-akademik",
    mediaLabel: "Slot media kegiatan — prestasi & pengabdian (4/3)",
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

// Daftar Unit Kegiatan Mahasiswa (UKM)
// Foto final dari pemilik proyek (belum ada — menggunakan MediaSlot).
export const UKM_LIST: UkmItem[] = [
  {
    name: "English Club",
    description:
      "Wadah pengembangan kecakapan komunikasi bahasa Inggris, public speaking, debat, dan jejaring internasional bagi mahasiswa Universitas Siber Muhammadiyah.",
    pembina: "Bapak Anas Polri S. I",
    mediaLabel: "Slot foto UKM English Club — dari pemilik proyek (16/10)",
    alt: "Kegiatan diskusi UKM English Club",
  },
  {
    name: "SiberMu Tech Club",
    description:
      "Komunitas eksplorasi teknologi informasi, pemrograman, kecerdasan buatan, keamanan siber, dan rekayasa perangkat lunak untuk inovasi digital kampus.",
    pembina: "Bapak Dr. Ir. Wahyudi, M.T.",
    mediaLabel: "Slot foto UKM SiberMu Tech Club — dari pemilik proyek (16/10)",
    alt: "Kegiatan coding dan workshop SiberMu Tech Club",
  },
  {
    name: "Kewirausahaan Mahasiswa",
    description:
      "Inkubator bisnis dan wirausaha muda mahasiswa berbasis digital, melatih keterampilan pitching, model bisnis modern, permodalan, hingga validasi pasar riil.",
    pembina: "Ibu Nurul Aini, S.E., M.M.",
    mediaLabel: "Slot foto UKM Kewirausahaan Mahasiswa — dari pemilik proyek (16/10)",
    alt: "Program inkubasi dan pitching UKM Kewirausahaan Mahasiswa",
  },
  {
    name: "Seni & Media Kreatif",
    description:
      "Wadah ekspresi kreativitas visual, produksi konten multimedia, sinematografi, fotografi, desain grafis, dan syiar karya kreatif digital mahasiswa SiberMu.",
    pembina: "Bapak Fajar Nugroho, M.Sn.",
    mediaLabel: "Slot foto UKM Seni & Media Kreatif — dari pemilik proyek (16/10)",
    alt: "Pameran karya dan produksi UKM Seni & Media Kreatif",
  },
  {
    name: "Olahraga & E-Sport",
    description:
      "Pengembangan kebugaran jasmani, strategi, dan sportivitas mahasiswa melalui cabang olahraga fisik serta divisi kompetisi taktis digital tingkat nasional.",
    pembina: "Bapak Rahmat Hidayat, M.Or.",
    mediaLabel: "Slot foto UKM Olahraga & E-Sport — dari pemilik proyek (16/10)",
    alt: "Latihan dan turnamen UKM Olahraga & E-Sport",
  },
];

