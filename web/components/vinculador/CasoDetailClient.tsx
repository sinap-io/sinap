"use client";

import { useState, useTransition } from "react";
import type { CasoDetail } from "@/lib/types";
import {
  ESTADO_CASO_LABEL,
  ESTADO_CASO_COLOR,
  TIPO_HITO_LABEL,
  TIPO_HITO_COLOR,
} from "@/lib/labels";
import { cambiarEstado, agregarHito } from "@/app/vinculador/casos/actions";

const ESTADOS_POSIBLES = ["abierto", "en_gestion", "vinculado", "cerrado", "cancelado"];
const TIPOS_HITO = [
  "contacto_establecido",
  "reunion_realizada",
  "acuerdo_alcanzado",
  "convenio_firmado",
  "proyecto_iniciado",
  "financiamiento_obtenido",
  "otro",
];

export default function CasoDetailClient({ caso }: { caso: CasoDetail }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [showHitoForm, setShowHitoForm] = useState(false);

  // Form hito
  const [hitoTipo, setHitoTipo]           = useState("contacto_establecido");
  const [hitoDesc, setHitoDesc]           = useState("");
  const [hitoFecha, setHitoFecha]         = useState(new Date().toISOString().slice(0, 10));
  const [hitoEvidencia, setHitoEvidencia] = useState("");

  function handleEstado(nuevoEstado: string) {
    if (nuevoEstado === caso.estado) return;
    setErrorMsg("");
    startTransition(async () => {
      const res = await cambiarEstado(caso.id, nuevoEstado);
      if (!res.ok) setErrorMsg(res.message);
    });
  }

  function handleHitoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const res = await agregarHito(caso.id, {
        tipo:          hitoTipo,
        descripcion:   hitoDesc || null,
        fecha:         hitoFecha,
        evidencia_url: hitoEvidencia || null,
      });
      if (res.ok) {
        setShowHitoForm(false);
        setHitoTipo("contacto_establecido");
        setHitoDesc("");
        setHitoFecha(new Date().toISOString().slice(0, 10));
        setHitoEvidencia("");
      } else {
        setErrorMsg(res.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Cambiar estado */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">
          Cambiar estado del caso
        </p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_POSIBLES.map((e) => {
            const active = e === caso.estado;
            const color  = ESTADO_CASO_COLOR[e];
            return (
              <button
                key={e}
                onClick={() => handleEstado(e)}
                disabled={isPending}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={active ? {
                  background: color,
                  borderColor: color,
                  color: "white",
                } : {
                  background: "transparent",
                  borderColor: color,
                  color,
                }}
              >
                {ESTADO_CASO_LABEL[e]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-[#ef444444] bg-[#ef444411] px-4 py-3">
          <p className="text-sm text-[#ef4444]">{errorMsg}</p>
        </div>
      )}

      {/* Timeline de hitos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wide">
            Hitos registrados
          </h2>
          <button
            onClick={() => setShowHitoForm((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)]
                       text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white
                       transition-all"
          >
            {showHitoForm ? "Cancelar" : "+ Agregar hito"}
          </button>
        </div>

        {/* Formulario de hito */}
        {showHitoForm && (
          <form
            onSubmit={handleHitoSubmit}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Tipo de hito *</label>
                <select
                  value={hitoTipo}
                  onChange={(e) => setHitoTipo(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-white
                             px-3 py-2 text-sm text-[var(--text)]
                             focus:outline-none focus:border-[var(--accent)]"
                >
                  {TIPOS_HITO.map((t) => (
                    <option key={t} value={t}>{TIPO_HITO_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={hitoFecha}
                  onChange={(e) => setHitoFecha(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-white
                             px-3 py-2 text-sm text-[var(--text)]
                             focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Descripción</label>
              <textarea
                value={hitoDesc}
                onChange={(e) => setHitoDesc(e.target.value)}
                rows={2}
                placeholder="Descripción opcional del hito..."
                className="w-full rounded-lg border border-[var(--border)] bg-white
                           px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] resize-none
                           focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Evidencia (URL del documento, acta o convenio)
              </label>
              <input
                type="url"
                value={hitoEvidencia}
                onChange={(e) => setHitoEvidencia(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[var(--border)] bg-white
                           px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
                           focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {isPending ? "Guardando…" : "Registrar hito"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de hitos */}
        {caso.hitos.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">
            No hay hitos registrados aún.
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
            <div className="space-y-4">
              {caso.hitos.map((hito) => {
                const color = TIPO_HITO_COLOR[hito.tipo] ?? "#6b7280";
                return (
                  <div key={hito.id} className="relative flex gap-4 pl-10">
                    {/* Dot */}
                    <div
                      className="absolute left-2 top-1 w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: color }}
                    />
                    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${color}20`, color }}
                        >
                          {TIPO_HITO_LABEL[hito.tipo] ?? hito.tipo}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(hito.fecha + "T12:00:00").toLocaleDateString("es-AR", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </span>
                      </div>
                      {hito.descripcion && (
                        <p className="text-sm text-[var(--text)] mt-2 leading-relaxed">
                          {hito.descripcion}
                        </p>
                      )}
                      {hito.evidencia_url && (
                        <a
                          href={hito.evidencia_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-xs text-[var(--accent)] hover:underline"
                        >
                          Ver evidencia →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
