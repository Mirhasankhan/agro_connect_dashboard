import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "./types";

function readRole(token: string): UserRole | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(
      normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="),
    );
    const parsed = JSON.parse(decoded);
    return (parsed.role as UserRole) || null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value || req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;
  const role = token ? readRole(token) : null;

  const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");

  // 1. Unauthenticated or non-admin users
  if (!token || role !== "ADMIN") {
    if (isLoginPage) {
      return NextResponse.next();
    }
    // Redirect unauthenticated / non-admin users to login
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated Admin visiting /login -> redirect to dashboard
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
