"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";

interface Result { ok: boolean; error?: string }

export async function crearProyecto(data: {
  titulo: string;
  descripcion?: string;
  trl?: number;
  area_tematica?: string;
  estado: string;
  apoyos_buscados?: string[];
  iniciativa_id?: number;
}): Promise<Result> {
  try {
    await fetchApi("/proyectos", { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/proyectos");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al crear proyecto" };
  }
}

export async function editarTRLProyecto(id: number, trl: number): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ trl }),
    });
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar TRL" };
  }
}

export async function editarEstadoProyecto(id: number, estado: string): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar estado" };
  }
}

export async function editarApoyosProyecto(
  id: number, apoyos_buscados: string[]
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ apoyos_buscados }),
    });
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar apoyos" };
  }
}

export async function agregarHitoProyecto(
  id: number,
  data: { tipo: string; descripcion?: string; fecha: string; evidencia_url?: string }
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/hitos`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al agregar hito" };
  }
}

export async function quitarHitoProyecto(id: number, hito_id: number): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/hitos/${hito_id}`, { method: "DELETE" });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al eliminar hito" };
  }
}

export async function editarCamposProyecto(
  id: number,
  campos: { titulo?: string; descripcion?: string; area_tematica?: string; iniciativa_id?: number }
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(campos),
    });
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar cambios" };
  }
}

export async function agregarActorProyecto(
  id: number, actor_id: number, rol?: string
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/actores`, {
      method: "POST",
      body: JSON.stringify({ actor_id, rol }),
    });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al agregar actor" };
  }
}

export async function quitarActorProyecto(id: number, actor_id: number): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/actores/${actor_id}`, { method: "DELETE" });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al quitar actor" };
  }
}

export async function agregarInstrumentoProyecto(
  id: number, instrumento_id: number
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/instrumentos`, {
      method: "POST",
      body: JSON.stringify({ instrumento_id }),
    });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al vincular instrumento",
    };
  }
}

export async function quitarInstrumentoProyecto(
  id: number, instrumento_id: number
): Promise<Result> {
  try {
    await fetchApi(`/proyectos/${id}/instrumentos/${instrumento_id}`, { method: "DELETE" });
    revalidatePath(`/proyectos/${id}`);
    return { ok: true };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al desvincular instrumento",
    };
  }
}
