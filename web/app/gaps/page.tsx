import { fetchApi } from "@/lib/api";
import type { GapItem, GapSummary } from "@/lib/types";
import GapsClient from "@/components/gaps/GapsClient";

export default async function GapsPage() {
  const [gaps, summary] = await Promise.all([
    fetchApi<GapItem[]>("/gaps?solo_sin_oferta=false"),
    fetchApi<GapSummary>("/gaps/summary"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Gaps de oferta</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-2xl">
          Necesidades activas en la red sin cobertura disponible.
          Oportunidades de inversión e incorporación de nuevos actores al ecosistema.
        </p>
      </div>

      <GapsClient gaps={gaps} summary={summary} />
    </div>
  );
}
