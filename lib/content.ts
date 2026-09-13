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
