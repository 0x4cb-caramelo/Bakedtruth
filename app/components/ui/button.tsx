// Purpose: the buttons of the design direction. "primary" is the blue CTA with the orbiting edge (.cta); "secondary"
// is the outline (.btn); "quiet" is the flat link-like one (.btn.quiet). Classes and colours come from styles/ui.css
// and tokens.css. Sprint -1 (DESIGN-DIRECTION.md, "Botão primário").
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  if (variant === "primary") {
    return (
      <button type="button" className={`cta ${className}`} {...props}>
        <span>{children}</span>
      </button>
    );
  }
  const quiet = variant === "quiet" ? "quiet" : "";
  return (
    <button type="button" className={`btn ${quiet} ${className}`} {...props}>
      {children}
    </button>
  );
}
