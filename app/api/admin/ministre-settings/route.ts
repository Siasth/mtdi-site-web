import { NextRequest, NextResponse } from "next/server";
import { requireSession, setSetting, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { getMinistreSettings } from "@/lib/ministre-settings";
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
  if (!hasPerm(session, "accueil.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  try {
    const settings = await getMinistreSettings();
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "accueil.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const body = await req.json();
  if (typeof body.contentFr === "string") body.contentFr = sanitizeRichText(body.contentFr);
  if (typeof body.contentEn === "string") body.contentEn = sanitizeRichText(body.contentEn);
  const current = await getMinistreSettings();
  await setSetting("ministre_message", { ...current, ...body });
  await logAudit({ userId: session.id, action: "modifier", module: "ministre", ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
