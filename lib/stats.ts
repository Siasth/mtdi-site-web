import { sql } from "@/lib/db";

export type StatItem = { id: number; label: string; value: number; max: number; unit: string };

// Seuls les chiffres actifs (et non supprimés) apparaissent sur le site public.
export async function getPublicStats(locale: "fr" | "en"): Promise<StatItem[]> {
  const result = await sql`
    SELECT id, label_fr, label_en, value, max_value, unit
    FROM stats
    WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY display_order ASC
  `;
  return result.rows.map((r) => ({
    id: r.id as number,
    label: (locale === "en" && r.label_en ? r.label_en : r.label_fr) as string,
    value: Number(r.value),
    max: Number(r.max_value),
    unit: (r.unit as string) || "",
  }));
}
