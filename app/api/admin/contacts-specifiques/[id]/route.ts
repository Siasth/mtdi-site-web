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
    if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    await sql`UPDATE contacts_specifiques SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { role, name, email, phone, note, accent, displayOrder, active } = body;
  await sql`
    UPDATE contacts_specifiques SET
      role_fr = COALESCE(${role}, role_fr), name_fr = COALESCE(${name}, name_fr), email = COALESCE(${email}, email), phone = ${phone ?? null}, note_fr = ${note ?? null}, accent = ${accent ?? null}, display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "contacts-specifiques", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE contacts_specifiques SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "contacts-specifiques", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
