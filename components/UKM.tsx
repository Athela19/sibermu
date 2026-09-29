"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MediaSlot from "./MediaSlot";
import { UKM_LIST, type UkmItem } from "@/lib/content";

type UKMProps = {
  items?: UkmItem[];
};

export default function UKM({ items = UKM_LIST }: UKMProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el || items.length <= 1 || reducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: "ukm-pin-trigger",
        trigger: el,
        start: "top top",
        end: () => `+=${(items.length - 1) * window.innerHeight}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.min(
            items.length - 1,
            Math.floor(self.progress * items.length),
          );
          setActive((prev) => (prev === index ? prev : index));
        },
      });
    }, el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [items.length, reducedMotion]);

  if (items.length === 0) return null;

  const goTo = (index: number) => {
    const targetIdx = Math.max(0, Math.min(index, items.length - 1));
    setActive(targetIdx);

    const st = ScrollTrigger.getById("ukm-pin-trigger");
    if (st) {
      const segProgress = (targetIdx + 0.5) / items.length;
      const targetScroll = st.start + segProgress * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  if (reducedMotion) {
    return (
      <section
        id="ukm"
        aria-labelledby="ukm-heading"
        className="relative z-20 -mt-px flex min-h-[100svh] w-full flex-col justify-center bg-primary px-6 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2
              id="ukm-heading"
              className="font-sans text-[clamp(2.75rem,5.5vw,4.5rem)] font-bold tracking-tight text-white leading-none"
            >
              UKM
            </h2>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Daftar UKM">
              {items.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={idx === active}
                  onClick={() => setActive(idx)}
                  className={`rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition duration-200 ${
                    idx === active
                      ? "bg-white text-primary"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-mist/5 shadow-2xl">
                <MediaSlot
                  label={items[active].mediaLabel}
                  ratio="16 / 10"
                  src={items[active].src}
                  alt={items[active].alt ?? items[active].name}
                  objectFit="cover"
                  objectPosition="top"
                  className="h-full w-full rounded-[20px] bg-navy-950/40"
                />
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-5">
              <div>
                <h3 className="font-sans text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.25rem]">
                  {items[active].name}
                </h3>
                <p className="mt-4 font-sans text-base leading-relaxed text-white/80 sm:text-lg">
                  {items[active].description}
                </p>
              </div>

              <div className="mt-8 sm:mt-12">
                <p className="font-sans text-sm text-white/70">Pembina:</p>
                <p className="mt-1 font-sans text-base sm:text-lg font-medium text-white">
                  {items[active].pembina}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="ukm"
      aria-labelledby="ukm-heading"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative z-20 -mt-px flex h-[100svh] w-full flex-col justify-center overflow-hidden bg-primary px-6 py-6 outline-none sm:px-8 lg:px-12"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        {/* Header judul "UKM" dan indikator langkah */}
        <div className="mb-6 flex items-baseline justify-between sm:mb-8 lg:mb-10">
          <h2
            id="ukm-heading"
            className="font-sans text-[clamp(2.75rem,5.5vw,4.5rem)] font-bold tracking-tight text-white leading-none"
          >
            UKM
          </h2>

          <div className="flex items-center gap-4">
            <span className="font-sans text-sm font-semibold tracking-widest text-white/60">
              <span className="text-white">{String(active + 1).padStart(2, "0")}</span>
              <span className="mx-1">/</span>
              <span>{String(items.length).padStart(2, "0")}</span>
            </span>

            <div
              className="hidden sm:flex items-center gap-1.5"
              role="tablist"
              aria-label="Pilih UKM"
            >
              {items.map((item, idx) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={idx === active}
                  aria-label={`Pilih UKM ${item.name}`}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === active
                      ? "w-7 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2-Kolom: Kiri Foto MediaSlot, Kanan Teks Deskripsi & Pembina */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Kolom Kiri: Tumpukan Gambar (Layout tetap sama di tiap item) */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-mist/5 shadow-2xl">
              {items.map((item, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={item.name}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      isActive
                        ? "z-10 opacity-100 scale-100"
                        : "z-0 opacity-0 scale-[1.03] pointer-events-none"
                    }`}
                  >
                    <MediaSlot
                      label={item.mediaLabel}
                      ratio="16 / 10"
                      src={item.src}
                      alt={item.alt ?? item.name}
                      objectFit="cover"
                      objectPosition="top"
                      className="h-full w-full rounded-[20px] bg-navy-950/40"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Tumpukan Teks (Nama UKM, Penjelasan, Pembina) */}
          <div className="lg:col-span-6 xl:col-span-5">
            <div
              aria-live="polite"
              className="grid min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]"
            >
              {items.map((item, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={item.name}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 flex flex-col justify-between transition-all duration-500 ease-out ${
                      isActive
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <div>
                      <h3 className="font-sans text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.25rem]">
                        {item.name}
                      </h3>
                      <p className="mt-4 font-sans text-base leading-relaxed text-white/80 sm:text-lg">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8 sm:mt-12">
                      <p className="font-sans text-sm text-white/70">Pembina:</p>
                      <p className="mt-1 font-sans text-base sm:text-lg font-medium text-white">
                        {item.pembina}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
