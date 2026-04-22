"use client";

import { useState, useTransition } from "react";
import { actualizarUsuario, crearUsuario, type Usuario } from "./actions";
import { UserPlus, Save, X, KeyRound, RotateCcw } from "lucide-react";

const S = {
  accent: "#0d9488",
  navy:   "#1e3a5f",
  muted:  "#5a7a9a",
  border: "#e2e8f0",
};

const ROLES = ["admin", "manager", "directivo", "vinculador", "oferente", "demandante"];
const ROL_LABEL: Record<string, string> = {
  admin:      "Administrador",
  manager:    "Manager",
  directivo:  "Directivo",
  vinculador: "Vinculador",
  oferente:   "Miembro",
  demandante: "Invitado",
};

const ROL_COLOR: Record<string, string> = {
  admin:      "#7c3aed",
  manager:    "#0d9488",
  directivo:  "#1e3a5f",
  vinculador: "#0284c7",
  oferente:   "#059669",
  demandante: "#94a3b8",
};

// ── Fila editable ────────────────────────────────────────────
function FilaUsuario({ u, onSaved }: { u: Usuario; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(u.nombre);
  const [rol, setRol] = useState(u.rol);
  const [activo, setActivo] = useState(u.activo);
  const [cambiarPass, setCambiarPass] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function cancelar() {
    setNombre(u.nombre);
    setRol(u.rol);
    setActivo(u.activo);
    setCambiarPass(false);
    setPassword("");
    setError("");
    setEditing(false);
  }

  function guardar() {
    if (!nombre.trim()) { setError("El nombre no puede estar vacío."); return; }
    startTransition(async () => {
      const res = await actualizarUsuario(u.id, {
        nombre,
        rol,
        activo,
        password: cambiarPass && password ? password : undefined,
      });
      if (res.ok) { setEditing(false); setCambiarPass(false); setPassword(""); setError(""); onSaved(); }
      else setError(res.error ?? "Error al guardar.");
    });
  }

  return (
    <tr style={{ borderBottom: `1px solid ${S.border}` }}>
      {/* Nombre */}
      <td className="px-4 py-3">
        {editing ? (
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          />
        ) : (
          <span className="text-sm font-medium" style={{ color: S.navy }}>{u.nombre}</span>
        )}
      </td>

      {/* Email */}
      <td className="px-4 py-3">
        <span className="text-sm" style={{ color: S.muted }}>{u.email}</span>
      </td>

      {/* Rol */}
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={rol}
            onChange={e => setRol(e.target.value)}
            className="text-sm border rounded px-2 py-1 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{ROL_LABEL[r]}</option>
            ))}
          </select>
        ) : (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: `${ROL_COLOR[u.rol]}18`, color: ROL_COLOR[u.rol] }}
          >
            {ROL_LABEL[u.rol] ?? u.rol}
          </span>
        )}
      </td>

      {/* Activo */}
      <td className="px-4 py-3 text-center">
        {editing ? (
          <input
            type="checkbox"
            checked={activo}
            onChange={e => setActivo(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: S.accent }}
          />
        ) : (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={u.activo
              ? { background: "#d1fae5", color: "#065f46" }
              : { background: "#fee2e2", color: "#991b1b" }}
          >
            {u.activo ? "Activo" : "Inactivo"}
          </span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex flex-col gap-2">
            {cambiarPass ? (
              <div className="flex gap-1 items-center">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="text-sm border rounded px-2 py-1 outline-none flex-1"
                  style={{ borderColor: S.border, color: S.navy }}
                />
                <button onClick={() => { setCambiarPass(false); setPassword(""); }}
                  className="p-1 rounded hover:bg-slate-100" style={{ color: S.muted }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCambiarPass(true)}
                className="flex items-center gap-1 text-xs hover:underline"
                style={{ color: S.muted }}
              >
                <KeyRound size={11} /> Cambiar contraseña
              </button>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-1">
              <button
                onClick={guardar}
                disabled={isPending}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white"
                style={{ background: S.accent }}
              >
                <Save size={11} /> Guardar
              </button>
              <button
                onClick={cancelar}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ border: `1px solid ${S.border}`, color: S.muted }}
              >
                <X size={11} /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs hover:underline"
            style={{ color: S.accent }}
          >
            Editar
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Formulario nuevo usuario ─────────────────────────────────
function FormNuevoUsuario({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState("oferente");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function limpiar() {
    setEmail(""); setNombre(""); setRol("oferente"); setPassword(""); setError("");
  }

  function crear() {
    setError("");
    startTransition(async () => {
      const res = await crearUsuario({ email, nombre, rol, password });
      if (res.ok) { limpiar(); setOpen(false); onCreated(); }
      else setError(res.error ?? "Error al crear.");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
        style={{ background: S.accent }}
      >
        <UserPlus size={14} /> Nuevo usuario
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ border: `1.5px solid ${S.accent}`, background: "#f0fdf9" }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold" style={{ color: S.navy }}>Nuevo usuario</p>
        <button onClick={() => { setOpen(false); limpiar(); }} style={{ color: S.muted }}>
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: S.muted }}>Nombre completo</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Nombre Apellido"
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: S.muted }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: S.muted }}>Rol</label>
          <select
            value={rol}
            onChange={e => setRol(e.target.value)}
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          >
            {ROLES.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: S.muted }}>Contraseña inicial</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            style={{ borderColor: S.border, color: S.navy }}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button
        onClick={crear}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
        style={{ background: S.accent }}
      >
        <UserPlus size={14} /> {isPending ? "Creando…" : "Crear usuario"}
      </button>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function AdminUsuariosClient({ usuarios: initial }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function recargar() {
    startTransition(async () => {
      // revalidatePath ya fue llamado en la action — el router.refresh fuerza la recarga
      window.location.reload();
    });
  }

  return (
    <div className="md:ml-60 pt-14 md:pt-0 min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: S.navy }}>Usuarios</h1>
            <p className="text-sm mt-0.5" style={{ color: S.muted }}>
              {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={recargar}
              disabled={isPending}
              className="p-2 rounded-lg hover:bg-white transition"
              style={{ color: S.muted, border: `1px solid ${S.border}` }}
              title="Recargar"
            >
              <RotateCcw size={14} />
            </button>
            <FormNuevoUsuario onCreated={recargar} />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${S.border}` }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${S.border}`, background: "#f8fafc" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: S.muted }}>Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: S.muted }}>Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: S.muted }}>Rol</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: S.muted }}>Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: S.muted }}></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <FilaUsuario key={u.id} u={u} onSaved={recargar} />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs mt-4 text-center" style={{ color: S.muted }}>
          Para desactivar un usuario, editá su fila y desmarcá "Activo". No se eliminan usuarios.
        </p>
      </div>
    </div>
  );
}
