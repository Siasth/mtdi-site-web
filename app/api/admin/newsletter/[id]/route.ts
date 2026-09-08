import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// PATCH gère deux actions distinctes, sur le même modèle que les autres
// modules du back-office :
//  - { restore: true } → annule une suppression logique (deleted_at = NULL)
//  - { active: true|false } → désinscrit/réinscrit l'abonné sans le supprimer
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "newsletter.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  if (body.restore) {
    await sql`UPDATE newsletter_subscribers SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "newsletter", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.active === "boolean") {
    await sql`UPDATE newsletter_subscribers SET active = ${body.active} WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "modifier", module: "newsletter", resourceId: id, details: { active: body.active }, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aucune action reconnue" }, { status: 400 });
}

// Suppression logique (deleted_at = now()), comme partout ailleurs dans le
// back-office — restaurable via PATCH { restore: true }.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "newsletter.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE newsletter_subscribers SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "newsletter", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
