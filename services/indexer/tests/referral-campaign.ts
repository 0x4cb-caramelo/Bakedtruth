/**
 * Purpose: one campaign's life for the referral tests (Sprint 14, lane L14R): a small model of the program that lands
 *          the campaign's events as it would, numbered from seq 0 (opening, joins, resolution, every baker's tally,
 *          the snapshot, each payout, the creator's share, the fee, the prize and the close), with the SDK's own money
 *          math (`snapshot` and `entryPayout`, the program's mirrors), so a test says only who joined, on which side,
 *          when, whether late, and how the campaign ended, through a two-stage contest if asked (the admin confirms or
 *          voids). `edit` changes an event before it lands, for the checks against the campaign; `skip` leaves a gap in
 *          its seq; `noFee` stops before the fee is collected.
 * Version: 0.1.1 (a contested ending)
 * Sprint:  14 (referral, lane L14R)
 */
import type { Address } from "@solana/kit";
import { entryPayout, Outcome, SettleMode, Side, snapshot, voidClassOf, VoidReason } from "@brot/sdk/read";

import * as T from "../../../packages/sdk/src/idl/generated/types";
import { DAY, key, T0, wallet, type Chain, type Edit } from "./referral-chain";

type Terms = { creator?: Address; team?: boolean; prize?: bigint; openingFee?: bigint };
type Join = { baker: Address; side: Side; amount: bigint; late: boolean };

/** One campaign's life, step by step, as the program writes it. */
export class Campaign {
  readonly address: Address;
  private seq = 0;
  private readonly joins: Join[] = [];
  private outcome = Outcome.Unresolved;
  private reason = VoidReason.None;
  private final: ReturnType<typeof snapshot> | null = null;
  private readonly prize: bigint;
  private readonly openingFee: bigint;
  private readonly creator: Address;
  private readonly team: boolean;

  constructor(
    private readonly chain: Chain,
    n: number,
    terms: Terms = {},
  ) {
    this.address = key(2, n);
    this.creator = terms.creator ?? wallet(200);
    this.team = terms.team ?? false;
    this.prize = terms.prize ?? (this.team ? 0n : 4_500_000_000n);
    this.openingFee = terms.openingFee ?? (this.team ? 0n : 500_000_000n);
    this.step([["CampaignOpened", this.opened()]]);
  }

  private opened(): Record<string, unknown> {
    return {
      ...{ id: 7n, creator: this.creator, creatorIsTeam: this.team, kind: T.ReaderKind.PriceTouch },
      ...{ direction: T.Direction.Above, feedId: new Uint8Array(32).fill(1), metricAccount: wallet(240), target: 1n },
      ...{ priceExponent: -8, maxAge: 60, templateVersion: 1, opensAt: BigInt(T0), entriesCloseAt: BigInt(T0 + DAY) },
      ...{ deadlineAt: BigInt(T0 + 2 * DAY), feeBps: 1_000, oneSidedFeeBps: 100, creatorShareBps: this.team ? 0 : 100 },
      ...{ openingUsd: this.team ? 0n : 500n, openingPaidLamports: this.prize + this.openingFee, openingPrice: 1n },
      ...{ openingPriceExponent: -8, openingPricePublishTime: 0n, prizeLamports: this.prize },
      ...{ openingFeeLamports: this.openingFee, epoch: 0n },
    };
  }

  /** Lands the events in one transaction, each numbered; `edit` may change one before it lands. */
  private step(events: [string, Record<string, unknown>][], at: { slot?: number; time?: number; edit?: Edit } = {}) {
    const list = events.map(([name, data]) => ({
      name,
      data: { campaign: this.address, seq: BigInt(this.seq++), ...data },
    }));
    list.forEach((e) => at.edit?.(e));
    return this.chain.land(list, at);
  }

  /** Leaves a gap: the next event's seq skips one. */
  skip() {
    this.seq += 1;
  }

  private sum(baker: Address | null, side: Side, late: boolean | null) {
    return this.joins
      .filter((j) => (baker === null || j.baker === baker) && j.side === side && (late === null || j.late === late))
      .reduce((t, j) => t + j.amount, 0n);
  }

  /** A join; a `late` one (at or after a YES proof's publish time) comes back whole at settlement. */
  join(baker: Address, side: "yes" | "no", amount: bigint, at: { slot?: number; time?: number; late?: boolean } = {}) {
    const s = side === "yes" ? Side.Yes : Side.No;
    this.joins.push({ baker, side: s, amount, late: at.late ?? false });
    const isFirst = this.joins[0].baker === baker;
    const [poolYes, poolNo] = [this.sum(null, Side.Yes, null), this.sum(null, Side.No, null)];
    const [entryYes, entryNo] = [this.sum(baker, Side.Yes, null), this.sum(baker, Side.No, null)];
    return this.step([["EntryAdded", { baker, side: s, isFirst, amount, poolYes, poolNo, entryYes, entryNo }]], at);
  }

  private bakers = () => [...new Set(this.joins.map((j) => j.baker))];

