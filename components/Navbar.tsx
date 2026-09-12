"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content";
import { HERO_VIDEO_ENDED_EVENT, HERO_VIDEO_RESET_EVENT } from "@/lib/media";
import { SITE } from "@/lib/site";

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const originRef = useRef({ x: 0, y: 0, radius: 0 });
  const sessionRef = useRef(0);

  const openMenu = () => {
    const rect = openBtnRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 44;
    const y = rect ? rect.top + rect.height / 2 : 52;
    originRef.current = {
      x,
      y,
      radius:
        Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        ) + 24,
    };
    sessionRef.current += 1;
    setMounted(true);
  };

  const closeMenu = useCallback(() => {
    const overlay = overlayRef.current;
    const session = sessionRef.current;
    if (
      !overlay ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMounted(false);
      openBtnRef.current?.focus();
      return;
    }
    const { x, y } = originRef.current;
    gsap.to(overlay, {
      clipPath: `circle(0px at ${x}px ${y}px)`,
      duration: 0.5,
      ease: "power3.inOut",
      overwrite: "auto",
      onComplete: () => {
        if (sessionRef.current !== session) return;
        setMounted(false);
        openBtnRef.current?.focus();
      },
    });
  }, []);

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
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, closeMenu]);

  useLayoutEffect(() => {
    if (!mounted) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    openBtnRef.current?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { x, y, radius } = originRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        overlay,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        {
          clipPath: `circle(${radius}px at ${x}px ${y}px)`,
          duration: 0.7,
          ease: "power3.inOut",
        },
      );
      tl.fromTo(
        "[data-menu-item]",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: "power3.out",
        },
        "-=0.25",
      );
    }, overlay);
    return () => {
      ctx.revert();
    };
  }, [mounted]);

  const textColor = solid ? "text-primary" : "text-white";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 px-4 pt-4 sm:px-6 ${mounted ? "z-[70]" : "z-50"}`}
      >
        <nav
          aria-label="Navigasi utama"
          className={`relative mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:h-[72px] sm:px-7 ${
            mounted
              ? "max-w-full rounded-none bg-transparent shadow-none transition-none"
              : `transition-[max-width,border-radius,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  solid
                    ? "max-w-5xl rounded-full bg-white/95 shadow-[0_12px_32px_rgba(16,24,40,0.12)] backdrop-blur"
                    : "max-w-full rounded-none bg-transparent shadow-none"
                }`
          }`}
        >
          <a
            href="#beranda"
            aria-label="SiberMu — kembali ke beranda"
            aria-hidden={mounted ? true : undefined}
            tabIndex={mounted ? -1 : undefined}
            className={`relative block h-9 w-36 shrink-0 sm:h-10 sm:w-40 ${mounted ? "invisible" : ""}`}
          >
            <Image
              src={SITE.logo}
              alt="Logo Universitas Siber Muhammadiyah"
              fill
              sizes="(max-width: 640px) 144px, 160px"
              priority
              className="object-contain object-left"
            />
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
              ref={openBtnRef}
              type="button"
              onClick={mounted ? closeMenu : openMenu}
              aria-label={mounted ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={mounted}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${mounted ? "text-white" : textColor}`}
            >
              {mounted ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </nav>
      </header>

      {mounted && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-[60] flex flex-col bg-primary px-6 py-5"
        >
          <ul className="flex flex-1 flex-col justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href} data-menu-item>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="font-display text-4xl font-semibold text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={SITE.ctaHref}
            onClick={closeMenu}
            data-menu-item
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 font-sans text-base font-semibold text-primary"
          >
            {SITE.ctaLabel}
          </a>
        </div>
      )}
    </>
  );
}
