import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type Structure = {
  id: number; acronym: string; name: string; description: string;
  missions: string[]; url: string; accent: string; logoSrc: string | null; label: string;
};

export async function getStructures(locale: Locale): Promise<Structure[]> {
  const result = await sql`SELECT * FROM structures WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    acronym: r.acronym as string,
    name: (locale === "en" && r.name_en ? r.name_en : r.name_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    missions: ((locale === "en" && (r.missions_en as string[])?.length ? r.missions_en : r.missions_fr) as string[]) || [],
    url: (r.url as string) || "",
    accent: (r.accent as string) || "#162233",
    logoSrc: (r.logo_src as string) || null,
    label: ((locale === "en" && r.label_en ? r.label_en : r.label_fr) as string) || "",
  }));
}
