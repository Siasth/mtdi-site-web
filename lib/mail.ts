import nodemailer from "nodemailer";
import { getSetting } from "@/lib/auth";

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

// Le SMTP est lu EN BASE (table settings, clé "smtp_config") à chaque envoi,
// avec repli sur les variables d'environnement si rien n'est configuré côté
// back-office. Ça permet de modifier/activer le SMTP depuis l'interface
// d'administration du site, sans jamais avoir besoin de redéployer.
async function getTransporter() {
  const dbConfig = await getSetting<Partial<SmtpConfig>>("smtp_config");

  const config: SmtpConfig = {
    host: dbConfig?.host || process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(dbConfig?.port || process.env.SMTP_PORT || 587),
    user: dbConfig?.user || process.env.SMTP_USER || "",
    pass: dbConfig?.pass || process.env.SMTP_PASS || "",
    from: dbConfig?.from || process.env.SMTP_FROM || dbConfig?.user || process.env.SMTP_USER || "",
  };

  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: { user: config.user, pass: config.pass },
    }),
    from: config.from,
  };
}

export async function sendCode(to: string, code: string): Promise<void> {
  const { transporter, from } = await getTransporter();

  await transporter.sendMail({
    from,
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

// Test de connexion SMTP (utilisé par l'écran d'administration pour
// vérifier une configuration avant de l'enregistrer définitivement).
export async function testSmtpConnection(config: SmtpConfig): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: { user: config.user, pass: config.pass },
  });
  await transporter.verify();
}