  /** Resolution, every baker's tally, and the snapshot: `void` is a stale feed (an outside cause). */
  finalize(result: "yes" | "no" | "void", at: { edit?: Edit; contest?: "confirm" | VoidReason } = {}) {
    this.outcome = result === "yes" ? Outcome.Yes : result === "no" ? Outcome.No : Outcome.Void;
    this.reason = result === "void" ? VoidReason.StaleFeed : VoidReason.None;
    const resolved = { kind: T.ReaderKind.PriceTouch, outcome: this.outcome, voidReason: this.reason, metLate: false };
    const where = { observedValue: 0n, readAccount: wallet(240), publishTime: 0n, postedSlot: 0n, resolvedAt: 0n };
    this.step([["CampaignResolved", { ...resolved, ...where, reviewEndsAt: 0n, slot: 0n, epoch: 0n }]]);
    const tallies = this.bakers().map((baker): [string, Record<string, unknown>] => {
      const [lateYesAdded, lateNoAdded] = [this.sum(baker, Side.Yes, true), this.sum(baker, Side.No, true)];
      return ["LateTallied", { baker, joinsClosed: 1, lateYesAdded, lateNoAdded }];
    });
    if (tallies.length > 0) this.step(tallies);
    if (at.contest !== undefined) this.contested(at.contest);
    const [lateYes, lateNo] = [this.sum(null, Side.Yes, true), this.sum(null, Side.No, true)];
    const verdict =
      this.outcome === Outcome.Void
        ? ({ kind: "Void", voidClass: voidClassOf(this.reason)! } as const)
        : ({ kind: this.outcome === Outcome.Yes ? "Yes" : "No" } as const);
    const input = {
      ...{ verdict, yesTotal: this.sum(null, Side.Yes, false), noTotal: this.sum(null, Side.No, false), lateYes },
      ...{ lateNo, prize: this.prize, openingFee: this.openingFee, feeBps: 1_000, oneSidedFeeBps: 100 },
      ...{ creatorShareBps: this.team ? 0 : 100, creatorIsTeam: this.team },
    };
    const s = (this.final = snapshot(input));
    const fields = { settleMode: s.mode, winningTotal: s.winningTotal, losingTotal: s.losingTotal };
    const fees = {
      refundedLate: s.refundedLate,
      feeTotal: s.feeTotal,
      fromPot: s.fromPot,
      fromFee: s.creatorShareFromFee,
    };
    return this.step([["CampaignFinalized", { ...fields, ...fees, distributable: s.distributable }]], at);
  }

  /** A contest through both stages: opened, re-read different, then the admin confirms or voids with `decision`. */
  private contested(decision: "confirm" | VoidReason) {
    const stage = (contestStage: number) => ({ contestStage, contestEndsAt: 0n });
    this.step([["ContestOpened", { signer: wallet(201), ...stage(T.ContestStage.Stage1) }]]);
    const read = { same: false, outcome: this.outcome, voidReason: VoidReason.None, metLate: false, observedValue: 1n };
    this.step([["CampaignReread", { ...read, publishTime: 0n, ...stage(T.ContestStage.Stage2) }]]);
    const reason = decision === "confirm" ? VoidReason.None : decision;
    const closed = { signer: wallet(202), decision: reason === VoidReason.None ? 0 : T.ContestDecision.Void };
    this.step([["ContestClosed", { ...closed, voidReason: reason, noteHash: new Uint8Array(32) }]]);
    if (reason !== VoidReason.None) [this.outcome, this.reason] = [Outcome.Void, reason];
  }

  /** Every entry paid, the creator's share, the fee collected (unless `noFee`), the prize back and the close. */
  settle(at: { edit?: Edit; noFee?: boolean } = {}) {
    const s = this.final!;
    const winning = this.outcome === Outcome.No ? Side.No : Side.Yes;
    const rule = {
      mode: s.mode,
      winning,
      winningTotal: s.winningTotal,
      distributable: s.distributable,
      oneSidedFeeBps: 100,
    };
    let oneSided = 0n;
    for (const baker of this.bakers()) {
      const amounts = { yes: this.sum(baker, Side.Yes, null), no: this.sum(baker, Side.No, null) };
      const late = { lateYes: this.sum(baker, Side.Yes, true), lateNo: this.sum(baker, Side.No, true) };
      const paid = entryPayout(rule, { ...amounts, ...late }, this.joins[0].baker === baker);
      oneSided += paid.oneSidedFee;
      this.step([["EntrySettled", { baker, amount: paid.amount, settleMode: s.mode }]], at);
    }
    if (s.creatorShare > 0n) {
      const share = {
        creator: this.creator,
        amount: s.creatorShare,
        fromPot: s.fromPot,
        fromFee: s.creatorShareFromFee,
      };
      this.step([["CreatorShareSettled", share]]);
    }
    if (at.noFee) return;
    const kept = s.mode === SettleMode.Refund ? s.brotKeeps : this.openingFee;
    this.step([["FeeCollected", { amount: s.brotKeeps + oneSided, openingFeeKept: kept }]], at);
    const prizeReturned = s.mode === SettleMode.Split ? 0n : this.prize;
    this.step([
      ["PrizeSettled", { recipient: this.creator, prizeReturned, openingFeeReturned: s.toOpener - prizeReturned }],
    ]);
    this.step([["CampaignClosed", { rentPayer: this.creator, rentReturned: 1n, surplusSwept: 0n }]]);
  }

  /** What the snapshot says, for a test's expected numbers. */
  get snapshot() {
    return this.final!;
  }
}
