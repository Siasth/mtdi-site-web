import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type KitPresseItem = { id: number; title: string; description: string; type: string; href: string };

export async function getKitPresseItems(locale: Locale): Promise<KitPresseItem[]> {
  const result = await sql`SELECT * FROM kit_presse_items WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    type: r.type as string,
    href: r.href as string,
  }));
}
