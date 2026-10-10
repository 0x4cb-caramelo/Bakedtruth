/**
 * Purpose: the buttons of the design: the primary action with its orbiting edge, the secondary and quiet ones, and the icon button. Colour from the tokens only.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "quiet" | "icon";
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: Variant;
  wide?: boolean;
  small?: boolean;
  children: ReactNode;
};

const FLAT: Record<Exclude<Variant, "primary">, string> = {
  secondary:
    "border border-line-strong text-text font-semibold hover:border-muted hover:bg-row-hover " +
    "min-h-9 px-3.5 text-[13px]",
  quiet: "border border-transparent text-accent-soft font-medium min-h-9 px-3.5 text-[13px]",
  icon: "grid place-items-center size-9 border border-line rounded-sm text-muted hover:text-text hover:border-muted",
};

export function Button({ variant = "primary", wide, small, className, children, disabled, ...rest }: Props) {
  const size = small ? "min-h-[30px] px-2.5 py-1 text-xs" : wide ? "min-h-11 w-full text-sm" : "";
  if (variant === "primary") {
    return (
      <span
        className={cx(
          "inline-block rounded-sm p-[1.5px] bg-[var(--cta-ring)] animate-brot-spin",
          wide && "block w-full",
          disabled && "animate-none bg-line",
          className,
        )}
      >
        <button
          type="button"
          disabled={disabled}
          className={cx(
            "flex w-full items-center justify-center gap-2 min-h-9 px-4 py-2 rounded-[calc(var(--r-sm)-1.5px)] " +
              "bg-cta-bg text-on-accent font-semibold text-[13px] whitespace-nowrap hover:bg-cta-hover",
            size,
            disabled && "bg-raised text-dim hover:bg-raised",
          )}
          {...rest}
        >
          {children}
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-sm disabled:opacity-50",
        FLAT[variant],
        size,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
