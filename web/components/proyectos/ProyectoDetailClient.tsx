"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import type { ProyectoDetail } from "@/lib/types";
import {
  AREA_LABEL,
  ESTADO_PROYECTO_LABEL, ESTADO_PROYECTO_COLOR,
  TRL_COLOR, TRL_LABEL,
  TIPO_INSTRUMENTO_LABEL, TIPO_INSTRUMENTO_COLOR,
  APOYO_LABEL, APOYO_COLOR,
  TIPO_HITO_PROYECTO_LABEL, TIPO_HITO_PROYECTO_COLOR,
  PRIORIDAD_LABEL, PRIORIDAD_COLOR,
  ROL_ACTOR_PROYECTO_LABEL,
} from "@/lib/labels";
import {
  editarTRLProyecto,
  editarEstadoProyecto,
  editarCamposProyecto,
  editarApoyosProyecto,
  editarPrioridadProyecto,
  agregarActorProyecto,
  quitarActorProyecto,
  agregarInstrumentoProyecto,
  quitarInstrumentoProyecto,
  agregarHitoProyecto,
  quitarHitoProyecto,
} from "@/app/proyectos/actions";

const CAN_MANAGE = ["admin", "manager", "directivo", "vinculador"];
const TODOS_APOYOS = Object.keys(APOYO_LABEL);
const TODOS_TIPOS_HITO = Object.keys(TIPO_HITO_PROYECTO_LABEL);

