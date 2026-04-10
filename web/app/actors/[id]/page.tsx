export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchApi, ApiError } from "@/lib/api";
import type { ActorDetail } from "@/lib/types";
import ActorHeader from "@/components/actors/ActorHeader";
import {
  SERVICIO_LABEL, AREA_LABEL, DISPONIBILIDAD_COLOR, URGENCIA_COLOR,
} from "@/lib/labels";

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let actor: ActorDetail;
  try {
    actor = await fetchApi<ActorDetail>(`/actors/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Volver */}
      <Link href="/actors" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
        ← Volver a la red
      </Link>

      {/* Header con etapa editable */}
      <ActorHeader actor={actor} />

      {/* Servicios */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          Servicios ofrecidos
          <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
            ({actor.servicios.length})
          </span>
        </h2>
        {actor.servicios.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No hay servicios registrados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actor.servicios.map((s) => {
              const dispColor = DISPONIBILIDAD_COLOR[s.disponibilidad] ?? "#6b7280";
              return (
                <div
                  key={s.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-[var(--text)] text-sm">
                      {SERVICIO_LABEL[s.tipo_servicio] ?? s.tipo_servicio}
                    </span>
                    <Badge
                      label={s.disponibilidad}
                      color={dispColor}
                      className="shrink-0"
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {AREA_LABEL[s.area_tematica] ?? s.area_tematica}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Necesidades */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          Necesidades declaradas
          <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
            ({actor.necesidades.length})
          </span>
        </h2>
        {actor.necesidades.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No hay necesidades registradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actor.necesidades.map((n) => {
              const urgColor = URGENCIA_COLOR[n.urgencia] ?? "#6b7280";
              return (
                <div
                  key={n.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
                  style={{ borderLeftColor: urgColor, borderLeftWidth: "3px" }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-[var(--text)] text-sm">
                      {SERVICIO_LABEL[n.tipo_servicio] ?? n.tipo_servicio}
                    </span>
                    <Badge
                      label={`Urgencia ${n.urgencia}`}
                      color={urgColor}
                      className="shrink-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
