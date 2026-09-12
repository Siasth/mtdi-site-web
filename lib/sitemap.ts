import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type SitemapSection = { id: number; title: string; links: { id: number; label: string; href: string }[] };

export async function getSitemapSections(locale: Locale): Promise<SitemapSection[]> {
  const sections = await sql`SELECT * FROM sitemap_sections WHERE active = TRUE AND deleted_at IS NULL ORDER BY display_order ASC`;
  const links = await sql`SELECT * FROM sitemap_links WHERE active = TRUE AND deleted_at IS NULL ORDER BY display_order ASC`;
  return sections.rows.map((s) => ({
    id: s.id as number,
    title: (locale === "en" && s.title_en ? s.title_en : s.title_fr) as string,
    links: links.rows
      .filter((l) => l.section_id === s.id)
      .map((l) => ({
        id: l.id as number,
        label: (locale === "en" && l.label_en ? l.label_en : l.label_fr) as string,
        href: l.href as string,
      })),
  }));
}

// Suggestion de base régénérable depuis le back-office : les routes connues
// du site, utilisées pour repeupler le plan du site si l'admin le demande.
export const SITEMAP_SUGGESTION: { titleFr: string; titleEn: string; links: { labelFr: string; labelEn: string; href: string }[] }[] = [
  { titleFr: "Accueil", titleEn: "Home", links: [{ labelFr: "Page d'accueil", labelEn: "Homepage", href: "/" }] },
  {
    titleFr: "Actualités & Médias", titleEn: "News & Media",
    links: [
      { labelFr: "Actualités", labelEn: "News", href: "/actualites" },
      { labelFr: "Galerie photos", labelEn: "Photo gallery", href: "/galerie" },
      { labelFr: "Vidéothèque", labelEn: "Video library", href: "/videotheque" },
      { labelFr: "MTDI dans les médias", labelEn: "MTDI in the media", href: "/medias/mtdi-dans-les-medias" },
      { labelFr: "Documenthèque", labelEn: "Document library", href: "/documentheque" },
      { labelFr: "Kit presse", labelEn: "Press kit", href: "/kit-presse" },
      { labelFr: "En direct", labelEn: "Live", href: "/direct" },
    ],
  },
  {
    titleFr: "Le Ministère", titleEn: "The Ministry",
    links: [
      { labelFr: "Le Ministre", labelEn: "The Minister", href: "/le-ministere/le-ministre" },
      { labelFr: "Organigramme", labelEn: "Organizational chart", href: "/le-ministere/organigramme" },
      { labelFr: "Directions centrales", labelEn: "Central departments", href: "/le-ministere/directions" },
      { labelFr: "Cabinet", labelEn: "Cabinet", href: "/le-ministere/cabinet" },
      { labelFr: "Missions & attributions", labelEn: "Missions & responsibilities", href: "/le-ministere/missions" },
      { labelFr: "Structures sous tutelle", labelEn: "Supervised agencies", href: "/le-ministere/structures" },
      { labelFr: "Partenaires", labelEn: "Partners", href: "/le-ministere/partenaires" },
      { labelFr: "Écrire au Ministre", labelEn: "Write to the Minister", href: "/ecrire-au-ministre" },
    ],
  },
  {
    titleFr: "Stratégie IA", titleEn: "AI Strategy",
    links: [
      { labelFr: "Stratégie nationale", labelEn: "National strategy", href: "/strategie-ia" },
      { labelFr: "Initiatives", labelEn: "Initiatives", href: "/strategie-ia/initiatives" },
      { labelFr: "Olympiades IA", labelEn: "AI Olympiad", href: "/strategie-ia/olympiades-ia" },
    ],
  },
  {
    titleFr: "Ressources", titleEn: "Resources",
    links: [
      { labelFr: "Textes juridiques", labelEn: "Legal texts", href: "/textes-juridiques" },
      { labelFr: "e-Services", labelEn: "e-Services", href: "/e-services" },
    ],
  },
  {
    titleFr: "Participer", titleEn: "Get involved",
    links: [{ labelFr: "Emplois, stages & appels d'offres", labelEn: "Jobs, internships & tenders", href: "/participer" }],
  },
  { titleFr: "Contact", titleEn: "Contact", links: [{ labelFr: "Nous contacter", labelEn: "Contact us", href: "/contact" }] },
  {
    titleFr: "Informations légales", titleEn: "Legal information",
    links: [
      { labelFr: "Mentions légales", labelEn: "Legal notice", href: "/mentions-legales" },
      { labelFr: "Politique de confidentialité", labelEn: "Privacy policy", href: "/confidentialite" },
      { labelFr: "Accessibilité", labelEn: "Accessibility", href: "/accessibilite" },
      { labelFr: "Plan du site", labelEn: "Sitemap", href: "/plan-du-site" },
    ],
  },
];
