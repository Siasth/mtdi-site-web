import { NextRequest, NextResponse } from "next/server";
import { readData, writeData, nextId } from "../../../lib/data";
import { isHoneypotTriggered, checkRateLimit } from "@/lib/anti-spam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type Subscriber = { id: number; name: string; email: string; interests: string[]; createdAt: string };
type NewsletterData = { subscribers: Subscriber[] };

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (isHoneypotTriggered(body.website)) {
    return NextResponse.json({ success: true });
  }

  const { allowed } = await checkRateLimit("newsletter", req);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const name      = String(body.name      ?? "").trim();
  const email     = String(body.email     ?? "").trim();
  const interests = Array.isArray(body.interests) ? (body.interests as string[]) : [];

  if (!name || !email) {
    return NextResponse.json({ error: "Nom et email requis." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const data = await readData<NewsletterData>("newsletter");
  const alreadyExists = data.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) {
    return NextResponse.json({ success: true });
  }

  data.subscribers.push({
    id: nextId(data.subscribers),
    name,
    email,
    interests,
    createdAt: new Date().toISOString(),
  });

  await writeData("newsletter", data);
  return NextResponse.json({ success: true });
}
