import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { PERMISSIONS, SUPER_ADMIN_ROLE_NAME } from "@/lib/permissions";

// ============================================================================
// Route à usage UNIQUE : initialise le schéma + le compte Super Admin.
// Protégée par SETUP_SECRET (variable d'environnement à définir sur Vercel,
// à retirer ou changer après exécution pour empêcher toute réutilisation).
//
// Le schéma est défini ICI, en dur, sous forme de tableau d'instructions
// distinctes — plutôt que lu depuis db/schema.sql — pour éviter tout risque
// de corruption lors d'un copier-coller (semicolons perdus, etc.).
//
// Appel : POST /api/admin/setup
// Body  : { "secret": "...", "adminEmail": "...", "adminPassword": "..." }
// ============================================================================

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
  )`,

  `CREATE TABLE IF NOT EXISTS permissions (
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    module      TEXT NOT NULL,
    description TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id             SERIAL PRIMARY KEY,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    name           TEXT NOT NULL,
    role_id        INTEGER NOT NULL REFERENCES roles(id),
    status         TEXT NOT NULL DEFAULT 'actif',
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until   TIMESTAMPTZ,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ
  )`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    TEXT NOT NULL UNIQUE,
    ip_address    TEXT,
    user_agent    TEXT,
    expires_at    TIMESTAMPTZ NOT NULL,
    last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at    TIMESTAMPTZ
  )`,

  `CREATE TABLE IF NOT EXISTS two_factor_codes (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash   TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action       TEXT NOT NULL,
    module       TEXT NOT NULL,
    resource_id  TEXT,
    details      JSONB,
    ip_address   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS actualites (
    id            SERIAL PRIMARY KEY,
    title_fr      TEXT NOT NULL,
    title_en      TEXT,
    excerpt_fr    TEXT,
    excerpt_en    TEXT,
    category      TEXT NOT NULL DEFAULT 'communique',
    image         TEXT,
    href_external TEXT,
    published_at  DATE NOT NULL DEFAULT CURRENT_DATE,
    featured      BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by    INTEGER REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
  )`,

  `CREATE INDEX IF NOT EXISTS idx_actualites_published ON actualites(published_at DESC) WHERE deleted_at IS NULL`,

  `CREATE INDEX IF NOT EXISTS idx_actualites_featured ON actualites(featured) WHERE deleted_at IS NULL AND featured = TRUE`,
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { secret, adminEmail, adminPassword, adminName } = body;

  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "adminEmail et adminPassword requis" }, { status: 400 });
  }

  try {
    // 1. Exécuter chaque instruction du schéma (idempotent, IF NOT EXISTS)
    for (let i = 0; i < STATEMENTS.length; i++) {
      try {
        await sql.query(STATEMENTS[i]);
      } catch (stmtErr) {
        return NextResponse.json(
          {
            error: `Échec sur l'instruction SQL n°${i} (sur ${STATEMENTS.length})`,
            statementPreview: STATEMENTS[i].slice(0, 300),
            details: String(stmtErr),
          },
          { status: 500 }
        );
      }
    }

    // 2. Seed des permissions (idempotent via ON CONFLICT)
    for (const p of PERMISSIONS) {
      await sql`
        INSERT INTO permissions (code, module, description)
        VALUES (${p.code}, ${p.module}, ${p.description})
        ON CONFLICT (code) DO UPDATE SET module = EXCLUDED.module, description = EXCLUDED.description
      `;
    }

    // 3. Créer le rôle Super Admin (idempotent)
    const roleResult = await sql`
      INSERT INTO roles (name, description, is_system)
      VALUES (${SUPER_ADMIN_ROLE_NAME}, 'Rôle disposant de toutes les permissions du système', TRUE)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const superAdminRoleId = roleResult.rows[0].id;

    // 4. Associer TOUTES les permissions au rôle Super Admin
    const allPermissions = await sql`SELECT id FROM permissions`;
    for (const perm of allPermissions.rows) {
      await sql`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (${superAdminRoleId}, ${perm.id})
        ON CONFLICT DO NOTHING
      `;
    }

    // 5. Créer le compte Super Admin initial (si l'email n'existe pas déjà)
    const existing = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
    if (existing.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await sql`
        INSERT INTO users (email, password_hash, name, role_id, status, must_change_password)
        VALUES (${adminEmail}, ${passwordHash}, ${adminName || "Super Administrateur"}, ${superAdminRoleId}, 'actif', FALSE)
      `;
    }

    return NextResponse.json({
      ok: true,
      message: "Schéma initialisé, permissions et rôle Super Admin créés.",
      superAdminCreated: existing.rows.length === 0,
    });
  } catch (err) {
    console.error("Erreur setup:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation", details: String(err) },
      { status: 500 }
    );
  }
}
