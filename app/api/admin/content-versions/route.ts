import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { hasPerm, type PermissionCode } from "@/lib/permissions";
import { getVersions } from "@/lib/content-versions";

export const dynamic = "force-dynamic";

// Chaque table couverte par l'historique est rattachée à la permission
// "voir" de son propre groupe métier — pas de permission séparée pour
// l'historique lui-même : qui peut voir le contenu peut voir son historique.
const TABLE_PERMISSION: Record<string, PermissionCode> = {
  actualites: "actualites.voir",
  static_pages: "ressources.voir",
  settings: "ministere.voir", // seule utilisation actuelle : ministre_bio
};

export async function GET(req: NextRequest) {
  const session = await requireSession();
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") || "";
  const recordId = searchParams.get("recordId") || "";

  const requiredPerm = TABLE_PERMISSION[table];
  if (!requiredPerm || !hasPerm(session, requiredPerm)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  if (!recordId) {
    return NextResponse.json({ error: "recordId requis" }, { status: 400 });
  }

  const versions = await getVersions(table, recordId);
  return NextResponse.json(versions, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
