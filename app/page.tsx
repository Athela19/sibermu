import BidangKemahasiswaan from "@/components/BidangKemahasiswaan";
import Ekosistem from "@/components/Ekosistem";
import FasilitasMahasiswa from "@/components/FasilitasMahasiswa";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HeroAIK from "@/components/HeroAIK";
import Kompetisi from "@/components/Kompetisi";
import Navbar from "@/components/Navbar";
import PillarAIK from "@/components/PillarAIK";
import Prestasi from "@/components/Prestasi";
import UKM from "@/components/UKM";
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
        <div className="relative isolate">
          <Ekosistem />
          <div
            aria-hidden="true"
            className="relative z-0 h-[70svh] bg-paper"
          />
          <BidangKemahasiswaan />
          <Prestasi />
          <Kompetisi />
          <UKM />
        </div>
        <FasilitasMahasiswa />
        <div id="aik" className="relative isolate">
          <HeroAIK />
          <PillarAIK />
        </div>
        <Footer />
      </main>
    </>
  );
}
