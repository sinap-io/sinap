"use server";

import { fetchApi, ApiError } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";

export interface SearchResult {
  ok: true;
  data: SearchResponse;
}

export interface SearchError {
  ok: false;
  message: string;
}

export async function runSearch(consulta: string): Promise<SearchResult | SearchError> {
  if (consulta.trim().length < 10) {
    return { ok: false, message: "La consulta debe tener al menos 10 caracteres." };
  }

  try {
    const data = await fetchApi<SearchResponse>("/search", {
      method: "POST",
      body: JSON.stringify({ consulta: consulta.trim() }),
    });
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: `Error del servidor (${e.status}). Intentá de nuevo.` };
    }
    return { ok: false, message: "No se pudo conectar con el servicio de IA." };
  }
}
