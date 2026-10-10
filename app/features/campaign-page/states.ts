/**
 * Purpose: what the campaign page says in each public state (Sprint 12; BR-05, BR-10, BR-11, BR-25, BR-45), as pure
 *          values from the stored campaign and the SDK's public view against chain time (A-7), never the device clock:
 *          closed (why), in review (the result read, the six-hour window), contested (payout paused, the new
 *          deadline), paid (the result, the mode: split, one-sided, or a pot nobody entered), void (the reason, its
 *          class, what returns to whoever opened). Also what the connected wallet is owed or received, and what the
 *          creator and the opener get. Every amount is the SDK's mirror of the program (math/stored.ts).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import {
  ContestStage,
  creatorShareStatus,
  entryIfFinalized,
  entryOwed,
  noEntryEver,
  Outcome,
  prizeReturnOf,
  SettleMode,
  storedVerdict,
  voidClassOf,
  VoidReason,
  type Campaign,
  type ChainTime,
  type CreatorShareStatus,
  type Entry,
  type PublicView,
} from "@brot/sdk/read";

export type Result = "YES" | "NO" | "VOID";

const resultOf = (outcome: Outcome): Result =>
  outcome === Outcome.Yes ? "YES" : outcome === Outcome.No ? "NO" : "VOID";

export type StateView =
  | { kind: "open" }
  | { kind: "closed"; because: "entriesClosed" | "epochStarted" | "outcomeKnowable" }
  | {
      kind: "review";
      result: Result;
      reason: VoidReason;
      observed: bigint;
      metLate: boolean;
      reviewEndsAt: bigint;
      /** Seconds left in the window at the chain time read; zero once it ended (finalize may run). */
      secondsLeft: bigint;
    }
  | { kind: "contested"; result: Result; contestEndsAt: bigint; stage: ContestStage }
  | { kind: "paid"; result: "YES" | "NO"; mode: SettleMode; empty: boolean; allPaid: boolean }
  | {
      kind: "void";
      reason: VoidReason;
      /** The house's fault (the opening fee goes back to whoever opened) or an outside cause (Brot keeps it). */
      house: boolean;
      empty: boolean;
      allPaid: boolean;
    };

/** The page's state for `c` under the SDK's public view (computed against chain time). */
export function pageStateOf(c: Campaign, view: PublicView, chain: ChainTime): StateView {
  switch (view.state) {
    case "Open":
      return { kind: "open" };
    case "Closed":
      return { kind: "closed", because: view.closedBecause ?? "entriesClosed" };
    case "InReview": {
      const result = resultOf(c.outcome);
      if (view.contested) return { kind: "contested", result, contestEndsAt: c.contestEndsAt, stage: c.contestStage };
      const left = c.reviewEndsAt - chain.unixTimestamp;
      return {
        kind: "review",
        result,
        reason: c.voidReason,
        observed: c.observedValue,
        metLate: c.metLate,
        reviewEndsAt: c.reviewEndsAt,
        secondsLeft: left > 0n ? left : 0n,
      };
    }
    case "Paid":
      return {
        kind: "paid",
        result: c.outcome === Outcome.No ? "NO" : "YES",
        mode: c.settleMode,
        empty: noEntryEver(c),
        allPaid: view.settled,
      };
    case "Void":
      return {
        kind: "void",
        reason: c.voidReason,
        house: voidClassOf(c.voidReason) === "HouseFailure",
        empty: noEntryEver(c),
        allPaid: view.settled,
      };
  }
}

/**
 * The connected wallet's own line: what its entry would return (an estimate while the pot or the result can move),
 * what it is owed once finalized and not yet sent ("Waiting for payout"), or what it received (from its
 * `EntrySettled` event, since settlement closes the Entry).
 */
export type YourPayout =
  | { kind: "none" }
  | { kind: "estimate"; ifYes: bigint | null; ifNo: bigint | null }
  | { kind: "ifConfirmed"; amount: bigint; result: Result }
  | { kind: "owed"; amount: bigint }
  | { kind: "received"; amount: bigint }
  /** The Entry is closed but its settlement could not be read back now. */
  | { kind: "settledUnread" };

export function yourPayoutOf(a: {
  campaign: Campaign;
  state: StateView;
  mine: Entry | null;
  /** `EntrySettled.amount` for this wallet and campaign, when read; `null` when none was found. */
  settled: bigint | null;
  /** Whether the wallet ever entered (its Entry, or an `EntrySettled` found). */
  entered: boolean;
}): YourPayout {
  const { campaign: c, state, mine } = a;
  if (a.settled !== null) return { kind: "received", amount: a.settled };
  if (!mine) return a.entered ? { kind: "settledUnread" } : { kind: "none" };
  if (state.kind === "paid" || state.kind === "void") return { kind: "owed", amount: entryOwed(c, mine).amount };
  const verdict = storedVerdict(c);
  if (verdict)
    return { kind: "ifConfirmed", amount: entryIfFinalized(c, mine, verdict).amount, result: resultOf(c.outcome) };
  return {
    kind: "estimate",
    ifYes: mine.amountYes > 0n ? entryIfFinalized(c, mine, { kind: "Yes" }).amount : null,
    ifNo: mine.amountNo > 0n ? entryIfFinalized(c, mine, { kind: "No" }).amount : null,
  };
}

/** What the creator and whoever opened get from a finalized campaign (the same wallet: the creator opened it). */
export type OpenerView = {
  share: CreatorShareStatus;
  /** The prize back (and the opening fee on a house-failure void), and whether `settle_prize` ran. */
  prizeBack: bigint;
  openingFeeBack: bigint;
  prizeSent: boolean;
};

/** `null` before finalize: nothing is due to the creator or the opener yet. */
export function openerViewOf(c: Campaign): OpenerView | null {
  if (c.settleMode === SettleMode.Unset) return null;
  const back = prizeReturnOf(c);
  return {
    share: creatorShareStatus(c),
    prizeBack: back.prize,
    openingFeeBack: back.openingFee,
    prizeSent: c.prizeSettled,
  };
}

/** A one-sided pot's rule on screen: the fee on every entry but the first baker's, and the prize's return. */
export const oneSidedRule = (c: Campaign) => ({ feeBps: c.oneSidedFeeBps, firstBaker: c.firstBaker });

export const isStaleFeed = (reason: VoidReason) => reason === VoidReason.StaleFeed;
