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
    await sql`UPDATE partners SET deleted_at = NULL WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  }
  if (!hasPerm(session, "ministere.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { category, name, fullFr, fullEn, descriptionFr, descriptionEn, accent, logoSrc, displayOrder, active } = body;
  await sql`
    UPDATE partners SET
      category = COALESCE(${category}, category), name = COALESCE(${name}, name),
      full_fr = COALESCE(${fullFr}, full_fr), full_en = ${fullEn ?? null},
      description_fr = COALESCE(${descriptionFr ? sanitizeRichText(descriptionFr) : null}, description_fr),
      description_en = ${descriptionEn ? sanitizeRichText(descriptionEn) : null},
      accent = ${accent ?? null}, logo_src = ${logoSrc ?? null},
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "partners", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ministere.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE partners SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "partners", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
