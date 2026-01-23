import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const protectedRoutes = [
  "/app",
  "/employer",
];

// Routes that are always public
const publicRoutes = [
  "/",
  "/pricing",
  "/employer-landing",
  "/privacy",
  "/terms",
  "/offline",
  "/auth",
  "/trades",
];

// Route where unverified users can go to verify
const verificationRoute = "/auth/verify-email";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an API route (handled separately)
  const isApiRoute = pathname.startsWith("/api/");

  // Check if it's a static asset
  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js";

  // Allow public routes, API routes, and static assets
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return supabaseResponse;
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes to landing
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user's email is verified (for protected routes)
  if (isProtectedRoute && user && !user.email_confirmed_at) {
    // Allow if already on verification page
    if (pathname === verificationRoute) {
      return supabaseResponse;
    }
    // Redirect to email verification page
    const verifyUrl = new URL(verificationRoute, request.url);
    verifyUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(verifyUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
