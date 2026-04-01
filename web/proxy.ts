// Next.js 16 usa proxy.ts como el archivo de middleware (renombrado de middleware.ts)
// Importamos auth desde auth.ts directamente para usar UNA SOLA instancia de NextAuth.
// Esto evita el problema de dos instancias con potencialmente diferentes claves de cifrado.
// Next.js 16 corre el proxy en Node.js (no Edge), por lo que podemos importar módulos Node.
export { auth as proxy } from "./auth";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
