/**
 * Purpose: the randomized test's model of a sealed entry (Sprint 15; TP sections 3.4.12, 3.4.16): what a sponsor's
 *          `SealedFee` on a campaign holds and where its settlement sent each part, the price of a sealed entry
 *          written apart from the program's math, and the three operations that touch a SealedFee. The planners are
 *          in invariant-sealed.ts and invariant-sealed-settle.ts, the invariants in invariant-sealed-checks.ts.
 * Version: 0.0.1
 * Sprint:  15 (the lead's harness, lane INV15)
 */
import type { Address } from "@solana/kit";

import { derivedOnce, type Harness } from "./invariant-harness";
import type { ModelCampaign } from "./invariant-model";
import { decode } from "./layouts";
import * as P from "./program";
import { accountData } from "./setup";
import { CAMPAIGN } from "./structs";

export type SealedModel = {
  address: Address;
  campaign: Address;
  sponsor: string;
  /** `funded`: SOL sent to the address before any sealed entry; `live`: created, holding a fee; `settled`: closed. */
  state: "funded" | "live" | "settled";
  /** The lamports the model expects at the address: its rent (or more, funded in advance), the fee, SOL sent by hand. */
  lamports: bigint;
  /** The books the account keeps (state/sealed_fee.rs): summed over the sponsor's sealed entries. */
  fee: bigint;
  entry: bigint;
  usd: bigint;
  count: number;
  /** Where `settle_sealed_fee` sent each part: the fee, the rent, and what was sent by hand. */
  paid: { part: "fee" | "rent" | "surplus"; to: string; amount: bigint }[];
};

/** A refusal the draw asks for on purpose: a stale or too wide SOL/USD, `max_lamports` one short or exact, a bad total. */
export type SealedQuirk = "none" | "stale" | "wide" | "under" | "exact" | "total";
export type SealedOp = {
  k: "sealed";
  c: number;
  sponsor: number;
  side: 0 | 1;
  usd: bigint;
  /** The SOL/USD account's price and confidence (exponent −8) the entry is charged at. */
  price: bigint;
  conf: bigint;
  quirk: SealedQuirk;
};
export type HandSealedOp = { k: "handSealed"; c: number; sponsor: number; amount: bigint };
/** `thief`: another wallet named in the sponsor's slot, to take the refund and the rent (`WrongSponsor`). */
export type SealedSettleOp = { k: "sealedSettle"; c: number; sponsor: number; thief: number | null };

/** The config's `opening_fee_usd` (the floor), `opening_prize_bps` (the entry's part) and `max_price_conf_bps`. */
export const FLOOR_USD = 500n;
const ENTRY_BPS = 9_000n;
export const CONF_BPS = 50n;

export const liveSealed = (c: ModelCampaign) => [...c.sealed.values()].filter((s) => s.state === "live");
export const sealedAt = (campaign: Address, sponsor: Address) =>
  derivedOnce(`sealed ${campaign} ${sponsor}`, () => P.sealedFeePda(campaign, sponsor));
export const blankSealed = (address: Address, campaign: Address, sponsor: string): SealedModel => ({
  address,
  campaign,
  sponsor,
  state: "funded",
  lamports: 0n,
  fee: 0n,
  entry: 0n,
  usd: 0n,
  count: 0,
  paid: [],
});

/** The campaign's `event_seq` as the chain holds it now. */
export const eventSeq = (h: Harness, campaign: Address) =>
  decode(CAMPAIGN, accountData(h.w, campaign)).event_seq as bigint;

/** `ceil(usd × 10^(9 − e) ÷ (p − conf))` at e = −8 (TP 3.4.16), split 90/10: the entry rounds down, the fee is the rest. */
export function sealedPrice(usd: bigint, price: bigint, conf: bigint) {
  const charged = price - conf;
  const scaled = usd * 10n ** 17n;
  const paid = scaled / charged + (scaled % charged === 0n ? 0n : 1n);
  const entry = (paid * ENTRY_BPS) / 10_000n;
  return { charged, paid, entry, fee: paid - entry };
}

/** Throws naming the first field of a transaction's events (or of the chain after it) the model did not expect. */
export function expectFields(what: string, rows: [string, unknown, unknown][]) {
  const wrong = rows.find(([, have, want]) => have !== want);
  if (wrong) throw new Error(`${what}: ${wrong[0]} is ${String(wrong[1])}, the model expects ${String(wrong[2])}`);
}
