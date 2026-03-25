"use client";

import { useState, useMemo } from "react";
import type { InstrumentItem } from "@/lib/types";
import { TIPO_INSTRUMENTO_LABEL, STATUS_INSTRUMENTO_COLOR } from "@/lib/labels";

const TIPOS = ["subsidio", "credito", "capital", "concurso"];

export default function InstrumentsClient({ instruments }: { instruments: InstrumentItem[] }) {
  const [search, setSearch] = useState("");
  const [tipo, setTipo]     = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return instruments.filter((ins) => {
      const matchSearch =
        !search ||
        ins.nombre.toLowerCase().includes(q) ||
        ins.organismo.toLowerCase().includes(q) ||
        (ins.sectores_elegibles ?? "").toLowerCase().includes(q);
      const matchTipo = !tipo || ins.tipo === tipo;
      return matchSearch && matchTipo;
    });
  }, [instruments, search, tipo]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, organismo o sector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{TIPO_INSTRUMENTO_LABEL[t]}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {filtered.length} instrumento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Sin resultados.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ins, i) => {
            const statusColor = STATUS_INSTRUMENTO_COLOR[ins.status] ?? "#6b7280";
            return (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
                style={{ borderLeftColor: statusColor, borderLeftWidth: "3px" }}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text)] text-base">{ins.nombre}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{ins.organismo}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                      style={{ color: "#3b82f6", background: "#3b82f622", borderColor: "#3b82f644" }}
                    >
                      {TIPO_INSTRUMENTO_LABEL[ins.tipo] ?? ins.tipo}
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                      style={{ color: statusColor, background: `${statusColor}22`, borderColor: `${statusColor}44` }}
                    >
                      {ins.status}
                    </span>
                  </div>
                </div>

                {/* Monto */}
                {ins.monto_maximo && (
                  <div className="mb-3">
                    <span className="text-[var(--green)] font-semibold text-sm">
                      {ins.monto_maximo}
                    </span>
                    {ins.cobertura_porcentaje != null && (
                      <span className="text-[var(--text-muted)] text-sm ml-2">
                        — cubre hasta {ins.cobertura_porcentaje}%
                      </span>
                    )}
                  </div>
                )}

                {/* Detalles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--text-muted)] mb-3">
                  {ins.plazo_ejecucion && (
                    <span>Plazo: {ins.plazo_ejecucion}</span>
                  )}
                  {ins.contrapartida && (
                    <span>Contrapartida: {ins.contrapartida}</span>
                  )}
                  {ins.sectores_elegibles && (
                    <span className="sm:col-span-2">Sectores: {ins.sectores_elegibles}</span>
                  )}
                </div>

                {ins.descripcion_extendida && (
                  <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">
                    {ins.descripcion_extendida}
                  </p>
                )}

                {ins.url && (
                  <a
                    href={ins.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Más información →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
