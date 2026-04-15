"use client";

import { useState } from "react";
import Link from "next/link";
import type { IniciativaList } from "@/lib/types";
import {
  TIPO_INICIATIVA_LABEL,
  TIPO_INICIATIVA_COLOR,
  ESTADO_INICIATIVA_LABEL,
  ESTADO_INICIATIVA_COLOR,
} from "@/lib/labels";

const TODOS = "todos";

interface ActorOption {
  id: number;
  nombre: string;
}

export default function IniciativasClient({
  iniciativas,
  actores,
}: {
  iniciativas: IniciativaList[];
  actores: ActorOption[];
}) {
  const [tipoFiltro,     setTipoFiltro]     = useState(TODOS);
  const [estadoFiltro,   setEstadoFiltro]   = useState(TODOS);
  const [actorFiltro,    setActorFiltro]    = useState<number | "todos">(TODOS);
  const [vinculadorFiltro, setVinculadorFiltro] = useState(TODOS);
  const [busqueda,       setBusqueda]       = useState("");

  // Vinculadores únicos para el dropdown
  const vinculadores = Array.from(
    new Set(
      iniciativas
        .map((i) => i.vinculador_nombre)
        .filter((v): v is string => v !== null)
    )
  ).sort();

  const filtradas = iniciativas.filter((i) => {
    if (tipoFiltro   !== TODOS && i.tipo   !== tipoFiltro)   return false;
    if (estadoFiltro !== TODOS && i.estado !== estadoFiltro) return false;
    if (actorFiltro  !== TODOS && !i.actor_ids.includes(actorFiltro as number)) return false;
    if (vinculadorFiltro !== TODOS && i.vinculador_nombre !== vinculadorFiltro) return false;
    if (busqueda && !i.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const hayFiltros =
    tipoFiltro !== TODOS ||
    estadoFiltro !== TODOS ||
    actorFiltro !== TODOS ||
    vinculadorFiltro !== TODOS ||
    busqueda !== "";

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

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className={selectCls}
        >
          <option value={TODOS}>Todos los tipos</option>
          {Object.entries(TIPO_INICIATIVA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className={selectCls}
        >
          <option value={TODOS}>Todos los estados</option>
          {Object.entries(ESTADO_INICIATIVA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

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

        {vinculadores.length > 0 && (
          <select
            value={vinculadorFiltro}
            onChange={(e) => setVinculadorFiltro(e.target.value)}
            className={selectCls}
          >
            <option value={TODOS}>Todos los vinculadores</option>
            {vinculadores.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        )}

        {hayFiltros && (
          <button
            onClick={() => {
              setTipoFiltro(TODOS);
              setEstadoFiltro(TODOS);
              setActorFiltro(TODOS);
              setVinculadorFiltro(TODOS);
              setBusqueda("");
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]
                       transition-colors px-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contador de resultados cuando hay filtros activos */}
      {hayFiltros && (
        <p className="text-xs text-[var(--text-muted)]">
          {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)] text-sm">
          No hay iniciativas que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((ini) => {
            const tipoColor   = TIPO_INICIATIVA_COLOR[ini.tipo]    ?? "#6b7280";
            const estadoColor = ESTADO_INICIATIVA_COLOR[ini.estado] ?? "#6b7280";
            return (
              <Link
                key={ini.id}
                href={`/iniciativas/${ini.id}`}
                className="flex items-center gap-4 rounded-xl border border-[var(--border)]
                           bg-[var(--bg-card)] px-5 py-4 hover:border-[var(--accent)]
                           transition-colors group"
              >
                {/* Tipo badge */}
                <span
                  className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full w-24 text-center"
                  style={{ background: `${tipoColor}20`, color: tipoColor }}
                >
                  {TIPO_INICIATIVA_LABEL[ini.tipo] ?? ini.tipo}
                </span>

                {/* Título */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate
                                group-hover:text-[var(--accent)] transition-colors">
                    {ini.titulo}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-xs text-[var(--text-muted)] shrink-0">
                  <span>{ini.total_actores} actor{ini.total_actores !== 1 ? "es" : ""}</span>
                  <span>{ini.total_hitos} hito{ini.total_hitos !== 1 ? "s" : ""}</span>
                </div>

                {/* Estado */}
                <span
                  className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ borderColor: estadoColor, color: estadoColor }}
                >
                  {ESTADO_INICIATIVA_LABEL[ini.estado] ?? ini.estado}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
