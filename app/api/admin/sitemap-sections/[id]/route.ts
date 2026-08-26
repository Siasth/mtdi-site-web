import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  const { titleFr, titleEn, displayOrder, active } = await req.json();
  await sql`
    UPDATE sitemap_sections SET
      title_fr = COALESCE(${titleFr}, title_fr), title_en = ${titleEn ?? null},
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "sitemap-sections", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM sitemap_sections WHERE id = ${id}`; // CASCADE retire aussi ses liens
  await logAudit({ userId: session.id, action: "supprimer", module: "sitemap-sections", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
