import { fetchApi } from "@/lib/api";
import type { NeedItem } from "@/lib/types";
import NeedsClient from "@/components/needs/NeedsClient";

export default async function NeedsPage() {
  const needs = await fetchApi<NeedItem[]>("/needs");

  const byUrgencia = needs.reduce<Record<string, number>>((acc, n) => {
    acc[n.urgencia] = (acc[n.urgencia] ?? 0) + 1;
    return acc;
  }, {});

  const URGENCIA_META = [
    { key: "critica", label: "Crítica",  color: "#ef4444" },
    { key: "alta",    label: "Alta",     color: "#f97316" },
    { key: "normal",  label: "Normal",   color: "#3b82f6" },
    { key: "baja",    label: "Baja",     color: "#6b7280" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Necesidades activas</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Demanda declarada por actores del ecosistema, ordenada por urgencia
        </p>
      </div>

      {/* Breakdown por urgencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {URGENCIA_META.map(({ key, label, color }) => (
          <div
            key={key}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-2xl font-bold text-white">{byUrgencia[key] ?? 0}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <NeedsClient needs={needs} />
    </div>
  );
}
