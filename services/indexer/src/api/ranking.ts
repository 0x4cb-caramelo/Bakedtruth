/**
 * Purpose: the home page's order as a read route (TP §6 "Campaigns with rank, listed and filters"; Sprint 08): the
 *          live openings the ranking placed (ranking.ts), by rank, each with its address, opening, id, rank and
 *          whether the home page lists it; `listed` filters, `limit` and `offset` page. The campaign's own fields stay
 *          in `/api/v1/campaigns`, which the site merges by address. Reads only.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import type { RankedCampaign } from "@brot/sdk/schemas";

import type { Store } from "../db/store";

export type RankingQuery = { listed: boolean | null; limit: number; offset: number };

/** One page of the ranked openings and how many match. */
export function rankingPage(store: Store, q: RankingQuery): { total: number; items: RankedCampaign[] } {
  const where = q.listed === null ? "rank IS NOT NULL" : `rank IS NOT NULL AND listed = ${q.listed ? 1 : 0}`;
  const { n } = store.db.query(`SELECT count(*) AS n FROM campaigns WHERE ${where}`).get() as { n: number };
  const rows = store.db
    .query(`SELECT address, opening, id, rank, listed FROM campaigns WHERE ${where} ORDER BY rank LIMIT ? OFFSET ?`)
    .all(q.limit, q.offset) as { address: string; opening: number; id: string; rank: number; listed: number }[];
  return {
    total: n,
    items: rows.map((r) => ({
      campaign: r.address,
      opening: r.opening,
      id: r.id,
      rank: r.rank,
      listed: r.listed === 1,
    })),
  };
}
