import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type CabinetMember = { id: number; role: string; direction: string; description: string; accent: string; level: number };

export async function getCabinetMembers(locale: Locale): Promise<CabinetMember[]> {
  const result = await sql`SELECT * FROM cabinet_members WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    role: (locale === "en" && r.role_en ? r.role_en : r.role_fr) as string,
    direction: ((locale === "en" && r.direction_en ? r.direction_en : r.direction_fr) as string) || "",
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    accent: (r.accent as string) || "#162233",
    level: r.level as number,
  }));
}
