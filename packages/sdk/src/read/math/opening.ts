/**
 * Purpose: the price of a paid opening in lamports at the Pyth SOL/USD price, and its split into the
 *          prize and Brot's opening fee. Mirrors programs/brot-markets/src/math/opening.rs (D-b, D-f;
 *          TP 3.4.16; T25).
 * Version: 0.1.0
 * Sprint:  05 (SDK: the math mirror)
 *
 * ```text
 * opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)          (toward Brot)
 * prize_lamports        = floor(opening_paid_lamports × opening_prize_bps ÷ 10,000)
 * opening_fee_lamports  = opening_paid_lamports − prize_lamports
 * ```
 * Worked example A of the TP: p = 10,927,000,000, e = −8, US$500 → 4,575,821,360 lamports, prize
 * 4,118,239,224, opening fee 457,582,136. The program charges at `price − conf` (founder answer 2);
 * `chargedPrice` in ../quote.ts takes that step before calling this.
 */
import { refuse } from "../errors";
import { argI32, argI64, argU16, argU64, toU64, u128 } from "./integers";
import { bpsFloor, divCeil } from "./rounding";

/** The lowest and highest Pyth exponents the conversion accepts (`MIN_PRICE_EXPONENT`, `MAX_PRICE_EXPONENT`). */
export const MIN_PRICE_EXPONENT = -18;
export const MAX_PRICE_EXPONENT = 0;
/** One SOL is 10^9 lamports. */
const LAMPORT_DECIMALS = 9;

/** What a paid opening moves into the vault, all of it, split by bookkeeping (I14). */
export type OpeningSplit = { paid: bigint; prize: bigint; fee: bigint };

/**
 * Lamports for `openingUsd` whole US$ at `price × 10^exponent` US$ per SOL, rounded up. Refuses, in
 * this order: `SolUsdPriceNonPositive` when `price ≤ 0`, `PriceExponentOutOfRange` outside −18..=0,
 * `MathOverflow` when the result does not fit a u64 (`opening_paid_lamports`).
 */
export function openingPaidLamports(openingUsd: bigint, price: bigint, exponent: number): bigint {
  argU64(openingUsd, "openingUsd");
  argI64(price, "price");
  argI32(exponent, "exponent");
  if (price <= 0n) refuse("SolUsdPriceNonPositive");
  if (exponent < MIN_PRICE_EXPONENT || exponent > MAX_PRICE_EXPONENT) refuse("PriceExponentOutOfRange");
  const factor = 10n ** BigInt(LAMPORT_DECIMALS - exponent);
  const numerator = u128(openingUsd * factor);
  return toU64(divCeil(numerator, price));
}

/** Splits `paid` into the prize (rounded down) and the opening fee, the rest (`split_opening`). */
export function splitOpening(paid: bigint, openingPrizeBps: number): OpeningSplit {
  argU64(paid, "paid");
  const prize = bpsFloor(paid, argU16(openingPrizeBps, "openingPrizeBps"));
  return { paid, prize, fee: toU64(paid - prize) };
}
