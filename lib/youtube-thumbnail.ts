// ANO-092 : les éléments de la vidéothèque n'affichaient qu'un aplat de
// couleur générique, sans aucun moyen d'identifier visuellement le contenu.
// La quasi-totalité des vidéos du site pointent vers YouTube, qui expose
// publiquement une image d'aperçu pour chaque vidéo, sans authentification
// ni appel d'API — on la déduit donc directement de l'URL, sans avoir besoin
// d'ajouter un champ d'upload dédié dans le back-office.

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        return u.searchParams.get("v");
      }
      if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] || null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// ANO-003 : permet de lire la vidéo directement dans la lightbox de la
// galerie (au lieu de rediriger vers un onglet externe ou vers la
// vidéothèque, qui est une table de contenu totalement indépendante des
// éléments vidéo de la galerie — donc structurellement incapable de "tomber"
// sur le bon élément).
export function getYoutubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
