import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const structures = [
  {
    acronym: "SBIN",
    name: "Société Béninoise d'Infrastructures Numériques",
    description:
      "La SBIN (Celtiis) est l'opérateur national d'infrastructures numériques, chargé du déploiement et de la gestion des réseaux de télécommunications et de la connectivité sur le territoire béninois.",
    missions: [
      "Déploiement de la fibre optique et des réseaux de télécommunications",
      "Gestion des infrastructures numériques nationales",
      "Fourniture de connectivité haut débit sur le territoire",
      "Développement de l'accès au numérique pour les citoyens et entreprises",
      "Soutien à la transformation digitale de l'État",
    ],
    url: "https://celtiis.bj/",
    accent: "#0077B6",
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    acronym: "ASIN",
    name: "Agence des Systèmes d'Information et du Numérique",
    description:
      "L'ASIN est l'opérateur national en charge de la mise en œuvre de la politique gouvernementale en matière de systèmes d'information, de sécurité numérique et d'infrastructures technologiques de l'État.",
    missions: [
      "Gestion et sécurisation des systèmes d'information de l'État",
      "Déploiement et maintenance des infrastructures numériques publiques",
      "Cybersécurité : CERT national, audits de sécurité, veille des menaces",
      "Interopérabilité des plateformes gouvernementales",
      "Accompagnement des administrations dans leur transformation digitale",
    ],
    url: "https://asin.bj/",
    accent: "#006828",
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="4" rx="1" />
        <rect x="2" y="10" width="20" height="4" rx="1" />
        <rect x="2" y="17" width="20" height="4" rx="1" />
        <circle cx="6" cy="5" r="0.8" fill="currentColor" />
        <circle cx="6" cy="12" r="0.8" fill="currentColor" />
        <circle cx="6" cy="19" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

export default function StructuresPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-14 pb-20"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">

            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              Le Ministère
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              Structures<br />
              <span style={{ color: JAUNE }}>sous tutelle</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              Les agences et structures placées sous la tutelle du Ministère de la Transformation Digitale et de l'Innovation, opérateurs clés de la politique numérique du Bénin.
            </p>
          </div>
        </section>

        {/* Structures détaillées */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-14"
              style={{ color: VERT }}
            >
              Nos structures
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
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: `${structure.accent}14`, color: structure.accent }}
                        >
                          {structure.icon}
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-black uppercase tracking-widest block mb-1"
                            style={{ color: structure.accent }}
                          >
                            {structure.acronym}
                          </span>
                          <h3 className="text-anthracite font-black text-lg uppercase leading-snug">
                            {structure.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-anthracite/60 text-sm font-medium leading-relaxed mb-6">
                        {structure.description}
                      </p>

                      <Link
                        href={structure.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all hover:gap-4"
                        style={{ color: structure.accent }}
                      >
                        Visiter {structure.acronym}
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                      </Link>
                    </div>

                    {/* Right: Missions */}
                    <div className="lg:col-span-3">
                      <p
                        className="text-[10px] font-black uppercase tracking-widest mb-4"
                        style={{ color: structure.accent }}
                      >
                        Missions principales
                      </p>
                      <div className="flex flex-col gap-0">
                        {structure.missions.map((mission, j) => (
                          <div
                            key={j}
                            className="flex items-start gap-4 py-4"
                            style={j < structure.missions.length - 1 ? { borderBottom: "1px solid rgba(0,0,0,0.06)" } : undefined}
                          >
                            <span
                              className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
                              style={{ background: `${structure.accent}14`, color: structure.accent }}
                            >
                              {String(j + 1).padStart(2, "0")}
                            </span>
                            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
                              {mission}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Synthèse */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle"
          style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Un dispositif cohérent
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {structures.map((structure) => (
                <div
                  key={structure.acronym}
                  className="p-8 bg-white text-center"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${structure.accent}14`, color: structure.accent }}
                  >
                    {structure.icon}
                  </div>
                  <h3 className="text-anthracite font-black text-base uppercase mb-2">
                    {structure.acronym}
                  </h3>
                  <p className="text-anthracite/40 text-xs font-semibold uppercase tracking-wider">
                    {structure.acronym === "SBIN" && "Infrastructures numériques & connectivité"}
                    {structure.acronym === "ASIN" && "Systèmes d'information & cybersécurité"}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-8 flex items-start gap-4 p-6"
              style={{ background: `${VERT}0a`, border: `1px solid ${VERT}25` }}
            >
              <svg
                className="flex-shrink-0 mt-0.5"
                width="18"
                height="18"
                fill="none"
                stroke={VERT}
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-medium text-anthracite/60">
                Ces structures opèrent sous la tutelle du MTDI et contribuent directement à la mise en œuvre de la politique numérique nationale. Pour en savoir plus sur l'organisation du ministère, consultez la page{" "}
                <Link href="/le-ministere/organigramme" className="underline hover:text-anthracite transition-colors font-semibold">
                  Organigramme
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                Découvrir les missions<br />
                <span style={{ color: JAUNE }}>du ministère</span>
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                Attributions, périmètre d'action et cadre juridique.
              </p>
            </div>
            <Link
              href="/le-ministere/missions"
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

      <Footer />
    </>
  );
}
