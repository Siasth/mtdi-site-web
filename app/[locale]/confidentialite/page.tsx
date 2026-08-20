import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const VERT = "#162233";
const JAUNE = "#FFBE00";

type Section = {
  number: string;
  title: string;
  paragraphs: string[];
  list?: string[];
  paragraphs_after?: string[];
};

const sections: Section[] = [
  {
    number: "01",
    title: "Responsable du traitement",
    paragraphs: ["Le responsable des traitements de données réalisés via ce site est le Ministère de la Transformation Digitale et de l'Innovation."],
  },
  {
    number: "02",
    title: "Données collectées",
    paragraphs: ["Les données collectées varient selon les fonctionnalités utilisées :"],
    list: [
      "Formulaire « Écrire au Ministre » : nom, prénom, courriel, objet, message — pour le traitement et suivi de la correspondance citoyenne",
      "Abonnement à la newsletter : nom, prénom et adresse courriel — pour l'envoi des actualités du Ministère",
      "Navigation générale : données de connexion techniques (adresse IP, pages consultées, navigateur) — pour la mesure d'audience, la sécurité et l'amélioration du service",
    ],
    paragraphs_after: ["Le site ne collecte aucune donnée sensible (santé, opinions politiques, religieuses, etc.)."],
  },
  {
    number: "03",
    title: "Base légale et finalités",
    paragraphs: ["Les traitements reposent selon les cas sur :"],
    list: [
      "L'exécution d'une mission de service public (réponse aux sollicitations citoyennes)",
      "Le consentement (inscription volontaire à la newsletter)",
      "L'intérêt légitime du Ministère (statistiques de fréquentation anonymisées, sécurité du site)",
    ],
  },
  {
    number: "04",
    title: "Durée de conservation",
    paragraphs: [],
    list: [
      "Correspondance via « Écrire au Ministre » : conservée à compter du dernier échange",
      "Adresses courriel newsletter : conservées jusqu'au désabonnement",
      "Journaux techniques de connexion : conservés 12 mois maximum",
    ],
  },
  {
    number: "05",
    title: "Destinataires des données",
    paragraphs: [
      "Les données sont destinées aux seuls agents habilités du Ministère et, le cas échéant, à ses prestataires techniques (hébergement, envoi d'e-mails), tenus à des obligations de confidentialité équivalentes. Aucune donnée n'est vendue ni cédée à des fins commerciales.",
      "Certains prestataires techniques (hébergement du site) peuvent être situés hors du Bénin. Dans ce cas, le Ministère s'assure que des garanties appropriées de protection sont en place, conformément aux exigences du Code du numérique en matière de transfert de données hors du territoire national.",
    ],
  },
  {
    number: "06",
    title: "Cookies et traceurs",
    paragraphs: [
      "Le site peut utiliser des cookies strictement nécessaires à son fonctionnement ainsi que, le cas échéant, des cookies de mesure d'audience.",
      "Le Ministère n'utilise aucun cookie publicitaire ni traceur à des fins commerciales.",
    ],
  },
  {
    number: "07",
    title: "Vos droits",
    paragraphs: [
      "Conformément au Code du numérique, vous disposez d'un droit d'accès, de rectification, d'opposition, de limitation et d'effacement des données vous concernant.",
      "Vous disposez également du droit d'introduire une réclamation auprès de l'Autorité de Protection des Données Personnelles (APDP) — apdp.bj.",
    ],
  },
  {
    number: "08",
    title: "Sécurité",
    paragraphs: ["Le Ministère met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte ou l'altération, en lien avec l'Agence Nationale de Sécurité des Systèmes d'Information (ANSSI-Bénin)."],
  },
  {
    number: "09",
    title: "Mineurs",
    paragraphs: ["Le site n'est pas destiné à collecter sciemment des données de mineurs sans le consentement d'un titulaire de l'autorité parentale."],
  },
  {
    number: "10",
    title: "Modification de la politique",
    paragraphs: ["Cette politique peut être mise à jour pour refléter des évolutions légales ou fonctionnelles. La date de dernière mise à jour figure en haut de page."],
  },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConfidentialitePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.confidentialite;

  return (
    <>
      <Navbar locale={locale} dict={dict.nav} />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section className="pt-14 pb-12 px-4 sm:px-6 lg:px-8" style={{ background: VERT }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              {t.titre}
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              {t.sousTitre}
            </p>
            <p className="mt-3 text-white/75 text-xs font-medium uppercase tracking-wider">
              {t.majDate}
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-anthracite/75 text-sm font-medium leading-relaxed">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section, i) => (
          <section
            key={section.number}
            className={`px-4 sm:px-6 lg:px-8 py-16 ${i % 2 === 0 ? "bg-gris-perle" : "bg-white"}`}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-2xl font-black" style={{ color: JAUNE }}>{section.number}</span>
                <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: VERT }}>{section.title}</h2>
              </div>

              <div className="flex flex-col gap-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-anthracite/70 text-sm font-medium leading-relaxed whitespace-pre-line">{p}</p>
                ))}

                {section.list && (
                  <ul className="flex flex-col gap-3 pl-1">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex gap-3 text-anthracite/70 text-sm font-medium leading-relaxed">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: JAUNE }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.paragraphs_after?.map((p, j) => (
                  <p key={`after-${j}`} className="text-anthracite/70 text-sm font-medium leading-relaxed whitespace-pre-line">{p}</p>
                ))}
              </div>
            </div>
          </section>
        ))}

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
