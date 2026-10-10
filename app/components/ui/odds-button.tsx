/**
 * Purpose: the YES and NO buttons: the side's word on the left and its price in cents on the right, with aria-pressed for the selected side.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
"use client";

import { cx } from "./cx";

export function OddsButton({
  side,
  cents,
  pressed,
  onPress,
  disabled,
}: {
  side: "yes" | "no";
  cents: string;
  pressed?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onPress}
      className={cx(
        "flex min-h-10 w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-[13px] font-semibold",
        "hover:brightness-110 disabled:opacity-50 light:hover:brightness-95",
        side === "yes" ? "bg-yes-bg text-yes-fg" : "bg-no-bg text-no-fg",
        pressed && "shadow-[inset_0_0_0_2px_currentColor]",
      )}
    >
      <span>{side === "yes" ? "YES" : "NO"}</span>
      <span className="tabular-nums">{cents}¢</span>
    </button>
  );
}
