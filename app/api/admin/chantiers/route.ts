import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT * FROM chantiers
    ORDER BY deleted_at NULLS FIRST, display_order ASC
  `;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const { number, titleFr, titleEn, subtitleFr, subtitleEn, descriptionFr, descriptionEn, image, video, color, stats, displayOrder, active } = await req.json();

  if (!titleFr) {
    return NextResponse.json({ error: "Le titre (FR) est requis" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO chantiers (number, title_fr, title_en, subtitle_fr, subtitle_en, description_fr, description_en, image, video, color, stats, display_order, active, created_by)
    VALUES (${number || ""}, ${titleFr}, ${titleEn || null}, ${subtitleFr || null}, ${subtitleEn || null}, ${sanitizeRichText(descriptionFr || "")}, ${descriptionEn ? sanitizeRichText(descriptionEn) : null}, ${image || null}, ${video || null}, ${color || null}, ${JSON.stringify(stats || [])}::jsonb, ${displayOrder ?? 0}, ${active ?? true}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "chantiers", resourceId: String(result.rows[0].id), details: { titleFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
