export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import type { IniciativaDetail, ActorList } from "@/lib/types";
import {
  TIPO_INICIATIVA_LABEL,
  TIPO_INICIATIVA_COLOR,
  ESTADO_INICIATIVA_LABEL,
  ESTADO_INICIATIVA_COLOR,
} from "@/lib/labels";
import IniciativaDetailClient from "@/components/iniciativas/IniciativaDetailClient";

export default async function IniciativaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let iniciativa: IniciativaDetail;
  try {
    iniciativa = await fetchApi<IniciativaDetail>(`/iniciativas/${params.id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const actors = await fetchApi<ActorList[]>("/actors");

  const tipoColor = TIPO_INICIATIVA_COLOR[iniciativa.tipo] ?? "#6b7280";
  const estadoColor = ESTADO_INICIATIVA_COLOR[iniciativa.estado] ?? "#6b7280";

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/iniciativas" className="hover:text-[var(--accent)] transition-colors">
          Iniciativas
        </Link>
        <span>/</span>
        <span className="text-[var(--text)] truncate max-w-[20ch]">{iniciativa.titulo}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${tipoColor}20`, color: tipoColor }}
          >
            {TIPO_INICIATIVA_LABEL[iniciativa.tipo] ?? iniciativa.tipo}
          </span>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full border"
            style={{ borderColor: estadoColor, color: estadoColor }}
          >
            {ESTADO_INICIATIVA_LABEL[iniciativa.estado] ?? iniciativa.estado}
          </span>
          {iniciativa.vinculador_nombre && (
            <span className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2.5 py-1 rounded-full">
              Vinculador: {iniciativa.vinculador_nombre}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-[var(--text)]">{iniciativa.titulo}</h1>

        {iniciativa.descripcion && (
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{iniciativa.descripcion}</p>
        )}

        <div className="flex gap-6 pt-1">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--text)]">{iniciativa.actores.length}</div>
            <div className="text-xs text-[var(--text-muted)]">actores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--text)]">{iniciativa.hitos.length}</div>
            <div className="text-xs text-[var(--text-muted)]">hitos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--text)]">
              {iniciativa.necesidades.length + iniciativa.capacidades.length + iniciativa.instrumentos.length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">vínculos</div>
          </div>
        </div>
      </div>

      {/* Client section (estado, actores, hitos) */}
      <IniciativaDetailClient iniciativa={iniciativa} actors={actors} />
    </div>
  );
}
