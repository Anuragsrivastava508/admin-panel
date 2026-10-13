import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API requests pass through to the Node.js Express backend proxy
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("budhram_admin_session")?.value;
  const isAuthPage = pathname.startsWith("/login");

  // Redirect to dashboard if logged-in user visits /login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect to /login if unauthenticated user tries to visit protected admin pages
  if (!token && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
