import { sql } from "@/lib/db";

export type SearchResult = {
  title: string;
  description: string;
  category: "Actualités" | "Pages" | "Rubriques";
  href: string;
};

type Locale = "fr" | "en";

// Rubriques statiques : pages de section qui n'ont pas de contenu unitaire
// en base (ce sont les pages elles-mêmes, pas des enregistrements dedans).
const RUBRIQUES_FR = [
  { title: "Actualités", description: "Communiqués, discours et dossiers du Ministère.", href: "/actualites" },
  { title: "Galerie photos", description: "Photos officielles des événements et activités du Ministère.", href: "/galerie" },
  { title: "Vidéothèque", description: "Vidéos officielles du Ministère — discours, reportages, événements.", href: "/videotheque" },
  { title: "Documenthèque", description: "Bibliothèque de documents officiels, rapports et publications.", href: "/documentheque" },
  { title: "Textes juridiques", description: "Lois, décrets et textes réglementaires du secteur numérique.", href: "/textes-juridiques" },
  { title: "Kit presse", description: "Logos, bannières et ressources pour la presse.", href: "/kit-presse" },
  { title: "En direct", description: "Événements en direct et replays du Ministère.", href: "/direct" },
  { title: "Le Ministre", description: "Biographie et priorités du Ministre de la Transformation Digitale et de l'Innovation.", href: "/le-ministere/le-ministre" },
  { title: "Organigramme du Ministère", description: "Organisation interne et hiérarchie du ministère.", href: "/le-ministere/organigramme" },
  { title: "Stratégie Nationale d'Intelligence Artificielle", description: "La vision et la feuille de route du Bénin en matière d'intelligence artificielle.", href: "/strategie-ia" },
  { title: "Initiatives Stratégie IA", description: "Jalons et feuille de route de la Stratégie Nationale d'IA.", href: "/strategie-ia/initiatives" },
  { title: "Olympiades Nationales d'IA", description: "Compétition nationale de sélection des jeunes talents béninois en intelligence artificielle.", href: "/strategie-ia/olympiades-ia" },
  { title: "e-Services", description: "Services publics numériques du gouvernement béninois.", href: "/e-services" },
  { title: "Participer", description: "Offres d'emploi, stages et appels d'offres publiés par le Ministère.", href: "/participer" },
  { title: "Contact", description: "Coordonnées et formulaire de contact du Ministère.", href: "/contact" },
  { title: "Écrire au Ministre", description: "Adressez directement votre message au cabinet du Ministre.", href: "/ecrire-au-ministre" },
];
const RUBRIQUES_EN = [
  { title: "News", description: "Press releases, speeches and reports from the Ministry.", href: "/actualites" },
  { title: "Photo gallery", description: "Official photos of the Ministry's events and activities.", href: "/galerie" },
  { title: "Video library", description: "Official Ministry videos — speeches, reports, events.", href: "/videotheque" },
  { title: "Document library", description: "Library of official documents, reports and publications.", href: "/documentheque" },
  { title: "Legal texts", description: "Laws, decrees and regulatory texts for the digital sector.", href: "/textes-juridiques" },
  { title: "Press kit", description: "Logos, banners and resources for the press.", href: "/kit-presse" },
  { title: "Live", description: "Live events and replays from the Ministry.", href: "/direct" },
  { title: "The Minister", description: "Biography and priorities of the Minister of Digital Transformation and Innovation.", href: "/le-ministere/le-ministre" },
  { title: "Ministry organizational chart", description: "Internal organization and hierarchy of the ministry.", href: "/le-ministere/organigramme" },
  { title: "National Artificial Intelligence Strategy", description: "Benin's vision and roadmap for artificial intelligence.", href: "/strategie-ia" },
  { title: "AI Strategy Initiatives", description: "Milestones and roadmap of the National AI Strategy.", href: "/strategie-ia/initiatives" },
  { title: "National AI Olympiad", description: "National competition to select young Beninese AI talents.", href: "/strategie-ia/olympiades-ia" },
  { title: "e-Services", description: "Digital public services of the Beninese government.", href: "/e-services" },
  { title: "Get involved", description: "Job offers, internships and tenders published by the Ministry.", href: "/participer" },
  { title: "Contact", description: "Ministry contact details and form.", href: "/contact" },
  { title: "Write to the Minister", description: "Send your message directly to the Minister's cabinet.", href: "/ecrire-au-ministre" },
];

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function score(title: string, description: string, terms: string[], fullQuery: string): number {
  const titleN = normalize(title);
  const descN = normalize(description);
  let s = 0;
  if (titleN === fullQuery) s += 100;
  if (titleN.startsWith(fullQuery)) s += 50;
  if (titleN.includes(fullQuery)) s += 30;
  for (const term of terms) {
    if (titleN.includes(term)) s += 10;
    if (descN.includes(term)) s += 5;
  }
  return s;
}

