export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import type { ActorList, ProyectoList } from "@/lib/types";
import ProyectosClient from "@/components/proyectos/ProyectosClient";

const CAN_MANAGE = ["admin", "manager", "directivo", "vinculador"];

export default async function ProyectosPage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";
  if (rol === "freemium") redirect("/");
  let proyectos: ProyectoList[] = [];
  let actores: Pick<ActorList, "id" | "nombre">[] = [];

  try {
    [proyectos, actores] = await Promise.all([
      fetchApi<ProyectoList[]>("/proyectos"),
      fetchApi<ActorList[]>("/actors").then((list) =>
        list.map(({ id, nombre }) => ({ id, nombre }))
      ),
    ]);
  } catch {
    // API no disponible
  }

  const metricas = {
    activos:                 proyectos.filter((p) => p.estado === "activo").length,
    busca_financiamiento:    proyectos.filter((p) => p.apoyos_buscados.includes("financiamiento")).length,
    busca_socio:             proyectos.filter((p) => p.apoyos_buscados.includes("socio_tecnologico")).length,
    finalizado:              proyectos.filter((p) => p.estado === "finalizado").length,
  };

  const rol = (session?.user as { rol?: string })?.rol ?? "";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Proyectos</h1>
          <p className="text-[var(--text-muted)] text-sm">
            {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} registrado{proyectos.length !== 1 ? "s" : ""}
          </p>
        </div>
        {CAN_MANAGE.includes(rol) && (
          <Link
            href="/proyectos/nuevo"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                       hover:opacity-90 transition-opacity"
          >
            + Nuevo proyecto
          </Link>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Activos",              value: metricas.activos,              color: "#3b82f6" },
          { label: "Buscan financiamiento",value: metricas.busca_financiamiento, color: "#eab308" },
          { label: "Buscan socio",         value: metricas.busca_socio,          color: "#a855f7" },
          { label: "Finalizados",          value: metricas.finalizado,           color: "#22c55e" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-center"
            style={{ borderTopColor: color, borderTopWidth: "2px" }}
          >
            <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Lista con filtros */}
      <ProyectosClient proyectos={proyectos} actores={actores} />
    </div>
  );
}
