// Purpose: the chip that names a campaign's public state (P1 §3.1). Text on its own chip with a dot, never colour
// alone. A contested campaign reads "In review" and says why in a note for screen readers, as the prototype does.
// Classes come from styles/ui.css (.chip.state). Sprint -1.
export type CampaignState = "open" | "closed" | "review" | "paid" | "void" | "contest";

const LABELS: Record<CampaignState, string> = {
  open: "Open",
  closed: "Closed",
  review: "In review",
  paid: "Paid",
  void: "Voided",
  contest: "In review",
};

const NOTES: Partial<Record<CampaignState, string>> = { contest: "Contested · payout paused" };

export function StateChip({ state, result }: { state: CampaignState; result?: "YES" | "NO" }) {
  const note = NOTES[state];
  const text = state === "paid" && result ? `Paid · ${result}` : LABELS[state];
  return (
    <span className={`chip state state-${state}`} title={note}>
      {text}
      {note ? <span className="sr-only">, {note}</span> : null}
    </span>
  );
}
