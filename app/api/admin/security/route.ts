import { NextRequest, NextResponse } from "next/server";
import { requireSession, getSetting, setSetting, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { testSmtpConnection } from "@/lib/mail";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

type SmtpConfig = { host: string; port: number; user: string; pass: string; from: string };

// Réglages GLOBAUX du site (2FA forcée + SMTP) — réservés à la permission
// "securite.modifier". Enregistrés en base : pris en compte immédiatement,
// sans redéploiement.
export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "securite.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const forceTwoFactorAll = (await getSetting<boolean>("force_2fa_all")) ?? false;
  const smtp = (await getSetting<SmtpConfig>("smtp_config")) ?? null;

  return NextResponse.json({
    forceTwoFactorAll,
    smtp: smtp ? { ...smtp, pass: smtp.pass ? "••••••••" : "" } : null, // le mot de passe n'est jamais renvoyé en clair
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "securite.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const body = await req.json();
  const ip = getIp(req);

  if (typeof body.forceTwoFactorAll === "boolean") {
    await setSetting("force_2fa_all", body.forceTwoFactorAll);
    await logAudit({ userId: session.id, action: "modifier", module: "securite", details: { forceTwoFactorAll: body.forceTwoFactorAll }, ip });
  }

  if (body.smtp) {
    const { host, port, user, pass, from } = body.smtp;
    if (!host || !port || !user || !from) {
      return NextResponse.json({ error: "Champs SMTP incomplets (hôte, port, utilisateur, expéditeur requis)" }, { status: 400 });
    }

    // Si le mot de passe envoyé est le masque "••••••••", on garde l'ancien
    // (l'utilisateur n'a pas voulu le changer).
    let finalPass = pass;
    if (pass === "••••••••") {
      const existing = await getSetting<SmtpConfig>("smtp_config");
      finalPass = existing?.pass || "";
    }

    await setSetting("smtp_config", { host, port: Number(port), user, pass: finalPass, from });
    await logAudit({ userId: session.id, action: "modifier", module: "securite", details: { action: "smtp_config" }, ip });
  }

  return NextResponse.json({ ok: true });
}

// Test d'envoi (bouton "Tester la connexion" dans l'interface)
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "securite.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { host, port, user, pass, from } = await req.json();

  let finalPass = pass;
  if (pass === "••••••••") {
    const existing = await getSetting<SmtpConfig>("smtp_config");
    finalPass = existing?.pass || "";
  }

  try {
    await testSmtpConnection({ host, port: Number(port), user, pass: finalPass, from });
    return NextResponse.json({ ok: true, message: "Connexion SMTP réussie." });
  } catch (err) {
    return NextResponse.json({ error: `Échec de connexion : ${String(err)}` }, { status: 400 });
  }
}
