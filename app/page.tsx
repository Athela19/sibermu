import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { getHeroFrames } from "@/lib/hero-frames";

export default function Home() {
  const heroFrames = getHeroFrames();

  return (
    <>
      <Navbar />
      <main>
        <Hero frames={heroFrames} />
        <section
          id="kemahasiswaan"
          className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            Kemahasiswaan
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary">
            Section Kemahasiswaan menyusul.
          </h2>
        </section>
        <section
          id="aik"
          className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-8"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-tertiary">
            Al-Islam &amp; Kemuhammadiyahan
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary">
            Section AIK menyusul.
          </h2>
        </section>
        <section
          id="kontak"
          className="bg-primary px-6 py-24 text-center sm:px-8"
        >
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white">
            Gabung Bersama Kami.
          </h2>
        </section>
      </main>
    </>
  );
}
