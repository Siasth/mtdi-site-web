import "server-only";
import { sql } from "@/lib/db";

// ANO-089 / ANO-142 : le module Direct n'avait aucun lecteur vidéo réel — juste
// un cadre statique. On stocke ici un réglage unique (comme les paramètres
// SMTP ou généraux) plutôt qu'une table dédiée, car il n'y a qu'un seul
// direct actif à la fois.
export type LiveStreamProvider = "youtube" | "facebook" | "custom" | "";

export type LiveStreamSettings = {
  isLive: boolean;
  provider: LiveStreamProvider;
  url: string;
  titleFr: string;
  titleEn: string;
};

export const LIVE_STREAM_DEFAULTS: LiveStreamSettings = {
  isLive: false,
  provider: "",
  url: "",
  titleFr: "",
  titleEn: "",
};

export async function getLiveStreamSettings(): Promise<LiveStreamSettings> {
  const result = await sql`SELECT value FROM settings WHERE key = 'direct_live'`;
  const stored = (result.rows[0]?.value as Partial<LiveStreamSettings>) || {};
  return { ...LIVE_STREAM_DEFAULTS, ...stored };
}

// Détecte automatiquement la plateforme à partir de l'URL collée par
// l'administrateur, pour éviter d'avoir à lui faire choisir manuellement.
export function detectProvider(url: string): LiveStreamProvider {
  if (!url) return "";
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") return "youtube";
    if (host === "facebook.com" || host === "fb.watch" || host === "m.facebook.com") return "facebook";
    return "custom";
  } catch {
    return "";
  }
}

// Construit l'URL d'intégration (iframe / lecteur) à partir de l'URL brute
// collée par l'administrateur (lien de la vidéo/diffusion, pas déjà un lien
// d'embed — l'admin colle simplement l'URL qu'il voit dans son navigateur).
export function buildEmbedUrl(rawUrl: string, provider: LiveStreamProvider): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  if (provider === "youtube") {
    // Formats acceptés : watch?v=ID, youtu.be/ID, /live/ID, /embed/ID déjà,
    // ou un lien de chaîne (@handle/live, /channel/ID/live) — dans ce dernier
    // cas on ne peut pas connaître l'ID de la vidéo à l'avance, donc on
    // utilise le mode "live_stream" par identifiant de chaîne si présent.
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}?autoplay=0` : null;
      }
      if (u.pathname.startsWith("/embed/")) {
        return url;
      }
      const vParam = u.searchParams.get("v");
      if (vParam) return `https://www.youtube.com/embed/${vParam}?autoplay=0`;
      const liveMatch = u.pathname.match(/\/live\/([^/?]+)/);
      if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=0`;
      const channelMatch = u.pathname.match(/\/channel\/([^/?]+)/);
      if (channelMatch) return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=0`;
      return null;
    } catch {
      return null;
    }
  }

  if (provider === "facebook") {
    // Le plugin vidéo Facebook attend l'URL originale encodée en paramètre.
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=false`;
  }

  // Flux générique (HLS .m3u8 ou autre lien vidéo direct) : lu tel quel par
  // une balise <video>, lecture native dans Safari/iOS. Les autres
  // navigateurs nécessitent un flux dans un format supporté nativement
  // (mp4) ou l'ajout d'une librairie HLS côté client si le besoin se
  // confirme.
  if (provider === "custom") return url;

  return null;
}
