"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, RotateCcw, Loader2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { enviarMensaje, type MensajeChat } from "./actions";

const WELCOME = `Hola. Soy el asistente del ecosistema SINAP.

Describime lo que buscás — puede ser una palabra, una situación o una pregunta — y cruzo toda la información del Clúster para encontrar lo que necesitás.`;

const S = {
  accent: "#0d9488",
  navy:   "#1e3a5f",
  muted:  "#5a7a9a",
  border: "#e2e8f0",
};

function BubbleAsistente({ content }: { content: string }) {
  return (
    <div className="flex gap-3 max-w-3xl print-message">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 print:hidden"
        style={{ background: S.accent }}
      >
        S
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed flex-1"
        style={{ background: "#f0fdf9", border: `1px solid ${S.border}`, color: S.navy }}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong style={{ color: S.navy, fontWeight: 600 }}>{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            h2: ({ children }) => (
              <h2 className="font-semibold text-sm mt-3 mb-1 first:mt-0" style={{ color: S.navy }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-medium text-sm mt-2 mb-1" style={{ color: S.accent }}>
                {children}
              </h3>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function BubbleUsuario({ content }: { content: string }) {
  return (
    <div className="flex justify-end print-message">
      <div
        className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed max-w-xl"
        style={{ background: S.accent, color: "#fff" }}
      >
        {content}
      </div>
    </div>
  );
}

export default function AsistenteChat() {
  const [displayed, setDisplayed] = useState<MensajeChat[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [history, setHistory] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayed, isPending]);

  function resetear() {
    setDisplayed([{ role: "assistant", content: WELCOME }]);
    setHistory([]);
    setInput("");
    textareaRef.current?.focus();
  }

  function descargar() {
    window.print();
  }

  function enviar() {
    const texto = input.trim();
    if (!texto || isPending) return;

    const userMsg: MensajeChat = { role: "user", content: texto };
    const newHistory = [...history, userMsg];

    setDisplayed(prev => [...prev, userMsg]);
    setHistory(newHistory);
    setInput("");

    startTransition(async () => {
      const result = await enviarMensaje(newHistory);
      const assistantMsg: MensajeChat = {
        role: "assistant",
        content: result.respuesta,
      };
      setDisplayed(prev => [...prev, assistantMsg]);
      if (result.ok) {
        setHistory(prev => [...prev, assistantMsg]);
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  const tieneConversacion = history.length > 0;

  // Para el PDF: último mensaje del asistente + la consulta que lo generó
  const reversed = [...displayed].slice().reverse();
  const ultimaRespuesta = reversed.find(m => m.role === "assistant");
  const ultimaConsulta  = reversed.find(m => m.role === "user");
  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .sinap-print, .sinap-print * { visibility: visible; }
          .sinap-print {
            position: absolute; top: 0; left: 0; width: 100%;
            padding: 2.5rem; font-family: sans-serif;
          }
        }
      `}</style>

      <div className="md:ml-60 flex flex-col h-screen pt-14 md:pt-0">
        {/* Header */}
        <div
          className="shrink-0 px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${S.border}`, background: "#fff" }}
        >
          <div>
            <h1 className="text-base font-semibold" style={{ color: S.navy }}>
              Asistente del Ecosistema
            </h1>
            <p className="text-xs mt-0.5" style={{ color: S.muted }}>
              Consultá sobre actores, proyectos, financiamiento e iniciativas del Clúster
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tieneConversacion && (
              <button
                onClick={descargar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-slate-50"
                style={{ color: S.accent, border: `1px solid ${S.accent}` }}
              >
                <Download size={12} />
                Descargar PDF
              </button>
            )}
            <button
              onClick={resetear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-slate-50"
              style={{ color: S.muted, border: `1px solid ${S.border}` }}
            >
              <RotateCcw size={12} />
              Nueva consulta
            </button>
          </div>
        </div>

        {/* Sección solo visible al imprimir — último resultado limpio */}
        {ultimaRespuesta && ultimaConsulta && (
          <div className="sinap-print hidden print:block">
            <div style={{ borderBottom: `2px solid ${S.accent}`, paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, color: S.navy }}>
                Consulta al Asistente — Clúster Biotecnología de Córdoba
              </p>
              <p style={{ fontSize: "0.8rem", color: S.muted, marginTop: "0.25rem" }}>{fechaHoy}</p>
            </div>
            <div style={{ background: "#f8fafc", border: `1px solid ${S.border}`, borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.7rem", color: S.muted, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Consulta</p>
              <p style={{ fontSize: "0.9rem", color: S.navy }}>{ultimaConsulta.content}</p>
            </div>
            <div style={{ fontSize: "0.875rem", lineHeight: 1.7, color: S.navy }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ marginBottom: "0.75rem" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ paddingLeft: "1.25rem", marginBottom: "0.75rem" }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: "1.25rem", marginBottom: "0.75rem" }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: "0.25rem" }}>{children}</li>,
                  h2: ({ children }) => <h2 style={{ fontWeight: 700, fontSize: "0.9rem", marginTop: "1.25rem", marginBottom: "0.5rem", color: S.navy, textTransform: "uppercase", letterSpacing: "0.03em" }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontWeight: 600, marginTop: "1rem", marginBottom: "0.25rem" }}>{children}</h3>,
                }}
              >
                {ultimaRespuesta.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Mensajes — pantalla */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 print:hidden">
          {displayed.map((msg, i) =>
            msg.role === "assistant" ? (
              <BubbleAsistente key={i} content={msg.content} />
            ) : (
              <BubbleUsuario key={i} content={msg.content} />
            )
          )}

          {isPending && (
            <div className="flex gap-3 max-w-3xl">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ background: S.accent }}
              >
                S
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2"
                style={{ background: "#f0fdf9", border: `1px solid ${S.border}` }}
              >
                <Loader2 size={14} className="animate-spin" style={{ color: S.accent }} />
                <span className="text-xs" style={{ color: S.muted }}>
                  Buscando en el ecosistema…
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="shrink-0 px-6 py-4 print:hidden"
          style={{ borderTop: `1px solid ${S.border}`, background: "#fff" }}
        >
          <div
            className="flex gap-3 items-end rounded-xl px-4 py-3"
            style={{ border: `1.5px solid ${S.border}`, background: "#fafafa" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describí lo que buscás o tu situación… (Enter para enviar)"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{ color: S.navy, maxHeight: "120px" }}
              disabled={isPending}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || isPending}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: input.trim() && !isPending ? S.accent : S.border,
                color: input.trim() && !isPending ? "#fff" : S.muted,
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: S.muted }}>
            Shift + Enter para nueva línea · Solo información del ecosistema SINAP
          </p>
        </div>
      </div>
    </>
  );
}
