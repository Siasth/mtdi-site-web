import { sql } from "@/lib/db";

export type ArticleStatus = "brouillon" | "publie" | "depublie" | "archive";

export type Attachment = { name: string; url: string; kind?: "file" | "link" };

export type Actualite = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  categoryId: number | null;
  image: string | null;
  hrefExternal: string | null;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  displayOrder: number;
  status: ArticleStatus;
  attachments: Attachment[];
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
    categoryId: (row.category_id as number) ?? null,
    image: (row.image as string) || null,
    hrefExternal: (row.href_external as string) || null,
    publishedAt: row.published_at as string,
    readTime: (row.read_time as string) || "3 min",
    featured: row.featured as boolean,
    displayOrder: row.display_order as number,
    status: row.status as ArticleStatus,
    attachments: (row.attachments as Attachment[]) || [],
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
        WHERE a.deleted_at IS NULL AND a.status = 'publie' AND (a.scheduled_at IS NULL OR a.scheduled_at <= now())
        ORDER BY a.published_at DESC, a.display_order ASC
        LIMIT ${limit}
      `
    : await sql`
        SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
        FROM actualites a
        LEFT JOIN categories c ON c.id = a.category_id
        WHERE a.deleted_at IS NULL AND a.status = 'publie' AND (a.scheduled_at IS NULL OR a.scheduled_at <= now())
        ORDER BY a.published_at DESC, a.display_order ASC
      `;
  return result.rows.map((r) => mapRow(r, locale));
}

// Un seul article publié, par id (page de détail interne).
// ANO-140 : permet de distinguer un ID qui n'existe pas du tout (vraie 404)
// d'un article existant mais non publié (message spécifique côté page).
export async function actualiteExistsButUnpublished(id: number): Promise<boolean> {
  const result = await sql`SELECT id FROM actualites WHERE id = ${id} AND deleted_at IS NULL`;
  return result.rows.length > 0;
}

export async function getActualiteById(id: number, locale: Locale): Promise<Actualite | null> {
  const result = await sql`
    SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
    FROM actualites a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.id = ${id} AND a.deleted_at IS NULL AND a.status = 'publie' AND (a.scheduled_at IS NULL OR a.scheduled_at <= now())
  `;
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0], locale);
}

// Articles de la même catégorie (pour la colonne "Articles similaires").
export async function getRelatedActualites(articleId: number, categoryId: number | null, locale: Locale, limit = 4): Promise<Actualite[]> {
  if (!categoryId) return [];
  const result = await sql`
    SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
    FROM actualites a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.deleted_at IS NULL AND a.status = 'publie' AND (a.scheduled_at IS NULL OR a.scheduled_at <= now()) AND a.category_id = ${categoryId} AND a.id != ${articleId}
    ORDER BY a.published_at DESC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => mapRow(r, locale));
}

export async function getFeaturedActualites(locale: Locale, limit = 8): Promise<Actualite[]> {
  const result = await sql`
    SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
    FROM actualites a
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.deleted_at IS NULL AND a.status = 'publie' AND (a.scheduled_at IS NULL OR a.scheduled_at <= now()) AND a.featured = TRUE
    ORDER BY a.display_order ASC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => mapRow(r, locale));
}
