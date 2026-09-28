"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AIK_HERO, SUB_AIK_ITEMS } from "@/lib/content";

/**
 * HeroAIK — Scroll-pinned hero with zoom & pan over HeroAIK.png.
 *
 * Phases (mapped to scrub progress):
 *  0%–30%  : Image at scale 1, title "AIK" + intro text visible in white sky.
 *  30%–65% : Zoom in (scale 1→1.6), pan left → frosted card 1 appears.
 *  65%–100%: Pan right → card 1 fades, frosted card 2 appears.
 */
export default function HeroAIK() {
  const pinRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const [reduced] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const pin = pinRef.current;
    const img = imgRef.current;
    const text = textRef.current;
    const c1 = card1Ref.current;
    const c2 = card2Ref.current;
    if (!pin || !img || !text || !c1 || !c2 || reduced) return;

    // Set initial states
    gsap.set(c1, { autoAlpha: 0, y: 40 });
    gsap.set(c2, { autoAlpha: 0, y: 40 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.5}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          snap: {
            snapTo: [0, 0.50, 0.82, 1],
            duration: { min: 0.15, max: 0.3 },
            delay: 0.2,
            ease: "power2.out",
          },
          invalidateOnRefresh: true,
        },
      });

      // Phase 1 (0%–30%): Intro text fades out, image begins to zoom
      tl.to(
        text,
        { autoAlpha: 0, y: -30, duration: 0.25, ease: "power2.in" },
        0,
      );

      // Phase 2 (30%–65%): Zoom & pan left, card 1 appears
      tl.to(
        img,
        {
          scale: 1.6,
          xPercent: 15,
          duration: 0.35,
          ease: "power1.inOut",
        },
        0.25,
      );
      tl.to(
        c1,
        { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" },
        0.35,
      );
      tl.to(
        c1,
        { autoAlpha: 0, y: -20, duration: 0.1, ease: "power2.in" },
        0.55,
      );

      // Phase 3 (65%–100%): Pan right, card 2 appears
      tl.to(
        img,
        {
          xPercent: -15,
          duration: 0.35,
          ease: "power1.inOut",
        },
        0.6,
      );
      tl.to(
        c2,
        { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" },
        0.65,
      );
      tl.to(
        c2,
        { autoAlpha: 0, y: -20, duration: 0.1, ease: "power2.in" },
        0.88,
      );
    }, pin);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section
        id="hero-aik"
        aria-labelledby="hero-aik-heading"
        className="relative w-full overflow-hidden bg-paper"
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={AIK_HERO.imageSrc}
            alt={AIK_HERO.imageAlt}
            fill
            sizes="100vw"
            className="object-cover object-bottom"
          />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-4 px-6 pt-12 text-center sm:pt-16">
            <span className="rounded-full bg-tertiary/90 px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-[0.08em] text-white">
              {AIK_HERO.badge}
            </span>
            <h2
              id="hero-aik-heading"
              className="font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none text-primary"
            >
              {AIK_HERO.heading}
            </h2>
            <p className="max-w-xl font-sans text-base leading-relaxed text-ink-900 sm:text-lg">
              {AIK_HERO.intro}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {SUB_AIK_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-line bg-mist p-6"
              >
                <h3 className="font-display text-xl font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-base leading-relaxed text-ink-500">
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
      id="hero-aik"
      aria-labelledby="hero-aik-heading"
      className="relative w-full bg-paper"
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] w-full overflow-hidden"
      >
        {/* Background image — pinned and zoomed via GSAP */}
        <div
          ref={imgRef}
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: "50% 70%" }}
        >
          <Image
            src={AIK_HERO.imageSrc}
            alt={AIK_HERO.imageAlt}
            fill
            sizes="100vw"
            priority
            className="object-cover object-bottom"
          />
        </div>

        {/* Intro text — positioned in the white sky area */}
        <div
          ref={textRef}
          className="absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-3 px-6 pt-10 text-center will-change-transform sm:gap-4 sm:pt-14 lg:pt-16"
        >
          <span className="rounded-full bg-tertiary/90 px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm">
            {AIK_HERO.badge}
          </span>
          <h2
            id="hero-aik-heading"
            className="font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none text-primary"
          >
            {AIK_HERO.heading}
          </h2>
          <p className="max-w-xl font-sans text-base leading-relaxed text-ink-900 sm:text-lg">
            {AIK_HERO.intro}
          </p>
        </div>

        {/* Frosted card 1 (left side) */}
        <div
          ref={card1Ref}
          className="invisible absolute left-[5%] top-1/2 z-20 w-[90%] max-w-md -translate-y-1/2 rounded-2xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-md will-change-transform sm:left-[8%] sm:w-auto sm:p-8 lg:left-[10%]"
        >
          <h3 className="font-display text-xl font-semibold leading-tight text-primary sm:text-2xl">
            {SUB_AIK_ITEMS[0].title}
          </h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink-500 sm:text-base">
            {SUB_AIK_ITEMS[0].body}
          </p>
        </div>

        {/* Frosted card 2 (right side) */}
        <div
          ref={card2Ref}
          className="invisible absolute right-[5%] top-1/2 z-20 w-[90%] max-w-md -translate-y-1/2 rounded-2xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-md will-change-transform sm:right-[8%] sm:w-auto sm:p-8 lg:right-[10%]"
        >
          <h3 className="font-display text-xl font-semibold leading-tight text-primary sm:text-2xl">
            {SUB_AIK_ITEMS[1].title}
          </h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink-500 sm:text-base">
            {SUB_AIK_ITEMS[1].body}
          </p>
        </div>
      </div>
    </section>
  );
}
