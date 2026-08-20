import { getDictionary, type Locale } from "../dictionaries";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccessibilitePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.accessibilite;
  const prefix = locale === "en" ? "/en" : "";

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
          </div>
        </section>

        {/* Engagement */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
              {t.engagement}
            </p>
          </div>
        </section>

        {/* 1. État de conformité */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              1. État de conformité
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
              Le site mtdi.gouv.bj vise une conformité au Référentiel Général d&apos;Amélioration de l&apos;Accessibilité (RGAA) / aux Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA.
            </p>
          </div>
        </section>

        {/* 2. Résultats des tests */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              2. Résultats des tests
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
              Un audit d&apos;accessibilité sera réalisé prochainement. Les résultats seront publiés sur cette page.
            </p>
          </div>
        </section>

        {/* 3. Contenus non accessibles */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              3. Contenus non accessibles
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed mb-6">
              À titre indicatif, points de vigilance à vérifier lors de l&apos;audit :
            </p>
            <ul className="flex flex-col gap-4">
              {[
                "Alternatives textuelles des images du carrousel d'accueil et des photos de la galerie",
                "Contraste des couleurs (texte sur fond image, notamment sur le bandeau héros)",
                "Navigation complète au clavier (menu, formulaire « Écrire au Ministre »)",
                "Sous-titrage des contenus vidéo (vidéothèque)",
                "Structure des titres et compatibilité avec les lecteurs d'écran",
                "Accessibilité des tableaux et indicateurs chiffrés",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-anthracite/70 text-sm font-medium leading-relaxed">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: JAUNE }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Établissement */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              4. Établissement de cette déclaration
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
              Cette déclaration a été établie en août 2026. Elle sera mise à jour après la réalisation de l&apos;audit d&apos;accessibilité.
            </p>
          </div>
        </section>

        {/* 5. Retour d'information */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              5. Retour d&apos;information et contact
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed mb-6">
              Si vous rencontrez une difficulté d&apos;accès à un contenu ou un service, vous pouvez contacter le Ministère pour être orienté vers une alternative accessible ou obtenir le contenu sous un autre format :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <p className="text-anthracite font-black text-sm uppercase mb-3">{t.formulaire}</p>
                <Link href={`${prefix}/ecrire-au-ministre`} className="text-sm font-semibold transition-colors hover:opacity-70" style={{ color: VERT }}>
                  Écrire au Ministre
                </Link>
              </div>
              <div className="p-8 bg-white" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
                <p className="text-anthracite font-black text-sm uppercase mb-3">{t.parCourriel}</p>
                <a href="mailto:mtdi.contact@gouv.bj" className="text-sm font-semibold transition-colors hover:opacity-70" style={{ color: VERT }}>
                  mtdi.contact@gouv.bj
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Voies de recours */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              6. Voies de recours
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed">
              Si vous constatez un défaut d&apos;accessibilité vous empêchant d&apos;accéder à un contenu ou une fonctionnalité du site et que vous n&apos;obtenez pas de réponse satisfaisante de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine aux autorités compétentes en matière d&apos;accessibilité numérique et de médiation administrative.
            </p>
          </div>
        </section>

        {/* 7. Amélioration continue */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: VERT }}>
              7. Amélioration continue
            </h2>
            <p className="text-anthracite/70 text-sm font-medium leading-relaxed mb-6">Le Ministère s&apos;engage à :</p>
            <ul className="flex flex-col gap-3">
              {[
                "Corriger progressivement les non-conformités identifiées",
                "Former les équipes en charge du site aux bonnes pratiques d'accessibilité",
                "Réévaluer la conformité du site à intervalles réguliers",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-anthracite/75 text-sm font-medium leading-relaxed">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: VERT }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>

      <Footer locale={locale} dict={dict.footer} />
    </>
  );
}
