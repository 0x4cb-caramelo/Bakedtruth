/**
 * Purpose: the randomized test's model of a sealed entry (Sprint 15; TP sections 3.4.12, 3.4.16): what a sponsor's
 *          `SealedFee` on a campaign holds and where its settlement sent each part (a table beside each campaign's
 *          model), the config's terms and the price of a sealed entry written apart from the program's math, its
 *          refusals in the program's order, and the three operations that touch a SealedFee. The planners are in
 *          invariant-sealed.ts and invariant-sealed-settle.ts, the invariants in invariant-sealed-checks.ts.
 * Version: 0.1.0 (with Sprint 14 in one branch: the SealedFees beside the campaign's model, which stays under 200
 *          lines; the address from the harness's cache; the events through invariant-run.ts)
 * Sprint:  15 (the lead's harness, lane INV15; the creation rules' version, red team L2 of lane L15)
 */
import type { Address } from "@solana/kit";

import type { BrotErrorName } from "./errors";
import type { Harness } from "./invariant-harness";
import type { ModelCampaign } from "./invariant-model";

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

/**
 * A refusal the draw asks for on purpose: a stale or too wide SOL/USD, `max_lamports` one short (or exact, which
 * passes), a wrong entry total, or a version of the creation rules that is not the config's.
 */
export type SealedQuirk = "none" | "stale" | "wide" | "under" | "exact" | "total" | "version";
export type SealedOp = {
  k: "sealed";
  c: number;
  sponsor: number;
  side: 0 | 1;
  usd: bigint;
  /** The SOL/USD account's price (exponent −8), and its confidence in thousandths of the config's bound. */
  price: bigint;
  confShare: bigint;
  quirk: SealedQuirk;
};
export type HandSealedOp = { k: "handSealed"; c: number; sponsor: number; amount: bigint };
/** `thief`: another wallet named in the sponsor's slot, to take the refund and the rent (`WrongSponsor`). */
export type SealedSettleOp = { k: "sealedSettle"; c: number; sponsor: number; thief: number | null };

/**
 * The config's terms a sealed entry is priced and checked by, as the chain holds them when it is planned: the floor
 * (`opening_fee_usd`), the entry's part (`opening_prize_bps`), the SOL/USD bounds and the version the sponsor signs.
 */
export type SealedTerms = { floor: bigint; prizeBps: bigint; maxAge: bigint; confBps: bigint; version: number };
export const sealedTerms = (config: Record<string, any>): SealedTerms => ({
  floor: config.params.opening_fee_usd,
  prizeBps: BigInt(config.params.opening_prize_bps),
  maxAge: BigInt(config.params.max_price_age),
  confBps: BigInt(config.params.max_price_conf_bps),
  version: Number(config.params_version),
});

/** Each campaign's SealedFees, by sponsor address: kept beside the campaign's model, for as long as the run holds it. */
const SEALED = new WeakMap<ModelCampaign, Map<string, SealedModel>>();
export function sealedOf(c: ModelCampaign): Map<string, SealedModel> {
  const known = SEALED.get(c);
  if (known) return known;
  const fresh = new Map<string, SealedModel>();
  SEALED.set(c, fresh);
  return fresh;
}
export const liveSealed = (c: ModelCampaign) => [...sealedOf(c).values()].filter((s) => s.state === "live");
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

/** `ceil(usd × 10^(9 − e) ÷ (p − conf))` at e = −8 (TP 3.4.16), split by `prizeBps`: the entry rounds down, the fee is the rest. */
export function sealedPrice(usd: bigint, price: bigint, conf: bigint, prizeBps: bigint) {
  const charged = price - conf;
  const scaled = usd * 10n ** 17n;
  const paid = scaled / charged + (scaled % charged === 0n ? 0n : 1n);
  const entry = (paid * prizeBps) / 10_000n;
  return { charged, paid, entry, fee: paid - entry };
}

/**
 * The program's refusal of a sealed entry, in its order: the join's rules with the pause before the price (I10′), the
 * version of the creation rules the sponsor signed, then the charge (the floor, the SOL/USD account, the bound).
 */
export function sealedRefusal(
  h: Harness,
  op: SealedOp,
  t: bigint,
  terms: SealedTerms,
  paid: bigint,
  max: bigint,
): BrotErrorName | undefined {
  const c = h.camps[op.c];
  if (c.phase !== "Open") return "CampaignNotOpen";
  if (t >= c.entriesCloseAt) return "EntriesClosed";
  if (h.paused) return "JoinWhilePaused";
  if (op.quirk === "version") return "CreationParamsChanged";
  if (op.usd < terms.floor) return "SealedEntryBelowFloor";
  if (op.quirk === "stale") return "SolUsdStale";
  if (op.quirk === "wide") return "SolUsdConfidenceTooWide";
  if (paid > max) return "SealedEntryAboveMaxLamports";
  // The campaign's minimum cannot refuse a US$500 entry part; the signed entry total is checked at the Entry.
  return op.quirk === "total" ? "EntryTotalMismatch" : undefined;
}
