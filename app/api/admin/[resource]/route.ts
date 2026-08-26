import { NextRequest, NextResponse } from "next/server";
import { readData, writeData, nextId } from "@/lib/data";
import { requireSession } from "@/lib/auth";
import { hasPerm, type PermissionCode } from "@/lib/permissions";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ resource: string }> };

// Tous les modules de contenu ont migré vers des routes dédiées + la base de
// données. Cette route générique JSON legacy n'a plus d'utilité mais reste en
// place (inoffensive, VALID vide = tout rejeté) au cas où.
const VALID: string[] = [];

function requiredPermission(resource: string, action: "voir" | "creer" | "modifier" | "supprimer"): PermissionCode {
  void resource;
  return "contenu.modifier";
}

async function checkPermission(resource: string, action: "voir" | "creer" | "modifier" | "supprimer") {
  const session = await requireSession();
  const code = requiredPermission(resource, action);
  if (!hasPerm(session, code)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }
  const denied = await checkPermission(resource, "voir");
  if (denied) return denied;

  const data = await readData(resource);
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }
  const denied = await checkPermission(resource, "modifier");
  if (denied) return denied;

  const body = await req.json();
  await writeData(resource, body);
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { resource } = await params;
  if (!VALID.includes(resource)) {
    return NextResponse.json({ error: "Ressource invalide" }, { status: 404 });
  }
  const denied = await checkPermission(resource, "creer");
  if (denied) return denied;

  const data = await readData<Record<string, unknown>[] | Record<string, unknown>>(resource);
  const body = await req.json();

  if (Array.isArray(data)) {
    const newItem = { ...body, id: nextId(data as { id: number }[]) };
    data.push(newItem);
    await writeData(resource, data);
    return NextResponse.json(newItem, { status: 201 });
  }

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
  const denied = await checkPermission(resource, "supprimer");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const target = searchParams.get("target");

  const data = await readData<Record<string, unknown>[] | Record<string, unknown>>(resource);

  if (Array.isArray(data)) {
    const filtered = data.filter((item: Record<string, unknown>) => item.id !== id);
    await writeData(resource, filtered);
    return NextResponse.json({ ok: true });
  }

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
