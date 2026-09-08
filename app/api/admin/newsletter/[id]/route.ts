import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Suppression définitive (pas de corbeille) : il s'agit de données
// personnelles d'un tiers (RGPD / loi béninoise n°2017-20), pas de contenu
// éditorial — contrairement aux autres modules, on ne conserve pas de trace
// récupérable après une demande de désabonnement.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!hasPerm(session, "newsletter.gerer")) return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "newsletter", resourceId: id, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
