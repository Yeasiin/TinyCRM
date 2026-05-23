import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/register"];
  const authRedirectPaths = ["/login", "/register"];

  const isPublicPath = publicPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path)));
  const isAuthRedirectPath = authRedirectPaths.some((path) => pathname === path || pathname.startsWith(path));

  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") || request.cookies.get("better-auth.session_token") ||
    request.cookies.get("session_token");

  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isAuthRedirectPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
