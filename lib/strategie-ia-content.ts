import { sql } from "@/lib/db";
type Locale = "fr" | "en";

export type Pilier = { id: number; title: string; description: string; icon: string };
export type Jalon = { id: number; year: string; title: string; description: string; done: boolean };
export type OlympiadeEdition = { id: number; year: string; title: string; description: string; highlight: string };

export async function getPiliers(locale: Locale): Promise<Pilier[]> {
  const result = await sql`SELECT * FROM ia_piliers WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    icon: (r.icon_key as string) || "shield-check",
  }));
}

export async function getJalons(locale: Locale): Promise<Jalon[]> {
  const result = await sql`SELECT * FROM ia_jalons WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    year: r.year as string,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    done: r.done as boolean,
  }));
}

export async function getOlympiadeEditions(locale: Locale): Promise<OlympiadeEdition[]> {
  const result = await sql`SELECT * FROM ia_olympiades_editions WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    year: r.year as string,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    highlight: ((locale === "en" && r.highlight_en ? r.highlight_en : r.highlight_fr) as string) || "",
  }));
}

export async function getOlympiadeCriteres(locale: Locale): Promise<string[]> {
  const result = await sql`SELECT * FROM ia_criteres WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => (locale === "en" && r.text_en ? r.text_en : r.text_fr) as string);
}
