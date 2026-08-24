import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type EService = { id: number; title: string; description: string; href: string; icon: string };

export async function getEServices(locale: Locale): Promise<EService[]> {
  const result = await sql`SELECT * FROM eservices WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    href: r.href as string,
    icon: (r.icon_key as string) || "document",
  }));
}
