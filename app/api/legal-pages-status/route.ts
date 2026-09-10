import { NextResponse } from "next/server";
import { getPublishedLegalSlugs } from "@/lib/static-pages";

// Route PUBLIQUE (pas d'authentification) : Footer.tsx en a besoin sur le
// site public pour ne proposer que les pages légales (mentions légales,
// confidentialité, accessibilité) effectivement publiées (ANO-146).
// Lecture seule — la publication se gère via /api/admin/static-pages
// (protégée).
export async function GET() {
  const slugs = await getPublishedLegalSlugs();
  return NextResponse.json(slugs);
}
