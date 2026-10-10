/**
 * Purpose: a campaign's public state (BR-05; TP 3.4.2): Open, Closed, In review, Paid or Void, computed
 *          by one function from what the program recorded and the CHAIN's time (the Clock sysvar, read
 *          with `readChainTime`), never the device's clock (A-7). Site, app and API all call it.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * | Public state | In the program |
 * |---|---|
 * | Open | `Open`, entries allowed |
 * | Closed | `Open`, with chain time at or past `entries_close_at`, or the outcome knowable |
 * | In review | `InReview`; or `Contested`, payout paused |
 * | Paid | `Settling` or `Settled`, outcome `Yes` or `No` |
 * | Void | `Settling` or `Settled`, outcome `Void` |
 *
 * "Closed" has no transaction: it comes from the clock and the reader. The epoch kinds know it from the
 * clock alone; the other kinds need the metric account (`outcomeKnowable`, ./knowable.ts), passed in as
 * `outcomeKnowable` by a caller that read it.
 */
import { Outcome, ReaderKind, Status } from "./constants";
import type { Campaign } from "./accounts";
import type { ChainTime } from "./rpc";

export type PublicState = "Open" | "Closed" | "InReview" | "Paid" | "Void";

export type PublicView = {
  state: PublicState;
  /** Why a campaign that is still `Open` in the program shows as Closed. */
  closedBecause: "entriesClosed" | "epochStarted" | "outcomeKnowable" | null;
  /** In review: a contest pauses the payout (Sprint 14 opens its exits). */
  contested: boolean;
  /** In review: when the window ends, and whether chain time has passed it (finalize may run). */
  reviewEndsAt: bigint | null;
  windowEnded: boolean;
  /** Paid or Void: payouts are still going out (`Settling`) or all are done (`Settled`). */
  settled: boolean;
  /** The chain time this view was computed at. */
  asOf: ChainTime;
};

const epochKind = (kind: ReaderKind) => kind === ReaderKind.StakePoolTvlAtLeast || kind === ReaderKind.StakeAtLeast;

/** The public state of `campaign` at chain time `chain`. Throws on a status the program never writes. */
export function publicState(
  campaign: Campaign,
  chain: ChainTime,
  opts: { outcomeKnowable?: boolean } = {},
): PublicView {
  const base = { closedBecause: null, contested: false, reviewEndsAt: null, windowEnded: false, settled: false };
  switch (campaign.status) {
    case Status.Open: {
      const closedBecause =
        chain.unixTimestamp >= campaign.entriesCloseAt
          ? "entriesClosed"
          : epochKind(campaign.kind) && chain.epoch >= campaign.epoch
            ? "epochStarted"
            : opts.outcomeKnowable
              ? "outcomeKnowable"
              : null;
      return { ...base, state: closedBecause ? "Closed" : "Open", closedBecause, asOf: chain };
    }
    case Status.InReview:
    case Status.Contested:
      return {
        ...base,
        state: "InReview",
        contested: campaign.status === Status.Contested,
        reviewEndsAt: campaign.reviewEndsAt,
        windowEnded: chain.unixTimestamp >= campaign.reviewEndsAt,
        asOf: chain,
      };
    case Status.Settling:
    case Status.Settled: {
      if (campaign.outcome === Outcome.Unresolved) throw new Error("a settling campaign without an outcome");
      const state = campaign.outcome === Outcome.Void ? "Void" : "Paid";
      return { ...base, state, settled: campaign.status === Status.Settled, asOf: chain };
    }
    default:
      throw new Error(`no campaign status ${campaign.status as number}`);
  }
}
