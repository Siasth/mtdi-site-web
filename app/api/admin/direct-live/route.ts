import { NextRequest, NextResponse } from "next/server";
import { requireSession, setSetting, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { getLiveStreamSettings, detectProvider } from "@/lib/live-stream";

// ANO-089 / ANO-142 : réglage du direct en cours (voir lib/live-stream.ts).
export const dynamic = "force-dynamic";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const settings = await getLiveStreamSettings();
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "mediatheque.gerer")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const body = await req.json();
  const url = String(body.url ?? "").trim();
  const isLive = Boolean(body.isLive);

  if (isLive && !url) {
    return NextResponse.json({ error: "Une URL de diffusion est requise pour passer en direct." }, { status: 400 });
  }

  const settings = {
    isLive,
    url,
    provider: detectProvider(url),
    titleFr: String(body.titleFr ?? "").trim(),
    titleEn: String(body.titleEn ?? "").trim(),
  };

  await setSetting("direct_live", settings);
  await logAudit({ userId: session.id, action: "modifier", module: "direct", details: { action: "reglage_direct", isLive }, ip: getIp(req) });
  return NextResponse.json({ ok: true, settings });
}
