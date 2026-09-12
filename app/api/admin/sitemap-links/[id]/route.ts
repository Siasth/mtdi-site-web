import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  if (body.restore) {
    await sql`UPDATE sitemap_links SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "sitemap-links", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }
  const { labelFr, labelEn, href, displayOrder, active } = body;
  await sql`
    UPDATE sitemap_links SET
      label_fr = COALESCE(${labelFr}, label_fr), label_en = ${labelEn ?? null},
      href = COALESCE(${href}, href),
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "sitemap-links", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression logique (réversible), cf sitemap-sections.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE sitemap_links SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "sitemap-links", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
