import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

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
    await sql`UPDATE galerie_items SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "galerie", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const {
    type, titleFr, titleEn, descriptionFr, descriptionEn, eventDate, credit,
    collectionId, image, videoUrl, hrefExternal, featuredHome, status, displayOrder,
  } = body;

  await sql`
    UPDATE galerie_items SET
      type = COALESCE(${type}, type),
      title_fr = COALESCE(${titleFr}, title_fr),
      title_en = ${titleEn ?? null},
      description_fr = COALESCE(${descriptionFr ? sanitizeRichText(descriptionFr) : null}, description_fr),
      description_en = ${descriptionEn ? sanitizeRichText(descriptionEn) : null},
      event_date = COALESCE(${eventDate}, event_date),
      credit = ${credit ?? null},
      collection_id = ${collectionId ?? null},
      image = ${image ?? null},
      video_url = ${videoUrl ?? null},
      href_external = ${hrefExternal ?? null},
      featured_home = COALESCE(${featuredHome}, featured_home),
      status = COALESCE(${status}, status),
      display_order = COALESCE(${displayOrder}, display_order),
      updated_at = now()
    WHERE id = ${id}
  `;
  await logAudit({ userId: session.id, action: "modifier", module: "galerie", resourceId: id, details: { titleFr }, ip: getIp(req) });
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
  await sql`UPDATE galerie_items SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "galerie", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
