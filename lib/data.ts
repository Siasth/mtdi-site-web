import { readFile, writeFile } from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, `${filename}.json`);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, `${filename}.json`);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function nextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}
