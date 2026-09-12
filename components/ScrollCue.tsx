"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
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
      gsap.fromTo(
        "[data-cue-dot]",
        { y: -4 },
        {
          y: 4,
          duration: 0.8,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    document
      .getElementById(target.replace("#", ""))
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="flex justify-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Gulir ke section kemahasiswaan"
        className="flex items-center gap-3 rounded-full border border-white/30 bg-black/20 py-2.5 pl-4 pr-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/60 hover:bg-black/30"
      >
        <span
          data-cue-dot
          aria-hidden="true"
          className="block h-2 w-2 rounded-full bg-white"
        />
        <span className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-white/90">
          {HERO.scrollLabel}
        </span>
      </button>
    </div>
  );
}
