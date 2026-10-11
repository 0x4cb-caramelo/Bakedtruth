/**
 * Purpose: the short words the approved prototype's cards and rows use (the UI overhaul): a moment as "in 50d 7h",
 *          "in 3h 12m", "in 50m" or "4h ago" from the chain's clock, whether it is under a day away (the warning
 *          colour), and a SOL amount with at most four decimals and no trailing zeros ("11.1 SOL"). The per-1 estimate
 *          is the entry panel's own (features/entry/estimate.ts), so the card and the panel never disagree.
 * Version: 0.1.0
 * Sprint:  10 (campaign list), in the UI overhaul
 */
const MIN = 60n;
const HOUR = 3_600n;
const DAY = 86_400n;

function span(seconds: bigint): string {
  if (seconds >= DAY) return `${seconds / DAY}d ${(seconds % DAY) / HOUR}h`;
  if (seconds >= HOUR) return `${seconds / HOUR}h ${(seconds % HOUR) / MIN}m`;
  return `${seconds / MIN > 0n ? seconds / MIN : 1n}m`;
}

/** "in 50d 7h" for a moment ahead of `now`, "4h 2m ago" for one behind it. */
export function relative(at: bigint, now: bigint): string {
  return at >= now ? `in ${span(at - now)}` : `${span(now - at)} ago`;
}

/** Under 24 hours away: the prototype paints "closes in" amber only then (spec 1.4). */
export const soon = (at: bigint | null, now: bigint): boolean => at !== null && at > now && at - now < DAY;

/** Lamports as SOL with up to four decimals, trailing zeros dropped: 11_100_000_000n → "11.1 SOL". */
export function solShort(lamports: bigint): string {
  const whole = lamports / 1_000_000_000n;
  const four = ((lamports % 1_000_000_000n) / 100_000n).toString().padStart(4, "0").replace(/0+$/, "");
  return `${whole}${four ? `.${four}` : ""} SOL`;
}
