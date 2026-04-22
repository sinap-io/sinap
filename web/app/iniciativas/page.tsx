export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import type { ActorList, IniciativaList } from "@/lib/types";
import { Suspense } from "react";
import IniciativasClient from "@/components/iniciativas/IniciativasClient";

const CAN_MANAGE = ["admin", "manager", "directivo", "vinculador"];

export default async function IniciativasPage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (rol === "freemium") redirect("/");
  let iniciativas: IniciativaList[] = [];
  let actores: Pick<ActorList, "id" | "nombre">[] = [];
  try {
    [iniciativas, actores] = await Promise.all([
      fetchApi<IniciativaList[]>("/iniciativas"),
      fetchApi<ActorList[]>("/actors").then((list) =>
        list.map(({ id, nombre }) => ({ id, nombre }))
      ),
    ]);
  } catch {
    // API no disponible aún (ej: endpoint no desplegado en este entorno)
  }

  const metricas = {
    abierta:    iniciativas.filter((i) => i.estado === "abierta").length,
    en_curso:   iniciativas.filter((i) => i.estado === "en_curso").length,
    concretada: iniciativas.filter((i) => i.estado === "concretada").length,
    cerrada:    iniciativas.filter((i) => i.estado === "cerrada").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Iniciativas</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {iniciativas.length} iniciativa{iniciativas.length !== 1 ? "s" : ""} registrada{iniciativas.length !== 1 ? "s" : ""}
          </p>
        </div>
        {CAN_MANAGE.includes((session?.user as { rol?: string })?.rol ?? "") && (
          <Link
            href="/iniciativas/nueva"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                       hover:opacity-90 transition-opacity"
          >
            + Nueva iniciativa
          </Link>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Abiertas",   value: metricas.abierta,    color: "#3b82f6" },
          { label: "En curso",   value: metricas.en_curso,   color: "#f97316" },
          { label: "Concretadas",value: metricas.concretada, color: "#22c55e" },
          { label: "Cerradas",   value: metricas.cerrada,    color: "#6b7280" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Lista con filtros */}
      <Suspense fallback={<div className="text-sm text-[var(--text-muted)] py-4">Cargando…</div>}>
        <IniciativasClient iniciativas={iniciativas} actores={actores} />
      </Suspense>
    </div>
  );
}
