import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const VERT = "#162233";
const JAUNE = "#FFBE00";

const sitemapSections = [
  {
    title: "Accueil",
    links: [
      { label: "Page d'accueil", href: "/" },
    ],
  },
  {
    title: "Actualités & Médias",
    links: [
      { label: "Actualités", href: "/actualites" },
      { label: "Galerie photos", href: "/galerie" },
      { label: "Vidéothèque", href: "/videotheque" },
      { label: "MTDI dans les médias", href: "/medias/mtdi-dans-les-medias" },
    ],
  },
  {
    title: "Le Ministère",
    links: [
      { label: "Le Ministre", href: "/le-ministere/le-ministre" },
      { label: "Organigramme", href: "/le-ministere/organigramme" },
      { label: "Directions centrales", href: "/le-ministere/directions" },
      { label: "Cabinet", href: "/le-ministere/cabinet" },
      { label: "Missions & attributions", href: "/le-ministere/missions" },
      { label: "Structures sous tutelle", href: "/le-ministere/structures" },
      { label: "Partenaires", href: "/le-ministere/partenaires" },
      { label: "Écrire au Ministre", href: "/ecrire-au-ministre" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Documenthèque", href: "/documentheque" },
      { label: "Textes & cadre juridique", href: "/textes-juridiques" },
      { label: "E-Services publics", href: "/e-services" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Nous contacter", href: "/contact" },
    ],
  },
  {
    title: "Informations légales",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Accessibilité", href: "/accessibilite" },
      { label: "Plan du site", href: "/plan-du-site" },
    ],
  },
];

export default function PlanDuSitePage() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "80px" }}>

        {/* Hero */}
        <section
          className="pt-14 pb-12 px-4 sm:px-6 lg:px-8"
          style={{ background: VERT }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none tracking-tight text-white">
              Plan du Site
            </h1>
            <p className="mt-4 text-white/60 text-sm font-semibold uppercase tracking-widest">
              Toutes les pages du site gouv.bj
            </p>
          </div>
        </section>

        {/* Sitemap grid */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sitemapSections.map((section) => (
                <div
                  key={section.title}
                  className="p-8 bg-gris-perle"
                  style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h2
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: VERT }}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-sm font-medium text-anthracite/60 hover:text-anthracite transition-colors"
                        >
                          <svg
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                          <span className="group-hover:translate-x-1 transition-transform">
                            {link.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* External links */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gris-perle" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-xs font-black uppercase tracking-widest mb-8"
              style={{ color: VERT }}
            >
              Liens externes
            </h2>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Sèmè City", href: "https://semecity.bj/" },
                { label: "ANIP", href: "https://eservices.anip.bj/" },
                { label: "e-pme", href: "https://epme.adpme.bj/" },
                { label: "e-services", href: "https://service-public.bj/" },
                { label: "e-visa", href: "https://evisa.bj/" },
                { label: "Centre de services", href: "https://cds.asin.bj/" },
                { label: "ASIN", href: "https://asin.bj/" },
                { label: "APDP", href: "https://service.apdp.bj/" },
                { label: "Présidence de la République", href: "https://presidence.bj/" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white text-sm font-semibold text-anthracite/60 hover:text-anthracite transition-colors"
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {link.label}
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
