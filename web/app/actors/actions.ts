"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { fetchApi, ApiError } from "@/lib/api";
import type { Contacto } from "@/lib/types";

export interface ActionResult { ok: true }
export interface ActionError  { ok: false; message: string }
type Result = ActionResult | ActionError;

const ROLES_PERMITIDOS = ["admin", "manager", "directivo", "vinculador"];

async function requireRol(): Promise<ActionError | null> {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  return ROLES_PERMITIDOS.includes(rol) ? null : { ok: false, message: "No autorizado." };
}

export async function editarEtapaActor(
  id: number,
  etapa: string,
): Promise<Result> {
  const authErr = await requireRol();
  if (authErr) return authErr;
  try {
    await fetchApi(`/actors/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ etapa }),
    });
    revalidatePath(`/actors/${id}`);
    revalidatePath("/actors");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al actualizar etapa (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Contactos ─────────────────────────────────────────────────

export async function crearContacto(
  actorId: number,
  data: { nombre: string; cargo?: string; email?: string; telefono?: string; es_principal: boolean },
): Promise<Result & { contacto?: Contacto }> {
  const authErr = await requireRol();
  if (authErr) return authErr;
  try {
    const contacto = await fetchApi<Contacto>(`/actors/${actorId}/contactos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath(`/actors/${actorId}`);
    return { ok: true, contacto };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al crear contacto (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

export async function editarContacto(
  actorId: number,
  contactoId: number,
  data: { nombre?: string; cargo?: string; email?: string; telefono?: string; es_principal?: boolean },
): Promise<Result> {
  const authErr = await requireRol();
  if (authErr) return authErr;
  try {
    await fetchApi(`/actors/${actorId}/contactos/${contactoId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath(`/actors/${actorId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al editar contacto (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

export async function eliminarContacto(
  actorId: number,
  contactoId: number,
): Promise<Result> {
  const authErr = await requireRol();
  if (authErr) return authErr;
  try {
    await fetchApi(`/actors/${actorId}/contactos/${contactoId}`, { method: "DELETE" });
    revalidatePath(`/actors/${actorId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al eliminar contacto (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}
