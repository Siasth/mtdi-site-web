import { getDictionary, type Locale } from "../../dictionaries";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const VERT = "#162233";
const JAUNE = "#FFBE00";

const directionsData = [
  {
    type: "Direction centrale",
    acronym: "DPAF",
    name: "Direction de la Programmation, de l'Administration et des Finances",
    description: "Assure la programmation, la gestion administrative et financière du ministère. Supervise le budget, les ressources humaines, les marchés publics et la logistique.",
    accent: VERT,
  },
  {
    type: "Direction centrale",
    acronym: "DSI",
    name: "Direction des Systèmes d'Information",
    director: "Pontien DEGUENON",
    description: "La Direction des Systèmes d'Information veille à garantir l'alignement du système d'information du ministère avec la politique nationale. Elle est chargée de définir et superviser la politique de système d'information et sa mise en œuvre, définir les orientations stratégiques IT du Ministère, garantir la sécurité informatique, la fiabilité, la confidentialité et l'intégrité des systèmes d'information.",
    accent: VERT,
  },
  {
    type: "Direction technique",
    acronym: "DN",
    name: "Direction du Numérique",
    director: "Geoffroy BONOU",
    description: "La Direction du Numérique est chargée d'élaborer la politique de développement des infrastructures, des usages et des contenus numériques. Elle contribue au pilotage de la stratégie nationale de développement des infrastructures haut débit et très haut débit, veille à la mise en place des infrastructures numériques de télévision et radio, promeut les communications électroniques et incite au développement de l'industrie dans le domaine de l'économie numérique.",
    accent: "#7A5800",
  },
  {
    type: "Direction technique",
    acronym: "DD",
    name: "Direction de la Digitalisation",
    director: "Boris Rodrigue SEHLOUAN Y.M.",
    description: "La Direction de la Digitalisation est chargée de superviser la mise en œuvre du programme de gouvernance électronique de l'État par l'usage des TIC dans l'administration et la dématérialisation des services publics. Elle promeut la transformation digitale des entreprises, contribue au développement des compétences numériques et à la promotion de l'entrepreneuriat numérique, et contribue à l'élaboration de la politique de sécurité numérique et à la mise en œuvre de la stratégie nationale de cybersécurité.",
    accent: "#7A5800",
  },
  {
    type: "Direction technique",
    acronym: "DM",
    name: "Direction des Médias",
    description: "La Direction des Médias est chargée de la politique audiovisuelle et de la transition numérique des médias publics et privés.",
    accent: "#EB0000",
  },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DirectionsCentralesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.ministere.directions;

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
              Directions<br />
              <span style={{ color: JAUNE }}>centrales</span>
            </h1>
          </div>
        </section>

        {/* Directions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-10" style={{ color: VERT }}>
              {t.directionsMinistere}
            </h2>
            <div className="flex flex-col gap-0">
              {directionsData.map((dir, i) => (
                <div
                  key={dir.acronym}
                  className="py-8"
                  style={{ borderBottom: i < directionsData.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: dir.accent, color: dir.accent === "#EB0000" || dir.accent === VERT || dir.accent === "#7A5800" ? "white" : "#1a1a1a" }}
                    >
                      {dir.acronym}
                    </span>
                    <span className="text-xs font-medium text-anthracite/65">{dir.type}</span>
                  </div>
                  <h3 className="text-anthracite font-black text-lg uppercase leading-snug mb-2">{dir.name}</h3>
                  {"director" in dir && dir.director && (
                    <p className="text-xs font-semibold text-anthracite/65 mb-4">
                      {t.directeur} {dir.director}
                    </p>
                  )}
                  <p className="text-anthracite/75 text-sm font-medium leading-relaxed max-w-3xl">{dir.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
