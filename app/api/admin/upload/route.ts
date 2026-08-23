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
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) {
          throw new Error("Session expirée — reconnectez-vous puis réessayez.");
        }

        return {
          allowedContentTypes: [
            "image/*",
            "video/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ],
          addRandomSuffix: false,
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
