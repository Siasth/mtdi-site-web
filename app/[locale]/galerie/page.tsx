import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GalerieListClient from "./GalerieListClient";
import { getGalerieItems, getGalerieCollections } from "@/lib/galerie";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GaleriePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.galerie;
  const isEn = locale === "en";

  const [items, collections] = await Promise.all([
    getGalerieItems(isEn ? "en" : "fr"),
    getGalerieCollections(isEn ? "en" : "fr"),
  ]);

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>
        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-12" style={{ background: "#162233" }}>
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

        <GalerieListClient
          items={items}
          collections={collections}
          locale={locale}
          dict={{
            video: t.video, photo: t.photo, resultats: t.resultats, resultatsPluriel: t.resultatsPluriel,
            aucunResultat: t.aucunResultat, essayezAutres: t.essayezAutres,
            rechercherPlaceholder: t.rechercherPlaceholder, effacer: t.effacer,
          }}
        />
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
