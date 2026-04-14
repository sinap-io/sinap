"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";
import type { VinculadorList } from "@/lib/types";

export async function editarVinculador(
  vid: number,
  data: { zona_id?: number; activo?: boolean; nombre?: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await fetchApi<VinculadorList>(`/adit/vinculadores/${vid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    revalidatePath("/adit");
    revalidatePath(`/adit/${vid}`);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error al actualizar vinculador";
    return { ok: false, error: msg };
  }
}
