export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";
import type { IniciativaList } from "@/lib/types";
import NuevoProyectoClient from "@/components/proyectos/NuevoProyectoClient";

const CAN_MANAGE = ["admin", "manager", "directivo", "vinculador"];

export default async function NuevoProyectoPage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (!CAN_MANAGE.includes(rol)) redirect("/proyectos");

  let iniciativas: Pick<IniciativaList, "id" | "titulo">[] = [];
  try {
    const list = await fetchApi<IniciativaList[]>("/iniciativas");
    iniciativas = list.map(({ id, titulo }) => ({ id, titulo }));
  } catch {
    // API no disponible
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/proyectos" className="hover:text-[var(--accent)] transition-colors">
          Proyectos
        </Link>
        <span>/</span>
        <span className="text-[var(--text)]">Nuevo proyecto</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Registrar proyecto</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Completá los datos básicos. Luego podrás agregar actores participantes e instrumentos de financiamiento.
        </p>
      </div>

      <NuevoProyectoClient iniciativas={iniciativas} />
    </div>
  );
}
