import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { PERMISSIONS, SUPER_ADMIN_ROLE_NAME } from "@/lib/permissions";

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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
      })}::jsonb)
      ON CONFLICT (key) DO NOTHING
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
        paragraphsFr: [
          "La technologie ne vaut que par ce qu'elle change concrètement dans la vie des hommes, et d'abord par sa contribution à l'éradication de l'extrême pauvreté.",
          "Le Ministère de la Transformation Digitale et de l'Innovation a pour mission de conduire la feuille de route technologique au service des politiques publiques, et de bâtir un écosystème d'innovation dynamique, inclusif et compétitif.",
        ],
        paragraphsEn: [],
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

    const chantiersCount = await sql`SELECT COUNT(*) AS count FROM chantiers`;
    if (Number(chantiersCount.rows[0].count) === 0) {
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

    return NextResponse.json({ ok: true, message: "Migration appliquée." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
