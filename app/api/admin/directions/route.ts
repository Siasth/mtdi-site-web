import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM directions ORDER BY deleted_at NULLS FIRST, display_order ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { acronym, typeFr, typeEn, nameFr, nameEn, director, descriptionFr, descriptionEn, accent, displayOrder, active } = await req.json();
  if (!acronym || !nameFr) return NextResponse.json({ error: "Sigle et nom sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO directions (acronym, type_fr, type_en, name_fr, name_en, director, description_fr, description_en, accent, display_order, active, created_by)
    VALUES (${acronym}, ${typeFr || null}, ${typeEn || null}, ${nameFr}, ${nameEn || null}, ${director || null}, ${sanitizeRichText(descriptionFr || "")}, ${descriptionEn ? sanitizeRichText(descriptionEn) : null}, ${accent || "#162233"}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "directions", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
