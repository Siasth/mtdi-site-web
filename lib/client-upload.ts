"use client";

import { upload } from "@vercel/blob/client";

// Upload direct navigateur → Vercel Blob (contourne la limite de 4,5 Mo des
// fonctions serverless Vercel). À utiliser partout dans le back-office où un
// fichier est envoyé (images, vidéos, PDF...).
export async function uploadFile(file: File): Promise<{ url: string; name: string }> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
  });
  return { url: blob.url, name: file.name };
}
