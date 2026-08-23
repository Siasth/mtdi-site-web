import { sql } from "@/lib/db";

export type GalerieCollection = { id: number; name: string };
export type GalerieItem = {
  id: number;
  type: "photo" | "video";
  title: string;
  description: string;
  eventDate: string | null;
  credit: string | null;
  collectionId: number | null;
  collectionName: string;
  image: string | null;
  videoUrl: string | null;
  hrefExternal: string | null;
};

type Locale = "fr" | "en";

export async function getGalerieCollections(locale: Locale): Promise<GalerieCollection[]> {
  const result = await sql`
    SELECT id, name_fr, name_en FROM galerie_collections
    WHERE deleted_at IS NULL
    ORDER BY display_order ASC
  `;
  return result.rows.map((r) => ({
    id: r.id as number,
    name: (locale === "en" && r.name_en ? r.name_en : r.name_fr) as string,
  }));
}

function mapItem(r: Record<string, unknown>, locale: Locale): GalerieItem {
  return {
    id: r.id as number,
    type: (r.type as "photo" | "video") || "photo",
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
    eventDate: (r.event_date as string) || null,
    credit: (r.credit as string) || null,
    collectionId: (r.collection_id as number) ?? null,
    collectionName: ((locale === "en" && r.coll_name_en ? r.coll_name_en : r.coll_name_fr) as string) || "",
    image: (r.image as string) || null,
    videoUrl: (r.video_url as string) || null,
    hrefExternal: (r.href_external as string) || null,
  };
}

// Tous les éléments publiés (page /galerie complète).
export async function getGalerieItems(locale: Locale): Promise<GalerieItem[]> {
  const result = await sql`
    SELECT g.*, c.name_fr AS coll_name_fr, c.name_en AS coll_name_en
    FROM galerie_items g
    LEFT JOIN galerie_collections c ON c.id = g.collection_id
    WHERE g.deleted_at IS NULL AND g.status = 'publie'
    ORDER BY g.event_date DESC NULLS LAST, g.display_order ASC
  `;
  return result.rows.map((r) => mapItem(r, locale));
}

// Éléments mis en avant (widget "L'innovation en images" de l'accueil).
export async function getFeaturedGalerieItems(locale: Locale, limit = 8): Promise<GalerieItem[]> {
  const result = await sql`
    SELECT g.*, c.name_fr AS coll_name_fr, c.name_en AS coll_name_en
    FROM galerie_items g
    LEFT JOIN galerie_collections c ON c.id = g.collection_id
    WHERE g.deleted_at IS NULL AND g.status = 'publie' AND g.featured_home = TRUE
    ORDER BY g.display_order ASC
    LIMIT ${limit}
  `;
  return result.rows.map((r) => mapItem(r, locale));
}
