import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getStructures } from "@/lib/structures";

const VERT = "#162233";
const JAUNE = "#FFBE00";


function StructureIcon({ acronym, color }: { acronym: string; color: string }) {
  if (acronym === "SBIN") {
    return (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="2.5" />
      <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="2.5" />
    </svg>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StructuresPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.structures;
  const structures = await getStructures(locale === "en" ? "en" : "fr");
  const prefix = locale === "en" ? "/en" : "";

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              {t.breadcrumb}
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              {t.titre.split(" ").slice(0, -1).join(" ")}<br />
              <span style={{ color: JAUNE }}>{t.titre.split(" ").slice(-1)}</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.sousTitre}
            </p>
          </div>
        </section>

        {/* Structures détaillées */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-14" style={{ color: VERT }}>
              {t.nosStructures}
            </h2>

            <div className="flex flex-col gap-0">
              {structures.map((structure, i) => (
                <div key={structure.acronym}>
                  <div
                    className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 py-12"
                    style={i < structures.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.08)" } : undefined}
                  >
                    {/* Left: Identity */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="flex-shrink-0 h-16 w-40 flex items-center justify-center">
                          {structure.logoSrc ? (
                            <div className="relative w-full h-full">
                              <Image src={structure.logoSrc} alt={`Logo ${structure.acronym}`} fill className="object-contain object-left" sizes="160px" />
                            </div>
                          ) : (
                            <StructureIcon acronym={structure.acronym} color={structure.accent} />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-1" style={{ color: structure.accent }}>
                            {structure.acronym}
                          </span>
                          <h3 className="text-anthracite font-black text-lg uppercase leading-snug">{structure.name}</h3>
                        </div>
                      </div>

                      <div className="text-anthracite/75 text-sm font-medium leading-relaxed mb-6 prose-institutionnel" dangerouslySetInnerHTML={{ __html: structure.description }} />

                      <Link
                        href={structure.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all hover:gap-4"
                        style={{ color: structure.accent }}
                      >
                        {t.visiter} {structure.acronym}
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                      </Link>
                    </div>

                    {/* Right: Missions */}
                    <div className="lg:col-span-3">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: structure.accent }}>
                        {t.missionsPrincipales}
                      </p>
                      <ul className="flex flex-col gap-0 list-none" role="list">
                        {structure.missions.map((mission, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-4 py-4"
                            style={j < structure.missions.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.06)" } : undefined}
                          >
                            <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: `${structure.accent}14`, color: structure.accent }}>
                              {String(j + 1).padStart(2, "0")}
                            </span>
                            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">{mission}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Synthèse */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.dispositifCoherent}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
              {structures.map((structure) => (
                <div key={structure.acronym} className="p-8 bg-white text-center">
                  <div className="h-16 w-full max-w-[160px] flex items-center justify-center mx-auto mb-4">
                    {structure.logoSrc ? (
                      <div className="relative w-full h-full">
                        <Image src={structure.logoSrc} alt={`Logo ${structure.acronym}`} fill className="object-contain" sizes="160px" />
                      </div>
                    ) : (
                      <StructureIcon acronym={structure.acronym} color={structure.accent} />
                    )}
                  </div>
                  <h3 className="text-anthracite font-black text-base uppercase mb-2">{structure.acronym}</h3>
                  <p className="text-anthracite/75 text-xs font-semibold uppercase tracking-wider">{structure.label}</p>
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
                {t.decouvrirMissions}<br />
                <span style={{ color: JAUNE }}>du ministère</span>
              </h2>
            </div>
            <Link
              href={`${prefix}/le-ministere/missions`}
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              Missions & attributions
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <style>{`
        .prose-institutionnel p { margin: 0.4em 0; }
        .prose-institutionnel strong { font-weight: 900; }
        .prose-institutionnel a { color: #006828; text-decoration: underline; }
        .prose-institutionnel ul { list-style: disc; padding-left: 1.2em; }
        .prose-institutionnel ol { list-style: decimal; padding-left: 1.2em; }
      `}</style>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
