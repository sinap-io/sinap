"use client";

import Link from "next/link";
import type { VinculadorList, ActividadResumen, ZonaOut } from "@/lib/types";

interface Props {
  vinculadores: VinculadorList[];
  resumen: ActividadResumen;
  zonas: ZonaOut[];
  rol: string;
}

const CAN_MANAGE = ["admin", "manager"];

export default function AditClient({ vinculadores, resumen, zonas, rol }: Props) {
  const canManage = CAN_MANAGE.includes(rol);

  return (
    <div className="space-y-8">
      {/* Métricas globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Vinculadores activos" value={resumen.vinculadores_activos} color="#0d9488" />
        <MetricCard label="Iniciativas" value={resumen.total_iniciativas} color="#3b82f6" />
        <MetricCard label="Hitos" value={resumen.total_hitos} color="#a855f7" />
        <MetricCard label="Proyectos" value={resumen.total_proyectos} color="#22c55e" />
      </div>

      {/* Lista de vinculadores */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          Vinculadores
          <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
            ({vinculadores.length})
          </span>
        </h2>

        {vinculadores.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No hay vinculadores registrados.</p>
        ) : (
          <div className="space-y-3">
            {vinculadores.map((v) => (
              <VinculadorCard key={v.id} vinculador={v} zonas={zonas} canManage={canManage} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  );
}

function VinculadorCard({
  vinculador: v,
  zonas,
  canManage,
}: {
  vinculador: VinculadorList;
  zonas: ZonaOut[];
  canManage: boolean;
}) {
  const totalActividades = v.total_iniciativas + v.total_hitos + v.total_proyectos;

  return (
    <div
      className={`rounded-lg border bg-[var(--bg-card)] p-4 transition-shadow hover:shadow-sm ${
        v.activo ? "border-[var(--border)]" : "border-dashed border-[var(--border)] opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              href={`/adit/${v.id}`}
              className="font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors"
            >
              {v.nombre}
            </Link>
            {!v.activo && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Inactivo
              </span>
            )}
            {v.zona_nombre && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#0d948820", color: "#0d9488" }}>
                {v.zona_nombre}
              </span>
            )}
          </div>
          {v.email && (
            <p className="text-xs text-[var(--text-muted)]">{v.email}</p>
          )}
        </div>

        {/* Actividad */}
        <div className="flex items-center gap-4 shrink-0">
          <ActivityStat label="Iniciativas" value={v.total_iniciativas} color="#3b82f6" />
          <ActivityStat label="Hitos" value={v.total_hitos} color="#a855f7" />
          <ActivityStat label="Proyectos" value={v.total_proyectos} color="#22c55e" />
          <Link
            href={`/adit/${v.id}`}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Ver →
          </Link>
        </div>
      </div>

      {/* Barra de actividad */}
      {totalActividades > 0 && (
        <div className="mt-3 flex gap-1 h-1.5 rounded-full overflow-hidden">
          {v.total_iniciativas > 0 && (
            <div
              className="rounded-full"
              style={{
                flex: v.total_iniciativas,
                background: "#3b82f6",
              }}
            />
          )}
          {v.total_hitos > 0 && (
            <div
              className="rounded-full"
              style={{
                flex: v.total_hitos,
                background: "#a855f7",
              }}
            />
          )}
          {v.total_proyectos > 0 && (
            <div
              className="rounded-full"
              style={{
                flex: v.total_proyectos,
                background: "#22c55e",
              }}
            />
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
