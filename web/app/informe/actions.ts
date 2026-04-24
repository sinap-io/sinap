"use server";

import { fetchApi } from "@/lib/api";

/**
 * Dispara la regeneración del informe en Railway (background task).
 * Railway retorna inmediatamente — la generación con Claude toma ~45 segundos.
 * El cliente muestra una cuenta regresiva y recarga la página al terminar.
 *
 * Vercel Hobby tiene timeout de 10s en funciones serverless;
 * este endpoint retorna en <1s, por lo que no hay problema.
 */
export async function triggerActualizarInforme(): Promise<{ eta: number }> {
  const res = await fetchApi<{ status: string; eta_segundos: number }>(
    "/informe/trigger",
    { method: "POST" }
  );
  return { eta: res.eta_segundos ?? 45 };
}
