"use client";

import { useState, useTransition } from "react";
import type { VinculadorItem } from "@/lib/types";
import {
  TIPO_INICIATIVA_LABEL,
  TIPO_INICIATIVA_COLOR,
  TIPO_INICIATIVA_DESC,
} from "@/lib/labels";
import { crearIniciativa } from "@/app/iniciativas/actions";

const TIPOS = Object.keys(TIPO_INICIATIVA_LABEL) as Array<keyof typeof TIPO_INICIATIVA_LABEL>;

export default function NuevaIniciativaClient({
  vinculadores,
}: {
  vinculadores: VinculadorItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg]      = useState("");

  const [tipo,         setTipo]         = useState("");
  const [titulo,       setTitulo]       = useState("");
  const [descripcion,  setDescripcion]  = useState("");
  const [notas,        setNotas]        = useState("");
  const [vinculadorId, setVinculadorId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo) { setErrorMsg("Seleccioná un tipo de iniciativa."); return; }
    if (!titulo.trim()) { setErrorMsg("El título es obligatorio."); return; }
    setErrorMsg("");
    startTransition(async () => {
      const res = await crearIniciativa({
        tipo,
        titulo:       titulo.trim(),
        descripcion:  descripcion.trim() || null,
        notas:        notas.trim() || null,
        vinculador_id: vinculadorId ? Number(vinculadorId) : null,
      });
      if (res && !res.ok) setErrorMsg(res.message);
    });
  }

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
    focus:outline-none focus:border-[var(--accent)]`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selección de tipo */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
          Tipo de iniciativa *
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIPOS.map((t) => {
            const color   = TIPO_INICIATIVA_COLOR[t];
            const active  = tipo === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className="rounded-xl border-2 p-4 text-left transition-all"
                style={active ? {
                  borderColor: color,
                  background: `${color}15`,
                } : {
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: active ? color : "var(--text)" }}>
                  {TIPO_INICIATIVA_LABEL[t]}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-tight">
                  {TIPO_INICIATIVA_DESC[t]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos del formulario */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">Título *</label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Consorcio biosensores para diagnóstico rápido"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Descripción detallada de la iniciativa..."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">Notas internas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Notas del vinculador, contexto, próximos pasos..."
            className={`${inputCls} resize-none`}
          />
        </div>

        {vinculadores.length > 0 && (
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Vinculador asignado (opcional)
            </label>
            <select
              value={vinculadorId}
              onChange={(e) => setVinculadorId(e.target.value)}
              className={inputCls}
            >
              <option value="">Sin asignar</option>
              {vinculadores.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-[#ef444444] bg-[#ef444411] px-4 py-3">
          <p className="text-sm text-[#ef4444]">{errorMsg}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !tipo}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                     hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isPending ? "Creando…" : "Crear iniciativa"}
        </button>
      </div>
    </form>
  );
}
