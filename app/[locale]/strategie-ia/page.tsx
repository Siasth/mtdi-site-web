import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT  = "#006828";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const piliers = [
  {
    number: "01",
    accent: VERT,
    title: "Gouvernance & Éthique",
    description: "Un cadre réglementaire africain de référence garantissant une IA transparente, équitable et respectueuse des droits fondamentaux. Comité national d'éthique, audit algorithmique et protection des données personnelles.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2 3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "02",
    accent: "#A07800",
    title: "Infrastructures IA",
    description: "Souveraineté numérique par le cloud public béninois, des data centers à haute disponibilité et un réseau national d'open data structuré pour l'entraînement des modèles d'IA.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="4" rx="1" />
        <rect x="2" y="10" width="20" height="4" rx="1" />
        <rect x="2" y="17" width="20" height="4" rx="1" />
        <circle cx="6" cy="5" r="0.8" fill="currentColor" />
        <circle cx="6" cy="12" r="0.8" fill="currentColor" />
        <circle cx="6" cy="19" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "03",
    accent: ROUGE,
    title: "Talents & Compétences",
    description: "Formation de 10 000 professionnels de l'IA d'ici 2030 via la Digital Academy, des partenariats universitaires, des bourses d'excellence et des programmes de certification reconnus à l'international.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    number: "04",
    accent: VERT,
    title: "Projets & Innovation",
    description: "Déploiement de l'IA dans l'agriculture, la santé, l'éducation et les services publics. Bénin IA Challenge, incubateur national, et fonds de soutien aux startups deeptech béninoises.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.3-6C6.8 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  },
];

const milestones = [
  { year: "2024", title: "Diagnostic national", description: "Audit des capacités IA du Bénin, cartographie des acteurs, identification des cas d'usage prioritaires.", done: true },
  { year: "2025", title: "Adoption de la stratégie", description: "Validation interministérielle et lancement officiel de la Stratégie Nationale d'Intelligence Artificielle.", done: true },
  { year: "2026", title: "Création de l'ANAI", description: "Mise en place de l'Agence Nationale de l'Intelligence Artificielle. Premiers appels à projets.", done: true },
  { year: "2027", title: "Montée en charge", description: "10 projets IA sectoriels déployés. Ouverture du premier Data Center souverain du Bénin.", done: false },
  { year: "2028", title: "Maturité et consolidation", description: "5 000 professionnels certifiés. Cadre juridique IA adopté par l'Assemblée nationale.", done: false },
  { year: "2030", title: "Bénin, nation de l'IA", description: "Bénin classé dans le top 5 africain pour l'adoption de l'IA. Plateforme continentale d'IA déployée.", done: false },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StrategieIAPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.strategie;

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "84px" }}>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 overflow-hidden" style={{ background: VERT }}>
          <div className="relative max-w-7xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2">
              <span className="px-4 py-1.5 text-xs font-black uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                Bénin 2030
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              {t.titreL1}<br />
              {t.titreL2}<br />
              <span style={{ color: JAUNE }}>{t.titreL3}</span>
            </h1>

            <p className="mt-8 text-white/60 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              {t.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="https://innovation.gouv.bj/assets/Documents/sniam-2023-2027.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
                style={{ background: "white", color: VERT }}
              >
                {t.telecharger}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
              <Link href="#piliers" className="text-sm font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors">
                {t.explorerPiliers}
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 pt-8 grid grid-cols-2 sm:grid-cols-4 gap-8" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              {[
                { value: "5", label: t.piliers },
                { value: "4", label: t.projets },
                { value: "2030", label: t.horizon },
                { value: "10 000", label: t.professionnels },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-black text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Pillars */}
        <section id="piliers" className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.les4Piliers}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {piliers.map((pilier) => (
                <div key={pilier.number} className="group p-8 sm:p-10 bg-white hover:bg-gris-perle transition-colors">
                  <div className="flex items-start gap-5 mb-6">
                    <span className="text-5xl font-black leading-none tabular-nums flex-shrink-0" style={{ color: pilier.accent, opacity: 0.3 }}>
                      {pilier.number}
                    </span>
                    <div className="mt-1 flex-shrink-0" style={{ color: pilier.accent }}>
                      {pilier.icon}
                    </div>
                  </div>
                  <h3 className="text-anthracite font-black text-xl uppercase leading-snug mb-4">{pilier.title}</h3>
                  <p className="text-anthracite/75 text-sm font-medium leading-relaxed group-hover:text-anthracite/80 transition-colors">{pilier.description}</p>
                  <div className="mt-6 h-0.5 w-12 rounded-full" style={{ background: pilier.accent }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-14" style={{ color: VERT }}>
              {t.jalons}
            </h2>

            <div className="relative">
              <div className="absolute left-20 sm:left-28 top-0 bottom-0 w-px" style={{ background: "rgba(0,0,0,0.10)" }} />

              <div className="flex flex-col gap-0">
                {milestones.map((milestone, i) => (
                  <div key={i} className="relative flex items-start gap-8 sm:gap-12 pb-12 last:pb-0">
                    <div className="flex-shrink-0 w-16 sm:w-24 text-right pt-1">
                      <span className="text-sm font-black tabular-nums" style={{ color: milestone.done ? VERT : "rgba(26,26,26,0.25)" }}>
                        {milestone.year}
                      </span>
                    </div>

                    <div className="absolute flex items-center justify-center" style={{ left: "calc(4rem + 2rem - 6px)", top: "6px" }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: milestone.done ? VERT : "transparent", border: `2px solid ${milestone.done ? VERT : "rgba(26,26,26,0.20)"}` }} />
                    </div>

                    <div className="flex-1 min-w-0 pl-6">
                      <div className="flex items-start gap-3 mb-2">
                        {milestone.done && (
                          <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest" style={{ background: `${VERT}14`, color: VERT }}>
                            {t.accompli}
                          </span>
                        )}
                        <h3 className="text-anthracite font-black text-base uppercase leading-snug" style={{ opacity: milestone.done ? 1 : 0.45 }}>
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: milestone.done ? "rgba(26,26,26,0.55)" : "rgba(26,26,26,0.30)" }}>
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white leading-tight">
                {t.accederDocument}
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                {t.documentInfo}
              </p>
            </div>
            <a
              href="https://innovation.gouv.bj/assets/Documents/sniam-2023-2027.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              {t.telecharger}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
