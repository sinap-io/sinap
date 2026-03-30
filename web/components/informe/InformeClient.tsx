"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ReactMarkdown from "react-markdown";

export default function InformeClient({ informe }: { informe: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function regenerar() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div>
      {/* Informe en markdown */}
      <div className="prose prose-sm max-w-none
        prose-headings:text-[var(--text-primary)] prose-headings:font-semibold
        prose-p:text-[var(--text-muted)] prose-p:leading-relaxed
        prose-strong:text-[var(--text-primary)]
        prose-ul:text-[var(--text-muted)]
        prose-li:marker:text-[var(--accent)]">
        <ReactMarkdown>{informe}</ReactMarkdown>
      </div>

      {/* Botón regenerar */}
      <div className="mt-10 pt-6 border-t border-[var(--border)]">
        <button
          onClick={regenerar}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-teal-50 transition disabled:opacity-50"
        >
          {isPending ? "Generando..." : "↻ Regenerar informe"}
        </button>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Cada regeneración consulta el estado actual de la base de datos y genera un nuevo análisis con IA.
        </p>
      </div>
    </div>
  );
}
