"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import type { CasoList } from "@/lib/types";

export interface ActionResult {
  ok: true;
}

export interface ActionError {
  ok: false;
  message: string;
}

// ── Crear caso ────────────────────────────────────────────────

export async function crearCaso(data: {
  actor_demandante_id: number;
  necesidad_id: number;
  vinculador_id: number;
  actor_oferente_id?: number | null;
  capacidad_id?: number | null;
  notas?: string | null;
}): Promise<ActionResult | ActionError> {
  try {
    const caso = await fetchApi<CasoList>("/vinculador/casos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    redirect(`/vinculador/casos/${caso.id}`);
  } catch (e) {
    // redirect() lanza una excepción internamente — dejarla pasar
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    if (e instanceof ApiError) {
      return { ok: false, message: `Error al crear el caso (${e.status}).` };
    }
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Cambiar estado ────────────────────────────────────────────

export async function cambiarEstado(
  casoId: number,
  estado: string,
): Promise<ActionResult | ActionError> {
  try {
    await fetchApi(`/vinculador/casos/${casoId}`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
    revalidatePath(`/vinculador/casos/${casoId}`);
    revalidatePath("/vinculador");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: `Error al actualizar el estado (${e.status}).` };
    }
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}

// ── Agregar hito ──────────────────────────────────────────────

export async function agregarHito(
  casoId: number,
  data: {
    tipo: string;
    descripcion?: string | null;
    fecha: string;
    evidencia_url?: string | null;
  },
): Promise<ActionResult | ActionError> {
  try {
    await fetchApi(`/vinculador/casos/${casoId}/hitos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath(`/vinculador/casos/${casoId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: `Error al registrar el hito (${e.status}).` };
    }
    return { ok: false, message: "No se pudo conectar con el servidor." };
  }
}
