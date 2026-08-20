import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const priorities = [
  {
    number: "01",
    accent: VERT,
    title: "Transformation digitale de l'administration",
    description:
      "Accélérer la dématérialisation des services publics pour offrir aux citoyens un accès simple, rapide et transparent aux démarches administratives, 24 heures sur 24.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    number: "02",
    accent: "#A07800",
    title: "Stratégie nationale d'intelligence artificielle",
    description:
      "Positionner le Bénin comme référence africaine de l'IA en déployant des solutions concrètes dans l'agriculture, la santé, l'éducation et la gouvernance.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 21H9l-.3-6C6.8 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  },
  {
    number: "03",
    accent: ROUGE,
    title: "Souveraineté numérique et cybersécurité",
    description:
      "Renforcer la confiance numérique par un cadre de cybersécurité robuste, la protection des données personnelles et le développement d'infrastructures nationales souveraines.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2 3 7v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "04",
    accent: VERT,
    title: "Innovation et écosystème startup",
    description:
      "Stimuler l'écosystème d'innovation béninois en soutenant les startups deeptech, en développant les talents numériques et en attirant les investissements internationaux.",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

const parcours = [
  {
    period: "",
    title: "Formation académique",
    description: "Ingénieur et titulaire d'un master de l'Université de Technologie de Compiègne. Docteur en intelligence artificielle de l'Université Toulouse III – Paul Sabatier (École Doctorale Mathématiques, Informatique et Télécommunications). Mineur en philosophie des technologies cognitives.",
  },
  {
    period: "",
    title: "Innovation et R&D",
    description: "Plus de quinze années d'expérience à diriger des programmes d'innovation d'envergure dans des environnements exigeants, conjuguant vision stratégique et exécution opérationnelle de projets à grande échelle.",
  },
  {
    period: "",
    title: "Cofondateur d'iSheero",
    description: "Initiative panafricaine dédiée à la formation de compétences d'excellence en data science, data engineering et infrastructures cloud.",
  },
  {
    period: "Mai 2026",
    title: "Ministre de la Transformation Digitale et de l'Innovation",
    description: "Nommé par le Président Romuald Wadagni, en charge de la stratégie nationale de l'intelligence artificielle. Mission : conduire la feuille de route technologique et bâtir un écosystème d'innovation dynamique, inclusif et compétitif.",
  },
];

export default function LeMinisterPage() {
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

            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-4">
              Le Ministère &middot; Le Ministre
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white max-w-5xl">
              Mahuna<br />
              <span style={{ color: JAUNE }}>Akplogan</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'Intelligence Artificielle.
            </p>
          </div>
        </section>

        {/* Portrait + Bio intro */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Portrait */}
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-sm"
                style={{ paddingBottom: "125%" }}
              >
                <Image
                  src="/mtdi.png"
                  alt="Portrait officiel de Mahuna Akplogan, Ministre de la Transformation Digitale et de l'Innovation"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: "#006828" }}
                />
              </div>

              {/* Floating badge */}
              <div
                className="absolute -right-4 top-8 px-4 py-2 rounded-sm shadow-lg hidden lg:block"
                style={{ background: "#006828" }}
              >
                <p className="text-white text-xs font-bold uppercase tracking-wider">
                  Ministre
                </p>
                <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest">
                  Transformation Digitale & IA
                </p>
              </div>
            </div>

            {/* Bio intro */}
            <div>
              <h2
                className="text-xs font-black uppercase tracking-widest mb-8"
                style={{ color: VERT }}
              >
                Biographie
              </h2>

              <div className="space-y-5 text-base text-anthracite/80 leading-relaxed">
                <p>
                  <strong className="text-anthracite font-bold">Mahuna Akplogan</strong>{" "}
                  compte parmi les figures de l'intelligence artificielle au Bénin. Ingénieur-docteur et entrepreneur, il appartient à cette catégorie de praticiens chez qui la rigueur scientifique, la réflexion stratégique et l'attention portée aux équipes procèdent d'une même exigence : comprendre pour mieux servir.
                </p>
                <p>
                  Nommé en mai 2026 Ministre de la Transformation digitale et de l'Innovation, en charge de la stratégie nationale de l'intelligence artificielle par le Président Romuald Wadagni, il a pour mission de conduire la feuille de route technologique au service des politiques publiques et privées, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif, un Bénin appelé à devenir exportateur de technologie. Derrière ces objectifs se tient une conviction simple : la technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.
                </p>
                <p>
                  Son parcours s'est construit à la croisée de la recherche et de l'action. Doublement diplômé, ingénieur et titulaire d'un master de l'Université de Technologie de Compiègne, il est docteur en intelligence artificielle de l'Université Toulouse III – Paul Sabatier (École Doctorale Mathématiques, Informatique et Télécommunications), et titulaire d'un mineur en philosophie des technologies cognitives, discipline qui l'a tôt amené à interroger le sens de ce qu'il construit. Son expertise couvre le management de l'innovation et de la recherche et développement, au service de la résolution de problématiques complexes à fort impact.
                </p>
                <p>
                  Fort de plus de quinze années d'expérience, il a dirigé des programmes d'innovation d'envergure dans des environnements exigeants, en conjuguant la vision stratégique et l'exécution opérationnelle de projets à grande échelle. De cette expérience, il a retenu une certitude mesurée : la recherche ne prend son sens qu'en redescendant vers le concret, là où se jouent la compétitivité des organisations et l'autonomie stratégique des nations.
                </p>
                <p>
                  Entrepreneur engagé, il est cofondateur de l'association iSheero, initiative panafricaine dédiée à la formation de compétences d'excellence en data science, data engineering et infrastructures cloud. Cet engagement procède d'une conviction plus personnelle : le souci de transmettre ce qu'il a mis des années à apprendre, et de contribuer à l'émergence d'une génération capable de répondre aux enjeux du continent.
                </p>
                <p>
                  Attaché au développement des talents, Mahuna Akplogan consacre son action à la transmission des savoirs et à l'édification d'écosystèmes durables, où se rejoignent l'excellence technologique, l'impact sociétal et la croissance des organisations. Au fond, ce qui guide sa démarche tient moins à l'ambition qu'à une forme de fidélité : au savoir, à ceux qui viennent, et à l'idée que la valeur d'une œuvre se mesure à l'empreinte qu'elle laisse.
                </p>
              </div>

              {/* Signature */}
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <p className="font-black text-anthracite text-base uppercase tracking-wide">
                  Mahuna Akplogan
                </p>
                <p className="text-xs text-anthracite/60 font-semibold uppercase tracking-wider mt-0.5">
                  Ministre de la Transformation Digitale et de l'Innovation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Parcours Timeline */}
        <section
          className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle"
          style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-14"
              style={{ color: VERT }}
            >
              Parcours
            </h2>

            <div className="relative">
              <div
                className="absolute left-[4.5rem] sm:left-[7rem] top-0 bottom-0 w-px"
                style={{ background: "rgba(0,0,0,0.10)" }}
              />

              <div className="flex flex-col gap-0">
                {parcours.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-6 sm:gap-12 pb-10 sm:pb-12 last:pb-0">
                    <div className="flex-shrink-0 w-12 sm:w-24 text-right pt-1">
                      <span
                        className="text-sm font-black tabular-nums"
                        style={{ color: VERT }}
                      >
                        {item.period}
                      </span>
                    </div>

                    <div className="absolute left-[calc(4.5rem-6px)] sm:left-[calc(7rem-6px)] top-[6px] flex items-center justify-center">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: VERT,
                          border: `2px solid ${VERT}`,
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pl-6">
                      <h3 className="text-anthracite font-black text-base uppercase leading-snug mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: "rgba(26,26,26,0.55)" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Priorités */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-10"
              style={{ color: VERT }}
            >
              Priorités ministérielles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "rgba(0,0,0,0.08)" }}>
              {priorities.map((p) => (
                <div
                  key={p.number}
                  className="group p-8 sm:p-10 bg-white hover:bg-gris-perle transition-colors"
                >
                  <div className="flex items-start gap-5 mb-6">
                    <span
                      className="text-5xl font-black leading-none tabular-nums flex-shrink-0"
                      style={{ color: p.accent, opacity: 0.3 }}
                    >
                      {p.number}
                    </span>
                    <div className="mt-1 flex-shrink-0" style={{ color: p.accent }}>
                      {p.icon}
                    </div>
                  </div>
                  <h3 className="text-anthracite font-black text-xl uppercase leading-snug mb-4">
                    {p.title}
                  </h3>
                  <p className="text-anthracite/50 text-sm font-medium leading-relaxed group-hover:text-anthracite/70 transition-colors">
                    {p.description}
                  </p>
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
                Écrire au<br />
                <span style={{ color: JAUNE }}>Ministre</span>
              </h2>
              <p className="mt-3 text-white/60 text-sm font-medium">
                Adressez directement votre message au cabinet du Ministre.
              </p>
            </div>
            <Link
              href="/ecrire-au-ministre"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase tracking-wider transition-all hover:gap-5"
              style={{ background: "white", color: VERT }}
            >
              Écrire au Ministre
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
