/**
 * Purpose: exact, deterministic display of the program's units: lamports as SOL with all nine decimals
 *          (no floating point), Unix seconds as a UTC date, basis points as a percentage, a price target
 *          scaled by its feed's exponent, US cents, a long address shortened. Pure: the same input always
 *          prints the same text, on every runtime, and no input makes it throw.
 * Version: 0.1.1
 * Sprint:  05 (SDK)
 */

/** `4575821360n` → `"4.575821360"`. */
export function formatSol(lamports: bigint): string {
  const sign = lamports < 0n ? "-" : "";
  const size = lamports < 0n ? -lamports : lamports;
  return `${sign}${size / 1_000_000_000n}.${(size % 1_000_000_000n).toString().padStart(9, "0")}`;
}

/** The furthest second a JavaScript date can show (±8.64 × 10^12 s). */
const LAST_DATE_SECONDS = 8_640_000_000_000n;

/** Unix seconds as `YYYY-MM-DD HH:MM:SS UTC`; computing it reads no clock. Beyond any date, the raw seconds. */
export function formatUtc(unixSeconds: bigint): string {
  if (unixSeconds > LAST_DATE_SECONDS || unixSeconds < -LAST_DATE_SECONDS) {
    return `${unixSeconds} Unix seconds (beyond any calendar date)`;
  }
  return `${new Date(Number(unixSeconds) * 1000).toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

/** Basis points as a percentage with two decimals: `12345` → `"123.45%"`. */
export function formatBps(bps: bigint | number): string {
  const value = BigInt(bps);
  const sign = value < 0n ? "-" : "";
  const size = value < 0n ? -value : value;
  return `${sign}${size / 100n}.${(size % 100n).toString().padStart(2, "0")}%`;
}

/**
 * `value × 10^exponent`, exactly, as a decimal: `(12000000000000n, -8)` → `"120000.00000000"`, the way a
 * Pyth price and a price target are stored. An exponent beyond ±30, which no feed uses, prints as `value e exp`.
 */
export function formatScaled(value: bigint, exponent: number): string {
  if (!Number.isInteger(exponent) || exponent > 30 || exponent < -30) return `${value}e${exponent}`;
  if (exponent >= 0) return (value * 10n ** BigInt(exponent)).toString();
  const sign = value < 0n ? "-" : "";
  const size = value < 0n ? -value : value;
  const unit = 10n ** BigInt(-exponent);
  return `${sign}${size / unit}.${(size % unit).toString().padStart(-exponent, "0")}`;
}

/** US cents as dollars: `11803n` → `"US$118.03"`. */
export const formatUsdCents = (cents: bigint): string => `US$${formatScaled(cents, -2)}`;

/** `6G2d…uVN` for a base58 address. */
export const shortAddress = (address: string): string => `${address.slice(0, 4)}…${address.slice(-4)}`;
