"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import type { Contacto } from "@/lib/types";
import { crearContacto, editarContacto, eliminarContacto } from "@/app/actors/actions";

const PUEDE_EDITAR = ["admin", "manager", "directivo", "vinculador"];

interface Props {
  actorId: number;
  contactos: Contacto[];
}

const EMPTY_FORM = { nombre: "", cargo: "", email: "", telefono: "", es_principal: false };

export default function ActorContactos({ actorId, contactos }: Props) {
  const { data: session } = useSession();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  const puedeEditar = PUEDE_EDITAR.includes(rol);

  const [isPending, startTransition] = useTransition();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setEditForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function iniciarEdicion(c: Contacto) {
    setEditandoId(c.id);
    setEditForm({
      nombre: c.nombre,
      cargo: c.cargo ?? "",
      email: c.email ?? "",
      telefono: c.telefono ?? "",
      es_principal: c.es_principal,
    });
    setError("");
  }

  function handleCrear() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setError("");
    startTransition(async () => {
      const res = await crearContacto(actorId, {
        nombre: form.nombre.trim(),
        cargo: form.cargo.trim() || undefined,
        email: form.email.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        es_principal: form.es_principal,
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        setMostrarForm(false);
      } else {
        setError((res as { ok: false; message: string }).message);
      }
    });
  }

  function handleEditar() {
    if (!editForm.nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setError("");
    startTransition(async () => {
      const res = await editarContacto(actorId, editandoId!, {
        nombre: editForm.nombre.trim(),
        cargo: editForm.cargo.trim() || undefined,
        email: editForm.email.trim() || undefined,
        telefono: editForm.telefono.trim() || undefined,
        es_principal: editForm.es_principal,
      });
      if (res.ok) {
        setEditandoId(null);
      } else {
        setError((res as { ok: false; message: string }).message);
      }
    });
  }

  function handleEliminar(contactoId: number) {
    if (!confirm("¿Eliminar este contacto?")) return;
    startTransition(async () => {
      await eliminarContacto(actorId, contactoId);
    });
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Contactos
          <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
            ({contactos.length})
          </span>
        </h2>
        {puedeEditar && !mostrarForm && (
          <button
            onClick={() => { setMostrarForm(true); setError(""); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)]
                       text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white
                       transition-colors"
          >
            + Agregar contacto
          </button>
        )}
      </div>

      {/* Formulario de nuevo contacto */}
      {mostrarForm && (
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
          <p className="text-sm font-medium text-[var(--text)]">Nuevo contacto</p>
          <ContactoForm
            values={form}
            onChange={handleFormChange}
            onSubmit={handleCrear}
            onCancel={() => { setMostrarForm(false); setForm(EMPTY_FORM); setError(""); }}
            isPending={isPending}
            submitLabel="Agregar"
          />
          {error && <p className="text-xs text-[#ef4444]">{error}</p>}
        </div>
      )}

      {/* Lista de contactos */}
      {contactos.length === 0 && !mostrarForm ? (
        <p className="text-[var(--text-muted)] text-sm">No hay contactos registrados.</p>
      ) : (
        <div className="space-y-3">
          {contactos.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              {editandoId === c.id ? (
                <div className="space-y-3">
                  <ContactoForm
                    values={editForm}
                    onChange={handleEditFormChange}
                    onSubmit={handleEditar}
                    onCancel={() => { setEditandoId(null); setError(""); }}
                    isPending={isPending}
                    submitLabel="Guardar"
                  />
                  {error && <p className="text-xs text-[#ef4444]">{error}</p>}
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[var(--text)] text-sm">{c.nombre}</span>
                      {c.es_principal && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium
                                         bg-[var(--accent)]/10 text-[var(--accent)]">
                          Principal
                        </span>
                      )}
                    </div>
                    {c.cargo && (
                      <p className="text-xs text-[var(--text-muted)]">{c.cargo}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-xs text-[var(--accent)] hover:underline"
                        >
                          {c.email}
                        </a>
                      )}
                      {c.telefono && (
                        <span className="text-xs text-[var(--text-muted)]">{c.telefono}</span>
                      )}
                    </div>
                  </div>
                  {puedeEditar && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => iniciarEdicion(c)}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        ✏ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(c.id)}
                        disabled={isPending}
                        className="text-xs text-[var(--text-muted)] hover:text-[#ef4444]
                                   disabled:opacity-40 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Formulario reutilizable ────────────────────────────────────

interface FormValues {
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  es_principal: boolean;
}

function ContactoForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  values: FormValues;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          name="nombre"
          value={values.nombre}
          onChange={onChange}
          placeholder="Nombre *"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                     text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          name="cargo"
          value={values.cargo}
          onChange={onChange}
          placeholder="Cargo"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                     text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="Email"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                     text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
        <input
          name="telefono"
          value={values.telefono}
          onChange={onChange}
          placeholder="Teléfono"
          className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5
                     text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer w-fit">
        <input
          type="checkbox"
          name="es_principal"
          checked={values.es_principal}
          onChange={onChange}
          className="accent-[var(--accent)]"
        />
        Contacto principal
      </label>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[var(--accent)]
                     hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {isPending ? "Guardando…" : submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
