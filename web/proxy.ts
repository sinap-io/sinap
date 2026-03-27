import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  // Auth.js v5 usa "authjs.session-token" (dev) o "__Secure-authjs.session-token" (prod/HTTPS)
  const cookieName = request.url.startsWith("https")
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, cookieName });
  const isLoggedIn = !!token;

  if (isLoginPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
