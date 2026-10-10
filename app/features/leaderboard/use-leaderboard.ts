/**
 * Purpose: the leaderboard's data in React (Sprint 13): every ranked wallet from the read API's /api/v1/leaderboard,
 *          read in pages of 100 up to 1,000 wallets, once when the page opens and again on "Try again". The request
 *          carries no wallet: the page finds the connected wallet's line itself (model.ts).
 * Version: 0.1.0
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
  return { status: "ready", rows, total: first.total, complete: first.complete, asOfSlot: first.as_of_slot };
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
