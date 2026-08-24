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
  const result = await sql`SELECT * FROM cabinet_members ORDER BY deleted_at NULLS FIRST, display_order ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { roleFr, roleEn, directionFr, directionEn, descriptionFr, descriptionEn, accent, level, displayOrder, active } = await req.json();
  if (!roleFr) return NextResponse.json({ error: "Le rôle (FR) est requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO cabinet_members (role_fr, role_en, direction_fr, direction_en, description_fr, description_en, accent, level, display_order, active, created_by)
    VALUES (${roleFr}, ${roleEn || null}, ${directionFr || null}, ${directionEn || null}, ${sanitizeRichText(descriptionFr || "")}, ${descriptionEn ? sanitizeRichText(descriptionEn) : null}, ${accent || "#162233"}, ${level ?? 0}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "cabinet", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
