export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchApi, ApiError } from "@/lib/api";
import type { IniciativaDetail, ActorList } from "@/lib/types";
import IniciativaDetailClient from "@/components/iniciativas/IniciativaDetailClient";

export default async function IniciativaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  // invitado y freemium solo ven el listado, no el detalle
  if (rol === "invitado" || rol === "freemium") redirect("/iniciativas");
  let iniciativa: IniciativaDetail;
  try {
    iniciativa = await fetchApi<IniciativaDetail>(`/iniciativas/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  let actors: ActorList[] = [];
  try {
    actors = await fetchApi<ActorList[]>("/actors");
  } catch {
    // La iniciativa se muestra igual; solo el dropdown de actores queda vacío
  }

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
