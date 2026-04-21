"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, RotateCcw, Loader2 } from "lucide-react";
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
    <div className="flex gap-3 max-w-3xl">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ background: S.accent }}
      >
        S
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap flex-1"
        style={{ background: "#f0fdf9", border: `1px solid ${S.border}`, color: S.navy }}
      >
        {content}
      </div>
    </div>
  );
}

function BubbleUsuario({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap max-w-xl"
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

  return (
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
        <button
          onClick={resetear}
          title="Nueva conversación"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-slate-50"
          style={{ color: S.muted, border: `1px solid ${S.border}` }}
        >
          <RotateCcw size={12} />
          Nueva consulta
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
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
              <span className="text-xs" style={{ color: S.muted }}>Buscando en el ecosistema…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-6 py-4"
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
  );
}
