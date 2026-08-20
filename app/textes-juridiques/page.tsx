import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT  = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const textes = [
  {
    title: "Code du numérique en République du Bénin",
    type: "Loi",
    typeColor: VERT,
    référence: "Loi n°2017-20",
    date: "28 avril 2018",
    status: "En vigueur",
    description:
      "Cadre juridique fondateur régissant l'économie numérique au Bénin. Couvre la protection des données à caractère personnel, la cybersécurité, les transactions électroniques, le commerce en ligne, les communications électroniques et les infractions liées aux technologies de l'information et de la communication.",
    articles: "478 articles répartis en 8 livres",
    href: "https://innovation.gouv.bj/assets/Documents/loi-2017-20.pdf",
  },
  {
    title: "Loi portant modification du code du numérique en République du Bénin",
    type: "Loi",
    typeColor: VERT,
    référence: "Loi n°2020-35",
    date: "2020",
    status: "En vigueur",
    description:
      "Loi portant modification de la loi n°2017-20 du 20 avril 2018 portant code du numérique en République du Bénin. Actualise et complète le cadre juridique fondateur du numérique.",
    articles: "Texte modificatif",
    href: "https://innovation.gouv.bj/assets/Documents/loi-2020-35.pdf",
  },
];

const stats = [
  { value: "2", label: "Textes en vigueur", suffix: "répertoriés" },
  { value: "478", label: "Articles", suffix: "code du numérique" },
  { value: "1", label: "Type de texte", suffix: "Loi" },
  { value: "2017", label: "Depuis", suffix: "cadre juridique actif" },
];

export default function TextesJuridiquesPage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section
          className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 overflow-hidden"
          style={{ background: VERT }}
        >
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-6">
              Ressources · Cadre légal
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              Textes & Cadre<br />
              <span style={{ color: JAUNE }}>Juridique</span>
            </h1>
            <p className="mt-8 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              L'ensemble des textes législatifs, réglementaires et normatifs encadrant la
              transformation digitale, l'intelligence artificielle et l'innovation technologique
              en République du Bénin.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Vue d'ensemble
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="p-8 bg-white text-center">
                  <span
                    className="block text-4xl sm:text-5xl font-black tabular-nums leading-none"
                    style={{ color: VERT }}
                  >
                    {stat.value}
                  </span>
                  <span className="block mt-3 text-sm font-black uppercase tracking-wider text-anthracite">
                    {stat.label}
                  </span>
                  <span className="block mt-1 text-xs font-medium text-anthracite/40">
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
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Textes réglementaires
            </h2>
            <div className="flex flex-col gap-0">
              {textes.map((texte, i) => (
                <div
                  key={texte.référence}
                  className="py-8"
                  style={{ borderBottom: i < textes.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                      style={{ background: texte.typeColor }}
                    >
                      {texte.type}
                    </span>
                    <span className="text-xs font-bold text-anthracite/50 tabular-nums">
                      {texte.référence}
                    </span>
                    <span className="text-xs font-medium text-anthracite/30">
                      {texte.date}
                    </span>
                    <span
                      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                      style={{ background: "#16a34a20", color: "#16a34a" }}
                    >
                      {texte.status}
                    </span>
                  </div>

                  <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-3 max-w-4xl">
                    {texte.title}
                  </h3>
                  <p className="text-anthracite/50 text-sm font-medium leading-relaxed mb-4 max-w-3xl">
                    {texte.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6">
                    <span className="text-xs font-medium text-anthracite/30">
                      {texte.articles}
                    </span>
                    {texte.href !== "#" ? (
                      <Link
                        href={texte.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-all hover:gap-4"
                        style={{ color: VERT }}
                      >
                        Consulter le texte
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15,3 21,3 21,9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-anthracite/25"
                      >
                        Document non disponible en ligne
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Note */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <div
              className="flex items-start gap-4 p-6"
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
                <strong style={{ color: VERT, fontWeight: 800 }}>Avertissement</strong> : Les textes présentés
                sur cette page ont une valeur informative. Seuls les textes publiés au Journal Officiel de la
                République du Bénin font foi. Pour toute question juridique, veuillez consulter le
                service juridique du Ministère.
              </p>
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                Accédez à la<br />documenthèque
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                Stratégies · Rapports · Guides · Publications
              </p>
            </div>
            <Link
              href="/documentheque"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              Documenthèque
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
