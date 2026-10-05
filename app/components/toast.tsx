"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, ExternalLink, X } from "lucide-react";

export type Toast = { kind: "success" | "error"; title: string; description?: string; href?: string };
type Shown = Toast & { id: number };

const ToastContext = createContext<(toast: Toast) => void>(() => {});

/** Shows a toast for a few seconds; errors stay longer. */
export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Shown[]>([]);
  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (toast: Toast) => {
      const id = nextId++;
      setToasts((all) => [...all.slice(-3), { ...toast, id }]);
      setTimeout(() => dismiss(id), toast.kind === "error" ? 10_000 : 6_000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl shadow-black/40 backdrop-blur"
          >
            {t.kind === "success" ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            ) : (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-400" />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-zinc-100">{t.title}</p>
              {t.description && <p className="mt-0.5 break-words text-zinc-400">{t.description}</p>}
              {t.href && (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  View transaction <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="h-fit rounded p-0.5 text-zinc-500 hover:text-zinc-200"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
