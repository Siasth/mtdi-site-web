import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json();

  if (body.restore) {
    if (!hasPerm(session, "stats.gerer")) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }
    await sql`UPDATE stats SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "stats", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (!hasPerm(session, "stats.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { labelFr, labelEn, value, maxValue, unit, unitFrSingular, unitEn, unitEnSingular, noSpace, displayOrder, active } = body;

  await sql`
    UPDATE stats SET
      label_fr = COALESCE(${labelFr}, label_fr),
      label_en = ${labelEn ?? null},
      value = COALESCE(${value}, value),
      max_value = COALESCE(${maxValue}, max_value),
      unit = COALESCE(${unit}, unit),
      unit_fr_singular = ${unitFrSingular ?? null},
      unit_en = ${unitEn ?? null},
      unit_en_singular = ${unitEnSingular ?? null},
      no_space = COALESCE(${noSpace}, no_space),
      display_order = COALESCE(${displayOrder}, display_order),
      active = COALESCE(${active}, active),
      updated_at = now()
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "stats", resourceId: id, details: { labelFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "stats.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  await sql`UPDATE stats SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "stats", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
