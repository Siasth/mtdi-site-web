import { sql } from "@/lib/db";
export type LienUtile = { id: number; label: string; href: string };

export async function getLiensUtiles(): Promise<LienUtile[]> {
  const result = await sql`SELECT * FROM liens_utiles WHERE deleted_at IS NULL AND active = TRUE ORDER BY display_order ASC`;
  return result.rows.map((r) => ({ id: r.id as number, label: r.label as string, href: r.href as string }));
}
