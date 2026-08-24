import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type TexteJuridique = { id: number; title: string; type: string; reference: string; date: string; status: string; description: string; articles: string; href: string };

export async function getTextesJuridiques(locale: Locale): Promise<TexteJuridique[]> {
  const result = await sql`SELECT * FROM textes_juridiques WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    type: ((locale === "en" && r.type_en ? r.type_en : r.type_fr) as string) || "",
    reference: (r.reference as string) || "",
    date: (r.date_label as string) || "",
    status: ((locale === "en" && r.status_en ? r.status_en : r.status_fr) as string) || "",
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    articles: ((locale === "en" && r.articles_en ? r.articles_en : r.articles_fr) as string) || "",
    href: r.href as string,
  }));
}
