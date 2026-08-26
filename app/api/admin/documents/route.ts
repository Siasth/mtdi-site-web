import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM documents ORDER BY deleted_at NULLS FIRST, display_order ASC`;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { titleFr, titleEn, category, type, date, descriptionFr, descriptionEn, href, featured, displayOrder, active } = await req.json();
  if (!titleFr || !href) return NextResponse.json({ error: "Titre et lien sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO documents (title_fr, title_en, category, type, date_label, description_fr, description_en, href, featured, display_order, active, created_by)
    VALUES (${titleFr}, ${titleEn || null}, ${category || "rapport"}, ${type || "PDF"}, ${date || null}, ${descriptionFr || null}, ${descriptionEn || null}, ${href}, ${!!featured}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "documents", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
