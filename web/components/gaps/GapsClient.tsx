"use client";

import { useState, useMemo } from "react";
import type { GapItem, GapSummary } from "@/lib/types";
import { AREA_LABEL, SERVICIO_LABEL } from "@/lib/labels";

export default function GapsClient({
  gaps,
  summary,
}: {
  gaps: GapItem[];
  summary: GapSummary;
}) {
  const [soloSinOferta, setSoloSinOferta] = useState(true);

  const filtered = useMemo(
    () => (soloSinOferta ? gaps.filter((g) => g.oferta_disponible === 0) : gaps),
    [gaps, soloSinOferta]
  );

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Gaps totales",       value: summary.total_gaps,    color: "#ef4444" },
          { label: "Cobertura parcial",  value: summary.total_parcial, color: "#f97316" },
          { label: "Actores demandantes",value: summary.total_demanda, color: "#3b82f6" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSoloSinOferta(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            soloSinOferta
              ? "bg-[#ef444422] text-[#ef4444] border border-[#ef444444]"
              : "text-[var(--text-muted)] hover:text-white border border-[var(--border)]"
          }`}
        >
          Solo gaps (sin oferta)
        </button>
        <button
          onClick={() => setSoloSinOferta(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !soloSinOferta
              ? "bg-[#f9731622] text-[#f97316] border border-[#f9731644]"
              : "text-[var(--text-muted)] hover:text-white border border-[var(--border)]"
          }`}
        >
          Todos (incluye parciales)
        </button>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {filtered.length} tipo{filtered.length !== 1 ? "s" : ""} de servicio con demanda insatisfecha
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
          <p className="text-[var(--text-muted)]">No se detectaron gaps con los filtros actuales.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g, i) => {
            const esGap      = g.oferta_disponible === 0;
            const borderColor = esGap ? "#ef4444" : "#f97316";
            const tagColor    = esGap ? "#ef4444" : "#f97316";
            const tagLabel    = esGap ? "Sin cobertura" : `${g.oferta_disponible} proveedor(es)`;
            return (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
                style={{ borderLeftColor: borderColor, borderLeftWidth: "3px" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      {SERVICIO_LABEL[g.tipo_servicio] ?? g.tipo_servicio}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Área: {AREA_LABEL[g.area_tematica] ?? g.area_tematica}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ color: tagColor, background: `${tagColor}22`, borderColor: `${tagColor}44` }}
                  >
                    {tagLabel}
                  </span>
                </div>
                {g.actores_demandantes && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Demandado por: {g.actores_demandantes}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-xs text-[var(--text-muted)]">
                    {g.demanda} actor{g.demanda !== 1 ? "es" : ""} demandante{g.demanda !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
