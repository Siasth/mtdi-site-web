import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { put } from "@vercel/blob";

// ============================================================================
// Purge périodique de l'historique + du journal d'audit : exporte les lignes
// de plus de 6 mois dans un fichier JSON (archive, rien n'est perdu), puis
// les retire des tables actives pour qu'elles restent petites et rapides.
//
// Volontairement PAS de vercel.json/cron Vercel : cette route est déclenchée
// par une simple requête HTTP, appelable par n'importe quel ordonnanceur
// externe (crontab classique, GitHub Actions programmé, cron-job.org...) —
// aucune dépendance à l'hébergeur pour le DÉCLENCHEMENT. Seul l'export lui
// -même utilise Vercel Blob (déjà utilisé partout ailleurs sur le site pour
// le stockage de fichiers).
//
// Appel : POST /api/admin/content-versions/archive
// Body  : { "secret": "..." }
// Protégée par CRON_SECRET (variable d'environnement dédiée, distincte de
// SETUP_SECRET — celle-ci est faite pour un usage répété et régulier,
// jamais retirée après coup).
// ============================================================================

const RETENTION_MONTHS = 6;

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
  const cutoffIso = cutoff.toISOString();

  try {
    const oldVersions = await sql`SELECT * FROM content_versions WHERE changed_at < ${cutoffIso}`;
    const oldLogs = await sql`SELECT * FROM audit_logs WHERE created_at < ${cutoffIso}`;

    if (oldVersions.rows.length === 0 && oldLogs.rows.length === 0) {
      return NextResponse.json({ ok: true, message: "Rien à archiver.", contentVersionsArchived: 0, auditLogsArchived: 0 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archive = {
      exportedAt: new Date().toISOString(),
      cutoff: cutoffIso,
      contentVersions: oldVersions.rows,
      auditLogs: oldLogs.rows,
    };

    await put(`archives/historique-${timestamp}.json`, JSON.stringify(archive, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    await sql`DELETE FROM content_versions WHERE changed_at < ${cutoffIso}`;
    await sql`DELETE FROM audit_logs WHERE created_at < ${cutoffIso}`;

    return NextResponse.json({
      ok: true,
      contentVersionsArchived: oldVersions.rows.length,
      auditLogsArchived: oldLogs.rows.length,
      archiveFile: `historique-${timestamp}.json`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
