"use client";

/**
 * Purpose: the category tabs: one active tab with a 2px accent underline, arrow keys move between them. Keeps role=tablist, aria-selected and roving focus.
 * Version: 0.1.0
 * Sprint:  09 (site shell, theme and wallet; the design of Sprint -1)
 */
import { useRef, type KeyboardEvent } from "react";
import { cx } from "./cx";

export type TabItem = { id: string; label: string };

export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (index: number, step: number) => {
    const next = (index + step + items.length) % items.length;
    onChange(items[next]!.id);
    refs.current[next]?.focus();
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") move(index, 1);
    else if (event.key === "ArrowLeft") move(index, -1);
  };
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKey(event, index)}
            className={cx(
              "min-h-9 shrink-0 px-3 text-[13px] font-medium border-b-2",
              active ? "border-accent text-text" : "border-transparent text-muted hover:text-text",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
