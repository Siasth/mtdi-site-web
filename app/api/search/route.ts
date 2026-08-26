import { NextRequest, NextResponse } from "next/server";
import { searchSite } from "@/lib/search";

// Route PUBLIQUE (pas d'authentification) : recherche accessible à tout
// visiteur du site depuis /recherche.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const locale = searchParams.get("locale") === "en" ? "en" : "fr";

  if (!q.trim()) return NextResponse.json([]);

  try {
    const results = await searchSite(q, locale);
    return NextResponse.json(results, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
