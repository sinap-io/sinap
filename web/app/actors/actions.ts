"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { fetchApi, ApiError } from "@/lib/api";

export interface ActionResult { ok: true }
export interface ActionError  { ok: false; message: string }
type Result = ActionResult | ActionError;

const ROLES_PERMITIDOS = ["admin", "manager", "directivo", "vinculador"];

export async function editarEtapaActor(
  id: number,
  etapa: string,
): Promise<Result> {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!ROLES_PERMITIDOS.includes(rol)) return { ok: false, message: "No autorizado." };
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
