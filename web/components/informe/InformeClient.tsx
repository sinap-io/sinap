"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="text-xs font-semibold uppercase tracking-widest mt-8 mb-3 pb-2 border-b border-[var(--border)]"
        style={{ color: "var(--accent)" }}>
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
  ul: ({ children }) => (
    <ul className="space-y-1 mb-3 pl-4">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed list-none relative pl-3 before:content-['—'] before:absolute before:left-0 before:text-[var(--accent)]"
        style={{ color: "var(--text-muted)" }}>
      {children}
    </li>
  ),
  hr: () => <hr className="border-[var(--border)] my-6" />,
};

export default function InformeClient({ informe }: { informe: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function regenerar() {
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-[var(--border)] px-8 py-6">
        <ReactMarkdown components={components}>{informe}</ReactMarkdown>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={regenerar}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-teal-50 transition disabled:opacity-50"
        >
          {isPending ? "Generando..." : "↻ Regenerar informe"}
        </button>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Consulta el estado actual de la base de datos y genera un nuevo análisis con IA.
        </p>
      </div>
    </div>
  );
}
