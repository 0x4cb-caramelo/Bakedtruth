// Purpose: the primary and secondary buttons of the Ledger² direction, in both themes, from the tokens only.
// Primary is the blue CTA; secondary is the quiet outline. Sprint -1 (DESIGN-DIRECTION.md, "Botão primário").
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-(--r-sm) px-4 text-[12px] font-semibold transition-colors disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-(--cta-bg) text-(--on-accent) hover:bg-(--cta-hover)",
  secondary: "border border-(--field-line) bg-(--panel) text-(--text) hover:bg-(--raised)",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
