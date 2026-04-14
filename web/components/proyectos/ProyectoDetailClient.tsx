"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ProyectoDetail } from "@/lib/types";
import {
  AREA_LABEL,
  ESTADO_PROYECTO_LABEL, ESTADO_PROYECTO_COLOR,
  TRL_COLOR, TRL_LABEL,
  TIPO_INSTRUMENTO_LABEL, TIPO_INSTRUMENTO_COLOR,
} from "@/lib/labels";
import {
  editarTRLProyecto,
  editarEstadoProyecto,
  editarCamposProyecto,
  agregarActorProyecto,
  quitarActorProyecto,
  agregarInstrumentoProyecto,
  quitarInstrumentoProyecto,
} from "@/app/proyectos/actions";

const CAN_MANAGE = ["admin", "manager", "directivo", "vinculador"];

interface ActorOption     { id: number; nombre: string }
interface InstrumentoOpt  { id: number; nombre: string; tipo: string }
interface IniciativaOpt   { id: number; titulo: string }

export default function ProyectoDetailClient({
  proyecto,
  rol,
  actoresDisponibles,
  instrumentosDisponibles,
  iniciativasDisponibles,
}: {
  proyecto: ProyectoDetail;
  rol: string;
  actoresDisponibles: ActorOption[];
  instrumentosDisponibles: InstrumentoOpt[];
  iniciativasDisponibles: IniciativaOpt[];
}) {
  const canManage = CAN_MANAGE.includes(rol);
  const [isPending, startTransition] = useTransition();

  // ── Edición del header ────────────────────────────────────
  const [editandoHeader, setEditandoHeader] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(proyecto.titulo);
  const [descEdit,   setDescEdit]   = useState(proyecto.descripcion ?? "");

  function guardarHeader() {
    startTransition(async () => {
      await editarCamposProyecto(proyecto.id, {
        titulo:      tituloEdit.trim(),
        descripcion: descEdit.trim() || undefined,
      });
      setEditandoHeader(false);
    });
  }

  // ── TRL inline ────────────────────────────────────────────
  const [trlEdit, setTrlEdit]       = useState(false);
  const [trlVal,  setTrlVal]        = useState(proyecto.trl?.toString() ?? "");

  function guardarTRL() {
    const n = Number(trlVal);
    if (!trlVal || n < 1 || n > 9) return;
    startTransition(async () => {
      await editarTRLProyecto(proyecto.id, n);
      setTrlEdit(false);
    });
  }

  // ── Estado inline ─────────────────────────────────────────
  const [estadoEdit, setEstadoEdit] = useState(proyecto.estado);
  const [editandoEstado, setEditandoEstado] = useState(false);

  function guardarEstado(nuevoEstado: string) {
    startTransition(async () => {
      await editarEstadoProyecto(proyecto.id, nuevoEstado);
      setEstadoEdit(nuevoEstado);
      setEditandoEstado(false);
    });
  }

  // ── Agregar actor ─────────────────────────────────────────
  const [actorSeleccionado, setActorSeleccionado] = useState("");
  const [rolActor, setRolActor] = useState("");

  const actoresIds = proyecto.actores.map((a) => a.actor_id);
  const actoresFiltrados = actoresDisponibles.filter((a) => !actoresIds.includes(a.id));

  function agregarActor() {
    if (!actorSeleccionado) return;
    startTransition(async () => {
      await agregarActorProyecto(proyecto.id, Number(actorSeleccionado), rolActor || undefined);
      setActorSeleccionado("");
      setRolActor("");
    });
  }

  // ── Agregar instrumento ───────────────────────────────────
  const [instSeleccionado, setInstSeleccionado] = useState("");

  const instIds = proyecto.instrumentos.map((i) => i.instrumento_id);
  const instFiltrados = instrumentosDisponibles.filter((i) => !instIds.includes(i.id));

  function agregarInstrumento() {
    if (!instSeleccionado) return;
    startTransition(async () => {
      await agregarInstrumentoProyecto(proyecto.id, Number(instSeleccionado));
      setInstSeleccionado("");
    });
  }

  const estadoColor = ESTADO_PROYECTO_COLOR[estadoEdit] ?? "#6b7280";
  const trlActual   = proyecto.trl;
  const trlColor    = trlActual ? TRL_COLOR[trlActual] : "#94a3b8";

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]`;

  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
        {!editandoHeader ? (
          <>
            {/* Título + botón editar */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold text-[var(--text)]">{proyecto.titulo}</h1>
              {canManage && (
                <button
                  onClick={() => setEditandoHeader(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]
                             transition-colors shrink-0"
                >
                  ✏ Editar
                </button>
              )}
            </div>

            {/* Descripción */}
            {proyecto.descripcion && (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {proyecto.descripcion}
              </p>
            )}

            {/* Badges: TRL + Estado + Área */}
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
                        <option key={n} value={n}>TRL {n}</option>
                      ))}
                    </select>
                    <button
                      onClick={guardarTRL}
                      disabled={isPending}
                      className="text-xs text-[var(--accent)] hover:opacity-70"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => { setTrlEdit(false); setTrlVal(proyecto.trl?.toString() ?? ""); }}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setTrlEdit(true)}
                    className="text-xs font-bold px-3 py-1 rounded-full transition-opacity hover:opacity-80"
                    style={{ background: `${trlColor}20`, color: trlColor }}
                    title={trlActual ? TRL_LABEL[trlActual] : "Asignar TRL"}
                  >
                    {trlActual ? `TRL ${trlActual}` : "Sin TRL"}
                    {canManage && <span className="ml-1 opacity-60">✏</span>}
                  </button>
                )
              ) : (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${trlColor}20`, color: trlColor }}
                  title={trlActual ? TRL_LABEL[trlActual] : undefined}
                >
                  {trlActual ? `TRL ${trlActual}` : "Sin TRL"}
                </span>
              )}

              {/* Estado */}
              {canManage ? (
                editandoEstado ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={estadoEdit}
                      onChange={(e) => guardarEstado(e.target.value)}
                      className="text-xs rounded-lg border border-[var(--border)] px-2 py-1 bg-white"
                      autoFocus
                      onBlur={() => setEditandoEstado(false)}
                    >
                      {Object.entries(ESTADO_PROYECTO_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditandoEstado(true)}
                    className="text-xs font-medium px-3 py-1 rounded-full border transition-opacity hover:opacity-80"
                    style={{ borderColor: estadoColor, color: estadoColor }}
                  >
                    {ESTADO_PROYECTO_LABEL[estadoEdit] ?? estadoEdit}
                    <span className="ml-1 opacity-60">✏</span>
                  </button>
                )
              ) : (
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full border"
                  style={{ borderColor: estadoColor, color: estadoColor }}
                >
                  {ESTADO_PROYECTO_LABEL[estadoEdit] ?? estadoEdit}
                </span>
              )}

              {/* Área */}
              {proyecto.area_tematica && (
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {AREA_LABEL[proyecto.area_tematica] ?? proyecto.area_tematica}
                </span>
              )}

              {/* Iniciativa vinculada */}
              {proyecto.iniciativa_id && proyecto.iniciativa_titulo && (
                <Link
                  href={`/iniciativas/${proyecto.iniciativa_id}`}
                  className="text-xs px-3 py-1 rounded-full text-[var(--accent)]
                             border border-[var(--accent)] hover:bg-teal-50 transition-colors"
                >
                  ↗ {proyecto.iniciativa_titulo}
                </Link>
              )}
            </div>

            {/* TRL description */}
            {trlActual && (
              <p className="text-xs text-[var(--text-muted)] italic">
                {TRL_LABEL[trlActual]}
              </p>
            )}
          </>
        ) : (
          /* Modo edición del header */
          <div className="space-y-3">
            <input
              value={tituloEdit}
              onChange={(e) => setTituloEdit(e.target.value)}
              className={inputCls + " text-lg font-bold"}
              autoFocus
            />
            <textarea
              value={descEdit}
              onChange={(e) => setDescEdit(e.target.value)}
              rows={3}
              placeholder="Descripción del proyecto..."
              className={`${inputCls} resize-none`}
            />
            <div className="flex gap-2">
              <button
                onClick={guardarHeader}
                disabled={isPending}
                className="text-xs px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white
                           hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setEditandoHeader(false);
                  setTituloEdit(proyecto.titulo);
                  setDescEdit(proyecto.descripcion ?? "");
                }}
                className="text-xs px-4 py-1.5 rounded-lg border border-[var(--border)]
                           text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── HISTORIAL TRL ────────────────────────────────────── */}
      {proyecto.historial_trl.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--text)] mb-3">
            Evolución del TRL
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {proyecto.historial_trl.map((entry, idx) => {
              const color = TRL_COLOR[entry.trl_despues] ?? "#6b7280";
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  {idx > 0 && (
                    <span className="text-[var(--text-muted)]">→</span>
                  )}
                  <div className="text-center">
                    <span
                      className="text-sm font-bold px-3 py-1 rounded-full block"
                      style={{ background: `${color}20`, color }}
                    >
                      TRL {entry.trl_despues}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                      {new Date(entry.creado_en).toLocaleDateString("es-AR", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ACTORES PARTICIPANTES ────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">
          Actores participantes
        </h2>
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          {proyecto.actores.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] p-4">No hay actores vinculados aún.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {proyecto.actores.map((a) => (
                  <tr key={a.actor_id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/actors/${a.actor_id}`}
                        className="text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                      >
                        {a.actor_nombre}
                      </Link>
                      <span className="ml-2 text-xs text-[var(--text-muted)]">{a.actor_tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{a.rol ?? "—"}</td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            startTransition(async () => { await quitarActorProyecto(proyecto.id, a.actor_id); })
                          }
                          disabled={isPending}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Quitar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Agregar actor */}
        {canManage && actoresFiltrados.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <select
              value={actorSeleccionado}
              onChange={(e) => setActorSeleccionado(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                         text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">Agregar actor...</option>
              {actoresFiltrados
                .slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
            </select>
            <input
              value={rolActor}
              onChange={(e) => setRolActor(e.target.value)}
              placeholder="Rol (ej: Líder técnico)"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                         text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]
                         w-44"
            />
            <button
              onClick={agregarActor}
              disabled={!actorSeleccionado || isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                         hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Agregar
            </button>
          </div>
        )}
      </section>

      {/* ── INSTRUMENTOS DE FINANCIAMIENTO ──────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--text)] mb-3">
          Instrumentos de financiamiento aplicables
        </h2>
        <div className="space-y-2">
          {proyecto.instrumentos.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No hay instrumentos vinculados aún.</p>
          ) : (
            proyecto.instrumentos.map((inst) => {
              const tipoColor = TIPO_INSTRUMENTO_COLOR[inst.tipo] ?? "#6b7280";
              return (
                <div
                  key={inst.instrumento_id}
                  className="flex items-center justify-between rounded-lg border
                             border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${tipoColor}20`, color: tipoColor }}
                    >
                      {TIPO_INSTRUMENTO_LABEL[inst.tipo] ?? inst.tipo}
                    </span>
                    <span className="text-sm text-[var(--text)]">{inst.nombre}</span>
                  </div>
                  {canManage && (
                    <button
                      onClick={() =>
                        startTransition(async () => { await quitarInstrumentoProyecto(proyecto.id, inst.instrumento_id); })
                      }
                      disabled={isPending}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {canManage && instFiltrados.length > 0 && (
          <div className="mt-3 flex gap-2">
            <select
              value={instSeleccionado}
              onChange={(e) => setInstSeleccionado(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                         text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">Agregar instrumento...</option>
              {instFiltrados.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
            <button
              onClick={agregarInstrumento}
              disabled={!instSeleccionado || isPending}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                         hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Agregar
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
