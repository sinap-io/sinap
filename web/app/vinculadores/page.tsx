export const dynamic = "force-dynamic";

import { fetchApi } from "@/lib/api";
import type { VinculadorList, ZonaOut } from "@/lib/types";
import VinculadoresClient from "@/components/vinculadores/VinculadoresClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const CAN_VIEW = ["admin", "manager", "directivo", "vinculador"];

export default async function VinculadoresPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const rol = (session.user as { rol?: string }).rol ?? "";
  if (!CAN_VIEW.includes(rol)) redirect("/");

  const [vinculadores, zonas] = await Promise.all([
    fetchApi<VinculadorList[]>("/adit/vinculadores?solo_activos=true"),
    fetchApi<ZonaOut[]>("/zonas"),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Vinculadores</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Gestión y actividad de los vinculadores del Clúster
        </p>
      </div>

      <VinculadoresClient
        vinculadores={vinculadores}
        zonas={zonas}
        rol={rol}
      />
    </div>
  );
}
