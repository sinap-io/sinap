"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Users,
  Wrench,
  AlertCircle,
  TrendingUp,
  Banknote,
  Search,
  Lightbulb,
  LogOut,
  BarChart2,
  Radar,
} from "lucide-react";

function SinapLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Líneas de conexión */}
      <line x1="14" y1="6"  x2="6"  y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="14" y1="6"  x2="22" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="6"  y1="22" x2="22" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      {/* Nodos */}
      <circle cx="14" cy="6"  r="3" fill="white"/>
      <circle cx="6"  cy="22" r="3" fill="white"/>
      <circle cx="22" cy="22" r="3" fill="white"/>
    </svg>
  );
}

const links = [
  { href: "/",            label: "Inicio",         icon: Home,       roles: null },
  { href: "/actors",      label: "Actores",        icon: Users,      roles: null },
  { href: "/services",    label: "Servicios",      icon: Wrench,     roles: null },
  { href: "/needs",       label: "Necesidades",    icon: AlertCircle,roles: null },
  { href: "/gaps",        label: "Gaps",           icon: TrendingUp, roles: null },
  { href: "/instruments", label: "Financiamiento", icon: Banknote,   roles: null },
  { href: "/search",      label: "Buscar IA",      icon: Search,     roles: null },
  { href: "/iniciativas", label: "Iniciativas",    icon: Lightbulb,  roles: null },
  { href: "/informe",     label: "Informe IA",     icon: BarChart2,  roles: ["admin", "manager", "directivo", "vinculador"] },
  { href: "/radar",       label: "Radar sectorial",icon: Radar,      roles: ["admin", "manager", "directivo", "vinculador"] },
];

const ROL_LABEL: Record<string, string> = {
  admin:      "Administrador",
  manager:    "Manager",
  directivo:  "Directivo",
  vinculador: "Vinculador",
  oferente:   "Miembro",
  demandante: "Invitado",
};

const S = {
  bg:     "#ffffff",
  border: "#e2e8f0",
  muted:  "#5a7a9a",
  hover:  "rgba(13,148,136,0.08)",
  accent: "#0d9488",
  text:   "#1e3a5f",
};

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rol = (session?.user as { rol?: string })?.rol ?? "";

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-40"
      style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: S.accent }}>
          <SinapLogo />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider" style={{ color: S.text }}>sinap<span style={{ color: S.accent }}>.io</span></div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2" style={{ color: S.muted }}>
          Plataforma
        </p>
        {links.filter(({ roles }) => !roles || roles.includes(rol)).map(({ href, label, icon: Icon }) => {
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

      {/* Footer / usuario */}
      <div className="px-4 py-4 space-y-3" style={{ borderTop: `1px solid ${S.border}` }}>
        {session?.user && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: S.text }}>{session.user.name}</p>
              {rol && (
                <p className="text-[10px] truncate" style={{ color: S.muted }}>{ROL_LABEL[rol] ?? rol}</p>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesión"
              className="shrink-0 p-1.5 rounded-md hover:bg-red-50 transition"
              style={{ color: S.muted }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
        <p className="text-[10px] leading-relaxed" style={{ color: S.muted }}>
          Clúster de Biotecnología<br />de Córdoba, Argentina
        </p>
      </div>
    </aside>
  );
}
