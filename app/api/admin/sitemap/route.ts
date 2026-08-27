import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { SITEMAP_SUGGESTION } from "@/lib/sitemap";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base.
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.voir")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const sections = await sql`SELECT * FROM sitemap_sections ORDER BY display_order ASC`;
  const links = await sql`SELECT * FROM sitemap_links ORDER BY display_order ASC`;
  return NextResponse.json(
    { sections: sections.rows, links: links.rows },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

// Régénère entièrement le plan du site depuis la suggestion de base (routes
// connues du site). Écrase le contenu actuel — l'admin doit ensuite relire
// et publier (aucune section n'est retirée automatiquement du menu tant que
// ce bouton n'est pas utilisé).
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "ressources.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  try {
    await sql`DELETE FROM sitemap_sections`; // CASCADE supprime aussi sitemap_links
    for (let i = 0; i < SITEMAP_SUGGESTION.length; i++) {
      const sec = SITEMAP_SUGGESTION[i];
      const secResult = await sql`
        INSERT INTO sitemap_sections (title_fr, title_en, display_order)
        VALUES (${sec.titleFr}, ${sec.titleEn}, ${i})
        RETURNING id
      `;
      const secId = secResult.rows[0].id;
      for (let j = 0; j < sec.links.length; j++) {
        const l = sec.links[j];
        await sql`
          INSERT INTO sitemap_links (section_id, label_fr, label_en, href, display_order)
          VALUES (${secId}, ${l.labelFr}, ${l.labelEn}, ${l.href}, ${j})
        `;
      }
    }
    await logAudit({ userId: session.id, action: "modifier", module: "sitemap-regenerate", ip: getIp(req) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
