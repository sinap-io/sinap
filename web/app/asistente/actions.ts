"use server";

import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
}

interface AsistenteResponse {
  respuesta: string;
}

const ROLES_CON_ACCESO = ["admin", "manager", "directivo", "vinculador", "oferente"];

export async function enviarMensaje(
  messages: MensajeChat[]
): Promise<{ ok: true; respuesta: string } | { ok: false; respuesta: string }> {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!ROLES_CON_ACCESO.includes(rol)) {
    return { ok: false, respuesta: "No autorizado." };
  }

  try {
    const data = await fetchApi<AsistenteResponse>("/asistente", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
    return { ok: true, respuesta: data.respuesta };
  } catch {
    return { ok: false, respuesta: "No se pudo conectar con el asistente. Intentá de nuevo." };
  }
}
