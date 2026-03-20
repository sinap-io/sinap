"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/Badge";
import type { NeedItem } from "@/lib/types";
import {
  TIPO_ACTOR_LABEL, TIPO_ACTOR_COLOR,
  AREA_LABEL, SERVICIO_LABEL, URGENCIA_COLOR,
} from "@/lib/labels";

const URGENCIAS = ["critica", "alta", "normal", "baja"];

export default function NeedsClient({ needs }: { needs: NeedItem[] }) {
  const [search, setSearch]     = useState("");
  const [urgencia, setUrgencia] = useState("");

  const filtered = useMemo(() => {
    return needs.filter((n) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        n.actor.toLowerCase().includes(q) ||
        (n.descripcion ?? "").toLowerCase().includes(q);
      const matchUrgencia = !urgencia || n.urgencia === urgencia;
      return matchSearch && matchUrgencia;
    });
  }, [needs, search, urgencia]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por actor o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-white placeholder-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <select
          value={urgencia}
          onChange={(e) => setUrgencia(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Toda urgencia</option>
          {URGENCIAS.map((u) => (
            <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {filtered.length} necesidad{filtered.length !== 1 ? "es" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Sin resultados.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, i) => {
            const urgColor   = URGENCIA_COLOR[n.urgencia] ?? "#6b7280";
            const actorColor = TIPO_ACTOR_COLOR[n.tipo_actor] ?? "#6b7280";
            return (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
                style={{ borderLeftColor: urgColor, borderLeftWidth: "3px" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      {SERVICIO_LABEL[n.tipo_servicio] ?? n.tipo_servicio}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">{n.actor}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge label={TIPO_ACTOR_LABEL[n.tipo_actor] ?? n.tipo_actor} color={actorColor} />
                    <Badge label={`Urgencia ${n.urgencia}`} color={urgColor} />
                  </div>
                </div>
                {n.descripcion && (
                  <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">
                    {n.descripcion}
                  </p>
                )}
                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded">
                  {AREA_LABEL[n.area_tematica] ?? n.area_tematica}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
