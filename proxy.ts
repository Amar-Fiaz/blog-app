import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/dashboard/:path*",
  "/create-post",
  "/edit-post/:path*",
  "/profile",
  "/settings",
];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = [
  "/login",
  "/register",
];

// Admin-only routes
const adminRoutes = [
  "/admin",
  "/admin/:path*",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isProtectedRoute = protectedRoutes.some((route) => {
    const routePattern = new RegExp(`^${route.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+")}$`);
    return routePattern.test(nextUrl.pathname);
  });

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const isAdminRoute = adminRoutes.some((route) => {
    const routePattern = new RegExp(`^${route.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+")}$`);
    return routePattern.test(nextUrl.pathname);
  });

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  // Redirect to dashboard if already logged in and trying to access auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect to home if trying to access admin route without admin role
  if (isAdminRoute && (!isLoggedIn || userRole !== "ADMIN")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// Matcher configuration - specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
