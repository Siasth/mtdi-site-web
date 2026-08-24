import { sql } from "@/lib/db";
type Locale = "fr" | "en";
export type ContactSpecifique = { id: number; role: string; name: string; email: string; phone: string; note: string; accent: string };

export async function getContactsSpecifiques(locale: Locale): Promise<ContactSpecifique[]> {
  const result = await sql`SELECT * FROM contacts_specifiques WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({
    id: r.id as number,
    role: (locale === "en" && r.role_en ? r.role_en : r.role_fr) as string,
    name: (locale === "en" && r.name_en ? r.name_en : r.name_fr) as string,
    email: r.email as string,
    phone: (r.phone as string) || "",
    note: ((locale === "en" && r.note_en ? r.note_en : r.note_fr) as string) || "",
    accent: (r.accent as string) || "#006828",
  }));
}
