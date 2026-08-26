import { NextRequest, NextResponse } from "next/server";
import { getSession, setSetting, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { getMinistreBio } from "@/lib/ministre-bio";
import { sanitizeRichText } from "@/lib/sanitize";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// getSession() (pas requireSession) : évite tout comportement de redirection
// de page dans ce contexte d'API, qui peut casser la réponse JSON attendue.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  try {
    const bio = await getMinistreBio();
    return NextResponse.json(bio);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  if (!hasPerm(session, "contenu.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const body = await req.json();

  if (typeof body.bioContentFr === "string") body.bioContentFr = sanitizeRichText(body.bioContentFr);
  if (typeof body.bioContentEn === "string") body.bioContentEn = sanitizeRichText(body.bioContentEn);
  if (Array.isArray(body.parcoursFr)) {
    body.parcoursFr = body.parcoursFr.map((p: { period: string; title: string; description: string }) => ({ ...p, description: sanitizeRichText(p.description) }));
  }
  if (Array.isArray(body.parcoursEn)) {
    body.parcoursEn = body.parcoursEn.map((p: { period: string; title: string; description: string }) => ({ ...p, description: sanitizeRichText(p.description) }));
  }
  if (Array.isArray(body.prioritesFr)) {
    body.prioritesFr = body.prioritesFr.map((p: { title: string; description: string }) => ({ ...p, description: sanitizeRichText(p.description) }));
  }
  if (Array.isArray(body.prioritesEn)) {
    body.prioritesEn = body.prioritesEn.map((p: { title: string; description: string }) => ({ ...p, description: sanitizeRichText(p.description) }));
  }

  const current = await getMinistreBio();
  await setSetting("ministre_bio", { ...current, ...body });
  await logAudit({ userId: session.id, action: "modifier", module: "ministre-bio", ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
