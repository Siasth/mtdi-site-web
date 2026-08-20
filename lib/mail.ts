import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendCode(to: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `[MTDI] Code de vérification : ${code}`,
    text: `Votre code de connexion au back-office MTDI est : ${code}\n\nCe code expire dans 5 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
        <div style="background: #162233; padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
            Back-office MTDI
          </h2>
        </div>
        <div style="padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
          <p style="color: #666; font-size: 14px; margin-top: 0;">Votre code de connexion :</p>
          <div style="background: #f5f5f3; padding: 20px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #006828;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px;">Ce code expire dans 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
        </div>
        <p style="color: #ccc; font-size: 10px; text-align: center; margin-top: 16px;">
          Ministère de la Transformation Digitale — République du Bénin
        </p>
      </div>
    `,
  });
}
