"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",            label: "Inicio" },
  { href: "/actors",      label: "Actores" },
  { href: "/services",    label: "Servicios" },
  { href: "/needs",       label: "Necesidades" },
  { href: "/gaps",        label: "Gaps" },
  { href: "/instruments", label: "Financiamiento" },
  { href: "/search",      label: "Buscar IA" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 h-14">
          <span className="text-sm font-bold tracking-wider text-[var(--accent)] shrink-0">
            SINAP
          </span>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[var(--accent)] text-white font-medium"
                      : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
