import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { getTextesJuridiques } from "@/lib/textes-juridiques";
import TextesJuridiquesListClient from "./TextesJuridiquesListClient";

const VERT  = "#162233";
const JAUNE = "#FFBE00";

const stats = [
  { value: "2", label: "Textes en vigueur", suffix: "répertoriés" },
  { value: "478", label: "Articles", suffix: "code du numérique" },
  { value: "1", label: "Type de texte", suffix: "Loi" },
  { value: "2017", label: "Depuis", suffix: "cadre juridique actif" },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TextesJuridiquesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.textesjuridiques;
  const prefix = locale === "en" ? "/en" : "";
  const textes = await getTextesJuridiques(locale === "en" ? "en" : "fr");

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-12 overflow-hidden" style={{ background: VERT }}>
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-6">
              {t.sousTitre}
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              {t.titreL1}<br /><span style={{ color: JAUNE }}>{t.titreL2}</span>
            </h1>
            <p className="mt-8 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.vueEnsemble}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="p-8 bg-white text-center">
                  <span className="block text-4xl sm:text-5xl font-black tabular-nums leading-none" style={{ color: VERT }}>
                    {stat.value}
                  </span>
                  <span className="block mt-3 text-sm font-black uppercase tracking-wider text-anthracite">
                    {stat.label}
                  </span>
                  <span className="block mt-1 text-xs font-medium text-anthracite/65">
                    {stat.suffix}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Textes */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.textesReglementaires}
            </h2>
            <TextesJuridiquesListClient textes={textes} dict={{ consulterTexte: t.consulterTexte, documentNonDisponible: t.documentNonDisponible }} />
          </div>
        </section>

        {/* Note */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-4 p-6" style={{ background: `${VERT}0a`, border: `1px solid ${VERT}25` }}>
              <svg className="flex-shrink-0 mt-0.5" width="18" height="18" fill="none" stroke={VERT} strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium text-anthracite/60">
                <strong style={{ color: VERT, fontWeight: 800 }}>{t.avertissement}</strong> : {t.avertissementTexte}
              </p>
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {t.accedezDocumentheque}
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                {t.ctaDesc}
              </p>
            </div>
            <Link
              href={`${prefix}/documentheque`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {t.ctaLien}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
