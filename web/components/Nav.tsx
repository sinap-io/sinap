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
  Lightbulb,
} from "lucide-react";

const links = [
  { href: "/",            label: "Inicio",         icon: Home },
  { href: "/actors",      label: "Actores",        icon: Users },
  { href: "/services",    label: "Servicios",      icon: Wrench },
  { href: "/needs",       label: "Necesidades",    icon: AlertCircle },
  { href: "/gaps",        label: "Gaps",           icon: TrendingUp },
  { href: "/instruments", label: "Financiamiento", icon: Banknote },
  { href: "/search",      label: "Buscar IA",      icon: Search },
  { href: "/iniciativas", label: "Iniciativas",    icon: Lightbulb },
];

const S = {
  bg:     "#dbeafe",
  border: "#bfdbfe",
  muted:  "#6b8ab5",
  hover:  "rgba(232,98,42,0.10)",
  accent: "#e8622a",
  text:   "#1e293b",
};

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-40"
      style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: S.accent }}>
          <Dna size={15} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider" style={{ color: S.text }}>SINAP</div>
          <div className="text-[10px] leading-tight" style={{ color: S.muted }}>Biotech Córdoba</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2" style={{ color: S.muted }}>
          Plataforma
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={active ? {
                background: `${S.accent}18`,
                color: S.text,
                fontWeight: 500,
                borderLeft: `2px solid ${S.accent}`,
                paddingLeft: "10px",
              } : {
                color: S.muted,
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = S.hover;
                  (e.currentTarget as HTMLElement).style.color = S.text;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = S.muted;
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: `1px solid ${S.border}` }}>
        <p className="text-[10px] leading-relaxed" style={{ color: S.muted }}>
          Clúster de Biotecnología<br />de Córdoba, Argentina
        </p>
      </div>
    </aside>
  );
}
