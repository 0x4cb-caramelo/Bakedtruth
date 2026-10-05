"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle, SendHorizontal, Square, X } from "lucide-react";

import type { ChatMessage } from "@/lib/chat";

const SetContext = createContext<(context: string | null) => void>(() => {});

/** Tells the assistant what the current page shows; cleared when the page unmounts. */
export function useChatContext(text: string | null) {
  const set = useContext(SetContext);
  useEffect(() => {
    set(text);
    return () => set(null);
  }, [text, set]);
}

const SUGGESTIONS = [
  "How does a Provable market work?",
  "Why can't a goal be faked?",
  "What happens if nobody resolves in time?",
];
const MARKET_SUGGESTIONS = [
  "Explain this market",
  "What does YES pay if it wins?",
  "What could go wrong for a YES buyer?",
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pageContext, setPageContext] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  const stop = useCallback(() => abort.current?.abort(), []);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setError(null);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: pageContext ?? undefined }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Something went wrong.");
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setMessages((all) => {
          const last = all[all.length - 1]!;
          return [...all.slice(0, -1), { ...last, content: last.content + value }];
        });
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      // Drop an empty assistant bubble (error or stop before any text) so the next send stays valid.
      setMessages((all) => (all[all.length - 1]?.content === "" ? all.slice(0, -1) : all));
      setBusy(false);
      abort.current = null;
    }
  };

  return (
    <SetContext.Provider value={setPageContext}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        {open && (
          <section
            aria-label="Assistant"
            className="flex h-[min(560px,calc(100dvh-6rem))] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">Ask Provable</h2>
                <p className="text-[11px] text-dim">AI explainer · not financial advice · devnet</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-dim hover:bg-raised hover:text-ink"
                aria-label="Close assistant"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-muted">
                    {pageContext ? "I can see the market you are looking at." : "Ask how the markets work."}
                  </p>
                  {(pageContext ? MARKET_SUGGESTIONS : SUGGESTIONS).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="block w-full rounded-lg border border-line px-3 py-2 text-left text-muted hover:border-brand/60 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 ${
                      m.role === "user" ? "bg-brand text-white" : "bg-raised text-ink"
                    }`}
                  >
                    {m.content || <span className="text-dim">Thinking…</span>}
                  </div>
                </div>
              ))}
              {error && <p className="rounded-lg border border-no/30 bg-no/5 px-3 py-2 text-xs text-no">{error}</p>}
              <div ref={bottom} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
                placeholder="Ask a question"
                aria-label="Message"
                className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-page px-3 text-sm text-ink outline-none placeholder:text-dim focus:border-brand/60"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="grid size-10 place-items-center rounded-xl bg-raised text-ink hover:bg-line"
                  aria-label="Stop"
                >
                  <Square className="size-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="grid size-10 place-items-center rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-40"
                  aria-label="Send"
                >
                  <SendHorizontal className="size-4" />
                </button>
              )}
            </form>
          </section>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid size-12 place-items-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-strong"
          aria-label={open ? "Close assistant" : "Open assistant"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        </button>
      </div>
    </SetContext.Provider>
  );
}
