export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";
import type { ActorList, ServiceItem, NeedItem, InstrumentItem, GapSummary, IniciativaList, ProyectoList } from "@/lib/types";

async function getStats() {
  const [actors, services, needs, instruments, gapSummary, iniciativas, proyectos] = await Promise.allSettled([
    fetchApi<ActorList[]>("/actors"),
    fetchApi<ServiceItem[]>("/services"),
    fetchApi<NeedItem[]>("/needs"),
    fetchApi<InstrumentItem[]>("/instruments?status=activo"),
    fetchApi<GapSummary>("/gaps/summary"),
    fetchApi<IniciativaList[]>("/iniciativas"),
    fetchApi<ProyectoList[]>("/proyectos"),
  ]);

  return {
    actores:     actors.status      === "fulfilled" ? actors.value.length      : 0,
    servicios:   services.status    === "fulfilled" ? services.value.length    : 0,
    necesidades: needs.status       === "fulfilled" ? needs.value.length       : 0,
    instrumentos:instruments.status === "fulfilled" ? instruments.value.length : 0,
    gaps:        gapSummary.status  === "fulfilled" ? gapSummary.value.total_gaps : 0,
    iniciativas: iniciativas.status === "fulfilled" ? iniciativas.value.length : 0,
    proyectos:   proyectos.status   === "fulfilled" ? proyectos.value.length   : 0,
  };
}

const MODULOS = [
  {
    href:  "/actors",
    title: "Red de actores",
    desc:  "Laboratorios, empresas, startups, universidades e instituciones del ecosistema.",
  },
  {
    href:  "/search",
    title: "Buscar con IA",
    desc:  "Describí lo que necesitás en lenguaje libre. La IA encuentra servicios relevantes y detecta gaps.",
  },
  {
    href:  "/instruments",
    title: "Financiamiento",
    desc:  "Subsidios, créditos y fondos disponibles para proyectos de innovación biotech.",
  },
  {
    href:  "/gaps",
    title: "Gaps de oferta",
    desc:  "Necesidades activas sin cobertura. Oportunidades de inversión para nuevos actores.",
  },
  {
    href:  "/services",
    title: "Ofertas",
    desc:  "Catálogo completo de capacidades disponibles en la red.",
  },
  {
    href:  "/needs",
    title: "Demandas",
    desc:  "Demanda declarada por actores del ecosistema, ordenada por urgencia.",
  },
];

export default async function HomePage() {
  const session = await auth();
  const stats   = await getStats();
  const rol     = (session?.user as { rol?: string })?.rol ?? "";
  const puedeGestionar = ["admin", "directivo", "vinculador"].includes(rol);

  const METRICS = [
    { label: "Actores",            value: stats.actores },
    { label: "Ofertas",            value: stats.servicios },
    { label: "Demandas activas",   value: stats.necesidades },
    { label: "Fondos disponibles", value: stats.instrumentos },
    { label: "Gaps detectados",    value: stats.gaps },
    { label: "Iniciativas",        value: stats.iniciativas },
    { label: "Proyectos",          value: stats.proyectos },
  ];

  return (
    <div className="space-y-12">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-8 pb-10 border-b border-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
          Ecosistema Biotech · Córdoba, Argentina
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--navy)] mb-4 leading-tight">
          Plataforma de<br />Inteligencia Territorial
        </h1>
        <p className="text-[var(--text-muted)] max-w-xl mb-10 leading-relaxed">
          Registra la actividad del Clúster de Biotecnología de Córdoba.<br />
          Actores, capacidades, oportunidades e iniciativas en curso.
        </p>

        <div className="flex flex-wrap justify-center gap-10">
          {METRICS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-[var(--accent)]">{value}</div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Iniciativas — módulo central ──────────────────────── */}
      <section className="pb-10 border-b border-[var(--border)]">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--navy)]">Iniciativas</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-lg">
              Registrá y seguí cada proceso de articulación del Clúster: vinculaciones,
              consorcios, oportunidades de negocio, instrumentos de financiamiento y más.
              Cada iniciativa tiene actores, roles, hitos y trazabilidad completa.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/iniciativas"
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)]
                         text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              Ver iniciativas
            </Link>
            {puedeGestionar && (
              <Link
                href="/iniciativas/nueva"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white
                           bg-[var(--accent)] hover:opacity-90 transition-opacity"
              >
                + Nueva iniciativa
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Vinculación",  desc: "Conexión entre actores" },
            { label: "Consorcio",    desc: "Proyectos colaborativos" },
            { label: "Oportunidad",  desc: "Ventanas de mercado" },
            { label: "Instrumento",  desc: "Fondos y subsidios activos" },
          ].map(({ label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-white p-4"
              style={{ borderTopColor: "var(--accent)", borderTopWidth: "2px" }}
            >
              <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Módulos ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Explorá la plataforma</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULOS.map(({ href, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="group block rounded-xl border border-[var(--border)] bg-white p-6
                         hover:border-[var(--accent)] hover:shadow-md transition-all duration-150"
              style={{ borderTopColor: "var(--accent)", borderTopWidth: "3px" }}
            >
              <h3 className="font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                {title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
