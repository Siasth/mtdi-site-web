import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT c.*, (SELECT COUNT(*) FROM galerie_items g WHERE g.collection_id = c.id AND g.deleted_at IS NULL) AS usage_count
    FROM galerie_collections c
    WHERE c.deleted_at IS NULL
    ORDER BY c.display_order ASC
  `;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { nameFr, nameEn, displayOrder } = await req.json();
  if (!nameFr) {
    return NextResponse.json({ error: "Le nom (FR) est requis" }, { status: 400 });
  }
  const result = await sql`
    INSERT INTO galerie_collections (name_fr, name_en, display_order)
    VALUES (${nameFr}, ${nameEn || null}, ${displayOrder ?? 0})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "galerie", resourceId: String(result.rows[0].id), details: { nameFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
