import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Liste des rôles + leurs permissions, et le catalogue complet des permissions
export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "roles.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const roles = await sql`
    SELECT id, name, description, is_system
    FROM roles
    WHERE deleted_at IS NULL
    ORDER BY is_system DESC, name ASC
  `;

  const rolePerms = await sql`
    SELECT rp.role_id, p.code
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
  `;

  const allPermissions = await sql`SELECT id, code, module, description FROM permissions ORDER BY module, code`;

  const rolesWithPerms = roles.rows.map((role) => ({
    ...role,
    permissions: rolePerms.rows.filter((rp) => rp.role_id === role.id).map((rp) => rp.code),
  }));

  return NextResponse.json({ roles: rolesWithPerms, allPermissions: allPermissions.rows });
}

// Création d'un rôle (dynamique)
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "roles.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { name, description, permissionCodes } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Le nom du rôle est requis" }, { status: 400 });
  }

  const roleResult = await sql`
    INSERT INTO roles (name, description, is_system)
    VALUES (${name}, ${description || null}, FALSE)
    RETURNING id
  `;
  const roleId = roleResult.rows[0].id;

  const codes: string[] = permissionCodes || [];
  for (const code of codes) {
    const perm = await sql`SELECT id FROM permissions WHERE code = ${code}`;
    if (perm.rows[0]) {
      await sql`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (${roleId}, ${perm.rows[0].id})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  await logAudit({ userId: session.id, action: "creer", module: "roles", resourceId: String(roleId), details: { name, permissionCodes: codes }, ip: getIp(req) });

  return NextResponse.json({ ok: true, id: roleId });
}
