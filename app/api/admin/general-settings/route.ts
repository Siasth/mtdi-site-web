import { NextRequest, NextResponse } from "next/server";
import { requireSession, setSetting, logAudit } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";
import { getGeneralSettings } from "@/lib/general-settings";

function getIp(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function GET() {
  const session = await requireSession();
  if (!hasPerm(session, "parametres.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const settings = await getGeneralSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "parametres.modifier")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  const body = await req.json();
  const current = await getGeneralSettings();
  await setSetting("site_general", { ...current, ...body });
  await logAudit({ userId: session.id, action: "modifier", module: "parametres", ip: getIp(req) });
  return NextResponse.json({ ok: true });
}
