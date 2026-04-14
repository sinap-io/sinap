export const dynamic = "force-dynamic";

import { fetchApi } from "@/lib/api";
import type { VinculadorList, ActividadResumen, ZonaOut } from "@/lib/types";
import AditClient from "@/components/adit/AditClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const CAN_VIEW = ["admin", "manager", "directivo", "vinculador"];

export default async function AditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const rol = (session.user as { rol?: string }).rol ?? "";
  if (!CAN_VIEW.includes(rol)) redirect("/");

  const [vinculadores, resumen, zonas] = await Promise.all([
    fetchApi<VinculadorList[]>("/adit/vinculadores?solo_activos=false"),
    fetchApi<ActividadResumen>("/adit/resumen"),
    fetchApi<ZonaOut[]>("/zonas?solo_activas=false"),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Panel ADIT</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Actividad de los vinculadores del Clúster
        </p>
      </div>

      <AditClient
        vinculadores={vinculadores}
        resumen={resumen}
        zonas={zonas}
        rol={rol}
      />
    </div>
  );
}
