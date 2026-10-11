/**
 * Purpose: the opening amount of the creation box's Cost section (spec 3.12; TP §3.4.10 row 7): US$500, 1,000 or 1,500,
 *          or a custom whole number of US$, with what the box says about it. The whole amount is split 90% prize, 10%
 *          Brot's opening fee; a link never sets it (the Sprint 19 adversarial review, M6). Split from cost-section.tsx.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { useId } from "react";

import { cx } from "@/components/ui/cx";
import type { Issue } from "./check";
import { SLOTS } from "./copy";
import type { Draft } from "./draft";
import { IssueList } from "./issue-list";

const AMOUNTS = ["500", "1000", "1500"];

export function AmountPicker({
  usd,
  setDraft,
  issues,
}: {
  usd: string;
  setDraft: (change: (d: Draft) => Draft) => void;
  issues: Issue[];
}) {
  const id = useId();
  const custom = !AMOUNTS.includes(usd);
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium text-muted">{SLOTS.usd}</legend>
      <div className="grid grid-cols-2 gap-2 min-[700px]:grid-cols-4">
        {[...AMOUNTS, "custom"].map((v) => {
          const on = v === "custom" ? custom : usd === v;
          return (
            <label
              key={v}
              className={cx(
                "cursor-pointer rounded-sm border p-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                on ? "border-accent bg-row-hover" : "border-line",
              )}
            >
              <input
                type="radio"
                name={`${id}-usd`}
                className="sr-only"
                checked={on}
                onChange={() => setDraft((d) => ({ ...d, usd: v === "custom" ? "" : v }))}
              />
              <b className="block">{v === "custom" ? SLOTS.custom : `US$${Number(v).toLocaleString("en-US")}`}</b>
            </label>
          );
        })}
      </div>
      {custom ? (
        <input
          aria-label={SLOTS.custom}
          inputMode="numeric"
          value={usd}
          onChange={(e) => setDraft((d) => ({ ...d, usd: e.target.value.trim() }))}
          className="mt-2 min-h-11 w-full rounded-sm border border-field-line bg-bg px-3 text-base text-text tabular-nums"
        />
      ) : null}
      <IssueList issues={issues} className="mt-1.5" />
    </fieldset>
  );
}
