"use client";

import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Props {
  radar: string;
  tema: string;
  temaActivo: string;
  emitidoEn: string;
  trimestre: string;
  rol: string;
}

const mdComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-bold text-[var(--text-primary)] mt-8 mb-3 pb-2 border-b border-[var(--border)]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-[var(--text-primary)] mt-5 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-2 mb-4">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex gap-2 text-sm text-[var(--text-secondary)] leading-relaxed">
      <span className="text-[var(--accent)] mt-0.5 shrink-0">—</span>
      <span>{children}</span>
    </li>
  ),
  hr: () => <hr className="border-[var(--border)] my-6" />,
};

const PUEDE_REGENERAR = ["admin", "manager"];

export default function RadarClient({ radar, temaActivo, emitidoEn, trimestre, rol }: Props) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Acciones */}
      <div className="flex gap-3 mb-8 print:hidden">
        {PUEDE_REGENERAR.includes(rol) && (
          <button
            onClick={() => router.push(`/radar?tema=${temaActivo}&force=true`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            ↻ Regenerar
          </button>
        )}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          ↓ Descargar PDF
        </button>
      </div>

      {/* Informe */}
      <article className="radar-print">
        <div className="print:block hidden mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Radar del Sector — Clúster de Biotecnología de Córdoba
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {trimestre} · Emitido el {emitidoEn}
          </p>
        </div>
        <ReactMarkdown components={mdComponents}>{radar}</ReactMarkdown>
      </article>

      <style jsx global>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          .radar-print { padding: 0; }
          body { background: white; }
        }
      `}</style>
    </>
  );
}
