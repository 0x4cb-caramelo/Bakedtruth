/**
 * Purpose: the sheet "Check before you sign" (A-3), what the transaction carries, from the SDK's preparation of it. In
 *          view, what a person decides on (Ronaldo, 2026-10-11: less to read): the side and the amount, what comes back
 *          if that side wins (net of the fee and the creator's share; since Sprint 13 what finalize would pay if entries
 *          closed now, `shownReturnBps`, with a line when the other side is too small to pay the fees), what leaves the
 *          wallet in all, the lock, a large entry's warning, a first entry's public notice and the advice to reject a
 *          wallet that shows something else. Folded: the notes before an entry, and under "Transaction details" the
 *          program's guards (`min_return_bps`, the floor it enforces; `expected_entry_total`, the retry guard), the
 *          rents, the fee, the network and the SDK's deterministic summary, read from the very bytes the wallet signs.
 * Version: 0.3.0 (the essentials in view, the rest folded; 0.2.0, Sprint 13: the shown return)
 * Sprint:  11 (site: campaign page and entry); 13
 */
"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatSol, PROGRAM_ID, shortAddress, shownReturnBps, splitsIfWins, type JoinedPot } from "@/lib/brot";
import { CLUSTER, explorerAddress } from "@/lib/config";
import { exactSol } from "@/features/campaign-page/copy-states";
import { sol4 } from "./amount";
import { NOTICES, PANEL, SHEET } from "./copy";
import { EntryNotices } from "./entry-notices";
import { perOne } from "./estimate";
import { SidesTinted } from "./sides-tinted";
import type { EntryChoice, ReadyJoin } from "./submit";

export type ReviewFacts = {
  sentence: string;
  campaignId: string;
  feeBps: number;
  creatorShareBps: number;
  oneSidedFeeBps: number;
  /** The campaign's prize, for the estimate of what finalize would pay. */
  prizeLamports: bigint;
  fromLink: boolean;
  firstEntry: boolean;
  /** This browser keeps the retry guard's record across a reload (localStorage works). */
  persists: boolean;
  large: { mine: string; small: string } | null;
};

const Row = ({ label, children, note }: { label: ReactNode; children: ReactNode; note?: string }) => (
  <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-0.5 border-b border-line py-2 text-sm last:border-0 max-sm:grid-cols-1">
    <dt className="text-muted">{label}</dt>
    <dd className="m-0 tabular-nums">
      {children}
      {note ? <small className="block text-xs text-muted">{note}</small> : null}
    </dd>
  </div>
);