export async function searchSite(query: string, locale: Locale): Promise<SearchResult[]> {
  const q = normalize(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const like = `%${query.trim()}%`;
  const results: SearchResult[] = [];

  // ── Actualités ──
  const articles = await sql`
    SELECT id, title_fr, title_en, excerpt_fr, excerpt_en, href_external
    FROM actualites
    WHERE deleted_at IS NULL AND status = 'publie' AND (scheduled_at IS NULL OR scheduled_at <= now())
      AND (title_fr ILIKE ${like} OR title_en ILIKE ${like} OR excerpt_fr ILIKE ${like} OR excerpt_en ILIKE ${like})
    LIMIT 20
  `;
  for (const a of articles.rows) {
    const title = ((locale === "en" && a.title_en ? a.title_en : a.title_fr) as string) || "";
    const excerptRaw = ((locale === "en" && a.excerpt_en ? a.excerpt_en : a.excerpt_fr) as string) || "";
    const description = excerptRaw.replace(/<[^>]+>/g, "").slice(0, 160);
    results.push({
      title, description, category: "Actualités",
      href: (a.href_external as string) || `/actualites/${a.id}`,
    });
  }

  // ── Contenu institutionnel & documents (catégorie "Pages") ──
  const documents = await sql`
    SELECT title_fr, title_en, description_fr, description_en, href
    FROM documents WHERE deleted_at IS NULL AND active = TRUE
      AND (title_fr ILIKE ${like} OR title_en ILIKE ${like} OR description_fr ILIKE ${like} OR description_en ILIKE ${like})
    LIMIT 10
  `;
  for (const d of documents.rows) {
    results.push({
      title: ((locale === "en" && d.title_en ? d.title_en : d.title_fr) as string) || "",
      description: ((locale === "en" && d.description_en ? d.description_en : d.description_fr) as string) || "",
      category: "Pages", href: "/documentheque",
    });
  }

  const textes = await sql`
    SELECT title_fr, title_en, description_fr, description_en
    FROM textes_juridiques WHERE deleted_at IS NULL AND active = TRUE
      AND (title_fr ILIKE ${like} OR title_en ILIKE ${like} OR description_fr ILIKE ${like} OR description_en ILIKE ${like})
    LIMIT 10
  `;
  for (const t of textes.rows) {
    results.push({
      title: ((locale === "en" && t.title_en ? t.title_en : t.title_fr) as string) || "",
      description: ((locale === "en" && t.description_en ? t.description_en : t.description_fr) as string) || "",
      category: "Pages", href: "/textes-juridiques",
    });
  }

  const directions = await sql`
    SELECT name_fr, name_en, description_fr, description_en
    FROM directions WHERE deleted_at IS NULL AND active = TRUE
      AND (name_fr ILIKE ${like} OR name_en ILIKE ${like} OR description_fr ILIKE ${like})
    LIMIT 10
  `;
  for (const d of directions.rows) {
    results.push({
      title: ((locale === "en" && d.name_en ? d.name_en : d.name_fr) as string) || "",
      description: (((locale === "en" && d.description_en ? d.description_en : d.description_fr) as string) || "").replace(/<[^>]+>/g, "").slice(0, 160),
      category: "Pages", href: "/le-ministere/directions",
    });
  }

  const structures = await sql`
    SELECT name_fr, name_en, description_fr, description_en
    FROM structures WHERE deleted_at IS NULL AND active = TRUE
      AND (name_fr ILIKE ${like} OR name_en ILIKE ${like} OR description_fr ILIKE ${like})
    LIMIT 10
  `;
  for (const s of structures.rows) {
    results.push({
      title: ((locale === "en" && s.name_en ? s.name_en : s.name_fr) as string) || "",
      description: (((locale === "en" && s.description_en ? s.description_en : s.description_fr) as string) || "").replace(/<[^>]+>/g, "").slice(0, 160),
      category: "Pages", href: "/le-ministere/structures",
    });
  }

  const cabinet = await sql`
    SELECT role_fr, role_en, description_fr, description_en
    FROM cabinet_members WHERE deleted_at IS NULL AND active = TRUE
      AND (role_fr ILIKE ${like} OR role_en ILIKE ${like} OR description_fr ILIKE ${like})
    LIMIT 10
  `;
  for (const c of cabinet.rows) {
    results.push({
      title: ((locale === "en" && c.role_en ? c.role_en : c.role_fr) as string) || "",
      description: (((locale === "en" && c.description_en ? c.description_en : c.description_fr) as string) || "").replace(/<[^>]+>/g, "").slice(0, 160),
      category: "Pages", href: "/le-ministere/cabinet",
    });
  }

  const partners = await sql`
    SELECT name, full_fr, full_en, description_fr, description_en
    FROM partners WHERE deleted_at IS NULL AND active = TRUE
      AND (name ILIKE ${like} OR full_fr ILIKE ${like} OR description_fr ILIKE ${like})
    LIMIT 10
  `;
  for (const p of partners.rows) {
    results.push({
      title: (p.name as string) || "",
      description: ((locale === "en" && p.description_en ? p.description_en : p.description_fr) as string) || "",
      category: "Pages", href: "/le-ministere/partenaires",
    });
  }

  const eservices = await sql`
    SELECT title_fr, title_en, description_fr, description_en
    FROM eservices WHERE deleted_at IS NULL AND active = TRUE
      AND (title_fr ILIKE ${like} OR title_en ILIKE ${like} OR description_fr ILIKE ${like})
    LIMIT 10
  `;
  for (const e of eservices.rows) {
    results.push({
      title: ((locale === "en" && e.title_en ? e.title_en : e.title_fr) as string) || "",
      description: ((locale === "en" && e.description_en ? e.description_en : e.description_fr) as string) || "",
      category: "Pages", href: "/e-services",
    });
  }

  const videos = await sql`
    SELECT title_fr, title_en FROM videos WHERE deleted_at IS NULL AND active = TRUE
      AND (title_fr ILIKE ${like} OR title_en ILIKE ${like})
    LIMIT 10
  `;
  for (const v of videos.rows) {
    results.push({
      title: ((locale === "en" && v.title_en ? v.title_en : v.title_fr) as string) || "",
      description: "", category: "Pages", href: "/videotheque",
    });
  }

  // ── Score, filtre, tri ──
  const scored = results
    .map((r) => ({ ...r, _score: score(r.title, r.description, terms, q) }))
    .filter((r) => r._score > 0);

  // ── Rubriques (pages de section statiques, cherchées séparément) ──
  const rubriques = locale === "en" ? RUBRIQUES_EN : RUBRIQUES_FR;
  for (const r of rubriques) {
    const s = score(r.title, r.description, terms, q);
    if (s > 0) scored.push({ ...r, category: "Rubriques" as const, _score: s });
  }

  return scored.sort((a, b) => b._score - a._score).map(({ _score, ...r }) => r);
}
