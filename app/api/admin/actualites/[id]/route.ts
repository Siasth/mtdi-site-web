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
    if (!hasPerm(session, "actualites.restaurer")) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }
    await sql`UPDATE actualites SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "actualites", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (!hasPerm(session, "actualites.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const {
    titleFr, titleEn, excerptFr, excerptEn, categoryId,
    image, hrefExternal, publishedAt, readTime, featured, displayOrder, status,
  } = body;

  if (featured === true) {
    const count = await sql`
      SELECT COUNT(*) AS count FROM actualites
      WHERE featured = TRUE AND deleted_at IS NULL AND status = 'publie' AND id != ${id}
    `;
    if (Number(count.rows[0].count) >= 8) {
      return NextResponse.json(
        { error: "Maximum 8 articles \"à la une\" actifs simultanément (RM-002). Retirez-en un avant d'en ajouter un nouveau." },
        { status: 400 }
      );
    }
  }

  await sql`
    UPDATE actualites SET
      title_fr = COALESCE(${titleFr}, title_fr),
      title_en = ${titleEn ?? null},
      excerpt_fr = COALESCE(${excerptFr}, excerpt_fr),
      excerpt_en = ${excerptEn ?? null},
      category_id = COALESCE(${categoryId}, category_id),
      image = ${image ?? null},
      href_external = ${hrefExternal ?? null},
      published_at = COALESCE(${publishedAt}, published_at),
      read_time = COALESCE(${readTime}, read_time),
      featured = COALESCE(${featured}, featured),
      display_order = COALESCE(${displayOrder}, display_order),
      status = COALESCE(${status}, status),
      updated_at = now()
    WHERE id = ${id}
  `;

  await logAudit({ userId: session.id, action: "modifier", module: "actualites", resourceId: id, details: { titleFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "actualites.supprimer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { id } = await params;
  await sql`UPDATE actualites SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "actualites", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
