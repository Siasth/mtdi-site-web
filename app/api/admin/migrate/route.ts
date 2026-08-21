import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

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
    await sql.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE`
    );

    await sql`
      INSERT INTO settings (key, value)
      VALUES ('force_2fa_all', 'false'::jsonb)
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
        await sql`
          INSERT INTO actualites (title_fr, excerpt_fr, category, image, href_external, published_at, featured, display_order, read_time, status)
          VALUES (${a.title}, ${a.excerpt}, ${a.category}, ${a.image}, ${a.link || null}, ${a.date}, ${a.featured}, ${i}, ${a.readTime}, 'publie')
        `;
      }
    }

    return NextResponse.json({ ok: true, message: "Migration appliquée." });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
