// Purpose: the notice bar shown above the content (sign-in, a refusal, a pause). It always carries a text line; its
// tone only changes the background. Sprint -1 (DESIGN-DIRECTION.md, "Aviso").
import type { ReactNode } from "react";

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "danger" }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className="rounded-(--r-sm) border border-(--line) px-4 py-3 text-[13px] text-(--text)"
      style={{ background: tone === "danger" ? "var(--danger-bg)" : "var(--notice-bg)" }}
    >
      {children}
    </div>
  );
}
