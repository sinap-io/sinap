import Link from "next/link";
import { fetchApi } from "@/lib/api";
import type { ActorList, ActorDetail, VinculadorItem } from "@/lib/types";
import NuevoCasoClient from "@/components/vinculador/NuevoCasoClient";

export default async function NuevoCasoPage() {
  const [actors, vinculadores] = await Promise.all([
    fetchApi<ActorList[]>("/actors"),
    fetchApi<VinculadorItem[]>("/vinculador/operadores"),
  ]);

  // Pre-cargar necesidades y capacidades de todos los actores
  const detailResults = await Promise.allSettled(
    actors.map((a) => fetchApi<ActorDetail>(`/actors/${a.id}`))
  );

  const actorDetails: ActorDetail[] = detailResults
    .filter((r): r is PromiseFulfilledResult<ActorDetail> => r.status === "fulfilled")
    .map((r) => r.value);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/vinculador" className="hover:text-[var(--accent)] transition-colors">
          Vinculador
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nuevo caso</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Abrir nuevo caso</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Registrá una vinculación entre un actor con una necesidad y uno que puede satisfacerla.
        </p>
      </div>

      <NuevoCasoClient
        actors={actors}
        actorDetails={actorDetails}
        vinculadores={vinculadores}
      />
    </div>
  );
}
