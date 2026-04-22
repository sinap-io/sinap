export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import type { GapItem, GapSummary } from "@/lib/types";
import GapsClient from "@/components/gaps/GapsClient";

export default async function GapsPage() {
  const session = await auth();
  if ((session?.user as { rol?: string })?.rol === "freemium") redirect("/");
  let gaps: GapItem[] = [];
  let summary: GapSummary = { total_gaps: 0, total_parcial: 0, total_demanda: 0 };

  try {
    [gaps, summary] = await Promise.all([
      fetchApi<GapItem[]>("/gaps?solo_sin_oferta=false"),
      fetchApi<GapSummary>("/gaps/summary"),
    ]);
  } catch {
    // API caída — muestra la página con datos vacíos
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Gaps de oferta</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-2xl">
          Necesidades activas en la red sin cobertura disponible.
          Oportunidades de inversión e incorporación de nuevos actores al ecosistema.
        </p>
      </div>

      <GapsClient gaps={gaps} summary={summary} />
    </div>
  );
}
