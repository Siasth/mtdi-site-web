import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sanitizeRichText } from "@/lib/sanitize";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base.
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM static_pages ORDER BY slug ASC`;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  try {
    const { slug, contentFr, contentEn, published } = await req.json();
    if (!slug) return NextResponse.json({ error: "slug requis" }, { status: 400 });
    await sql`
      UPDATE static_pages SET
        content_fr = COALESCE(${contentFr ? sanitizeRichText(contentFr) : null}, content_fr),
        content_en = ${contentEn ? sanitizeRichText(contentEn) : null},
        published = COALESCE(${published}, published),
        updated_by = ${session.id},
        updated_at = now()
      WHERE slug = ${slug}
    `;
    await logAudit({ userId: session.id, action: "modifier", module: "static-pages", resourceId: slug, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
