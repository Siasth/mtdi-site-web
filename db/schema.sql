-- ============================================================================
-- Schéma CMS MTDI — Utilisateurs, rôles, permissions, contenu bilingue
-- À exécuter une seule fois via /api/admin/setup (voir route associée)
-- ============================================================================

-- ── Rôles & permissions (création dynamique) ──────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT FALSE, -- true pour "Super Admin" : non supprimable
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS permissions (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE, -- ex: 'actualites.creer', 'utilisateurs.gerer'
  module      TEXT NOT NULL,        -- ex: 'actualites', 'utilisateurs', 'roles'
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ── Utilisateurs ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  name           TEXT NOT NULL,
  role_id        INTEGER NOT NULL REFERENCES roles(id),
  status         TEXT NOT NULL DEFAULT 'actif', -- 'actif' | 'desactive'
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ -- suppression logique
);

-- ── Sessions révocables ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  ip_address    TEXT,
  user_agent    TEXT,
  expires_at    TIMESTAMPTZ NOT NULL,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ
);

-- ── Codes 2FA (remplace data/.2fa-pending.json) ────────────────────────────

CREATE TABLE IF NOT EXISTS two_factor_codes (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Journal d'audit ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,        -- 'creer' | 'modifier' | 'supprimer' | 'restaurer' | 'connexion' | 'deconnexion' | 'echec_connexion'
  module       TEXT NOT NULL,        -- 'actualites' | 'utilisateurs' | 'roles' | 'securite' ...
  resource_id  TEXT,
  details      JSONB,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Paramètres globaux (remplace certains champs de security.json) ────────

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Contenu bilingue — module Actualités (pilote du CMS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS actualites (
  id            SERIAL PRIMARY KEY,
  title_fr      TEXT NOT NULL,
  title_en      TEXT,
  excerpt_fr    TEXT,
  excerpt_en    TEXT,
  category      TEXT NOT NULL DEFAULT 'communique', -- 'communique' | 'discours' | 'dossier' | 'revue_presse'
  image         TEXT,
  href_external TEXT, -- si l'article renvoie vers un lien externe
  published_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  featured      BOOLEAN NOT NULL DEFAULT FALSE, -- affiché dans "À la une"
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ -- suppression logique
);

CREATE INDEX IF NOT EXISTS idx_actualites_published ON actualites(published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_actualites_featured ON actualites(featured) WHERE deleted_at IS NULL AND featured = TRUE;

-- ============================================================================
-- Note : les modules suivants (Directions, Structures sous tutelle,
-- Organigramme, Cabinet, Missions, Partenaires, Documenthèque, Textes
-- juridiques, Kit presse, Vidéothèque, Médias, Participer, e-Services)
-- suivront exactement le même patron que la table `actualites` ci-dessus
-- (champs _fr / _en, deleted_at, created_by, display_order) et seront ajoutés
-- au fil des prochaines étapes du chantier, une fois ce socle validé.
-- ============================================================================
