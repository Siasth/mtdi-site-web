import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type DocumentItem = { id: number; title: string; category: string; type: string; date: string; description: string; href: string; featured: boolean };

export async function getDocuments(locale: Locale): Promise<DocumentItem[]> {
  const result = await sql`SELECT * FROM documents WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    category: r.category as string,
    type: (r.type as string) || "PDF",
    date: (r.date_label as string) || "",
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    href: r.href as string,
    featured: r.featured as boolean,
  }));
}
