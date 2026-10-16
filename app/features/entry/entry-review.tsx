/**
 * Purpose: the sheet "Check before you sign" (A-3), what the transaction carries, from the SDK's preparation of it, in
 *          the redesign of 2026-10-15 (the founder's mockup "Confirm entry — before / after", 1a): what you pay against
 *          what comes back if your side wins, with the side as a badge and a large entry's effect as a bar
 *          (review-hero.tsx); the cost folded with its exact lamports and the program's fields folded with their raw
 *          values (review-details.tsx); the risks as a list and the rules folded, every approved notice word for word
 *          (review-notes.tsx); and, pinned at the bottom, the amount on the button and what the wallet should show, the
 *          buttons held while "Sign" checks the join, and the line when it was prepared again with new terms. The
 *          return is net of the fee and the creator's share: since Sprint 13 what finalize would pay if entries closed
 *          now (`shownReturnBps`), with a line when the other side is too small to pay the fees.
 * Version: 0.4.1 (the busy buttons; 0.4.0, the redesign; 0.3.0, the essentials in view, the rest folded; 0.2.0,
 *          Sprint 13: the shown return)
 * Sprint:  11 (site: campaign page and entry); 13
 */
"use client";

import { Button } from "@/components/ui/button";
import { shownReturnBps, splitsIfWins, type JoinedPot } from "@/lib/brot";
import { exactSol } from "@/features/campaign-page/copy-states";
import { sol4 } from "./amount";
import { SHEET } from "./copy";
import { ReviewCost, ReviewDetails } from "./review-details";
import { ReviewHero } from "./review-hero";
import { ReviewNotes } from "./review-notes";
import type { EntryChoice, ReadyJoin } from "./submit";

export type ReviewFacts = {
  sentence: string;
  campaignId: string;
  feeBps: number;
  creatorShareBps: number;
  oneSidedFeeBps: number;
  /** The campaign's prize, for the estimate of what finalize would pay. */
  prizeLamports: bigint;
  fromLink: boolean;
  firstEntry: boolean;
  /** This browser keeps the retry guard's record across a reload (localStorage works). */
  persists: boolean;
  large: { mine: string; small: string } | null;
};

export function EntryReview({
  ready,
  choice,
  facts,
  refreshed,
  busy = false,
  onBack,
  onSign,
}: {
  ready: ReadyJoin;
  choice: EntryChoice;
  facts: ReviewFacts;
  refreshed: boolean;
  /** "Sign" was clicked: the page checks the join (and may prepare it again) before the wallet. */
  busy?: boolean;
  onBack: () => void;
  onSign: () => void;
}) {
  const added = ready.simulation.events.find((e) => e.name === "EntryAdded");
  const otherAfter =
    added?.name === "EntryAdded" ? (choice.side === "yes" ? added.data.poolNo : added.data.poolYes) : 1n;
  const sideAfter =
    added?.name === "EntryAdded" ? (choice.side === "yes" ? added.data.poolYes : added.data.poolNo) : null;
  const pot: JoinedPot | null =
    sideAfter === null
      ? null
      : {
          amount: choice.amount,
          sideAfter,
          other: otherAfter,
          prize: facts.prizeLamports,
          feeBps: facts.feeBps,
          oneSidedFeeBps: facts.oneSidedFeeBps,
          creatorShareBps: facts.creatorShareBps,
          isFirst: ready.check.isFirst,
        };
  const tooSmall = pot !== null && otherAfter > 0n && !splitsIfWins(pot);
  const shown = pot && tooSmall ? shownReturnBps(pot) : ready.check.estimateBps;
  const total = ready.debit.total;
  return (
    <div className="er">
      <ReviewHero
        facts={facts}
        side={choice.side}
        total={total}
        rents={ready.debit.rents}
        back={(choice.amount * shown) / 10_000n}
        shownBps={shown}
        alone={otherAfter === 0n}
        tooSmall={tooSmall}
        before={ready.expectedEntryTotal}
      />
      <ReviewCost side={choice.side.toUpperCase()} debit={ready.debit} />
      <ReviewNotes facts={facts} />
      <ReviewDetails ready={ready} />
      <div className="er-foot">
        {/* Where the eye is when it happens: beside the button that was clicked. */}
        {refreshed ? (
          <p className="er-refreshed" role="status">
            {SHEET.refreshed}
          </p>
        ) : null}
        <div className="er-foot-btns">
          <Button variant="secondary" wide onClick={onBack} disabled={busy}>
            {SHEET.back}
          </Button>
          <Button wide onClick={onSign} disabled={busy} aria-busy={busy}>
            {busy ? SHEET.readying : SHEET.sign(sol4(total, "up"))}
          </Button>
        </div>
        <p>
          {SHEET.walletShows} <b>{exactSol(total)} SOL</b>. {SHEET.walletDiffers}
        </p>
      </div>
    </div>
  );
}
