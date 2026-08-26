import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSession } from "@/lib/auth";

// Nettoyage best-effort : supprime un ancien fichier Vercel Blob remplacé
// par un nouvel upload. N'est appelée qu'après la sauvegarde réussie du
// formulaire — un échec ici ne doit jamais faire échouer l'enregistrement
// du contenu lui-même (juste un fichier orphelin de plus, pas grave).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { url } = await req.json();
  if (!url || typeof url !== "string" || !url.includes(".public.blob.vercel-storage.com")) {
    // Ignore silencieusement les URLs qui ne sont pas des fichiers Blob
    // (ex. liens externes saisis à la main dans un champ "lien").
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Ne bloque jamais l'appelant : le fichier reste juste orphelin.
    console.error("Erreur suppression Blob (non bloquant):", err);
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
