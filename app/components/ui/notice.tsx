// Purpose: the notice bar above the content (sign-in, a refusal, a pause, the lock notice). It always carries a text
// line; the tone changes the background only, never the words. Classes come from styles/ui.css (.notice). Sprint -1
// (DESIGN-DIRECTION.md, "Aviso").
import type { ReactNode } from "react";

type Tone = "info" | "warn" | "danger";

export function Notice({ children, tone = "info", onClose }: { children: ReactNode; tone?: Tone; onClose?: () => void }) {
  const variant = tone === "info" ? "" : tone;
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`notice ${variant}`}>
      <div>{children}</div>
      {onClose ? (
        <button type="button" className="close" aria-label="Close notice" onClick={onClose}>
          ×
        </button>
      ) : null}
    </div>
  );
}
