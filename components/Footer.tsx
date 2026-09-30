import Image from "next/image";
import CreditsModal from "./CreditsModal";
import { SITE } from "@/lib/site";

/**
 * Footer — Full-screen navy footer with SiberMu branding.
 *
 * Layout reference: centered logo + large CTA heading + institution info,
 * bottom bar with copyright left and credits right.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="kontak"
      aria-label="Kontak dan informasi institusi"
      className="relative flex min-h-[100svh] flex-col bg-primary px-6 sm:px-8"
    >
      {/* Main content — centered vertically */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center sm:gap-10 lg:gap-12">
        {/* Logo */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14">
          <Image
            src={SITE.splashLogo}
            alt={`Logo ${SITE.name}`}
            fill
            sizes="56px"
            className="object-contain brightness-0 invert"
          />
        </div>

        {/* CTA Heading */}
        <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[0.95] tracking-tight text-white">
          Gabung Bersama
          <br />
          Kami.
        </h2>

        {/* Button */}
        <a
          href="https://sibermu.ac.id"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-sans text-sm font-bold uppercase tracking-[0.06em] text-primary transition-colors duration-200 hover:bg-secondary hover:text-white"
        >
          Jelajahi Pendaftaran
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 0 1 0-1.06l7.22-7.22H8.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V7.06l-7.22 7.22a.75.75 0 0 1-1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </a>

        {/* Institution info */}
        <div className="mt-4 flex flex-col items-center gap-1.5 sm:mt-6">
          <p className="font-sans text-sm font-bold leading-snug text-white/80 sm:text-base">
            {SITE.fullName}
          </p>
          <p className="font-sans text-sm leading-snug text-white/80 sm:text-base">
            Pakuncen, Wirobrajan, Kota Yogyakarta, 
          </p>
          <p className="font-sans text-sm leading-snug text-white/80 sm:text-base">
            Daerah Istimewa Yogyakarta 55253
          </p>
        </div>

        {/* Social */}
        <a
          href="https://www.instagram.com/sibermu"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 font-sans text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
          aria-label="Instagram SiberMu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          @sibermu
        </a>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left */}
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-white/50">
              {SITE.fullName}.
            </p>
            <p className="font-sans text-[11px] uppercase tracking-[0.06em] text-white/30">
              ©{year} All rights reserved
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-1.5 text-center sm:items-end sm:text-right">
            <CreditsModal />
            <p className="font-sans text-xs font-medium text-white/50">
              Achmad Fadil Nur Ramdhani
            </p>
            <p className="font-sans text-xs font-medium text-white/50">
              Muhamad Syarif Nurrohman 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
