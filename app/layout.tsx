import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Kemahasiswaan & AIK — Universitas Siber Muhammadiyah",
  description:
    "Landing page Kemahasiswaan dan Al-Islam Kemuhammadiyahan Universitas Siber Muhammadiyah: aktif berorganisasi, tumbuh dalam nilai Islam.",
  openGraph: {
    title: "Kemahasiswaan & AIK — SiberMu",
    description:
      "Aktif Berorganisasi. Tumbuh dalam Nilai Islam. Jelajahi kemahasiswaan & AIK SiberMu.",
    type: "website",
    locale: "id_ID",
  },
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
        {children}
      </body>
    </html>
  );
}
