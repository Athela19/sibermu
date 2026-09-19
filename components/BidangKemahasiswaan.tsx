"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function BidangKemahasiswaan() {
  const sectionRef = useRef<HTMLElement>(null);
  const domeRef = useRef<HTMLDivElement>(null);
  const desktopTextRef = useRef<SVGTextElement>(null);
  const mobileTextRef = useRef<SVGTextElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !domeRef.current || !sectionRef.current) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const yFrom = isDesktop ? 80 : 32;

    const ctx = gsap.context(() => {
      const scrollPos = {
        trigger: sectionRef.current,
        start: "top 92%",
        end: "top 42%",
        scrub: 1,
      };
      gsap.fromTo(
        domeRef.current,
        { y: yFrom },
        {
          y: 0,
          ease: "none",
          scrollTrigger: scrollPos,
        },
      );
      // Gap huruf 0 -> final mengikuti scroll (desktop 0.06em, mobile 0.04em)
      if (desktopTextRef.current) {
        gsap.fromTo(
          desktopTextRef.current,
          { letterSpacing: "-0.5em" },
          {
            letterSpacing: "0.06em",
            ease: "none",
            scrollTrigger: scrollPos,
          },
        );
      }
      if (mobileTextRef.current) {
        gsap.fromTo(
          mobileTextRef.current,
          { letterSpacing: "-0.5em" },
          {
            letterSpacing: "0.04em",
            ease: "none",
            scrollTrigger: scrollPos,
          },
        );
      }
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
        className="relative mx-auto flex min-h-[62svh] w-full flex-col items-center justify-end overflow-hidden will-change-transform sm:min-h-[68svh] lg:min-h-[calc(85svh-10px)]"
      >
        {/* Desktop dome — frozen, hidden di mobile */}
        <svg
          viewBox="0 0 1200 620"
          className="absolute inset-0 hidden h-full w-full lg:block"
          preserveAspectRatio="none"
          role="img"
          aria-label="bidang kemahasiswaan"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="bidang-arc-second"
              d="M 72 610 A 528 528 0 0 1 1128 610"
              fill="none"
            />
          </defs>
          <path
            d="M 0 620 L 0 610 A 600 600 0 0 1 1200 610 L 1200 620 Z"
            fill="#1A2A5B"
          />
          <path
            d="M 0 610 A 600 600 0 0 1 1200 610"
            fill="#1A2A5B"
          />
          <text
            ref={desktopTextRef}
            fill="white"
            fontSize="105"
            fontWeight="800"
            letterSpacing="0.06em"
            style={{ fontFamily: "var(--font-sans)" }}
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
        {/* Mobile dome — bulat proporsional di 360-768px */}
        <svg
          viewBox="0 0 720 620"
          className="absolute inset-0 h-full w-full lg:hidden"
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="bidang kemahasiswaan"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path
              id="bidang-arc-second-mobile"
              d="M 52 610 A 308 308 0 0 1 668 610"
              fill="none"
            />
          </defs>
          <path
            d="M 0 620 L 0 610 A 360 360 0 0 1 720 610 L 720 620 Z"
            fill="#1A2A5B"
          />
          <path
            d="M 0 610 A 360 360 0 0 1 720 610"
            fill="#1A2A5B"
          />
          <text
            ref={mobileTextRef}
            fill="white"
            fontSize="64"
            fontWeight="800"
            letterSpacing="0.04em"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <textPath
              href="#bidang-arc-second-mobile"
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              bidang kemahasiswaan
            </textPath>
          </text>
        </svg>
        {/* Teks tengah dome — mobile: tengah setengah lingkaran, desktop: center + 20px */}
        <div className="absolute inset-0 z-10 flex items-end justify-center px-6 pb-[calc(100vw*0.25-70px)] lg:items-center lg:pb-0 lg:pt-[20px]">
          <p className="max-w-[280px] text-center font-sans text-[14px] font-medium leading-[1.6] text-white sm:max-w-[360px] sm:text-[15px] sm:leading-6 lg:max-w-[420px]">
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
