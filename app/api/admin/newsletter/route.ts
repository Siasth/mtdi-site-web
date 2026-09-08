import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

// Jamais mis en cache : cette liste doit toujours refléter l'état réel de la base.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "newsletter.voir")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const result = await sql`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`;
  return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
