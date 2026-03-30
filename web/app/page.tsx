export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";
import type { ActorList, ServiceItem, NeedItem, InstrumentItem, GapSummary, IniciativaList } from "@/lib/types";

async function getStats() {
  const [actors, services, needs, instruments, gapSummary, iniciativas] = await Promise.allSettled([
    fetchApi<ActorList[]>("/actors"),
    fetchApi<ServiceItem[]>("/services"),
    fetchApi<NeedItem[]>("/needs"),
    fetchApi<InstrumentItem[]>("/instruments?status=activo"),
    fetchApi<GapSummary>("/gaps/summary"),
    fetchApi<IniciativaList[]>("/iniciativas"),
  ]);

  return {
    actores:      actors.status      === "fulfilled" ? actors.value.length      : 0,
    servicios:    services.status    === "fulfilled" ? services.value.length    : 0,
    necesidades:  needs.status       === "fulfilled" ? needs.value.length       : 0,
    necesidadesCriticas: needs.status === "fulfilled"
      ? needs.value.filter((n: NeedItem) => n.urgencia === "critica").length : 0,
    instrumentos: instruments.status === "fulfilled" ? instruments.value.length : 0,
    gaps:         gapSummary.status  === "fulfilled" ? gapSummary.value.total_gaps : 0,
    iniciativas:  iniciativas.status === "fulfilled" ? iniciativas.value.length : 0,
    iniciativasEnCurso: iniciativas.status === "fulfilled"
      ? iniciativas.value.filter((i: IniciativaList) => i.estado === "en_curso").length : 0,
    iniciativasAbiertas: iniciativas.status === "fulfilled"
      ? iniciativas.value.filter((i: IniciativaList) => i.estado === "abierta").length : 0,
    ultimasIniciativas: iniciativas.status === "fulfilled"
      ? iniciativas.value.slice(0, 3) : [],
  };
}

const NAV_CARDS = [
  {
    href:  "/actors",
    title: "Red de actores",
    desc:  "Laboratorios, empresas, startups, universidades e instituciones de investigación del ecosistema.",
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
    title: "Servicios",
    desc:  "Catálogo completo de capacidades disponibles en la red.",
  },
  {
    href:  "/needs",
    title: "Necesidades",
    desc:  "Demanda declarada por actores del ecosistema, ordenada por urgencia.",
  },
];

const ESTADO_LABEL: Record<string, string> = {
  abierta: "Abierta", en_curso: "En curso", concretada: "Concretada",
  cerrada: "Cerrada", postergada: "Postergada",
};
const ESTADO_COLOR: Record<string, string> = {
  abierta: "#3b82f6", en_curso: "#f97316", concretada: "#22c55e",
  cerrada: "#6b7280", postergada: "#a855f7",
};

export default async function HomePage() {
  const session = await auth();
  const stats   = await getStats();
  const rol     = (session?.user as { rol?: string })?.rol ?? "";
  const nombre  = session?.user?.name?.split(" ")[0] ?? "bienvenido";

  const METRICS = [
    { label: "Actores",            value: stats.actores },
    { label: "Servicios",          value: stats.servicios },
    { label: "Necesidades activas",value: stats.necesidades },
    { label: "Fondos disponibles", value: stats.instrumentos },
    { label: "Gaps detectados",    value: stats.gaps },
    { label: "Iniciativas",        value: stats.iniciativas },
  ];

  const puedeGestionar = ["admin", "directivo", "vinculador"].includes(rol);

  return (
    <div className="space-y-10">

      {/* ── Bienvenida personalizada ───────────────────────────── */}
      <section className="pt-8 pb-6 border-b border-[var(--border)]">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">
              Ecosistema Biotech · Córdoba, Argentina
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--navy)] mb-3 leading-tight">
              Hola, {nombre}
            </h1>
            <p className="text-[var(--text-muted)] leading-relaxed">
              {rol === "admin"      && "Tenés acceso completo a la plataforma."}
              {rol === "directivo"  && "Podés crear y gestionar iniciativas del Clúster."}
              {rol === "vinculador" && "Tus iniciativas asignadas están abajo."}
              {rol === "oferente"   && "Explorá oportunidades y conectate con el ecosistema."}
              {rol === "demandante" && "Encontrá actores, servicios y oportunidades de financiamiento."}
            </p>
          </div>
          {puedeGestionar && (
            <Link
              href="/iniciativas/nueva"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                         hover:opacity-90 transition-opacity self-start mt-1"
            >
              + Nueva iniciativa
            </Link>
          )}
        </div>

        {/* Panel de alertas para gestores */}
        {puedeGestionar && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/iniciativas?estado=en_curso"
              className="rounded-xl border-t-2 border-[#f97316] bg-white border border-[var(--border)]
                         p-4 text-center hover:shadow-md transition-all">
              <div className="text-3xl font-black text-[#f97316]">{stats.iniciativasEnCurso}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">En curso</div>
            </Link>
            <Link href="/iniciativas?estado=abierta"
              className="rounded-xl border-t-2 border-[#3b82f6] bg-white border border-[var(--border)]
                         p-4 text-center hover:shadow-md transition-all">
              <div className="text-3xl font-black text-[#3b82f6]">{stats.iniciativasAbiertas}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Abiertas</div>
            </Link>
            <Link href="/needs?urgency=critica"
              className="rounded-xl border-t-2 border-[#dc2626] bg-white border border-[var(--border)]
                         p-4 text-center hover:shadow-md transition-all">
              <div className="text-3xl font-black text-[#dc2626]">{stats.necesidadesCriticas}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Necesidades críticas</div>
            </Link>
            <Link href="/gaps"
              className="rounded-xl border-t-2 border-[var(--accent)] bg-white border border-[var(--border)]
                         p-4 text-center hover:shadow-md transition-all">
              <div className="text-3xl font-black text-[var(--accent)]">{stats.gaps}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Gaps detectados</div>
            </Link>
          </div>
        )}

        {/* Últimas iniciativas para gestores */}
        {puedeGestionar && stats.ultimasIniciativas.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Últimas iniciativas
              </p>
              <Link href="/iniciativas" className="text-xs text-[var(--accent)] hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-2">
              {(stats.ultimasIniciativas as IniciativaList[]).map((ini) => (
                <Link
                  key={ini.id}
                  href={`/iniciativas/${ini.id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)]
                             bg-white px-4 py-3 hover:border-[var(--accent)] hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-[var(--text)]">{ini.titulo}</span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: `${ESTADO_COLOR[ini.estado]}18`,
                      color: ESTADO_COLOR[ini.estado],
                    }}
                  >
                    {ESTADO_LABEL[ini.estado]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Para demandante: acceso directo a búsqueda */}
        {rol === "demandante" && (
          <div className="mt-6">
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent)]/5
                         px-5 py-4 hover:bg-[var(--accent)]/10 transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">Buscar con IA</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Describí lo que necesitás en lenguaje libre — la IA busca en todo el ecosistema.
                </p>
              </div>
              <span className="ml-auto text-[var(--accent)] text-lg">→</span>
            </Link>
          </div>
        )}
      </section>

      {/* ── Métricas globales ──────────────────────────────────── */}
      <section className="pb-6 border-b border-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-5">
          Estado del ecosistema
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

      {/* ── Cards de navegación ────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">¿Qué querés hacer?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_CARDS.map(({ href, title, desc }) => (
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
