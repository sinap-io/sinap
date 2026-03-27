import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { Open_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400','500','600','700','800'] });

export const metadata: Metadata = {
  title: "SINAP — Plataforma Biotech Córdoba",
  description: "Inteligencia territorial para el ecosistema biotech de Córdoba, Argentina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", openSans.variable)}>
      <body className="min-h-screen bg-[var(--bg)]">
        <Nav />
        <div className="ml-60 min-h-screen flex flex-col">
          <main className="flex-1 px-8 py-8 max-w-5xl w-full">
            {children}
          </main>
          <footer className="px-8 py-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            SINAP · sinap.io
          </footer>
        </div>
      </body>
    </html>
  );
}
