export const dynamic = "force-dynamic";

import Link from "next/link";
import { fetchApi } from "@/lib/api";
import type { CasoList, VinculadorItem } from "@/lib/types";
import VinculadorClient from "@/components/vinculador/VinculadorClient";

export default async function VinculadorPage() {
  const [casos, vinculadores] = await Promise.all([
    fetchApi<CasoList[]>("/vinculador/casos"),
    fetchApi<VinculadorItem[]>("/vinculador/operadores"),
  ]);

  const metricas = {
    abiertos:    casos.filter((c) => c.estado === "abierto").length,
    en_gestion:  casos.filter((c) => c.estado === "en_gestion").length,
    vinculados:  casos.filter((c) => c.estado === "vinculado").length,
    cerrados:    casos.filter((c) => c.estado === "cerrado").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Módulo Vinculador</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {casos.length} caso{casos.length !== 1 ? "s" : ""} en la cartera
          </p>
        </div>
        <Link
          href="/vinculador/casos/nuevo"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                     hover:opacity-90 transition-opacity"
        >
          + Nuevo caso
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Abiertos",    value: metricas.abiertos,   color: "#3b82f6" },
          { label: "En gestión",  value: metricas.en_gestion, color: "#f97316" },
          { label: "Vinculados",  value: metricas.vinculados, color: "#22c55e" },
          { label: "Cerrados",    value: metricas.cerrados,   color: "#6b7280" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Lista con filtros */}
      <VinculadorClient casos={casos} vinculadores={vinculadores} />
    </div>
  );
}
