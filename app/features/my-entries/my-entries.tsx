/**
 * Purpose: "My entries" at /my-entries (Sprint 12; route name confirmed with L-01): the connected wallet's totals,
 *          received (from its settlement events only) and waiting for payout (final amounts not yet sent), its rows,
 *          how far back its history was read, with "Read older transactions", and what is missing when a read fails.
 *          Everything is read from the chain in the browser; the read API only lists which campaigns exist now.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { exactSol } from "@/features/campaign-page/copy-states";
import { MINE } from "./copy";
import { EntryRow } from "./entry-row";
import { useMyEntries } from "./use-my-entries";

function Total(props: { label: string; lamports: bigint; testId: string; note: string }) {
  return (
    <div className="pg-stat">
      <small>{props.label}</small>
      <b className="num" data-testid={props.testId}>
        {exactSol(props.lamports)} SOL
      </b>
      <span>{props.note}</span>
    </div>
  );
}

export function MyEntries() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const { state, reload, readOlder, readingOlder } = useMyEntries(wallet);

  const head = (
    <header>
      <p className="t-kicker">{MINE.kicker}</p>
      <h1 className="t-title">{MINE.title}</h1>
      <p className="pg-lead">{MINE.intro}</p>
    </header>
  );
  if (!wallet || state.status === "idle")
    return (
      <div className="space-y-4">
        {head}
        <EmptyState title={MINE.connect} />
      </div>
    );
  if (state.status === "loading") {
    return (
      <div className="space-y-4" aria-busy="true">
        {head}
        <p className="m-0 text-sm text-muted">{MINE.loading}</p>
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div className="space-y-4">
        {head}
        <EmptyState
          title={MINE.failed}
          action={
            <Button variant="secondary" onClick={reload}>
              {MINE.retry}
            </Button>
          }
        />
      </div>
    );
  }
  const { summary, history } = state;
  const read = history.seen.length + history.unread.length;
  return (
    <div className="pg">
      {head}
      {state.failed ? <p className="m-0 text-xs text-warn">{MINE.staleRead}</p> : null}
      <div
        className="pg-stats"
        data-perch="stats"
        data-perch-x="0.94"
        data-perch-size="0.8"
        data-perch-say="Counted to the lamport."
      >
        <Total
          label={MINE.received}
          lamports={summary.received}
          testId="received-total"
          note={MINE.receivedNote}
        />
        <Total label={MINE.waiting} lamports={summary.waiting} testId="waiting-total" note={MINE.waitingNote} />
      </div>
      {state.apiDown ? <p className="m-0 text-xs text-warn">{MINE.apiDown}</p> : null}
      {history.unread.length > 0 ? (
        <p className="m-0 text-xs text-warn">{MINE.unreadable(history.unread.length)}</p>
      ) : null}
      {summary.rows.length === 0 ? (
        <EmptyState title={MINE.empty}>
          <Link href="/" className="text-accent-soft hover:underline">
            {MINE.browse}
          </Link>
        </EmptyState>
      ) : (
        <ul className="pg-entries">
          {summary.rows.map((row) => (
            <EntryRow key={row.campaign} row={row} onChange={reload} />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>{history.before ? MINE.coverage(read) : MINE.complete(read)}</span>
        {history.before ? (
          <Button variant="secondary" small disabled={readingOlder} onClick={readOlder}>
            {readingOlder ? MINE.readingOlder : MINE.older}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