export function EntryReview({
  ready,
  choice,
  facts,
  refreshed,
  onBack,
  onSign,
}: {
  ready: ReadyJoin;
  choice: EntryChoice;
  facts: ReviewFacts;
  refreshed: boolean;
  onBack: () => void;
  onSign: () => void;
}) {
  const S = choice.side.toUpperCase();
  const O = choice.side === "yes" ? "NO" : "YES";
  const added = ready.simulation.events.find((e) => e.name === "EntryAdded");
  const otherAfter =
    added?.name === "EntryAdded" ? (choice.side === "yes" ? added.data.poolNo : added.data.poolYes) : 1n;
  const sideAfter =
    added?.name === "EntryAdded" ? (choice.side === "yes" ? added.data.poolYes : added.data.poolNo) : null;
  const pot: JoinedPot | null =
    sideAfter === null
      ? null
      : {
          amount: choice.amount,
          sideAfter,
          other: otherAfter,
          prize: facts.prizeLamports,
          feeBps: facts.feeBps,
          oneSidedFeeBps: facts.oneSidedFeeBps,
          creatorShareBps: facts.creatorShareBps,
          isFirst: ready.check.isFirst,
        };
  const tooSmall = pot !== null && otherAfter > 0n && !splitsIfWins(pot);
  const shown = pot && tooSmall ? shownReturnBps(pot) : ready.check.estimateBps;
  const back = (choice.amount * shown) / 10_000n;
  const before = ready.expectedEntryTotal;
  const youEnterNote = [before > 0n ? SHEET.addsTo(exactSol(before)) : "", facts.fromLink ? PANEL.fromLink : ""];
  return (
    <div className="space-y-4">
      {refreshed ? <p className="m-0 rounded-sm bg-notice-bg px-3 py-2 text-xs">{SHEET.refreshed}</p> : null}
      <p className="m-0 text-sm">
        <b>{facts.sentence}</b>
        <small className="block text-xs text-muted">{SHEET.campaign(facts.campaignId)}</small>
      </p>
      <dl className="m-0">
        <Row label={SHEET.youEnter} note={youEnterNote.filter(Boolean).join(" ") || undefined}>
          <b>
            <SidesTinted text={S} />
          </b>{" "}
          · {exactSol(choice.amount)} SOL
        </Row>
        <Row
          label={<SidesTinted text={otherAfter === 0n ? SHEET.ifEmpty(O) : SHEET.ifWins(S)} />}
          note={tooSmall ? SHEET.tooSmall(O) : undefined}
        >
          {otherAfter === 0n ? SHEET.backOnly(sol4(back)) : SHEET.backPerOne(sol4(back), perOne(shown))}
        </Row>
        <Row
          label={SHEET.youPay}
          note={SHEET.payNote(exactSol(choice.amount), exactSol(ready.debit.rents), exactSol(ready.debit.networkFee))}
        >
          <b>{exactSol(ready.debit.total)} SOL</b>
        </Row>
      </dl>
      {/* A large entry's own warning stays in view; the general notes fold, the lock does not. */}
      {facts.large ? (
        <p className="m-0 text-xs text-warn">
          {NOTICES.largeEntry} {NOTICES.largeEntryNumbers(facts.large.small, facts.large.mine)}
        </p>
      ) : null}
      <EntryNotices
        feeBps={facts.feeBps}
        creatorShareBps={facts.creatorShareBps}
        oneSidedFeeBps={facts.oneSidedFeeBps}
        large={null}
        compact
        folded
      />
      <details className="fold">
        <summary>
          {SHEET.details}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </summary>
        <dl className="m-0">
          <Row label={SHEET.soFar} note={SHEET.guard(formatSol(before))}>
            {exactSol(before)} SOL
          </Row>
          <Row label={SHEET.floor} note={SHEET.floorNote(ready.minReturnBps.toLocaleString("en-US"))}>
            {SHEET.floorValue(perOne(BigInt(ready.minReturnBps)))}
          </Row>
          <Row label={SHEET.rents} note={SHEET.rentsNote}>
            {formatSol(ready.debit.rents)} SOL
          </Row>
          <Row label={SHEET.fee}>{SHEET.feeValue(formatSol(ready.debit.networkFee))}</Row>
          <Row label={SHEET.network}>
            Solana {CLUSTER} ·{" "}
            <a href={explorerAddress(PROGRAM_ID)} target="_blank" rel="noreferrer" className="font-mono underline">
              {shortAddress(PROGRAM_ID)}
            </a>
          </Row>
        </dl>
        <h3 className="m-0 mb-1.5 mt-2 text-xs font-semibold text-muted">{SHEET.bytes}</h3>
        <pre className="m-0 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-bg p-2.5 font-mono text-[11px] leading-relaxed">
          {ready.summary.lines.join("\n")}
        </pre>
      </details>
      {/* The fine print, together above the buttons; the two folds stay side by side above it. */}
      {facts.firstEntry ? <p className="m-0 text-xs text-muted">{SHEET.public}</p> : null}
      {facts.persists ? null : <p className="m-0 text-xs text-warn">{SHEET.notKept}</p>}
      <p className="m-0 text-xs text-muted">{SHEET.walletDiffers}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          {SHEET.back}
        </Button>
        <Button onClick={onSign}>{SHEET.sign}</Button>
      </div>
    </div>
  );
}
