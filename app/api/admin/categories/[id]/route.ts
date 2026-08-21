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
  if (!hasPerm(session, "categories.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  const { nameFr, nameEn, color, displayOrder } = await req.json();

  await sql`
    UPDATE categories SET
      name_fr = COALESCE(${nameFr}, name_fr),
      name_en = ${nameEn ?? null},
      color = COALESCE(${color}, color),
      display_order = COALESCE(${displayOrder}, display_order)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "categories", resourceId: id, details: { nameFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression bloquée si la catégorie est encore utilisée par au moins un
// article actif — évite de casser silencieusement des articles existants.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "categories.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;

  const usage = await sql`SELECT COUNT(*) AS count FROM actualites WHERE category_id = ${id} AND deleted_at IS NULL`;
  if (Number(usage.rows[0].count) > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${usage.rows[0].count} article(s) utilisent encore cette catégorie.` },
      { status: 400 }
    );
  }

  await sql`UPDATE categories SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "categories", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
