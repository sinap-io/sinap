import Link from "next/link";
import { fetchApi } from "@/lib/api";
import type { ActorList, ServiceItem, NeedItem, InstrumentItem, GapSummary } from "@/lib/types";

async function getStats() {
  const [actors, services, needs, instruments, gapSummary] = await Promise.allSettled([
    fetchApi<ActorList[]>("/actors"),
    fetchApi<ServiceItem[]>("/services"),
    fetchApi<NeedItem[]>("/needs"),
    fetchApi<InstrumentItem[]>("/instruments?status=activo"),
    fetchApi<GapSummary>("/gaps/summary"),
  ]);

  return {
    actores:      actors.status      === "fulfilled" ? actors.value.length      : 0,
    servicios:    services.status    === "fulfilled" ? services.value.length    : 0,
    necesidades:  needs.status       === "fulfilled" ? needs.value.length       : 0,
    instrumentos: instruments.status === "fulfilled" ? instruments.value.length : 0,
    gaps:         gapSummary.status  === "fulfilled" ? gapSummary.value.total_gaps : 0,
  };
}

const NAV_CARDS = [
  {
    href:    "/actors",
    title:   "Red de actores",
    desc:    "Laboratorios, empresas, startups, universidades e instituciones de investigación del ecosistema.",
    accent:  "var(--accent)",
  },
  {
    href:    "/search",
    title:   "Buscar con IA",
    desc:    "Describí lo que necesitás en lenguaje libre. La IA encuentra servicios relevantes y detecta gaps.",
    accent:  "var(--green)",
  },
  {
    href:    "/instruments",
    title:   "Financiamiento",
    desc:    "Subsidios, créditos y fondos disponibles para proyectos de innovación biotech.",
    accent:  "var(--orange)",
  },
  {
    href:    "/gaps",
    title:   "Gaps de oferta",
    desc:    "Necesidades activas sin cobertura. Oportunidades de inversión para nuevos actores.",
    accent:  "var(--red)",
  },
  {
    href:    "/services",
    title:   "Servicios",
    desc:    "Catálogo completo de capacidades disponibles en la red.",
    accent:  "var(--accent)",
  },
  {
    href:    "/needs",
    title:   "Necesidades",
    desc:    "Demanda declarada por actores del ecosistema, ordenada por urgencia.",
    accent:  "var(--orange)",
  },
];

export default async function HomePage() {
  const stats = await getStats();

  const METRICS = [
    { label: "Actores",            value: stats.actores },
    { label: "Servicios",          value: stats.servicios },
    { label: "Necesidades activas",value: stats.necesidades },
    { label: "Fondos disponibles", value: stats.instrumentos },
    { label: "Gaps detectados",    value: stats.gaps },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="pt-4 pb-10 border-b border-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
          Ecosistema Biotech · Córdoba, Argentina
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--navy)] mb-4 leading-tight">
          Plataforma de<br />Inteligencia Territorial
        </h1>
        <p className="text-[var(--text-muted)] max-w-xl mb-10 leading-relaxed">
          Conectamos laboratorios, empresas, universidades e instituciones.<br />
          Encontrá servicios, identificá oportunidades y accedé a financiamiento.
        </p>

        {/* Métricas */}
        <div className="flex flex-wrap gap-10">
          {METRICS.map(({ label, value }) => (
            <div key={label}>
              <div className="text-4xl font-black text-[var(--accent)]">{value}</div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cards de navegación */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">¿Qué querés hacer?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(({ href, title, desc, accent }) => (
            <Link
              key={href}
              href={href}
              className="group block rounded-xl border border-[var(--border)] bg-white p-6
                         hover:border-[var(--accent)] hover:shadow-md transition-all duration-150"
              style={{ borderTopColor: accent, borderTopWidth: "3px" }}
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
