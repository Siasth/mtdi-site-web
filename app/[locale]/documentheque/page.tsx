import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DocumentListClient from "./DocumentListClient";
import { getDocuments } from "@/lib/documents";
import fr from "../../../dictionaries/fr.json";
import en from "../../../dictionaries/en.json";

const VERT  = "#162233";
const JAUNE = "#FFBE00";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DocumenthequePage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === "en";
  const t = isEn ? en.documentheque : fr.documentheque;
  const prefix = isEn ? "/en" : "";

  const documents = await getDocuments(isEn ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-12 overflow-hidden" style={{ background: VERT }}>
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-6">{t.sousTitre}</p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              <span style={{ color: JAUNE }}>{t.titre}</span>
            </h1>
            <p className="mt-8 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">{t.intro}</p>
          </div>
        </section>

        <DocumentListClient
          documents={documents}
          locale={locale}
          dict={{
            tous: t.filtres.tous, strategies: t.filtres.strategies, rapports: t.filtres.rapports,
            guides: t.filtres.guides, textesJuridiques: t.filtres.textesJuridiques,
            documentsEssentiels: t.documentsEssentiels, tousDocuments: t.tousDocuments, telechargement: t.telechargement,
          }}
        />

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">{t.consultezCadre}</h2>
              <p className="mt-3 text-white/60 text-sm font-medium">{t.ctaDesc}</p>
            </div>
            <a
              href={`${prefix}/textes-juridiques`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {t.textesJuridiques}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </section>

      </main>

      <Footer locale={locale} />
    </>
  );
}
