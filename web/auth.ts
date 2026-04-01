import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await pool.query(
          "SELECT id, email, nombre, password, rol FROM usuario WHERE email = $1 AND activo = true",
          [credentials.email]
        );

        const user = rows[0];
        if (!user || !user.password) return null;

        const valid = await compare(credentials.password as string, user.password);
        if (!valid) return null;

        return { id: String(user.id), email: user.email, name: user.nombre, rol: user.rol };
      },
    }),
  ],
  callbacks: {
    // authorized: usado por el proxy (proxy.ts) para proteger rutas
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith("/login");

      if (isLoginPage) {
        // Si ya está logueado, redirigir al inicio
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Cualquier otra ruta requiere login
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
  pages: {
    signIn: "/login",
  },
});
