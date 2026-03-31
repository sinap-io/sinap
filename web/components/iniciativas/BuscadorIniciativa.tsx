"use client";

import { useState, useTransition } from "react";
import { runSearch } from "@/app/search/actions";
import type { SearchResponse } from "@/lib/types";
import { Search } from "lucide-react";

const BUSQUEDAS_RAPIDAS = [
  { label: "Actores que ofrecen servicios relacionados", prefijo: "Busco actores del ecosistema biotech que ofrezcan servicios de " },
  { label: "Empresas con demanda similar", prefijo: "Qué empresas o actores tienen necesidad de " },
  { label: "Investigadores o laboratorios en el área", prefijo: "Necesito investigadores o laboratorios especializados en " },
  { label: "Instrumentos de financiamiento que aplican", prefijo: "Financiamiento disponible para un proyecto de " },
];

type Status = "idle" | "loading" | "success" | "error";

export default function BuscadorIniciativa({ tituloIniciativa }: { tituloIniciativa: string }) {
  const [abierto, setAbierto]     = useState(false);
  const [consulta, setConsulta]   = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [result, setResult]       = useState<SearchResponse | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [isPending, startTransition] = useTransition();

  const loading = status === "loading" || isPending;

  function handleRapida(prefijo: string) {
    setConsulta(prefijo + tituloIniciativa);
    setStatus("idle");
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consulta.trim() || loading) return;

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    startTransition(async () => {
      const res = await runSearch(consulta);
      if (res.ok) {
        setResult(res.data);
        setStatus("success");
      } else {
        setErrorMsg(res.message);
        setStatus("error");
      }
    });
  }

  const inputCls = `w-full rounded-lg border border-[var(--border)] bg-white
    px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)]
    focus:outline-none focus:border-[var(--accent)]`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      {/* Header colapsable */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Search size={15} className="text-[var(--accent)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Buscar en el ecosistema
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)]">
          {/* Búsquedas rápidas */}
          <div className="pt-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Búsquedas rápidas</p>
            <div className="flex flex-wrap gap-2">
              {BUSQUEDAS_RAPIDAS.map(({ label, prefijo }) => (
                <button
                  key={label}
                  onClick={() => handleRapida(prefijo)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--accent)]/40
                             text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Input de búsqueda */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Describí qué necesitás encontrar..."
              className={`${inputCls} flex-1`}
            />
            <button
              type="submit"
              disabled={!consulta.trim() || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent)]
                         hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
          </form>

          {/* Resultado */}
          {status === "error" && (
            <div className="rounded-lg border border-[#ef444444] bg-[#ef444411] px-4 py-3">
              <p className="text-sm text-[#ef4444]">{errorMsg}</p>
            </div>
          )}

          {status === "success" && result && (
            <div className="rounded-lg border border-[var(--border)] bg-white p-4 space-y-3">
              {/* Cobertura */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={
                    result.necesidad_cubierta
                      ? { background: "#dcfce7", color: "#16a34a" }
                      : result.cobertura_parcial
                      ? { background: "#fef9c3", color: "#ca8a04" }
                      : { background: "#fee2e2", color: "#dc2626" }
                  }
                >
                  {result.necesidad_cubierta
                    ? "✓ Cubierto en el ecosistema"
                    : result.cobertura_parcial
                    ? "~ Cobertura parcial"
                    : "✗ Sin cobertura detectada"}
                </span>
              </div>

              {/* Texto de la IA */}
              <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
                {result.respuesta}
              </p>

              {/* Gaps */}
              {result.gaps_detectados.length > 0 && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">
                    Gaps detectados:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.gaps_detectados.map((g) => (
                      <span
                        key={g}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#ef444411] text-[#ef4444]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
