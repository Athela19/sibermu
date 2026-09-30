"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import RevealText from "./RevealText";

export default function Ekosistem() {
  const innerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const inner = innerRef.current;
    const bidangEl = document.getElementById("bidang-kemahasiswaan");
    const prestasiEl = document.getElementById("prestasi");
    if (!inner || !bidangEl) return;

    const st = {
      trigger: bidangEl,
      start: "top 50%",
      endTrigger: prestasiEl ?? bidangEl,
      end: prestasiEl ? "top 40%" : "top 15%",
      scrub: 1,
    };

    const ctx = gsap.context(() => {
      // Zoom + blur bersama
      gsap.fromTo(
        inner,
        { scale: 1, filter: "blur(0px)" },
        { scale: 1.25, filter: "blur(10px)", ease: "none", scrollTrigger: st },
      );

      // Parallax: teks bergerak lebih cepat ke atas dari gambar
      if (textRef.current) {
        gsap.to(textRef.current, {
          y: -60,
          ease: "none",
          scrollTrigger: st,
        });
      }
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          y: -20,
          ease: "none",
          scrollTrigger: st,
        });
      }
    }, inner);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="ekosistem"
      aria-labelledby="ekosistem-heading"
      className="sticky top-0 z-10 flex min-h-[100svh] w-full items-center overflow-hidden bg-paper"
      style={{ contain: "layout" }}
    >
      <div
        ref={innerRef}
        className="absolute inset-0 origin-center will-change-transform"
      >
        {/* Gambar AIK Gedung — menutupi sisi kanan */}
        <div ref={imageRef} className="absolute inset-y-0 right-0 w-full will-change-transform lg:w-[55%]">
          <Image
            src="/assets/AIKGedung.png"
            alt="Gedung kampus SiberMu"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-center"
            priority={false}
          />
          {/* Gradient overlay agar teks tetap terbaca */}
          <div className="absolute inset-0 bg-gradient-to-b from-paper/95 via-paper/90 to-paper/70 lg:bg-gradient-to-r lg:from-paper lg:via-paper/80 lg:to-transparent" />
        </div>

        {/* Teks */}
        <div ref={textRef} className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-6 will-change-transform sm:px-8">
          <div className="max-w-xl py-16 lg:py-24">
            <RevealText
              as="h1"
              id="ekosistem-heading"
              text="Ekosistem"
              className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
            />
            <RevealText
              as="p"
              text="Di bawah naungan Biro Al-Islam dan Kemuhammadiyahan serta Kemahasiswaan, Bidang Kemahasiswaan Universitas Siber Muhammadiyah hadir sebagai pusat pengembangan potensi mahasiswa melalui organisasi, kompetisi, kreativitas, kewirausahaan, dan berbagai program pengembangan diri."
              className="mt-6 max-w-xl font-sans text-[1.05rem] leading-7 text-ink-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
