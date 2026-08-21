import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

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
    SELECT * FROM actualites
    ORDER BY deleted_at NULLS FIRST, published_at DESC, display_order ASC
  `;
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "actualites.creer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const body = await req.json();
  const {
    titleFr, titleEn, excerptFr, excerptEn, category,
    image, hrefExternal, publishedAt, readTime, featured, displayOrder, status,
  } = body;

  if (!titleFr || !category || !publishedAt) {
    return NextResponse.json({ error: "Titre (FR), catégorie et date sont requis" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO actualites
      (title_fr, title_en, excerpt_fr, excerpt_en, category, image, href_external, published_at, read_time, featured, display_order, status, created_by)
    VALUES
      (${titleFr}, ${titleEn || null}, ${excerptFr || ""}, ${excerptEn || null}, ${category}, ${image || null}, ${hrefExternal || null}, ${publishedAt}, ${readTime || "3 min"}, ${!!featured}, ${displayOrder ?? 0}, ${status || "brouillon"}, ${session.id})
    RETURNING id
  `;

  await logAudit({ userId: session.id, action: "creer", module: "actualites", resourceId: String(result.rows[0].id), details: { titleFr }, ip: getIp(req) });

  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
