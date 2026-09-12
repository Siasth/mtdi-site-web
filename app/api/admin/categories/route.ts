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
  if (!hasPerm(session, "categories.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT c.*, (SELECT COUNT(*) FROM actualites a WHERE a.category_id = c.id AND a.deleted_at IS NULL) AS usage_count
    FROM categories c
    ORDER BY c.deleted_at NULLS FIRST, c.display_order ASC
  `;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "categories.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { nameFr, nameEn, color, displayOrder } = await req.json();
  if (!nameFr) {
    return NextResponse.json({ error: "Le nom (FR) est requis" }, { status: 400 });
  }
  const result = await sql`
    INSERT INTO categories (name_fr, name_en, color, display_order)
    VALUES (${nameFr}, ${nameEn || null}, ${color || "#006828"}, ${displayOrder ?? 0})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "categories", resourceId: String(result.rows[0].id), details: { nameFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
