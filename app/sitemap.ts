import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mtdi-site-beige.vercel.app";

// Pages statiques du site (hors organigramme/plan-du-site qui n'apportent
// rien de plus au référencement que leurs pages sources).
const STATIC_PATHS = [
  "", "actualites", "galerie", "videotheque", "medias/mtdi-dans-les-medias",
  "documentheque", "textes-juridiques", "kit-presse", "direct",
  "le-ministere/le-ministre", "le-ministere/organigramme", "le-ministere/directions",
  "le-ministere/cabinet", "le-ministere/missions", "le-ministere/structures", "le-ministere/partenaires",
  "strategie-ia", "strategie-ia/initiatives", "strategie-ia/olympiades-ia",
  "contact", "participer", "e-services", "ecrire-au-ministre",
  "mentions-legales", "confidentialite", "accessibilite", "plan-du-site",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    const frUrl = `${SITE_URL}/${path}`;
    const enUrl = `${SITE_URL}/en${path ? "/" + path : ""}`;
    entries.push({
      url: frUrl,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.7,
      alternates: { languages: { fr: frUrl, en: enUrl } },
    });
  }

  // Articles publiés : contenu le plus susceptible de bénéficier d'une
  // indexation fine (actualités, communiqués...).
  try {
    const articles = await sql`
      SELECT id, published_at FROM actualites
      WHERE deleted_at IS NULL AND status = 'publie' AND (scheduled_at IS NULL OR scheduled_at <= now()) AND href_external IS NULL
      ORDER BY published_at DESC
      LIMIT 500
    `;
    for (const a of articles.rows) {
      entries.push({
        url: `${SITE_URL}/actualites/${a.id}`,
        lastModified: a.published_at ? new Date(a.published_at as string) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            fr: `${SITE_URL}/actualites/${a.id}`,
            en: `${SITE_URL}/en/actualites/${a.id}`,
          },
        },
      });
    }
  } catch {
    // Si la base n'est pas joignable au moment de la génération, on renvoie
    // au moins les pages statiques plutôt que de faire échouer tout le sitemap.
  }

  return entries;
}
