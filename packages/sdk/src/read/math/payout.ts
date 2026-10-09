/**
 * Purpose: the creator share, what winners split, a winner's payout, the return estimate a join
 *          checks against `min_return_bps`, and a one-sided refund. Mirrors
 *          programs/brot-markets/src/math/payout.rs (D-g read as P-2; TP 3.4.16, 3.4.18).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * ```text
 * fee           = ceil(P × fee_bps ÷ 10,000)
 * C             = floor((V + P) × creator_share_bps ÷ 10,000)    the share on the whole pot
 * from_pot      = min(C, P − fee)                                 never from the prize (2026-10-09)
 * from_fee      = min(C − from_pot, fee)
 * distributable = V + P − fee − from_pot + R                      never below V
 * ```
 * V is the winning side, P the losing side, R the prize. The `Split` functions refuse with
 * `MathOverflow` what no `Split` pot can hold: an empty side, a fee above P, a `from_pot` above
 * `P − fee + R`, an entry above its side.
 */
import { refuse } from "../errors";
import { houseFee, oneSidedFee } from "./fees";
import { argU16, argU64, minBig, toU64, u128 } from "./integers";
import { BPS_DENOMINATOR, bpsFloorWide, mulDivFloor } from "./rounding";

/** The creator's share, split by where it comes from. */
export type CreatorShare = { fromPot: bigint; fromFee: bigint };

/** Both sides hold entries, as in every `Split` pot (`require_split`). */
function requireSplit(winning: bigint, losing: bigint): void {
  if (winning === 0n || losing === 0n) refuse("MathOverflow");
}

/** The P-2 reading of D-g: from the losing side less the fee, then from the fee (`creator_share`). */
export function creatorShare(
  winning: bigint,
  losing: bigint,
  prize: bigint,
  fee: bigint,
  creatorShareBps: number,
): CreatorShare {
  [winning, losing, prize, fee].forEach((value, i) => argU64(value, ["winning", "losing", "prize", "fee"][i]));
  argU16(creatorShareBps, "creatorShareBps");
  requireSplit(winning, losing);
  const share = bpsFloorWide(u128(winning + losing), creatorShareBps);
  const losingKept = u128(losing - fee);
  const fromPot = minBig(share, losingKept);
  const fromFee = minBig(u128(share - fromPot), fee);
  return { fromPot: toU64(fromPot), fromFee: toU64(fromFee) };
}

/** `V + P − fee − from_pot + R` (`distributable`). */
export function distributable(winning: bigint, losing: bigint, prize: bigint, fee: bigint, fromPot: bigint): bigint {
  [winning, losing, prize, fee, fromPot].forEach((value) => argU64(value, "amount"));
  requireSplit(winning, losing);
  const kept = toU64(losing - fee);
  const left = u128(u128(kept + prize) - fromPot);
  return toU64(u128(winning + left));
}

/** One winning entry's payout in `Split`: `floor(entry × distributable ÷ winning)` (`split_payout`). */
export function splitPayout(entry: bigint, distributableLamports: bigint, winning: bigint): bigint {
  [entry, distributableLamports, winning].forEach((value) => argU64(value, "amount"));
  if (entry > winning) refuse("MathOverflow");
  return mulDivFloor(entry, distributableLamports, winning);
}

/** The pot as a join would leave it, from the joining side's point of view (`JoinedPot`). */
export type JoinedPot = {
  /** The entry being added now. */
  amount: bigint;
  /** The joining side's pool after the entry (V if this side wins). */
  sideAfter: bigint;
  /** The other side's pool (P if this side wins). */
  other: bigint;
  prize: bigint;
  feeBps: number;
  oneSidedFeeBps: number;
  creatorShareBps: number;
  /** The baker is the campaign's first baker (exempt from the one-sided fee). */
  isFirst: boolean;
};

/**
 * What `amount` returns if its side wins, in bps of `amount`, rounded down: the `Split` payout when
 * the other side holds entries, else the `OneSided` refund. The join refuses when it is below
 * `min_return_bps` (`estimate_return_bps`). Like the program, it applies the `Split` formula
 * whenever the other side is not empty, without the viability rule finalize applies later.
 */
export function estimateReturnBps(pot: JoinedPot): bigint {
  const { amount, sideAfter, other, prize } = pot;
  [amount, sideAfter, other, prize].forEach((value) => argU64(value, "amount"));
  if (amount === 0n || amount > sideAfter) refuse("MathOverflow");
  let returned: bigint;
  if (other === 0n) {
    returned = toU64(amount - oneSidedFee(amount, pot.oneSidedFeeBps, pot.isFirst));
  } else {
    const fee = houseFee(other, pot.feeBps);
    const share = creatorShare(sideAfter, other, prize, fee, pot.creatorShareBps);
    const pool = distributable(sideAfter, other, prize, fee, share.fromPot);
    returned = splitPayout(amount, pool, sideAfter);
  }
  return mulDivFloor(returned, BPS_DENOMINATOR, amount);
}

/** What a `OneSided` entry gets back: `entry − its one-sided fee` (`one_sided_refund`). */
export type OneSidedRefund = { payout: bigint; fee: bigint };

export function oneSidedRefund(entry: bigint, oneSidedFeeBps: number, isFirst: boolean): OneSidedRefund {
  const fee = oneSidedFee(entry, oneSidedFeeBps, isFirst);
  return { payout: toU64(entry - fee), fee };
}
