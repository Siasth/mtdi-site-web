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
  if (!hasPerm(session, "mediatheque.voir")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM media_mentions ORDER BY deleted_at NULLS FIRST, display_order ASC`;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { type, color, titleFr, titleEn, date, source, excerptFr, excerptEn, url, displayOrder, active } = await req.json();
  if (!titleFr || !url) return NextResponse.json({ error: "Titre et lien sont requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO media_mentions (type_fr, type_color, title_fr, title_en, date_label, source, excerpt_fr, excerpt_en, url, display_order, active, created_by)
    VALUES (${type || 'Médias'}, ${color || 'ROUGE'}, ${titleFr}, ${titleEn || null}, ${date || null}, ${source || null}, ${excerptFr || null}, ${excerptEn || null}, ${url}, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "media-mentions", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
