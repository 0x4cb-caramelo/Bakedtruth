/**
 * Purpose: the devnet leaderboard at /leaderboard (Sprint 13 DoD; spec 3.9 of Sprint -1,
 *          prototype-lab/campaigns/js/screens/ranking.js): wallets by points from /api/v1/leaderboard (1 per campaign
 *          entered on the side that won, once final), with the campaigns each entered, the connected wallet's own line
 *          as "You", when the chain was read, how points work, what the page keeps and sends, and how to leave the
 *          ranking. No column for the size of entries, what a wallet gained, or a success rate (the legal review).
 *          Loading, error and empty states; 50 rows at first, then "Show more".
 * Version: 0.2.0 (the Sprint 13 reviews: the success-rate column removed; the leave line; "still reading" for You)
 * Sprint:  13 (site: ranking, notices and copy)
 */
"use client";

import { Trophy } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { shortAddress } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import type { PointsLine } from "@/lib/api-client";
import { BOARD, LEAVE_URL } from "./copy";
import { lineOf } from "./model";
import { useLeaderboard } from "./use-leaderboard";

const FIRST = 50;

/** The prototype's podium: the first three ranks in the brand's colour. */
const top = (rank: number | null) => (rank !== null && rank <= 3 ? "text-crust-ink" : "text-muted");

function Row({ line, mine }: { line: PointsLine; mine: boolean }) {
  return (
    <tr
      className={mine ? "bg-notice-bg" : undefined}
      aria-current={mine ? "true" : undefined}
      data-wallet={line.wallet}
    >
      <td className={`border-t border-line py-3.5 pr-3 font-display text-2xl tabular-nums ${top(line.rank)}`}>
        {line.rank}
      </td>
      <td className="border-t border-line py-3.5 pr-3">
        <a href={explorerAddress(line.wallet)} target="_blank" rel="noopener noreferrer" title={line.wallet}>
          <code className="text-sm">{shortAddress(line.wallet)}</code>
        </a>
        {mine ? <span className="ml-2 rounded-sm border border-line px-1.5 text-xs">{BOARD.you}</span> : null}
      </td>
      <td className="border-t border-line py-3.5 pr-3 text-right font-display text-2xl tabular-nums">{line.points}</td>
      <td className="border-t border-line py-3.5 text-right text-muted tabular-nums">{line.entered}</td>
    </tr>
  );
}

/**
 * `read`: how many ranked wallets the page read; past it a wallet may still have points (`total` is larger).
 * `complete`: the API has read the whole history; until then a missing line says so instead of "no points".
 */
function You({
  mine,
  connected,
  read,
  total,
  complete,
}: {
  mine: PointsLine | null;
  connected: boolean;
  read: number;
  total: number;
  complete: boolean;
}) {
  if (!connected) return <p className="m-0 text-sm text-muted">{BOARD.connect}</p>;
  if (!mine) {
    const text = total > read ? BOARD.youBeyond(read) : complete ? BOARD.youNone : BOARD.youReading;
    return <p className="m-0 text-sm">{text}</p>;
  }
  return (
    <div data-testid="leaderboard-you">
      <p className="m-0 font-display text-2xl font-bold">{BOARD.youRank(mine.rank ?? 0, BOARD.points(mine.points))}</p>
      <p className="m-0 text-sm text-muted">{BOARD.youDetail(mine.points, mine.entered)}</p>
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
      <table className="w-full min-w-[360px] border-collapse text-sm">
        <thead className="text-left text-[11px] uppercase tracking-[0.04em] text-dim">
          <tr>
            <th className="pb-3 pr-3 font-semibold">{BOARD.columns.rank}</th>
            <th className="pb-3 pr-3 font-semibold">{BOARD.columns.wallet}</th>
            <th className="pb-3 pr-3 text-right font-semibold">{BOARD.columns.points}</th>
            <th className="pb-3 text-right font-semibold">{BOARD.columns.entered}</th>
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
      <header>
        <p className="t-kicker">{BOARD.kicker}</p>
        <h1 className="t-title">{BOARD.title}</h1>
        <p className="pg-lead">{BOARD.lead}</p>
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
            <You
              mine={state.status === "ready" ? lineOf(state.rows, wallet) : null}
              connected={wallet !== null}
              read={state.status === "ready" ? state.rows.length : 0}
              total={state.status === "ready" ? state.total : 0}
              complete={state.status === "ready" && state.complete}
            />
          </Card>
          <Card as="section" aria-labelledby="points-how" className="space-y-2 p-4">
            <h2 id="points-how" className="panel-head">
              <Trophy className="size-4" aria-hidden="true" />
              {BOARD.howTitle}
            </h2>
            <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm">
              {BOARD.how.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <p className="m-0 text-xs text-muted">{BOARD.public}</p>
            <p className="m-0 text-xs text-muted" data-testid="leaderboard-leave">
              {BOARD.leave}{" "}
              <a
                href={LEAVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-soft hover:underline"
              >
                {BOARD.leaveLink}
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
