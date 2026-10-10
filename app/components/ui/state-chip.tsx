/**
 * Purpose: the public state of a campaign as a chip: text and a dot, never colour alone (P1 §3.1). The states are the five of the public view, and contested.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export type PublicStateName = "open" | "closed" | "in_review" | "paid" | "void" | "contested";

const LABEL: Record<PublicStateName, string> = {
  open: "Open",
  closed: "Closed",
  in_review: "In review",
  paid: "Paid",
  void: "Void",
  contested: "Contested",
};

const TONE: Record<PublicStateName, string> = {
  open: "bg-st-open-bg text-st-open-fg",
  closed: "bg-st-closed-bg text-st-closed-fg",
  in_review: "bg-st-review-bg text-st-review-fg",
  paid: "bg-st-paid-bg text-st-paid-fg",
  void: "bg-st-void-bg text-st-void-fg",
  contested: "bg-st-review-bg text-st-review-fg",
};

export function StateChip({ state, className }: { state: PublicStateName; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        TONE[state],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {LABEL[state]}
    </span>
  );
}
