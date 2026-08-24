import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type Opportunite = { id: number; type: string; title: string; description: string; href: string; deadline: string };

export async function getOpportunites(locale: Locale, type?: string): Promise<Opportunite[]> {
  const result = type
    ? await sql`SELECT * FROM opportunites WHERE deleted_at IS NULL AND active = TRUE AND type = ${type} ORDER BY display_order ASC`
    : await sql`SELECT * FROM opportunites WHERE deleted_at IS NULL AND active = TRUE ORDER BY type ASC, display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    type: r.type as string,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    href: (r.href as string) || "",
    deadline: (r.deadline_label as string) || "",
  }));
}
