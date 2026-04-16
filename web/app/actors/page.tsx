export const dynamic = "force-dynamic";

import { fetchApi } from "@/lib/api";
import type { ActorList } from "@/lib/types";
import ActorsClient from "@/components/actors/ActorsClient";

export default async function ActorsPage() {
  let actors: ActorList[] = [];
  try {
    actors = await fetchApi<ActorList[]>("/actors");
  } catch {
    // API no disponible — se muestra la lista vacía
  }

  const totales = {
    empresa:      actors.filter((a) => a.tipo === "empresa").length,
    startup:      actors.filter((a) => a.tipo === "startup").length,
    universidad:  actors.filter((a) => a.tipo === "universidad").length,
    investigador: actors.filter((a) => a.tipo === "investigador").length,
    gobierno:     actors.filter((a) => a.tipo === "gobierno").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Red de actores</h1>
        <p className="text-[var(--text-muted)] text-sm">
          {actors.length} actores registrados en el ecosistema biotech de Córdoba
        </p>
      </div>

      {/* Breakdown por tipo */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { tipo: "empresa",      label: "Empresas",       color: "#3b82f6" },
          { tipo: "startup",      label: "Startups",       color: "#64748b" },
          { tipo: "universidad",  label: "Universidades",  color: "#eab308" },
          { tipo: "investigador", label: "Investigación",  color: "#f97316" },
          { tipo: "gobierno",     label: "Gobierno",       color: "#0d9488" },
        ].map(({ tipo, label, color }) => (
          <div
            key={tipo}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-2xl font-bold text-[var(--text)]">
              {totales[tipo as keyof typeof totales]}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Lista con filtros (Client Component) */}
      <ActorsClient actors={actors} />
    </div>
  );
}
