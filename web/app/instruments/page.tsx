import { fetchApi } from "@/lib/api";
import type { InstrumentItem } from "@/lib/types";
import InstrumentsClient from "@/components/instruments/InstrumentsClient";
import { TIPO_INSTRUMENTO_LABEL, STATUS_INSTRUMENTO_COLOR } from "@/lib/labels";

export default async function InstrumentsPage() {
  const instruments = await fetchApi<InstrumentItem[]>("/instruments");

  const activos    = instruments.filter((i) => i.status === "activo").length;
  const proximos   = instruments.filter((i) => i.status === "proximamente").length;
  const cerrados   = instruments.filter((i) => i.status === "cerrado").length;

  const byTipo = instruments.reduce<Record<string, number>>((acc, i) => {
    acc[i.tipo] = (acc[i.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Instrumentos de financiamiento</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Fondos, subsidios y créditos para actores del ecosistema biotech
        </p>
      </div>

      {/* Métricas de estado */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: "Activos",      value: activos,  color: STATUS_INSTRUMENTO_COLOR.activo },
          { label: "Próximamente", value: proximos, color: STATUS_INSTRUMENTO_COLOR.proximamente },
          { label: "Cerrados",     value: cerrados, color: STATUS_INSTRUMENTO_COLOR.cerrado },
          ...Object.entries(byTipo).map(([tipo, count]) => ({
            label: TIPO_INSTRUMENTO_LABEL[tipo] ?? tipo,
            value: count,
            color: "#3b82f6",
          })),
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-2xl font-bold text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <InstrumentsClient instruments={instruments} />
    </div>
  );
}
