/**
 * Purpose: the surface of a card or a panel: the panel colour, a 1px line and the card radius. Its contents set their own spacing.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export function Card({
  as: Tag = "div",
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType; children: ReactNode }) {
  return (
    <Tag className={cx("rounded-md border border-line bg-panel shadow-[var(--shadow)]", className)} {...rest}>
      {children}
    </Tag>
  );
}
