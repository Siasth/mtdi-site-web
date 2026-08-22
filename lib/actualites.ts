import { sql } from "@/lib/db";

export type ArticleStatus = "brouillon" | "publie" | "depublie" | "archive";

export type Actualite = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  image: string | null;
  hrefExternal: string | null;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  displayOrder: number;
  status: ArticleStatus;
  isTranslated: boolean;
};

type Locale = "fr" | "en";

function mapRow(row: Record<string, unknown>, locale: Locale): Actualite {
  const titleEn = row.title_en as string | null;
  const excerptEn = row.excerpt_en as string | null;
  const catNameEn = row.cat_name_en as string | null;
  return {
    id: row.id as number,
    title: (locale === "en" && titleEn ? titleEn : (row.title_fr as string)),
    excerpt: (locale === "en" && excerptEn ? excerptEn : (row.excerpt_fr as string)) || "",
    category: (locale === "en" && catNameEn ? catNameEn : (row.cat_name_fr as string)) || (row.category as string) || "",
    categoryColor: (row.cat_color as string) || "#006828",
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
        SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
        FROM actualites a
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.deleted_at IS NULL AND a.status = 'publie'
        ORDER BY a.published_at DESC, a.display_order ASC
        LIMIT ${limit}
      `
    : await sql`
        SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
        FROM actualites a
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.deleted_at IS NULL AND a.status = 'publie'
        ORDER BY a.published_at DESC, a.display_order ASC
      `;
  return result.rows.map((r) => mapRow(r, locale));
}

export async function getFeaturedActualites(locale: Locale, limit = 8): Promise<Actualite[]> {
  const result = await sql`
    SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
    FROM actualites a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.deleted_at IS NULL AND a.status = 'publie' AND a.featured = TRUE
    ORDER BY a.display_order ASC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => mapRow(r, locale));
}
