import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { titleFr, titleEn, displayOrder } = await req.json();
  if (!titleFr) return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  const result = await sql`
    INSERT INTO sitemap_sections (title_fr, title_en, display_order)
    VALUES (${titleFr}, ${titleEn || null}, ${displayOrder ?? 0})
    RETURNING id
  `;
  await logAudit({ userId: session.id, action: "creer", module: "sitemap-sections", resourceId: String(result.rows[0].id), ip: getIp(req) });
  return NextResponse.json({ ok: true, id: result.rows[0].id }, { status: 201 });
}
