export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InformeClient from "@/components/informe/InformeClient";
import { fetchApi } from "@/lib/api";

interface InformeData {
  informe: string;
  generado_en: string;
  datos: {
    total_actores: number;
    total_capacidades: number;
    total_necesidades_activas: number;
    total_gaps: number;
    total_instrumentos_activos: number;
    total_iniciativas_activas: number;
  };
}

export default async function InformePage() {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";

  // Solo admin y directivo pueden ver el informe
  if (!["admin", "directivo", "vinculador"].includes(rol)) {
    redirect("/");
  }

  let data: InformeData | null = null;
  let error: string | null = null;

  try {
    data = await fetchApi<InformeData>("/informe");
  } catch {
    error = "No se pudo generar el informe. Intentá de nuevo en unos segundos.";
  }

  const fechaCorte = data?.generado_en
    ? (() => {
        const d = new Date(data.generado_en);
        // Semana del lunes al domingo
        const dayOfWeek = d.getDay(); // 0=dom, 1=lun...
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (dt: Date) => dt.toLocaleDateString("es-AR", { day: "2-digit", month: "long" });
        return `Semana del ${fmt(monday)} al ${fmt(sunday)}, ${d.getFullYear()}`;
      })()
    : null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-1">
          Inteligencia del ecosistema
        </p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Informe semanal
        </h1>
        {fechaCorte && (
          <p className="text-sm text-[var(--text-muted)]">
            {fechaCorte}
          </p>
        )}
      </div>

      {/* Métricas resumen */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Actores", value: data.datos.total_actores },
            { label: "Capacidades", value: data.datos.total_capacidades },
            { label: "Necesidades activas", value: data.datos.total_necesidades_activas },
            { label: "Gaps detectados", value: data.datos.total_gaps },
            { label: "Fondos activos", value: data.datos.total_instrumentos_activos },
            { label: "Iniciativas activas", value: data.datos.total_iniciativas_activas },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border border-[var(--border)] rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wide">{label}</div>
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
        <InformeClient informe={data.informe} />
      ) : null}
    </div>
  );
}
