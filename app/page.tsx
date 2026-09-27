import BidangKemahasiswaan from "@/components/BidangKemahasiswaan";
import Ekosistem from "@/components/Ekosistem";
import Hero from "@/components/Hero";
import HeroAIK from "@/components/HeroAIK";
import Internasional from "@/components/Internasional";
import Kompetisi from "@/components/Kompetisi";
import Navbar from "@/components/Navbar";
import PillarAIK from "@/components/PillarAIK";
import Prestasi from "@/components/Prestasi";
import RevealText from "@/components/RevealText";
import StickySplit from "@/components/StickySplit";
import UKM from "@/components/UKM";
import { FASILITAS_MAHASISWA, HERO } from "@/lib/content";
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
        <div className="relative isolate">
          <Ekosistem />
          <BidangKemahasiswaan />
          <Prestasi />
          <Kompetisi />
          <Internasional />
          <UKM />
        </div>
        <section
          id="kemahasiswaan"
          aria-labelledby="fasilitas-heading"
          className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-24"
        >
          <div className="mb-10 text-center sm:mb-14 lg:mb-16">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.08em] text-secondary">
              Kemahasiswaan
            </p>
            <RevealText
              as="h2"
              id="fasilitas-heading"
              text="Fasilitas Mahasiswa"
              className="mt-3 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary"
            />
          </div>
          <StickySplit
            id="fasilitas-mahasiswa"
            eyebrow="Fasilitas Mahasiswa"
            items={FASILITAS_MAHASISWA}
          />
        </section>
        <div id="aik" className="relative isolate">
          <HeroAIK />
          <PillarAIK />
        </div>
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