interface ActorOption    { id: number; nombre: string }
interface InstrumentoOpt { id: number; nombre: string; tipo: string }
interface IniciativaOpt  { id: number; titulo: string }

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProyectoDetailClient({
  proyecto,
  rol,
  actoresDisponibles,
  instrumentosDisponibles,
  iniciativasDisponibles: _iniciativasDisponibles,
}: {
  proyecto: ProyectoDetail;
  rol: string;
  actoresDisponibles: ActorOption[];
  instrumentosDisponibles: InstrumentoOpt[];
  iniciativasDisponibles: IniciativaOpt[];
}) {
  const canManage = CAN_MANAGE.includes(rol);
  const [isPending, startTransition] = useTransition();
  const [isApoyosPending, startApoyosTransition] = useTransition();

  // ── Header ───────────────────────────────────────────────────
  const [editandoHeader, setEditandoHeader] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(proyecto.titulo);
  const [descEdit,   setDescEdit]   = useState(proyecto.descripcion ?? "");

  function guardarHeader() {
    startTransition(async () => {
      await editarCamposProyecto(proyecto.id, {
        titulo: tituloEdit.trim(),
        descripcion: descEdit.trim() || undefined,
      });
      setEditandoHeader(false);
    });
  }

  // ── TRL ──────────────────────────────────────────────────────
  const [trlEdit, setTrlEdit] = useState(false);
  const [trlVal,  setTrlVal]  = useState(proyecto.trl?.toString() ?? "");

  function guardarTRL() {
    const n = Number(trlVal);
    if (!trlVal || n < 1 || n > 9) return;
    startTransition(async () => {
      await editarTRLProyecto(proyecto.id, n);
      setTrlEdit(false);
    });
  }

  // ── Estado ───────────────────────────────────────────────────
  const [estadoEdit, setEstadoEdit]       = useState(proyecto.estado);
  const [editandoEstado, setEditandoEstado] = useState(false);

  function guardarEstado(nuevoEstado: string) {
    startTransition(async () => {
      await editarEstadoProyecto(proyecto.id, nuevoEstado);
      setEstadoEdit(nuevoEstado);
      setEditandoEstado(false);
    });
  }

  // ── Apoyos buscados (multi) ───────────────────────────────────
  const [apoyosActivos, setApoyosActivos] = useState<string[]>(proyecto.apoyos_buscados);

  // Sincronizar con el servidor cuando termina la transición
  // (proyecto.apoyos_buscados se actualiza después del revalidatePath)
  useEffect(() => {
    if (!isApoyosPending) {
      setApoyosActivos(proyecto.apoyos_buscados);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto.apoyos_buscados.join(","), isApoyosPending]);

  function toggleApoyo(apoyo: string) {
    if (!canManage || isApoyosPending) return;
    const nuevos = apoyosActivos.includes(apoyo)
      ? apoyosActivos.filter((a) => a !== apoyo)
      : [...apoyosActivos, apoyo];
    setApoyosActivos(nuevos);
    startApoyosTransition(async () => {
      await editarApoyosProyecto(proyecto.id, nuevos);
    });
  }

  // ── Actores ───────────────────────────────────────────────────
  const [actorSel, setActorSel] = useState("");
  const [rolActor, setRolActor] = useState("");
  const actoresIds     = proyecto.actores.map((a) => a.actor_id);
  const actoresFiltrados = actoresDisponibles.filter((a) => !actoresIds.includes(a.id));

  function agregarActor() {
    if (!actorSel) return;
    startTransition(async () => {
      await agregarActorProyecto(proyecto.id, Number(actorSel), rolActor || undefined);
      setActorSel(""); setRolActor("");
    });
  }

  // ── Instrumentos ─────────────────────────────────────────────
  const [instSel, setInstSel] = useState("");
  const instIds      = proyecto.instrumentos.map((i) => i.instrumento_id);
  const instFiltrados = instrumentosDisponibles.filter((i) => !instIds.includes(i.id));

  function agregarInstrumento() {
    if (!instSel) return;
    startTransition(async () => {
      await agregarInstrumentoProyecto(proyecto.id, Number(instSel));
      setInstSel("");
    });
  }

  // ── Prioridad ────────────────────────────────────────────────
  const [prioridadEdit, setPrioridadEdit] = useState(false);
  const [prioridadVal,  setPrioridadVal]  = useState<string>(
    proyecto.prioridad?.toString() ?? ""
  );

  function guardarPrioridad(val: string) {
    const n = val === "" ? null : Number(val);
    startTransition(async () => {
      await editarPrioridadProyecto(proyecto.id, n);
      setPrioridadVal(val);
      setPrioridadEdit(false);
    });
  }

  // ── Hitos ────────────────────────────────────────────────────
  const [hitoTipo,  setHitoTipo]  = useState("");
  const [hitoDesc,  setHitoDesc]  = useState("");
  const [hitoFecha, setHitoFecha] = useState(new Date().toISOString().split("T")[0]);
  const [hitoUrl,   setHitoUrl]   = useState("");
  const [addingHito, setAddingHito] = useState(false);

  function guardarHito() {
    if (!hitoTipo || !hitoFecha) return;
    startTransition(async () => {
      await agregarHitoProyecto(proyecto.id, {
        tipo: hitoTipo,
        descripcion: hitoDesc || undefined,
        fecha: hitoFecha,
        evidencia_url: hitoUrl || undefined,
      });
      setHitoTipo(""); setHitoDesc(""); setHitoUrl("");
      setHitoFecha(new Date().toISOString().split("T")[0]);
      setAddingHito(false);
    });
  }

  const trlActual  = proyecto.trl;
  const trlColor   = trlActual ? TRL_COLOR[trlActual] : "#94a3b8";
  const estadoColor = ESTADO_PROYECTO_COLOR[estadoEdit] ?? "#6b7280";

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]`;

  return (
    <div className="space-y-8">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
        {!editandoHeader ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-[var(--text)]">{proyecto.titulo}</h1>
              {canManage && (
                <button
                  onClick={() => setEditandoHeader(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors shrink-0"
                >
                  ✏ Editar
                </button>
              )}
            </div>

            {proyecto.descripcion && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{proyecto.descripcion}</p>
            )}

            {/* Badges: TRL + Estado + Área + Iniciativa */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* TRL */}
              {canManage ? (
                trlEdit ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={trlVal}
                      onChange={(e) => setTrlVal(e.target.value)}
                      className="text-xs rounded-lg border border-[var(--border)] px-2 py-1 bg-white"
                      autoFocus
                    >
                      <option value="">Sin TRL</option>
                      {[1,2,3,4,5,6,7,8,9].map((n) => (
                        <option key={n} value={n}>TRL {n} — {TRL_LABEL[n].split("—")[1]?.trim()}</option>
                      ))}
                    </select>
                    <button onClick={guardarTRL} disabled={isPending} className="text-xs text-[var(--accent)]">Guardar</button>
                    <button onClick={() => { setTrlEdit(false); setTrlVal(proyecto.trl?.toString() ?? ""); }} className="text-xs text-[var(--text-muted)]">Cancelar</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setTrlEdit(true)}
                    className="text-xs font-bold px-3 py-1 rounded-full hover:opacity-80 transition-opacity"
                    style={{ background: `${trlColor}20`, color: trlColor }}
                    title={trlActual ? TRL_LABEL[trlActual] : "Asignar TRL"}
                  >
                    {trlActual ? `TRL ${trlActual}` : "Sin TRL"} <span className="opacity-60">✏</span>
                  </button>
                )
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${trlColor}20`, color: trlColor }}>
                  {trlActual ? `TRL ${trlActual}` : "Sin TRL"}
                </span>
              )}

              {/* Estado */}
              {canManage ? (
                editandoEstado ? (
                  <select
                    value={estadoEdit}
                    onChange={(e) => guardarEstado(e.target.value)}
                    className="text-xs rounded-lg border border-[var(--border)] px-2 py-1 bg-white"
                    autoFocus onBlur={() => setEditandoEstado(false)}
                  >
                    {Object.entries(ESTADO_PROYECTO_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setEditandoEstado(true)}
                    className="text-xs font-medium px-3 py-1 rounded-full border hover:opacity-80"
                    style={{ borderColor: estadoColor, color: estadoColor }}
                  >
                    {ESTADO_PROYECTO_LABEL[estadoEdit] ?? estadoEdit} <span className="opacity-60">✏</span>
                  </button>
                )
              ) : (
                <span className="text-xs font-medium px-3 py-1 rounded-full border" style={{ borderColor: estadoColor, color: estadoColor }}>
                  {ESTADO_PROYECTO_LABEL[estadoEdit] ?? estadoEdit}
                </span>
              )}

              {proyecto.area_tematica && (
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {AREA_LABEL[proyecto.area_tematica] ?? proyecto.area_tematica}
                </span>
              )}

              {proyecto.iniciativa_id && proyecto.iniciativa_titulo && (
                <Link href={`/iniciativas/${proyecto.iniciativa_id}`}
                  className="text-xs px-3 py-1 rounded-full text-[var(--accent)] border border-[var(--accent)] hover:bg-teal-50 transition-colors">
                  ↗ {proyecto.iniciativa_titulo}
                </Link>
              )}

              {/* Prioridad */}
              {canManage && (
                prioridadEdit ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={prioridadVal}
                      onChange={(e) => guardarPrioridad(e.target.value)}
                      className="text-xs rounded-lg border border-[var(--border)] px-2 py-1 bg-white"
                      autoFocus
                      onBlur={() => setPrioridadEdit(false)}
                    >
                      <option value="">Sin prioridad</option>
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{PRIORIDAD_LABEL[n]}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    onClick={() => setPrioridadEdit(true)}
                    className="text-xs font-medium px-3 py-1 rounded-full border border-dashed transition-colors hover:opacity-80"
                    style={
                      prioridadVal
                        ? {
                            background: `${PRIORIDAD_COLOR[Number(prioridadVal)]}20`,
                            color: PRIORIDAD_COLOR[Number(prioridadVal)],
                            borderColor: PRIORIDAD_COLOR[Number(prioridadVal)],
                            borderStyle: "solid",
                          }
                        : { borderColor: "#cbd5e1", color: "#94a3b8" }
                    }
                  >
                    {prioridadVal
                      ? `${PRIORIDAD_LABEL[Number(prioridadVal)]} ✏`
                      : "Prioridad ✏"}
                  </button>
                )
              )}
              {!canManage && prioridadVal && (
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    background: `${PRIORIDAD_COLOR[Number(prioridadVal)]}20`,
                    color: PRIORIDAD_COLOR[Number(prioridadVal)],
                  }}
                >
                  {PRIORIDAD_LABEL[Number(prioridadVal)]}
                </span>
              )}
            </div>

            {trlActual && (
              <p className="text-xs text-[var(--text-muted)] italic">{TRL_LABEL[trlActual]}</p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <input value={tituloEdit} onChange={(e) => setTituloEdit(e.target.value)}
              className={inputCls + " text-lg font-bold"} autoFocus />
            <textarea value={descEdit} onChange={(e) => setDescEdit(e.target.value)}
              rows={3} placeholder="Descripción del proyecto..." className={`${inputCls} resize-none`} />
            <div className="flex gap-2">
              <button onClick={guardarHeader} disabled={isPending}
                className="text-xs px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50">
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => { setEditandoHeader(false); setTituloEdit(proyecto.titulo); setDescEdit(proyecto.descripcion ?? ""); }}
                className="text-xs px-4 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── APOYOS BUSCADOS ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">¿Qué necesita para avanzar?</h2>
          {canManage && (
            <span className="text-xs text-[var(--text-muted)]">Hacé clic para activar/desactivar</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TODOS_APOYOS.map((apoyo) => {
            const activo = apoyosActivos.includes(apoyo);
            const color = APOYO_COLOR[apoyo] ?? "#6b7280";
            return (
              <button
                key={apoyo}
                onClick={() => toggleApoyo(apoyo)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  canManage && !isApoyosPending ? "cursor-pointer hover:opacity-80" : "cursor-default"
                } ${activo ? "shadow-sm" : ""} ${isApoyosPending ? "opacity-60" : ""}`}
                style={activo
                  ? { background: `${color}20`, color, border: `1.5px solid ${color}` }
                  : { background: "transparent", color: "#94a3b8", border: "1.5px dashed #cbd5e1" }
                }
              >
                {APOYO_LABEL[apoyo]}
              </button>
            );
          })}
        </div>
        {apoyosActivos.length === 0 && !canManage && (
          <p className="text-xs text-[var(--text-muted)] mt-2">No hay apoyos especificados.</p>
        )}
      </section>

      {/* ── HITOS ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">
            Hitos del proyecto
            <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
              ({proyecto.hitos.length})
            </span>
          </h2>
          {canManage && !addingHito && (
            <button
              onClick={() => setAddingHito(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              + Agregar hito
            </button>
          )}
        </div>

        {/* Formulario agregar hito */}
        {addingHito && (
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Tipo *</label>
                <select
                  value={hitoTipo}
                  onChange={(e) => setHitoTipo(e.target.value)}
                  className={inputCls}
                  autoFocus
                >
                  <option value="">Seleccioná un tipo...</option>
                  {TODOS_TIPOS_HITO.map((t) => (
                    <option key={t} value={t}>{TIPO_HITO_PROYECTO_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Fecha *</label>
                <input
                  type="date"
                  value={hitoFecha}
                  onChange={(e) => setHitoFecha(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Descripción</label>
              <textarea
                value={hitoDesc}
                onChange={(e) => setHitoDesc(e.target.value)}
                rows={2}
                placeholder="Detalle del hito..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">URL de evidencia (opcional)</label>
              <input
                value={hitoUrl}
                onChange={(e) => setHitoUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={guardarHito}
                disabled={!hitoTipo || !hitoFecha || isPending}
                className="text-xs px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-40"
              >
                {isPending ? "Guardando..." : "Guardar hito"}
              </button>
              <button
                onClick={() => setAddingHito(false)}
                className="text-xs px-4 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Timeline de hitos */}
        {proyecto.hitos.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No hay hitos registrados aún.</p>
        ) : (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
            <div className="space-y-4">
              {proyecto.hitos.map((h) => {
                const color = TIPO_HITO_PROYECTO_COLOR[h.tipo] ?? "#6b7280";
                return (
                  <div key={h.id} className="relative flex gap-4">
                    {/* Dot */}
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 text-xs font-bold"
                      style={{ background: `${color}20`, color, border: `2px solid ${color}` }}
                    >
                      ●
                    </div>
                    {/* Content */}
                    <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 mb-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold" style={{ color }}>
                            {TIPO_HITO_PROYECTO_LABEL[h.tipo] ?? h.tipo}
                          </span>
                          <span className="mx-2 text-[var(--text-muted)] text-xs">·</span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(h.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </span>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => startTransition(async () => { await quitarHitoProyecto(proyecto.id, h.id); })}
                            disabled={isPending}
                            className="text-xs text-red-300 hover:text-red-500 shrink-0 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {h.descripcion && (
                        <p className="text-sm text-[var(--text)] mt-1">{h.descripcion}</p>
                      )}
                      {h.evidencia_url && (
                        <a
                          href={h.evidencia_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent)] hover:underline mt-1 block"
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
      </section>

      {/* ── HISTORIAL TRL ────────────────────────────────────── */}
      {proyecto.historial_trl.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Evolución del TRL</h2>
          <div className="flex items-start gap-2 flex-wrap">
            {proyecto.historial_trl.map((entry, idx) => {
              const color = TRL_COLOR[entry.trl_despues] ?? "#6b7280";
              const desc = TRL_LABEL[entry.trl_despues]?.split("—")[1]?.trim();
              return (
                <div key={entry.id} className="flex items-start gap-2">
                  {idx > 0 && <span className="text-[var(--text-muted)] mt-1">→</span>}
                  <div className="text-center max-w-[110px]">
                    <span className="text-sm font-bold px-3 py-1 rounded-full block"
                      style={{ background: `${color}20`, color }}>
                      TRL {entry.trl_despues}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                      {fmt(entry.creado_en)}
                    </span>
                    {desc && (
                      <span className="text-xs text-[var(--text-muted)] italic leading-tight block mt-0.5">
                        {desc}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ACTORES PARTICIPANTES ────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Actores participantes</h2>
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          {proyecto.actores.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] p-4">No hay actores vinculados aún.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {proyecto.actores.map((a) => (
                  <tr key={a.actor_id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/actors/${a.actor_id}`}
                        className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                        {a.actor_nombre}
                      </Link>
                      <span className="ml-2 text-xs text-[var(--text-muted)]">{a.actor_tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {a.rol ? (ROL_ACTOR_PROYECTO_LABEL[a.rol] ?? a.rol) : "—"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startTransition(async () => { await quitarActorProyecto(proyecto.id, a.actor_id); })}
                          disabled={isPending}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >Quitar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {canManage && actoresFiltrados.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <select value={actorSel} onChange={(e) => setActorSel(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">
              <option value="">Agregar actor...</option>
              {actoresFiltrados.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
            <select value={rolActor} onChange={(e) => setRolActor(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">
              <option value="">Rol (opcional)</option>
              {Object.entries(ROL_ACTOR_PROYECTO_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button onClick={agregarActor} disabled={!actorSel || isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-40">
              Agregar
            </button>
          </div>
        )}
      </section>

      {/* ── INSTRUMENTOS ─────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Instrumentos de financiamiento</h2>
        <div className="space-y-2">
          {proyecto.instrumentos.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No hay instrumentos vinculados aún.</p>
          ) : proyecto.instrumentos.map((inst) => {
            const tipoColor = TIPO_INSTRUMENTO_COLOR[inst.tipo] ?? "#6b7280";
            return (
              <div key={inst.instrumento_id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${tipoColor}20`, color: tipoColor }}>
                    {TIPO_INSTRUMENTO_LABEL[inst.tipo] ?? inst.tipo}
                  </span>
                  <span className="text-sm text-[var(--text)]">{inst.nombre}</span>
                </div>
                {canManage && (
                  <button
                    onClick={() => startTransition(async () => { await quitarInstrumentoProyecto(proyecto.id, inst.instrumento_id); })}
                    disabled={isPending}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >Quitar</button>
                )}
              </div>
            );
          })}
        </div>
        {canManage && instFiltrados.length > 0 && (
          <div className="mt-3 flex gap-2">
            <select value={instSel} onChange={(e) => setInstSel(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]">
              <option value="">Agregar instrumento...</option>
              {instFiltrados.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
            <button onClick={agregarInstrumento} disabled={!instSel || isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 disabled:opacity-40">
              Agregar
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
