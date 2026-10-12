/**
 * Purpose: the messages of one place of the creation box (a slot, the box, the wallet), each with an icon by its level
 *          (refused, blocked, waiting, needed) so a refusal never reads as colour alone (spec 3.12); the program's row
 *          of TP §3.4.10, when the SDK named one, rides along as a data attribute for the tests.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { CircleAlert, Clock, Info, X } from "lucide-react";

import { cx } from "@/components/ui/cx";
import type { Issue } from "./check";

const ICON = { refuse: X, block: CircleAlert, wait: Clock, need: Info } as const;
const TONE = { refuse: "text-error", block: "text-st-review-fg", wait: "text-muted", need: "text-muted" } as const;

export function IssueList({ issues, className }: { issues: readonly Issue[]; className?: string }) {
  if (issues.length === 0) return null;
  return (
    <ul className={cx("list-none space-y-1", className)}>
      {issues.map((issue) => {
        const Icon = ICON[issue.level];
        return (
          <li
            key={`${issue.place}:${issue.tag}:${issue.text}`}
            className={cx("flex items-start gap-1.5 text-xs", TONE[issue.level])}
            data-refusal={issue.refusal}
            data-row={issue.row ?? undefined}
          >
            <Icon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span>{issue.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
