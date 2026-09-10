import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm, withRequiredViewPermissions } from "@/lib/permissions";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Modifier un rôle : nom, description, permissions cochées
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "roles.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { id } = await params;
  const { name, description, permissionCodes } = await req.json();

  await sql`
    UPDATE roles
    SET name = COALESCE(${name}, name), description = COALESCE(${description}, description)
    WHERE id = ${id}
  `;

  if (Array.isArray(permissionCodes)) {
    // ANO-153 : filet de sécurité serveur — complète les "voir" manquants
    // même si la requête ne vient pas de l'interface standard du back-office.
    const completedCodes = withRequiredViewPermissions(permissionCodes as string[]);
    await sql`DELETE FROM role_permissions WHERE role_id = ${id}`;
    for (const code of completedCodes) {
      const perm = await sql`SELECT id FROM permissions WHERE code = ${code}`;
      if (perm.rows[0]) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${id}, ${perm.rows[0].id})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  await logAudit({ userId: session.id, action: "modifier", module: "roles", resourceId: id, details: { name, permissionCodes }, ip: getIp(req) });
  return NextResponse.json({ ok: true });
}

// Suppression d'un rôle (jamais le rôle système "Super Admin", jamais s'il a des utilisateurs)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!hasPerm(session, "roles.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { id } = await params;

  const role = await sql`SELECT is_system FROM roles WHERE id = ${id}`;
  if (role.rows[0]?.is_system) {
    return NextResponse.json({ error: "Ce rôle système ne peut pas être supprimé" }, { status: 400 });
  }

  const usersWithRole = await sql`SELECT COUNT(*) AS count FROM users WHERE role_id = ${id} AND deleted_at IS NULL`;
  if (Number(usersWithRole.rows[0].count) > 0) {
    return NextResponse.json({ error: "Ce rôle est encore assigné à des utilisateurs actifs" }, { status: 400 });
  }

  await sql`UPDATE roles SET deleted_at = now() WHERE id = ${id}`;
  await logAudit({ userId: session.id, action: "supprimer", module: "roles", resourceId: id, ip: getIp(req) });

  return NextResponse.json({ ok: true });
}
