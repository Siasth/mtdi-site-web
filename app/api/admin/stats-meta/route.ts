import { NextRequest, NextResponse } from "next/server";
import { getSession, setSetting } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT value FROM settings WHERE key = 'stats_meta'`;
  const stored = (result.rows[0]?.value as Record<string, string>) || {};
  return NextResponse.json(
    {
      dateLabelFr: stored.dateLabelFr || "Données au 1ᵉʳ juillet 2026",
      dateLabelEn: stored.dateLabelEn || "",
      frequencyFr: stored.frequencyFr || "Mise à jour trimestrielle",
      frequencyEn: stored.frequencyEn || "",
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  if (!hasPerm(session, "contenu.modifier")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  try {
    const body = await req.json();
    const result = await sql`SELECT value FROM settings WHERE key = 'stats_meta'`;
    const current = (result.rows[0]?.value as Record<string, string>) || {};
    await setSetting("stats_meta", { ...current, ...body });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
