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
  if (!hasPerm(session, "accueil.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT * FROM stats
    ORDER BY deleted_at NULLS FIRST, display_order ASC
  `;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "accueil.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { labelFr, labelEn, value, maxValue, unit, unitFrSingular, unitEn, unitEnSingular, noSpace, color, displayOrder, active } = await req.json();

  if (!labelFr) {
    return NextResponse.json({ error: "Le libellé (FR) est requis" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO stats (label_fr, label_en, value, max_value, unit, unit_fr_singular, unit_en, unit_en_singular, no_space, color, display_order, active, created_by)
    VALUES (${labelFr}, ${labelEn || null}, ${value ?? 0}, ${maxValue ?? 100}, ${unit || ""}, ${unitFrSingular || null}, ${unitEn || null}, ${unitEnSingular || null}, ${!!noSpace}, ${color || null}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "stats", resourceId: String(result.rows[0].id), details: { labelFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
