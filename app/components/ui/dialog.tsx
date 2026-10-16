/**
 * Purpose: the dialog of the design (a bottom sheet on phones): the browser's own modal <dialog>, which keeps focus
 *          inside, puts the page behind it out of reach and closes on Escape. `dismissable` false keeps it open while
 *          something must not be interrupted (a transaction in the wallet). Colour from the tokens only. A `badge` sits
 *          beside the title.
 * Version: 0.1.1 (the badge)
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cx } from "./cx";

export function Dialog({
  open,
  title,
  badge,
  onClose,
  dismissable = true,
  children,
}: {
  open: boolean;
  title: string;
  /** A small mark beside the title (the entry review's network). */
  badge?: ReactNode;
  onClose: () => void;
  dismissable?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissable) onClose();
      }}
      className={cx(
        "m-auto w-[min(560px,calc(100vw-32px))] max-h-[min(88vh,820px)] overflow-y-auto rounded-lg border border-line",
        "bg-panel p-0 text-text shadow-[var(--shadow-pop)] backdrop:bg-[var(--scrim)]",
        "max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none",
      )}
    >
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        <div className="flex flex-1 flex-wrap items-center gap-x-2.5 gap-y-1">
          <h2 id={titleId} className="m-0 font-display text-2xl font-bold">
            {title}
          </h2>
          {badge}
        </div>
        {dismissable ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-sm text-muted hover:text-text"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
