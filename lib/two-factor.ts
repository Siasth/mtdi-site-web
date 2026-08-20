import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", ".2fa-pending.json");
const CODE_TTL = 5 * 60 * 1000; // 5 minutes

type PendingCode = {
  code: string;
  expiresAt: number;
};

async function readCodes(): Promise<Record<string, PendingCode>> {
  try {
    const raw = await readFile(CODES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCodes(codes: Record<string, PendingCode>): Promise<void> {
  await mkdir(path.dirname(CODES_FILE), { recursive: true });
  await writeFile(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function storeCode(email: string, code: string): Promise<void> {
  const codes = await readCodes();
  codes[email] = { code, expiresAt: Date.now() + CODE_TTL };
  await writeCodes(codes);
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const codes = await readCodes();
  const pending = codes[email];
  if (!pending) return false;
  if (Date.now() > pending.expiresAt) {
    delete codes[email];
    await writeCodes(codes);
    return false;
  }
  if (pending.code !== code) return false;
  delete codes[email];
  await writeCodes(codes);
  return true;
}
