import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check for the specific session cookie used by Better Auth
  const sessionCookie = request.cookies.get("better-auth.session_token");
  
  // Define public paths that don't require authentication
  const isAuthPage = path === "/login" || path === "/signup";
  
  // 1. ROOT PATH HANDLING (/)
  // If user visits domain.com/, decide where to send them
  if (path === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. PROTECTED ROUTES (Everything else)
  // If trying to access app without a cookie -> Kick to Login
  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. AUTH PAGES (Login/Signup)
  // If already logged in -> Kick to Dashboard (Don't let them see login again)
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all routes EXCEPT api, static files, images, favicon
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};