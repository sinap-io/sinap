export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InformeClient from "@/components/informe/InformeClient";
import { fetchApi } from "@/lib/api";

interface InformeData {
  informe: string;
  generado_en: string;
  periodo: string;
  datos: {
    total_actores: number;
    total_capacidades: number;
    total_necesidades_activas: number;
    total_gaps: number;
    total_instrumentos_activos: number;
    total_iniciativas_activas: number;
    total_proyectos: number;
  };
}

export default async function InformePage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>;
}) {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";

  if (!["admin", "manager", "directivo", "vinculador"].includes(rol)) {
    redirect("/");
  }

  const params = await searchParams;
  const force = params.force === "true";

  let data: InformeData | null = null;
  let error: string | null = null;

  try {
    const url = force ? "/informe?force=true" : "/informe";
    data = await fetchApi<InformeData>(url);
  } catch {
    error = "No se pudo generar el informe. Intentá de nuevo en unos segundos.";
  }

  // Fecha de emisión formateada
  const emitidoEn = data?.generado_en
    ? new Date(data.generado_en).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const metricas = data
    ? [
        { label: "Ofertas", value: data.datos.total_capacidades },
        { label: "Demandas activas", value: data.datos.total_necesidades_activas },
        { label: "Gaps detectados", value: data.datos.total_gaps },
        { label: "Fondos activos", value: data.datos.total_instrumentos_activos },
        { label: "Iniciativas activas", value: data.datos.total_iniciativas_activas },
        { label: "Proyectos", value: data.datos.total_proyectos ?? 0 },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-1">
          Inteligencia del ecosistema
        </p>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
          Informe semanal
        </h1>

        {/* Período + fecha de emisión */}
        <div className="flex flex-col gap-1">
          {data?.periodo && (
            <p className="text-sm font-medium text-[var(--text)]">
              {data.periodo}
            </p>
          )}
          {emitidoEn && (
            <p className="text-xs text-[var(--text-muted)]">
              Emitido el {emitidoEn}
            </p>
          )}
        </div>
      </div>

      {/* Métricas resumen */}
      {data && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {metricas.map(({ label, value }) => (
            <div
              key={label}
              className="border border-[var(--border)] rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wide leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informe narrativo */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
          {error}
        </div>
      ) : data ? (
        <InformeClient
          informe={data.informe}
          periodo={data.periodo}
          emitidoEn={emitidoEn ?? ""}
          rol={rol}
        />
      ) : null}
    </div>
  );
}
