/**
 * Purpose: `GET /api/v1/leaderboard` (TP §6; Sprint 13, BR-29): devnet points from the program's events (history.ts)
 *          and the live campaign accounts (the snapshot), through the SDK's rule (`pointsTable`): 1 point per campaign
 *          entered on the side that won, once the result is final. Only wallets with points are ranked, in pages, each
 *          with its points and the campaigns it entered; no amount, no success rate (the privacy review). Wallets
 *          whose owner asked to be left out (hidden.ts) are dropped before ranking. The route takes no wallet: a
 *          visitor's page finds its own line in the list, so a request to Brot never carries a wallet (TP §8.2).
 * Version: 0.2.0 (the Sprint 13 reviews: the hide list, no success rate, a YES price result final only once settling,
 *          and the table computed once per change instead of per request)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { Outcome, pointsTable, ranksOf, ReaderKind, BOTH_SIDES_SCORE, type CampaignNow } from "@brot/sdk/read";

import type { Hidden } from "./hidden";
import type { History } from "./history";
import { BadQuery, integer } from "./query";
import type { Row, Snapshot } from "./snapshot";

const KNOWN = new Set(["limit", "offset"]);

export type LeaderboardQuery = { limit: number; offset: number };
export type Line = { rank: number | null; wallet: string; points: number; entered: number };

export function parseLeaderboardQuery(url: URL): LeaderboardQuery {
  for (const key of url.searchParams.keys()) if (!KNOWN.has(key)) throw new BadQuery(`unknown parameter: ${key}`);
  return {
    limit: integer(url, "limit", 50, 1, 100),
    offset: integer(url, "offset", 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

/**
 * A live account's result is final once no key can change it and nothing is left to count: settling or settled, or
 * its window ended without a contest. A YES on a price campaign waits for settling: its late joins (at or after the
 * YES proof) are known only once every baker is tallied, which finalize requires, and on devnet nobody tallies until
 * someone settles.
 */
export function nowOf(row: Row): CampaignNow {
  const v = row.view;
  const outcome = row.campaign.outcome as Outcome;
  const lateJoinsPossible = row.campaign.kind === ReaderKind.PriceTouch && outcome === Outcome.Yes;
  const windowFinal = v.state === "InReview" && v.windowEnded && !v.contested && !lateJoinsPossible;
  return { outcome, final: v.state === "Paid" || v.state === "Void" || windowFinal };
}

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
    rule: "1 point per campaign entered on the side that won, once the result is final",
    both_sides_score: BOTH_SIDES_SCORE,
    total: lines.length,
    offset: query.offset,
    limit: query.limit,
    rows: lines.slice(query.offset, query.offset + query.limit),
  };
}
