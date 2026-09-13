import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A2A5B",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Kemahasiswaan & AIK — ${SITE.fullName} (${SITE.name})`,
    template: `%s | Kemahasiswaan & AIK ${SITE.name}`,
  },
  description:
    "Kemahasiswaan & AIK Universitas Siber Muhammadiyah (SiberMu): organisasi, UKM, prestasi, layanan, kajian, dan syiar dalam satu halaman.",
  applicationName: `Kemahasiswaan & AIK ${SITE.name}`,
  keywords: [
    "SiberMu",
    "Universitas Siber Muhammadiyah",
    "Kemahasiswaan SiberMu",
    "Al-Islam dan Kemuhammadiyahan",
    "organisasi mahasiswa",
    "unit kegiatan mahasiswa",
    "prestasi mahasiswa",
    "layanan mahasiswa",
    "kajian",
    "syiar",
  ],
  authors: [
    {
      name: `Bidang Kemahasiswaan ${SITE.fullName}`,
      url: SITE.url,
    },
  ],
  creator: `Bidang Kemahasiswaan ${SITE.fullName}`,
  publisher: SITE.fullName,
  category: "education",
  alternates: {
    canonical: SITE.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon.ico", sizes: "any" },
    ],
    apple: [
      {
        url: "/logo/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/logo/favicon.ico",
  },
  manifest: "/logo/site.webmanifest",
  openGraph: {
    title: `Kemahasiswaan & AIK — ${SITE.name}`,
    description:
      "Aktif Berorganisasi. Tumbuh dalam Nilai Islam. Jelajahi organisasi, UKM, prestasi, layanan, serta kajian & syiar AIK SiberMu.",
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: `Kemahasiswaan & AIK — ${SITE.fullName}`,
    images: [
      {
        url: SITE.ogImage,
        width: 512,
        height: 512,
        alt: SITE.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Kemahasiswaan & AIK — ${SITE.name}`,
    description:
      "Aktif Berorganisasi. Tumbuh dalam Nilai Islam. Jelajahi kemahasiswaan & AIK SiberMu.",
    images: [
      {
        url: SITE.ogImage,
        alt: SITE.ogImageAlt,
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  name: SITE.fullName,
  alternateName: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}${SITE.logo}`,
  image: `${SITE.url}${SITE.ogImage}`,
  description:
    "Kemahasiswaan & AIK Universitas Siber Muhammadiyah (SiberMu): organisasi, UKM, prestasi, layanan, kajian, dan syiar dalam satu halaman.",
  sameAs: [...SITE.sameAs],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink-900">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:font-sans focus:text-sm focus:font-semibold focus:text-white"
        >
          Lewati ke konten utama
        </a>
        {children}
        <Script
          id="json-ld-organisasi"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
