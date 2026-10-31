import { NextRequest, NextResponse } from "next/server";

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    // Decode base64 payload
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);
    if (!payload || !payload.userId) return false;
    // Verify 24h expiration timestamp
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static resources and API calls
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // file extensions like .png, .ico, .css
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const authenticated = isValidToken(token);

  // If user is already authenticated and visits /login, redirect to /dashboard
  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If unauthenticated, redirect ANY protected page to /login immediately
  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If authenticated and visiting root /, redirect to /dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
