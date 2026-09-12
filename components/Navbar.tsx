"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import { HERO_VIDEO_ENDED_EVENT, HERO_VIDEO_RESET_EVENT } from "@/lib/media";
import { SITE } from "@/lib/site";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let videoDone = false;
    const heroEl = document.getElementById("beranda");

    const pastHero = () => {
      const y = window.scrollY;
      if (!heroEl) return y > window.innerHeight * 0.85;
      return (
        y >= heroEl.offsetTop + heroEl.offsetHeight - window.innerHeight - 1
      );
    };

    const onScroll = () => {
      setSolid(videoDone || pastHero());
    };

    const onVideoEnded = () => {
      videoDone = true;
      onScroll();
    };
    const onVideoReset = () => {
      videoDone = false;
      onScroll();
    };
    window.addEventListener(HERO_VIDEO_ENDED_EVENT, onVideoEnded);
    window.addEventListener(HERO_VIDEO_RESET_EVENT, onVideoReset);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener(HERO_VIDEO_ENDED_EVENT, onVideoEnded);
      window.removeEventListener(HERO_VIDEO_RESET_EVENT, onVideoReset);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const textColor = solid ? "text-primary" : "text-white";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav
          aria-label="Navigasi utama"
          className={`relative mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 transition-[max-width,border-radius,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[72px] sm:px-7 ${
            solid
              ? "max-w-5xl rounded-full bg-white/95 shadow-[0_12px_32px_rgba(16,24,40,0.12)] backdrop-blur"
              : "max-w-full rounded-none bg-transparent shadow-none"
          }`}
        >
          <a
            href="#beranda"
            className={`font-display text-2xl font-semibold lowercase tracking-tight transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${textColor}`}
            aria-label="SiberMu — kembali ke beranda"
          >
            sibermu<span className="text-brand-500">.</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`font-sans text-[0.9375rem] font-semibold transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-brand-500 ${textColor}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={SITE.ctaHref}
              className={`hidden rounded-full px-6 py-2.5 font-sans text-[0.9375rem] font-semibold transition-[background-color,border-color,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:inline-flex ${
                solid
                  ? "bg-primary text-white hover:bg-secondary"
                  : "border border-white/50 text-white hover:border-white hover:bg-white/10"
              }`}
            >
              {SITE.ctaLabel}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={open}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${textColor}`}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

        </nav>
      </header>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-[60] flex flex-col bg-primary px-6 py-5"
        >
          <div className="flex h-16 items-center justify-between">
            <span className="font-display text-2xl font-semibold lowercase text-white">
              sibermu<span className="text-brand-500">.</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu navigasi"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <ul className="flex flex-1 flex-col justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-4xl font-semibold text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={SITE.ctaHref}
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-sans text-base font-semibold text-primary"
          >
            {SITE.ctaLabel}
          </a>
        </div>
      )}
    </>
  );
}
