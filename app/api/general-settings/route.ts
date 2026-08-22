import { NextResponse } from "next/server";
import { getGeneralSettings } from "@/lib/general-settings";

// Route PUBLIQUE (pas d'authentification) : Navbar/Footer en ont besoin sur
// le site public pour afficher le nom/logo/réseaux sociaux à jour. Lecture
// seule — l'écriture se fait via /api/admin/general-settings (protégée).
export async function GET() {
  const settings = await getGeneralSettings();
  return NextResponse.json(settings);
}
