import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import RevealText from "@/components/RevealText";
import { HERO } from "@/lib/content";
import { getHeroFrames } from "@/lib/hero-frames";

export default function Home() {
  const heroFrames = getHeroFrames();

  return (
    <>
      <Navbar />
      <main id="konten">
        <div className="sr-only">
          <h1>{HERO.title}</h1>
          <p>{HERO.subtitle}</p>
        </div>
        <Hero frames={heroFrames} />
        <section
          id="kemahasiswaan"
          aria-labelledby="kemahasiswaan-heading"
          className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            Kemahasiswaan
          </p>
          <RevealText
            as="h2"
            id="kemahasiswaan-heading"
            text="Section Kemahasiswaan menyusul."
            className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
          />
        </section>
        <section
          id="aik"
          aria-labelledby="aik-heading"
          className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-tertiary">
            Al-Islam &amp; Kemuhammadiyahan
          </p>
          <RevealText
            as="h2"
            id="aik-heading"
            text="Section AIK menyusul."
            className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
          />
        </section>
        <section
          id="kontak"
          aria-labelledby="kontak-heading"
          className="bg-primary px-6 py-24 text-center sm:px-8"
        >
          <h2
            id="kontak-heading"
            className="mx-auto max-w-3xl font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
          >
            Gabung Bersama Kami.
          </h2>
        </section>
      </main>
    </>
  );
}
