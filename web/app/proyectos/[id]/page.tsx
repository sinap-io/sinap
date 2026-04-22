export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/api";
import type { ActorList, InstrumentItem, IniciativaList, ProyectoDetail } from "@/lib/types";

type InstrumentoSimple = { id: number; nombre: string; tipo: string };
import ProyectoDetailClient from "@/components/proyectos/ProyectoDetailClient";

export default async function ProyectoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  // invitado y freemium solo ven el listado, no el detalle
  if (rol === "invitado" || rol === "freemium") redirect("/proyectos");

  let proyecto: ProyectoDetail | null = null;
  let actores: Pick<ActorList, "id" | "nombre">[] = [];
  let instrumentos: InstrumentoSimple[] = [];
  let iniciativas: Pick<IniciativaList, "id" | "titulo">[] = [];

  try {
    [proyecto, actores, instrumentos, iniciativas] = await Promise.all([
      fetchApi<ProyectoDetail>(`/proyectos/${id}`),
      fetchApi<ActorList[]>("/actors").then((list) =>
        list.map(({ id, nombre }) => ({ id, nombre }))
      ),
      fetchApi<InstrumentItem[]>("/instruments").then((list) =>
        list.map(({ id, nombre, tipo }) => ({ id, nombre, tipo }))
      ),
      fetchApi<IniciativaList[]>("/iniciativas").then((list) =>
        list.map(({ id, titulo }) => ({ id, titulo }))
      ),
    ]);
  } catch {
    // API no disponible
  }

  if (!proyecto) notFound();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/proyectos" className="hover:text-[var(--accent)] transition-colors">
          Proyectos
        </Link>
        <span>/</span>
        <span className="text-[var(--text)] truncate max-w-[300px]">{proyecto.titulo}</span>
      </div>

      <ProyectoDetailClient
        proyecto={proyecto}
        rol={rol}
        actoresDisponibles={actores}
        instrumentosDisponibles={instrumentos}
        iniciativasDisponibles={iniciativas}
      />
    </div>
  );
}
