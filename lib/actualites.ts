import { sql } from "@/lib/db";

export type ArticleStatus = "brouillon" | "publie" | "depublie" | "archive";

export type Actualite = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image: string | null;
  hrefExternal: string | null;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  displayOrder: number;
  status: ArticleStatus;
  // Signale au front qu'aucune traduction anglaise n'existe encore pour cet
  // article (utile pour un bandeau d'avertissement admin, ou pour prioriser
  // les traductions manquantes).
  isTranslated: boolean;
};

type Locale = "fr" | "en";

function mapRow(row: Record<string, unknown>, locale: Locale): Actualite {
  const titleEn = row.title_en as string | null;
  const excerptEn = row.excerpt_en as string | null;
  return {
    id: row.id as number,
    title: (locale === "en" && titleEn ? titleEn : (row.title_fr as string)),
    excerpt: (locale === "en" && excerptEn ? excerptEn : (row.excerpt_fr as string)) || "",
    category: row.category as string,
    image: (row.image as string) || null,
    hrefExternal: (row.href_external as string) || null,
    publishedAt: row.published_at as string,
    readTime: (row.read_time as string) || "3 min",
    featured: row.featured as boolean,
    displayOrder: row.display_order as number,
    status: row.status as ArticleStatus,
    isTranslated: !!titleEn,
  };
}

// Seuls les articles au statut "publié" apparaissent sur le site public —
// brouillon, dépublié et archivé restent invisibles pour les visiteurs mais
// consultables/modifiables depuis le back-office.
export async function getActualites(locale: Locale, limit?: number): Promise<Actualite[]> {
  const result = limit
    ? await sql`
        SELECT * FROM actualites
        WHERE deleted_at IS NULL AND status = 'publie'
        ORDER BY published_at DESC, display_order ASC
        LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM actualites
        WHERE deleted_at IS NULL AND status = 'publie'
        ORDER BY published_at DESC, display_order ASC
      `;
  return result.rows.map((r) => mapRow(r, locale));
}

export async function getFeaturedActualites(locale: Locale, limit = 3): Promise<Actualite[]> {
  const result = await sql`
    SELECT * FROM actualites
    WHERE deleted_at IS NULL AND status = 'publie' AND featured = TRUE
    ORDER BY display_order ASC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => mapRow(r, locale));
}
