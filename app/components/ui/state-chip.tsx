// Purpose: the chip that names a campaign's state (P1 §3.1). Text on its own chip, never colour alone, so it reads
// the same with a screen reader and in greyscale. Sprint -1.
export type CampaignState = "open" | "closed" | "review" | "paid" | "void" | "contest";

const labels: Record<CampaignState, string> = {
  open: "Open",
  closed: "Closed",
  review: "In review",
  paid: "Paid",
  void: "Void",
  contest: "Contested",
};

export function StateChip({ state }: { state: CampaignState }) {
  return (
    <span
      className="inline-flex items-center rounded-(--r-pill) px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: `var(--st-${state}-bg)`, color: `var(--st-${state}-fg)` }}
    >
      {labels[state]}
    </span>
  );
}
