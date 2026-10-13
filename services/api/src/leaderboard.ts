/**
 * Purpose: `GET /api/v1/leaderboard` (TP §6; Sprint 13, BR-29): devnet points from the program's events (history.ts)
 *          and the live campaign accounts (the snapshot), through the SDK's rule (`pointsTable`): 1 point per campaign
 *          entered on the side that won, once the result is final and the pot splits (the founder's answer 3a). Only
 *          wallets with points are ranked, in pages, each with its points and the campaigns it entered; no amount, no
 *          success rate (the privacy review). Wallets whose owner asked to be left out (hidden.ts) are dropped before
 *          ranking. The route takes no wallet: a visitor's page finds its own line in the list, so a request to Brot
 *          never carries a wallet (TP §8.2).
 * Version: 0.3.1 (Sprint 08: a live account's word comes from the SDK's `campaignNow`, which the indexer uses too; 0.3.0,
 *          the founder's answer 3a; 0.2.0, the Sprint 13 reviews)
 * Sprint:  13 (site: ranking, notices and copy); 08
 */
import { BOTH_SIDES_SCORE, campaignNow, pointsTable, ranksOf, type CampaignNow } from "@brot/sdk/read";

import type { Hidden } from "./hidden";
import type { History } from "./history";
import { BadQuery, integer } from "./query";
import type { Row, Snapshot } from "./snapshot";

const KNOWN = new Set(["limit", "offset"]);

/** The rule in words, from the same switch as the table. */
const RULE = [
  "1 point per campaign entered on the side that won, once the result is final and the pot splits",
  ...(BOTH_SIDES_SCORE ? [] : ["none for a wallet with entries on both sides"]),
  "none for the creator's own wallet where the creator can control the result",
].join("; ");

export type LeaderboardQuery = { limit: number; offset: number };
export type Line = { rank: number | null; wallet: string; points: number; entered: number };

export function parseLeaderboardQuery(url: URL): LeaderboardQuery {
  for (const key of url.searchParams.keys()) if (!KNOWN.has(key)) throw new BadQuery(`unknown parameter: ${key}`);
  return {
    limit: integer(url, "limit", 50, 1, 100),
    offset: integer(url, "offset", 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

/** What a snapshot row's account says now for the points rule: the SDK's `campaignNow` (Sprint 13's rule). */
export const nowOf = (row: Row): CampaignNow => campaignNow(row.campaign, row.view);

/** The ranked lines, computed once per change of the history, the snapshot or the hide list. */
export function createBoard(history: History, hidden?: Hidden) {
  let key = "";
  let lines: Line[] = [];
  return (snap: Snapshot): Line[] => {
    const next = `${history.version()}|${snap.takenAt}|${hidden?.version() ?? 0}`;
    if (next === key) return lines;
    const now = new Map(snap.rows.map((row) => [row.address.toString(), nowOf(row)] as const));
    const left = hidden?.current() ?? new Set<string>();
    const all = pointsTable(history.events(), now).filter((row) => !left.has(row.wallet));
    const ranks = ranksOf(all);
    lines = all
      .map((row, i) => ({ rank: ranks[i], wallet: row.wallet, points: row.points, entered: row.entered }))
      .filter((line) => line.points > 0);
    key = next;
    return lines;
  };
}

export function leaderboardOf(history: History, snap: Snapshot, query: LeaderboardQuery, lines: Line[]) {
  return {
    as_of_slot: snap.asOfSlot,
    chain_time: snap.chain.unixTimestamp,
    complete: history.complete(),
    rule: RULE,
    both_sides_score: BOTH_SIDES_SCORE,
    total: lines.length,
    offset: query.offset,
    limit: query.limit,
    rows: lines.slice(query.offset, query.offset + query.limit),
  };
}
