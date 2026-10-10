/**
 * Purpose: the devnet leaderboard at /leaderboard (Sprint 13 DoD; spec 3.9 of Sprint -1,
 *          prototype-lab/campaigns/js/screens/ranking.js): wallets by points from /api/v1/leaderboard (1 per campaign
 *          entered on the side that won, once final), with each wallet's hit rate and campaigns entered, the
 *          connected wallet's own line as "You", when the chain was read, and how points work. No column for the size
 *          of entries or what a wallet gained. Loading, error and empty states; 50 rows at first, then "Show more".
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import type { PointsLine } from "@/lib/api-client";
import { BOARD } from "./copy";
import { hitRate, lineOf } from "./model";
import { useLeaderboard } from "./use-leaderboard";

const FIRST = 50;
const rate = (line: PointsLine) => {
  const r = hitRate(line);
  return r === null ? BOARD.hitRateNone : `${r}%`;
};

function Row({ line, mine }: { line: PointsLine; mine: boolean }) {
  return (
    <tr
      className={mine ? "bg-notice-bg" : undefined}
      aria-current={mine ? "true" : undefined}
      data-wallet={line.wallet}
    >
      <td className="py-2 pr-3 font-display text-xl tabular-nums">{line.rank}</td>
      <td className="py-2 pr-3">
        <a href={explorerAddress(line.wallet)} target="_blank" rel="noopener noreferrer" title={line.wallet}>
          <code className="text-sm">{shortAddress(line.wallet)}</code>
        </a>
        {mine ? <span className="ml-2 rounded-sm border border-line px-1.5 text-xs">{BOARD.you}</span> : null}
      </td>
      <td className="py-2 pr-3 text-right font-bold tabular-nums">{line.points}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{rate(line)}</td>
      <td className="py-2 text-right tabular-nums">{line.entered}</td>
    </tr>
  );
}

function You({ mine, connected }: { mine: PointsLine | null; connected: boolean }) {
  if (!connected) return <p className="m-0 text-sm text-muted">{BOARD.connect}</p>;
  if (!mine) return <p className="m-0 text-sm">{BOARD.youNone}</p>;
  return (
    <div data-testid="leaderboard-you">
      <p className="m-0 font-display text-2xl font-bold">{BOARD.youRank(mine.rank ?? 0, BOARD.points(mine.points))}</p>
      <p className="m-0 text-sm text-muted">{BOARD.youDetail(mine.points, mine.decided, mine.entered)}</p>
    </div>
  );
}

function Board({ rows, total, wallet }: { rows: PointsLine[]; total: number; wallet: string | null }) {
  const [shown, setShown] = useState(FIRST);
  const visible = rows.slice(0, shown);
  return (
    <Card
      as="section"
      aria-label={BOARD.title}
      className="overflow-x-auto p-4"
      data-perch="leaderboard"
      data-perch-x="0.9"
    >
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead className="text-left text-xs text-muted">
          <tr>
            <th className="pb-2 pr-3 font-semibold">{BOARD.columns.rank}</th>
            <th className="pb-2 pr-3 font-semibold">{BOARD.columns.wallet}</th>
            <th className="pb-2 pr-3 text-right font-semibold">{BOARD.columns.points}</th>
            <th className="pb-2 pr-3 text-right font-semibold">{BOARD.columns.hitRate}</th>
            <th className="pb-2 text-right font-semibold">{BOARD.columns.entered}</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((line) => (
            <Row key={line.wallet} line={line} mine={line.wallet === wallet} />
          ))}
        </tbody>
      </table>
      <p className="m-0 mt-3 text-xs text-muted">{BOARD.foot(visible.length, total)}</p>
      {shown < rows.length ? (
        <Button variant="secondary" className="mt-3" onClick={() => setShown((n) => n + FIRST)}>
          {BOARD.more}
        </Button>
      ) : null}
    </Card>
  );
}

export function LeaderboardPage() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { state, retry } = useLeaderboard();
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="m-0 text-xs uppercase tracking-wide text-muted">{BOARD.kicker}</p>
        <h1 className="m-0 font-display text-4xl font-bold">{BOARD.title}</h1>
        <p className="m-0 max-w-3xl text-sm text-muted">{BOARD.lead}</p>
        {state.status === "ready" ? <p className="m-0 text-xs text-muted">{BOARD.readAt(state.asOfSlot)}</p> : null}
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-3">
          {state.status === "loading" ? (
            <div aria-busy="true" className="space-y-2">
              <p className="sr-only" role="status">
                {BOARD.loading}
              </p>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : state.status === "error" ? (
            <Card className="space-y-2 p-4" role="alert">
              <p className="m-0 font-bold">{BOARD.error}</p>
              <p className="m-0 text-sm text-muted">{BOARD.errorNote}</p>
              <Button variant="secondary" onClick={retry}>
                {BOARD.retry}
              </Button>
            </Card>
          ) : state.rows.length === 0 ? (
            <EmptyState title={BOARD.empty} />
          ) : (
            <Board rows={state.rows} total={state.total} wallet={wallet} />
          )}
          {state.status === "ready" && !state.complete ? (
            <p className="m-0 text-xs text-warn">{BOARD.partial}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          <Card as="section" className="space-y-1 p-4" aria-label={BOARD.you}>
            <small className="block text-xs font-semibold text-muted">{BOARD.you}</small>
            <You mine={state.status === "ready" ? lineOf(state.rows, wallet) : null} connected={wallet !== null} />
          </Card>
          <Card as="section" aria-labelledby="points-how" className="space-y-2 p-4">
            <h2 id="points-how" className="m-0 font-display text-2xl font-bold">
              {BOARD.howTitle}
            </h2>
            <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm">
              {BOARD.how.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <p className="m-0 text-xs text-muted">{BOARD.public}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
