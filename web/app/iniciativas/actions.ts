"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import type { IniciativaList } from "@/lib/types";

export interface ActionResult { ok: true }
export interface ActionError  { ok: false; message: string }
type Result = ActionResult | ActionError;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** DELETE con body vacío — fetchApi espera JSON pero 204 no tiene body */
async function apiDelete(path: string) {
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(res.status, `DELETE ${path} → ${res.status}`);
}

// ── Crear iniciativa ───────────────────────────────────────────

export async function crearIniciativa(data: {
  tipo: string;
  titulo: string;
  descripcion?: string | null;
  notas?: string | null;
  vinculador_id?: number | null;
}): Promise<never | ActionError> {
  try {
    const ini = await fetchApi<IniciativaList>("/iniciativas", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/iniciativas");
    redirect(`/iniciativas/${ini.id}`);
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    if (e instanceof ApiError) return { ok: false, message: `Error al crear (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Cambiar estado ────────────────────────────────────────────

export async function cambiarEstado(
  id: number, estado: string,
): Promise<Result> {
  try {
    await fetchApi(`/iniciativas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
    revalidatePath(`/iniciativas/${id}`);
    revalidatePath("/iniciativas");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Actores ───────────────────────────────────────────────────

export async function editarNotas(
  id: number,
  notas: string | null,
): Promise<Result> {
  try {
    await fetchApi(`/iniciativas/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notas: notas ?? "" }),
    });
    revalidatePath(`/iniciativas/${id}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al guardar notas (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

export async function agregarActor(
  id: number,
  actor_id: number,
  rol: string,
  referente?: string | null,
): Promise<Result> {
  try {
    await fetchApi(`/iniciativas/${id}/actores`, {
      method: "POST",
      body: JSON.stringify({ actor_id, rol, referente: referente || null }),
    });
    revalidatePath(`/iniciativas/${id}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al agregar actor (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

export async function quitarActor(
  id: number,
  actor_id: number,
  rol: string,
): Promise<Result> {
  try {
    await apiDelete(`/iniciativas/${id}/actores/${actor_id}/${rol}`);
    revalidatePath(`/iniciativas/${id}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al quitar actor (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Hitos ─────────────────────────────────────────────────────

export async function agregarHito(
  id: number,
  data: {
    tipo: string;
    descripcion?: string | null;
    fecha: string;
    evidencia_url?: string | null;
  },
): Promise<Result> {
  try {
    await fetchApi(`/iniciativas/${id}/hitos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath(`/iniciativas/${id}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: `Error al registrar hito (${e.status}).` };
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}
