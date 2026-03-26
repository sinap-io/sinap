import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import type { CasoDetail } from "@/lib/types";
import { ESTADO_CASO_LABEL, ESTADO_CASO_COLOR } from "@/lib/labels";
import CasoDetailClient from "@/components/vinculador/CasoDetailClient";

const FLUJO = ["abierto", "en_gestion", "vinculado", "cerrado"] as const;

export default async function CasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let caso: CasoDetail;
  try {
    caso = await fetchApi<CasoDetail>(`/vinculador/casos/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const estadoColor = ESTADO_CASO_COLOR[caso.estado] ?? "#6b7280";
  const estadoLabel = ESTADO_CASO_LABEL[caso.estado] ?? caso.estado;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/vinculador" className="hover:text-[var(--accent)] transition-colors">
          Vinculador
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Caso #{caso.id}</span>
      </div>

      {/* Header del caso */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4"
           style={{ borderLeftColor: estadoColor, borderLeftWidth: "3px" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-[var(--text)]">Caso #{caso.id}</h1>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${estadoColor}20`, color: estadoColor }}
              >
                {estadoLabel}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Abierto el {new Date(caso.creado_en).toLocaleDateString("es-AR")}
              {" · "}Actualizado el {new Date(caso.actualizado_en).toLocaleDateString("es-AR")}
            </p>
          </div>
        </div>

        {/* Actores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Demandante</p>
            <Link
              href={`/actors/${caso.demandante_id}`}
              className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
            >
              {caso.demandante_nombre} →
            </Link>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Necesidad: {caso.necesidad_tipo}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Oferente</p>
            {caso.oferente_nombre ? (
              <>
                <Link
                  href={`/actors/${caso.oferente_id}`}
                  className="text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                >
                  {caso.oferente_nombre} →
                </Link>
                {caso.capacidad_tipo && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Capacidad: {caso.capacidad_tipo}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">Sin asignar</p>
            )}
          </div>
        </div>

        {/* Vinculador */}
        <div className="pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Vinculador</p>
          <p className="text-sm text-[var(--text)]">{caso.vinculador_nombre}</p>
        </div>

        {/* Notas */}
        {caso.notas && (
          <div className="pt-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Notas</p>
            <p className="text-sm text-[var(--text)] leading-relaxed">{caso.notas}</p>
          </div>
        )}
      </div>

      {/* Progresión de estado */}
      {caso.estado !== "cancelado" && (
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Progresión del caso
          </p>
          <div className="flex items-center gap-0">
            {FLUJO.map((e, i) => {
              const done  = FLUJO.indexOf(caso.estado as typeof FLUJO[number]) >= i;
              const color = done ? ESTADO_CASO_COLOR[e] : "#e2e8f0";
              const label = ESTADO_CASO_LABEL[e];
              return (
                <div key={e} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: color, background: done ? color : "white" }}
                    >
                      {done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-[10px] mt-1 text-center" style={{ color: done ? color : "#94a3b8" }}>
                      {label}
                    </span>
                  </div>
                  {i < FLUJO.length - 1 && (
                    <div
                      className="h-0.5 flex-1 mb-4"
                      style={{ background: FLUJO.indexOf(caso.estado as typeof FLUJO[number]) > i ? ESTADO_CASO_COLOR[FLUJO[i + 1]] : "#e2e8f0" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección interactiva: cambiar estado + timeline + agregar hito */}
      <CasoDetailClient caso={caso} />
    </div>
  );
}
