export interface CreditItem {
  name: string;
  source: string;
  url?: string;
}

export interface CreditCategory {
  name: string;
  items: CreditItem[];
}

export interface CreditsData {
  title: string;
  description: string;
  updatedAt?: string;
  categories: CreditCategory[];
}

export const CREDITS_ENDPOINT = "https://data.achmad128.my.id";

export const FALLBACK_CREDITS: CreditsData = {
  title: "Kredit & Atribusi Aset",
  description:
    "Daftar sumber dokumentasi, foto, logo kompetisi, dan referensi aset visual yang digunakan pada Landing Page Kemahasiswaan & AIK SiberMu.",
  updatedAt: "2026-09-30",
  categories: [
    {
      name: "Identitas & Branding",
      items: [
        {
          name: "Logo Resmi SiberMu & Splash Logo",
          source: "Universitas Siber Muhammadiyah",
          url: "https://sibermu.ac.id",
        },
      ],
    },
    {
      name: "Foto Fasilitas & Ekosistem",
      items: [
        {
          name: "Gedung & AIK SiberMu (Hero AIK & Dome)",
          source: "Biro AIK & Dokumentasi Resmi SiberMu",
          url: "https://sibermu.ac.id",
        },
        {
          name: "Learning Management System (LMS)",
          source: "Portal E-learning SiberMu (solusi.sibermu.ac.id)",
          url: "https://solusi.sibermu.ac.id",
        },
        {
          name: "Pembelajaran Metaverse & Imersif VR",
          source: "Dokumentasi Kampus Virtual SiberMu (VersiMu)",
          url: "https://sibermu.ac.id/versimu",
        },
        {
          name: "Helpdesk & Sistem Layanan Terpadu",
          source: "Portal Helpdesk SiberMu",
          url: "https://helpdesk.sibermu.ac.id",
        },
      ],
    },
    {
      name: "Dokumentasi Prestasi Mahasiswa",
      items: [
        {
          name: "Sertifikat Prestasi Nasional Mahasiswa (Rahmat Simbolon)",
          source: "Laporan Capaian Prestasi Biro Kemahasiswaan SiberMu",
          url: "https://sibermu.ac.id",
        },
      ],
    },
    {
      name: "Logo Ajang Kompetisi",
      items: [
        {
          name: "PIMNAS & PKM, GEMASTIK, LIDM, SATRIA DATA, KBMK, KDMI",
          source: "Pusat Prestasi Nasional (Puspresnas) Kemendikbudristek",
          url: "https://pusatprestasinasional.kemdikbud.go.id",
        },
        {
          name: "Ajang PUSPRESMA PTMA & Pekan Seni PTMA",
          source: "Puspresma Perguruan Tinggi Muhammadiyah 'Aisyiyah",
          url: "https://ptma.or.id",
        },
        {
          name: "MTQ Mahasiswa Nasional (MTQMN)",
          source: "Sekretariat MTQMN Kemendikbudristek",
          url: "https://pusatprestasinasional.kemdikbud.go.id",
        },
        {
          name: "Global Youth Action & Youth Innovation Forum",
          source: "Official Youth Action Network & Exchange Partners",
          url: "https://globalyouthaction.com",
        },
      ],
    },
    {
      name: "Unit Kegiatan Mahasiswa (UKM)",
      items: [
        {
          name: "Dokumentasi UKM Coding, Digital Creator, Bisnis Digital, English Club",
          source: "SK Pembina & Dokumentasi Resmi UKM SiberMu",
          url: "https://sibermu.ac.id",
        },
      ],
    },
    {
      name: "Pilar Al-Islam & Kemuhammadiyahan (AIK)",
      items: [
        {
          name: "Dokumentasi & Nilai Gerakan Dakwah, Tajdid, dan Keislaman",
          source: "Majelis Diktilitbang PP Muhammadiyah & Biro AIK SiberMu",
          url: "https://muhammadiyah.or.id",
        },
      ],
    },
  ],
};
