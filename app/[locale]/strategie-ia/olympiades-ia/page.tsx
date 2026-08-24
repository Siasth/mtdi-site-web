import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import StrategieIASubNav from "../../../components/StrategieIASubNav";
import { getOlympiadeEditions, getOlympiadeCriteres } from "@/lib/strategie-ia-content";

const VERT = "#006828";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OlympiadesIAPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const isEn = locale === "en";
  const [editions, criteres] = await Promise.all([
    getOlympiadeEditions(isEn ? "en" : "fr"),
    getOlympiadeCriteres(isEn ? "en" : "fr"),
  ]);

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />
      <StrategieIASubNav locale={locale} />

      <main>
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-16" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <span className="inline-block px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
              NOAI 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight text-white max-w-4xl">
              {locale === "en" ? "National AI Olympiad" : "Olympiades Nationales d'Intelligence Artificielle"}
            </h1>
            <p className="mt-6 text-white/60 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              {locale === "en"
                ? "The competition that selects Benin's brightest young talents to represent the country at the International AI Olympiad."
                : "La compétition qui sélectionne les jeunes talents les plus prometteurs du Bénin pour représenter le pays aux Olympiades Internationales d'Intelligence Artificielle."}
            </p>
          </div>
        </section>

        {/* Éditions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ background: "#0d1826" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: JAUNE }}>
              {locale === "en" ? "Editions" : "Éditions"}
            </h2>
            <div className="space-y-px" style={{ background: "rgba(255,255,255,0.08)" }}>
              {editions.map((ed) => (
                <div key={ed.id} className="p-8 sm:p-10" style={{ background: "#0d1826" }}>
                  <div className="flex items-start gap-6">
                    <span className="text-4xl font-black flex-shrink-0" style={{ color: JAUNE }}>{ed.year}</span>
                    <div>
                      <h3 className="text-white font-black text-lg uppercase leading-snug mb-2">{ed.title}</h3>
                      <p className="text-white/60 text-sm font-medium leading-relaxed mb-3">{ed.description}</p>
                      <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: `${ROUGE}22`, color: ROUGE }}>
                        {ed.highlight}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Critères de participation */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {locale === "en" ? "Eligibility criteria" : "Critères de participation"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {criteres.map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-gris-perle">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: VERT }}>
                    {i + 1}
                  </span>
                  <p className="text-anthracite/80 text-sm font-medium leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {locale === "en" ? "Follow the next edition" : "Suivre la prochaine édition"}
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                {locale === "en"
                  ? "Registrations and updates announced via the Actualités section."
                  : "Inscriptions et mises à jour annoncées via la rubrique Actualités."}
              </p>
            </div>
            <a
              href={locale === "en" ? "/en/actualites" : "/actualites"}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {locale === "en" ? "See news" : "Voir les actualités"}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
