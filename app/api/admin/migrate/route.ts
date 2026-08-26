import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PERMISSIONS, SUPER_ADMIN_ROLE_NAME } from "@/lib/permissions";
import { MINISTRE_BIO_DEFAULTS } from "@/lib/ministre-bio";

// Convertit "9 juillet 2026" ou "Samedi 2 août 2026 · 09h00" en date ISO.
const FR_MONTHS: Record<string, string> = {
  janvier: "01", février: "02", mars: "03", avril: "04", mai: "05", juin: "06",
  juillet: "07", août: "08", septembre: "09", octobre: "10", novembre: "11", décembre: "12",
};
function parseFrDate(input: string): string {
  const match = input.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i);
  if (!match) return new Date().toISOString().slice(0, 10);
  const [, day, monthName, year] = match;
  const month = FR_MONTHS[monthName.toLowerCase()];
  return `${year}-${month}-${day.padStart(2, "0")}`;
}
function parseFrTime(input: string): string {
  const match = input.match(/(\d{1,2})h(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}:00` : "00:00:00";
}

// ============================================================================
// Route de migration à usage ponctuel, protégée par SETUP_SECRET (la même
// variable que /api/admin/setup — réactivez-la temporairement sur Vercel si
// vous l'aviez retirée, puis appelez cette route, puis retirez-la à nouveau).
//
// Toutes les instructions sont idempotentes (IF NOT EXISTS) : on peut
// rappeler cette route sans risque même si une partie a déjà été appliquée.
// ============================================================================

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json(
      {
        error: "Non autorisé",
        // Diagnostic TEMPORAIRE — ne révèle jamais la valeur elle-même.
        debug: {
          envVarDefined: !!process.env.SETUP_SECRET,
          envVarLength: process.env.SETUP_SECRET?.length ?? 0,
          receivedLength: (secret || "").length,
        },
      },
      { status: 401 }
    );
  }

  try {
    // ── Synchroniser le catalogue de permissions (nouvelles permissions
    // ajoutées au fil des modules) et les accorder automatiquement au rôle
    // Super Admin, sans avoir à rappeler /api/admin/setup.
    for (const p of PERMISSIONS) {
      await sql`
        INSERT INTO permissions (code, module, description)
        VALUES (${p.code}, ${p.module}, ${p.description})
        ON CONFLICT (code) DO UPDATE SET module = EXCLUDED.module, description = EXCLUDED.description
      `;
    }
    const superAdminRole = await sql`SELECT id FROM roles WHERE name = ${SUPER_ADMIN_ROLE_NAME}`;
    if (superAdminRole.rows[0]) {
      const superAdminRoleId = superAdminRole.rows[0].id;
      const allPermissions = await sql`SELECT id FROM permissions`;
      for (const perm of allPermissions.rows) {
        await sql`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES (${superAdminRoleId}, ${perm.id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    await sql.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE`
    );

    await sql`
      INSERT INTO settings (key, value)
      VALUES ('force_2fa_all', 'false'::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;

    // ── Chiffres clés (page d'accueil) ─────────────────────────────────
    // Table vide au départ : on n'invente aucun chiffre, le MTDI les
    // saisira lui-même depuis le back-office.
    await sql.query(`
      CREATE TABLE IF NOT EXISTS stats (
        id            SERIAL PRIMARY KEY,
        label_fr      TEXT NOT NULL,
        label_en      TEXT,
        value         NUMERIC NOT NULL DEFAULT 0,
        max_value     NUMERIC NOT NULL DEFAULT 100,
        unit          TEXT NOT NULL DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0,
        active        BOOLEAN NOT NULL DEFAULT TRUE,
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);

    // Unité bilingue + singulier/pluriel + espacement — "unit" (créée
    // ci-dessus) devient de facto le pluriel français par défaut.
    await sql.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS unit_fr_singular TEXT`);
    await sql.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS unit_en TEXT`);
    await sql.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS unit_en_singular TEXT`);
    await sql.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS no_space BOOLEAN NOT NULL DEFAULT FALSE`);
    await sql.query(`ALTER TABLE stats ADD COLUMN IF NOT EXISTS color TEXT`);

    // ── Paramètres généraux (nom, logos, réseaux sociaux) ──────────────
    // Valeurs par défaut = ce qui est déjà codé en dur aujourd'hui, pour
    // qu'aucun changement ne soit visible tant que personne ne modifie rien.
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('site_general', ${JSON.stringify({
        siteName: "Ministère de la Transformation Digitale et de l'Innovation",
        siteNameShort: "MTDI",
        taglineFr: "",
        taglineEn: "",
        logoHeader: "/mtdi-banner.png",
        logoFooter: "/mtdi-banner.png",
        favicon: "/favicon.ico",
        facebook: "https://www.facebook.com/innovationbenin",
        twitter: "",
        linkedin: "https://www.linkedin.com/company/innovationbenin",
        instagram: "https://www.instagram.com/benin.innov/",
        youtube: "",
        contactEmail: "contact@gouv.bj",
        contactPhone: "",
        contactAddress: "",
        contactAddressEn: "",
      })}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;

    // Correction : ajouter l'adresse anglaise si absente (site_general déjà
    // créé lors d'une migration précédente, sans ce champ à l'époque).
    await sql`
      UPDATE settings
      SET value = value || '{"contactAddressEn": "Boulevard de la Marina\\n01 BP 412 Cotonou\\nRepublic of Benin"}'::jsonb
      WHERE key = 'site_general' AND (value->>'contactAddressEn' IS NULL OR value->>'contactAddressEn' = '')
    `;

    // Correction : ajouter les horaires d'ouverture bilingues si absents
    // (regroupés avec l'adresse — "coordonnées" au sens large, comme demandé).
    await sql`
      UPDATE settings
      SET value = value || '{"openingHoursFr": "Lundi – Vendredi : 8h00 – 17h00", "openingHoursEn": "Monday – Friday: 8:00 AM – 5:00 PM"}'::jsonb
      WHERE key = 'site_general' AND (value->>'openingHoursFr' IS NULL OR value->>'openingHoursFr' = '')
    `;

    // ── Mot du Ministre (page d'accueil) ────────────────────────────────
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('ministre_message', ${JSON.stringify({
        name: "Mahuna Akplogan",
        photo: "/ministre.png",
        titleFr: "Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA",
        titleEn: "Minister of Digital Transformation and Innovation, in charge of the National AI Strategy",
        badgeFr: "Ministre en charge",
        badgeEn: "Minister in charge",
        badgeSubFr: "Transformation Digitale & IA",
        badgeSubEn: "Digital Transformation & AI",
        headingFr: "Le Bénin déploie.\nLe Bénin construit.\nLe Bénin innove.",
        headingEn: "Benin deploys.\nBenin builds.\nBenin innovates.",
        contentFr: "<p>La technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.</p><p>Le Ministère de la Transformation Digitale et de l'Innovation a pour mission de conduire la feuille de route technologique au service des politiques publiques, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif.</p>",
        contentEn: "",
      })}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;

    // ── Pilote Actualités : colonne read_time + import des articles existants ──
    await sql.query(
      `ALTER TABLE actualites ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '3 min'`
    );

    // ── Workflow éditorial : brouillon / publié / dépublié / archivé ──────
    // On vérifie si la colonne existe déjà AVANT de l'ajouter, pour ne faire
    // le bascule "tout en publié" qu'une seule fois (première exécution),
    // sans jamais écraser un statut déjà choisi par un éditeur par la suite.
    const columnCheck = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'actualites' AND column_name = 'status'
    `;
    const statusColumnAlreadyExisted = columnCheck.rows.length > 0;

    await sql.query(
      `ALTER TABLE actualites ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'brouillon'`
    );

    // Pièces jointes (ex: PDF d'un communiqué) — tableau JSON [{name, url}]
    await sql.query(
      `ALTER TABLE actualites ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb`
    );

    if (!statusColumnAlreadyExisted) {
      // Les articles déjà présents avant l'introduction du statut étaient de
      // facto publiés : on les bascule une seule fois, à la création de la colonne.
      await sql.query(`UPDATE actualites SET status = 'publie' WHERE status = 'brouillon'`);
    }

    await sql.query(
      `CREATE INDEX IF NOT EXISTS idx_actualites_status ON actualites(status) WHERE deleted_at IS NULL`
    );

    // ── Vraie gestion des catégories (remplace le texte libre) ────────────
    await sql.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id            SERIAL PRIMARY KEY,
        name_fr       TEXT NOT NULL,
        name_en       TEXT,
        color         TEXT NOT NULL DEFAULT '#006828',
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);

    const categoriesCount = await sql`SELECT COUNT(*) AS count FROM categories`;
    if (Number(categoriesCount.rows[0].count) === 0) {
      const defaultCategories = [
        { fr: "Communiqué", en: "Press Release", color: "#006828" },
        { fr: "Discours", en: "Speech", color: "#FFBE00" },
        { fr: "Dossier", en: "Feature", color: "#EB0000" },
        { fr: "Revue de presse", en: "Press Review", color: "#0369a1" },
        { fr: "Nomination", en: "Appointment", color: "#7c3aed" },
        { fr: "Innovation", en: "Innovation", color: "#0891b2" },
      ];
      for (let i = 0; i < defaultCategories.length; i++) {
        const c = defaultCategories[i];
        await sql`
          INSERT INTO categories (name_fr, name_en, color, display_order)
          VALUES (${c.fr}, ${c.en}, ${c.color}, ${i})
        `;
      }
    }

    // Rattacher les articles à leur catégorie (par correspondance de nom),
    // une seule fois (idempotent via vérification de la colonne).
    const categoryColumnCheck = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'actualites' AND column_name = 'category_id'
    `;
    const categoryColumnAlreadyExisted = categoryColumnCheck.rows.length > 0;

    await sql.query(
      `ALTER TABLE actualites ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)`
    );

    if (!categoryColumnAlreadyExisted) {
      // Associer chaque article à la catégorie dont le nom FR correspond
      // (insensible à la casse). Repli sur la première catégorie si aucune
      // correspondance (ex : "IA & Culture" du jeu de données initial).
      await sql.query(`
        UPDATE actualites a
        SET category_id = c.id
        FROM categories c
        WHERE a.category_id IS NULL AND LOWER(a.category) = LOWER(c.name_fr)
      `);
      await sql.query(`
        UPDATE actualites a
        SET category_id = (SELECT id FROM categories ORDER BY display_order ASC LIMIT 1)
        WHERE a.category_id IS NULL
      `);
    }

    const existingCount = await sql`SELECT COUNT(*) AS count FROM actualites`;
    if (Number(existingCount.rows[0].count) === 0) {
      const seedArticles = [
        { category: "Communiqué", title: "Olympiades Nationales d'Intelligence Artificielle : les lauréats distingués", excerpt: "Les meilleurs jeunes talents béninois en IA ont été sélectionnés lors de la cérémonie du 4 juillet à Sèmè One. Huit d'entre eux constitueront l'équipe nationale aux IOAI 2026 à Astana.", date: "2026-07-06", image: "/olympiades.jpg", link: "https://www.gouv.bj/article/3579/", readTime: "3 min", featured: true },
        { category: "Communiqué", title: "Le Bénin lance les Olympiades Nationales d'IA pour sélectionner les talents qui représenteront le pays au Kazakhstan", excerpt: "Première édition des NOAI pour sélectionner les talents qui représenteront le pays aux Olympiades Internationales d'IA au Kazakhstan du 2 au 8 août 2026.", date: "2026-06-28", image: "", link: "https://www.gouv.bj/article/3565/", readTime: "3 min", featured: false },
        { category: "Dossier", title: "2ème Conférence des RSSI : le Ministre Akplogan pose la sécurité numérique au cœur de l'ambition de l'État augmenté", excerpt: "Sous le thème « IA pour la cybersécurité et cybersécurité pour l'IA », la conférence a réuni les responsables de la sécurité des systèmes d'information du secteur public et privé.", date: "2026-06-26", image: "/alaune-cyber.jpg", link: "https://www.gouv.bj/article/3560/", readTime: "4 min", featured: true },
        { category: "Nomination", title: "Mahuna Akplogan nommé Ministre de la Transformation Digitale et de l'Innovation, en charge de la Stratégie Nationale d'IA", excerpt: "", date: "2026-05-25", image: "/alaune-partenariat.jpg", link: "", readTime: "2 min", featured: true },
        { category: "Innovation", title: "GPT.bj, le chatbot gouvernemental béninois, remporte le prix Innovation au Gitex Africa", excerpt: "", date: "2025-01-01", image: "/alaune-startups.jpg", link: "", readTime: "2 min", featured: false },
        { category: "IA & Culture", title: "« J'aime ma langue » : une initiative citoyenne pour intégrer le Fon, le Yoruba et le Bariba dans les modèles d'IA", excerpt: "", date: "2025-01-01", image: "/alaune-service.jpg", link: "", readTime: "2 min", featured: false },
      ];

      for (let i = 0; i < seedArticles.length; i++) {
        const a = seedArticles[i];
        const catMatch = await sql`SELECT id FROM categories WHERE LOWER(name_fr) = LOWER(${a.category})`;
        const fallbackCat = await sql`SELECT id FROM categories ORDER BY display_order ASC LIMIT 1`;
        const categoryId = catMatch.rows[0]?.id ?? fallbackCat.rows[0]?.id ?? null;
        await sql`
          INSERT INTO actualites (title_fr, excerpt_fr, category, category_id, image, href_external, published_at, featured, display_order, read_time, status)
          VALUES (${a.title}, ${a.excerpt}, ${a.category}, ${categoryId}, ${a.image}, ${a.link || null}, ${a.date}, ${a.featured}, ${i}, ${a.readTime}, 'publie')
        `;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // Hero, Grands Chantiers, Galerie, Direct — 4 derniers modules du
    // chantier de branchement back-office ↔ site public (Phase 1)
    // ══════════════════════════════════════════════════════════════════

    // ── Hero (bannière accueil) ─────────────────────────────────────────
    await sql.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id            SERIAL PRIMARY KEY,
        image         TEXT NOT NULL,
        video         TEXT,
        alt_fr        TEXT NOT NULL DEFAULT '',
        alt_en        TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active        BOOLEAN NOT NULL DEFAULT TRUE,
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);

    const heroCount = await sql`SELECT COUNT(*) AS count FROM hero_slides`;
    if (Number(heroCount.rows[0].count) === 0) {
      const seedHero = [
        { src: "/hero-conference.jpg", alt: "Conférence sur le numérique en Afrique" },
        { src: "/hero-graduation.jpg", alt: "Cérémonie de remise des diplômes" },
        { src: "/hero-city.jpg", alt: "Boulevard de la Marina, Cotonou" },
        { src: "/hero-auditorium.jpg", alt: "Diplômés célébrant leur réussite" },
        { src: "/chantier-01-ia.jpg", alt: "Intelligence artificielle" },
      ];
      for (let i = 0; i < seedHero.length; i++) {
        const s = seedHero[i];
        await sql`
          INSERT INTO hero_slides (image, alt_fr, display_order)
          VALUES (${s.src}, ${s.alt}, ${i})
        `;
      }
    }

    // ── Grands Chantiers ─────────────────────────────────────────────────
    await sql.query(`
      CREATE TABLE IF NOT EXISTS chantiers (
        id            SERIAL PRIMARY KEY,
        number        TEXT NOT NULL DEFAULT '',
        title_fr      TEXT NOT NULL,
        title_en      TEXT,
        subtitle_fr   TEXT,
        subtitle_en   TEXT,
        description_fr TEXT,
        description_en TEXT,
        image         TEXT,
        stats         JSONB NOT NULL DEFAULT '[]'::jsonb,
        display_order INTEGER NOT NULL DEFAULT 0,
        active        BOOLEAN NOT NULL DEFAULT TRUE,
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);

    await sql.query(`ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS color TEXT`);
    await sql.query(`ALTER TABLE chantiers ADD COLUMN IF NOT EXISTS video TEXT`);

    const chantiersCount = await sql`SELECT COUNT(*) AS count FROM chantiers`;
    if (Number(chantiersCount.rows[0].count) === 0) {
      // ⚠️ Les valeurs de "stats" ci-dessous (12 projets IA, 47 services...)
    // sont des exemples PLACEHOLDER non vérifiés — le site public actuel
    // n'affichait aucune statistique (stats: [] en dur). À valider avec le
    // MTDI avant publication réelle, ou à vider depuis le back-office.
    const seedChantiers = [
        { number: "01", title: "Faire du Bénin un leader africain de l'IA", subtitle: "Stratégie nationale · Vision 2030", description: "Le Bénin adopte sa stratégie nationale d'intelligence artificielle. Des laboratoires publics, des partenariats internationaux et une gouvernance éthique pour positionner le pays comme référence continentale.", image: "/chantier-01-ia.jpg", stats: [{ value: "12", labelFr: "projets IA en cours" }, { value: "3", labelFr: "laboratoires publics" }, { value: "2030", labelFr: "horizon stratégie" }] },
        { number: "02", title: "Des services publics 100 % numériques", subtitle: "E-gouvernement · Accessibilité", description: "Naissance, mariage, impôts, permis : tous les actes de la vie administrative accessibles en ligne, sans déplacement, depuis n'importe quel téléphone.", image: "/chantier-02-services.jpg", stats: [{ value: "47", labelFr: "services dématérialisés" }, { value: "200K+", labelFr: "usagers actifs" }, { value: "24/7", labelFr: "disponibilité" }] },
        { number: "03", title: "Connecter tout le territoire", subtitle: "Infrastructure · Connectivité", description: "Fibre optique, 4G étendue, points d'accès communautaires. Aucune commune béninoise ne sera laissée hors du réseau numérique national.", image: "/chantier-03-connectivite.jpg", stats: [{ value: "2 000", labelFr: "km de fibre" }, { value: "14", labelFr: "nouvelles communes" }, { value: "2028", labelFr: "objectif 100 %" }] },
        { number: "04", title: "Former les talents de demain", subtitle: "Digital Academy · Compétences", description: "Coding bootcamps, certifications IA, formation des agents de l'État : le Bénin investit dans son capital humain numérique pour les 10 prochaines années.", image: "/chantier-04-formation.jpg", stats: [{ value: "5 000", labelFr: "jeunes formés" }, { value: "200", labelFr: "agents certifiés" }, { value: "30", labelFr: "écoles partenaires" }] },
        { number: "05", title: "Protéger l'espace numérique national", subtitle: "Cybersécurité · Confiance", description: "CSIRT national, cadre juridique du numérique, protection des données personnelles. La confiance numérique est un prérequis de la souveraineté.", image: "/chantier-05-cyber.jpg", stats: [{ value: "CSIRT.bj", labelFr: "opérationnel" }, { value: "1 / an", labelFr: "audit sécurité" }, { value: "24 h", labelFr: "réponse incidents" }] },
      ];
      for (let i = 0; i < seedChantiers.length; i++) {
        const c = seedChantiers[i];
        await sql`
          INSERT INTO chantiers (number, title_fr, subtitle_fr, description_fr, image, stats, display_order)
          VALUES (${c.number}, ${c.title}, ${c.subtitle}, ${c.description}, ${c.image}, ${JSON.stringify(c.stats)}::jsonb, ${i})
        `;
      }
    }

    // ── Galerie : collections + éléments ─────────────────────────────────
    await sql.query(`
      CREATE TABLE IF NOT EXISTS galerie_collections (
        id            SERIAL PRIMARY KEY,
        name_fr       TEXT NOT NULL,
        name_en       TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        deleted_at    TIMESTAMPTZ
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS galerie_items (
        id             SERIAL PRIMARY KEY,
        type           TEXT NOT NULL DEFAULT 'photo', -- 'photo' | 'video'
        title_fr       TEXT NOT NULL,
        title_en       TEXT,
        description_fr TEXT,
        description_en TEXT,
        event_date     DATE,
        credit         TEXT,
        collection_id  INTEGER REFERENCES galerie_collections(id),
        image          TEXT,
        video_url      TEXT,
        href_external  TEXT,
        featured_home  BOOLEAN NOT NULL DEFAULT FALSE,
        status         TEXT NOT NULL DEFAULT 'brouillon',
        display_order  INTEGER NOT NULL DEFAULT 0,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);

    const collectionsCount = await sql`SELECT COUNT(*) AS count FROM galerie_collections`;
    if (Number(collectionsCount.rows[0].count) === 0) {
      const seedCollections = ["Événements officiels", "Infrastructures", "Formation & Jeunesse", "Cybersécurité", "Coopération internationale"];
      for (let i = 0; i < seedCollections.length; i++) {
        await sql`INSERT INTO galerie_collections (name_fr, display_order) VALUES (${seedCollections[i]}, ${i})`;
      }

      const seedGalerie = [
        { type: "photo", title: "Ouverture du Sommet Afrique Digitale 2026", description: "Le Ministre prononce le discours d'ouverture devant les délégations de 32 pays africains réunis à Cotonou.", date: "9 juillet 2026", credit: "MTDI / Direction de la Communication", collection: "Événements officiels" },
        { type: "photo", title: "Signature du décret portant création de l'ANAI", description: "Cérémonie officielle de signature du décret instituant l'Agence Nationale de l'Intelligence Artificielle.", date: "11 juillet 2026", credit: "Présidence de la République", collection: "Événements officiels" },
        { type: "video", title: "Discours du Ministre : Sommet Afrique Digitale", description: "Intervention intégrale du Ministre lors de la session plénière du Sommet.", date: "9 juillet 2026", credit: "MTDI", collection: "Événements officiels" },
        { type: "photo", title: "Cérémonie des vœux au corps diplomatique", description: "Le Ministre reçoit les ambassadeurs et représentants d'organisations internationales.", date: "15 mai 2026", credit: "MTDI / Direction de la Communication", collection: "Événements officiels" },
        { type: "photo", title: "Visite du chantier fibre optique : Parakou", description: "Inspection des travaux de déploiement de la dorsale fibre optique nationale. 2 000 km de fibre déjà posés.", date: "30 juin 2026", credit: "MTDI / Cellule Infrastructures", collection: "Infrastructures" },
        { type: "photo", title: "Inauguration du Data Center souverain : Phase 1", description: "Première phase du centre de données souverain du Bénin.", date: "22 juin 2026", credit: "MTDI", collection: "Infrastructures" },
        { type: "photo", title: "Lancement de MonIdentité.bj : Saison 2", description: "Deuxième phase du programme d'identité numérique, objectif de 500 000 usagers.", date: "10 juin 2026", credit: "MTDI / Direction de la Communication", collection: "Infrastructures" },
        { type: "photo", title: "Remise des diplômes : Digital Academy, Promotion 2026", description: "200 jeunes développeurs et data scientists reçoivent leurs certificats.", date: "5 juillet 2026", credit: "MTDI / Digital Academy", collection: "Formation & Jeunesse" },
        { type: "photo", title: "Hackathon IA étudiants : Université d'Abomey-Calavi", description: "48 heures de compétition pour concevoir des solutions IA.", date: "2 juin 2026", credit: "MTDI / Digital Academy", collection: "Formation & Jeunesse" },
        { type: "video", title: "Présentation de la Stratégie IA 2030 : Assemblée nationale", description: "Le Ministre présente aux députés les grandes lignes de la SNIAM.", date: "28 mai 2026", credit: "Assemblée nationale du Bénin", collection: "Formation & Jeunesse" },
        { type: "photo", title: "Déploiement des stations CERT.bj", description: "Installation des équipements de surveillance et de réponse aux incidents.", date: "18 juin 2026", credit: "MTDI / CERT.bj", collection: "Cybersécurité" },
        { type: "video", title: "Forum IA & Éthique : Session plénière UNESCO × Bénin", description: "Forum réunissant chercheurs, responsables politiques et société civile.", date: "15 juin 2026", credit: "UNESCO / MTDI", collection: "Coopération internationale" },
        { type: "photo", title: "Rencontre avec les startups : Bénin IA Challenge", description: "Le Ministre échange avec les 50 startups sélectionnées.", date: "2 juin 2026", credit: "MTDI / Direction de l'Innovation", collection: "Coopération internationale" },
        { type: "video", title: "Interview du Ministre : RFI", description: "Entretien exclusif sur les ambitions numériques du Bénin.", date: "3 juillet 2026", credit: "RFI / MTDI", collection: "Coopération internationale" },
      ];

      for (let i = 0; i < seedGalerie.length; i++) {
        const g = seedGalerie[i];
        const col = await sql`SELECT id FROM galerie_collections WHERE name_fr = ${g.collection}`;
        await sql`
          INSERT INTO galerie_items (type, title_fr, description_fr, event_date, credit, collection_id, display_order, status)
          VALUES (${g.type}, ${g.title}, ${g.description}, ${parseFrDate(g.date)}, ${g.credit}, ${col.rows[0]?.id ?? null}, ${i}, 'publie')
        `;
      }
    }

    // ── Direct : événements à venir + rediffusions ──────────────────────
    await sql.query(`
      CREATE TABLE IF NOT EXISTS direct_upcoming (
        id             SERIAL PRIMARY KEY,
        event_date     TIMESTAMPTZ NOT NULL,
        title_fr       TEXT NOT NULL,
        title_en       TEXT,
        description_fr TEXT,
        description_en TEXT,
        display_order  INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS direct_replays (
        id            SERIAL PRIMARY KEY,
        title_fr      TEXT NOT NULL,
        title_en      TEXT,
        source        TEXT,
        replay_date   DATE,
        url           TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active        BOOLEAN NOT NULL DEFAULT TRUE,
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);

    const upcomingCount = await sql`SELECT COUNT(*) AS count FROM direct_upcoming`;
    if (Number(upcomingCount.rows[0].count) === 0) {
      const seedUpcoming = [
        { date: "Samedi 2 août 2026 · 09h00", title: "Olympiades Internationales d'IA 2026 — Cérémonie d'ouverture à Astana", description: "Retransmission en direct de la cérémonie d'ouverture des IOAI 2026 au Kazakhstan. L'équipe nationale du Bénin (8 jeunes talents) y représentera le pays parmi 60+ nations." },
        { date: "Vendredi 8 août 2026 · 15h00", title: "IOAI 2026 — Cérémonie de clôture et résultats", description: "Annonce des résultats et remise des médailles des Olympiades Internationales d'Intelligence Artificielle." },
      ];
      for (let i = 0; i < seedUpcoming.length; i++) {
        const u = seedUpcoming[i];
        const isoDate = parseFrDate(u.date);
        const isoTime = parseFrTime(u.date);
        await sql`
          INSERT INTO direct_upcoming (event_date, title_fr, description_fr, display_order)
          VALUES (${`${isoDate}T${isoTime}`}, ${u.title}, ${u.description}, ${i})
        `;
      }
    }

    const replaysCount = await sql`SELECT COUNT(*) AS count FROM direct_replays`;
    if (Number(replaysCount.rows[0].count) === 0) {
      const seedReplays = [
        { title: "Intelligence artificielle : pourquoi un ministère y est dédié — Bénin TV", source: "Bénin TV", date: "28 mai 2026", url: "https://www.youtube.com/watch?v=ANyQSwEspC0" },
        { title: "Olympiades de l'IA : le Bénin sème les graines du futur — Bénin TV", source: "Bénin TV", date: "27 juin 2026", url: "https://www.youtube.com/watch?v=TnvuuXZEjCw" },
        { title: "NOAI 2026 : le Bénin prépare ses talents pour les Olympiades internationales d'IA", source: "YouTube", date: "2026-06-01", url: "https://www.youtube.com/watch?v=wuvN-U6TT_0" },
        { title: "Conférence RSSI 2026 : IA et cybersécurité — Compte rendu", source: "La Nation", date: "25 juin 2026", url: "https://lanation.bj/numerique/conference-des-rssi-les-experts-mobilises-pour-une-cybersecurite-plus-resiliente" },
      ];
      for (let i = 0; i < seedReplays.length; i++) {
        const r = seedReplays[i];
        const isoDate = /^\d{4}-\d{2}/.test(r.date) ? r.date : parseFrDate(r.date);
        await sql`
          INSERT INTO direct_replays (title_fr, source, replay_date, url, display_order)
          VALUES (${r.title}, ${r.source}, ${isoDate}, ${r.url}, ${i})
        `;
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises PROPOSÉES par défaut (idempotent : ne remplit
    // que les champs encore vides/NULL, jamais une traduction déjà saisie
    // manuellement). À relire avant publication.
    // ══════════════════════════════════════════════════════════════════

    // Hero
    const heroTranslations: Record<string, string> = {
      "/hero-conference.jpg": "Digital conference in Africa",
      "/hero-graduation.jpg": "Graduation ceremony",
      "/hero-city.jpg": "Boulevard de la Marina, Cotonou",
      "/hero-auditorium.jpg": "Graduates celebrating their achievement",
      "/chantier-01-ia.jpg": "Artificial intelligence",
    };
    for (const [image, altEn] of Object.entries(heroTranslations)) {
      await sql`UPDATE hero_slides SET alt_en = ${altEn} WHERE image = ${image} AND alt_en IS NULL`;
    }

    // Grands Chantiers (par numéro)
    const chantiersTranslations: Record<string, { title: string; subtitle: string; description: string; stats: string[] }> = {
      "01": {
        title: "Making Benin an African leader in AI",
        subtitle: "National strategy · Vision 2030",
        description: "Benin is adopting its national artificial intelligence strategy. Public laboratories, international partnerships, and ethical governance to position the country as a continental benchmark.",
        stats: ["ongoing AI projects", "public laboratories", "strategy horizon"],
      },
      "02": {
        title: "100% digital public services",
        subtitle: "E-government · Accessibility",
        description: "Birth, marriage, taxes, permits: all administrative procedures available online, with no need to travel, from any phone.",
        stats: ["digitized services", "active users", "availability"],
      },
      "03": {
        title: "Connecting the entire territory",
        subtitle: "Infrastructure · Connectivity",
        description: "Fiber optics, extended 4G, community access points. No municipality in Benin will be left outside the national digital network.",
        stats: ["km of fiber", "new municipalities", "100% target"],
      },
      "04": {
        title: "Training tomorrow's talent",
        subtitle: "Digital Academy · Skills",
        description: "Coding bootcamps, AI certifications, civil servant training: Benin is investing in its digital human capital for the next 10 years.",
        stats: ["young people trained", "certified civil servants", "partner schools"],
      },
      "05": {
        title: "Protecting the national digital space",
        subtitle: "Cybersecurity · Trust",
        description: "National CSIRT, digital legal framework, personal data protection. Digital trust is a prerequisite for sovereignty.",
        stats: ["operational", "security audit", "incident response"],
      },
    };
    for (const [number, t] of Object.entries(chantiersTranslations)) {
      const row = await sql`SELECT id, stats, title_en FROM chantiers WHERE number = ${number}`;
      if (row.rows.length === 0 || row.rows[0].title_en) continue; // déjà traduit
      const existingStats = row.rows[0].stats as { value: string; labelFr: string; labelEn?: string }[];
      const mergedStats = existingStats.map((s, i) => ({ ...s, labelEn: s.labelEn || t.stats[i] }));
      await sql`
        UPDATE chantiers SET title_en = ${t.title}, subtitle_en = ${t.subtitle}, description_en = ${t.description}, stats = ${JSON.stringify(mergedStats)}::jsonb
        WHERE number = ${number}
      `;
    }

    // Galerie : collections
    const collectionsTranslations: Record<string, string> = {
      "Événements officiels": "Official events",
      "Infrastructures": "Infrastructure",
      "Formation & Jeunesse": "Training & Youth",
      "Cybersécurité": "Cybersecurity",
      "Coopération internationale": "International cooperation",
    };
    for (const [nameFr, nameEn] of Object.entries(collectionsTranslations)) {
      await sql`UPDATE galerie_collections SET name_en = ${nameEn} WHERE name_fr = ${nameFr} AND name_en IS NULL`;
    }

    // Galerie : éléments (par titre FR, identifiant unique dans le jeu de données)
    const galerieTranslations: Record<string, { title: string; description: string }> = {
      "Ouverture du Sommet Afrique Digitale 2026": { title: "Opening of the Africa Digital Summit 2026", description: "The Minister delivers the opening address before delegations from 32 African countries gathered in Cotonou." },
      "Signature du décret portant création de l'ANAI": { title: "Signing of the decree establishing the ANAI", description: "Official signing ceremony of the decree establishing the National Artificial Intelligence Agency." },
      "Discours du Ministre : Sommet Afrique Digitale": { title: "Minister's address: Africa Digital Summit", description: "Full address by the Minister during the Summit's plenary session." },
      "Cérémonie des vœux au corps diplomatique": { title: "New Year greetings ceremony for the diplomatic corps", description: "The Minister receives ambassadors and representatives of international organizations." },
      "Visite du chantier fibre optique : Parakou": { title: "Visit to the fiber optic construction site: Parakou", description: "Inspection of the national fiber optic backbone deployment. 2,000 km of fiber already laid." },
      "Inauguration du Data Center souverain : Phase 1": { title: "Inauguration of the sovereign Data Center: Phase 1", description: "First phase of Benin's sovereign data center." },
      "Lancement de MonIdentité.bj : Saison 2": { title: "Launch of MonIdentité.bj: Season 2", description: "Second phase of the digital identity program, targeting 500,000 users." },
      "Remise des diplômes : Digital Academy, Promotion 2026": { title: "Graduation ceremony: Digital Academy, Class of 2026", description: "200 young developers and data scientists receive their certificates." },
      "Hackathon IA étudiants : Université d'Abomey-Calavi": { title: "Student AI Hackathon: University of Abomey-Calavi", description: "48 hours of competition to design AI solutions." },
      "Présentation de la Stratégie IA 2030 : Assemblée nationale": { title: "Presentation of the AI Strategy 2030: National Assembly", description: "The Minister presents the outline of the SNIAM to members of parliament." },
      "Déploiement des stations CERT.bj": { title: "Deployment of CERT.bj stations", description: "Installation of monitoring and incident response equipment." },
      "Forum IA & Éthique : Session plénière UNESCO × Bénin": { title: "AI & Ethics Forum: UNESCO × Benin plenary session", description: "Forum bringing together researchers, policymakers, and civil society." },
      "Rencontre avec les startups : Bénin IA Challenge": { title: "Meeting with startups: Benin AI Challenge", description: "The Minister meets with the 50 selected startups." },
      "Interview du Ministre : RFI": { title: "Minister's interview: RFI", description: "Exclusive interview on Benin's digital ambitions." },
    };
    for (const [titleFr, t] of Object.entries(galerieTranslations)) {
      await sql`
        UPDATE galerie_items SET title_en = ${t.title}, description_en = ${t.description}
        WHERE title_fr = ${titleFr} AND title_en IS NULL
      `;
    }

    // Marquer quelques éléments variés comme "à la une" pour le widget accueil
    // (aucun ne l'était par défaut — sans ça, le widget resterait vide).
    const featuredHomeTitles = [
      "Ouverture du Sommet Afrique Digitale 2026",
      "Signature du décret portant création de l'ANAI",
      "Discours du Ministre : Sommet Afrique Digitale",
      "Visite du chantier fibre optique : Parakou",
      "Remise des diplômes : Digital Academy, Promotion 2026",
      "Déploiement des stations CERT.bj",
      "Rencontre avec les startups : Bénin IA Challenge",
      "Interview du Ministre : RFI",
    ];
    for (const titleFr of featuredHomeTitles) {
      await sql`UPDATE galerie_items SET featured_home = TRUE WHERE title_fr = ${titleFr}`;
    }

    // Direct : événements à venir (par titre FR)
    const upcomingTranslations: Record<string, { title: string; description: string }> = {
      "Olympiades Internationales d'IA 2026 — Cérémonie d'ouverture à Astana": {
        title: "2026 International AI Olympiad — Opening ceremony in Astana",
        description: "Live broadcast of the IOAI 2026 opening ceremony in Kazakhstan. Benin's national team (8 young talents) will represent the country among 60+ nations.",
      },
      "IOAI 2026 — Cérémonie de clôture et résultats": {
        title: "IOAI 2026 — Closing ceremony and results",
        description: "Announcement of results and medal ceremony for the International AI Olympiad.",
      },
    };
    for (const [titleFr, t] of Object.entries(upcomingTranslations)) {
      await sql`UPDATE direct_upcoming SET title_en = ${t.title}, description_en = ${t.description} WHERE title_fr = ${titleFr} AND title_en IS NULL`;
    }

    // Direct : rediffusions (par titre FR)
    const replaysTranslations: Record<string, string> = {
      "Intelligence artificielle : pourquoi un ministère y est dédié — Bénin TV": "Artificial intelligence: why a dedicated ministry — Bénin TV",
      "Olympiades de l'IA : le Bénin sème les graines du futur — Bénin TV": "AI Olympiad: Benin sows the seeds of the future — Bénin TV",
      "NOAI 2026 : le Bénin prépare ses talents pour les Olympiades internationales d'IA": "NOAI 2026: Benin prepares its talents for the International AI Olympiad",
      "Conférence RSSI 2026 : IA et cybersécurité — Compte rendu": "CISO Conference 2026: AI and cybersecurity — Report",
    };
    for (const [titleFr, titleEn] of Object.entries(replaysTranslations)) {
      await sql`UPDATE direct_replays SET title_en = ${titleEn} WHERE title_fr = ${titleFr} AND title_en IS NULL`;
    }

    // Mot du Ministre : paragraphes — la version FR correspond exactement à
    // celle déjà utilisée, mais la traduction EN officielle du dictionnaire
    // (dictionaries/en.json → home.ministreP1/P2) est plus précise que celle
    // que j'avais proposée : on l'utilise à la place.
    await sql`
      UPDATE settings SET value = value || ${JSON.stringify({
        contentEn: "<p>Technology is only valuable for what it concretely changes in people's lives, and above all for its contribution to eradicating extreme poverty.</p><p>The Ministry of Digital Transformation and Innovation's mission is to lead the technology roadmap in service of public policies, and to build a dynamic, inclusive and competitive innovation ecosystem.</p>",
      })}::jsonb
      WHERE key = 'ministre_message' AND (value->>'contentEn' IS NULL OR value->>'contentEn' = '')
    `;

    // Grands Chantiers : le dictionnaire (dictionaries/fr.json et en.json,
    // clé "chantiers") contient une version plus précise et déjà traduite
    // officiellement (références réelles : SNIAM, loi n°2017-20, SMART GOUV,
    // SBIN...) que celle importée depuis data/chantiers.json. On remplace le
    // titre/sous-titre/description par cette version — les 3 mini-chiffres
    // par chantier n'existent pas dans le dictionnaire, on les garde tels quels.
    const chantiersOfficiels: Record<string, { titleFr: string; subtitleFr: string; descriptionFr: string; titleEn: string; subtitleEn: string; descriptionEn: string }> = {
      "01": {
        titleFr: "Faire du Bénin un leader africain de l'IA", subtitleFr: "SNIAM 2023–2027",
        descriptionFr: "Adoptée par le Conseil des Ministres le 18 janvier 2023, la Stratégie Nationale d'Intelligence Artificielle et des Mégadonnées (SNIAM) structure l'action du Bénin en 4 programmes sur 5 ans.",
        titleEn: "Make Benin an African AI leader", subtitleEn: "SNIAM 2023–2027",
        descriptionEn: "Adopted by the Council of Ministers on January 18, 2023, the National AI and Big Data Strategy (SNIAM) structures Benin's action in 4 programs over 5 years.",
      },
      "02": {
        titleFr: "Des services publics numériques", subtitleFr: "E-gouvernement · SMART GOUV",
        descriptionFr: "Le programme SMART GOUV (phase 2) poursuit la dématérialisation des services publics pour les rendre accessibles en ligne, sans déplacement, depuis n'importe quel appareil.",
        titleEn: "Digital public services", subtitleEn: "E-government · SMART GOUV",
        descriptionEn: "The SMART GOUV program (phase 2) continues the digitization of public services to make them accessible online, without travel, from any device.",
      },
      "03": {
        titleFr: "Connecter tout le territoire", subtitleFr: "Infrastructure · Connectivité",
        descriptionFr: "La SBIN déploie un réseau backbone à fibre optique national et poursuit le programme Internet haut et très haut débit (phase 2) pour couvrir l'ensemble du territoire, y compris les zones rurales.",
        titleEn: "Connect the entire territory", subtitleEn: "Infrastructure · Connectivity",
        descriptionEn: "SBIN is deploying a national fiber optic backbone network and continuing the high and very high-speed internet program (phase 2) to cover the entire territory, including rural areas.",
      },
      "04": {
        titleFr: "Former les talents de demain", subtitleFr: "Formation · Olympiades IA",
        descriptionFr: "Le Bénin investit dans la formation aux compétences numériques et à l'intelligence artificielle. Les premières Olympiades Nationales d'IA ont réuni des talents de tout le pays.",
        titleEn: "Training tomorrow's talents", subtitleEn: "Training · AI Olympiads",
        descriptionEn: "Benin invests in digital skills and artificial intelligence training. The first National AI Olympiads brought together talents from across the country.",
      },
      "05": {
        titleFr: "Protéger l'espace numérique national", subtitleFr: "Cybersécurité · CRSSI",
        descriptionFr: "Cadre juridique du numérique (loi n°2017-20), protection des données personnelles, et conférences RSSI réunissant les professionnels de la sécurité des systèmes d'information.",
        titleEn: "Protecting the national digital space", subtitleEn: "Cybersecurity · CRSSI",
        descriptionEn: "Digital legal framework (Law No. 2017-20), personal data protection, and RSSI conferences bringing together information systems security professionals.",
      },
    };
    for (const [number, c] of Object.entries(chantiersOfficiels)) {
      await sql`
        UPDATE chantiers SET
          title_fr = ${c.titleFr}, subtitle_fr = ${c.subtitleFr}, description_fr = ${c.descriptionFr},
          title_en = ${c.titleEn}, subtitle_en = ${c.subtitleEn}, description_en = ${c.descriptionEn}
        WHERE number = ${number}
      `;
    }

    // ══════════════════════════════════════════════════════════════════
    // Modules institutionnels : Directions, Structures, Cabinet, Missions,
    // Partenaires. Traductions anglaises NON fournies dans ce lot (volume
    // trop important pour ce tour) — à ajouter dans une passe séparée.
    // ══════════════════════════════════════════════════════════════════

    await sql.query(`
      CREATE TABLE IF NOT EXISTS directions (
        id             SERIAL PRIMARY KEY,
        acronym        TEXT NOT NULL,
        type_fr        TEXT, type_en TEXT,
        name_fr        TEXT NOT NULL, name_en TEXT,
        director       TEXT,
        description_fr TEXT, description_en TEXT,
        accent         TEXT,
        display_order  INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);
    const directionsCount = await sql`SELECT COUNT(*) AS count FROM directions`;
    if (Number(directionsCount.rows[0].count) === 0) {
      const seedDirections = [
        { acronym: "DPAF", type: "Direction centrale", name: "Direction de la Programmation, de l'Administration et des Finances", director: "", description: "Assure la programmation, la gestion administrative et financière du ministère. Supervise le budget, les ressources humaines, les marchés publics et la logistique.", accent: "#162233" },
        { acronym: "DSI", type: "Direction centrale", name: "Direction des Systèmes d'Information", director: "Pontien DEGUENON", description: "La Direction des Systèmes d'Information veille à garantir l'alignement du système d'information du ministère avec la politique nationale. Elle est chargée de définir et superviser la politique de système d'information et sa mise en œuvre, définir les orientations stratégiques IT du Ministère, garantir la sécurité informatique, la fiabilité, la confidentialité et l'intégrité des systèmes d'information.", accent: "#162233" },
        { acronym: "DN", type: "Direction technique", name: "Direction du Numérique", director: "Geoffroy BONOU", description: "La Direction du Numérique est chargée d'élaborer la politique de développement des infrastructures, des usages et des contenus numériques. Elle contribue au pilotage de la stratégie nationale de développement des infrastructures haut débit et très haut débit, veille à la mise en place des infrastructures numériques de télévision et radio, promeut les communications électroniques et incite au développement de l'industrie dans le domaine de l'économie numérique.", accent: "#7A5800" },
        { acronym: "DD", type: "Direction technique", name: "Direction de la Digitalisation", director: "Boris Rodrigue SEHLOUAN Y.M.", description: "La Direction de la Digitalisation est chargée de superviser la mise en œuvre du programme de gouvernance électronique de l'État par l'usage des TIC dans l'administration et la dématérialisation des services publics. Elle promeut la transformation digitale des entreprises, contribue au développement des compétences numériques et à la promotion de l'entrepreneuriat numérique, et contribue à l'élaboration de la politique de sécurité numérique et à la mise en œuvre de la stratégie nationale de cybersécurité.", accent: "#7A5800" },
        { acronym: "DM", type: "Direction technique", name: "Direction des Médias", director: "", description: "La Direction des Médias est chargée de la politique audiovisuelle et de la transition numérique des médias publics et privés.", accent: "#EB0000" },
      ];
      for (let i = 0; i < seedDirections.length; i++) {
        const d = seedDirections[i];
        await sql`
          INSERT INTO directions (acronym, type_fr, name_fr, director, description_fr, accent, display_order)
          VALUES (${d.acronym}, ${d.type}, ${d.name}, ${d.director || null}, ${d.description}, ${d.accent}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS structures (
        id             SERIAL PRIMARY KEY,
        acronym        TEXT NOT NULL,
        name_fr        TEXT NOT NULL, name_en TEXT,
        description_fr TEXT, description_en TEXT,
        missions_fr    JSONB NOT NULL DEFAULT '[]'::jsonb,
        missions_en    JSONB NOT NULL DEFAULT '[]'::jsonb,
        url            TEXT,
        accent         TEXT,
        logo_src       TEXT,
        label_fr       TEXT, label_en TEXT,
        display_order  INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);
    const structuresCount = await sql`SELECT COUNT(*) AS count FROM structures`;
    if (Number(structuresCount.rows[0].count) === 0) {
      const seedStructures = [
        { acronym: "SBIN", name: "Société Béninoise d'Infrastructures Numériques", description: "La SBIN (Celtiis) est l'opérateur national d'infrastructures numériques, chargé du déploiement et de la gestion des réseaux de télécommunications et de la connectivité sur le territoire béninois.", missions: ["Déploiement de la fibre optique et des réseaux de télécommunications", "Gestion des infrastructures numériques nationales", "Fourniture de connectivité haut débit sur le territoire", "Développement de l'accès au numérique pour les citoyens et entreprises", "Soutien à la transformation digitale de l'État"], url: "https://celtiis.bj/", accent: "#005f99", logoSrc: "/logo-sbin.png", label: "Infrastructures numériques & connectivité" },
        { acronym: "ASIN", name: "Agence des Systèmes d'Information et du Numérique", description: "L'ASIN est l'agence gouvernementale en charge de la mise en œuvre opérationnelle des projets numériques transverses et mutualisés de l'État ainsi que les projets sectoriels dont l'exécution lui est déléguée.", missions: ["Exploitation et sécurisation des systèmes d'information mutualisés de l'État", "Infrastructures numériques publiques : connectivité des sites publics, centres de données, hébergement souverain", "Cybersécurité : bjCSIRT (centre national de réponse aux incidents), audits et qualification de sécurité, veille sur les menaces", "Interopérabilité et confiance numérique : plateforme nationale d'échange de données (X-Road BJ), PKI nationale, signature électronique", "E-services et portail national des services publics", "Accompagnement des administrations dans leur transformation digitale", "Intégration de l'intelligence artificielle dans les services publics, en appui à la Stratégie Nationale d'IA"], url: "https://asin.bj/", accent: "#006828", logoSrc: "/logo-asin.png", label: "Systèmes d'information & cybersécurité" },
      ];
      for (let i = 0; i < seedStructures.length; i++) {
        const s = seedStructures[i];
        await sql`
          INSERT INTO structures (acronym, name_fr, description_fr, missions_fr, url, accent, logo_src, label_fr, display_order)
          VALUES (${s.acronym}, ${s.name}, ${s.description}, ${JSON.stringify(s.missions)}::jsonb, ${s.url}, ${s.accent}, ${s.logoSrc}, ${s.label}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS cabinet_members (
        id             SERIAL PRIMARY KEY,
        role_fr        TEXT NOT NULL, role_en TEXT,
        direction_fr   TEXT, direction_en TEXT,
        description_fr TEXT, description_en TEXT,
        accent         TEXT,
        level          INTEGER NOT NULL DEFAULT 0,
        display_order  INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);
    const cabinetCount = await sql`SELECT COUNT(*) AS count FROM cabinet_members`;
    if (Number(cabinetCount.rows[0].count) === 0) {
      const seedCabinet = [
        { role: "Ministre", direction: "Ministère de la Transformation Digitale et de l'Innovation", description: "Autorité politique en charge de la définition et de la mise en œuvre de la politique gouvernementale en matière de transformation digitale, d'innovation et d'intelligence artificielle.", accent: "#006828", level: 0 },
        { role: "Directeur de Cabinet", direction: "Cabinet du Ministre", description: "Coordonne l'ensemble des activités du cabinet ministériel, assure la liaison avec les autres institutions gouvernementales et supervise la mise en œuvre des décisions du Ministre.", accent: "#162233", level: 1 },
        { role: "Secrétaire Général du Ministère", direction: "Secrétariat Général", description: "Assure la coordination administrative de l'ensemble des directions et services du ministère. Garantit la continuité et la cohérence de l'action ministérielle.", accent: "#162233", level: 1 },
        { role: "Conseillers Techniques (CT)", direction: "Cabinet du Ministre", description: "Les Conseillers Techniques assistent le Ministre et le Directeur de Cabinet dans l'expertise sectorielle, l'analyse des dossiers et la préparation des décisions stratégiques. Ils interviennent dans les domaines de l'intelligence artificielle, de la transformation digitale, de la cybersécurité, des politiques publiques numériques et de la coopération internationale.", accent: "#7A5800", level: 2 },
      ];
      for (let i = 0; i < seedCabinet.length; i++) {
        const m = seedCabinet[i];
        await sql`
          INSERT INTO cabinet_members (role_fr, direction_fr, description_fr, accent, level, display_order)
          VALUES (${m.role}, ${m.direction}, ${m.description}, ${m.accent}, ${m.level}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id            SERIAL PRIMARY KEY,
        text_fr       TEXT NOT NULL, text_en TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active        BOOLEAN NOT NULL DEFAULT TRUE,
        created_by    INTEGER REFERENCES users(id),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at    TIMESTAMPTZ
      )
    `);
    const missionsCount = await sql`SELECT COUNT(*) AS count FROM missions`;
    if (Number(missionsCount.rows[0].count) === 0) {
      const seedMissions = [
        "Élaborer les politiques sectorielles et exécuter les stratégies liées à l'agenda numérique de l'État",
        "Favoriser le développement des infrastructures, des usages et des contenus numériques par les technologies innovantes",
        "Intégrer les technologies numériques dans les structures de l'État pour améliorer la performance, l'accessibilité, la transparence et l'efficacité des services publics",
        "Promouvoir la transformation digitale des entreprises",
        "Mettre en place l'infrastructure numérique de collecte, de transport et de distribution de la télévision et de la radiodiffusion",
        "Conduire des études prospectives et formuler des recommandations sur les projets numériques de l'État",
        "Promouvoir les communications électroniques et les services numériques innovants en partenariat avec les autorités de régulation",
        "Assurer la gestion optimale des licences et des ressources de l'État",
        "Établir un cadre législatif et réglementaire favorable au développement du numérique",
        "Réduire la fracture numérique entre les régions et les populations",
        "Promouvoir les compétences numériques et l'entrepreneuriat digital",
        "Lutter contre les déchets électroniques en coordination avec les agences environnementales",
        "Instaurer des mécanismes durables de confiance numérique",
        "Développer les partenariats avec le secteur privé et les institutions internationales",
        "Représenter le Bénin dans les instances internationales de gouvernance du numérique",
        "Accompagner les médias publics et privés dans leur transition numérique",
        "Renforcer la qualité du paysage audiovisuel",
      ];
      for (let i = 0; i < seedMissions.length; i++) {
        await sql`INSERT INTO missions (text_fr, display_order) VALUES (${seedMissions[i]}, ${i})`;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id             SERIAL PRIMARY KEY,
        category       TEXT NOT NULL DEFAULT 'institutionnel', -- institutionnel | technologique | academique
        name           TEXT NOT NULL,
        full_fr        TEXT, full_en TEXT,
        description_fr TEXT, description_en TEXT,
        accent         TEXT,
        logo_src       TEXT,
        display_order  INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at     TIMESTAMPTZ
      )
    `);
    const partnersCount = await sql`SELECT COUNT(*) AS count FROM partners`;
    if (Number(partnersCount.rows[0].count) === 0) {
      const seedPartners = [
        { category: "institutionnel", name: "APDP", full: "Autorité de Protection des Données Personnelles", description: "Instance nationale de contrôle du traitement des données à caractère personnel, garante du respect de la vie privée numérique au Bénin.", accent: "#006828" },
        { category: "institutionnel", name: "ANIP", full: "Agence Nationale d'Identification des Personnes", description: "Gère l'identité civile et délivre les documents d'identité officiels des citoyens béninois, dont le programme MonIdentité.bj.", accent: "#006828", logoSrc: "/logo-anip.png" },
        { category: "institutionnel", name: "Présidence", full: "Présidence de la République du Bénin", description: "Autorité de tutelle du gouvernement béninois, dont les priorités numériques guident la feuille de route du ministère.", accent: "#006828" },
        { category: "institutionnel", name: "Sèmè City", full: "Cité de l'Innovation et du Savoir", description: "Hub d'innovation et d'entrepreneuriat du Bénin, laboratoire de la transformation digitale africaine situé à Cotonou.", accent: "#006828", logoSrc: "/logo-seme-city.svg" },
        { category: "technologique", name: "Banque Mondiale", full: "Groupe de la Banque Mondiale", description: "Partenaire financier et technique des grands projets d'infrastructure numérique et de renforcement de capacités numériques.", accent: "#7A5800" },
        { category: "technologique", name: "Smart Africa", full: "Alliance Smart Africa", description: "Alliance continentale promouvant la transformation numérique inclusive en Afrique ; le Bénin en est membre actif.", accent: "#7A5800" },
        { category: "technologique", name: "ITU", full: "Union Internationale des Télécommunications", description: "Agence spécialisée des Nations Unies pour les TIC ; appuie le Bénin sur la gouvernance et les politiques de connectivité.", accent: "#7A5800" },
        { category: "academique", name: "UAC", full: "Université d'Abomey-Calavi", description: "Principale université du Bénin, partenaire des programmes de formation aux métiers du numérique et de la recherche en intelligence artificielle.", accent: "#EB0000" },
        { category: "academique", name: "INFOTI", full: "Institut National de Formation aux Technologies de l'Information", description: "Institut public de formation professionnelle dans les domaines des TIC, du numérique et des télécommunications.", accent: "#EB0000" },
      ];
      for (let i = 0; i < seedPartners.length; i++) {
        const p = seedPartners[i];
        await sql`
          INSERT INTO partners (category, name, full_fr, description_fr, accent, logo_src, display_order)
          VALUES (${p.category}, ${p.name}, ${p.full}, ${p.description}, ${p.accent}, ${p.logoSrc || null}, ${i})
        `;
      }
    }

    // Galerie : aucune vraie photo d'événement n'existe (le fichier source
    // data/galerie.json avait déjà image:"" partout) — on associe des
    // images génériques déjà présentes dans le projet, par thème, en
    // attendant les vraies photos. Ne touche jamais une image déjà définie
    // (ex. déjà uploadée depuis le back-office).
    const galerieImages: Record<string, string> = {
      "Ouverture du Sommet Afrique Digitale 2026": "/hero-conference.jpg",
      "Signature du décret portant création de l'ANAI": "/chantier-01-ia.jpg",
      "Discours du Ministre : Sommet Afrique Digitale": "/hero-conference.jpg",
      "Cérémonie des vœux au corps diplomatique": "/alaune-partenariat.jpg",
      "Visite du chantier fibre optique : Parakou": "/chantier-03-connectivite.jpg",
      "Inauguration du Data Center souverain : Phase 1": "/alaune-infra.jpg",
      "Lancement de MonIdentité.bj : Saison 2": "/chantier-02-services.jpg",
      "Remise des diplômes : Digital Academy, Promotion 2026": "/hero-graduation.jpg",
      "Hackathon IA étudiants : Université d'Abomey-Calavi": "/alaune-formation.jpg",
      "Présentation de la Stratégie IA 2030 : Assemblée nationale": "/chantier-01-ia.jpg",
      "Déploiement des stations CERT.bj": "/alaune-cyber.jpg",
      "Forum IA & Éthique : Session plénière UNESCO × Bénin": "/chantier-01-ia.jpg",
      "Rencontre avec les startups : Bénin IA Challenge": "/alaune-startups.jpg",
      "Interview du Ministre : RFI": "/hero-conference.jpg",
    };
    for (const [titleFr, image] of Object.entries(galerieImages)) {
      await sql`UPDATE galerie_items SET image = ${image} WHERE title_fr = ${titleFr} AND (image IS NULL OR image = '')`;
    }

    // Mot du Ministre (page biographie complète /le-ministere/le-ministre)
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('ministre_bio', ${JSON.stringify(MINISTRE_BIO_DEFAULTS)}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;


    // ══════════════════════════════════════════════════════════════════
    // Pages secondaires + mini-site Strategie IA. Contenu texte simple
    // (pas de mise en forme riche jusqu'ici) - champs texte classiques,
    // pas besoin d'assainissement HTML pour ces modules.
    // ══════════════════════════════════════════════════════════════════

    await sql.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        category TEXT NOT NULL DEFAULT 'rapport',
        type TEXT NOT NULL DEFAULT 'PDF', -- dérivé de l'extension du fichier à l'upload
        date_label TEXT,
        description_fr TEXT, description_en TEXT,
        href TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    // Colonne "type" ajoutée après coup : idempotent pour les bases déjà migrées.
    await sql.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'PDF'`);
    // Rétro-remplit le type réel depuis l'extension de l'URL pour les
    // documents déjà en base (tous étaient jusqu'ici affichés "PDF" en dur,
    // qu'ils le soient réellement ou non).
    await sql.query(`
      UPDATE documents SET type = UPPER(SUBSTRING(href FROM '\\.([a-zA-Z0-9]+)(\\?.*)?$'))
      WHERE href ~ '\\.[a-zA-Z0-9]+(\\?.*)?$'
    `);
    const documentsCount = await sql`SELECT COUNT(*) AS count FROM documents`;
    if (Number(documentsCount.rows[0].count) === 0) {
      const seedDocuments = [
        { title: "Plan d'Engagement Environnemental et Social (PEES) : WARDIP", category: "rapport", date: "Octobre 2025", description: "Plan d'Engagement Environnemental et Social dans le cadre du projet WARDIP (West Africa Regional Digital Intégration Program).", href: "https://innovation.gouv.bj/assets/documents/pees-version-d'octobre-2025-publie_bm.pdf", featured: false },
        { title: "Plan de Gestion de la Main-d'œuvre (PGMO) : WARDIP", category: "rapport", date: "Octobre 2025", description: "Plan de Gestion de la Main-d'œuvre dans le cadre du projet WARDIP.", href: "https://innovation.gouv.bj/assets/documents/pgmo-version-d'octobre-2025-publie_bm.pdf", featured: false },
        { title: "Plan de Mobilisation des Parties Prenantes (PMPP) incluant le MGP : WARDIP", category: "rapport", date: "Octobre 2025", description: "Plan de Mobilisation des Parties Prenantes incluant le Mécanisme de Gestion des Plaintes dans le cadre du projet WARDIP.", href: "https://innovation.gouv.bj/assets/documents/pmpp-version-d'octobre-2025-publie_bm.pdf", featured: false },
        { title: "Résultats de la sélection dans le cadre de la participation du Bénin aux OIIA 2025", category: "rapport", date: "2025", description: "Résultats de la sélection des candidats béninois pour la participation aux Olympiades Internationales d'Intelligence Artificielle 2025.", href: "https://innovation.gouv.bj/assets/documents/resultats-de-la-selection-dans-le-cadre-de-la-participation-du-benin-aux-oiia-2025.pdf", featured: false },
        { title: "Magazine Bénin Numérique N°3", category: "rapport", date: "2024", description: "Troisième édition du magazine Bénin Numérique.", href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique---n0003.pdf", featured: false },
        { title: "Liste des Fournisseurs de Services de Sécurité Numérique qualifiés en République du Bénin", category: "juridique", date: "2024", description: "Liste officielle des fournisseurs de services de sécurité numérique qualifiés en République du Bénin.", href: "https://innovation.gouv.bj/assets/documents/liste-des-fournisseurs-de-services-de-securite-numerique-qualifies-en-republique-du-benin.pdf", featured: false },
        { title: "Rapport de vulnérabilités et d'incidents du cyberespace béninois", category: "rapport", date: "2024", description: "Rapport sur les vulnérabilités et incidents de sécurité relevés dans le cyberespace béninois.", href: "https://innovation.gouv.bj/assets/documents/rapport-de-vulnerabilites-et-d'incidents-du-cyberespace-beninois.pdf", featured: false },
        { title: "Magazine Bénin Numérique N°2", category: "rapport", date: "Octobre 2023", description: "Deuxième édition du magazine Bénin Numérique : actualités, innovations et avancées du secteur numérique.", href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique---n0002---octobre-2023-1698406338.pdf", featured: false },
        { title: "Référentiel des exigences relatives à la qualification des fournisseurs de services de sécurité numérique en République du Bénin", category: "juridique", date: "Octobre 2023", description: "Référentiel définissant les exigences pour la qualification des fournisseurs de services de sécurité numérique au Bénin.", href: "https://innovation.gouv.bj/assets/documents/referentiel-des-exigences-relatives-a-la-qualification-des-fournisseurs-de-services-de-securite-numerique-en-republique-du-benin-1698397466.pdf", featured: false },
        { title: "Stratégie Nationale d'Intelligence Artificielle et des Mégadonnées 2023-2027", category: "stratégie", date: "2023", description: "Feuille de route officielle pour le développement de l'intelligence artificielle et des mégadonnées au Bénin sur la période 2023-2027.", href: "https://innovation.gouv.bj/assets/documents/strategie-nationale-d'intelligence-artificielle-et-des-megadonnees-2023-2027.pdf", featured: true },
        { title: "National Artificial Intelligence and Big Data Strategy", category: "stratégie", date: "2023", description: "English version of Bénin's National Artificial Intelligence and Big Data Strategy.", href: "https://innovation.gouv.bj/assets/documents/national-artificial-intelligence-and-big-data-strategy-1682673348.pdf", featured: true },
        { title: "Magazine Bénin Numérique N°1", category: "rapport", date: "2023", description: "Première édition du magazine Bénin Numérique : bilan, projets et perspectives du numérique au Bénin.", href: "https://innovation.gouv.bj/assets/documents/magazine-benin-numerique_.pdf", featured: false },
        { title: "Règles de politique de protection des infrastructures d'information critiques en République du Bénin", category: "juridique", date: "2023", description: "Document définissant les règles de protection des infrastructures d'information critiques de la République du Bénin.", href: "https://innovation.gouv.bj/assets/documents/regles-de-politique-de-protection-des-infrastructures-dinformation-critiques-en-republique-du-benin.pdf", featured: false },
        { title: "État des lieux de l'écosystème digital et de l'entrepreneuriat numérique au Bénin", category: "rapport", date: "2023", description: "Rapport sur l'état de l'écosystème digital et de l'entrepreneuriat numérique en République du Bénin.", href: "https://innovation.gouv.bj/assets/documents/rapport_etat-de-l'ecosysteme-et-de-l'entrepreneuriat-numerique-au-benin.pdf", featured: false },
        { title: "Guide de l'Entrepreneur Digital : Bénin", category: "guide", date: "2023", description: "Guide pratique à destination des entrepreneurs du numérique au Bénin.", href: "https://innovation.gouv.bj/assets/documents/guide-entrepreneur-digital-ctd-2023.pdf", featured: false },
      ];
      for (let i = 0; i < seedDocuments.length; i++) {
        const d = seedDocuments[i];
        await sql`
          INSERT INTO documents (title_fr, category, date_label, description_fr, href, featured, display_order)
          VALUES (${d.title}, ${d.category}, ${d.date}, ${d.description}, ${d.href}, ${d.featured}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS textes_juridiques (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        type_fr TEXT, type_en TEXT,
        reference TEXT,
        date_label TEXT,
        status_fr TEXT, status_en TEXT,
        description_fr TEXT, description_en TEXT,
        articles_fr TEXT, articles_en TEXT,
        href TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const textesCount = await sql`SELECT COUNT(*) AS count FROM textes_juridiques`;
    if (Number(textesCount.rows[0].count) === 0) {
      const seedTextes = [
        { title: "Code du numérique en République du Bénin", type: "Loi", reference: "Loi n°2017-20", date: "28 avril 2018", status: "En vigueur", description: "Cadre juridique fondateur régissant l'économie numérique au Bénin. Couvre la protection des données à caractère personnel, la cybersécurité, les transactions électroniques, le commerce en ligne, les communications électroniques et les infractions liées aux technologies de l'information et de la communication.", articles: "478 articles répartis en 8 livres", href: "https://innovation.gouv.bj/assets/Documents/loi-2017-20.pdf" },
        { title: "Loi portant modification du code du numérique en République du Bénin", type: "Loi", reference: "Loi n°2020-35", date: "2020", status: "En vigueur", description: "Loi portant modification de la loi n°2017-20 du 20 avril 2018 portant code du numérique en République du Bénin. Actualise et complète le cadre juridique fondateur du numérique.", articles: "Texte modificatif", href: "https://innovation.gouv.bj/assets/Documents/loi-2020-35.pdf" },
      ];
      for (let i = 0; i < seedTextes.length; i++) {
        const t = seedTextes[i];
        await sql`
          INSERT INTO textes_juridiques (title_fr, type_fr, reference, date_label, status_fr, description_fr, articles_fr, href, display_order)
          VALUES (${t.title}, ${t.type}, ${t.reference}, ${t.date}, ${t.status}, ${t.description}, ${t.articles}, ${t.href}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS kit_presse_items (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        type TEXT NOT NULL DEFAULT 'PDF',
        href TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const kitCount = await sql`SELECT COUNT(*) AS count FROM kit_presse_items`;
    if (Number(kitCount.rows[0].count) === 0) {
      // Note : la charte graphique (PDF) n'est PAS incluse ici - son fichier
      // n'a jamais existé sur le serveur (lien mort connu depuis l'audit
      // initial). A ajouter depuis le back-office une fois le vrai PDF
      // disponible.
      const seedKit = [
        { title: "Logo MTDI — Usage officiel", description: "Logo vectoriel officiel du Ministère de la Transformation Digitale et de l'Innovation.", type: "PNG", href: "/logo_MTDI.png" },
        { title: "Bannière officielle MTDI", description: "Bannière horizontale avec identité visuelle complète du Ministère.", type: "PNG", href: "/mtdi-banner.png" },
      ];
      for (let i = 0; i < seedKit.length; i++) {
        const k = seedKit[i];
        await sql`
          INSERT INTO kit_presse_items (title_fr, description_fr, type, href, display_order)
          VALUES (${k.title}, ${k.description}, ${k.type}, ${k.href}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        date_label TEXT, duration TEXT, source TEXT,
        url TEXT NOT NULL, color TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const videosCount = await sql`SELECT COUNT(*) AS count FROM videos`;
    if (Number(videosCount.rows[0].count) === 0) {
      const seedVideos = [
        { title: "2ème Conférence des RSSI : la sécurité numérique au cœur de l'État augmenté", date: "26 juin 2026", duration: "35 min", source: "MTDI", url: "https://youtu.be/HrBWcxO24WI", color: "#2a1a0a" },
        { title: "Cyberdrill RSSI : Exercice de cybersécurité national", date: "2026", duration: "20 min", source: "MTDI", url: "https://youtu.be/20ZGGa1d8kg", color: "#0a2218" },
        { title: "« J'aime ma langue » : Intégration des langues nationales dans l'IA", date: "2025", duration: "1 min", source: "MTDI", url: "https://youtube.com/shorts/Kg_s0_8Tnuw", color: "#0D132D" },
      ];
      for (let i = 0; i < seedVideos.length; i++) {
        const v = seedVideos[i];
        await sql`
          INSERT INTO videos (title_fr, date_label, duration, source, url, color, display_order)
          VALUES (${v.title}, ${v.date}, ${v.duration}, ${v.source}, ${v.url}, ${v.color}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS media_mentions (
        id SERIAL PRIMARY KEY,
        type_fr TEXT NOT NULL DEFAULT 'Médias', type_en TEXT,
        type_color TEXT NOT NULL DEFAULT 'ROUGE',
        title_fr TEXT NOT NULL, title_en TEXT,
        date_label TEXT, source TEXT,
        excerpt_fr TEXT, excerpt_en TEXT,
        url TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const mediasCount = await sql`SELECT COUNT(*) AS count FROM media_mentions`;
    if (Number(mediasCount.rows[0].count) === 0) {
      const seedMedias = [
        { type: "Médias", color: "ROUGE", title: "MTDI sur Instagram : Reel 1", date: "2026", source: "Instagram", excerpt: "Découvrez les activités du Ministère de la Transformation Digitale et de l'Innovation en vidéo sur Instagram.", url: "https://www.instagram.com/reel/DankF6VCOFa/" },
        { type: "Médias", color: "ROUGE", title: "MTDI sur Instagram : Reel 2", date: "2026", source: "Instagram", excerpt: "Suivez les dernières actualités du MTDI sur les réseaux sociaux.", url: "https://www.instagram.com/reel/DY4oIfrNjKh/" },
        { type: "Médias", color: "JAUNE", title: "MTDI sur YouTube : Interview et reportage", date: "2026", source: "YouTube", excerpt: "Retrouvez les interviews et reportages du Ministère de la Transformation Digitale et de l'Innovation.", url: "https://www.youtube.com/watch?v=MXxdVtomLJM" },
      ];
      for (let i = 0; i < seedMedias.length; i++) {
        const m = seedMedias[i];
        await sql`
          INSERT INTO media_mentions (type_fr, type_color, title_fr, date_label, source, excerpt_fr, url, display_order)
          VALUES (${m.type}, ${m.color}, ${m.title}, ${m.date}, ${m.source}, ${m.excerpt}, ${m.url}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS eservices (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        href TEXT NOT NULL,
        icon_key TEXT NOT NULL DEFAULT 'document',
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const eservicesCount = await sql`SELECT COUNT(*) AS count FROM eservices`;
    if (Number(eservicesCount.rows[0].count) === 0) {
      const seedEservices = [
        { title: "État civil", description: "Demandez vos actes de naissance, de mariage et de décès en ligne. Retirez vos documents dans le centre d'état civil de votre choix.", href: "https://service-public.bj/public/services/service-ede", icon: "document" },
        { title: "Fiscalité", description: "Déclarez et payez vos impôts en ligne via la plateforme e-Impôts. Accédez à votre espace contribuable et suivez vos obligations fiscales.", href: "https://service-public.bj/public/services/service-impots", icon: "card" },
        { title: "Identité", description: "Obtenez votre carte nationale d'identité biométrique ou votre passeport via MonIdentite.bj. Suivez l'avancement de votre demande en temps réel.", href: "https://service-public.bj/public/services/service-identite", icon: "id-card" },
        { title: "Permis & autorisations", description: "Demandez vos permis de construire, licences commerciales et autorisations administratives. Toutes vos démarches regroupées en un seul portail.", href: "https://service-public.bj/public/services/service-permis", icon: "check-doc" },
        { title: "Éducation", description: "Inscriptions scolaires et universitaires, demandes de bourses d'études, équivalences de diplômes et orientation professionnelle en ligne.", href: "https://service-public.bj/public/services/service-education", icon: "graduation" },
        { title: "Santé", description: "Gérez votre assurance maladie universelle (ARCH), consultez votre carnet de vaccination numérique et accédez aux services de santé en ligne.", href: "https://service-public.bj/public/services/service-sante", icon: "heart" },
        { title: "Emploi", description: "Consultez les offres d'emploi public, déposez votre candidature et suivez vos démarches auprès des administrations en un seul endroit.", href: "https://service-public.bj/public/services/service-emploi", icon: "briefcase" },
        { title: "Foncier", description: "Sécurisez vos titres fonciers, effectuez vos démarches cadastrales et suivez vos dossiers immobiliers en ligne.", href: "https://service-public.bj/public/services/service-foncier", icon: "home" },
      ];
      for (let i = 0; i < seedEservices.length; i++) {
        const s = seedEservices[i];
        await sql`
          INSERT INTO eservices (title_fr, description_fr, href, icon_key, display_order)
          VALUES (${s.title}, ${s.description}, ${s.href}, ${s.icon}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS ia_piliers (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        icon_key TEXT NOT NULL DEFAULT 'shield-check',
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const piliersCount = await sql`SELECT COUNT(*) AS count FROM ia_piliers`;
    if (Number(piliersCount.rows[0].count) === 0) {
      const seedPiliers = [
        { title: "Gouvernance & Éthique", description: "Un cadre réglementaire africain de référence garantissant une IA transparente, équitable et respectueuse des droits fondamentaux. Comité national d'éthique, audit algorithmique et protection des données personnelles.", icon: "shield-check" },
        { title: "Infrastructures IA", description: "Souveraineté numérique par le cloud public béninois, des data centers à haute disponibilité et un réseau national d'open data structuré pour l'entraînement des modèles d'IA.", icon: "server-stack" },
        { title: "Talents & Compétences", description: "Formation de 10 000 professionnels de l'IA d'ici 2030 via la Digital Academy, des partenariats universitaires, des bourses d'excellence et des programmes de certification reconnus à l'international.", icon: "graduation" },
        { title: "Projets & Innovation", description: "Déploiement de l'IA dans l'agriculture, la santé, l'éducation et les services publics. Bénin IA Challenge, incubateur national, et fonds de soutien aux startups deeptech béninoises.", icon: "lightbulb" },
      ];
      for (let i = 0; i < seedPiliers.length; i++) {
        const p = seedPiliers[i];
        await sql`
          INSERT INTO ia_piliers (title_fr, description_fr, icon_key, display_order)
          VALUES (${p.title}, ${p.description}, ${p.icon}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS ia_jalons (
        id SERIAL PRIMARY KEY,
        year TEXT NOT NULL,
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const jalonsCount = await sql`SELECT COUNT(*) AS count FROM ia_jalons`;
    if (Number(jalonsCount.rows[0].count) === 0) {
      const seedJalons = [
        { year: "2024", title: "Diagnostic national", description: "Audit des capacités IA du Bénin, cartographie des acteurs, identification des cas d'usage prioritaires.", done: true },
        { year: "2025", title: "Adoption de la stratégie", description: "Validation interministérielle et lancement officiel de la Stratégie Nationale d'Intelligence Artificielle.", done: true },
        { year: "2026", title: "Création de l'ANAI", description: "Mise en place de l'Agence Nationale de l'Intelligence Artificielle. Premiers appels à projets.", done: true },
        { year: "2027", title: "Montée en charge", description: "10 projets IA sectoriels déployés. Ouverture du premier Data Center souverain du Bénin.", done: false },
        { year: "2028", title: "Maturité et consolidation", description: "5 000 professionnels certifiés. Cadre juridique IA adopté par l'Assemblée nationale.", done: false },
        { year: "2030", title: "Bénin, nation de l'IA", description: "Bénin classé dans le top 5 africain pour l'adoption de l'IA. Plateforme continentale d'IA déployée.", done: false },
      ];
      for (let i = 0; i < seedJalons.length; i++) {
        const j = seedJalons[i];
        await sql`
          INSERT INTO ia_jalons (year, title_fr, description_fr, done, display_order)
          VALUES (${j.year}, ${j.title}, ${j.description}, ${j.done}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS ia_olympiades_editions (
        id SERIAL PRIMARY KEY,
        year TEXT NOT NULL,
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        highlight_fr TEXT, highlight_en TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const editionsCount = await sql`SELECT COUNT(*) AS count FROM ia_olympiades_editions`;
    if (Number(editionsCount.rows[0].count) === 0) {
      const seedEditions = [
        { year: "2026", title: "1ère édition — Olympiades Nationales d'IA (NOAI)", description: "Compétition inaugurale pour sélectionner les jeunes talents béninois qui représenteront le pays aux Olympiades Internationales d'IA (IOAI) 2026 au Kazakhstan, du 2 au 8 août.", highlight: "8 lauréats sélectionnés le 4 juillet à Sèmè One" },
      ];
      for (let i = 0; i < seedEditions.length; i++) {
        const e = seedEditions[i];
        await sql`
          INSERT INTO ia_olympiades_editions (year, title_fr, description_fr, highlight_fr, display_order)
          VALUES (${e.year}, ${e.title}, ${e.description}, ${e.highlight}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS ia_criteres (
        id SERIAL PRIMARY KEY,
        text_fr TEXT NOT NULL, text_en TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const criteresCount = await sql`SELECT COUNT(*) AS count FROM ia_criteres`;
    if (Number(criteresCount.rows[0].count) === 0) {
      const seedCriteres = [
        "Être scolarisé au Bénin, niveau lycée ou premier cycle universitaire",
        "Maîtriser les fondamentaux de la programmation et des mathématiques",
        "S'inscrire via la plateforme dédiée avant la date limite officielle",
        "Réussir les épreuves de présélection (algorithmique, machine learning, éthique de l'IA)",
      ];
      for (let i = 0; i < seedCriteres.length; i++) {
        await sql`INSERT INTO ia_criteres (text_fr, display_order) VALUES (${seedCriteres[i]}, ${i})`;
      }
    }



    // ══════════════════════════════════════════════════════════════════
    // Contacts spécifiques, opportunités (Participer), liens utiles.
    // ══════════════════════════════════════════════════════════════════

    await sql.query(`
      CREATE TABLE IF NOT EXISTS contacts_specifiques (
        id SERIAL PRIMARY KEY,
        role_fr TEXT NOT NULL, role_en TEXT,
        name_fr TEXT NOT NULL, name_en TEXT,
        email TEXT NOT NULL, phone TEXT,
        note_fr TEXT, note_en TEXT,
        accent TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const contactsSpecCount = await sql`SELECT COUNT(*) AS count FROM contacts_specifiques`;
    if (Number(contactsSpecCount.rows[0].count) === 0) {
      const seedContacts = [
        { role: "Presse & Accréditations", name: "Service Communication", email: "presse@gouv.bj", phone: "+229 01 21 30 00 01", note: "Pour les demandes d'interview, accréditations et dossiers de presse.", accent: "#006828" },
        { role: "Partenariats & Coopération", name: "Direction des Partenariats", email: "partenariats@gouv.bj", phone: "+229 01 21 30 00 02", note: "Organisations internationales, bailleurs de fonds, partenaires techniques.", accent: "#7A5800" },
        { role: "Réclamations & Signalements", name: "Cellule Citoyenne", email: "reclamations@gouv.bj", phone: "+229 01 21 30 00 03", note: "Traitement des signalements et réclamations relatives aux services numériques publics.", accent: "#EB0000" },
      ];
      for (let i = 0; i < seedContacts.length; i++) {
        const c = seedContacts[i];
        await sql`
          INSERT INTO contacts_specifiques (role_fr, name_fr, email, phone, note_fr, accent, display_order)
          VALUES (${c.role}, ${c.name}, ${c.email}, ${c.phone}, ${c.note}, ${c.accent}, ${i})
        `;
      }
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS opportunites (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'emplois', -- emplois | stages | appels-offres
        title_fr TEXT NOT NULL, title_en TEXT,
        description_fr TEXT, description_en TEXT,
        href TEXT,
        deadline_label TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    // Aucune donnée de départ : les 3 sections affichent leur message
    // "aucune offre publiée" existant tant que rien n'est ajouté depuis le
    // back-office (comportement demandé).

    await sql.query(`
      CREATE TABLE IF NOT EXISTS liens_utiles (
        id SERIAL PRIMARY KEY,
        label TEXT NOT NULL,
        href TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    const liensCount = await sql`SELECT COUNT(*) AS count FROM liens_utiles`;
    if (Number(liensCount.rows[0].count) === 0) {
      const seedLiens = [
        { label: "Sèmè City", href: "https://semecity.bj/" },
        { label: "ASIN", href: "https://asin.bj/" },
        { label: "ANIP", href: "https://eservices.anip.bj/" },
        { label: "e-services", href: "https://service-public.bj/" },
        { label: "e-pme", href: "https://epme.adpme.bj/" },
        { label: "e-visa", href: "https://evisa.bj/" },
        { label: "Centre de services", href: "https://cds.asin.bj/" },
        { label: "APDP", href: "https://service.apdp.bj/" },
        { label: "CSIRT Bénin", href: "https://csirt.bj/" },
        { label: "Présidence de la République", href: "https://presidence.bj/" },
      ];
      for (let i = 0; i < seedLiens.length; i++) {
        const l = seedLiens[i];
        await sql`INSERT INTO liens_utiles (label, href, display_order) VALUES (${l.label}, ${l.href}, ${i})`;
      }
    }

    // Ajout du champ e-mail de destination pour "Écrire au Ministre" au
    // réglage site_general déjà existant (idempotent, ne remplace jamais
    // une valeur déjà définie).
    await sql`
      UPDATE settings
      SET value = value || '{"ministreEmail": "mtdi.contact@gouv.bj"}'::jsonb
      WHERE key = 'site_general' AND (value->>'ministreEmail' IS NULL OR value->>'ministreEmail' = '')
    `;



// ══════════════════════════════════════════════════════════════════
    // Pages statiques éditables (Mentions légales, Confidentialité,
    // Accessibilité) : contenu riche continu + bascule publié/dépublié.
    // ══════════════════════════════════════════════════════════════════
    await sql.query(`
      CREATE TABLE IF NOT EXISTS static_pages (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        content_fr TEXT NOT NULL DEFAULT '',
        content_en TEXT NOT NULL DEFAULT '',
        published BOOLEAN NOT NULL DEFAULT TRUE,
        updated_by INTEGER REFERENCES users(id),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await sql`
      INSERT INTO static_pages (slug, content_fr, content_en, published)
      VALUES (${"mentions-legales"}, ${"<h2>1. Éditeur du site</h2>\n<p>Le présent site, accessible à l'adresse gouv.bj, est édité par :</p>\n<p>Ministère de la Transformation Digitale et de l'Innovation (MTDI)<br>République du Bénin</p>\n<p>Directeur de la publication : le Ministre de la Transformation Digitale et de l'Innovation.</p>\n<h2>2. Hébergement</h2>\n<p>Le site est hébergé par :</p>\n<p>Vercel Inc.<br>340 S Lemon Ave #4133<br>Walnut, CA 91789, États-Unis<br>Site web : https://vercel.com — Contact : privacy@vercel.com</p>\n<h2>3. Propriété intellectuelle</h2>\n<p>L'ensemble des contenus présents sur le site (textes, images, vidéos, logos, identité visuelle, arborescence) est la propriété du Ministère de la Transformation Digitale et de l'Innovation, sauf mention contraire. Toute reproduction, représentation, modification ou diffusion, totale ou partielle, sans autorisation préalable est interdite, à l'exception des contenus explicitement identifiés comme libres de réutilisation (open data, communiqués de presse destinés à la republication).</p>\n<p>Les photographies et vidéos peuvent être soumises à des droits détenus par des tiers (photographes, agences) ; leur réutilisation est soumise à autorisation.</p>\n<h2>4. Liens hypertextes</h2>\n<p>Le site peut contenir des liens vers d'autres sites publics (gouv.bj, ASIN, ANIP, Présidence, Sèmè City, service-public.bj) ou vers les réseaux sociaux du Ministère. Le Ministère n'exerce aucun contrôle sur le contenu de ces sites tiers et décline toute responsabilité quant à leur contenu.</p>\n<h2>5. Disponibilité du site</h2>\n<p>Le Ministère s'efforce d'assurer l'accessibilité du site 24h/24 et 7j/7, sauf interruption pour maintenance, mise à jour ou cas de force majeure. Le Ministère ne saurait être tenu responsable des interruptions de service qui en résulteraient.</p>\n<h2>6. Protection des données personnelles</h2>\n<p>Le traitement des données à caractère personnel collectées sur ce site (formulaire « Écrire au Ministre », inscription à la newsletter) est décrit dans la Politique de confidentialité, conformément à la Loi n° 2017-20 du 20 avril 2018 portant Code du numérique (Livre 5, relatif à la protection des données à caractère personnel et de la vie privée) et sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP) — apdp.bj.</p>\n<h2>7. Droit applicable</h2>\n<p>Les présentes mentions légales sont soumises au droit béninois. Tout litige relatif à l'utilisation du site relève de la compétence des juridictions béninoises.</p>"}, ${"<h2>1. Site publisher</h2>\n<p>This website, available at gouv.bj, is published by:</p>\n<p>Ministry of Digital Transformation and Innovation (MTDI)<br>Republic of Benin</p>\n<p>Publication director: the Minister of Digital Transformation and Innovation.</p>\n<h2>2. Hosting</h2>\n<p>This site is hosted by:</p>\n<p>Vercel Inc.<br>340 S Lemon Ave #4133<br>Walnut, CA 91789, United States<br>Website: https://vercel.com — Contact: privacy@vercel.com</p>\n<h2>3. Intellectual property</h2>\n<p>All content on this site (text, images, videos, logos, visual identity, site structure) is the property of the Ministry of Digital Transformation and Innovation, unless stated otherwise. Any reproduction, representation, modification or distribution, in whole or in part, without prior authorization is prohibited, except for content explicitly identified as free for reuse (open data, press releases intended for republication).</p>\n<p>Photographs and videos may be subject to rights held by third parties (photographers, agencies); their reuse is subject to authorization.</p>\n<h2>4. Hyperlinks</h2>\n<p>This site may contain links to other public websites (gouv.bj, ASIN, ANIP, the Presidency, Sèmè City, service-public.bj) or to the Ministry's social media accounts. The Ministry exercises no control over the content of these third-party sites and disclaims any responsibility for their content.</p>\n<h2>5. Site availability</h2>\n<p>The Ministry strives to ensure the site is accessible 24/7, except for interruptions due to maintenance, updates, or force majeure. The Ministry cannot be held liable for any resulting service interruptions.</p>\n<h2>6. Protection of personal data</h2>\n<p>The processing of personal data collected on this site (the \"Write to the Minister\" form, newsletter subscription) is described in the Privacy Policy, in accordance with Law No. 2017-20 of April 20, 2018 on the Digital Code (Book 5, concerning the protection of personal data and privacy) and under the oversight of the Personal Data Protection Authority (APDP) — apdp.bj.</p>\n<h2>7. Governing law</h2>\n<p>This legal notice is governed by Beninese law. Any dispute relating to the use of this site falls under the jurisdiction of the courts of Benin.</p>"}, TRUE)
      ON CONFLICT (slug) DO NOTHING
    `;

    await sql`
      INSERT INTO static_pages (slug, content_fr, content_en, published)
      VALUES (${"confidentialite"}, ${"<h2>01. Responsable du traitement</h2>\n<p>Le responsable des traitements de données réalisés via ce site est le Ministère de la Transformation Digitale et de l'Innovation.</p>\n<h2>02. Données collectées</h2>\n<p>Les données collectées varient selon les fonctionnalités utilisées :</p>\n<ul>\n<li>Formulaire « Écrire au Ministre » : nom, prénom, courriel, objet, message — pour le traitement et suivi de la correspondance citoyenne</li>\n<li>Abonnement à la newsletter : nom, prénom et adresse courriel — pour l'envoi des actualités du Ministère</li>\n<li>Navigation générale : données de connexion techniques (adresse IP, pages consultées, navigateur) — pour la mesure d'audience, la sécurité et l'amélioration du service</li>\n</ul>\n<p>Le site ne collecte aucune donnée sensible (santé, opinions politiques, religieuses, etc.).</p>\n<h2>03. Base légale et finalités</h2>\n<p>Les traitements reposent selon les cas sur :</p>\n<ul>\n<li>L'exécution d'une mission de service public (réponse aux sollicitations citoyennes)</li>\n<li>Le consentement (inscription volontaire à la newsletter)</li>\n<li>L'intérêt légitime du Ministère (statistiques de fréquentation anonymisées, sécurité du site)</li>\n</ul>\n<h2>04. Durée de conservation</h2>\n<ul>\n<li>Correspondance via « Écrire au Ministre » : conservée à compter du dernier échange</li>\n<li>Adresses courriel newsletter : conservées jusqu'au désabonnement</li>\n<li>Journaux techniques de connexion : conservés 12 mois maximum</li>\n</ul>\n<h2>05. Destinataires des données</h2>\n<p>Les données sont destinées aux seuls agents habilités du Ministère et, le cas échéant, à ses prestataires techniques (hébergement, envoi d'e-mails), tenus à des obligations de confidentialité équivalentes. Aucune donnée n'est vendue ni cédée à des fins commerciales.</p>\n<p>Certains prestataires techniques (hébergement du site) peuvent être situés hors du Bénin. Dans ce cas, le Ministère s'assure que des garanties appropriées de protection sont en place, conformément aux exigences du Code du numérique en matière de transfert de données hors du territoire national.</p>\n<h2>06. Cookies et traceurs</h2>\n<p>Le site peut utiliser des cookies strictement nécessaires à son fonctionnement ainsi que, le cas échéant, des cookies de mesure d'audience.</p>\n<p>Le Ministère n'utilise aucun cookie publicitaire ni traceur à des fins commerciales.</p>\n<h2>07. Vos droits</h2>\n<p>Conformément au Code du numérique, vous disposez d'un droit d'accès, de rectification, d'opposition, de limitation et d'effacement des données vous concernant.</p>\n<p>Vous disposez également du droit d'introduire une réclamation auprès de l'Autorité de Protection des Données Personnelles (APDP) — apdp.bj.</p>\n<h2>08. Sécurité</h2>\n<p>Le Ministère met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte ou l'altération, en lien avec l'Agence Nationale de Sécurité des Systèmes d'Information (ANSSI-Bénin).</p>\n<h2>09. Mineurs</h2>\n<p>Le site n'est pas destiné à collecter sciemment des données de mineurs sans le consentement d'un titulaire de l'autorité parentale.</p>\n<h2>10. Modification de la politique</h2>\n<p>Cette politique peut être mise à jour pour refléter des évolutions légales ou fonctionnelles. La date de dernière mise à jour figure en haut de page.</p>"}, ${"<h2>01. Data controller</h2>\n<p>The controller responsible for data processing carried out via this site is the Ministry of Digital Transformation and Innovation.</p>\n<h2>02. Data collected</h2>\n<p>The data collected varies depending on the features used:</p>\n<ul>\n<li>\"Write to the Minister\" form: first name, last name, email, subject, message — for processing and following up on citizen correspondence</li>\n<li>Newsletter subscription: first name, last name and email address — for sending Ministry news</li>\n<li>General browsing: technical connection data (IP address, pages visited, browser) — for audience measurement, security and service improvement</li>\n</ul>\n<p>The site does not collect any sensitive data (health, political or religious opinions, etc.).</p>\n<h2>03. Legal basis and purposes</h2>\n<p>Depending on the case, processing is based on:</p>\n<ul>\n<li>The performance of a public service mission (responding to citizen requests)</li>\n<li>Consent (voluntary newsletter subscription)</li>\n<li>The Ministry's legitimate interest (anonymized visitor statistics, site security)</li>\n</ul>\n<h2>04. Retention period</h2>\n<ul>\n<li>Correspondence via \"Write to the Minister\": retained from the date of the last exchange</li>\n<li>Newsletter email addresses: retained until unsubscription</li>\n<li>Technical connection logs: retained for a maximum of 12 months</li>\n</ul>\n<h2>05. Data recipients</h2>\n<p>Data is intended solely for authorized Ministry staff and, where applicable, its technical service providers (hosting, email delivery), who are bound by equivalent confidentiality obligations. No data is sold or transferred for commercial purposes.</p>\n<p>Some technical service providers (site hosting) may be located outside Benin. In such cases, the Ministry ensures appropriate protection safeguards are in place, in accordance with the requirements of the Digital Code regarding data transfers outside national territory.</p>\n<h2>06. Cookies and trackers</h2>\n<p>The site may use cookies strictly necessary for its operation, as well as, where applicable, audience measurement cookies.</p>\n<p>The Ministry does not use any advertising cookies or trackers for commercial purposes.</p>\n<h2>07. Your rights</h2>\n<p>In accordance with the Digital Code, you have the right to access, rectify, object to, restrict and erase data concerning you.</p>\n<p>You also have the right to lodge a complaint with the Personal Data Protection Authority (APDP) — apdp.bj.</p>\n<h2>08. Security</h2>\n<p>The Ministry implements appropriate technical and organizational measures to protect your data against unauthorized access, loss or alteration, in coordination with the National Information Systems Security Agency (ANSSI-Bénin).</p>\n<h2>09. Minors</h2>\n<p>The site is not intended to knowingly collect data from minors without the consent of a holder of parental authority.</p>\n<h2>10. Changes to this policy</h2>\n<p>This policy may be updated to reflect legal or functional changes. The date of the last update appears at the top of the page.</p>"}, TRUE)
      ON CONFLICT (slug) DO NOTHING
    `;

    await sql`
      INSERT INTO static_pages (slug, content_fr, content_en, published)
      VALUES (${"accessibilite"}, ${"<p>Le Ministère de la Transformation Digitale et de l'Innovation s'engage à rendre son site internet accessible à toutes et tous, conformément aux exigences du Référentiel Général d'Amélioration de l'Accessibilité (RGAA) et des Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA. Cette page présente notre déclaration d'accessibilité.</p>\n<h2>1. État de conformité</h2>\n<p>Le site gouv.bj vise une conformité au Référentiel Général d'Amélioration de l'Accessibilité (RGAA) / aux Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA.</p>\n<h2>2. Résultats des tests</h2>\n<p>Un audit d'accessibilité sera réalisé prochainement. Les résultats seront publiés sur cette page.</p>\n<h2>3. Contenus non accessibles</h2>\n<p>À titre indicatif, points de vigilance à vérifier lors de l'audit :</p>\n<ul>\n<li>Alternatives textuelles des images du carrousel d'accueil et des photos de la galerie</li>\n<li>Contraste des couleurs (texte sur fond image, notamment sur le bandeau héros)</li>\n<li>Navigation complète au clavier (menu, formulaire « Écrire au Ministre »)</li>\n<li>Sous-titrage des contenus vidéo (vidéothèque)</li>\n<li>Structure des titres et compatibilité avec les lecteurs d'écran</li>\n<li>Accessibilité des tableaux et indicateurs chiffrés</li>\n</ul>\n<h2>4. Établissement de cette déclaration</h2>\n<p>Cette déclaration a été établie en août 2026. Elle sera mise à jour après la réalisation de l'audit d'accessibilité.</p>\n<h2>5. Retour d'information et contact</h2>\n<p>Si vous rencontrez une difficulté d'accès à un contenu ou un service, vous pouvez contacter le Ministère pour être orienté vers une alternative accessible ou obtenir le contenu sous un autre format.</p>\n<h2>6. Voies de recours</h2>\n<p>Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site et que vous n'obtenez pas de réponse satisfaisante de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine aux autorités compétentes en matière d'accessibilité numérique et de médiation administrative.</p>\n<h2>7. Amélioration continue</h2>\n<p>Le Ministère s'engage à :</p>\n<ul>\n<li>Corriger progressivement les non-conformités identifiées</li>\n<li>Former les équipes en charge du site aux bonnes pratiques d'accessibilité</li>\n<li>Réévaluer la conformité du site à intervalles réguliers</li>\n</ul>"}, ${"<p>The Ministry of Digital Transformation and Innovation is committed to making its website accessible to everyone, in accordance with the requirements of the Référentiel Général d'Amélioration de l'Accessibilité (RGAA) and the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. This page presents our accessibility statement.</p>\n<h2>1. Compliance status</h2>\n<p>The gouv.bj site aims for compliance with the Référentiel Général d'Amélioration de l'Accessibilité (RGAA) / Web Content Accessibility Guidelines (WCAG) 2.1 level AA.</p>\n<h2>2. Test results</h2>\n<p>An accessibility audit will be carried out shortly. Results will be published on this page.</p>\n<h2>3. Non-accessible content</h2>\n<p>For reference, points to be checked during the audit include:</p>\n<ul>\n<li>Text alternatives for homepage carousel images and gallery photos</li>\n<li>Color contrast (text over image backgrounds, particularly on the hero banner)</li>\n<li>Full keyboard navigation (menu, \"Write to the Minister\" form)</li>\n<li>Subtitles for video content (video library)</li>\n<li>Heading structure and screen reader compatibility</li>\n<li>Accessibility of tables and numerical indicators</li>\n</ul>\n<h2>4. Preparation of this statement</h2>\n<p>This statement was prepared in August 2026. It will be updated once the accessibility audit has been carried out.</p>\n<h2>5. Feedback and contact</h2>\n<p>If you encounter difficulty accessing content or a service, you can contact the Ministry to be directed to an accessible alternative or to obtain the content in another format.</p>\n<h2>6. Enforcement procedure</h2>\n<p>If you notice an accessibility issue that prevents you from accessing content or a feature of the site and you do not receive a satisfactory response from us, you are entitled to submit a complaint or request to the competent authorities for digital accessibility and administrative mediation.</p>\n<h2>7. Continuous improvement</h2>\n<p>The Ministry is committed to:</p>\n<ul>\n<li>Progressively correcting identified non-conformities</li>\n<li>Training the teams responsible for the site in accessibility best practices</li>\n<li>Regularly reassessing the site's compliance</li>\n</ul>"}, TRUE)
      ON CONFLICT (slug) DO NOTHING
    `;



    // ══════════════════════════════════════════════════════════════════
    // Plan du site : sections + liens internes, éditables et
    // régénérables depuis une suggestion de base (routes connues du site).
    // ══════════════════════════════════════════════════════════════════
    await sql.query(`
      CREATE TABLE IF NOT EXISTS sitemap_sections (
        id SERIAL PRIMARY KEY,
        title_fr TEXT NOT NULL, title_en TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS sitemap_links (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES sitemap_sections(id) ON DELETE CASCADE,
        label_fr TEXT NOT NULL, label_en TEXT,
        href TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const sitemapCount = await sql`SELECT COUNT(*) AS count FROM sitemap_sections`;
    if (Number(sitemapCount.rows[0].count) === 0) {
      const seedSitemap = [
        { titleFr: "Accueil", titleEn: "Home", links: [{ labelFr: "Page d'accueil", labelEn: "Homepage", href: "/" }] },
        { titleFr: "Actualités & Médias", titleEn: "News & Media", links: [{ labelFr: "Actualités", labelEn: "News", href: "/actualites" }, { labelFr: "Galerie photos", labelEn: "Photo gallery", href: "/galerie" }, { labelFr: "Vidéothèque", labelEn: "Video library", href: "/videotheque" }, { labelFr: "MTDI dans les médias", labelEn: "MTDI in the media", href: "/medias/mtdi-dans-les-medias" }] },
        { titleFr: "Le Ministère", titleEn: "The Ministry", links: [{ labelFr: "Le Ministre", labelEn: "The Minister", href: "/le-ministere/le-ministre" }, { labelFr: "Organigramme", labelEn: "Organizational chart", href: "/le-ministere/organigramme" }, { labelFr: "Directions centrales", labelEn: "Central departments", href: "/le-ministere/directions" }, { labelFr: "Cabinet", labelEn: "Cabinet", href: "/le-ministere/cabinet" }, { labelFr: "Missions & attributions", labelEn: "Missions & responsibilities", href: "/le-ministere/missions" }, { labelFr: "Structures sous tutelle", labelEn: "Supervised agencies", href: "/le-ministere/structures" }, { labelFr: "Partenaires", labelEn: "Partners", href: "/le-ministere/partenaires" }, { labelFr: "Écrire au Ministre", labelEn: "Write to the Minister", href: "/ecrire-au-ministre" }] },
        { titleFr: "Ressources", titleEn: "Resources", links: [{ labelFr: "Documenthèque", labelEn: "Document library", href: "/documentheque" }, { labelFr: "Textes juridiques", labelEn: "Legal texts", href: "/textes-juridiques" }, { labelFr: "e-Services", labelEn: "e-Services", href: "/e-services" }] },
        { titleFr: "Contact", titleEn: "Contact", links: [{ labelFr: "Nous contacter", labelEn: "Contact us", href: "/contact" }] },
        { titleFr: "Informations légales", titleEn: "Legal information", links: [{ labelFr: "Mentions légales", labelEn: "Legal notice", href: "/mentions-legales" }, { labelFr: "Politique de confidentialité", labelEn: "Privacy policy", href: "/confidentialite" }, { labelFr: "Accessibilité", labelEn: "Accessibility", href: "/accessibilite" }, { labelFr: "Plan du site", labelEn: "Sitemap", href: "/plan-du-site" }] },
      ];
      for (let i = 0; i < seedSitemap.length; i++) {
        const sec = seedSitemap[i];
        const secResult = await sql`
          INSERT INTO sitemap_sections (title_fr, title_en, display_order)
          VALUES (${sec.titleFr}, ${sec.titleEn}, ${i})
          RETURNING id
        `;
        const secId = secResult.rows[0].id;
        for (let j = 0; j < sec.links.length; j++) {
          const l = sec.links[j];
          await sql`
            INSERT INTO sitemap_links (section_id, label_fr, label_en, href, display_order)
            VALUES (${secId}, ${l.labelFr}, ${l.labelEn}, ${l.href}, ${j})
          `;
        }
      }
    }



    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises officielles — contenu institutionnel
    // (Directions, Structures, Cabinet, Missions, Partenaires). Idempotent :
    // ne touche jamais une traduction déjà saisie manuellement (par
    // exemple un admin qui aurait ajouté sa propre entrée entre-temps).
    // ══════════════════════════════════════════════════════════════════

    const directionsTranslations: Record<string, { type: string; description: string }> = {
      "Direction de la Programmation, de l'Administration et des Finances": { type: "Central Directorate", description: "Ensures the programming, administrative and financial management of the ministry. Oversees the budget, human resources, public procurement and logistics." },
      "Direction des Systèmes d'Information": { type: "Central Directorate", description: "The Information Systems Department ensures the alignment of the ministry's information system with national policy. It is responsible for defining and supervising the information system policy and its implementation, setting the Ministry's strategic IT direction, and guaranteeing IT security, reliability, confidentiality and integrity of information systems." },
      "Direction du Numérique": { type: "Technical Directorate", description: "The Digital Directorate is responsible for developing the policy for digital infrastructure, uses and content. It contributes to steering the national strategy for broadband and ultra-broadband infrastructure development, oversees the deployment of digital television and radio infrastructure, promotes electronic communications, and encourages the development of the digital economy industry." },
      "Direction de la Digitalisation": { type: "Technical Directorate", description: "The Digitalization Directorate is responsible for overseeing the implementation of the State's e-governance programme through the use of ICT in public administration and the digitization of public services. It promotes the digital transformation of businesses, contributes to the development of digital skills and the promotion of digital entrepreneurship, and contributes to the development of digital security policy and the implementation of the national cybersecurity strategy." },
      "Direction des Médias": { type: "Technical Directorate", description: "The Media Directorate is responsible for audiovisual policy and the digital transition of public and private media." },
    };
    for (const [nameFr, tr] of Object.entries(directionsTranslations)) {
      await sql`
        UPDATE directions SET type_en = ${tr.type}, description_en = ${tr.description}
        WHERE name_fr = ${nameFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    const structuresTranslations: Record<string, { description: string; missions: string[]; label: string }> = {
      "Société Béninoise d'Infrastructures Numériques": { description: "SBIN (Celtiis) is the national digital infrastructure operator, responsible for deploying and managing telecommunications networks and connectivity across Beninese territory.", missions: ["Deployment of fibre optic and telecommunications networks", "Management of national digital infrastructure", "Provision of broadband connectivity across the territory", "Development of digital access for citizens and businesses", "Support for the State's digital transformation"], label: "Digital infrastructure & connectivity" },
      "Agence des Systèmes d'Information et du Numérique": { description: "ASIN is the government agency responsible for the operational implementation of the State's cross-cutting and shared digital projects, as well as sector-specific projects delegated to it for execution.", missions: ["Operation and security of the State's shared information systems", "Public digital infrastructure: connectivity of public sites, data centres, sovereign hosting", "Cybersecurity: bjCSIRT (national incident response centre), security audits and qualification, threat monitoring", "Interoperability and digital trust: national data exchange platform (X-Road BJ), national PKI, electronic signature", "E-services and the national public services portal", "Support for administrations in their digital transformation", "Integration of artificial intelligence into public services, in support of the National AI Strategy"], label: "Information systems & cybersecurity" },
    };
    for (const [nameFr, tr] of Object.entries(structuresTranslations)) {
      await sql`
        UPDATE structures SET description_en = ${tr.description}, missions_en = ${JSON.stringify(tr.missions)}::jsonb, label_en = ${tr.label}
        WHERE name_fr = ${nameFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    const cabinetTranslations: Record<string, { direction: string; description: string }> = {
      "Ministre": { direction: "Ministry of Digital Transformation and Innovation", description: "Political authority in charge of defining and implementing government policy on digital transformation, innovation and artificial intelligence." },
      "Directeur de Cabinet": { direction: "Minister's Cabinet", description: "Coordinates all activities of the ministerial cabinet, liaises with other government institutions, and oversees the implementation of the Minister's decisions." },
      "Secrétaire Général du Ministère": { direction: "General Secretariat", description: "Ensures the administrative coordination of all the ministry's directorates and services. Guarantees the continuity and consistency of ministerial action." },
      "Conseillers Techniques (CT)": { direction: "Minister's Cabinet", description: "The Technical Advisors assist the Minister and the Cabinet Director with sector expertise, case analysis and the preparation of strategic decisions. They work in the fields of artificial intelligence, digital transformation, cybersecurity, digital public policy and international cooperation." },
    };
    for (const [roleFr, tr] of Object.entries(cabinetTranslations)) {
      await sql`
        UPDATE cabinet_members SET direction_en = ${tr.direction}, description_en = ${tr.description}
        WHERE role_fr = ${roleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }



    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises officielles — Missions & Partenaires.
    // ══════════════════════════════════════════════════════════════════
    const missionsTranslations: [string, string][] = [
      ["Élaborer les politiques sectorielles et exécuter les stratégies liées à l'agenda numérique de l'État", "Develop sectoral policies and implement strategies related to the State's digital agenda"],
      ["Favoriser le développement des infrastructures, des usages et des contenus numériques par les technologies innovantes", "Foster the development of digital infrastructure, uses and content through innovative technologies"],
      ["Intégrer les technologies numériques dans les structures de l'État pour améliorer la performance, l'accessibilité, la transparence et l'efficacité des services publics", "Integrate digital technologies into State structures to improve the performance, accessibility, transparency and efficiency of public services"],
      ["Promouvoir la transformation digitale des entreprises", "Promote the digital transformation of businesses"],
      ["Mettre en place l'infrastructure numérique de collecte, de transport et de distribution de la télévision et de la radiodiffusion", "Establish the digital infrastructure for the collection, transport and distribution of television and radio broadcasting"],
      ["Conduire des études prospectives et formuler des recommandations sur les projets numériques de l'État", "Conduct forward-looking studies and formulate recommendations on the State's digital projects"],
      ["Promouvoir les communications électroniques et les services numériques innovants en partenariat avec les autorités de régulation", "Promote electronic communications and innovative digital services in partnership with regulatory authorities"],
      ["Assurer la gestion optimale des licences et des ressources de l'État", "Ensure the optimal management of the State's licences and resources"],
      ["Établir un cadre législatif et réglementaire favorable au développement du numérique", "Establish a legislative and regulatory framework conducive to digital development"],
      ["Réduire la fracture numérique entre les régions et les populations", "Reduce the digital divide between regions and populations"],
      ["Promouvoir les compétences numériques et l'entrepreneuriat digital", "Promote digital skills and digital entrepreneurship"],
      ["Lutter contre les déchets électroniques en coordination avec les agences environnementales", "Combat electronic waste in coordination with environmental agencies"],
      ["Instaurer des mécanismes durables de confiance numérique", "Establish sustainable digital trust mechanisms"],
      ["Développer les partenariats avec le secteur privé et les institutions internationales", "Develop partnerships with the private sector and international institutions"],
      ["Représenter le Bénin dans les instances internationales de gouvernance du numérique", "Represent Benin in international digital governance bodies"],
      ["Accompagner les médias publics et privés dans leur transition numérique", "Support public and private media in their digital transition"],
      ["Renforcer la qualité du paysage audiovisuel", "Strengthen the quality of the audiovisual landscape"],
    ];
    for (const [textFr, textEn] of missionsTranslations) {
      await sql`UPDATE missions SET text_en = ${textEn} WHERE text_fr = ${textFr} AND (text_en IS NULL OR text_en = '')`;
    }

    const partnersTranslations: Record<string, { full: string; description: string }> = {
      "APDP": { full: "Personal Data Protection Authority", description: "National authority overseeing the processing of personal data, guaranteeing respect for digital privacy in Benin." },
      "ANIP": { full: "National Agency for Personal Identification", description: "Manages civil identity and issues official identity documents for Beninese citizens, including the MonIdentité.bj programme." },
      "Présidence": { full: "Presidency of the Republic of Benin", description: "Government oversight authority, whose digital priorities guide the ministry's roadmap." },
      "Sèmè City": { full: "City of Innovation and Knowledge", description: "Benin's innovation and entrepreneurship hub, a laboratory for African digital transformation located in Cotonou." },
      "Banque Mondiale": { full: "World Bank Group", description: "Financial and technical partner for major digital infrastructure and capacity-building projects." },
      "Smart Africa": { full: "Smart Africa Alliance", description: "Continental alliance promoting inclusive digital transformation in Africa; Benin is an active member." },
      "ITU": { full: "International Telecommunication Union", description: "Specialized United Nations agency for ICT; supports Benin on connectivity governance and policy." },
      "UAC": { full: "University of Abomey-Calavi", description: "Benin's leading university, a partner for digital skills training programmes and artificial intelligence research." },
      "INFOTI": { full: "National Institute for Information Technology Training", description: "Public vocational training institute in ICT, digital technology and telecommunications." },
    };
    for (const [name, tr] of Object.entries(partnersTranslations)) {
      await sql`
        UPDATE partners SET full_en = ${tr.full}, description_en = ${tr.description}
        WHERE name = ${name} AND (description_en IS NULL OR description_en = '')
      `;
    }



    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises officielles — Documenthèque.
    // ══════════════════════════════════════════════════════════════════
    const documentsTranslations: Record<string, { title: string; description: string }> = {
      "Plan d'Engagement Environnemental et Social (PEES) : WARDIP": { title: "Environmental and Social Commitment Plan (ESCP): WARDIP", description: "Environmental and Social Commitment Plan under the WARDIP project (West Africa Regional Digital Integration Program)." },
      "Plan de Gestion de la Main-d'œuvre (PGMO) : WARDIP": { title: "Labour Management Plan (LMP): WARDIP", description: "Labour Management Plan under the WARDIP project." },
      "Plan de Mobilisation des Parties Prenantes (PMPP) incluant le MGP : WARDIP": { title: "Stakeholder Engagement Plan (SEP) including the GRM: WARDIP", description: "Stakeholder Engagement Plan including the Grievance Redress Mechanism under the WARDIP project." },
      "Résultats de la sélection dans le cadre de la participation du Bénin aux OIIA 2025": { title: "Selection results for Benin's participation in the IOAI 2025", description: "Results of the selection of Beninese candidates for participation in the 2025 International Olympiad in Artificial Intelligence." },
      "Magazine Bénin Numérique N°3": { title: "Digital Benin Magazine No. 3", description: "Third edition of the Digital Benin magazine." },
      "Liste des Fournisseurs de Services de Sécurité Numérique qualifiés en République du Bénin": { title: "List of qualified digital security service providers in the Republic of Benin", description: "Official list of qualified digital security service providers in the Republic of Benin." },
      "Rapport de vulnérabilités et d'incidents du cyberespace béninois": { title: "Report on vulnerabilities and incidents in the Beninese cyberspace", description: "Report on security vulnerabilities and incidents identified in the Beninese cyberspace." },
      "Magazine Bénin Numérique N°2": { title: "Digital Benin Magazine No. 2", description: "Second edition of the Digital Benin magazine: news, innovations and developments in the digital sector." },
      "Référentiel des exigences relatives à la qualification des fournisseurs de services de sécurité numérique en République du Bénin": { title: "Reference framework for the qualification of digital security service providers in the Republic of Benin", description: "Reference framework defining the requirements for the qualification of digital security service providers in Benin." },
      "Magazine Bénin Numérique N°1": { title: "Digital Benin Magazine No. 1", description: "First edition of the Digital Benin magazine: overview, projects and outlook for digital development in Benin." },
      "Règles de politique de protection des infrastructures d'information critiques en République du Bénin": { title: "Policy rules for the protection of critical information infrastructure in the Republic of Benin", description: "Document setting out the rules for protecting critical information infrastructure in the Republic of Benin." },
      "État des lieux de l'écosystème digital et de l'entrepreneuriat numérique au Bénin": { title: "Overview of the digital ecosystem and digital entrepreneurship in Benin", description: "Report on the state of the digital ecosystem and digital entrepreneurship in the Republic of Benin." },
      "Guide de l'Entrepreneur Digital : Bénin": { title: "Digital Entrepreneur's Guide: Benin", description: "Practical guide for digital entrepreneurs in Benin." },
    };
    for (const [titleFr, tr] of Object.entries(documentsTranslations)) {
      await sql`
        UPDATE documents SET title_en = ${tr.title}, description_en = ${tr.description}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }



    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises officielles — Textes juridiques, Kit presse,
    // Vidéothèque, Médias, e-Services.
    // ══════════════════════════════════════════════════════════════════

    const textesTranslations: Record<string, { type: string; status: string; description: string; articles: string }> = {
      "Code du numérique en République du Bénin": { type: "Law", status: "In force", description: "Founding legal framework governing the digital economy in Benin. Covers the protection of personal data, cybersecurity, electronic transactions, e-commerce, electronic communications and offences related to information and communication technologies.", articles: "478 articles across 8 books" },
      "Loi portant modification du code du numérique en République du Bénin": { type: "Law", status: "In force", description: "Law amending Law No. 2017-20 of 20 April 2018 on the Digital Code of the Republic of Benin. Updates and supplements the founding digital legal framework.", articles: "Amending text" },
    };
    for (const [titleFr, tr] of Object.entries(textesTranslations)) {
      await sql`
        UPDATE textes_juridiques SET type_en = ${tr.type}, status_en = ${tr.status}, description_en = ${tr.description}, articles_en = ${tr.articles}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    const kitTranslations: Record<string, { title: string; description: string }> = {
      "Logo MTDI — Usage officiel": { title: "MTDI Logo — Official use", description: "Official vector logo of the Ministry of Digital Transformation and Innovation." },
      "Bannière officielle MTDI": { title: "Official MTDI banner", description: "Horizontal banner with the Ministry's complete visual identity." },
    };
    for (const [titleFr, tr] of Object.entries(kitTranslations)) {
      await sql`
        UPDATE kit_presse_items SET title_en = ${tr.title}, description_en = ${tr.description}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    const videosTranslations: Record<string, string> = {
      "2ème Conférence des RSSI : la sécurité numérique au cœur de l'État augmenté": "2nd CISO Conference: digital security at the heart of the augmented State",
      "Cyberdrill RSSI : Exercice de cybersécurité national": "CISO Cyberdrill: national cybersecurity exercise",
      "« J'aime ma langue » : Intégration des langues nationales dans l'IA": "\"I Love My Language\": integrating national languages into AI",
    };
    for (const [titleFr, titleEn] of Object.entries(videosTranslations)) {
      await sql`UPDATE videos SET title_en = ${titleEn} WHERE title_fr = ${titleFr} AND (title_en IS NULL OR title_en = '')`;
    }

    const mediasTranslations: Record<string, { type: string; title: string; excerpt: string }> = {
      "MTDI sur Instagram : Reel 1": { type: "Media", title: "MTDI on Instagram: Reel 1", excerpt: "Discover the activities of the Ministry of Digital Transformation and Innovation on video on Instagram." },
      "MTDI sur Instagram : Reel 2": { type: "Media", title: "MTDI on Instagram: Reel 2", excerpt: "Follow the latest MTDI news on social media." },
      "MTDI sur YouTube : Interview et reportage": { type: "Media", title: "MTDI on YouTube: Interview and report", excerpt: "Watch interviews and reports from the Ministry of Digital Transformation and Innovation." },
    };
    for (const [titleFr, tr] of Object.entries(mediasTranslations)) {
      await sql`
        UPDATE media_mentions SET type_en = ${tr.type}, title_en = ${tr.title}, excerpt_en = ${tr.excerpt}
        WHERE title_fr = ${titleFr} AND (title_en IS NULL OR title_en = '')
      `;
    }

    const eservicesTranslations: Record<string, { title: string; description: string }> = {
      "État civil": { title: "Civil status", description: "Request your birth, marriage and death certificates online. Collect your documents at the civil status centre of your choice." },
      "Fiscalité": { title: "Taxation", description: "File and pay your taxes online via the e-Taxes platform. Access your taxpayer account and track your tax obligations." },
      "Identité": { title: "Identity", description: "Obtain your biometric national ID card or passport via MonIdentite.bj. Track the progress of your application in real time." },
      "Permis & autorisations": { title: "Permits & authorizations", description: "Apply for building permits, business licences and administrative authorizations. All your procedures gathered in a single portal." },
      "Éducation": { title: "Education", description: "School and university enrolment, scholarship applications, diploma equivalence and career guidance online." },
      "Santé": { title: "Health", description: "Manage your universal health insurance (ARCH), check your digital vaccination record, and access health services online." },
      "Emploi": { title: "Employment", description: "Browse public job offers, submit your application and track your dealings with administrations in one place." },
      "Foncier": { title: "Land & property", description: "Secure your land titles, carry out your land registry procedures and track your property files online." },
    };
    for (const [titleFr, tr] of Object.entries(eservicesTranslations)) {
      await sql`
        UPDATE eservices SET title_en = ${tr.title}, description_en = ${tr.description}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }



    // ══════════════════════════════════════════════════════════════════
    // Traductions anglaises officielles — Stratégie IA (piliers, jalons,
    // olympiades, critères) et Contacts spécifiques.
    // ══════════════════════════════════════════════════════════════════

    const piliersTranslations: Record<string, { title: string; description: string }> = {
      "Gouvernance & Éthique": { title: "Governance & Ethics", description: "A leading African regulatory framework guaranteeing transparent, fair AI that respects fundamental rights. National ethics committee, algorithmic audits and personal data protection." },
      "Infrastructures IA": { title: "AI Infrastructure", description: "Digital sovereignty through Benin's public cloud, high-availability data centres and a structured national open data network for training AI models." },
      "Talents & Compétences": { title: "Talent & Skills", description: "Training 10,000 AI professionals by 2030 through the Digital Academy, university partnerships, excellence scholarships and internationally recognized certification programmes." },
      "Projets & Innovation": { title: "Projects & Innovation", description: "Deploying AI in agriculture, health, education and public services. Benin AI Challenge, national incubator, and support fund for Beninese deeptech startups." },
    };
    for (const [titleFr, tr] of Object.entries(piliersTranslations)) {
      await sql`
        UPDATE ia_piliers SET title_en = ${tr.title}, description_en = ${tr.description}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    const jalonsTranslations: Record<string, { title: string; description: string }> = {
      "Diagnostic national": { title: "National assessment", description: "National assessment of Benin's AI capabilities, stakeholder mapping, identification of priority use cases." },
      "Adoption de la stratégie": { title: "Strategy adoption", description: "Inter-ministerial validation and official launch of the National Artificial Intelligence Strategy." },
      "Création de l'ANAI": { title: "Establishment of ANAI", description: "Establishment of the National Artificial Intelligence Agency. First calls for projects." },
      "Montée en charge": { title: "Scaling up", description: "10 sectoral AI projects deployed. Opening of Benin's first sovereign Data Centre." },
      "Maturité et consolidation": { title: "Maturity and consolidation", description: "5,000 certified professionals. AI legal framework adopted by the National Assembly." },
      "Bénin, nation de l'IA": { title: "Benin, an AI nation", description: "Benin ranked in the African top 5 for AI adoption. Continental AI platform deployed." },
    };
    for (const [titleFr, tr] of Object.entries(jalonsTranslations)) {
      await sql`
        UPDATE ia_jalons SET title_en = ${tr.title}, description_en = ${tr.description}
        WHERE title_fr = ${titleFr} AND (description_en IS NULL OR description_en = '')
      `;
    }

    await sql`
      UPDATE ia_olympiades_editions SET
        title_en = ${"1st edition — National AI Olympiad (NOAI)"},
        description_en = ${"Inaugural competition to select young Beninese talents who will represent the country at the International Olympiad in Artificial Intelligence (IOAI) 2026 in Kazakhstan, from 2 to 8 August."},
        highlight_en = ${"8 winners selected on 4 July at Sèmè One"}
      WHERE title_fr = ${"1ère édition — Olympiades Nationales d'IA (NOAI)"} AND (description_en IS NULL OR description_en = '')
    `;

    const criteresTranslations: Record<string, string> = {
      "Être scolarisé au Bénin, niveau lycée ou premier cycle universitaire": "Be enrolled in school in Benin, at secondary or undergraduate level",
      "Maîtriser les fondamentaux de la programmation et des mathématiques": "Have a solid grasp of the fundamentals of programming and mathematics",
      "S'inscrire via la plateforme dédiée avant la date limite officielle": "Register via the dedicated platform before the official deadline",
      "Réussir les épreuves de présélection (algorithmique, machine learning, éthique de l'IA)": "Pass the preselection tests (algorithms, machine learning, AI ethics)",
    };
    for (const [textFr, textEn] of Object.entries(criteresTranslations)) {
      await sql`UPDATE ia_criteres SET text_en = ${textEn} WHERE text_fr = ${textFr} AND (text_en IS NULL OR text_en = '')`;
    }

    const contactsTranslations: Record<string, { role: string; name: string; note: string }> = {
      "Presse & Accréditations": { role: "Press & Accreditation", name: "Communication Department", note: "For interview requests, accreditation and press kits." },
      "Partenariats & Coopération": { role: "Partnerships & Cooperation", name: "Partnerships Directorate", note: "International organizations, funding bodies, technical partners." },
      "Réclamations & Signalements": { role: "Complaints & Reports", name: "Citizen Response Unit", note: "Handling of reports and complaints relating to public digital services." },
    };
    for (const [roleFr, tr] of Object.entries(contactsTranslations)) {
      await sql`
        UPDATE contacts_specifiques SET role_en = ${tr.role}, name_en = ${tr.name}, note_en = ${tr.note}
        WHERE role_fr = ${roleFr} AND (note_en IS NULL OR note_en = '')
      `;
    }


    // Texte affiché sous les Chiffres clés (accueil) — reprend exactement
    // le texte déjà en ligne, désormais éditable depuis le back-office.
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('stats_meta', ${JSON.stringify({
        dateLabelFr: "Données au 1ᵉʳ juillet 2026",
        dateLabelEn: "Data as of July 1, 2026",
        frequencyFr: "Mise à jour trimestrielle",
        frequencyEn: "Quarterly update",
      })}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;

    return NextResponse.json({ ok: true, message: "Migration appliquée." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
