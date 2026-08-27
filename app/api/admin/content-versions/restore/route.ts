import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit, setSetting } from "@/lib/auth";
import { hasPerm, type PermissionCode } from "@/lib/permissions";
import { getVersionById, saveVersion } from "@/lib/content-versions";

export const dynamic = "force-dynamic";

// Contrairement à la consultation (permission "voir"), restaurer une
// ancienne version est un vrai acte de modification : ça exige la
// permission "gerer"/"modifier" du groupe concerné.
const TABLE_WRITE_PERMISSION: Record<string, PermissionCode> = {
  actualites: "actualites.modifier",
  static_pages: "ressources.gerer",
  settings: "ministere.gerer",
};

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const { versionId } = await req.json();
  if (!versionId) return NextResponse.json({ error: "versionId requis" }, { status: 400 });

  const version = await getVersionById(versionId);
  if (!version) return NextResponse.json({ error: "Version introuvable" }, { status: 404 });

  const requiredPerm = TABLE_WRITE_PERMISSION[version.table_name];
  if (!requiredPerm || !hasPerm(session, requiredPerm)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { table_name, record_id } = version;
  // Contenu délibérément dynamique : chaque table restaurée a sa propre
  // forme, il n'y a pas de type commun possible ici.
  const snapshot = version.snapshot as Record<string, any>;

  try {
    if (table_name === "actualites") {
      // Sauvegarde l'état actuel avant de le remplacer, pour pouvoir
      // annuler la restauration elle-même comme n'importe quelle modif.
      const current = await sql`SELECT * FROM actualites WHERE id = ${record_id}`;
      if (current.rows[0]) await saveVersion("actualites", record_id, current.rows[0], session.id);

      await sql`
        UPDATE actualites SET
          title_fr = ${snapshot.title_fr}, title_en = ${snapshot.title_en},
          excerpt_fr = ${snapshot.excerpt_fr}, excerpt_en = ${snapshot.excerpt_en},
          category_id = ${snapshot.category_id}, image = ${snapshot.image},
          href_external = ${snapshot.href_external}, published_at = ${snapshot.published_at},
          read_time = ${snapshot.read_time}, featured = ${snapshot.featured},
          display_order = ${snapshot.display_order}, status = ${snapshot.status},
          attachments = ${JSON.stringify(snapshot.attachments)}::jsonb,
          updated_at = now()
        WHERE id = ${record_id}
      `;
    } else if (table_name === "static_pages") {
      const current = await sql`SELECT * FROM static_pages WHERE slug = ${record_id}`;
      if (current.rows[0]) await saveVersion("static_pages", record_id, current.rows[0], session.id);

      await sql`
        UPDATE static_pages SET
          content_fr = ${snapshot.content_fr}, content_en = ${snapshot.content_en},
          published = ${snapshot.published}, updated_by = ${session.id}, updated_at = now()
        WHERE slug = ${record_id}
      `;
    } else if (table_name === "settings" && record_id === "ministre_bio") {
      const currentResult = await sql`SELECT value FROM settings WHERE key = 'ministre_bio'`;
      if (currentResult.rows[0]) await saveVersion("settings", "ministre_bio", currentResult.rows[0].value, session.id);

      await setSetting("ministre_bio", snapshot);
    } else {
      return NextResponse.json({ error: "Module non pris en charge pour la restauration" }, { status: 400 });
    }

    await logAudit({ userId: session.id, action: "modifier", module: table_name, resourceId: record_id, details: { action: "restauration_version", versionId }, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
