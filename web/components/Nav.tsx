"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Wrench,
  AlertCircle,
  TrendingUp,
  Banknote,
  Search,
  Dna,
} from "lucide-react";

const links = [
  { href: "/",            label: "Inicio",         icon: Home },
  { href: "/actors",      label: "Actores",        icon: Users },
  { href: "/services",    label: "Servicios",      icon: Wrench },
  { href: "/needs",       label: "Necesidades",    icon: AlertCircle },
  { href: "/gaps",        label: "Gaps",           icon: TrendingUp },
  { href: "/instruments", label: "Financiamiento", icon: Banknote },
  { href: "/search",      label: "Buscar IA",      icon: Search },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)] z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <Dna size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wider">SINAP</div>
          <div className="text-[10px] text-[var(--text-muted)] leading-tight">Biotech Córdoba</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] px-3 pb-2">
          Plataforma
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-[var(--accent)]/15 text-white font-medium border-l-2 border-[var(--accent)] pl-[10px]"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[var(--border)]">
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Clúster de Biotecnología<br />de Córdoba, Argentina
        </p>
      </div>
    </aside>
  );
}
