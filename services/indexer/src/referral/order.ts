/**
 * Purpose: "before the first entry", decided by chain order (Sprint 14, lane L14R; the lead's rule of 2026-10-13):
 *          a referee's link counts only when its `ReferralLinked` comes before every `EntryAdded` of that wallet, by
 *          (slot, the transaction's index in its block, the instruction, the inner instruction). Neither the link's
 *          time (cluster time ties within a second) nor its slot alone (several transactions share a slot) decides it.
 *          In one transaction, the instruction order decides: the link counts only when its instruction runs first.
 *          Between two transactions of one slot, only the block's own order decides, which the indexer reads for
 *          exactly those slots (positions.ts); until it has, the link is undecided and earns nothing. Pure.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { Place } from "./facts";

/** Whether `a` runs before `b` in one transaction: the instruction, then the inner instruction. */
const earlierIn = (a: Place, b: Place) => a.ix < b.ix || (a.ix === b.ix && a.inner < b.inner);

/**
 * Whether the link runs before every one of `joins` (the referee's, at least one): `true`, `false`, or `null` when a
 * join shares the link's slot in another transaction and the block's order is not known yet.
 */
export function linkedBefore(
  link: Place,
  joins: readonly Place[],
  positionOf: (signature: string) => number | undefined,
): boolean | null {
  const first = Math.min(...joins.map((j) => j.slot));
  if (link.slot !== first) return link.slot < first;
  let unknown = false;
  for (const join of joins.filter((j) => j.slot === first)) {
    if (join.signature === link.signature) {
      if (!earlierIn(link, join)) return false;
      continue;
    }
    const [a, b] = [positionOf(link.signature), positionOf(join.signature)];
    if (a === undefined || b === undefined) unknown = true;
    else if (a >= b) return false;
  }
  return unknown ? null : true;
}

/**
 * The signatures whose block positions decide a link, by slot: the link's and those of the referee's joins in the
 * same slot in other transactions, when that slot is the referee's first. Empty when slots or instructions decide.
 */
export function positionsNeeded(link: Place, joins: readonly Place[]): { slot: number; signatures: string[] } | null {
  if (joins.length === 0) return null;
  const first = Math.min(...joins.map((j) => j.slot));
  if (link.slot !== first) return null;
  const others = joins.filter((j) => j.slot === first && j.signature !== link.signature).map((j) => j.signature);
  return others.length === 0 ? null : { slot: first, signatures: [...new Set([link.signature, ...others])] };
}
