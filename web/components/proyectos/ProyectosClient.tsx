"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProyectoList } from "@/lib/types";
import {
  ESTADO_PROYECTO_LABEL,
  ESTADO_PROYECTO_COLOR,
  AREA_LABEL,
  TRL_COLOR,
  APOYO_LABEL,
  APOYO_COLOR,
} from "@/lib/labels";

const TODOS = "todos";

interface ActorOption { id: number; nombre: string }

export default function ProyectosClient({
  proyectos,
  actores,
}: {
  proyectos: ProyectoList[];
  actores: ActorOption[];
}) {
  const [estadoFiltro, setEstadoFiltro] = useState(TODOS);
  const [areaFiltro,   setAreaFiltro]   = useState(TODOS);
  const [actorFiltro,  setActorFiltro]  = useState<number | "todos">(TODOS);
  const [busqueda,     setBusqueda]     = useState("");

  // Áreas únicas de los proyectos cargados
  const areas = Array.from(
    new Set(proyectos.map((p) => p.area_tematica).filter((a): a is string => a !== null))
  ).sort();

  const filtrados = proyectos.filter((p) => {
    if (estadoFiltro !== TODOS && p.estado !== estadoFiltro) return false;
    if (areaFiltro   !== TODOS && p.area_tematica !== areaFiltro) return false;
    if (actorFiltro  !== TODOS && !p.actor_ids.includes(actorFiltro as number)) return false;
    if (busqueda && !p.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const hayFiltros =
    estadoFiltro !== TODOS || areaFiltro !== TODOS ||
    actorFiltro !== TODOS || busqueda !== "";

  const selectCls = `rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]`;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={`${selectCls} flex-1 min-w-[180px]`}
        />

        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} className={selectCls}>
          <option value={TODOS}>Todos los estados</option>
          {Object.entries(ESTADO_PROYECTO_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {areas.length > 0 && (
          <select value={areaFiltro} onChange={(e) => setAreaFiltro(e.target.value)} className={selectCls}>
            <option value={TODOS}>Todas las áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{AREA_LABEL[a] ?? a}</option>
            ))}
          </select>
        )}

        {actores.length > 0 && (
          <select
            value={actorFiltro}
            onChange={(e) =>
              setActorFiltro(e.target.value === TODOS ? TODOS : Number(e.target.value))
            }
            className={selectCls}
          >
            <option value={TODOS}>Todos los actores</option>
            {actores
              .slice()
              .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
              .map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
          </select>
        )}

        {hayFiltros && (
          <button
            onClick={() => {
              setEstadoFiltro(TODOS);
              setAreaFiltro(TODOS);
              setActorFiltro(TODOS);
              setBusqueda("");
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {hayFiltros && (
        <p className="text-xs text-[var(--text-muted)]">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)] text-sm">
          No hay proyectos que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((p) => {
            const estadoColor = ESTADO_PROYECTO_COLOR[p.estado] ?? "#6b7280";
            const trlColor    = p.trl ? TRL_COLOR[p.trl] : "#94a3b8";
            return (
              <Link
                key={p.id}
                href={`/proyectos/${p.id}`}
                className="flex items-center gap-4 rounded-xl border border-[var(--border)]
                           bg-[var(--bg-card)] px-5 py-4 hover:border-[var(--accent)]
                           transition-colors group"
              >
                {/* TRL badge */}
                <span
                  className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full w-14 text-center"
                  style={{ background: `${trlColor}20`, color: trlColor }}
                >
                  {p.trl ? `TRL ${p.trl}` : "Sin TRL"}
                </span>

                {/* Título + área + iniciativa */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate
                                group-hover:text-[var(--accent)] transition-colors">
                    {p.titulo}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {p.area_tematica ? (AREA_LABEL[p.area_tematica] ?? p.area_tematica) : ""}
                    {p.iniciativa_titulo && (
                      <span className="ml-2 text-[var(--accent)]">
                        ↗ {p.iniciativa_titulo}
                      </span>
                    )}
                  </p>
                </div>

                {/* Apoyos buscados */}
                <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs">
                  {p.apoyos_buscados.slice(0, 2).map((apoyo) => {
                    const c = APOYO_COLOR[apoyo] ?? "#6b7280";
                    return (
                      <span key={apoyo} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${c}18`, color: c }}>
                        {APOYO_LABEL[apoyo] ?? apoyo}
                      </span>
                    );
                  })}
                  {p.apoyos_buscados.length > 2 && (
                    <span className="text-xs text-[var(--text-muted)]">+{p.apoyos_buscados.length - 2}</span>
                  )}
                </div>

                {/* Estado */}
                <span
                  className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ borderColor: estadoColor, color: estadoColor }}
                >
                  {ESTADO_PROYECTO_LABEL[p.estado] ?? p.estado}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
