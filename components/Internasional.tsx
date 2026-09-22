"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import MediaSlot from "./MediaSlot";
import RevealText from "./RevealText";
import { KEGIATAN_INTERNASIONAL } from "@/lib/content";

const LAYOUTS = [
  { width: "w-[86vw] sm:w-[62vw] lg:w-[46vw]", align: "justify-start", offset: "pt-[6vh]" },
  { width: "w-[76vw] sm:w-[52vw] lg:w-[38vw]", align: "justify-end", offset: "pb-[10vh]" },
  { width: "w-[90vw] sm:w-[68vw] lg:w-[52vw]", align: "justify-start", offset: "pb-[6vh]" },
  { width: "w-[80vw] sm:w-[56vw] lg:w-[42vw]", align: "justify-end", offset: "pt-[10vh]" },
] as const;

export default function Internasional() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-internasional-media]").forEach((media) => {
        gsap.fromTo(
          media,
          { autoAlpha: 0, y: 32, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: media,
              start: "top 85%",
              once: true,
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  if (KEGIATAN_INTERNASIONAL.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="internasional"
      aria-labelledby="internasional-heading"
      className="relative z-20 -mt-px w-full bg-paper"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 text-center sm:px-8 lg:py-24">
        <RevealText
          as="h2"
          id="internasional-heading"
          text="Kegiatan Internasional"
          className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
        />
      </div>
      {KEGIATAN_INTERNASIONAL.map((item, pos) => {
        const layout = LAYOUTS[pos % LAYOUTS.length];
        return (
          <div
            key={item.mediaLabel}
            className={`flex min-h-[100svh] w-full items-center ${layout.align} ${layout.offset}`}
          >
            <div data-internasional-media className={layout.width}>
              <MediaSlot
                label={item.mediaLabel}
                ratio="4 / 3"
                src={item.src}
                alt={item.alt ?? ""}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
