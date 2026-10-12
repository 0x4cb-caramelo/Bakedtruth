/**
 * Purpose: the leaderboard's data in React (Sprint 13): every ranked wallet from the read API's /api/v1/leaderboard,
 *          read in pages of 100 up to 1,000 wallets, once when the page opens and again on "Try again". The request
 *          carries no wallet: the page finds the connected wallet's line itself (model.ts).
 * Version: 0.1.1 (the coordinator review: a wallet repeated across two page reads is kept once)
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { useCallback, useEffect, useState } from "react";

import { api, type PointsLine } from "@/lib/api-client";

export const PAGE = 100;
export const MAX_ROWS = 1_000;

export type BoardState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; rows: PointsLine[]; total: number; complete: boolean; asOfSlot: string };

async function readAll(): Promise<Extract<BoardState, { status: "ready" }>> {
  const first = await api.getLeaderboard({ limit: PAGE, offset: 0 });
  const rows = [...first.rows];
  for (let offset = rows.length; offset < Math.min(first.total, MAX_ROWS); offset += PAGE)
    rows.push(...(await api.getLeaderboard({ limit: PAGE, offset })).rows);
  // The pages are separate reads: the table can change between two, which can repeat a wallet (or skip one, which the
  // next read fixes). Each wallet is kept once, at its first place.
  const seen = new Set<string>();
  const unique = rows.filter((row) => !seen.has(row.wallet) && seen.add(row.wallet));
  return { status: "ready", rows: unique, total: first.total, complete: first.complete, asOfSlot: first.as_of_slot };
}

export function useLeaderboard() {
  const [state, setState] = useState<BoardState>({ status: "loading" });
  const [round, setRound] = useState(0);
  const retry = useCallback(() => {
    setState({ status: "loading" });
    setRound((n) => n + 1);
  }, []);
  useEffect(() => {
    let live = true;
    readAll().then(
      (ready) => live && setState(ready),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, [round]);
  return { state, retry };
}
