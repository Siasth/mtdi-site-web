import { sql } from "@/lib/db";

// Historique des modifications : enregistre un instantané du contenu AVANT
// chaque changement, pour pouvoir comparer les versions et revenir en
// arrière. Volontairement générique (table_name + record_id + snapshot
// JSON) pour pouvoir être branché sur n'importe quel module sans nouvelle
// table dédiée à chaque fois.

export async function saveVersion(
  tableName: string,
  recordId: string | number,
  snapshot: Record<string, unknown>,
  userId: number | null
): Promise<void> {
  await sql`
    INSERT INTO content_versions (table_name, record_id, snapshot, changed_by)
    VALUES (${tableName}, ${String(recordId)}, ${JSON.stringify(snapshot)}::jsonb, ${userId})
  `;
}

export type VersionRow = {
  id: number;
  snapshot: Record<string, unknown>;
  changed_at: string;
  changed_by_name: string | null;
};

// Les 30 dernières versions seulement : au-delà, direction l'archive (voir
// /api/admin/content-versions/archive), pas une liste qui grossit sans fin.
export async function getVersions(tableName: string, recordId: string | number): Promise<VersionRow[]> {
  const result = await sql`
    SELECT cv.id, cv.snapshot, cv.changed_at, u.name AS changed_by_name
    FROM content_versions cv
    LEFT JOIN users u ON u.id = cv.changed_by
    WHERE cv.table_name = ${tableName} AND cv.record_id = ${String(recordId)}
    ORDER BY cv.changed_at DESC
    LIMIT 30
  `;
  return result.rows as VersionRow[];
}

export async function getVersionById(versionId: number): Promise<VersionRow & { table_name: string; record_id: string } | null> {
  const result = await sql`
    SELECT cv.id, cv.table_name, cv.record_id, cv.snapshot, cv.changed_at, u.name AS changed_by_name
    FROM content_versions cv
    LEFT JOIN users u ON u.id = cv.changed_by
    WHERE cv.id = ${versionId}
  `;
  return (result.rows[0] as (VersionRow & { table_name: string; record_id: string })) || null;
}
