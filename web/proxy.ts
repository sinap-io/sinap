// Next.js 16 usa proxy.ts como archivo de middleware.
// Usamos getToken de next-auth/jwt para leer el JWT directamente del cookie,
// evitando la maquinaria interna de handleAuth que puede retornar null por
// cookies de callbackUrl inválidas u otros errores de assertConfig.
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const isLoginPage = nextUrl.pathname.startsWith("/login");

  // Detectar si la request viene por HTTPS (para elegir nombre de cookie correcto)
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (nextUrl.protocol?.replace(":", "") ?? "https");
  const isSecure = proto.startsWith("https");

  // Intentar leer el JWT con el nombre de cookie correcto para el entorno,
  // con fallback al otro nombre por si hay inconsistencia.
  let token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET!,
    secureCookie: isSecure,
  });

  if (!token) {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET!,
      secureCookie: !isSecure,
    });
  }

  const isLoggedIn = !!token;

  if (isLoginPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
