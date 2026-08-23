import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ActualitesListClient from "./ActualitesListClient";
import { getActualites } from "@/lib/actualites";

const VERT = "#162233";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ActualitesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.actualites;

  const articles = await getActualites(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 w-16 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.30)" }} />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
          </div>
        </section>

        <ActualitesListClient
          articles={articles}
          locale={locale}
          dict={{ tous: t.tous, lire: t.lire, chargerPlus: t.chargerPlus }}
        />
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
