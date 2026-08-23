import { getDictionary, type Locale } from "./dictionaries";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AlaUne from "../components/AlaUne";
import MinistryMessage from "../components/MinistryMessage";
import GrandsChantiers from "../components/GrandsChantiers";
import StatsSection from "../components/StatsSection";
import { getPublicStats } from "@/lib/stats";
import { getHeroSlides } from "@/lib/hero";
import { getChantiers } from "@/lib/chantiers";
import Galerie from "../components/Galerie";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const home = dict.home as Record<string, string>;

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />
      <main>
        <HeroSection dict={home} slides={await getHeroSlides(locale === "en" ? "en" : "fr")} />
        <AlaUne locale={locale} />
        <MinistryMessage dict={home} locale={locale} />
        <GrandsChantiers dict={home} chantiers={await getChantiers(locale === "en" ? "en" : "fr")} />
        <StatsSection stats={await getPublicStats(locale === "en" ? "en" : "fr")} dict={home} />
        <Galerie dict={home} locale={locale} />
        <Newsletter dict={home} />
      </main>
      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
