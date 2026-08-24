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
    if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    await sql`UPDATE structures SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { acronym, nameFr, nameEn, descriptionFr, descriptionEn, missionsFr, missionsEn, url, accent, logoSrc, labelFr, labelEn, displayOrder, active } = body;
  await sql`
    UPDATE structures SET
      acronym = COALESCE(${acronym}, acronym), name_fr = COALESCE(${nameFr}, name_fr), name_en = ${nameEn ?? null},
      description_fr = COALESCE(${descriptionFr ? sanitizeRichText(descriptionFr) : null}, description_fr),
      description_en = ${descriptionEn ? sanitizeRichText(descriptionEn) : null},
      missions_fr = COALESCE(${missionsFr ? JSON.stringify(missionsFr) : null}::jsonb, missions_fr),
      missions_en = COALESCE(${missionsEn ? JSON.stringify(missionsEn) : null}::jsonb, missions_en),
      url = ${url ?? null}, accent = ${accent ?? null}, logo_src = ${logoSrc ?? null},
      label_fr = ${labelFr ?? null}, label_en = ${labelEn ?? null},
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "structures", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE structures SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "structures", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
