import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Modifier un utilisateur : nom, rôle, statut, restauration, réinitialisation mdp
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "utilisateurs.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, roleId, status, restore, newPassword } = body;

  if (restore) {
    await sql`UPDATE users SET deleted_at = NULL WHERE id = ${id}`;
    await logAudit({ userId: session.id, action: "restaurer", module: "utilisateurs", resourceId: id, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  if (newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, must_change_password = TRUE, updated_at = now()
      WHERE id = ${id}
    `;
    await logAudit({ userId: session.id, action: "modifier", module: "utilisateurs", resourceId: id, details: { action: "reinitialisation_mdp" }, ip: getIp(req) });
    return NextResponse.json({ ok: true });
  }

  await sql`
    UPDATE users
    SET name = COALESCE(${name}, name),
        role_id = COALESCE(${roleId}, role_id),
        status = COALESCE(${status}, status),
        updated_at = now()
    WHERE id = ${id}
  `;

  await logAudit({ userId: session.id, action: "modifier", module: "utilisateurs", resourceId: id, details: { name, roleId, status }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression logique (jamais définitive)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "utilisateurs.supprimer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { id } = await params;

  if (String(session.id) === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  await sql`UPDATE users SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "utilisateurs", resourceId: id, ip: getIp(req) });

  return NextResponse.json({ ok: true });
}
