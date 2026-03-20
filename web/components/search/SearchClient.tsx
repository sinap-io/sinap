"use client";

import { useState, useTransition } from "react";
import { runSearch } from "@/app/search/actions";
import type { SearchResponse } from "@/lib/types";

const EJEMPLOS = [
  "Necesito validar la estabilidad de un compuesto biológico a distintas temperaturas",
  "Busco manufactura de medicamentos sólidos orales bajo normas ANMAT",
  "Análisis microbiológico de alimentos para exportación",
  "Financiamiento para desarrollo de bioinsumos agrícolas",
];

type Status = "idle" | "loading" | "success" | "error";

export default function SearchClient() {
  const [consulta, setConsulta]   = useState("");
  const [status, setStatus]       = useState<Status>("idle");
  const [result, setResult]       = useState<SearchResponse | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [isPending, startTransition] = useTransition();

  const loading = status === "loading" || isPending;

  function handleExample(text: string) {
    setConsulta(text);
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

  return (
    <div className="space-y-6">
      {/* Ejemplos */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">
          Ejemplos de consultas
        </p>
        <div className="flex flex-wrap gap-2">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej}
              onClick={() => handleExample(ej)}
              className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)]
                         text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)]
                         transition-colors text-left"
            >
              {ej.length > 55 ? ej.slice(0, 55) + "…" : ej}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Ej: necesito un laboratorio que haga análisis microbiológicos de productos lácteos..."
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                     px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] resize-none
                     focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            {consulta.length} / 1000 caracteres
          </span>
          <button
            type="submit"
            disabled={loading || consulta.trim().length < 10}
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all
                       bg-[var(--accent)] text-white hover:opacity-90
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Buscando…" : "Buscar con IA"}
          </button>
        </div>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--text-muted)]">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Analizando el ecosistema con IA…</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Esto puede tardar 10-20 segundos</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && !loading && (
        <div className="rounded-xl border border-[#ef444444] bg-[#ef444411] p-4">
          <p className="text-sm text-[#ef4444]">{errorMsg}</p>
        </div>
      )}

      {/* Resultado */}
      {status === "success" && result && !loading && (
        <div className="space-y-4">
          {/* Banner de cobertura */}
          <CoverageBanner result={result} />

          {/* Respuesta de Claude */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
              Análisis del ecosistema
            </h2>
            <div className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
              {result.respuesta}
            </div>
          </div>

          {/* Gaps detectados */}
          {result.gaps_detectados.length > 0 && (
            <div className="rounded-xl border border-[#ef444444] bg-[#ef444411] p-5">
              <h3 className="text-sm font-semibold text-[#ef4444] mb-3">
                Gaps detectados y registrados
              </h3>
              <ul className="space-y-1">
                {result.gaps_detectados.map((gap, i) => (
                  <li key={i} className="text-sm text-[var(--text-muted)] flex gap-2">
                    <span className="text-[#ef4444] shrink-0">·</span>
                    {gap}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                Estos gaps fueron registrados automáticamente para análisis del ecosistema.
              </p>
            </div>
          )}

          {/* Nueva búsqueda */}
          <button
            onClick={() => { setStatus("idle"); setResult(null); setConsulta(""); }}
            className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            ← Nueva búsqueda
          </button>
        </div>
      )}
    </div>
  );
}

function CoverageBanner({ result }: { result: SearchResponse }) {
  if (result.necesidad_cubierta) {
    return (
      <div className="rounded-xl border border-[#22c55e44] bg-[#22c55e11] px-5 py-3 flex items-center gap-3">
        <span className="text-[#22c55e] text-lg">✓</span>
        <p className="text-sm text-[#22c55e] font-medium">
          Servicios relevantes encontrados en la red
        </p>
      </div>
    );
  }
  if (result.cobertura_parcial) {
    return (
      <div className="rounded-xl border border-[#f9731644] bg-[#f9731611] px-5 py-3 flex items-center gap-3">
        <span className="text-[#f97316] text-lg">⚠</span>
        <p className="text-sm text-[#f97316] font-medium">
          Cobertura parcial — parte de la necesidad está cubierta, parte no
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#ef444444] bg-[#ef444411] px-5 py-3 flex items-center gap-3">
      <span className="text-[#ef4444] text-lg">✗</span>
      <p className="text-sm text-[#ef4444] font-medium">
        Necesidad no cubierta — se registró como gap para análisis del ecosistema
      </p>
    </div>
  );
}
