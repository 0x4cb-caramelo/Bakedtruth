/**
 * Purpose: what the indexer's file says about referrals (Sprint 14, lane L14R; TP §3.4.11), from its finalized rows
 *          only: every `ReferralLinked` (the first for each referee, in chain order: the program refuses a second);
 *          each referee's joins (every `EntryAdded` of that wallet, in chain order, with its block time); each with
 *          its place (slot, signature, instruction, inner instruction) and the block positions read for a tie
 *          (`tx_positions`); and, for an opening a referee entered, the facts its basis is computed from and checked
 *          against: the outcome, whether the address has a gap, the `CampaignFinalized` snapshot, every baker's joins
 *          and late sums (`LateTallied`), each `EntrySettled` and the `FeeCollected`. Events are decoded again from
 *          their stored bytes (codec.ts).
 * Version: 0.2.0 (each event's place in the chain, and the block positions)
 * Sprint:  14 (referral, lane L14R)
 */
import type { DecodedEvent, SettleMode } from "@brot/sdk/read";

import { revive, STORED_EVENT, type StoredEvent } from "../codec";
import type { Store } from "../db/store";
import { gapIn } from "../project";

/** Where an event sits: its transaction's slot and signature, then the instruction and the inner instruction. */
export type Place = { slot: number; signature: string; ix: number; inner: number };
export type Link = Place & { referee: string; referrer: string; linkedAt: bigint; linkedSlot: bigint };
export type Join = Place & {
  campaign: string;
  opening: number;
  side: "Yes" | "No";
  amount: bigint;
  /** The block time of its transaction: chain time, or `null` when the node gave none. */
  time: number | null;
};
export type Sides = { yes: bigint; no: bigint };
export type Finalized = {
  mode: SettleMode;
  winningTotal: bigint;
  losingTotal: bigint;
  feeTotal: bigint;
  fromFee: bigint;
  distributable: bigint;
};
export type OpeningFacts = {
  campaign: string;
  opening: number;
  /** The `campaigns` row's outcome (`Yes`, `No`, `Void`, `Unresolved`), `null` without a row. */
  outcome: string | null;
  gap: boolean;
  /** Every `CampaignFinalized` of the opening: one once finalized; two would be a fault, held. */
  finalized: Finalized[];
  totals: Map<string, Sides>;
  late: Map<string, Sides>;
  /** Each baker's `EntrySettled` amounts (one once settled) and the slot of the last. */
  settled: Map<string, { amounts: bigint[]; slot: number }>;
  /** Each `FeeCollected`: what went to the fee vault less the opening fee in it, and its slot. */
  fees: { houseKept: bigint; slot: number }[];
};

const CHAIN_ORDER = "ORDER BY slot, ord, ix_index, inner_index";
const zero = (): Sides => ({ yes: 0n, no: 0n });
const add = (map: Map<string, Sides>, key: string, yes: bigint, no: bigint) => {
  const s = map.get(key) ?? map.set(key, zero()).get(key)!;
  s.yes += yes;
  s.no += no;
};

/** Every referee's first link, in chain order. */
export function linksOf(store: Store): Link[] {
  const rows = store.db
    .query(`SELECT ${STORED_EVENT} FROM events WHERE name = 'ReferralLinked' ${CHAIN_ORDER}`)
    .all() as StoredEvent[];
  const links = new Map<string, Link>();
  for (const row of rows) {
    const event = revive(row);
    if (event.name !== "ReferralLinked" || links.has(event.data.referee)) continue;
    const { referee, referrer, linkedAt, linkedSlot } = event.data;
    const place = { slot: row.slot, signature: row.signature, ix: row.ix_index, inner: row.inner_index };
    links.set(referee, { referee, referrer, linkedAt, linkedSlot, ...place });
  }
  return [...links.values()];
}

/** One wallet's joins, every campaign, in chain order. */
export function joinsOf(store: Store, baker: string): Join[] {
  const rows = store.db
    .query(
      `SELECT e.campaign, e.opening, e.side, e.amount, e.slot, e.block_time, e.signature, e.ix_index, e.inner_index
       FROM entries e
       JOIN signatures s USING (signature) WHERE e.baker = ? ORDER BY e.slot, s.ord, e.ix_index, e.inner_index`,
    )
    .all(baker) as {
    campaign: string;
    opening: number;
    side: string;
    amount: string;
    slot: number;
    block_time: number | null;
    signature: string;
    ix_index: number;
    inner_index: number;
  }[];
  return rows.map((r) => ({
    ...{ campaign: r.campaign, opening: r.opening, side: r.side === "No" ? "No" : "Yes", amount: BigInt(r.amount) },
    ...{ slot: r.slot, signature: r.signature, ix: r.ix_index, inner: r.inner_index, time: r.block_time },
  }));
}

/** Each transaction's index in its block, where one was read (positions.ts). */
export const positionsOf = (store: Store): Map<string, number> =>
  new Map(
    (
      store.db.query("SELECT signature, position FROM tx_positions").all() as { signature: string; position: number }[]
    ).map((r) => [r.signature, r.position]),
  );

/** The facts of one opening a referee entered. */
export function openingFacts(store: Store, campaign: string, opening: number): OpeningFacts {
  const row = store.db
    .query("SELECT outcome FROM campaigns WHERE address = ? AND opening = ?")
    .get(campaign, opening) as {
    outcome: string;
  } | null;
  const facts: OpeningFacts = {
    ...{ campaign, opening, outcome: row?.outcome ?? null, gap: gapIn(store, campaign), finalized: [] },
    ...{ totals: new Map(), late: new Map(), settled: new Map(), fees: [] },
  };
  const entries = store.db
    .query("SELECT baker, side, amount FROM entries WHERE campaign = ? AND opening = ?")
    .all(campaign, opening) as { baker: string; side: string; amount: string }[];
  for (const e of entries)
    add(facts.totals, e.baker, e.side === "Yes" ? BigInt(e.amount) : 0n, e.side === "Yes" ? 0n : BigInt(e.amount));
  const events = store.db
    .query(
      `SELECT ${STORED_EVENT} FROM events WHERE campaign = ? AND opening = ?
       AND name IN ('CampaignFinalized', 'LateTallied', 'EntrySettled', 'FeeCollected') ${CHAIN_ORDER}`,
    )
    .all(campaign, opening) as StoredEvent[];
  for (const stored of events) apply(facts, revive(stored), stored.slot);
  return facts;
}

function apply(facts: OpeningFacts, event: DecodedEvent, slot: number): void {
  switch (event.name) {
    case "CampaignFinalized": {
      const d = event.data;
      facts.finalized.push({
        ...{ mode: d.settleMode, winningTotal: d.winningTotal, losingTotal: d.losingTotal },
        ...{ feeTotal: d.feeTotal, fromFee: d.fromFee, distributable: d.distributable },
      });
      return;
    }
    case "LateTallied":
      return add(facts.late, event.data.baker, event.data.lateYesAdded, event.data.lateNoAdded);
    case "EntrySettled": {
      const s = facts.settled.get(event.data.baker) ?? { amounts: [], slot };
      s.amounts.push(event.data.amount);
      s.slot = slot;
      facts.settled.set(event.data.baker, s);
      return;
    }
    case "FeeCollected":
      facts.fees.push({ houseKept: event.data.amount - event.data.openingFeeKept, slot });
      return;
  }
}
