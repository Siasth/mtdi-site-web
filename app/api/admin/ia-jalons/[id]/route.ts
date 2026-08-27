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
    if (!hasPerm(session, "strategie_ia.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    await sql`UPDATE ia_jalons SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "strategie_ia.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { year, titleFr, titleEn, descriptionFr, descriptionEn, done, displayOrder, active } = body;
  await sql`
    UPDATE ia_jalons SET
      year = COALESCE(${year}, year), title_fr = COALESCE(${titleFr}, title_fr), title_en = ${titleEn ?? null}, description_fr = ${descriptionFr ?? null}, description_en = ${descriptionEn ?? null}, done = COALESCE(${done}, done), display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "ia-jalons", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "strategie_ia.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE ia_jalons SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "ia-jalons", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
