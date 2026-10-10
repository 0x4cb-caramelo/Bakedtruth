/**
 * Purpose: the progress bar of the proof: a role=progressbar with its value, 6px on the proof and 3px on a card.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export function ProgressBar({
  value,
  max = 100,
  label,
  thin,
}: {
  value: number;
  max?: number;
  label: string;
  thin?: boolean;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx("w-full overflow-hidden rounded-full bg-track", thin ? "h-[3px]" : "h-1.5")}
    >
      <div className="h-full bg-[var(--fill)]" style={{ width: `${percent}%` }} />
    </div>
  );
}
