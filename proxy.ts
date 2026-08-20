import { NextRequest, NextResponse } from "next/server";

// ── Locale detection ──────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = "fr";

/**
 * Paths that bypass locale logic entirely.
 */
function isBypassPath(pathname: string): boolean {
  return (
    pathname.startsWith("/back-office-mtdi") ||
    pathname.startsWith("/api/") ||
    pathname === "/login" ||
    pathname.startsWith("/_next/") ||
    pathname === "/icon.png" ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  );
}

function detectLocale(pathname: string): { locale: Locale; isEnglish: boolean } {
  if (pathname.startsWith("/en/") || pathname === "/en") {
    return { locale: "en", isEnglish: true };
  }
  return { locale: DEFAULT_LOCALE, isEnglish: false };
}

// ── Auth logic ────────────────────────────────────────────────────────────────

function handleAuth(req: NextRequest, pathname: string): NextResponse | null {
  const isBackOffice = pathname.startsWith("/back-office-mtdi");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isBackOffice && !isAdminApi) return null;

  const token = req.cookies.get("mtdi-auth")?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

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

  return null;
}

// ── Main proxy ────────────────────────────────────────────────────────────────

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Back-office / API: handle auth then pass through (no locale logic)
  if (isBypassPath(pathname)) {
    const authResponse = handleAuth(req, pathname);
    if (authResponse) return authResponse;
    return NextResponse.next();
  }

  // 2. Detect locale
  const { locale, isEnglish } = detectLocale(pathname);

  if (isEnglish) {
    // English URLs already carry /en/ prefix — route normally, forward locale header
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-locale", "en");
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return response;
  }

  // 3. French (default) — rewrite internally to /fr{pathname} so [locale]=fr
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = `/fr${pathname === "/" ? "" : pathname}`;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", "fr");
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
