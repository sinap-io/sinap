export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";
import type { VinculadorItem } from "@/lib/types";
import NuevaIniciativaClient from "@/components/iniciativas/NuevaIniciativaClient";

export default async function NuevaIniciativaPage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!["admin", "directivo", "vinculador"].includes(rol)) {
    redirect("/iniciativas");
  }

  let vinculadores: VinculadorItem[] = [];
  try {
    vinculadores = await fetchApi<VinculadorItem[]>("/vinculador/operadores");
  } catch {
    // API no disponible aún
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/iniciativas" className="hover:text-[var(--accent)] transition-colors">
          Iniciativas
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nueva iniciativa</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Registrar iniciativa</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Seleccioná el tipo de iniciativa y completá los datos básicos. Luego podrás agregar actores, hitos y vínculos.
        </p>
      </div>

      <NuevaIniciativaClient vinculadores={vinculadores} />
    </div>
  );
}
