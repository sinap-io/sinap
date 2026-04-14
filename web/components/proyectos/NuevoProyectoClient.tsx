"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearProyecto } from "@/app/proyectos/actions";
import { AREA_LABEL, ESTADO_PROYECTO_LABEL, APOYO_LABEL, APOYO_COLOR } from "@/lib/labels";

interface IniciativaOption { id: number; titulo: string }

export default function NuevoProyectoClient({
  iniciativas,
}: {
  iniciativas: IniciativaOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo:        "",
    descripcion:   "",
    trl:           "" as string,
    area_tematica: "",
    estado:        "activo",
    iniciativa_id: "" as string,
  });
  const [apoyosSeleccionados, setApoyosSeleccionados] = useState<string[]>([]);

  function toggleApoyo(apoyo: string) {
    setApoyosSeleccionados((prev) =>
      prev.includes(apoyo) ? prev.filter((a) => a !== apoyo) : [...prev, apoyo]
    );
  }

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)]
    focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]`;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }

    startTransition(async () => {
      const result = await crearProyecto({
        titulo:          form.titulo.trim(),
        descripcion:     form.descripcion.trim() || undefined,
        trl:             form.trl ? Number(form.trl) : undefined,
        area_tematica:   form.area_tematica || undefined,
        estado:          form.estado,
        apoyos_buscados: apoyosSeleccionados,
        iniciativa_id:   form.iniciativa_id ? Number(form.iniciativa_id) : undefined,
      });
      if (result.ok) {
        router.push("/proyectos");
      } else {
        setError(result.error ?? "Error al crear el proyecto");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          placeholder="Ej: Biosensor para detección temprana de Citrus Greening"
          className={inputCls}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
          placeholder="¿Qué es y qué problema resuelve este proyecto?"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* TRL + Estado en fila */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            TRL actual
          </label>
          <select name="trl" value={form.trl} onChange={handleChange} className={inputCls}>
            <option value="">Sin TRL asignado</option>
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <option key={n} value={n}>TRL {n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Estado
          </label>
          <select name="estado" value={form.estado} onChange={handleChange} className={inputCls}>
            {Object.entries(ESTADO_PROYECTO_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ¿Qué busca el proyecto? */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          ¿Qué busca este proyecto?{" "}
          <span className="text-[var(--text-muted)] font-normal">(podés elegir varias)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(APOYO_LABEL).map(([k, v]) => {
            const activo = apoyosSeleccionados.includes(k);
            const color = APOYO_COLOR[k] ?? "#6b7280";
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleApoyo(k)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer hover:opacity-80 ${activo ? "shadow-sm" : "opacity-50"}`}
                style={activo
                  ? { background: `${color}20`, color, border: `1.5px solid ${color}` }
                  : { background: "#f1f5f9", color: "#94a3b8", border: "1.5px solid #e2e8f0" }
                }
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Área temática */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
          Área temática
        </label>
        <select name="area_tematica" value={form.area_tematica} onChange={handleChange} className={inputCls}>
          <option value="">Sin área asignada</option>
          {Object.entries(AREA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Iniciativa vinculada (opcional) */}
      {iniciativas.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Iniciativa vinculada <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
          </label>
          <select
            name="iniciativa_id"
            value={form.iniciativa_id}
            onChange={handleChange}
            className={inputCls}
          >
            <option value="">Sin iniciativa</option>
            {iniciativas.map((i) => (
              <option key={i.id} value={i.id}>{i.titulo}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                     hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Crear proyecto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg text-sm font-medium border border-[var(--border)]
                     text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
