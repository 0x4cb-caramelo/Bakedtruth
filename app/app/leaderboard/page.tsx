/**
 * Purpose: the devnet leaderboard at /leaderboard (Sprint 13; BR-29): wallets by points from the read API's
 *          /api/v1/leaderboard, read in the browser. The route existed as a shell since Sprint 09.
 * Version: 0.2.0
 * Sprint:  09 (site shell, theme and wallet); 13 (content)
 */
import type { Metadata } from "next";

import { LeaderboardPage } from "@/features/leaderboard/leaderboard";

export const metadata: Metadata = { title: "Leaderboard · Brot Markets" };

export default function Page() {
  return (
    <section className="py-2">
      <LeaderboardPage />
    </section>
  );
}
