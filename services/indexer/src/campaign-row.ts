/**
 * Purpose: one opening of a campaign as a `campaigns` row (TP §4; Sprint 08), folded from its events in `seq` order
 *          the way the program moves its account (state/transitions.rs): `CampaignOpened` sets the terms, the pot and
 *          the prize; each `EntryAdded` carries both pools after it, and a baker's first one opens that baker's
 *          `Entry` account (its `isFirst` is something else: the pot's first baker, Q3); `CampaignResolved` puts it in
 *          review with the outcome; a contest makes it `Contested`; the team's void, or the admin's `ContestClosed`
 *          with a Void decision, sets the outcome `Void` and its reason (a re-read never writes an outcome, and a
 *          Confirm keeps the stored one); `CampaignFinalized` stores the mode and moves it to `Settling`, or `Settled`
 *          when no entry was ever made; the last `EntrySettled` makes it `Settled`; `CampaignClosed` marks the account
 *          gone. `LateTallied` changes no pool: the late totals are kept apart (tally_late_joins), and the prize never
 *          changes after the opening. No row without its `CampaignOpened`: a gap is refetched first (ingest.ts).
 * Version: 0.1.1 (the admin's Void through ContestClosed)
 * Sprint:  08 (indexer, API, relay and points); 14 (the admin's decision, lane L14R)
 */
import {
  ContestDecision,
  Direction,
  Outcome,
  ReaderKind,
  SettleMode,
  Status,
  VoidReason,
  type DecodedEvent,
} from "@brot/sdk/read";

export type CampaignRow = {
  address: string;
  opening: number;
  id: string;
  kind: string;
  direction: string;
  feed_id: string;
  metric_account: string;
  target: string;
  epoch: string;
  creator: string;
  creator_is_team: number;
  creator_share_bps: number;
  template_version: number;
  fee_bps: number;
  one_sided_fee_bps: number;
  opening_usd: string;
  opening_paid_lamports: string;
  opening_price: string;
  opening_price_exponent: number;
  prize_lamports: string;
  opening_fee_lamports: string;
  status: string;
  outcome: string;
  void_reason: string | null;
  settle_mode: string | null;
  pool_yes: string;
  pool_no: string;
  entries_open: number;
  opens_at: number;
  entries_close_at: number;
  deadline_at: number;
  review_ends_at: number | null;
  closed: number;
  last_seq: number;
  updated_slot: number;
  /** The ranking's (ranking.ts), kept across a re-projection until the next refresh writes it again. */
  listed: number | null;
  rank: number | null;
};

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** The row of one opening, from its events sorted by `seq`; `null` while its `CampaignOpened` is missing. */
export function campaignRow(address: string, opening: number, events: readonly DecodedEvent[]): CampaignRow | null {
  const first = events[0];
  if (!first || first.name !== "CampaignOpened") return null;
  const o = first.data;
  const row: CampaignRow = {
    address,
    opening,
    id: o.id.toString(),
    kind: ReaderKind[o.kind],
    direction: Direction[o.direction],
    feed_id: hex(o.feedId as Uint8Array),
    metric_account: o.metricAccount,
    target: o.target.toString(),
    epoch: o.epoch.toString(),
    creator: o.creator,
    creator_is_team: o.creatorIsTeam ? 1 : 0,
    creator_share_bps: o.creatorShareBps,
    template_version: o.templateVersion,
    fee_bps: o.feeBps,
    one_sided_fee_bps: o.oneSidedFeeBps,
    opening_usd: o.openingUsd.toString(),
    opening_paid_lamports: o.openingPaidLamports.toString(),
    opening_price: o.openingPrice.toString(),
    opening_price_exponent: o.openingPriceExponent,
    prize_lamports: o.prizeLamports.toString(),
    opening_fee_lamports: o.openingFeeLamports.toString(),
    status: Status[Status.Open],
    outcome: Outcome[Outcome.Unresolved],
    void_reason: null,
    settle_mode: null,
    pool_yes: "0",
    pool_no: "0",
    entries_open: 0,
    opens_at: Number(o.opensAt),
    entries_close_at: Number(o.entriesCloseAt),
    deadline_at: Number(o.deadlineAt),
    review_ends_at: null,
    closed: 0,
    last_seq: Number(o.seq),
    updated_slot: Number(first.slot),
    listed: null,
    rank: null,
  };
  const bakers = new Set<string>();
  for (const event of events.slice(1)) {
    apply(row, event, bakers);
    row.last_seq = Number((event.data as { seq: bigint }).seq);
    row.updated_slot = Number(event.slot);
  }
  return row;
}

/** One event's change to the row; `bakers` are the wallets with an `Entry` account so far (one per wallet). */
function apply(row: CampaignRow, event: DecodedEvent, bakers: Set<string>): void {
  switch (event.name) {
    case "EntryAdded":
      row.pool_yes = event.data.poolYes.toString();
      row.pool_no = event.data.poolNo.toString();
      if (!bakers.has(event.data.baker)) row.entries_open += 1;
      bakers.add(event.data.baker);
      return;
    case "CampaignResolved":
      row.status = Status[Status.InReview];
      row.outcome = Outcome[event.data.outcome];
      row.void_reason = VoidReason[event.data.voidReason];
      row.review_ends_at = Number(event.data.reviewEndsAt);
      return;
    case "ContestOpened":
      row.status = Status[Status.Contested];
      return;
    case "CampaignVoided":
      row.outcome = Outcome[Outcome.Void];
      row.void_reason = VoidReason[event.data.voidReason];
      return;
    case "ContestClosed":
      if (event.data.decision !== ContestDecision.Void) return;
      row.outcome = Outcome[Outcome.Void];
      row.void_reason = VoidReason[event.data.voidReason];
      return;
    case "CampaignFinalized":
      row.settle_mode = SettleMode[event.data.settleMode];
      row.status = Status[row.entries_open === 0 ? Status.Settled : Status.Settling];
      return;
    case "EntrySettled":
      row.entries_open -= 1;
      if (row.entries_open === 0 && row.status === Status[Status.Settling]) row.status = Status[Status.Settled];
      return;
    case "CampaignClosed":
      row.closed = 1;
      return;
  }
}
