import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { sendCode } from "@/lib/mail";
import {
  createSession,
  isLocked,
  recordFailedAttempt,
  clearFailedAttempts,
  logAudit,
  revokeCurrentSession,
  createTwoFactorCode,
  verifyTwoFactorCode,
  getSetting,
} from "@/lib/auth";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent");

  // ── Étape 2 : vérification du code 2FA ──────────────────────────────────
  if (body.code) {
    const { email, code } = body;
    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
    }

    const result = await sql`SELECT id, status, deleted_at FROM users WHERE email = ${email}`;
    const user = result.rows[0];
    if (!user || user.deleted_at || user.status !== "actif") {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const valid = await verifyTwoFactorCode(user.id, code);
    if (!valid) {
      await logAudit({ userId: user.id, action: "echec_connexion", module: "auth", ip, details: { raison: "code_2fa_invalide" } });
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 401 });
    }

    await createSession(user.id, ip, userAgent);
    await logAudit({ userId: user.id, action: "connexion", module: "auth", ip });
    return NextResponse.json({ ok: true });
  }

  // ── Étape 1 : email + mot de passe ──────────────────────────────────────
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const result = await sql`
    SELECT id, email, password_hash, status, deleted_at
    FROM users
    WHERE email = ${email}
  `;
  const user = result.rows[0];

  const genericError = () =>
    NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });

  if (!user || user.deleted_at || user.status !== "actif") {
    if (user) {
      await logAudit({ userId: user.id, action: "echec_connexion", module: "auth", ip });
    }
    return genericError();
  }

  if (await isLocked(user.id)) {
    await logAudit({ userId: user.id, action: "echec_connexion", module: "auth", ip, details: { raison: "compte_verrouille" } });
    return NextResponse.json(
      { error: "Compte temporairement verrouillé suite à plusieurs échecs. Réessayez dans quelques minutes." },
      { status: 423 }
    );
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    await recordFailedAttempt(user.id);
    await logAudit({ userId: user.id, action: "echec_connexion", module: "auth", ip });
    return genericError();
  }

  await clearFailedAttempts(user.id);

  // 2FA : réglage GLOBAL uniquement, décidé par le Super Admin
  // (permission "securite.modifier"), s'impose alors à tous les comptes.
  const forceAll = await getSetting<boolean>("force_2fa_all");

  if (forceAll === true) {
    const code = await createTwoFactorCode(user.id);
    try {
      await sendCode(user.email, code);
    } catch (err) {
      console.error("Erreur envoi email 2FA:", err);
      return NextResponse.json(
        { error: "Impossible d'envoyer le code. Vérifiez la configuration SMTP dans Administration du site." },
        { status: 500 }
      );
    }
    return NextResponse.json({ requireCode: true, email: maskEmail(user.email) });
  }

  await createSession(user.id, ip, userAgent);
  await logAudit({ userId: user.id, action: "connexion", module: "auth", ip });

  return NextResponse.json({ ok: true });
}

// Déconnexion
export async function DELETE(req: NextRequest) {
  const ip = getIp(req);
  const userId = await revokeCurrentSession();
  await logAudit({ userId, action: "deconnexion", module: "auth", ip });
  return NextResponse.json({ ok: true });
}
