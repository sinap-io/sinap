export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import RadarClient from "@/components/radar/RadarClient";

const TEMAS = [
  { id: "biosensores", label: "Biosensores" },
  { id: "biofarma", label: "Biofarma" },
  { id: "agroindustria", label: "Agroindustria" },
  { id: "diagnostico_molecular", label: "Diagnóstico molecular" },
  { id: "nanobiotecnologia", label: "Nanobiotecnología" },
];

interface RadarData {
  radar: string;
  tema: string;
  tema_label: string;
  generado_en: string;
  trimestre: string;
}

export default async function RadarPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const session = await auth();
  const rol = (session?.user as { rol?: string })?.rol ?? "";

  if (!["admin", "directivo", "vinculador"].includes(rol)) {
    redirect("/");
  }

  const params = await searchParams;
  const temaActivo = params.tema ?? "biosensores";

  let data: RadarData | null = null;
  let error: string | null = null;

  try {
    data = await fetchApi<RadarData>(`/radar?tema=${temaActivo}`);
  } catch {
    error = "No se pudo generar el radar. Intentá de nuevo en unos segundos.";
  }

  const emitidoEn = data?.generado_en
    ? new Date(data.generado_en).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-1">
          Inteligencia sectorial
        </p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          Radar del sector
        </h1>
        <div className="flex flex-col gap-1">
          {data?.trimestre && (
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {data.trimestre}
            </p>
          )}
          {emitidoEn && (
            <p className="text-xs text-[var(--text-muted)]">
              Emitido el {emitidoEn}
            </p>
          )}
        </div>
      </div>

      {/* Selector de tema */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TEMAS.map((t) => (
          <a
            key={t.id}
            href={`/radar?tema=${t.id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              temaActivo === t.id
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Contenido */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 text-sm">
          {error}
        </div>
      ) : data ? (
        <RadarClient
          radar={data.radar}
          tema={data.tema}
          temaActivo={temaActivo}
          emitidoEn={emitidoEn ?? ""}
          trimestre={data.trimestre}
        />
      ) : null}
    </div>
  );
}
