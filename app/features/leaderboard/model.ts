/**
 * Purpose: the leaderboard's values, as pure functions (Sprint 13): a wallet's hit rate (its points over its campaigns
 *          with a final YES or NO), and the connected wallet's own line, found in the list the page read, so the read
 *          API is never told which wallet is looking (the privacy review).
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { PointsLine } from "@/lib/api-client";

/** Points over decided campaigns, as a whole percentage; `null` with nothing decided yet. */
export function hitRate(line: Pick<PointsLine, "points" | "decided">): number | null {
  return line.decided > 0 ? Math.round((line.points / line.decided) * 100) : null;
}

/** The connected wallet's line among the rows read, or null when it is not there (no points, or past what was read). */
export function lineOf(rows: readonly PointsLine[], wallet: string | null): PointsLine | null {
  return wallet ? (rows.find((row) => row.wallet === wallet) ?? null) : null;
}
