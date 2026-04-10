"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Badge from "@/components/Badge";
import { TIPO_ACTOR_LABEL, TIPO_ACTOR_COLOR } from "@/lib/labels";
import { editarEtapaActor } from "@/app/actors/actions";
import type { ActorDetail } from "@/lib/types";

const ETAPAS = ["spinoff", "seed", "growth", "consolidada", "publica"];
const ETAPA_LABEL: Record<string, string> = {
  spinoff:     "Spinoff",
  seed:        "Seed",
  growth:      "Growth",
  consolidada: "Consolidada",
  publica:     "Pública",
};

const PUEDE_EDITAR = ["admin", "manager", "directivo", "vinculador"];

export default function ActorHeader({ actor }: { actor: ActorDetail }) {
  const { data: session } = useSession();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  const puedeEditar = PUEDE_EDITAR.includes(rol);

  const [isPending, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const [etapaEdit, setEtapaEdit] = useState(actor.etapa ?? "");
  const [error, setError] = useState("");

  const color = TIPO_ACTOR_COLOR[actor.tipo] ?? "#6b7280";
  const tipoLabel = TIPO_ACTOR_LABEL[actor.tipo] ?? actor.tipo;

  function handleGuardar() {
    if (!etapaEdit) return;
    setError("");
    startTransition(async () => {
      const res = await editarEtapaActor(actor.id, etapaEdit);
      if (res.ok) {
        setEditando(false);
      } else {
        setError((res as { ok: false; message: string }).message);
      }
    });
  }

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
      style={{ borderLeftColor: color, borderLeftWidth: "4px" }}
    >
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <h1 className="text-2xl font-bold text-[var(--text)] flex-1">{actor.nombre}</h1>
        <Badge label={tipoLabel} color={color} />
      </div>

      {/* Etapa — editable para roles con permiso */}
      <div className="flex items-center gap-3 mb-4">
        {!editando ? (
          <>
            {actor.etapa && (
              <Badge label={ETAPA_LABEL[actor.etapa] ?? actor.etapa} color="#6b7280" />
            )}
            {puedeEditar && (
              <button
                onClick={() => { setEditando(true); setEtapaEdit(actor.etapa ?? ""); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title="Cambiar etapa"
              >
                {actor.etapa ? "✏ Cambiar etapa" : "✏ Asignar etapa"}
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={etapaEdit}
              onChange={(e) => setEtapaEdit(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                         text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">Sin etapa</option>
              {ETAPAS.map((e) => (
                <option key={e} value={e}>{ETAPA_LABEL[e]}</option>
              ))}
            </select>
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[var(--accent)]
                         hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => { setEditando(false); setError(""); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#ef4444] mb-3">{error}</p>
      )}

      {actor.descripcion && (
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">{actor.descripcion}</p>
      )}

      <div className="flex flex-wrap gap-6 pt-4 border-t border-[var(--border)]">
        {actor.sitio_web && (
          <a
            href={actor.sitio_web}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Sitio web →
          </a>
        )}
        {actor.certificaciones.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-[var(--text-muted)]">Certificaciones:</span>
            {actor.certificaciones.map((c) => (
              <Badge key={c} label={c} color="#22c55e" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
