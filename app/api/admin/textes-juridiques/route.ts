import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM textes_juridiques ORDER BY deleted_at NULLS FIRST, display_order ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { titleFr, titleEn, type, reference, date, status, descriptionFr, descriptionEn, articles, href, displayOrder, active } = await req.json();
  if (!titleFr || !href) return NextResponse.json({ error: "Titre et lien sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO textes_juridiques (title_fr, title_en, type_fr, reference, date_label, status_fr, description_fr, description_en, articles_fr, href, display_order, active, created_by)
    VALUES (${titleFr}, ${titleEn || null}, ${type || null}, ${reference || null}, ${date || null}, ${status || null}, ${descriptionFr || null}, ${descriptionEn || null}, ${articles || null}, ${href}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "textes-juridiques", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
