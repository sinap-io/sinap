"use client";

import { useState, useTransition, useMemo } from "react";
import type { ActorList, ActorDetail, VinculadorItem } from "@/lib/types";
import { crearCaso } from "@/app/vinculador/casos/actions";

export default function NuevoCasoClient({
  actors,
  actorDetails,
  vinculadores,
}: {
  actors: ActorList[];
  actorDetails: ActorDetail[];
  vinculadores: VinculadorItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [demandanteId, setDemandanteId]   = useState("");
  const [necesidadId, setNecesidadId]     = useState("");
  const [vinculadorId, setVinculadorId]   = useState("");
  const [oferenteId, setOferenteId]       = useState("");
  const [capacidadId, setCapacidadId]     = useState("");
  const [notas, setNotas]                 = useState("");

  // Necesidades del demandante seleccionado
  const necesidades = useMemo(() => {
    if (!demandanteId) return [];
    const detail = actorDetails.find((d) => d.id === Number(demandanteId));
    return detail?.necesidades ?? [];
  }, [demandanteId, actorDetails]);

  // Capacidades del oferente seleccionado
  const capacidades = useMemo(() => {
    if (!oferenteId) return [];
    const detail = actorDetails.find((d) => d.id === Number(oferenteId));
    return detail?.servicios ?? [];
  }, [oferenteId, actorDetails]);

  // Resetear necesidad/capacidad al cambiar actores
  function handleDemandanteChange(v: string) {
    setDemandanteId(v);
    setNecesidadId("");
  }
  function handleOferenteChange(v: string) {
    setOferenteId(v);
    setCapacidadId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!demandanteId || !necesidadId || !vinculadorId) return;
    setErrorMsg("");

    startTransition(async () => {
      const res = await crearCaso({
        actor_demandante_id: Number(demandanteId),
        necesidad_id:        Number(necesidadId),
        vinculador_id:       Number(vinculadorId),
        actor_oferente_id:   oferenteId ? Number(oferenteId) : null,
        capacidad_id:        capacidadId ? Number(capacidadId) : null,
        notas:               notas || null,
      });
      if (res && !res.ok) setErrorMsg(res.message);
    });
  }

  const selectClass = `w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)]
    px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]
    disabled:opacity-50`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección requerida */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Datos requeridos
        </p>

        {/* Demandante */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            Actor demandante *
          </label>
          <select
            required
            value={demandanteId}
            onChange={(e) => handleDemandanteChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Seleccioná un actor...</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        {/* Necesidad */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            Necesidad específica *
          </label>
          <select
            required
            value={necesidadId}
            onChange={(e) => setNecesidadId(e.target.value)}
            disabled={!demandanteId}
            className={selectClass}
          >
            <option value="">
              {demandanteId
                ? necesidades.length === 0
                  ? "Este actor no tiene necesidades registradas"
                  : "Seleccioná una necesidad..."
                : "Primero seleccioná un actor demandante"}
            </option>
            {necesidades.map((n) => (
              <option key={n.id} value={n.id}>
                {n.tipo_servicio} · urgencia: {n.urgencia}
              </option>
            ))}
          </select>
        </div>

        {/* Vinculador */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            Vinculador asignado *
          </label>
          {vinculadores.length === 0 ? (
            <p className="text-sm text-[#f97316]">
              No hay vinculadores registrados. Creá uno desde la sección de operadores.
            </p>
          ) : (
            <select
              required
              value={vinculadorId}
              onChange={(e) => setVinculadorId(e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccioná un vinculador...</option>
              {vinculadores.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Sección opcional */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Datos opcionales (podés completar después)
        </p>

        {/* Oferente */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            Actor oferente
          </label>
          <select
            value={oferenteId}
            onChange={(e) => handleOferenteChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Sin asignar por ahora</option>
            {actors
              .filter((a) => a.id !== Number(demandanteId))
              .map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
          </select>
        </div>

        {/* Capacidad */}
        {oferenteId && (
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Capacidad específica del oferente
            </label>
            <select
              value={capacidadId}
              onChange={(e) => setCapacidadId(e.target.value)}
              className={selectClass}
            >
              <option value="">Sin especificar</option>
              {capacidades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo_servicio} · {c.disponibilidad}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
            Notas internas
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Contexto del caso, cómo se detectó, próximos pasos..."
            className="w-full rounded-lg border border-[var(--border)] bg-white
                       px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] resize-none
                       focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg border border-[#ef444444] bg-[#ef444411] px-4 py-3">
          <p className="text-sm text-[#ef4444]">{errorMsg}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || !demandanteId || !necesidadId || !vinculadorId}
          className="px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-[var(--accent)]
                     hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isPending ? "Abriendo caso…" : "Abrir caso"}
        </button>
        <a href="/vinculador" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  );
}
