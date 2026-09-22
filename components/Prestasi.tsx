"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import MediaSlot from "./MediaSlot";
import { PRESTASI, type PrestasiItem } from "@/lib/content";

type PrestasiCardProps = {
  item: PrestasiItem;
  active: boolean;
  dimmed: boolean;
  widthClass: string;
  onHover: () => void;
  onLeave: () => void;
  onToggle: () => void;
};

function PrestasiCard({
  item,
  active,
  dimmed,
  widthClass,
  onHover,
  onLeave,
  onToggle,
}: PrestasiCardProps) {
  return (
    <figure
      tabIndex={0}
      role="button"
      aria-pressed={active}
      aria-label={`${item.title} — tampilkan label`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`group relative shrink-0 cursor-pointer outline-none transition duration-300 ${widthClass} ${
        active ? "scale-[1.04]" : "scale-100"
      } ${dimmed ? "opacity-40" : "opacity-100"}`}
    >
      <MediaSlot
        label={item.mediaLabel}
        ratio="4 / 3"
        src={item.src}
        alt={item.alt ?? ""}
        className="rounded-[20px]"
      />
      <figcaption
        className={`pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[20px] bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-10 transition duration-300 ${
          active
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        }`}
      >
        <span className="font-sans text-sm font-bold text-white">
          {item.title}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Prestasi() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Deteksi media query wajib di effect agar SSR dan hidrasi pertama identik.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (
      reducedMotion ||
      !sectionRef.current ||
      !viewportRef.current ||
      !trackRef.current
    )
      return;

    const track = trackRef.current;
    const viewport = viewportRef.current;
    const distance = () => track.scrollWidth - viewport.clientWidth;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [reducedMotion]);

  const spotlight = hovered ?? focused;

  const renderCards = (widthClass: string) =>
    PRESTASI.map((item, pos) => (
      <PrestasiCard
        key={item.title}
        item={item}
        active={spotlight === pos}
        dimmed={spotlight !== null && spotlight !== pos}
        widthClass={widthClass}
        onHover={() => setHovered(pos)}
        onLeave={() => setHovered(null)}
        onToggle={() => setFocused((prev) => (prev === pos ? null : pos))}
      />
    ));

  if (reducedMotion) {
    return (
      <section
        id="prestasi"
        aria-labelledby="prestasi-heading"
        className="relative z-10 -mt-px flex min-h-[100svh] w-full items-center bg-primary"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-white/70">
            Prestasi
          </p>
          <h2
            id="prestasi-heading"
            className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
          >
            Prestasi mahasiswa.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {renderCards("w-full")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="prestasi"
      aria-labelledby="prestasi-heading"
      className="relative z-10 -mt-px w-full overflow-hidden bg-primary"
    >
      <div
        ref={viewportRef}
        className="flex h-[100svh] w-full items-center"
      >
        <div
          ref={trackRef}
          className="flex w-max items-center gap-5 px-[7vw] will-change-transform sm:gap-8"
        >
          <div className="w-[82vw] shrink-0 sm:w-[38vw] lg:w-[28vw]">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-white/70">
              Prestasi
            </p>
            <h2
              id="prestasi-heading"
              className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
            >
              Prestasi mahasiswa.
            </h2>
          </div>
          {renderCards("w-[74vw] sm:w-[46vw] lg:w-[30vw]")}
        </div>
      </div>
    </section>
  );
}
