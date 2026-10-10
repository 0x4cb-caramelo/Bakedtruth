/**
 * Purpose: the loading block: a shimmering shape the size of the content it replaces. The shimmer stops when reduced motion is on.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "rounded-sm bg-[linear-gradient(90deg,var(--raised),var(--row-hover),var(--raised))] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none",
        className,
      )}
    />
  );
}
