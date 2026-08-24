import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type Direction = { id: number; acronym: string; type: string; name: string; director: string | null; description: string; accent: string };

export async function getDirections(locale: Locale): Promise<Direction[]> {
  const result = await sql`SELECT * FROM directions WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    acronym: r.acronym as string,
    type: ((locale === "en" && r.type_en ? r.type_en : r.type_fr) as string) || "",
    name: (locale === "en" && r.name_en ? r.name_en : r.name_fr) as string,
    director: (r.director as string) || null,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    accent: (r.accent as string) || "#162233",
  }));
}
