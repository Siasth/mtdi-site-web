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

// Liste complète pour le back-office (inclut les articles supprimés
// logiquement, distingués par deleted_at, pour permettre la restauration).
export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "actualites.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const result = await sql`
    SELECT a.*, c.name_fr AS cat_name_fr, c.name_en AS cat_name_en, c.color AS cat_color
    FROM actualites a
    LEFT JOIN categories c ON c.id = a.category_id
    ORDER BY a.deleted_at NULLS FIRST, a.published_at DESC, a.display_order ASC
  `;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "actualites.creer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const body = await req.json();
  const {
    titleFr, titleEn, excerptFr, excerptEn, categoryId,
    image, hrefExternal, publishedAt, readTime, featured, displayOrder, status, attachments, scheduledAt,
  } = body;

  if (!titleFr || !categoryId || !publishedAt) {
    return NextResponse.json({ error: "Titre (FR), catégorie et date sont requis" }, { status: 400 });
  }

  if (featured) {
    const count = await sql`
      SELECT COUNT(*) AS count FROM actualites
      WHERE featured = TRUE AND deleted_at IS NULL AND status = 'publie' AND (scheduled_at IS NULL OR scheduled_at <= now())
    `;
    if (Number(count.rows[0].count) >= 8) {
      return NextResponse.json(
        { error: "Maximum 8 articles \"à la une\" actifs simultanément (RM-002). Retirez-en un avant d'en ajouter un nouveau." },
        { status: 400 }
      );
    }
  }

  const result = await sql`
    INSERT INTO actualites
      (title_fr, title_en, excerpt_fr, excerpt_en, category_id, image, href_external, published_at, read_time, featured, display_order, status, attachments, scheduled_at, created_by)
    VALUES
      (${titleFr}, ${titleEn || null}, ${sanitizeRichText(excerptFr || "")}, ${excerptEn ? sanitizeRichText(excerptEn) : null}, ${categoryId}, ${image || null}, ${hrefExternal || null}, ${publishedAt}, ${readTime || "3 min"}, ${!!featured}, ${displayOrder ?? 0}, ${status || "brouillon"}, ${JSON.stringify(attachments || [])}::jsonb, ${scheduledAt || null}, ${session.id})
    RETURNING id
  `;

  await logAudit({ userId: session.id, action: "creer", module: "actualites", resourceId: String(result.rows[0].id), details: { titleFr }, ip: getIp(req) });

  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
