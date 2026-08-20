import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isBackOffice = pathname.startsWith("/back-office-mtdi");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isBackOffice && !isAdminApi) return NextResponse.next();

  const token = req.cookies.get("mtdi-auth")?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier le token via l'API interne (évite d'importer fs dans le middleware edge)
  // Le token est un base64 de "mtdi-session:{sessionSecret}"
  // On vérifie juste que le token est bien formé (commence par le préfixe attendu)
  try {
    const decoded = atob(token);
    if (!decoded.startsWith("mtdi-session:")) {
      throw new Error("Invalid token");
    }
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/back-office-mtdi/:path*", "/api/admin/:path*"],
};
