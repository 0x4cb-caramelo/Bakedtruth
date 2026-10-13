/**
 * Purpose: the 30-day return (BP v0.0.4 P2 §2.5 test 1 and §6.3, "a parcela das carteiras que entra de novo em 30
 *          dias"; TP §3.5 KPIs; Sprint 08), from the indexer's entries: of the wallets whose first entry is at least
 *          30 days old at chain time, how many entered another campaign in the 30 days after it. A wallet whose first
 *          entry is younger cannot be judged yet and is counted apart. Counts only: no address leaves this function.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * The reading, written down because the plan does not define it: "again" is an entry in another campaign (another
 * address, or another opening of it) after the first entry's block time; a second entry in the same campaign is not
 * a return. Entries without a block time (a node that gave none) are left out.
 */
import type { Store } from "./db/store";

export const RETURN_WINDOW_SECONDS = 30 * 86_400;

export type Return30 = {
  /** Wallets whose first entry is at least 30 days old. */
  measured: number;
  returned: number;
  /** `returned / measured` in basis points, rounded down; 0 with nothing measured. */
  return_bps: number;
  /** Wallets whose first entry is younger than 30 days. */
  too_recent: number;
};

type Row = { baker: string; campaign: string; opening: number; block_time: number };

export function return30(store: Store, now: number): Return30 {
  const rows = store.db
    .query(
      `SELECT baker, campaign, opening, block_time FROM entries WHERE block_time IS NOT NULL
       ORDER BY baker, block_time, slot, signature, ix_index, inner_index`,
    )
    .all() as Row[];
  let measured = 0;
  let returned = 0;
  let tooRecent = 0;
  for (let i = 0; i < rows.length;) {
    const first = rows[i];
    let j = i;
    let back = false;
    while (j < rows.length && rows[j].baker === first.baker) {
      const r = rows[j];
      const other = r.campaign !== first.campaign || r.opening !== first.opening;
      if (other && r.block_time > first.block_time && r.block_time <= first.block_time + RETURN_WINDOW_SECONDS)
        back = true;
      j += 1;
    }
    if (now - first.block_time < RETURN_WINDOW_SECONDS) tooRecent += 1;
    else {
      measured += 1;
      if (back) returned += 1;
    }
    i = j;
  }
  return {
    measured,
    returned,
    return_bps: measured === 0 ? 0 : Math.floor((returned * 10_000) / measured),
    too_recent: tooRecent,
  };
}
