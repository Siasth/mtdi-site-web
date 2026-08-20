import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readData } from "@/lib/data";
import { generateCode, storeCode, verifyCode } from "@/lib/two-factor";
import { sendCode } from "@/lib/mail";

type Security = {
  password: string;
  twoFactorEmail: string;
  sessionSecret: string;
};

function makeToken(secret: string): string {
  return btoa(`mtdi-session:${secret}`);
}

// Étape 1 : vérifier le mot de passe → envoyer le code 2FA
export async function POST(req: NextRequest) {
  const body = await req.json();
  const security = await readData<Security>("security");

  // Étape 2 : vérification du code 2FA
  if (body.code) {
    if (!security.twoFactorEmail) {
      return NextResponse.json({ error: "2FA non configuré" }, { status: 400 });
    }
    const valid = await verifyCode(security.twoFactorEmail, body.code);
    if (!valid) {
      return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 401 });
    }

    // Code valide → créer la session
    const token = makeToken(security.sessionSecret);
    const cookieStore = await cookies();
    cookieStore.set("mtdi-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return NextResponse.json({ ok: true });
  }

  // Étape 1 : vérifier le mot de passe
  if (body.password !== security.password) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  // Si pas d'email 2FA configuré → connexion directe
  if (!security.twoFactorEmail) {
    const token = makeToken(security.sessionSecret);
    const cookieStore = await cookies();
    cookieStore.set("mtdi-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return NextResponse.json({ ok: true });
  }

  // 2FA activé → envoyer le code
  const code = generateCode();
  await storeCode(security.twoFactorEmail, code);

  try {
    await sendCode(security.twoFactorEmail, code);
  } catch (err) {
    console.error("Erreur envoi email 2FA:", err);
    return NextResponse.json({ error: "Impossible d'envoyer le code. Vérifiez la configuration SMTP." }, { status: 500 });
  }

  // Masquer l'email partiellement
  const email = security.twoFactorEmail;
  const [user, domain] = email.split("@");
  const masked = user.slice(0, 2) + "***@" + domain;

  return NextResponse.json({ requireCode: true, email: masked });
}

// Déconnexion
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("mtdi-auth");
  return NextResponse.json({ ok: true });
}
