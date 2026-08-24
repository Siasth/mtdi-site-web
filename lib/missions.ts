import { sql } from "@/lib/db";
type Locale = "fr" | "en";

export async function getMissions(locale: Locale): Promise<string[]> {
  const result = await sql`SELECT * FROM missions WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ((locale === "en" && r.text_en ? r.text_en : r.text_fr) as string));
}
