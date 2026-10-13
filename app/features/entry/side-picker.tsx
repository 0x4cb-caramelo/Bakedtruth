/**
 * Purpose: YES or NO in the entry panel. The button holds only its side's word, centred; under each button, in the
 *          page's neutral text, the side's chance (its share of the entries) and its estimated return per 1 for a 1 SOL
 *          entry, or "refund if alone" while the other side is empty. The line under a button describes it to screen
 *          readers (aria-describedby). Never a price in cents: the chance is not a price (P1 §3.2). aria-pressed marks
 *          the chosen side; the word, not the colour, says which.
 * Version: 0.2.0 (the estimate under the button, the button holding only its side)
 * Sprint:  11 (site: campaign page and entry); the sixth kind's site
 */
"use client";

import { useId } from "react";

import { cx } from "@/components/ui/cx";
import { PANEL } from "./copy";
import type { EntrySide } from "./estimate";

export type SideView = { side: EntrySide; chance: number | null; perOne: string | null; alone: boolean };

/** What the line under a side's button says after its chance: the return per 1, or the refund while alone. */
const returnOf = (view: SideView): string | null =>
  view.alone ? PANEL.refundIfAlone : view.perOne ? PANEL.perOne(view.perOne) : null;

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
  const id = useId();
  return (
    <div role="group" aria-label={PANEL.sideGroup} className="en-sides">
      {views.map((view) => {
        const line = `${id}-${view.side}`;
        const back = returnOf(view);
        return (
          <div key={view.side} className="en-side">
            <button
              type="button"
              aria-pressed={value === view.side}
              aria-describedby={line}
              disabled={disabled}
              onClick={() => onChange(view.side)}
              className={cx("side-btn", view.side, "disabled:opacity-60")}
            >
              {view.side.toUpperCase()}
            </button>
            <p id={line} className="en-side-est">
              {view.chance !== null ? <b>{view.chance}%</b> : null}
              {view.chance !== null && back ? <span aria-hidden="true">·</span> : null}
              {back}
            </p>
          </div>
        );
      })}
    </div>
  );
}
