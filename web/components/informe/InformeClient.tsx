"use client";

import { useTransition, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { triggerActualizarInforme } from "@/app/informe/actions";

const components: Components = {
  h2: ({ children }) => (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mt-8 mb-3 pb-2 border-b border-[var(--border)]"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2"
      style={{ color: "var(--text)" }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "var(--text)", fontWeight: 600 }}>{children}</strong>
  ),
  ul: ({ children }) => <ul className="space-y-1 mb-3 pl-4">{children}</ul>,
  li: ({ children }) => (
    <li
      className="text-sm leading-relaxed list-none relative pl-3 before:content-['—'] before:absolute before:left-0 before:text-[var(--accent)]"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </li>
  ),
  hr: () => <hr className="border-[var(--border)] my-6" />,
};

interface Props {
  informe: string;
  periodo: string;
  emitidoEn: string;
  rol: string;
}

const PUEDE_ACTUALIZAR = ["admin", "manager"];

type GeneratingState = "idle" | "triggering" | "countdown" | "error";

export default function InformeClient({ informe, periodo, emitidoEn, rol }: Props) {
  const [isPending, startTransition] = useTransition();
  const [genState, setGenState] = useState<GeneratingState>("idle");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cuenta regresiva → recarga la página cuando llega a 0
  useEffect(() => {
    if (genState !== "countdown") return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [genState, countdown]);

  function regenerar() {
    setError(null);
    setGenState("triggering");
    startTransition(async () => {
      try {
        const { eta } = await triggerActualizarInforme();
        // Railway confirmó que arrancó la generación — mostrar cuenta regresiva
        setCountdown(eta);
        setGenState("countdown");
      } catch {
        setGenState("error");
        setError("No se pudo iniciar la actualización. Revisá la conexión e intentá de nuevo.");
      }
    });
  }

  function descargarPDF() {
    window.print();
  }

  return (
    <>
      {/* Contenido imprimible */}
      <div id="informe-print">
        {/* Encabezado solo visible al imprimir */}
        <div className="print-header hidden print:block mb-6 pb-4 border-b border-gray-300">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
            Clúster de Biotecnología de Córdoba — sinap.io
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Informe semanal</h1>
          <p className="text-sm font-medium text-gray-700">{periodo}</p>
          <p className="text-xs text-gray-500">Emitido el {emitidoEn}</p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] px-8 py-6 print:border-none print:px-0 print:py-0">
          <ReactMarkdown components={components}>{informe}</ReactMarkdown>
        </div>
      </div>

      {/* Controles (ocultos al imprimir) */}
      <div className="mt-6 flex flex-col gap-3 print:hidden">

        {/* Banda de cuenta regresiva */}
        {genState === "countdown" && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                Generando informe con IA…
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                La página se actualizará automáticamente en {countdown} segundos.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {PUEDE_ACTUALIZAR.includes(rol) && (
            <button
              onClick={regenerar}
              disabled={isPending || genState === "countdown"}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {genState === "triggering" && isPending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando…
                </>
              ) : "↻ Actualizar"}
            </button>
          )}
          <button
            onClick={descargarPDF}
            disabled={genState === "countdown"}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:bg-teal-700 transition disabled:opacity-50"
          >
            ↓ Descargar PDF
          </button>
          {PUEDE_ACTUALIZAR.includes(rol) && genState === "idle" && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              El informe se actualiza automáticamente cada día. Usá Actualizar para forzar regeneración.
            </p>
          )}
        </div>

        {genState === "error" && error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #informe-print, #informe-print * { visibility: visible; }
          #informe-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; }
          aside, nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
