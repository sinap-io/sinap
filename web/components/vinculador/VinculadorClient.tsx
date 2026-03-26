"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CasoList, VinculadorItem } from "@/lib/types";
import { ESTADO_CASO_LABEL, ESTADO_CASO_COLOR } from "@/lib/labels";

const ESTADOS = ["abierto", "en_gestion", "vinculado", "cerrado", "cancelado"];

export default function VinculadorClient({
  casos,
  vinculadores,
}: {
  casos: CasoList[];
  vinculadores: VinculadorItem[];
}) {
  const [estado, setEstado]         = useState("");
  const [vinculadorId, setVinculadorId] = useState("");

  const filtered = useMemo(() => {
    return casos.filter((c) => {
      const matchEstado     = !estado || c.estado === estado;
      const matchVinculador = !vinculadorId || c.vinculador_id === Number(vinculadorId);
      return matchEstado && matchVinculador;
    });
  }, [casos, estado, vinculadorId]);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)]
                     focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_CASO_LABEL[e]}</option>
          ))}
        </select>

        <select
          value={vinculadorId}
          onChange={(e) => setVinculadorId(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)]
                     focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los vinculadores</option>
          {vinculadores.map((v) => (
            <option key={v.id} value={v.id}>{v.nombre}</option>
          ))}
        </select>

        <span className="self-center text-sm text-[var(--text-muted)] sm:ml-auto">
          {filtered.length} caso{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          No hay casos que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((caso) => {
            const color = ESTADO_CASO_COLOR[caso.estado] ?? "#6b7280";
            const label = ESTADO_CASO_LABEL[caso.estado] ?? caso.estado;
            return (
              <Link
                key={caso.id}
                href={`/vinculador/casos/${caso.id}`}
                className="group flex items-start gap-4 rounded-xl border border-[var(--border)]
                           bg-[var(--bg-card)] p-5 hover:border-[var(--accent)]
                           hover:bg-[var(--bg-hover)] transition-all duration-150"
                style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
              >
                {/* Estado badge */}
                <span
                  className="shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  {label}
                </span>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {caso.demandante_nombre}
                    </span>
                    <span className="text-[var(--text-muted)] text-sm">→</span>
                    <span className="text-[var(--text)] text-sm truncate">
                      {caso.oferente_nombre ?? <em className="text-[var(--text-muted)]">Sin asignar</em>}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Necesidad: {caso.necesidad_tipo} · Vinculador: {caso.vinculador_nombre}
                  </p>
                </div>

                {/* Fecha */}
                <div className="shrink-0 text-xs text-[var(--text-muted)] text-right">
                  <div>Caso #{caso.id}</div>
                  <div>{new Date(caso.creado_en).toLocaleDateString("es-AR")}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
