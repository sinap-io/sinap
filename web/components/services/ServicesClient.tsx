"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/Badge";
import type { ServiceItem } from "@/lib/types";
import {
  TIPO_ACTOR_LABEL, TIPO_ACTOR_COLOR,
  AREA_LABEL, SERVICIO_LABEL, DISPONIBILIDAD_COLOR,
} from "@/lib/labels";

const AREAS = [
  "salud_humana", "medicamentos_farma", "alimentos_nutricion",
  "agroindustria", "salud_animal", "ambiente", "otro",
];
const DISPONIBILIDADES = ["disponible", "parcial", "no_disponible"];

export default function ServicesClient({ services }: { services: ServiceItem[] }) {
  const [search, setSearch]   = useState("");
  const [area, setArea]       = useState("");
  const [disp, setDisp]       = useState("");

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.actor.toLowerCase().includes(q) ||
        (s.descripcion ?? "").toLowerCase().includes(q);
      const matchArea = !area || s.area_tematica === area;
      const matchDisp = !disp || s.disponibilidad === disp;
      return matchSearch && matchArea && matchDisp;
    });
  }, [services, search, area, disp]);

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
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todas las áreas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{AREA_LABEL[a]}</option>
          ))}
        </select>
        <select
          value={disp}
          onChange={(e) => setDisp(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Toda disponibilidad</option>
          {DISPONIBILIDADES.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {filtered.length} servicio{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Sin resultados.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => {
            const actorColor = TIPO_ACTOR_COLOR[s.tipo_actor] ?? "#6b7280";
            const dispColor  = DISPONIBILIDAD_COLOR[s.disponibilidad] ?? "#6b7280";
            return (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
                style={{ borderLeftColor: actorColor, borderLeftWidth: "3px" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-white">
                      {SERVICIO_LABEL[s.tipo_servicio] ?? s.tipo_servicio}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">{s.actor}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge label={TIPO_ACTOR_LABEL[s.tipo_actor] ?? s.tipo_actor} color={actorColor} />
                    <Badge label={s.disponibilidad} color={dispColor} />
                  </div>
                </div>
                {s.descripcion && (
                  <p className="text-sm text-[var(--text-muted)] mb-3 leading-relaxed">
                    {s.descripcion}
                  </p>
                )}
                <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded">
                  {AREA_LABEL[s.area_tematica] ?? s.area_tematica}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
