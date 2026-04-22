"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/Badge";
import type { ActorList } from "@/lib/types";
import { TIPO_ACTOR_LABEL, TIPO_ACTOR_COLOR } from "@/lib/labels";

const TIPOS = ["empresa", "startup", "universidad", "investigador", "gobierno"];

export default function ActorsClient({ actors }: { actors: ActorList[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("q")    ?? "";
  const tipo   = searchParams.get("tipo") ?? "";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filtered = useMemo(() => {
    return actors.filter((a) => {
      const matchSearch =
        !search || a.nombre.toLowerCase().includes(search.toLowerCase());
      const matchTipo = !tipo || a.tipo === tipo;
      return matchSearch && matchTipo;
    });
  }, [actors, search, tipo]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setParam("q", e.target.value)}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <select
          value={tipo}
          onChange={(e) => setParam("tipo", e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-2 text-sm text-[var(--text)]
                     focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPO_ACTOR_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Contador */}
      <p className="text-sm text-[var(--text-muted)]">
        {filtered.length} actor{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          No hay actores que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((actor) => {
            const color = TIPO_ACTOR_COLOR[actor.tipo] ?? "#6b7280";
            const label = TIPO_ACTOR_LABEL[actor.tipo] ?? actor.tipo;
            return (
              <Link
                key={actor.id}
                href={`/actors/${actor.id}`}
                className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                           p-5 hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]
                           transition-all duration-150"
                style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
              >
                {/* Nombre y badges */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                    {actor.nombre}
                  </h3>
                  <Badge label={label} color={color} className="shrink-0" />
                </div>

                {/* Etapa */}
                {actor.etapa && (
                  <p className="text-xs text-[var(--text-muted)] mb-2 capitalize">
                    {actor.etapa}
                  </p>
                )}

                {/* Descripción */}
                {actor.descripcion && (
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-2">
                    {actor.descripcion}
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-6 pt-3 border-t border-[var(--border)]">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text)]">{actor.total_servicios}</div>
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Ofertas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text)]">{actor.total_necesidades}</div>
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Demandas</div>
                  </div>
                  {actor.sitio_web && (
                    <div className="ml-auto self-end">
                      <span className="text-xs text-[var(--accent)]">Ver detalle →</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
