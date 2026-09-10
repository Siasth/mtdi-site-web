// ANO-092 : les éléments de la vidéothèque n'affichaient qu'un aplat de
// couleur générique, sans aucun moyen d'identifier visuellement le contenu.
// La quasi-totalité des vidéos du site pointent vers YouTube, qui expose
// publiquement une image d'aperçu pour chaque vidéo, sans authentification
// ni appel d'API — on la déduit donc directement de l'URL, sans avoir besoin
// d'ajouter un champ d'upload dédié dans le back-office.

export function getYoutubeThumbnail(url: string): string | null {
  if (!url) return null;
  let id: string | null = null;

  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2];
      }
    }
  } catch {
    return null;
  }

  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
