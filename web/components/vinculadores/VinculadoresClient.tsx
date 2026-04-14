"use client";

import Link from "next/link";
import type { VinculadorList, ZonaOut } from "@/lib/types";

interface Props {
  vinculadores: VinculadorList[];
  zonas: ZonaOut[];
  rol: string;
}

export default function VinculadoresClient({ vinculadores, zonas: _zonas, rol: _rol }: Props) {
  const totalActividad = vinculadores.reduce(
    (acc, v) => acc + v.total_iniciativas + v.total_hitos + v.total_proyectos,
    0
  );

  return (
    <div className="space-y-6">
      {vinculadores.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm py-8 text-center">
          No hay vinculadores activos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {vinculadores.map((v) => (
            <VinculadorCard key={v.id} vinculador={v} />
          ))}
        </div>
      )}

      {totalActividad === 0 && vinculadores.length > 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center pt-2">
          La actividad se registrará a medida que se creen iniciativas, hitos y proyectos desde la plataforma.
        </p>
      )}
    </div>
  );
}

function VinculadorCard({ vinculador: v }: { vinculador: VinculadorList }) {
  const totalActividades = v.total_iniciativas + v.total_hitos + v.total_proyectos;
  const tieneActividad = totalActividades > 0;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/vinculadores/${v.id}`}
              className="font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors text-base"
            >
              {v.nombre}
            </Link>
            {v.zona_nombre && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#0d948820", color: "#0d9488" }}
              >
                {v.zona_nombre}
              </span>
            )}
          </div>
          {v.email && (
            <p className="text-xs text-[var(--text-muted)]">{v.email}</p>
          )}
        </div>

        <div className="flex items-center gap-5 shrink-0">
          {tieneActividad ? (
            <>
              <ActivityStat label="Iniciativas" value={v.total_iniciativas} color="#3b82f6" />
              <ActivityStat label="Hitos" value={v.total_hitos} color="#a855f7" />
              <ActivityStat label="Proyectos" value={v.total_proyectos} color="#22c55e" />
            </>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Sin actividad aún</span>
          )}
          <Link
            href={`/vinculadores/${v.id}`}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Ver →
          </Link>
        </div>
      </div>

      {/* Barra de actividad */}
      {tieneActividad && (
        <div className="mt-3 flex gap-1 h-1.5 rounded-full overflow-hidden">
          {v.total_iniciativas > 0 && (
            <div style={{ flex: v.total_iniciativas, background: "#3b82f6", borderRadius: "9999px" }} />
          )}
          {v.total_hitos > 0 && (
            <div style={{ flex: v.total_hitos, background: "#a855f7", borderRadius: "9999px" }} />
          )}
          {v.total_proyectos > 0 && (
            <div style={{ flex: v.total_proyectos, background: "#22c55e", borderRadius: "9999px" }} />
          )}
        </div>
      )}
    </div>
  );
}

function ActivityStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold leading-none" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
