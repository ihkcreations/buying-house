import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // We need to check for the session cookie
  // Better Auth uses "better-auth.session_token"
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  // 1. If trying to access App without login -> Redirect to Login
  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. If logged in and trying to access Login -> Redirect to Dashboard
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except api, static files, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};