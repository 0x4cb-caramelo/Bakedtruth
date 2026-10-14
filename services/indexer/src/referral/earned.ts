/**
 * Purpose: what each wallet has earned from referrals as the indexer's file stands (Sprint 14, lane L14R; TP §3.4.11,
 *          "it reads finalized rows only"): the referral rows computed again from the file's events and stored block
 *          positions (project.ts), inside one read transaction, with the slot and chain time they are as of. An active
 *          referee's rebate goes to the referee; the referrer's 20% of every payable basis of its active referees goes
 *          to the referrer. A file that is not complete is refused: a transaction pending or skipped, or a campaign
 *          with a gap in its events, could hide an entry that changes whose link counts and what was won.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { freshness } from "../api/queries";
import type { Store } from "../db/store";
import { gapIn } from "../project";
import { computeReferrals } from "./project";
import type { ReferralEntryRow } from "./referee";

export type Earned = { referrer: bigint; rebate: bigint };
export type Standing = {
  asOfSlot: number;
  chainTime: number | null;
  earned: Map<string, Earned>;
  /** Entries a check against the campaign held: never paid until it passes. */
  held: ReferralEntryRow[];
  /** Entries whose campaign is not finalized, paid out or collected yet. */
  waiting: number;
  /** Links whose order against the first entry waits for a block's order. */
  undecided: number;
};

/** The indexer's file is not complete enough to pay from. */
export class NotComplete extends Error {
  override name = "NotComplete";
}

const count = (store: Store, sql: string) => (store.db.query(sql).get() as { n: number }).n;

export function standingOf(indexer: Store): Standing {
  return indexer.db.transaction(() => {
    const stuck = count(indexer, "SELECT count(*) AS n FROM signatures WHERE state IN ('pending', 'skipped')");
    if (stuck > 0) throw new NotComplete(`${stuck} transaction(s) the indexer has not read: wait, or rebuild it`);
    const addresses = indexer.db.query("SELECT DISTINCT campaign FROM events WHERE campaign IS NOT NULL").all() as {
      campaign: string;
    }[];
    const gaps = addresses.filter((a) => gapIn(indexer, a.campaign)).length;
    if (gaps > 0) throw new NotComplete(`${gaps} campaign(s) with a gap in their events: wait, or rebuild the indexer`);
    const { referrals, entries } = computeReferrals(indexer);
    const earned = new Map<string, Earned>();
    const of = (wallet: string) => earned.get(wallet) ?? earned.set(wallet, { referrer: 0n, rebate: 0n }).get(wallet)!;
    for (const r of referrals) {
      if (r.status !== "active") continue;
      if (BigInt(r.rebate) > 0n) of(r.referee).rebate += BigInt(r.rebate);
      if (BigInt(r.referrer_share) > 0n) of(r.referrer).referrer += BigInt(r.referrer_share);
    }
    const f = freshness(indexer);
    return {
      ...{ asOfSlot: Number(f.as_of_slot), chainTime: f.chain_time === null ? null : Number(f.chain_time), earned },
      held: entries.filter((e) => e.state === "held"),
      waiting: entries.filter((e) => e.state === "open" || e.state === "unsettled").length,
      undecided: referrals.filter((r) => r.status === "undecided").length,
    };
  })();
}
