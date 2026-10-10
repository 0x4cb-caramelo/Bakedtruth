/**
 * Purpose: a reference model of the money, written apart from the program's math (TP 3.4.16): the
 *          randomized test checks the program against it, so it must not reuse the Rust formulas. The
 *          same rules are spelled out here in whole-number steps (BigInt), not as the program writes them.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */

const TEN_THOUSAND = 10_000n;

/** `ceil(x × bps ÷ 10,000)`, written as "whole part plus any remainder". */
export function feeCeil(x: bigint, bps: bigint): bigint {
  const product = x * bps;
  const whole = product / TEN_THOUSAND;
  return product % TEN_THOUSAND === 0n ? whole : whole + 1n;
}

/** `floor(x × bps ÷ 10,000)`. */
export function shareFloor(x: bigint, bps: bigint): bigint {
  return (x * bps) / TEN_THOUSAND;
}

export type SplitInput = { winning: bigint; losing: bigint; prize: bigint; feeBps: bigint; creatorBps: bigint };
export type SplitResult = {
  fee: bigint;
  creatorFromPot: bigint;
  creatorFromFee: bigint;
  brotKeeps: bigint;
  distributable: bigint;
};

/**
 * The Economic Viability Rule (decision of 2026-10-09): a pot splits only when the losing side is more than the
 * fees taken from it, Brot's fee plus the creator's share on the whole pot (`creatorBps` 0 for a team opening).
 * Otherwise the pot resolves one-sided. Mirrors `math/snapshot.rs` `split_is_viable`.
 */
export function splitIsViable(input: SplitInput): boolean {
  const { winning, losing, feeBps, creatorBps } = input;
  const fee = feeCeil(losing, feeBps);
  const share = shareFloor(winning + losing, creatorBps);
  return losing > fee + share;
}

/**
 * The P-2 reading (TP 3.4.16), in the rule's own words: the creator's share comes from the pot first,
 * the rest from Brot's fee; the winners keep their entries whole, and never get less than they put in.
 */
export function settleSplit(input: SplitInput): SplitResult {
  const { winning, losing, prize, feeBps, creatorBps } = input;
  const fee = feeCeil(losing, feeBps);
  const owed = shareFloor(winning + losing, creatorBps);
  // Decision of 2026-10-09: the share comes from the losing side less the fee, never the prize.
  const spare = losing - fee;
  const creatorFromPot = owed < spare ? owed : spare;
  const feeLeft = fee;
  const shortfall = owed - creatorFromPot;
  const creatorFromFee = shortfall < feeLeft ? shortfall : feeLeft;
  const distributable = winning + losing + prize - fee - creatorFromPot;
  return {
    fee,
    creatorFromPot,
    creatorFromFee,
    brotKeeps: fee - creatorFromFee,
    distributable: distributable < winning ? winning : distributable,
  };
}

/** Each winning entry's payout: `floor(entry × distributable ÷ winning)`. */
export function payoutOf(entry: bigint, distributable: bigint, winning: bigint): bigint {
  return (entry * distributable) / winning;
}

/** The one-sided fee: `ceil(entry × rate)`, zero for the first baker. */
export function oneSidedFee(entry: bigint, bps: bigint, isFirst: boolean): bigint {
  return isFirst ? 0n : feeCeil(entry, bps);
}
