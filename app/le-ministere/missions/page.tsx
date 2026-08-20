import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";
const ROUGE = "#EB0000";

const missions = [
  "Élaborer les politiques sectorielles et exécuter les stratégies liées à l'agenda numérique de l'État",
  "Favoriser le développement des infrastructures, des usages et des contenus numériques par les technologies innovantes",
  "Intégrer les technologies numériques dans les structures de l'État pour améliorer la performance, l'accessibilité, la transparence et l'efficacité des services publics",
  "Promouvoir la transformation digitale des entreprises",
  "Mettre en place l'infrastructure numérique de collecte, de transport et de distribution de la télévision et de la radiodiffusion",
  "Conduire des études prospectives et formuler des recommandations sur les projets numériques de l'État",
  "Promouvoir les communications électroniques et les services numériques innovants en partenariat avec les autorités de régulation",
  "Assurer la gestion optimale des licences et des ressources de l'État",
  "Établir un cadre législatif et réglementaire favorable au développement du numérique",
  "Réduire la fracture numérique entre les régions et les populations",
  "Promouvoir les compétences numériques et l'entrepreneuriat digital",
  "Lutter contre les déchets électroniques en coordination avec les agences environnementales",
  "Instaurer des mécanismes durables de confiance numérique",
  "Développer les partenariats avec le secteur privé et les institutions internationales",
  "Représenter le Bénin dans les instances internationales de gouvernance du numérique",
  "Accompagner les médias publics et privés dans leur transition numérique",
  "Renforcer la qualité du paysage audiovisuel",
];


export default function MissionsPage() {
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
              Missions &<br />
              <span style={{ color: JAUNE }}>Attributions</span>
            </h1>

            <p className="mt-6 text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              Les missions conférées au Ministère de la Transformation Digitale et de l'Innovation
              par décret du Président de la République.
            </p>
          </div>
        </section>

        {/* Missions */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: VERT }}
            >
              Attributions
            </h2>
            <p className="text-anthracite/60 text-sm font-medium mb-10">
              Conception, suivi et évaluation de la politique générale de l'État en matière de communications électroniques, de développement numérique et de transformation digitale.
            </p>

            <div className="flex flex-col gap-0">
              {missions.map((mission, i) => (
                <div
                  key={i}
                  className="flex items-start gap-5 py-6"
                  style={{ borderBottom: i < missions.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <span
                    className="text-2xl font-black leading-none tabular-nums flex-shrink-0 w-8 text-right"
                    style={{ color: VERT, opacity: 0.25 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
                    {mission}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </>
  );
}
