import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { hasPerm } from "@/lib/permissions";

// Jamais mis en cache : ces routes back-office doivent toujours refléter
// l'état réel de la base (sans ça, "Enregistrer" peut sembler ne rien
// faire tant que le cache n'expire pas).
export const dynamic = "force-dynamic";

// Journal d'audit paginé (les plus récents d'abord)
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!hasPerm(session, "logs.voir")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const logs = await sql`
    SELECT al.id, al.action, al.module, al.resource_id, al.details, al.ip_address, al.created_at,
           u.email AS user_email, u.name AS user_name
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC
    LIMIT ${perPage} OFFSET ${offset}
  `;

  const countResult = await sql`SELECT COUNT(*) AS total FROM audit_logs`;

  return NextResponse.json({
    logs: logs.rows,
    total: Number(countResult.rows[0].total),
    page,
    perPage,
  });
}
