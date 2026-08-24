import { NextResponse } from "next/server";
import { getLiensUtiles } from "@/lib/liens-utiles";

// Route PUBLIQUE (pas d'authentification) : Navbar/Footer en ont besoin sur
// le site public pour afficher les liens utiles à jour. Lecture seule —
// l'écriture se fait via /api/admin/liens-utiles (protégée).
export async function GET() {
  const liens = await getLiensUtiles();
  return NextResponse.json(liens);
}
