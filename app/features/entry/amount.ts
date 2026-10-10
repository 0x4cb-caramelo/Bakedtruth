/**
 * Purpose: the amount a baker types, as lamports, exactly: no floating point between the text and the bigint the
 *          transaction carries. Accepts a dot or a comma, at most nine decimals, never a sign or an exponent. Also the
 *          way the panel writes an amount back, and SOL rounded down or up to four decimals for "≈" figures.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */

export const LAMPORTS_PER_SOL = 1_000_000_000n;
const SOL_TEXT = /^(\d{0,12})(?:[.,](\d{0,9}))?$/;

/** "0.5" → 500,000,000n; "1,25" → 1,250,000,000n. `null` for anything that is not a plain positive decimal. */
export function parseSol(text: string): bigint | null {
  const match = SOL_TEXT.exec(text.trim());
  if (!match) return null;
  const [, whole, fraction = ""] = match;
  if (whole === "" && fraction === "") return null;
  const lamports = BigInt(whole || "0") * LAMPORTS_PER_SOL + BigInt(fraction.padEnd(9, "0") || "0");
  return lamports > 0n ? lamports : null;
}

/** 500,000,000n → "0.5"; the shortest text `parseSol` reads back as the same lamports. */
export function solText(lamports: bigint): string {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL).toString().padStart(9, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

/** SOL with four decimals: rounded down by default (what a baker may receive), up for what leaves the wallet. */
export function sol4(lamports: bigint, round: "down" | "up" = "down"): string {
  const step = 100_000n; // 10^-4 SOL
  const units = round === "up" ? (lamports + step - 1n) / step : lamports / step;
  const whole = units / 10_000n;
  return `${whole}.${(units % 10_000n).toString().padStart(4, "0")}`;
}
