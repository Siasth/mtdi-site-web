import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isHoneypotTriggered, checkRateLimit } from "@/lib/anti-spam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  // Pot de miel : un champ invisible pour un humain, souvent rempli par un
  // bot. On répond succès sans rien envoyer, pour ne pas l'éduquer.
  if (isHoneypotTriggered(body.website)) {
    return NextResponse.json({ success: true });
  }

  const { allowed } = await checkRateLimit("contact", req);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const name    = body.name?.trim()    ?? "";
  const email   = body.email?.trim()   ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to:      "mtdi.contact@gouv.bj",
      replyTo: email,
      subject: `[Contact MTDI] ${subject}`,
      text:    `De : ${name} <${email}>\n\n${message}`,
      html:    `<p><strong>De :</strong> ${name} &lt;${email}&gt;</p><hr/><p>${message.replace(/\n/g, "<br>")}</p>`,
    });
  } catch (err) {
    console.error("[contact] Envoi email échoué :", err);
  }

  return NextResponse.json({ success: true });
}
