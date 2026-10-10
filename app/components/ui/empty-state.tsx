/**
 * Purpose: the empty state: a title, a line of text and an optional action, centred in the space of a list or a page.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import type { ReactNode } from "react";

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2.5 px-4 py-9 text-center text-muted">
      <p className="m-0 font-display text-2xl font-bold text-text">{title}</p>
      {children ? <div className="max-w-md text-sm">{children}</div> : null}
      {action}
    </div>
  );
}
