import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type Partner = { id: number; category: string; name: string; full: string; description: string; accent: string; logoSrc: string | null };

export async function getPartners(locale: Locale): Promise<Partner[]> {
  const result = await sql`SELECT * FROM partners WHERE deleted_at IS NULL AND active = TRUE ORDER BY category ASC, display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    category: r.category as string,
    name: r.name as string,
    full: ((locale === "en" && r.full_en ? r.full_en : r.full_fr) as string) || "",
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    accent: (r.accent as string) || "#162233",
    logoSrc: (r.logo_src as string) || null,
  }));
}
