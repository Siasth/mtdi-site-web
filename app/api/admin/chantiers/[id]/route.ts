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
  const { id } = await params;
  const body = await req.json();

  if (body.restore) {
    if (!hasPerm(session, "contenu.modifier")) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }
    await sql`UPDATE chantiers SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "chantiers", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { number, titleFr, titleEn, subtitleFr, subtitleEn, descriptionFr, descriptionEn, image, video, color, stats, displayOrder, active } = body;

  await sql`
    UPDATE chantiers SET
      number = COALESCE(${number}, number),
      title_fr = COALESCE(${titleFr}, title_fr),
      title_en = ${titleEn ?? null},
      subtitle_fr = ${subtitleFr ?? null},
      subtitle_en = ${subtitleEn ?? null},
      description_fr = ${descriptionFr ?? null},
      description_en = ${descriptionEn ?? null},
      image = ${image ?? null},
      video = ${video ?? null},
      color = ${color ?? null},
      stats = COALESCE(${stats ? JSON.stringify(stats) : null}::jsonb, stats),
      display_order = COALESCE(${displayOrder}, display_order),
      active = COALESCE(${active}, active),
      updated_at = now()
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "chantiers", resourceId: id, details: { titleFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  await sql`UPDATE chantiers SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "chantiers", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
