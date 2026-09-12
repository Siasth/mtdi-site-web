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
    await sql`UPDATE sitemap_sections SET deleted_at = NULL WHERE id = ${id}`;
    await sql`UPDATE sitemap_links SET deleted_at = NULL WHERE section_id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "sitemap-sections", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }
  const { titleFr, titleEn, displayOrder, active } = body;
  await sql`
    UPDATE sitemap_sections SET
      title_fr = COALESCE(${titleFr}, title_fr), title_en = ${titleEn ?? null},
      display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "sitemap-sections", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression logique (réversible) : la section et ses liens restent en base
// et sont récupérables via le filtre "éléments supprimés" du back-office.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE sitemap_sections SET deleted_at = now() WHERE id = ${id}`;
  await sql`UPDATE sitemap_links SET deleted_at = now() WHERE section_id = ${id} AND deleted_at IS NULL`;
  await logAudit({ userId: session.id, action: "supprimer", module: "sitemap-sections", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
