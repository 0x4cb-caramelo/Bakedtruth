/**
 * Purpose: the top of the sheet "Check before you sign" (the redesign of 2026-10-15): the campaign, its id with a copy
 *          button and the side as a badge; what you pay against what comes back if your side wins, both to four
 *          decimals (up for what leaves the wallet, down for what may come back; the exact lamports are in the cost
 *          breakdown); the lines a choice may need (an entry from a link, an earlier entry, a pot too small to split);
 *          and a large entry's effect on its side's return, as a bar from a minimum entry's return to this one's.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry), the sheet's redesign
 */
"use client";

import { ArrowRight } from "lucide-react";

import { CopyButton } from "@/features/campaign-page/copy-button";
import { exactSol } from "@/features/campaign-page/copy-states";
import { sol4 } from "./amount";
import { NOTICES, PANEL, SHEET } from "./copy";
import type { ReviewFacts } from "./entry-review";
import { perOne, type EntrySide } from "./estimate";

export function ReviewHero({
  facts,
  side,
  total,
  rents,
  back,
  shownBps,
  alone,
  tooSmall,
  before,
}: {
  facts: ReviewFacts;
  side: EntrySide;
  /** What leaves the wallet in all, and the rents in it that come back. */
  total: bigint;
  rents: bigint;
  /** The estimate if the side wins, in lamports and per 1 (bps); `alone`: the other side is still empty. */
  back: bigint;
  shownBps: bigint;
  alone: boolean;
  tooSmall: boolean;
  /** The wallet's entry here before this one. */
  before: bigint;
}) {
  const S = side.toUpperCase();
  const O = side === "yes" ? "NO" : "YES";
  const large = facts.large;
  const kept = large ? Math.min(1, Number(large.mine) / Number(large.small)) : 0;
  return (
    <>
      <div className="er-top">
        <div className="min-w-0">
          <h3>{facts.sentence}</h3>
          <p className="er-id">
            <span title={facts.campaignId}>{SHEET.campaign(facts.campaignId)}</span>
            <CopyButton text={facts.campaignId} label={SHEET.campaignId} compact />
          </p>
        </div>
        <div className="er-side">
          <small>{SHEET.yourSide}</small>
          <b data-side={side}>{S}</b>
        </div>
      </div>
      <div className="er-hero" data-side={side}>
        <div>
          <span>{SHEET.youPay}</span>
          <strong>
            {sol4(total, "up")}
            <small>SOL</small>
          </strong>
          <em>{SHEET.rentBack(sol4(rents, "up"))}</em>
        </div>
        <ArrowRight className="size-4" aria-hidden="true" />
        <div>
          <span>{alone ? SHEET.ifEmpty(O) : SHEET.ifWins(S)}</span>
          <strong>
            {sol4(back)}
            <small>SOL</small>
          </strong>
          <em>{alone ? PANEL.refundIfAlone : SHEET.times(perOne(shownBps))}</em>
        </div>
      </div>
      {facts.fromLink ? <p className="er-warn">{PANEL.fromLink}</p> : null}
      {before > 0n ? <p className="er-note">{SHEET.addsTo(exactSol(before))}</p> : null}
      {tooSmall ? <p className="er-warn">{SHEET.tooSmall(O)}</p> : null}
      {large ? (
        <div className="er-impact">
          <p className="er-impact-head">
            <b>{SHEET.moves}</b>
            <span aria-hidden="true">
              {large.small}× <i>→</i> {large.mine}×
            </span>
          </p>
          <span className="er-bar" aria-hidden="true">
            <span style={{ width: `${(kept * 100).toFixed(1)}%` }} />
          </span>
          <p>
            {NOTICES.largeEntry} {NOTICES.largeEntryNumbers(large.small, large.mine)}
          </p>
        </div>
      ) : null}
    </>
  );
}
