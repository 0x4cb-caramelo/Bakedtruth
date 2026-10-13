/**
 * Purpose: the referral's money rules as the founder set them (Ronaldo, 2026-10-13, "as recommended"; TP §3.4.11;
 *          BP v0.0.4 P1 §3.9; P-6), in one place: the referrer's 20% of the fee Brot actually kept on each winning
 *          entry of the referee, for 90 days from the referee's first entry (Q9 b); the referee's rebate, the fee kept
 *          on its first 0.4576 SOL of entries once its entries reach 2.2879 SOL (US$50 and US$250 at the reference
 *          price), capped at 0.05 SOL; and the memo every payout transfer carries, so the chain itself says what was
 *          paid (landed.ts). No rent figure lives here: the routine reads it from the RPC (batch.ts).
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */

/** The referrer's part of the basis, in basis points: 20%. */
export const REFERRER_BPS = 2_000n;

/** How long a referee's entries earn its referrer: 90 days from its first entry, in seconds of chain time. */
export const WINDOW_SECONDS = 90 * 86_400;

/** The rebate's base: the fee kept on the referee's first 0.4576 SOL of entries (US$50). */
export const REBATE_FIRST_LAMPORTS = 457_600_000n;

/** The rebate is due once the referee's entries reach 2.2879 SOL (US$250). */
export const REBATE_AFTER_LAMPORTS = 2_287_900_000n;

/** The rebate's ceiling: 0.05 SOL (P-6). */
export const REBATE_CAP_LAMPORTS = 50_000_000n;

/** Every payout transfer carries the memo `brot-referral:<batch>:<index>`. */
export const MEMO_PREFIX = "brot-referral";

export const memoOf = (batch: number, idx: number) => `${MEMO_PREFIX}:${batch}:${idx}`;

/** The batch and index a payout memo names, or `null` for any other memo. */
export function parseMemo(memo: string): { batch: number; idx: number } | null {
  const match = /^brot-referral:([1-9][0-9]{0,8}):([1-9][0-9]{0,8})$/.exec(memo);
  return match ? { batch: Number(match[1]), idx: Number(match[2]) } : null;
}

/** The referrer's 20% of a basis, rounded down like every payout. */
export const referrerShareOf = (basis: bigint) => (basis * REFERRER_BPS) / 10_000n;

/** A lamport amount as SOL with all nine decimals, exactly (no float). */
export function solOf(lamports: bigint): string {
  const sign = lamports < 0n ? "-" : "";
  const abs = lamports < 0n ? -lamports : lamports;
  return `${sign}${abs / 1_000_000_000n}.${(abs % 1_000_000_000n).toString().padStart(9, "0")}`;
}
