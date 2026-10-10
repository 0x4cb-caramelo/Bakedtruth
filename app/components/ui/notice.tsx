/**
 * Purpose: the notice: a short message in one of three tones (info, warn, danger), with its icon and text, so colour is never the only signal. A close button is optional.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";

export type NoticeTone = "info" | "warn" | "danger";

const TONE: Record<NoticeTone, string> = {
  info: "bg-notice-bg text-text",
  warn: "bg-st-review-bg text-st-review-fg",
  danger: "bg-danger-bg text-error",
};

export function Notice({
  tone = "info",
  icon,
  onClose,
  children,
}: {
  tone?: NoticeTone;
  icon?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <div role={tone === "info" ? "status" : "alert"} className={cx("flex items-start gap-2.5 rounded-sm px-3.5 py-2.5 text-[12.5px]", TONE[tone])}>
      {icon ? <span className="mt-px shrink-0 [&>svg]:size-4">{icon}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Close" className="ml-auto text-lg leading-none">
          ×
        </button>
      ) : null}
    </div>
  );
}
