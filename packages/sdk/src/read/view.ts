/**
 * Purpose: a campaign's public state (BR-05; TP 3.4.2): Open, Closed, In review, Paid or Void, computed
 *          by one function from what the program recorded and the CHAIN's time (the Clock sysvar, read
 *          with `readChainTime`), never the device's clock (A-7). Site, app and API all call it.
 * Version: 0.1.1 (a contest's stage, its deadline and the stage-2 lapse, Sprint 14 lane L14B)
 * Sprint:  05 (SDK); 14 (lane L14B)
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
 * `outcomeKnowable` by a caller that read it. A contest stays "In review" (TP 3.4.2): at stage 1 the reading
 * is run again (its deadline is the keeper's one-hour target, not a cut-off), at stage 2 the admin confirms
 * or voids before the deadline, and from that deadline on the stored result stands and finalize may run.
 */
import { ContestStage, Outcome, ReaderKind, Status } from "./constants";
import type { Campaign } from "./accounts";
import type { ChainTime } from "./rpc";

export type PublicState = "Open" | "Closed" | "InReview" | "Paid" | "Void";

export type PublicView = {
  state: PublicState;
  /** Why a campaign that is still `Open` in the program shows as Closed. */
  closedBecause: "entriesClosed" | "epochStarted" | "outcomeKnowable" | null;
  /** In review: a contest pauses the payout until it closes (Sprint 14). */
  contested: boolean;
  /**
   * In review: when the six-hour window ends, and whether chain time has passed it (finalize may run then, unless
   * the campaign is contested: see `contestLapsed`).
   */
  reviewEndsAt: bigint | null;
  windowEnded: boolean;
  /** Contested: the stage (`Stage1`, the reading run again; `Stage2`, the admin's decision) and its deadline. */
  contestStage: ContestStage | null;
  contestEndsAt: bigint | null;
  /** Contested at stage 2, with chain time at or past its deadline: the stored result stands; finalize may run. */
  contestLapsed: boolean;
  /** Paid or Void: payouts are still going out (`Settling`) or all are done (`Settled`). */
  settled: boolean;
  /** The chain time this view was computed at. */
  asOf: ChainTime;
};

const epochKind = (kind: ReaderKind) => kind === ReaderKind.StakePoolTvlAtLeast || kind === ReaderKind.StakeAtLeast;

/** A contested campaign's stage, its deadline and whether stage 2 has lapsed at chain time `chain`. */
function contestOf(campaign: Campaign, chain: ChainTime) {
  return {
    contestStage: campaign.contestStage,
    contestEndsAt: campaign.contestEndsAt,
    contestLapsed: campaign.contestStage === ContestStage.Stage2 && chain.unixTimestamp >= campaign.contestEndsAt,
  };
}

/** The public state of `campaign` at chain time `chain`. Throws on a status the program never writes. */
export function publicState(
  campaign: Campaign,
  chain: ChainTime,
  opts: { outcomeKnowable?: boolean } = {},
): PublicView {
  const base = {
    closedBecause: null,
    contested: false,
    reviewEndsAt: null,
    windowEnded: false,
    contestStage: null,
    contestEndsAt: null,
    contestLapsed: false,
    settled: false,
  };
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
    case Status.Contested: {
      const contested = campaign.status === Status.Contested;
      return {
        ...base,
        state: "InReview",
        contested,
        reviewEndsAt: campaign.reviewEndsAt,
        windowEnded: chain.unixTimestamp >= campaign.reviewEndsAt,
        ...(contested ? contestOf(campaign, chain) : {}),
        asOf: chain,
      };
    }
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
