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
