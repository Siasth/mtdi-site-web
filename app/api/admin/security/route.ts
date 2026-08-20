import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/data";

type Security = {
  password: string;
  twoFactorEmail: string;
  sessionSecret: string;
};

// GET : récupérer les paramètres (sans le mot de passe ni le secret)
export async function GET() {
  const security = await readData<Security>("security");
  return NextResponse.json({
    twoFactorEmail: security.twoFactorEmail,
    has2FA: !!security.twoFactorEmail,
  });
}

// PUT : modifier le mot de passe et/ou l'email 2FA
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const security = await readData<Security>("security");

  // Changement de mot de passe
  if (body.action === "password") {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    if (currentPassword !== security.password) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    security.password = newPassword;
    // Renouveler le secret de session pour invalider les sessions existantes
    security.sessionSecret = `mtdi-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await writeData("security", security);

    return NextResponse.json({ ok: true, message: "Mot de passe modifié. Vous allez être déconnecté." });
  }

  // Changement d'email 2FA
  if (body.action === "2fa") {
    const { email } = body;

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    security.twoFactorEmail = email || "";
    await writeData("security", security);

    return NextResponse.json({
      ok: true,
      message: email ? "2FA activé. Un code sera envoyé à cette adresse lors de la connexion." : "2FA désactivé.",
    });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
