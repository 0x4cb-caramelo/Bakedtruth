/**
 * Purpose: a graduation campaign's target in the creation box (`DbcGraduated`): never typed, it is the curve's own
 *          threshold, read from the config the pool names (the program refuses any other, `TargetNotThreshold`). Shown
 *          read-only once the account slot accepted the pool, with what the curve has raised now and the share filled;
 *          before that, a dash and the rule a curve must meet.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md)
 */
"use client";

import { useId } from "react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { CURVE } from "../campaign-page/copy-curve";
import { filledText } from "../campaign-page/curve";
import { valueText } from "../campaign-page/format";
import { SLOTS } from "./copy";
import type { Issue } from "./check";
import { IssueList } from "./issue-list";
import type { SlotRead } from "./preview";

const sol = (lamports: bigint) => valueText("curve", lamports, 0);

export function CurveTarget({ read, issues }: { read: SlotRead; issues: Issue[] }) {
  const id = useId();
  const state = read.status === "read" && read.state.state === "ok" ? read.state : null;
  const curve = state?.curve ?? null;
  const raised = state?.value ?? null;
  const bps = curve && raised !== null && curve.threshold > 0n ? Number((raised * 10_000n) / curve.threshold) : null;
  const percent = bps === null ? null : filledText(Math.min(bps, 10_000));
  return (
    <div className="space-y-1.5">
      <label htmlFor={`${id}-target`} className="text-xs font-medium text-muted">
        {SLOTS.target.curve}
      </label>
      <output
        id={`${id}-target`}
        aria-describedby={`${id}-target-help`}
        className="flex min-h-11 w-full items-center rounded-sm border border-field-line bg-raised px-3 py-2.5 font-display text-2xl font-bold tabular-nums"
      >
        {curve ? sol(curve.threshold) : "—"}
      </output>
      {curve && raised !== null && percent !== null ? (
        <div className="space-y-1">
          <ProgressBar value={Math.min(bps ?? 0, 10_000)} max={10_000} label={CURVE.bar(percent)} thin />
          <p className="m-0 text-xs text-muted">
            {CURVE.raised(sol(raised), sol(curve.threshold))} · {CURVE.filled(percent)}
          </p>
        </div>
      ) : null}
      <p id={`${id}-target-help`} className="text-xs text-muted">
        {SLOTS.targetHelp.curve}
      </p>
      <IssueList issues={issues} />
    </div>
  );
}
