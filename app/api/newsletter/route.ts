import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isHoneypotTriggered, checkRateLimit } from "@/lib/anti-spam";
import { isValidEmail } from "@/lib/validators";

// ANO-152 : anciennement stocké dans data/newsletter.json via fs.writeFile.
// Ce fichier n'est pas fiable sur Vercel (système de fichiers en lecture
// seule en production, /tmp non partagé entre invocations serverless) et
// les abonnés n'étaient de toute façon consultables nulle part dans le
// back-office. Migré vers la table Postgres newsletter_subscribers.

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

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const interests = Array.isArray(body.interests) ? (body.interests as string[]) : [];

  if (!name || !email) {
    return NextResponse.json({ error: "Nom et email requis." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  await sql`
    INSERT INTO newsletter_subscribers (name, email, interests)
    VALUES (${name}, ${email.toLowerCase()}, ${JSON.stringify(interests)})
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, interests = EXCLUDED.interests, active = TRUE
  `;

  return NextResponse.json({ success: true });
}
