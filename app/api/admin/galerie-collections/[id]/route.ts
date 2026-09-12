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
  if (!hasPerm(session, "mediatheque.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.restore) {
    await sql`UPDATE galerie_collections SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "galerie", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }
  const { nameFr, nameEn, displayOrder } = body;
  await sql`
    UPDATE galerie_collections SET
      name_fr = COALESCE(${nameFr}, name_fr),
      name_en = ${nameEn ?? null},
      display_order = COALESCE(${displayOrder}, display_order)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "galerie", resourceId: id, details: { nameFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression bloquée si la collection est encore utilisée.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  const usage = await sql`SELECT COUNT(*) AS count FROM galerie_items WHERE collection_id = ${id} AND deleted_at IS NULL`;
  if (Number(usage.rows[0].count) > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${usage.rows[0].count} élément(s) utilisent encore cette collection.` },
      { status: 400 }
    );
  }
  await sql`UPDATE galerie_collections SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "galerie", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
