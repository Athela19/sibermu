"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function BidangKemahasiswaan() {
  const sectionRef = useRef<HTMLElement>(null);
  const domeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !domeRef.current || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        domeRef.current,
        { y: 80 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 92%",
            end: "top 42%",
            scrub: 1,
          },
        },
      );
    }, domeRef);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bidang-kemahasiswaan"
      aria-label="bidang kemahasiswaan"
      className="relative z-20 -mt-6 flex min-h-[100svh] w-full flex-col justify-end overflow-hidden bg-transparent pt-0 lg:-mt-10"
    >
      {/* Dome utama + teks mengikuti alur dome */}
      <div
        ref={domeRef}
        className="relative mx-auto flex min-h-[calc(85svh-10px)] w-[calc(100%-20px)] flex-col items-center justify-end overflow-hidden will-change-transform"
      >
        <svg
          viewBox="0 0 1200 620"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="bidang kemahasiswaan"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Path teks — 62px inset dari tepi dome */}
            <path
              id="bidang-arc-second"
              d="M 72 610 A 528 528 0 0 1 1128 610"
              fill="none"
            />
          </defs>
          {/* Dome utama — 10px inset dari viewport (w calc 100%-20px), fill primary */}
          <path
            d="M 0 620 L 0 610 A 600 600 0 0 1 1200 610 L 1200 620 Z"
            fill="#1A2A5B"
          />
          {/* Dome atas melengkung */}
          <path
            d="M 0 610 A 600 600 0 0 1 1200 610"
            fill="#1A2A5B"
          />
          {/* Teks mengikuti alur dome — gap radial 62px */}
          <text
            fill="white"
            fontSize="105"
            fontWeight="800"
            letterSpacing="0.06em"
            style={{ fontFamily: "var(--font-sans)" }}
            textLength="1615"
            lengthAdjust="spacing"
          >
            <textPath
              href="#bidang-arc-second"
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              bidang kemahasiswaan
            </textPath>
          </text>
        </svg>
        {/* Teks tengah dome — 20px lebih bawah */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pt-[20px]">
          <p className="max-w-[420px] text-center font-sans text-[15px] font-medium leading-6 text-white">
            Ruang tumbuh mahasiswa untuk
            <br />
            berkembang, berkarya, dan memberikan dampak.
          </p>
        </div>
        <h2 className="sr-only">bidang kemahasiswaan</h2>
      </div>
    </section>
  );
}
