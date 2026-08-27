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
  try {
    if (body.restore) {
      if (!hasPerm(session, "mediatheque.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
      await sql`UPDATE documents SET deleted_at = NULL WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }
    if (!hasPerm(session, "mediatheque.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    const { titleFr, titleEn, category, type, date, descriptionFr, descriptionEn, href, featured, displayOrder, active } = body;

    await sql`
      UPDATE documents SET
        title_fr = COALESCE(${titleFr}, title_fr), title_en = ${titleEn ?? null},
        category = COALESCE(${category}, category), type = COALESCE(${type}, type), date_label = ${date ?? null},
        description_fr = ${descriptionFr ?? null}, description_en = ${descriptionEn ?? null},
        href = COALESCE(${href}, href), featured = COALESCE(${featured}, featured),
        display_order = COALESCE(${displayOrder}, display_order), active = COALESCE(${active}, active)
      WHERE id = ${id}
    `;

    await logAudit({ userId: session.id, action: "modifier", module: "documents", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Garantit une réponse JSON exploitable même si la requête SQL échoue,
    // au lieu de laisser Next.js renvoyer une erreur brute non-JSON.
    console.error(`[documents PATCH] id=${id} ERREUR:`, err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`UPDATE documents SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "documents", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
