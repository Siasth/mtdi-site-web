import { sql } from "@/lib/db";

export type HeroSlide = { id: number; src: string; alt: string; video?: string };

export async function getHeroSlides(locale: "fr" | "en"): Promise<HeroSlide[]> {
  const result = await sql`
    SELECT id, image, video, alt_fr, alt_en
    FROM hero_slides
    WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY display_order ASC
  `;
  return result.rows.map((r) => ({
    id: r.id as number,
    src: r.image as string,
    alt: (locale === "en" && r.alt_en ? r.alt_en : r.alt_fr) as string,
    video: (r.video as string) || undefined,
  }));
}
