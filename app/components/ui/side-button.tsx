// Purpose: the YES and NO buttons of a campaign: the side on the left and its chance on the right, never a price. The
// selected side keeps a check mark and an inset outline, so the choice is not carried by colour alone. Classes come
// from styles/ui.css (.side-btn). Sprint -1 (DESIGN-DIRECTION.md, "Botões Yes / No").
import type { ButtonHTMLAttributes } from "react";

export type Side = "yes" | "no";

export function SideButton({
  side,
  chance,
  selected = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { side: Side; chance: string; selected?: boolean }) {
  return (
    <button type="button" aria-pressed={selected} className={`side-btn ${side}`} {...props}>
      <span>
        {selected ? "✓ " : ""}
        {side === "yes" ? "YES" : "NO"}
      </span>
      <span className="tabular-nums">{chance}</span>
    </button>
  );
}
