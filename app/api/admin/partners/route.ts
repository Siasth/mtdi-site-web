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
  const result = await sql`SELECT * FROM partners ORDER BY deleted_at NULLS FIRST, category ASC, display_order ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { category, name, fullFr, fullEn, descriptionFr, descriptionEn, accent, logoSrc, displayOrder, active } = await req.json();
  if (!name || !fullFr) return NextResponse.json({ error: "Nom et intitulé complet sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO partners (category, name, full_fr, full_en, description_fr, description_en, accent, logo_src, display_order, active, created_by)
    VALUES (${category || "institutionnel"}, ${name}, ${fullFr}, ${fullEn || null}, ${sanitizeRichText(descriptionFr || "")}, ${descriptionEn ? sanitizeRichText(descriptionEn) : null}, ${accent || "#162233"}, ${logoSrc || null}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "partners", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
