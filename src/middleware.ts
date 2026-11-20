import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyEdgeToken } from "./lib/server/edge-auth";

export const SESSION_COOKIE_NAME = "apv_staff_session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isApi = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isTherapistRoute = pathname.startsWith("/therapist") || pathname.startsWith("/api/therapist");

  // If no token or invalid signature
  const session = token ? await verifyEdgeToken(token) : null;

  if (!session) {
    if (isApi) {
      return NextResponse.json(
        { error: "Unauthorized: Staff authentication required" },
        { status: 401 }
      );
    }
    const redirectUrl = new URL("/staff/login", request.url);
    redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Role authorization
  if (session.role === "therapist" && isAdminRoute) {
    if (isApi) {
      return NextResponse.json(
        { error: "Forbidden: Admin privilege required" },
        { status: 403 }
      );
    }
    // Redirect therapist trying to access admin screens to their own portal
    return NextResponse.redirect(new URL("/therapist", request.url));
  }

  // Authorized: proceed with request and add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Pass user identity headers to downstream server actions/components
  response.headers.set("x-staff-user-id", session.userId);
  response.headers.set("x-staff-role", session.role);
  response.headers.set("x-staff-email", session.email);

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/therapist/:path*",
    "/api/admin/:path*",
    "/api/therapist/:path*",
  ],
};
