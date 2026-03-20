import { fetchApi } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import ServicesClient from "@/components/services/ServicesClient";
import { AREA_LABEL } from "@/lib/labels";

export default async function ServicesPage() {
  const services = await fetchApi<ServiceItem[]>("/services");

  // Conteo por área
  const byArea = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.area_tematica] = (acc[s.area_tematica] ?? 0) + 1;
    return acc;
  }, {});
  const topAreas = Object.entries(byArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Servicios del ecosistema</h1>
        <p className="text-[var(--text-muted)] text-sm">
          {services.length} servicios disponibles en la red
        </p>
      </div>

      {/* Top áreas */}
      {topAreas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topAreas.map(([area, count]) => (
            <div
              key={area}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-center"
            >
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                {AREA_LABEL[area] ?? area}
              </div>
            </div>
          ))}
        </div>
      )}

      <ServicesClient services={services} />
    </div>
  );
}
