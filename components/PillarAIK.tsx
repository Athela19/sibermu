"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MediaSlot from "./MediaSlot";
import { PILLAR_AIK_ITEMS, type PillarAikItem } from "@/lib/content";

type PillarAIKProps = {
  items?: PillarAikItem[];
};

/**
 * PillarAIK — Three vertical pillar strips that expand on scroll.
 *
 * Layout:  Left side: 3 narrow vertical pillars side by side.
 *          Right side: Heading + intro text.
 *
 * On scroll, each pillar sequentially expands from ~25% to ~70% width,
 * revealing its full image and a text overlay with title + description.
 */
export default function PillarAIK({ items = PILLAR_AIK_ITEMS }: PillarAIKProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overlaysRef = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [reduced, setReduced] = useState(false);

  // Check for reduced motion after mount (SSR safe)
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReduced(true);
    }
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el || items.length === 0 || reduced) return;

    const ctx = gsap.context(() => {
      // Set initial states: overlays hidden
      overlaysRef.current.forEach((overlay) => {
        if (overlay) gsap.set(overlay, { autoAlpha: 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${items.length * window.innerHeight * 1.2}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          snap: {
            snapTo: 1 / items.length,
            duration: { min: 0.15, max: 0.3 },
            delay: 0.2,
            ease: "power2.out",
          },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              items.length - 1,
              Math.floor(self.progress * items.length),
            );
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      const segDuration = 1 / items.length;

      items.forEach((_, i) => {
        const pillar = pillarsRef.current[i];
        const overlay = overlaysRef.current[i];
        const segStart = i * segDuration;

        if (!pillar) return;

        // Expand pillar
        tl.to(
          pillar,
          {
            flex: "2.8 1 0%",
            duration: segDuration * 0.6,
            ease: "power2.inOut",
          },
          segStart,
        );

        // Show overlay text
        if (overlay) {
          tl.to(
            overlay,
            {
              autoAlpha: 1,
              duration: segDuration * 0.3,
              ease: "power2.out",
            },
            segStart + segDuration * 0.2,
          );
        }



        // Collapse previous pillar & hide its overlay
        if (i > 0) {
          const prevPillar = pillarsRef.current[i - 1];
          const prevOverlay = overlaysRef.current[i - 1];
          if (prevPillar) {
            tl.to(
              prevPillar,
              {
                flex: "1 1 0%",
                duration: segDuration * 0.5,
                ease: "power2.inOut",
              },
              segStart,
            );
          }
          if (prevOverlay) {
            tl.to(
              prevOverlay,
              {
                autoAlpha: 0,
                duration: segDuration * 0.25,
                ease: "power2.in",
              },
              segStart,
            );
          }
        }
      });
    }, el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [items, reduced]);

  const goTo = (index: number) => {
    const targetIdx = Math.max(0, Math.min(index, items.length - 1));
    setActive(targetIdx);

    const triggers = ScrollTrigger.getAll().filter(
      (t) => t.trigger === sectionRef.current,
    );
    const st = triggers[0];
    if (st) {
      const segProgress = (targetIdx + 0.5) / items.length;
      const targetScroll = st.start + segProgress * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  if (items.length === 0) return null;

  if (reduced) {
    return (
      <section
        id="pilar-aik"
        aria-labelledby="pilar-aik-heading"
        className="w-full bg-paper px-6 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-tertiary">
            Pilar AIK
          </p>
          <h2
            id="pilar-aik-heading"
            className="mt-3 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
          >
            Tiga Pilar Pembinaan
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-[1.05rem] leading-7 text-ink-500">
            Pilar-pilar AIK SiberMu melandasi seluruh program pembinaan
            keislaman, kaderisasi, dan pengabdian masyarakat.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <MediaSlot
                  label={item.mediaLabel}
                  ratio="9 / 16"
                  src={item.src}
                  alt={item.alt ?? item.title}
                  className="rounded-[20px]"
                />
                <h3 className="font-display text-lg font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-ink-500">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="pilar-aik"
      aria-labelledby="pilar-aik-heading"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative h-[100svh] w-full overflow-hidden bg-paper outline-none"
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-stretch gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8 lg:gap-5 lg:px-8 lg:py-10">
        {/* Pillars container */}
        <div className="flex min-w-0 flex-1 gap-3 sm:gap-4 lg:gap-5">
          {items.map((item, i) => {
            const isActive = i === active;
            return (
              <div
                key={item.title}
                ref={(el) => {
                  pillarsRef.current[i] = el;
                }}
                onClick={() => goTo(i)}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={`Pilar AIK: ${item.title}`}
                className="relative flex-1 cursor-pointer overflow-hidden rounded-[20px] transition-shadow duration-500"
                style={{
                  boxShadow: isActive
                    ? "0 20px 60px rgba(8,109,70,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <MediaSlot
                  label={item.mediaLabel}
                  ratio="auto"
                  src={item.src}
                  alt={item.alt ?? item.title}
                  className="h-full rounded-[20px]"
                />

                {/* Overlay text on expanded pillar */}
                <div
                  ref={(el) => {
                    overlaysRef.current[i] = el;
                  }}
                  className="invisible absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-primary/90 via-primary/60 to-transparent p-5 sm:p-6 lg:p-8"
                >
                  <h3 className="font-display text-lg font-semibold text-white sm:text-xl lg:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line font-sans text-sm leading-relaxed text-white/85 sm:text-base">
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Intro text (right side, fades out on first expand) */}
        <div
          ref={introRef}
          className="hidden w-[280px] shrink-0 flex-col justify-center will-change-transform lg:flex xl:w-[340px]"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-tertiary">
            Pilar AIK
          </p>
          <h2
            id="pilar-aik-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.12] text-primary"
          >
            Tiga Pilar Pembinaan
          </h2>
          <p className="mt-4 font-sans text-[0.95rem] leading-7 text-ink-500">
            Pilar-pilar AIK SiberMu melandasi seluruh program pembinaan
            keislaman, kaderisasi, dan pengabdian masyarakat.
          </p>

          {/* Step indicators */}
          <div
            className="mt-8 flex items-center gap-2"
            role="tablist"
            aria-label="Pilih pilar AIK"
          >
            {items.map((item, idx) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={idx === active}
                aria-label={`Pilih pilar: ${item.title}`}
                onClick={() => goTo(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === active
                    ? "w-7 bg-tertiary"
                    : "w-2 bg-tertiary/30 hover:bg-tertiary/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Heading for small screens (sr-only since pillars are visual) */}
      <h2 id="pilar-aik-heading" className="sr-only lg:not-sr-only">
        Tiga Pilar Pembinaan
      </h2>
    </section>
  );
}
