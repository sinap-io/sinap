"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
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
  FlaskConical,
  Activity,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

function SinapLogo({ size = 32 }: { size?: number }) {
  return (
    <Image src="/sinap-logo.png" alt="Sinap logo" width={size} height={size} className="object-contain" />
  );
}

const links = [
  { href: "/",            label: "Inicio",         icon: Home,       roles: null },
  { href: "/actors",      label: "Actores",        icon: Users,      roles: null },
  { href: "/services",    label: "Ofertas",        icon: Wrench,     roles: null },
  { href: "/needs",       label: "Demandas",       icon: AlertCircle,roles: null },
  { href: "/gaps",        label: "Gaps",           icon: TrendingUp, roles: null },
  { href: "/instruments", label: "Financiamiento", icon: Banknote,   roles: null },
  { href: "/search",      label: "Buscar IA",      icon: Search,     roles: null },
  { href: "/iniciativas", label: "Iniciativas",    icon: Lightbulb,     roles: null },
  { href: "/proyectos",   label: "Proyectos",      icon: FlaskConical,  roles: null },
  { href: "/vinculadores", label: "Vinculadores",   icon: Activity,      roles: ["admin", "manager", "directivo", "vinculador"] },
  { href: "/asistente",   label: "Asistente IA",   icon: Sparkles,   roles: ["admin", "manager", "directivo", "vinculador", "oferente"] },
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

function NavLinks({ rol, pathname, onClose }: { rol: string; pathname: string; onClose?: () => void }) {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2" style={{ color: S.muted }}>
        Plataforma
      </p>
      {links.filter(({ roles }) => !roles || roles.includes(rol)).map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
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
    </>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 shrink-0" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="w-8 h-8 flex items-center justify-center">
          <SinapLogo size={32} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider" style={{ color: S.text }}>sinap<span style={{ color: S.accent }}>.io</span></div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NavLinks rol={rol} pathname={pathname} onClose={() => setMobileOpen(false)} />
      </nav>

      {/* Footer / usuario */}
      <div className="px-4 py-4 space-y-3 shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
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
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ────────────────────────────── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-60 flex-col z-40"
        style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4"
        style={{ background: S.bg, borderBottom: `1px solid ${S.border}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center">
            <SinapLogo size={28} />
          </div>
          <span className="text-sm font-bold tracking-wider" style={{ color: S.text }}>
            sinap<span style={{ color: S.accent }}>.io</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: S.muted }}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="md:hidden fixed top-0 left-0 h-screen w-72 flex flex-col z-50"
            style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
          >
            <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: `1px solid ${S.border}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 flex items-center justify-center">
                  <SinapLogo size={28} />
                </div>
                <span className="text-sm font-bold tracking-wider" style={{ color: S.text }}>
                  sinap<span style={{ color: S.accent }}>.io</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: S.muted }}
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks rol={rol} pathname={pathname} onClose={() => setMobileOpen(false)} />
            </nav>

            <div className="px-4 py-4 space-y-3 shrink-0" style={{ borderTop: `1px solid ${S.border}` }}>
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
        </>
      )}
    </>
  );
}
