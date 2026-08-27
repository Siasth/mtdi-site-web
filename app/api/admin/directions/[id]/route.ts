import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json();
  if (body.restore) {
    if (!hasPerm(session, "ministere.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    await sql`UPDATE directions SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "ministere.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { acronym, typeFr, typeEn, nameFr, nameEn, director, descriptionFr, descriptionEn, accent, displayOrder, active } = body;
  await sql`
    UPDATE directions SET
      acronym = COALESCE(${acronym}, acronym), type_fr = ${typeFr ?? null}, type_en = ${typeEn ?? null},
      name_fr = COALESCE(${nameFr}, name_fr), name_en = ${nameEn ?? null}, director = ${director ?? null},
      description_fr = COALESCE(${descriptionFr ? sanitizeRichText(descriptionFr) : null}, description_fr),
      description_en = ${descriptionEn ? sanitizeRichText(descriptionEn) : null},
      accent = ${accent ?? null}, display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "directions", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ministere.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE directions SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "directions", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
