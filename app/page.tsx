import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AlaUne from "./components/AlaUne";
import MinistryMessage from "./components/MinistryMessage";
import GrandsChantiers from "./components/GrandsChantiers";
import Galerie from "./components/Galerie";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import { readData } from "@/lib/data";

type HeroSlide = { id: number; src: string; alt: string };

export const dynamic = "force-dynamic";

export default async function Home() {
  const heroSlides = await readData<HeroSlide[]>("hero");

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero vidéo plein écran */}
        <HeroSection slides={heroSlides} />

        {/* 2. Bandeau "À la une" */}
        <AlaUne />

        {/* 3. Le mot du Ministre */}
        <MinistryMessage />

        {/* 4. Les 5 grands chantiers */}
        <GrandsChantiers />

        {/* 5. Galerie */}
        <Galerie />

        {/* 9. Newsletter */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
