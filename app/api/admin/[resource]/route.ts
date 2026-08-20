import { NextRequest, NextResponse } from "next/server";
import { readData, writeData, nextId } from "@/lib/data";

type Params = { params: Promise<{ resource: string }> };

const VALID = ["hero", "actualites", "galerie", "chantiers", "stats", "direct", "ministre"];

export async function GET(_req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }
  const data = await readData(resource);
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }
  const body = await req.json();
  await writeData(resource, body);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }

  // For resources that are arrays, add item
  const data = await readData<Record<string, unknown>[] | Record<string, unknown>>(resource);
  const body = await req.json();

  if (Array.isArray(data)) {
    const newItem = { ...body, id: nextId(data as { id: number }[]) };
    data.push(newItem);
    await writeData(resource, data);
    return NextResponse.json(newItem, { status: 201 });
  }

  // For objects (direct, ministre), handle nested arrays
  if (body._action === "add" && body._target && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const arr = obj[body._target];
    if (Array.isArray(arr)) {
      const { _action, _target, ...itemData } = body;
      void _action;
      void _target;
      const newItem = { ...itemData, id: nextId(arr as { id: number }[]) };
      arr.push(newItem);
      await writeData(resource, obj);
      return NextResponse.json(newItem, { status: 201 });
    }
  }

  await writeData(resource, body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const target = searchParams.get("target");

  const data = await readData<Record<string, unknown>[] | Record<string, unknown>>(resource);

  if (Array.isArray(data)) {
    const filtered = data.filter((item: Record<string, unknown>) => item.id !== id);
    await writeData(resource, filtered);
    return NextResponse.json({ ok: true });
  }

  // For objects with nested arrays (direct)
  if (target && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const arr = obj[target];
    if (Array.isArray(arr)) {
      obj[target] = arr.filter((item: Record<string, unknown>) => item.id !== id);
      await writeData(resource, obj);
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ error: "Suppression impossible" }, { status: 400 });
}
