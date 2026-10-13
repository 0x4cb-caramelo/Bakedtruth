/**
 * Purpose: a graduation campaign's curve on its page (`DbcGraduated`): a progress bar of the SOL raised over the curve's
 *          threshold (`quote_reserve` over `migration_quote_threshold`, the campaign's target), the share filled, what is
 *          still missing or when the curve completed, its stage, and, always in view, the risk: YES can be bought by
 *          anyone who pays the rest of the curve. Read live through the SDK's copy of the program's reader (./curve.ts).
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md)
 */
"use client";

import { TriangleAlert } from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { CURVE } from "./copy-curve";
import { filledText, type CurveFacts } from "./curve";
import { local, utc, valueText } from "./format";

const sol = (lamports: bigint) => valueText("curve", lamports, 0);

export function CurveProgress({ curve }: { curve: CurveFacts }) {
  const percent = filledText(curve.filledBps);
  const stage = CURVE.stage[curve.stage] ?? CURVE.stage[1];
  return (
    <div className="cp-curve mt-3 space-y-2" data-curve-stage={curve.stage}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm">
          <b className="tabular-nums">{CURVE.raised(sol(curve.raised), sol(curve.threshold))}</b>
        </span>
        <span className="text-sm tabular-nums text-muted">{CURVE.filled(percent)}</span>
      </div>
      <ProgressBar value={curve.filledBps} max={10_000} label={CURVE.bar(percent)} />
      <p className="m-0 text-xs text-muted">
        <span className="chip mr-2">{stage}</span>
        {!curve.graduated
          ? CURVE.missing(sol(curve.missing))
          : curve.completedAt !== null
            ? CURVE.completed(`${utc(curve.completedAt)} (${local(curve.completedAt)})`)
            : CURVE.completedNoStamp}
      </p>
      <div role="note" className="cp-creator">
        <TriangleAlert className="size-4" aria-hidden="true" />
        <p>
          <b>{CURVE.bought}</b> {CURVE.boughtMore}
        </p>
      </div>
    </div>
  );
}
