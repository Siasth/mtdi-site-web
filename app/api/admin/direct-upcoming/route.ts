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
  const result = await sql`SELECT * FROM direct_upcoming ORDER BY deleted_at NULLS FIRST, event_date ASC`;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { eventDate, titleFr, titleEn, descriptionFr, descriptionEn, displayOrder, active } = await req.json();
  if (!titleFr || !eventDate) return NextResponse.json({ error: "Titre et date sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO direct_upcoming (event_date, title_fr, title_en, description_fr, description_en, display_order, active, created_by)
    VALUES (${eventDate}, ${titleFr}, ${titleEn || null}, ${descriptionFr || null}, ${descriptionEn || null}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "direct", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
