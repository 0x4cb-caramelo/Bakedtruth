/**
 * Purpose: the pot as a bar: YES, then NO, then the prize as a neutral end cap that belongs to neither side, with a legend in text.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export function SplitBar({ yes, no, prize, thin }: { yes: number; no: number; prize: number; thin?: boolean }) {
  const total = yes + no + prize;
  const share = (part: number) => (total > 0 ? `${(part / total) * 100}%` : "0%");
  return (
    <div>
      <div
        role="img"
        aria-label={`YES ${share(yes)}, NO ${share(no)}, prize ${share(prize)}`}
        className={cx("flex overflow-hidden rounded-full bg-track", thin ? "h-1.5" : "h-2.5")}
      >
        <span className="h-full bg-yes-bar" style={{ width: share(yes) }} />
        <span className="h-full bg-no-bar" style={{ width: share(no) }} />
        <span
          className="h-full bg-[repeating-linear-gradient(135deg,var(--prize-bar)_0_4px,transparent_4px_8px)]"
          style={{ width: share(prize) }}
        />
      </div>
    </div>
  );
}
