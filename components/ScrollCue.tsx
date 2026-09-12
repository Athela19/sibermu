"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { HERO } from "@/lib/content";

export default function ScrollCue({
  target = HERO.scrollTarget,
}: {
  target?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-cue-arrow]", {
        y: 8,
        duration: 0.8,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    document
      .getElementById(target.replace("#", ""))
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="flex flex-col items-center gap-3">
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
        {HERO.scrollLabel}
      </span>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Gulir ke section kemahasiswaan"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
      >
        <span data-cue-arrow className="flex">
          <ArrowDown className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
