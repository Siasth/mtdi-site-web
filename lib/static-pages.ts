import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type StaticPage = { slug: string; content: string; published: boolean };

export async function getStaticPage(slug: string, locale: Locale): Promise<StaticPage | null> {
  const result = await sql`SELECT * FROM static_pages WHERE slug = ${slug}`;
  const row = result.rows[0];
  if (!row) return null;
  return {
    slug: row.slug as string,
    content: ((locale === "en" && row.content_en ? row.content_en : row.content_fr) as string) || "",
    published: row.published as boolean,
  };
}

// ANO-146 : une page légale dépubliée depuis le back-office doit disparaître
// du footer public — sinon elle y reste accessible malgré la dépublication.
// Utilisé par l'API publique consommée par Footer.tsx.
export async function getPublishedLegalSlugs(): Promise<string[]> {
  const result = await sql`SELECT slug FROM static_pages WHERE published = TRUE`;
  return result.rows.map((r) => r.slug as string);
}
