import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate the app behind auth. Login + auth-callback + health are public.
 *
 * The middleware runs in Next.js's edge runtime, which only sees NEXT_PUBLIC_*
 * env vars. Inside Docker, the server-side Supabase URL is on an internal
 * hostname (http://kong:8000) the edge runtime can't reach — so we do NOT
 * validate the session against the Supabase API here. Instead:
 *
 *  - If a Supabase session cookie is present, let the request through.
 *  - The (app) layout re-validates the session with a full server-side
 *    Supabase client (Node runtime, full env access) and redirects to /login
 *    if the cookie is stale.
 *
 * This avoids a double network hop AND works on Docker without a proxy trick.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/api/health");

  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  if (!hasSessionCookie && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSessionCookie && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.searchParams.delete("next");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
