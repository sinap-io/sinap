export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { fetchApi, ApiError } from "@/lib/api";
import type { VinculadorDetail, ZonaOut } from "@/lib/types";
import { auth } from "@/auth";
import VinculadorDetailClient from "@/components/vinculadores/VinculadorDetailClient";

const CAN_VIEW = ["admin", "manager", "directivo", "vinculador"];

export default async function VinculadorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const rol = (session.user as { rol?: string }).rol ?? "";
  if (!CAN_VIEW.includes(rol)) redirect("/");

  const { id } = await params;

  let vinculador: VinculadorDetail;
  let zonas: ZonaOut[];

  try {
    [vinculador, zonas] = await Promise.all([
      fetchApi<VinculadorDetail>(`/adit/vinculadores/${id}`),
      fetchApi<ZonaOut[]>("/zonas"),
    ]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const canManage = ["admin", "manager"].includes(rol);

  return (
    <div className="space-y-8 max-w-4xl">
      <Link href="/vinculadores" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
        ← Volver a Vinculadores
      </Link>

      <VinculadorDetailClient
        vinculador={vinculador}
        zonas={zonas}
        canManage={canManage}
      />
    </div>
  );
}
