import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json();
  if (body.restore) {
    if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    await sql`UPDATE missions SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { textFr, textEn, displayOrder, active } = body;
  await sql`
    UPDATE missions SET text_fr = COALESCE(${textFr}, text_fr), text_en = ${textEn ?? null},
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "missions", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE missions SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "missions", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
