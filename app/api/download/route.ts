import { NextRequest, NextResponse } from "next/server";

// ANO-084 : les pièces jointes sont hébergées sur Vercel Blob, un domaine
// différent de celui du site. L'attribut HTML `download` est ignoré par les
// navigateurs pour les ressources cross-origin, donc le fichier s'ouvrait en
// aperçu (image, PDF) au lieu de se télécharger. Cette route sert de proxy :
// elle récupère le fichier côté serveur et le renvoie avec un en-tête
// Content-Disposition: attachment, qui force le téléchargement quelle que
// soit son origine.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") || "fichier";

  if (!url) {
    return NextResponse.json({ error: "Paramètre 'url' manquant" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  // Sécurité : n'autoriser que notre propre stockage Vercel Blob, pour que
  // cette route ne serve pas de proxy ouvert vers une URL arbitraire.
  if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Domaine non autorisé" }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}`);

  return new NextResponse(upstream.body, { headers });
}
