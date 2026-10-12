"use client";

/**
 * Purpose: the segmented control for filters: toggle buttons with aria-pressed, the pressed one on the pressed tokens.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { cx } from "./cx";

export function Segmented({
  items,
  value,
  onChange,
  label,
  wide,
}: {
  items: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /** Full width, two equal halves: the approved prototype's `.seg.op-seg` (the opening's direction). */
  wide?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={wide ? "seg op-seg" : "inline-flex flex-wrap gap-0.5 rounded-sm border border-field-line bg-panel p-0.5"}
    >
      {items.map((item) => {
        const pressed = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(item.id)}
            className={
              wide
                ? undefined
                : cx(
                    "min-h-8 rounded-[calc(var(--r-sm)-2px)] px-2.5 py-1 text-[12.5px]",
                    pressed ? "bg-pressed-bg text-pressed-fg" : "text-muted hover:text-text",
                  )
            }
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
