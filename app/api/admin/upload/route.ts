import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

// Upload DIRECT navigateur → Vercel Blob : le fichier ne transite jamais par
// cette fonction serverless (qui a une limite de 4,5 Mo sur Vercel), donc
// aucune limite de taille pratique ici. Cette route se contente de générer
// un jeton d'upload signé, après vérification de la session.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        await requireSession(); // lève une erreur si non connecté

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
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
