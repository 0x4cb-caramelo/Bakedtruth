/**
 * Purpose: what each payout of the reference model pays once the snapshot is taken (TP sections 3.4.7, 3.4.16):
 *          an entry (its early share by mode, plus its late refund), the fee Brot collects, the prize back to the
 *          opener and the creator's share; and I9 as a property of the payout rule. Split out of invariant-model.ts
 *          and invariant-checks.ts.
 * Version: 0.1.0
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14: the no-entry refund keeps the 10%, founder answer 8)
 */
import {
  HOUSE_REASONS,
  isLate,
  ONE_SIDED_BPS,
  sideTotal,
  sumOf,
  winningSide,
  type ModelCampaign,
} from "./invariant-model";
import { oneSidedFee, payoutOf } from "./money-model";

/** What `settle_entry` pays one baker: its early share (per mode) plus its late refund. */
export function entryPayout(c: ModelCampaign, baker: string): bigint {
  const s = c.snapshot;
  if (!s) throw new Error("entryPayout before the snapshot");
  const mine = c.joins.filter((j) => j.baker === baker);
  const late = sumOf(mine.filter((j) => isLate(c, j.at)));
  const early = mine.filter((j) => !isLate(c, j.at));
  if (s.mode === "Refund") return late + sumOf(early);
  if (s.mode === "OneSided") {
    const amount = sumOf(early);
    return amount - oneSidedFee(amount, ONE_SIDED_BPS, baker === s.firstBaker) + late;
  }
  const won = sideTotal(early, winningSide(c));
  return payoutOf(won, s.distributable, s.winning) + late;
}

/** A refund returns the 10% only for a house failure with someone in the pot (P-4; founder answer 8). */
const refundsFee = (c: ModelCampaign) => HOUSE_REASONS.has(c.voidReason) && c.joins.length > 0;

/** What `collect_fee` moves to the fee vault. */
export function collectDue(c: ModelCampaign): bigint {
  const s = c.snapshot;
  if (!s) return 0n;
  if (s.mode === "Split") return s.fee - s.fromFee + c.openingFee;
  if (s.mode === "OneSided") return s.oneSidedFees + c.openingFee;
  return refundsFee(c) ? 0n : c.openingFee;
}

/** What `settle_prize` pays the opener (Split: none, the prize is in the distributable). */
export function prizeDue(c: ModelCampaign): bigint {
  const s = c.snapshot;
  if (!s || s.mode === "Split") return 0n;
  if (s.mode === "OneSided") return c.prize;
  return c.prize + (refundsFee(c) ? c.openingFee : 0n);
}

/** The creator's share (P-1: none on a void, a one-sided pot or a team opening). */
export const shareDue = (c: ModelCampaign) =>
  c.snapshot?.mode === "Split" ? c.snapshot.fromPot + c.snapshot.fromFee : 0n;

export const winnersOf = (c: ModelCampaign) => c.snapshot?.winners ?? 0;

/**
 * I9, as a property of the payout rule: an entry split across two wallets never receives more than the
 * whole entry does (the floor of the sum is at least the sum of the floors).
 */
export function checkSplitNeverPaysMore(amount: bigint, distributable: bigint, winning: bigint) {
  const half = amount / 2n;
  const split = payoutOf(half, distributable, winning) + payoutOf(amount - half, distributable, winning);
  const whole = payoutOf(amount, distributable, winning);
  if (split > whole) throw new Error(`I9: an entry of ${amount} split in two gets ${split}, whole ${whole}`);
}
