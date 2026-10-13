/**
 * Purpose: how a graduation campaign (`DbcGraduated`) names its curve in a sentence, a title and a rule: the reviewed
 *          name of content/account-names.json as written ("$BROT"); else the ticker its token's own metadata stores,
 *          as the SDK's `tickerOf` lets a screen print it, paired with the last four characters of the pool's address
 *          ("$TEST (…7Dny)"); else "Token (…7Dny)". The A-11 exception (TP §3.4.10): a launch curve is new by nature,
 *          so no team could review its name in time, and the ticker is the token creator's own text, so it never
 *          stands alone. Pure.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05
 */
import { tickerOf } from "@brot/sdk/read";
import type { AccountName } from "@brot/sdk/schemas";

/** The pool's last four characters, as the suffix writes them: "…7Dny". */
export const tailOf = (address: string): string => `…${address.slice(-4)}`;

/** The curve's name: the reviewed one as written, else "$TICKER (…7Dny)", else "Token (…7Dny)". */
export function curveName(pool: string, o: { reviewed?: string | null; symbol?: Uint8Array | null } = {}): string {
  if (o.reviewed) return o.reviewed;
  const ticker = tickerOf(o.symbol);
  return `${ticker === null ? "Token" : `$${ticker}`} (${tailOf(pool)})`;
}

/** The reviewed curve names, pool → name, from the names file's `curve` entries. */
export function reviewedCurves(names: readonly AccountName[]): ReadonlyMap<string, string> {
  return new Map(names.filter((n) => n.kind === "curve").map((n) => [n.address, n.name]));
}
