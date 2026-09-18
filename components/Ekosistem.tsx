"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import RevealText from "./RevealText";

export default function Ekosistem() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = mediaRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32, filter: "blur(10px)", scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          scale: 1,
          duration: 1,
          ease: "power2.out",
          clearProps: "filter,transform",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
            toggleActions: "play none none none",
          },
        },
      );
    }, el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const triggerEl = document.getElementById("bidang-kemahasiswaan");
    if (!section || !triggerEl) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { scale: 1, filter: "blur(0px)" },
        {
          scale: 1.15,
          filter: "blur(8px)",
          ease: "none",
          scrollTrigger: {
            trigger: triggerEl,
            start: "top 50%",
            end: "top 15%",
            scrub: 1,
          },
        },
      );
    }, section);

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
      id="ekosistem"
      aria-labelledby="ekosistem-heading"
      className="sticky top-0 z-10 mx-auto w-full max-w-7xl origin-center bg-paper px-6 py-16 will-change-transform sm:px-8 lg:py-24"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Kiri: teks */}
        <div className="order-1">
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

        {/* Kanan: gambar gedung */}
        <div className="order-2">
          <div
            ref={mediaRef}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-mist will-change-transform"
          >
            <Image
              src="/assets/gedung.png"
              alt="Gedung kampus SiberMu"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
