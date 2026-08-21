import { requireSession } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";

// Server Component : valide la session EN BASE (révocation, expiration,
// inactivité) avant de rendre quoi que ce soit. Redirige vers /login si
// invalide — voir requireSession() dans lib/auth.ts.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <AdminLayoutClient userName={session.name} roleName={session.roleName} permissions={session.permissions}>
      {children}
    </AdminLayoutClient>
  );
}
