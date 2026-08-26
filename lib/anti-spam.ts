import { createHash } from "crypto";
import { sql } from "@/lib/db";

// Anti-spam minimal, sans dépendance externe (pas de CAPTCHA tiers à
// configurer) : pot de miel + limitation de fréquence par IP hachée.

// Champ invisible : un utilisateur humain ne le remplit jamais (masqué en
// CSS côté formulaire), un bot qui remplit tous les champs automatiquement
// le fait souvent. On répond succès pour ne pas éduquer le bot.
export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// Autorise au maximum `maxPerWindow` soumissions par IP et par formulaire,
// sur une fenêtre glissante de `windowMinutes` minutes. Enregistre la
// tentative dans tous les cas (même refusée), pour que les rafales
// répétées restent bloquées plus longtemps.
export async function checkRateLimit(
  formType: string,
  req: Request,
  maxPerWindow = 5,
  windowMinutes = 60
): Promise<{ allowed: boolean }> {
  const ipHash = hashIp(getClientIp(req));

  const result = await sql`
    SELECT COUNT(*) AS count FROM form_submissions
    WHERE form_type = ${formType} AND ip_hash = ${ipHash}
      AND created_at > now() - (${windowMinutes} || ' minutes')::interval
  `;
  const count = Number(result.rows[0]?.count ?? 0);

  await sql`INSERT INTO form_submissions (form_type, ip_hash) VALUES (${formType}, ${ipHash})`;

  return { allowed: count < maxPerWindow };
}
