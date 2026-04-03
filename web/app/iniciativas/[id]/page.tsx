export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import type { IniciativaDetail, ActorList } from "@/lib/types";
import IniciativaDetailClient from "@/components/iniciativas/IniciativaDetailClient";

export default async function IniciativaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let iniciativa: IniciativaDetail;
  try {
    iniciativa = await fetchApi<IniciativaDetail>(`/iniciativas/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const actors = await fetchApi<ActorList[]>("/actors");

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

      {/* Header + secciones interactivas (cliente) */}
      <IniciativaDetailClient iniciativa={iniciativa} actors={actors} />
    </div>
  );
}
