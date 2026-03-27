import type { NextAuthConfig } from "next-auth";

// Configuración edge-compatible (sin dependencias Node.js como pg)
// Usada exclusivamente en el middleware
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith("/login");

      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.rol = (user as { rol?: string }).rol;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as { rol?: string }).rol = token.rol as string;
      return session;
    },
  },
  providers: [],
};
