"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import type { IniciativaDetail, ActorList } from "@/lib/types";
import {
  ESTADO_INICIATIVA_LABEL,
  ESTADO_INICIATIVA_COLOR,
  TIPO_INICIATIVA_LABEL,
  TIPO_INICIATIVA_COLOR,
  TIPO_HITO_LABEL,
  TIPO_HITO_COLOR,
  ROL_ACTOR_LABEL,
  SERVICIO_LABEL,
  TIPO_INSTRUMENTO_LABEL,
} from "@/lib/labels";
import {
  cambiarEstado,
  agregarActor,
  quitarActor,
  agregarHito,
  editarNotas,
  editarTituloDescripcion,
} from "@/app/iniciativas/actions";
import BuscadorIniciativa from "./BuscadorIniciativa";

const ESTADOS   = ["abierta", "en_curso", "concretada", "cerrada", "postergada"];
const ROLES     = ["lider", "demandante", "oferente", "miembro", "candidato", "financiador"];
const TIPOS_HITO = [
  "contacto_establecido", "reunion_realizada", "acuerdo_alcanzado",
  "convenio_firmado", "proyecto_iniciado", "financiamiento_obtenido", "otro",
];

export default function IniciativaDetailClient({
  iniciativa,
  actors,
}: {
  iniciativa: IniciativaDetail;
  actors: ActorList[];
}) {
  const { data: session } = useSession();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  const puedeGestionar = ["admin", "manager", "directivo", "vinculador"].includes(rol);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg]      = useState("");

  // ── Editar título/descripción ────────────────────────────────
  const [showEditForm, setShowEditForm] = useState(false);
  const [tituloEdit, setTituloEdit]     = useState(iniciativa.titulo);
  const [descEdit,   setDescEdit]       = useState(iniciativa.descripcion ?? "");

  // ── Notas form ──────────────────────────────────────────────
  const [showNotasForm, setShowNotasForm] = useState(false);
  const [notasEdit, setNotasEdit] = useState(iniciativa.notas ?? "");

  // ── Actor form ──────────────────────────────────────────────
  const [showActorForm, setShowActorForm] = useState(false);
  const [actorId,       setActorId]       = useState("");
  const [actorRol,      setActorRol]      = useState("lider");
  const [actorReferente,setActorReferente]= useState("");

  // ── Hito form ───────────────────────────────────────────────
  const [showHitoForm, setShowHitoForm] = useState(false);
  const [hitoTipo,     setHitoTipo]     = useState("contacto_establecido");
  const [hitoDesc,     setHitoDesc]     = useState("");
  const [hitoFecha,    setHitoFecha]    = useState(new Date().toISOString().slice(0, 10));
  const [hitoEvidencia,setHitoEvidencia]= useState("");

  function run(fn: () => Promise<{ ok: boolean; message?: string } | { ok: true }>) {
    setErrorMsg("");
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setErrorMsg((res as { ok: false; message: string }).message);
    });
  }

  function handleEstado(e: string) {
    if (e === iniciativa.estado) return;
    run(() => cambiarEstado(iniciativa.id, e));
  }

  function handleEditSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!tituloEdit.trim()) return;
    run(async () => {
      const res = await editarTituloDescripcion(iniciativa.id, tituloEdit.trim(), descEdit || null);
      if (res.ok) setShowEditForm(false);
      return res;
    });
  }

  function handleNotasSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    run(async () => {
      const res = await editarNotas(iniciativa.id, notasEdit || null);
      if (res.ok) setShowNotasForm(false);
      return res;
    });
  }

  function handleActorSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!actorId) return;
    run(async () => {
      const res = await agregarActor(iniciativa.id, Number(actorId), actorRol, actorReferente || null);
      if (res.ok) { setShowActorForm(false); setActorId(""); setActorRol("lider"); setActorReferente(""); }
      return res;
    });
  }

  function handleQuitarActor(aid: number, rol: string) {
    run(() => quitarActor(iniciativa.id, aid, rol));
  }

  function handleHitoSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    run(async () => {
      const res = await agregarHito(iniciativa.id, {
        tipo:          hitoTipo,
        descripcion:   hitoDesc || null,
        fecha:         hitoFecha,
        evidencia_url: hitoEvidencia || null,
      });
      if (res.ok) {
        setShowHitoForm(false);
        setHitoTipo("contacto_establecido"); setHitoDesc("");
        setHitoFecha(new Date().toISOString().slice(0, 10)); setHitoEvidencia("");
      }
      return res;
    });
  }

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
    focus:outline-none focus:border-[var(--accent)]`;

  const sectionTitle = "text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3";

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-3">
        {!showEditForm ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${TIPO_INICIATIVA_COLOR[iniciativa.tipo] ?? "#6b7280"}20`, color: TIPO_INICIATIVA_COLOR[iniciativa.tipo] ?? "#6b7280" }}
              >
                {TIPO_INICIATIVA_LABEL[iniciativa.tipo] ?? iniciativa.tipo}
              </span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{ borderColor: ESTADO_INICIATIVA_COLOR[iniciativa.estado] ?? "#6b7280", color: ESTADO_INICIATIVA_COLOR[iniciativa.estado] ?? "#6b7280" }}
              >
                {ESTADO_INICIATIVA_LABEL[iniciativa.estado] ?? iniciativa.estado}
              </span>
              {puedeGestionar && (
                <button
                  onClick={() => { setShowEditForm(true); setTituloEdit(iniciativa.titulo); setDescEdit(iniciativa.descripcion ?? ""); }}
                  className="ml-auto text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  title="Editar título y descripción"
                >
                  ✏ Editar
                </button>
              )}
            </div>
            <h1 className="text-xl font-bold text-[var(--text)]">{iniciativa.titulo}</h1>
            {iniciativa.descripcion && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{iniciativa.descripcion}</p>
            )}
            <div className="flex gap-6 pt-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">{iniciativa.actores.length}</div>
                <div className="text-xs text-[var(--text-muted)]">actores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">{iniciativa.hitos.length}</div>
                <div className="text-xs text-[var(--text-muted)]">hitos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">
                  {iniciativa.necesidades.length + iniciativa.capacidades.length + iniciativa.instrumentos.length}
                </div>
                <div className="text-xs text-[var(--text-muted)]">vínculos</div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Título *</label>
              <input
                type="text"
                required
                value={tituloEdit}
                onChange={(e) => setTituloEdit(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Descripción</label>
              <textarea
                value={descEdit}
                onChange={(e) => setDescEdit(e.target.value)}
                rows={3}
                placeholder="Descripción de la iniciativa..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !tituloEdit.trim()}
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {isPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Cambiar estado ──────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <p className={sectionTitle}>Estado</p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => {
            const active = e === iniciativa.estado;
            const color  = ESTADO_INICIATIVA_COLOR[e];
            return (
              <button
                key={e}
                onClick={() => puedeGestionar && handleEstado(e)}
                disabled={isPending || !puedeGestionar}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={active ? { background: color, borderColor: color, color: "white" }
                              : { background: "transparent", borderColor: color, color }}
                title={!puedeGestionar ? "No tenés permiso para cambiar el estado" : undefined}
              >
                {ESTADO_INICIATIVA_LABEL[e]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error global ─────────────────────────────────────── */}
      {errorMsg && (
        <div className="rounded-lg border border-[#ef444444] bg-[#ef444411] px-4 py-3">
          <p className="text-sm text-[#ef4444]">{errorMsg}</p>
        </div>
      )}

      {/* ── Buscador ─────────────────────────────────────────── */}
      {puedeGestionar && (
        <BuscadorIniciativa tituloIniciativa={iniciativa.titulo} />
      )}

      {/* ── Actores ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <p className={sectionTitle + " mb-0"}>Actores participantes</p>
          {puedeGestionar && (
            <button
              onClick={() => setShowActorForm((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)]
                         text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
            >
              {showActorForm ? "Cancelar" : "+ Agregar actor"}
            </button>
          )}
        </div>

        {showActorForm && (
          <form onSubmit={handleActorSubmit} className="mb-4 space-y-2">
            <div className="flex gap-3 flex-wrap">
              <select
                value={actorId}
                onChange={(e) => setActorId(e.target.value)}
                required
                className={`${inputCls} flex-1 min-w-[160px]`}
              >
                <option value="">Seleccioná un actor...</option>
                {actors.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              <select
                value={actorRol}
                onChange={(e) => setActorRol(e.target.value)}
                className={`${inputCls} w-40`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROL_ACTOR_LABEL[r]}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={actorReferente}
                onChange={(e) => setActorReferente(e.target.value)}
                placeholder="Referente (opcional) — nombre de la persona que participa"
                className={`${inputCls} flex-1`}
              />
              <button
                type="submit"
                disabled={isPending || !actorId}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Agregar
              </button>
            </div>
          </form>
        )}

        {iniciativa.actores.length === 0 && !iniciativa.vinculador_nombre ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            No hay actores asignados aún.
          </p>
        ) : (
          <div className="space-y-2">
            {iniciativa.vinculador_nombre && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{iniciativa.vinculador_nombre}</p>
                  <p className="text-xs text-[var(--text-muted)]">Clúster de Biotecnología</p>
                </div>
                <span className="text-xs font-medium text-[#0d9488] bg-[#0d9488]/10 px-2.5 py-1 rounded-full">
                  Vinculador
                </span>
              </div>
            )}
            {iniciativa.actores.map((a) => (
              <div
                key={`${a.actor_id}-${a.rol}`}
                className="flex items-center justify-between gap-3 rounded-lg
                           border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{a.actor_nombre}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {a.actor_tipo}{a.referente ? ` · ${a.referente}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10
                                   px-2.5 py-1 rounded-full">
                    {ROL_ACTOR_LABEL[a.rol] ?? a.rol}
                  </span>
                  {puedeGestionar && (
                    <button
                      onClick={() => handleQuitarActor(a.actor_id, a.rol)}
                      disabled={isPending}
                      className="text-xs text-[var(--text-muted)] hover:text-[#ef4444]
                                 disabled:opacity-40 transition-colors"
                      title="Quitar actor"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Vínculos (necesidades, capacidades, instrumentos) ── */}
      {(iniciativa.necesidades.length > 0 || iniciativa.capacidades.length > 0 || iniciativa.instrumentos.length > 0) && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-4">
          <p className={sectionTitle}>Elementos vinculados</p>

          {iniciativa.necesidades.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Demandas</p>
              <div className="space-y-1.5">
                {iniciativa.necesidades.map((n) => (
                  <div key={n.necesidad_id}
                    className="flex justify-between items-center rounded-lg border border-[var(--border)] px-4 py-2.5">
                    <span className="text-sm text-[var(--text)]">
                      {SERVICIO_LABEL[n.tipo_servicio] ?? n.tipo_servicio}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{n.actor_nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {iniciativa.capacidades.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Capacidades</p>
              <div className="space-y-1.5">
                {iniciativa.capacidades.map((c) => (
                  <div key={c.capacidad_id}
                    className="flex justify-between items-center rounded-lg border border-[var(--border)] px-4 py-2.5">
                    <span className="text-sm text-[var(--text)]">
                      {SERVICIO_LABEL[c.tipo_servicio] ?? c.tipo_servicio}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{c.actor_nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {iniciativa.instrumentos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Instrumentos</p>
              <div className="space-y-1.5">
                {iniciativa.instrumentos.map((i) => (
                  <div key={i.instrumento_id}
                    className="flex justify-between items-center rounded-lg border border-[var(--border)] px-4 py-2.5">
                    <span className="text-sm text-[var(--text)]">{i.nombre}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {TIPO_INSTRUMENTO_LABEL[i.tipo] ?? i.tipo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Hitos ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wide">
            Hitos registrados
          </h2>
          {puedeGestionar && <button
            onClick={() => setShowHitoForm((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)]
                       text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
          >
            {showHitoForm ? "Cancelar" : "+ Registrar hito"}
          </button>}
        </div>

        {showHitoForm && (
          <form
            onSubmit={handleHitoSubmit}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Tipo *</label>
                <select value={hitoTipo} onChange={(e) => setHitoTipo(e.target.value)} className={inputCls}>
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
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Descripción</label>
              <textarea
                value={hitoDesc}
                onChange={(e) => setHitoDesc(e.target.value)}
                rows={2}
                placeholder="Descripción opcional..."
                className={`${inputCls} resize-none`}
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
                className={inputCls}
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

        {iniciativa.hitos.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">
            No hay hitos registrados aún.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
            <div className="space-y-4">
              {iniciativa.hitos.map((hito) => {
                const color = TIPO_HITO_COLOR[hito.tipo] ?? "#6b7280";
                return (
                  <div key={hito.id} className="relative flex gap-4 pl-10">
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

        {/* Notas internas */}
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-amber-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Notas internas
            </p>
            <button
              onClick={() => { setShowNotasForm((v) => !v); setNotasEdit(iniciativa.notas ?? ""); }}
              className="text-xs text-amber-600 hover:text-amber-800 underline"
            >
              {showNotasForm ? "Cancelar" : "Editar"}
            </button>
          </div>
          {showNotasForm ? (
            <form onSubmit={handleNotasSubmit} className="space-y-2">
              <textarea
                value={notasEdit}
                onChange={(e) => setNotasEdit(e.target.value)}
                rows={3}
                placeholder="Contexto relevante, próximos pasos, información de contacto..."
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm
                           text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-600
                             hover:bg-amber-700 disabled:opacity-40 transition-colors"
                >
                  {isPending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-amber-900 leading-relaxed">
              {iniciativa.notas || <span className="italic text-amber-500">Sin notas aún.</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
