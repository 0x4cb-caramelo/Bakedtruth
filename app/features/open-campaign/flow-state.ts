/**
 * Purpose: an opening's sheet as values (Sprint 19; A-3, T17): the steps from "Review and sign" to the campaign's link,
 *          the receipt of what an opening paid, the step an attempt's outcome leads to, and when the page's reads are
 *          stale after it; the generations that keep a superseded watch off the screen. Pure; split from
 *          use-open-flow.ts in the Sprint 19 reviews.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import type { Address } from "@solana/kit";
import type { OpeningChoice } from "@brot/sdk/tx";

import { failure as plain, type Failure } from "../entry/failures";
import type { RecentCheck } from "./recent";
import type { PendingOpening } from "./retry-guard";
import type { OpenOutcome, ReadyOpening, Stage } from "./submit";

/** What a paid opening moved into its vault, and the price the program charged it at. */
export type Receipt = { paid: bigint; price: bigint; exponent: number };

export type OpenFlow =
  | { step: "idle" }
  | { step: "preparing" }
  | { step: "recent"; choice: OpeningChoice; check: Exclude<RecentCheck, { status: "none" }>; chainNow: bigint }
  | {
      step: "review";
      choice: OpeningChoice;
      ready: ReadyOpening;
      refreshed: boolean;
      creator: string;
      /** The account the signed instruction reads (the feed's sponsored account on the price kind). */
      metric: Address;
      /** The guard's record for this id: the saved one, or the page's, in memory until the hand-off saves it. */
      record: PendingOpening;
    }
  | { step: "signing"; stage: Stage; blocksLeft: bigint | null; total: bigint | null; most: bigint | null }
  | {
      step: "done";
      outcome: Extract<OpenOutcome, { kind: "opened" | "already" | "taken" }>;
      /** What the opening that just landed paid, from its preparation, for the receipt; `null` when free or unknown. */
      receipt: Receipt | null;
    }
  | { step: "failed"; failure: Failure; cost: "nothing" | "fee" | "unknown"; resume?: PendingOpening };

/** Fewer blocks than this left on the prepared blockhash (devnet: about 28 s), and it is prepared again first. */
export const FRESH_BLOCKS = 120n;

type Generation = { current: number };
/** A new step: every watch or preparation started before it stops speaking to the screen. */
export const advance = (generation: Generation) => ++generation.current;
export const isCurrent = (generation: Generation, g: number) => g === generation.current;

/** The checking step, before the watch knows how many blocks are left. */
export const CHECKING: Extract<OpenFlow, { step: "signing" }> = {
  step: "signing",
  stage: "checking",
  blocksLeft: null,
  total: null,
  most: null,
};

const landed = (o: OpenOutcome): o is Extract<OpenOutcome, { kind: "opened" | "already" | "taken" }> =>
  o.kind === "opened" || o.kind === "already" || o.kind === "taken";

/** Something reached the chain (a campaign, or a fee paid by a failed transaction): the page's reads are stale. */
export const movedFunds = (o: OpenOutcome) => landed(o) || (o.kind === "failed" && o.cost === "fee");

/** The step an attempt's outcome leads to; the receipt only for an opening that just landed. */
export function stepAfter(outcome: OpenOutcome, receipt: Receipt | null): OpenFlow {
  if (landed(outcome)) return { step: "done", outcome, receipt: outcome.kind === "opened" ? receipt : null };
  if (outcome.kind === "stopped")
    return { step: "failed", failure: plain("stillChecking"), cost: "unknown", resume: outcome.record };
  if (outcome.kind === "not-landed") return { step: "failed", failure: plain("notLanded"), cost: outcome.cost };
  return { step: "failed", failure: outcome.failure, cost: outcome.cost };
}
