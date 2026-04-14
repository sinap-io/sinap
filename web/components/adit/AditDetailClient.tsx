"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { VinculadorDetail, ZonaOut } from "@/lib/types";
import { editarVinculador } from "@/app/adit/actions";
import {
  TIPO_INICIATIVA_LABEL, TIPO_INICIATIVA_COLOR,
  ESTADO_INICIATIVA_LABEL, ESTADO_INICIATIVA_COLOR,
  TIPO_HITO_LABEL, TIPO_HITO_COLOR,
  ESTADO_PROYECTO_LABEL, ESTADO_PROYECTO_COLOR,
  TRL_COLOR,
} from "@/lib/labels";

interface Props {
  vinculador: VinculadorDetail;
  zonas: ZonaOut[];
  canManage: boolean;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AditDetailClient({ vinculador: v, zonas, canManage }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingZona, setEditingZona] = useState(false);
  const [zonaId, setZonaId] = useState<string>(v.zona_id?.toString() ?? "");

  const totalActividades =
    v.iniciativas.length + v.hitos.length + v.proyectos.length + v.trl_changes.length;

  function handleZonaSave() {
    startTransition(async () => {
      await editarVinculador(v.id, { zona_id: zonaId ? parseInt(zonaId) : undefined });
      setEditingZona(false);
    });
  }

  function handleToggleActivo() {
    startTransition(async () => {
      await editarVinculador(v.id, { activo: !v.activo });
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-[var(--text)]">{v.nombre}</h1>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: v.activo ? "#22c55e20" : "#6b728020",
                  color: v.activo ? "#16a34a" : "#6b7280",
                }}
              >
                {v.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            {v.email && (
              <p className="text-sm text-[var(--text-muted)]">{v.email}</p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Vinculador desde {fmt(v.creado_en)}
            </p>
          </div>

          {canManage && (
            <button
              onClick={handleToggleActivo}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
            >
              {v.activo ? "Desactivar" : "Activar"}
            </button>
          )}
        </div>

        {/* Zona */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">Zona:</span>
          {editingZona ? (
            <div className="flex items-center gap-2">
              <select
                value={zonaId}
                onChange={(e) => setZonaId(e.target.value)}
                className="text-sm rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] px-2 py-0.5"
              >
                <option value="">Sin zona</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
              <button
                onClick={handleZonaSave}
                disabled={isPending}
                className="text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-white disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingZona(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="text-sm px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#0d948820", color: "#0d9488" }}
              >
                {v.zona_nombre ?? "Sin zona"}
              </span>
              {canManage && (
                <button
                  onClick={() => setEditingZona(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  ✏ Cambiar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resumen de actividad */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatMini label="Iniciativas" value={v.iniciativas.length} color="#3b82f6" />
          <StatMini label="Hitos" value={v.hitos.length} color="#a855f7" />
          <StatMini label="Proyectos" value={v.proyectos.length} color="#22c55e" />
          <StatMini label="Cambios TRL" value={v.trl_changes.length} color="#0d9488" />
        </div>
      </div>

      {totalActividades === 0 && (
        <p className="text-[var(--text-muted)] text-sm text-center py-8">
          Este vinculador aún no tiene actividad registrada.
        </p>
      )}

      {/* Iniciativas */}
      {v.iniciativas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
            Iniciativas creadas
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({v.iniciativas.length})</span>
          </h2>
          <div className="space-y-2">
            {v.iniciativas.map((i) => {
              const tipoColor = TIPO_INICIATIVA_COLOR[i.tipo] ?? "#6b7280";
              const estColor = ESTADO_INICIATIVA_COLOR[i.estado] ?? "#6b7280";
              return (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${tipoColor}20`, color: tipoColor }}
                    >
                      {TIPO_INICIATIVA_LABEL[i.tipo] ?? i.tipo}
                    </span>
                    <Link
                      href={`/iniciativas/${i.id}`}
                      className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] truncate transition-colors"
                    >
                      {i.titulo}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${estColor}20`, color: estColor }}
                    >
                      {ESTADO_INICIATIVA_LABEL[i.estado] ?? i.estado}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{fmt(i.creado_en)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hitos */}
      {v.hitos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
            Hitos registrados
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({v.hitos.length})</span>
          </h2>
          <div className="space-y-2">
            {v.hitos.map((h) => {
              const hColor = TIPO_HITO_COLOR[h.tipo] ?? "#6b7280";
              return (
                <div
                  key={h.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                  style={{ borderLeftColor: hColor, borderLeftWidth: "3px" }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span className="text-xs font-medium" style={{ color: hColor }}>
                        {TIPO_HITO_LABEL[h.tipo] ?? h.tipo}
                      </span>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        en{" "}
                        <span className="text-[var(--text)]">{h.iniciativa_titulo}</span>
                      </p>
                      {h.descripcion && (
                        <p className="text-sm text-[var(--text)] mt-1">{h.descripcion}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[var(--text-muted)]">{fmt(h.fecha)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Proyectos */}
      {v.proyectos.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
            Proyectos creados
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({v.proyectos.length})</span>
          </h2>
          <div className="space-y-2">
            {v.proyectos.map((p) => {
              const estColor = ESTADO_PROYECTO_COLOR[p.estado] ?? "#6b7280";
              const trlColor = p.trl ? TRL_COLOR[p.trl] : "#6b7280";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {p.trl && (
                      <span
                        className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${trlColor}20`, color: trlColor }}
                      >
                        TRL {p.trl}
                      </span>
                    )}
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] truncate transition-colors"
                    >
                      {p.titulo}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${estColor}20`, color: estColor }}
                    >
                      {ESTADO_PROYECTO_LABEL[p.estado] ?? p.estado}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{fmt(p.creado_en)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cambios de TRL */}
      {v.trl_changes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
            Actualizaciones de TRL
            <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">({v.trl_changes.length})</span>
          </h2>
          <div className="space-y-2">
            {v.trl_changes.map((t) => {
              const color = t.trl_despues ? TRL_COLOR[t.trl_despues] : "#0d9488";
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-[var(--text-muted)] text-xs">
                        {t.trl_antes !== null ? `TRL ${t.trl_antes}` : "—"}
                      </span>
                      <span className="text-[var(--text-muted)]">→</span>
                      <span
                        className="font-bold text-xs px-1.5 py-0.5 rounded"
                        style={{ background: `${color}20`, color }}
                      >
                        TRL {t.trl_despues}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--text)] truncate">{t.proyecto_titulo}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0">{fmt(t.creado_en)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-3 text-center">
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
    </div>
  );
}
