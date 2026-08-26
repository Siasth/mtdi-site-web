"use client";

import { upload } from "@vercel/blob/client";

// Upload direct navigateur → Vercel Blob (contourne la limite de 4,5 Mo des
// fonctions serverless Vercel). À utiliser partout dans le back-office où un
// fichier est envoyé (images, vidéos, PDF...).
//
// previousUrl (optionnel) : URL du fichier remplacé par ce nouvel upload —
// si fournie, son nettoyage est déclenché en tâche de fond après le succès
// de l'upload, pour éviter d'accumuler des fichiers orphelins dans le
// stockage. Ce nettoyage est best-effort : un échec ne fait jamais échouer
// l'upload principal ni la sauvegarde du formulaire.
export async function uploadFile(file: File, previousUrl?: string): Promise<{ url: string; name: string }> {
  try {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
    });
    if (previousUrl && previousUrl !== blob.url) {
      cleanupOldFile(previousUrl);
    }
    return { url: blob.url, name: file.name };
  } catch (err) {
    throw new Error(friendlyUploadError(err));
  }
}

export function cleanupOldFile(url: string) {
  fetch("/api/admin/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {
    // Silencieux : un fichier orphelin de plus n'est pas critique.
  });
}

// Traduit les messages techniques de Vercel Blob / réseau en phrases
// compréhensibles pour quelqu'un qui ne code pas.
function friendlyUploadError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("already exists") || lower.includes("conflict")) {
    return "Un fichier de ce nom existe déjà. Réessayez — l'envoi utilise normalement un nom unique à chaque fois.";
  }
  if (lower.includes("too large") || lower.includes("size")) {
    return "Le fichier est trop volumineux.";
  }
  if (lower.includes("content type") || lower.includes("not allowed") || lower.includes("allowedcontenttype")) {
    return "Ce type de fichier n'est pas autorisé.";
  }
  if (lower.includes("session") || lower.includes("unauthorized") || lower.includes("401")) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (lower.includes("network") || lower.includes("fetch failed") || lower.includes("failed to fetch")) {
    return "Problème de connexion réseau. Vérifiez votre connexion et réessayez.";
  }
  return "L'envoi du fichier a échoué. Réessayez, et si le problème persiste, prévenez l'équipe technique.";
}
