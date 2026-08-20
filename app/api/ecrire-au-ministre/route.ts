import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const name    = (formData.get("name")    as string | null)?.trim() ?? "";
  const email   = (formData.get("email")   as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() ?? "";
  const message = (formData.get("message") as string | null)?.trim() ?? "";
  const file    = formData.get("attachment") as File | null;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (file && file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "La pièce jointe ne doit pas dépasser 5 Mo." }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    type Attachment = { filename: string; content: Buffer };
    const attachments: Attachment[] = [];
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name, content: buffer });
    }

    await transporter.sendMail({
      from:        process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to:          "mtdi.contact@gouv.bj",
      replyTo:     email,
      subject:     `[Écrire au Ministre] ${subject}`,
      text:        `De : ${name} <${email}>\n\n${message}`,
      html:        `<p><strong>De :</strong> ${name} &lt;${email}&gt;</p><hr/><p>${message.replace(/\n/g, "<br>")}</p>`,
      attachments,
    });
  } catch (err) {
    console.error("[ecrire-au-ministre] Envoi email échoué :", err);
  }

  return NextResponse.json({ success: true });
}
