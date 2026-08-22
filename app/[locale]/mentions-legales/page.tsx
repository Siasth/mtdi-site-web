import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const VERT = "#162233";

const sections = [
  {
    title: "1. Éditeur du site",
    content: [
      "Le présent site, accessible à l'adresse gouv.bj, est édité par :",
      "Ministère de la Transformation Digitale et de l'Innovation (MTDI)\nRépublique du Bénin",
      "Directeur de la publication : le Ministre de la Transformation Digitale et de l'Innovation.",
    ],
  },
  {
    title: "2. Hébergement",
    content: [
      "Le site est hébergé par :",
      "Vercel Inc.\n340 S Lemon Ave #4133\nWalnut, CA 91789, États-Unis\nSite web : https://vercel.com — Contact : privacy@vercel.com",
    ],
  },
  {
    title: "3. Propriété intellectuelle",
    content: [
      "L'ensemble des contenus présents sur le site (textes, images, vidéos, logos, identité visuelle, arborescence) est la propriété du Ministère de la Transformation Digitale et de l'Innovation, sauf mention contraire. Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation préalable est interdite, à l'exception des contenus explicitement identifiés comme libres de réutilisation (open data, communiqués de presse destinés à la republication).",
      "Les photographies et vidéos peuvent être soumises à des droits détenus par des tiers (photographes, agences) ; leur réutilisation est soumise à autorisation.",
    ],
  },
  {
    title: "4. Liens hypertextes",
    content: [
      "Le site peut contenir des liens vers d'autres sites publics (gouv.bj, ASIN, ANIP, Présidence, Sèmè City, service-public.bj) ou vers les réseaux sociaux du Ministère. Le Ministère n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu.",
    ],
  },
  {
    title: "5. Disponibilité du site",
    content: [
      "Le Ministère s'efforce d'assurer l'accessibilité du site 24h/24 et 7j/7, sauf interruption pour maintenance, mise à jour ou cas de force majeure. Le Ministère ne saurait être tenu responsable des interruptions de service qui en résulteraient.",
    ],
  },
  {
    title: "6. Protection des données personnelles",
    content: [
      "Le traitement des données à caractère personnel collectées sur ce site (formulaire « Écrire au Ministre », inscription à la newsletter) est décrit dans la Politique de confidentialité, conformément à la Loi n° 2017-20 du 20 avril 2018 portant Code du numérique (Livre 5, relatif à la protection des données à caractère personnel et de la vie privée) et sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP) — apdp.bj.",
    ],
  },
  {
    title: "7. Droit applicable",
    content: [
      "Les présentes mentions légales sont soumises au droit béninois. Tout litige relatif à l'utilisation du site relève de la compétence des juridictions béninoises.",
    ],
  },
];

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.mentions;

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
          </div>
        </section>

        {/* Sections */}
        <ol className="list-none" role="list">
          {sections.map((section, i) => (
            <li key={section.title}>
              <section
                className={`px-4 sm:px-6 lg:px-8 py-16 ${i % 2 === 0 ? "bg-white" : "bg-gris-perle"}`}
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
                    {section.title}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {section.content.map((paragraph, j) => (
                      <p key={j} className="text-anthracite/70 text-sm font-medium leading-relaxed whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            </li>
          ))}
        </ol>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
