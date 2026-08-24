import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type VideoItem = { id: number; title: string; date: string; duration: string; source: string; url: string; color: string };

export async function getVideos(locale: Locale): Promise<VideoItem[]> {
  const result = await sql`SELECT * FROM videos WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    date: (r.date_label as string) || "",
    duration: (r.duration as string) || "",
    source: (r.source as string) || "",
    url: r.url as string,
    color: (r.color as string) || "#162233",
  }));
}
