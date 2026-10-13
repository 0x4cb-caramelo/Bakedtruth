/**
 * Purpose: the home page's order (proposal §2.7; TP §3.5 "Ranking and listing"; Sprint 08 DoD, X1.9), from the
 *          indexer's finalized rows, content/partners.json and the chain's clock, written to `campaigns.rank` and
 *          `campaigns.listed` after each refresh. Groups, in order: (1) a partner campaign during its highlight, when
 *          a team key opened it (P-3); (2) two-sided campaigns; (3) one-sided ones; (4) empty ones. Inside a group:
 *          more entries first, then the sooner its entries close (the site's order since Sprint 10), then the older
 *          opening. A campaign with no entry 24 hours after it opened is unlisted from the home page (`listed` 0) and
 *          ranks after every listed one, for the "all campaigns" list; a highlighted one stays listed. A closed
 *          campaign's account is gone: no rank and no listing (null). Unlisting is display only.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * X1.9, no rank input a creator can pay for: the prize, the opening payment and every amount are left out, and so are
 * the entries the creator's own wallet made (the `is_creator` flag): they move no campaign up a group, add to no
 * count and keep no campaign listed. The creator's other wallets cannot be told apart on-chain. Distinct-wallet
 * counts are never used (TP §3.5).
 */
import type { Partner } from "@brot/sdk/schemas";

import type { Store } from "./db/store";

/** A campaign with no entry this long after it opened leaves the home page. */
export const UNLIST_AFTER_SECONDS = 86_400;

export const GROUPS = ["highlight", "two_sided", "one_sided", "empty"] as const;
export type Group = (typeof GROUPS)[number];

/** What the order reads of one live opening: entries other than the creator's own, by side. */
export type RankRow = {
  address: string;
  opening: number;
  id: string;
  opens_at: number;
  entries_close_at: number;
  creator_is_team: number;
  yes: number;
  no: number;
};

export type Placed = RankRow & {
  rank: number;
  listed: boolean;
  group: Group;
  /** The highlight's partner and end, while it lasts. */
  partner: string | null;
  highlightUntil: number | null;
};

/** The highlight of each partner campaign, keyed by its id and `opens_at`. */
function highlights(partners: readonly Partner[]): Map<string, { partner: string; from: number; until: number }> {
  const out = new Map<string, { partner: string; from: number; until: number }>();
  for (const p of partners)
    for (const c of p.campaigns)
      out.set(`${c.id}|${c.opensAt}`, {
        partner: p.partner,
        from: Number(c.highlightFrom),
        until: Number(c.highlightUntil),
      });
  return out;
}

/** The order of the live openings at chain time `now` (Unix seconds); pure, so tests need no clock. */
export function orderCampaigns(rows: readonly RankRow[], partners: readonly Partner[], now: number): Placed[] {
  const lit = highlights(partners);
  const placed = rows.map((row) => {
    const h = lit.get(`${row.id}|${row.opens_at}`);
    const shining = h !== undefined && row.creator_is_team === 1 && h.from <= now && now < h.until;
    const entries = row.yes + row.no;
    const group: Group = shining
      ? "highlight"
      : row.yes > 0 && row.no > 0
        ? "two_sided"
        : entries > 0
          ? "one_sided"
          : "empty";
    const listed = shining || entries > 0 || now < row.opens_at + UNLIST_AFTER_SECONDS;
    return {
      ...row,
      rank: 0,
      listed,
      group,
      partner: shining ? h.partner : null,
      highlightUntil: shining ? h.until : null,
    };
  });
  placed.sort(
    (a, b) =>
      Number(b.listed) - Number(a.listed) ||
      GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) ||
      b.yes + b.no - (a.yes + a.no) ||
      a.entries_close_at - b.entries_close_at ||
      a.opens_at - b.opens_at ||
      (a.address < b.address ? -1 : a.address > b.address ? 1 : 0) ||
      a.opening - b.opening,
  );
  placed.forEach((p, i) => (p.rank = i + 1));
  return placed;
}

/** The live openings (not closed), each with its entries by side, the creator's own left out. */
export const rankRows = (store: Store): RankRow[] =>
  store.db
    .query(
      `SELECT c.address, c.opening, c.id, c.opens_at, c.entries_close_at, c.creator_is_team,
         (SELECT count(*) FROM entries e WHERE e.campaign = c.address AND e.opening = c.opening AND e.is_creator = 0
            AND e.side = 'Yes') AS yes,
         (SELECT count(*) FROM entries e WHERE e.campaign = c.address AND e.opening = c.opening AND e.is_creator = 0
            AND e.side = 'No') AS no
       FROM campaigns c WHERE c.closed = 0`,
    )
    .all() as RankRow[];

/** Recomputes `rank` and `listed` for every row in one transaction; a closed opening gets null for both. */
export function writeRanking(store: Store, partners: readonly Partner[], now: number): Placed[] {
  const placed = orderCampaigns(rankRows(store), partners, now);
  const set = store.db.prepare("UPDATE campaigns SET rank = ?, listed = ? WHERE address = ? AND opening = ?");
  store.tx(() => {
    store.db.run("UPDATE campaigns SET rank = NULL, listed = NULL WHERE closed = 1");
    for (const p of placed) set.run(p.rank, p.listed ? 1 : 0, p.address, p.opening);
  });
  return placed;
}
