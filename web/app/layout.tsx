import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "SINAP — Plataforma Biotech Córdoba",
  description: "Inteligencia territorial para el ecosistema biotech de Córdoba, Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
          SINAP · Impulsado por el Clúster de Biotecnología de Córdoba
        </footer>
      </body>
    </html>
  );
}
