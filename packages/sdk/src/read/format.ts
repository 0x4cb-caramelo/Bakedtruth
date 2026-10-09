/**
 * Purpose: exact, deterministic display of the program's units: lamports as SOL with all nine decimals
 *          (no floating point), Unix seconds as a UTC date, basis points as a percentage, a long
 *          address shortened. Pure: the same input always prints the same text, on every runtime.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */

/** `4575821360n` → `"4.575821360"`. */
export function formatSol(lamports: bigint): string {
  const sign = lamports < 0n ? "-" : "";
  const size = lamports < 0n ? -lamports : lamports;
  return `${sign}${size / 1_000_000_000n}.${(size % 1_000_000_000n).toString().padStart(9, "0")}`;
}

/** Unix seconds as `YYYY-MM-DD HH:MM:SS UTC`; computing it reads no clock. */
export function formatUtc(unixSeconds: bigint): string {
  return `${new Date(Number(unixSeconds) * 1000).toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

/** Basis points as a percentage with two decimals: `12345` → `"123.45%"`. */
export function formatBps(bps: bigint | number): string {
  const value = BigInt(bps);
  return `${value / 100n}.${(value % 100n).toString().padStart(2, "0")}%`;
}

/** `6G2d…uVN` for a base58 address. */
export const shortAddress = (address: string): string => `${address.slice(0, 4)}…${address.slice(-4)}`;
