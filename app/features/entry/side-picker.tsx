/**
 * Purpose: YES or NO in the entry panel: each side with its chance (its share of the entries) and its estimated return
 *          per 1 for a 1 SOL entry, or "refund if alone" while the other side is empty. Never a price in cents: the
 *          chance is not a price (P1 §3.2). aria-pressed marks the chosen side; the word, not the colour, says which.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { cx } from "@/components/ui/cx";
import { PANEL } from "./copy";
import type { EntrySide } from "./estimate";

export type SideView = { side: EntrySide; chance: number | null; perOne: string | null; alone: boolean };

export function SidePicker({
  value,
  views,
  onChange,
  disabled,
}: {
  value: EntrySide;
  views: readonly SideView[];
  onChange: (side: EntrySide) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={PANEL.sideGroup} className="grid grid-cols-2 gap-2">
      {views.map((view) => (
        <button
          key={view.side}
          type="button"
          aria-pressed={value === view.side}
          disabled={disabled}
          onClick={() => onChange(view.side)}
          className={cx(
            "flex min-h-14 flex-col items-start gap-0.5 rounded-sm px-3 py-2 text-left disabled:opacity-60",
            "hover:brightness-110 light:hover:brightness-95",
            view.side === "yes" ? "bg-yes-bg text-yes-fg" : "bg-no-bg text-no-fg",
            value === view.side && "shadow-[inset_0_0_0_2px_currentColor]",
          )}
        >
          <span className="flex w-full items-baseline justify-between font-display text-xl font-bold">
            <span>{view.side.toUpperCase()}</span>
            {view.chance !== null ? <span className="text-base tabular-nums">{view.chance}%</span> : null}
          </span>
          <span className="text-xs tabular-nums">
            {view.alone ? PANEL.refundIfAlone : view.perOne ? PANEL.perOne(view.perOne) : " "}
          </span>
        </button>
      ))}
    </div>
  );
}
