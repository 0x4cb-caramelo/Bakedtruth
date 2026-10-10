/**
 * Purpose: the leaderboard's values, as pure functions (Sprint 13): the connected wallet's own line, found in the list
 *          the page read, so the read API is never told which wallet is looking (the privacy review). No success rate
 *          (the legal review: a per-wallet rate is a profile, and a wallet on both sides would show 100%).
 * Version: 0.2.0 (the Sprint 13 reviews: the hit rate removed)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import type { PointsLine } from "@/lib/api-client";

/** The connected wallet's line among the rows read, or null when it is not there (no points, or past what was read). */
export function lineOf(rows: readonly PointsLine[], wallet: string | null): PointsLine | null {
  return wallet ? (rows.find((row) => row.wallet === wallet) ?? null) : null;
}
