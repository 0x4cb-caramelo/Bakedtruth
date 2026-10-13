/**
 * Purpose: one referee's referral state (TP §3.4.11; P1 §3.9; Sprint 14, lane L14R), from its link, its joins and the
 *          facts of each opening it entered: whether the link came before its first entry, by chain order (order.ts:
 *          a link after it, or still undecided between two transactions of one slot, earns nothing); the 90-day
 *          window from that entry's chain time; each opening's basis (basis.ts) and the referrer's 20% of the part
 *          that landed in the window; and the rebate, the fee kept on its first 0.4576 SOL of entries once its entries
 *          reach 2.2879 SOL, capped at 0.05 SOL. Pure. The rows are the `referrals` and `referral_entries` tables.
 * Version: 0.2.0 (the link's status by chain order)
 * Sprint:  14 (referral, lane L14R)
 *
 * Read as the founder's rules leave open, and said in the lane's report: a join counts toward the 20% when its block
 * time is before the window's end (entries made in the 90 days, settled whenever); every entry counts toward the two
 * thresholds, refunded or not, and the rebate has no window; the rebate counts the same fee as the 20%, so a
 * one-sided pot's 1% is in neither.
 */
import { SettleMode } from "@brot/sdk/read";

import { openingBasis } from "./basis";
import type { Join, Link, OpeningFacts } from "./facts";
import { linkedBefore } from "./order";
import {
  REBATE_AFTER_LAMPORTS,
  REBATE_CAP_LAMPORTS,
  REBATE_FIRST_LAMPORTS,
  referrerShareOf,
  WINDOW_SECONDS,
} from "./rules";

export type ReferralRow = {
  referee: string;
  referrer: string;
  linked_at: number;
  linked_slot: number;
  signature: string;
  status: "awaiting_entry" | "undecided" | "active" | "late";
  first_entry_slot: number | null;
  first_entry_time: number | null;
  window_ends_at: number | null;
  entered: string;
  rebate_reached_slot: number | null;
  rebate_basis: string;
  rebate: string;
  basis: string;
  referrer_share: string;
  held: number;
};

export type ReferralEntryRow = {
  referee: string;
  campaign: string;
  opening: number;
  referrer: string;
  first_slot: number;
  state: string;
  reason: string | null;
  settle_mode: string | null;
  entered: string;
  counted: string;
  winning_total: string | null;
  fee_total: string | null;
  from_fee: string | null;
  basis: string;
  referrer_share: string;
  rebate_basis: string;
  payable_slot: number | null;
};

const min = (a: bigint, b: bigint) => (a < b ? a : b);
const sum = (values: bigint[]) => values.reduce((t, v) => t + v, 0n);

/** Each join's part within the first `limit` lamports of all the referee's entries, in chain order. */
function firstParts(joins: readonly Join[], limit: bigint): bigint[] {
  let before = 0n;
  return joins.map((j) => {
    const part = before >= limit ? 0n : min(j.amount, limit - before);
    before += j.amount;
    return part;
  });
}

/** The slot of the join that took the referee's entries to `threshold`, or `null` before it. */
function reachedAt(joins: readonly Join[], threshold: bigint): number | null {
  let total = 0n;
  for (const j of joins) if ((total += j.amount) >= threshold) return j.slot;
  return null;
}

export function refereeRows(
  link: Link,
  joins: readonly Join[],
  factsOf: (campaign: string, opening: number) => OpeningFacts,
  positionOf: (signature: string) => number | undefined,
): { referral: ReferralRow; entries: ReferralEntryRow[] } {
  const first = joins[0] ?? null;
  const before = first === null ? null : linkedBefore(link, joins, positionOf);
  const status = first === null ? "awaiting_entry" : before === null ? "undecided" : before ? "active" : "late";
  const windowEnd = first?.time == null ? null : first.time + WINDOW_SECONDS;
  const reached = reachedAt(joins, REBATE_AFTER_LAMPORTS);
  const entries: ReferralEntryRow[] = [];
  if (status === "active") {
    const parts = firstParts(joins, REBATE_FIRST_LAMPORTS);
    const groups = new Map<string, number[]>();
    joins.forEach((j, i) => {
      const key = `${j.campaign}:${j.opening}`;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(i);
    });
    for (const indexes of groups.values()) {
      const here = indexes.map((i) => joins[i]);
      const facts = factsOf(here[0].campaign, here[0].opening);
      const ob = openingBasis(facts, link.referee, here);
      const inWindow = (i: number) => windowEnd !== null && here[i].time !== null && here[i].time! < windowEnd;
      const untimed = ob.early.some((e, i) => e > 0n && (windowEnd === null || here[i].time === null));
      const live = ob.state === "payable" || ob.state === "unsettled";
      const [state, reason] = live && untimed ? ["held", "a join without a block time"] : [ob.state, ob.reason];
      const counted = sum(ob.early.filter((_, i) => inWindow(i)));
      const payable = state === "payable";
      const basis = payable ? ob.kept(counted) : 0n;
      const rebateBasis = payable ? sum(indexes.map((i, k) => ob.kept(min(parts[i], ob.early[k])))) : 0n;
      const s = ob.snapshot;
      entries.push({
        ...{ referee: link.referee, campaign: here[0].campaign, opening: here[0].opening, referrer: link.referrer },
        ...{ first_slot: here[0].slot, state, reason, settle_mode: s ? SettleMode[s.mode] : null },
        ...{ entered: sum(here.map((j) => j.amount)).toString(), counted: counted.toString() },
        ...{ winning_total: s?.winningTotal.toString() ?? null, fee_total: s?.feeTotal.toString() ?? null },
        ...{ from_fee: s?.fromFee.toString() ?? null, basis: basis.toString() },
        ...{ referrer_share: referrerShareOf(basis).toString(), rebate_basis: rebateBasis.toString() },
        payable_slot: payable ? ob.payableSlot : null,
      });
    }
  }
  const rebateBasis = sum(entries.map((e) => BigInt(e.rebate_basis)));
  const referral: ReferralRow = {
    ...{ referee: link.referee, referrer: link.referrer, linked_at: Number(link.linkedAt) },
    ...{ linked_slot: Number(link.linkedSlot), signature: link.signature, status },
    ...{ first_entry_slot: first?.slot ?? null, first_entry_time: first?.time ?? null, window_ends_at: windowEnd },
    ...{ entered: sum(joins.map((j) => j.amount)).toString(), rebate_reached_slot: reached },
    rebate_basis: rebateBasis.toString(),
    rebate: (status === "active" && reached !== null ? min(rebateBasis, REBATE_CAP_LAMPORTS) : 0n).toString(),
    basis: sum(entries.map((e) => BigInt(e.basis))).toString(),
    referrer_share: sum(entries.map((e) => BigInt(e.referrer_share))).toString(),
    held: entries.filter((e) => e.state === "held").length,
  };
  return { referral, entries };
}
