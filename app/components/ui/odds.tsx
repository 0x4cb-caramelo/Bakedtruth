// Purpose: the YES and NO buttons of a campaign: the side on the left, the price in cents on the right. The selected
// side keeps its colour and a visible mark, so it is not carried by colour alone. Sprint -1 (DESIGN-DIRECTION.md).
export type Side = "yes" | "no";

export function Odds({
  side,
  cents,
  selected = false,
  onClick,
}: {
  side: Side;
  cents: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const label = side === "yes" ? "YES" : "NO";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex min-h-[44px] w-full items-center justify-between rounded-(--r-sm) border px-3 text-[12px] font-semibold"
      style={{
        background: selected ? `var(--${side}-bar)` : `var(--${side}-bg)`,
        color: selected ? "var(--on-accent)" : `var(--${side}-fg)`,
        borderColor: selected ? `var(--${side}-bar)` : "transparent",
      }}
    >
      <span>
        {selected ? "✓ " : ""}
        {label}
      </span>
      <span className="font-display text-[18px]">{cents}¢</span>
    </button>
  );
}
