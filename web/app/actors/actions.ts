"use server";

import { revalidatePath } from "next/cache";
import { fetchApi, ApiError } from "@/lib/api";

export interface ActionResult { ok: true }
export interface ActionError  { ok: false; message: string }
type Result = ActionResult | ActionError;

export async function editarEtapaActor(
  id: number,
  etapa: string,
): Promise<Result> {
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
