import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

// Liste des utilisateurs (actifs et supprimés logiquement, distingués par deleted_at)
export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "utilisateurs.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const result = await sql`
    SELECT u.id, u.email, u.name, u.status, u.last_login_at, u.created_at, u.deleted_at,
           r.id AS role_id, r.name AS role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.deleted_at NULLS FIRST, u.created_at DESC
  `;
  return NextResponse.json(result.rows);
}

// Création d'un utilisateur
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "utilisateurs.creer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const { email, name, roleId, password } = await req.json();
  if (!email || !name || !roleId || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role_id, status, must_change_password)
    VALUES (${email}, ${passwordHash}, ${name}, ${roleId}, 'actif', TRUE)
    RETURNING id
  `;

  await logAudit({
    userId: session.id,
    action: "creer",
    module: "utilisateurs",
    resourceId: String(result.rows[0].id),
    details: { email, roleId },
    ip: getIp(req),
  });

  return NextResponse.json({ ok: true, id: result.rows[0].id });
}
