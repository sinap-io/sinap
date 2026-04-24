"use server";

import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";

// Permite hasta 60s en Vercel (límite Hobby plan)
export const maxDuration = 60;

export async function actualizarInforme(): Promise<void> {
  await fetchApi("/informe?force=true", {
    // 55s de timeout para darle margen a Vercel
    signal: AbortSignal.timeout(55_000),
  });
  redirect("/informe");
}
