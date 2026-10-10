/**
 * Purpose: `GET /api/v1/leaderboard` (TP §6; Sprint 13, BR-29): devnet points from the program's events (history.ts)
 *          and the live campaign accounts (the snapshot), through the SDK's rule (`pointsTable`): 1 point per campaign
 *          entered on the side that won, once the result is final. Only wallets with points are ranked; `wallet=` adds
 *          that wallet's own line. No volume or profit column. Addresses are public on-chain already; nothing about
 *          the visitor is kept (TP §8, the Sprint 13 privacy review).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { Outcome, pointsTable, ranksOf, BOTH_SIDES_SCORE, type CampaignNow } from "@brot/sdk/read";

import type { History } from "./history";
import { BadQuery, integer } from "./query";
import type { Row, Snapshot } from "./snapshot";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const KNOWN = new Set(["limit", "offset", "wallet"]);

export type LeaderboardQuery = { limit: number; offset: number; wallet: string | null };

export function parseLeaderboardQuery(url: URL): LeaderboardQuery {
  for (const key of url.searchParams.keys()) if (!KNOWN.has(key)) throw new BadQuery(`unknown parameter: ${key}`);
  const wallet = url.searchParams.get("wallet");
  if (wallet !== null && !BASE58.test(wallet)) throw new BadQuery("wallet must be a base58 address");
  return {
    limit: integer(url, "limit", 50, 1, 100),
    offset: integer(url, "offset", 0, 0, Number.MAX_SAFE_INTEGER),
    wallet,
  };
}

/** A live account's result is final once no key can change it: settling or settled, or its window ended uncontested. */
export function nowOf(row: Row): CampaignNow {
  const v = row.view;
  const final = v.state === "Paid" || v.state === "Void" || (v.state === "InReview" && v.windowEnded && !v.contested);
  return { outcome: row.campaign.outcome as Outcome, final };
}

export function leaderboardOf(history: History, snap: Snapshot, query: LeaderboardQuery) {
  const now = new Map(snap.rows.map((row) => [row.address.toString(), nowOf(row)] as const));
  const all = pointsTable(history.events(), now);
  const ranks = ranksOf(all);
  const lines = all.map((row, i) => ({ rank: ranks[i], ...row }));
  const ranked = lines.filter((line) => line.points > 0);
  const you = query.wallet === null ? null : (lines.find((line) => line.wallet === query.wallet) ?? null);
  return {
    as_of_slot: snap.asOfSlot,
    chain_time: snap.chain.unixTimestamp,
    complete: history.complete(),
    rule: "1 point per campaign entered on the side that won, once the result is final",
    both_sides_score: BOTH_SIDES_SCORE,
    total: ranked.length,
    offset: query.offset,
    limit: query.limit,
    rows: ranked.slice(query.offset, query.offset + query.limit),
    you,
  };
}
