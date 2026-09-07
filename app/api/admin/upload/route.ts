import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Upload DIRECT navigateur → Vercel Blob : le fichier ne transite jamais par
// cette fonction serverless (qui a une limite de 4,5 Mo sur Vercel), donc
// aucune limite de taille pratique ici. Cette route se contente de générer
// un jeton d'upload signé, après vérification de la session.
//
// Important : on utilise getSession() (pas requireSession()) car cette
// dernière appelle redirect("/login") — un mécanisme pensé pour les pages,
// qui casse silencieusement la réponse JSON attendue ici si la session a
// expiré, au lieu de renvoyer une erreur claire.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await getSession();
        if (!session) {
          throw new Error("Session expirée — reconnectez-vous puis réessayez.");
        }

        let kind: string | undefined;
        try {
          kind = clientPayload ? JSON.parse(clientPayload).kind : undefined;
        } catch {
          kind = undefined;
        }

        return {
          allowedContentTypes: [
            // Formats matriciels explicites (pas de wildcard "image/*") :
            // exclut volontairement image/svg+xml, qui peut contenir du
            // JavaScript exécutable si le fichier est ouvert directement
            // dans un navigateur — un vecteur XSS classique via upload.
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "video/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ],
          // ANO-128 : 5 Mo max pour les images. Pas de limite additionnelle
          // pour les vidéos/documents ici (ils passent par un contrôle de
          // taille distinct, plus permissif, propre à leur usage).
          maximumSizeInBytes: kind === "image" ? 5 * 1024 * 1024 : undefined,
          // true (et non false) : chaque upload obtient une URL unique,
          // même en réutilisant un nom de fichier déjà uploadé. Sans ça,
          // deux fichiers de même nom entrent en conflit (erreur bloquante),
          // et remplacer un fichier existant peut laisser l'ancien contenu
          // visible un moment via le cache CDN de l'URL réutilisée.
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Rien à faire ici pour l'instant (pas de post-traitement nécessaire).
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Erreur upload Blob:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue lors de l'upload" },
      { status: 400 }
    );
  }
}
