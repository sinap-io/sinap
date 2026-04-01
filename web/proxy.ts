import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// En Next.js 16, el archivo de proxy (ex-middleware) se llama proxy.ts
// La función debe exportarse con nombre "proxy" o como default export
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
