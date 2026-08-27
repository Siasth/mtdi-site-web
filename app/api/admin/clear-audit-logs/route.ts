import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ============================================================================
// Route à USAGE UNIQUE : vide entièrement le journal d'audit. Protégée par
// SETUP_SECRET (même mécanisme que /api/admin/setup) — jamais exposée comme
// bouton dans l'interface, pour éviter qu'elle serve à effacer des traces
// en production. À utiliser uniquement pour repartir propre en pré-prod.
//
// Appel : POST /api/admin/clear-audit-logs
// Body  : { "secret": "..." }
// ============================================================================

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const before = await sql`SELECT COUNT(*) AS count FROM audit_logs`;
  await sql`TRUNCATE TABLE audit_logs`;

  return NextResponse.json({ ok: true, entriesDeleted: Number(before.rows[0].count) });
}
