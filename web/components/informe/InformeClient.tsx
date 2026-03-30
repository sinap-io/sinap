"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mt-8 mb-3 pb-2 border-b border-[var(--border)]"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{children}</strong>
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
}

export default function InformeClient({ informe, periodo, emitidoEn }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function regenerar() {
    startTransition(() => router.refresh());
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
      <div className="mt-6 flex items-center gap-3 print:hidden">
        <button
          onClick={regenerar}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-teal-50 transition disabled:opacity-50"
        >
          {isPending ? "Generando..." : "↻ Regenerar"}
        </button>
        <button
          onClick={descargarPDF}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:bg-teal-700 transition"
        >
          ↓ Descargar PDF
        </button>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Consulta el estado actual y genera un nuevo análisis con IA.
        </p>
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
