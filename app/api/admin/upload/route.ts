import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireSession } from "@/lib/auth";

// Stocke les fichiers sur Vercel Blob (pas sur le disque local — le
// système de fichiers de Vercel est en lecture seule en production, tout
// fichier écrit via fs.writeFile disparaît/échoue silencieusement).
export async function POST(req: NextRequest) {
  await requireSession(); // n'importe quel utilisateur connecté peut uploader

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const base = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .toLowerCase();
  const filename = `${base}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url, name: file.name });
}
