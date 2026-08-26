import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Profil de l'utilisateur CONNECTÉ (pas besoin de permission spéciale :
// chacun gère son propre nom / mot de passe).
export async function GET() {
  const session = await requireSession();
  const result = await sql`SELECT name, email FROM users WHERE id = ${session.id}`;
  const row = result.rows[0];
  return NextResponse.json({ name: row.name, email: row.email }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  const ip = getIp(req);
  const body = await req.json();
  const { name, currentPassword, newPassword } = body;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
    }
    const userResult = await sql`SELECT password_hash FROM users WHERE id = ${session.id}`;
    const valid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, must_change_password = FALSE, updated_at = now()
      WHERE id = ${session.id}
    `;
    await logAudit({ userId: session.id, action: "modifier", module: "profil", details: { action: "changement_mot_de_passe" }, ip });
  }

  if (typeof name === "string" && name.trim()) {
    await sql`UPDATE users SET name = ${name.trim()}, updated_at = now() WHERE id = ${session.id}`;
    await logAudit({ userId: session.id, action: "modifier", module: "profil", details: { action: "changement_nom", name }, ip });
  }

  return NextResponse.json({ ok: true });
}
