import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { sql } from "@/lib/db";

export const SESSION_COOKIE = "mtdi-session";
export const INACTIVITY_MINUTES = 20;
const ABSOLUTE_SESSION_HOURS = 12; // durée de vie maximale absolue d'une session
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  roleId: number;
  roleName: string;
  permissions: string[];
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ── Création de session (après connexion réussie) ──────────────────────────

export async function createSession(
  userId: number,
  ip: string | null,
  userAgent: string | null
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ABSOLUTE_SESSION_HOURS * 60 * 60 * 1000);

  await sql`
    INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
    VALUES (${userId}, ${tokenHash}, ${ip}, ${userAgent}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ABSOLUTE_SESSION_HOURS * 60 * 60,
  });

  return token;
}

// ── Validation de session (à chaque requête back-office) ───────────────────
// Fenêtre glissante : expire après INACTIVITY_MINUTES sans activité, ou après
// ABSOLUTE_SESSION_HOURS dans tous les cas (plafond dur).

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const result = await sql`
    SELECT s.id AS session_id, s.expires_at, s.last_seen_at, s.revoked_at,
           u.id AS user_id, u.email, u.name, u.status, u.deleted_at,
           r.id AS role_id, r.name AS role_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    JOIN roles r ON r.id = u.role_id
    WHERE s.token_hash = ${tokenHash}
    LIMIT 1
  `;

  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  if (row.revoked_at) return null;
  if (row.deleted_at) return null;
  if (row.status !== "actif") return null;
  if (new Date(row.expires_at) < new Date()) return null;

  const inactiveSince = Date.now() - new Date(row.last_seen_at).getTime();
  if (inactiveSince > INACTIVITY_MINUTES * 60 * 1000) {
    await sql`UPDATE sessions SET revoked_at = now() WHERE id = ${row.session_id}`;
    return null;
  }

  // Fenêtre glissante : on repousse l'expiration d'inactivité à chaque requête
  await sql`UPDATE sessions SET last_seen_at = now() WHERE id = ${row.session_id}`;

  const permsResult = await sql`
    SELECT p.code FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = ${row.role_id}
  `;

  return {
    id: row.user_id,
    email: row.email,
    name: row.name,
    roleId: row.role_id,
    roleName: row.role_name,
    permissions: permsResult.rows.map((p) => p.code),
  };
}

// À utiliser en haut des Server Components / layouts protégés.
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export function hasPermission(session: SessionUser, code: string): boolean {
  return session.permissions.includes(code);
}

export async function revokeCurrentSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  cookieStore.delete(SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = hashToken(token);
  const result = await sql`
    UPDATE sessions SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
    RETURNING user_id
  `;
  return result.rows[0]?.user_id ?? null;
}

// ── Verrouillage anti brute-force ───────────────────────────────────────────

export async function isLocked(userId: number): Promise<boolean> {
  const result = await sql`SELECT locked_until FROM users WHERE id = ${userId}`;
  const lockedUntil = result.rows[0]?.locked_until;
  return !!lockedUntil && new Date(lockedUntil) > new Date();
}

export async function recordFailedAttempt(userId: number): Promise<void> {
  const result = await sql`
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = ${userId}
    RETURNING failed_login_attempts
  `;
  const attempts = result.rows[0]?.failed_login_attempts ?? 0;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    await sql`UPDATE users SET locked_until = ${lockedUntil.toISOString()} WHERE id = ${userId}`;
  }
}

export async function clearFailedAttempts(userId: number): Promise<void> {
  await sql`
    UPDATE users
    SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now()
    WHERE id = ${userId}
  `;
}

// ── Journal d'audit ─────────────────────────────────────────────────────────

export async function logAudit(params: {
  userId: number | null;
  action: string;
  module: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  await sql`
    INSERT INTO audit_logs (user_id, action, module, resource_id, details, ip_address)
    VALUES (
      ${params.userId},
      ${params.action},
      ${params.module},
      ${params.resourceId ?? null},
      ${params.details ? JSON.stringify(params.details) : null},
      ${params.ip ?? null}
    )
  `;
}

// ── Authentification à deux facteurs (par email, code à 6 chiffres) ────────

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function createTwoFactorCode(userId: number): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Un seul code actif à la fois par utilisateur
  await sql`DELETE FROM two_factor_codes WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO two_factor_codes (user_id, code_hash, expires_at)
    VALUES (${userId}, ${codeHash}, ${expiresAt.toISOString()})
  `;

  return code;
}

export async function verifyTwoFactorCode(userId: number, code: string): Promise<boolean> {
  const codeHash = hashCode(code);
  const result = await sql`
    SELECT id, expires_at FROM two_factor_codes
    WHERE user_id = ${userId} AND code_hash = ${codeHash}
  `;
  if (result.rows.length === 0) return false;

  const row = result.rows[0];
  await sql`DELETE FROM two_factor_codes WHERE id = ${row.id}`; // usage unique

  return new Date(row.expires_at) >= new Date();
}

// ── Réglages globaux (table settings, clé/valeur) ───────────────────────────

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const result = await sql`SELECT value FROM settings WHERE key = ${key}`;
  return result.rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await sql`
    INSERT INTO settings (key, value)
    VALUES (${key}, ${JSON.stringify(value)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
}
