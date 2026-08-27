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
  if (!hasPerm(session, "mediatheque.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT g.*, c.name_fr AS coll_name_fr
    FROM galerie_items g
    LEFT JOIN galerie_collections c ON c.id = g.collection_id
    ORDER BY g.deleted_at NULLS FIRST, g.event_date DESC NULLS LAST, g.display_order ASC
  `;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const {
    type, titleFr, titleEn, descriptionFr, descriptionEn, eventDate, credit,
    collectionId, image, videoUrl, hrefExternal, featuredHome, status, displayOrder,
  } = await req.json();

  if (!titleFr || !eventDate) {
    return NextResponse.json({ error: "Titre (FR) et date sont requis" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO galerie_items
      (type, title_fr, title_en, description_fr, description_en, event_date, credit,
       collection_id, image, video_url, href_external, featured_home, status, display_order, created_by)
    VALUES
      (${type || "photo"}, ${titleFr}, ${titleEn || null}, ${sanitizeRichText(descriptionFr || "")}, ${descriptionEn ? sanitizeRichText(descriptionEn) : null},
       ${eventDate}, ${credit || null}, ${collectionId || null}, ${image || null}, ${videoUrl || null},
       ${hrefExternal || null}, ${!!featuredHome}, ${status || "brouillon"}, ${displayOrder ?? 0}, ${session.id})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "galerie", resourceId: String(result.rows[0].id), details: { titleFr }, ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
