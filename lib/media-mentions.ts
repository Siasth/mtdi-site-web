import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type MediaMention = { id: number; type: string; typeColor: string; title: string; date: string; source: string; excerpt: string; url: string };

export async function getMediaMentions(locale: Locale): Promise<MediaMention[]> {
  const result = await sql`SELECT * FROM media_mentions WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    type: (locale === "en" && r.type_en ? r.type_en : r.type_fr) as string,
    typeColor: (r.type_color as string) || "ROUGE",
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    date: (r.date_label as string) || "",
    source: (r.source as string) || "",
    excerpt: ((locale === "en" && r.excerpt_en ? r.excerpt_en : r.excerpt_fr) as string) || "",
    url: r.url as string,
  }));
}
