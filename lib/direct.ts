import { sql } from "@/lib/db";

export type UpcomingEvent = { id: number; date: string; title: string; description: string };
export type Replay = { id: number; title: string; source: string; date: string; url: string };
type Locale = "fr" | "en";

export async function getUpcomingEvents(locale: Locale): Promise<UpcomingEvent[]> {
  const result = await sql`
    SELECT * FROM direct_upcoming WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY event_date ASC
  `;
  return result.rows.map((r) => ({
    id: r.id as number,
    date: new Date(r.event_date as string).toISOString(),
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    description: ((locale === "en" && r.description_en ? r.description_en : r.description_fr) as string) || "",
  }));
}

export async function getReplays(locale: Locale): Promise<Replay[]> {
  const result = await sql`
    SELECT * FROM direct_replays WHERE deleted_at IS NULL AND active = TRUE
    ORDER BY replay_date DESC NULLS LAST, display_order ASC
  `;
  return result.rows.map((r) => ({
    id: r.id as number,
    title: (locale === "en" && r.title_en ? r.title_en : r.title_fr) as string,
    source: (r.source as string) || "",
    date: r.replay_date ? new Date(r.replay_date as string).toISOString() : "",
    url: r.url as string,
  }));
}
