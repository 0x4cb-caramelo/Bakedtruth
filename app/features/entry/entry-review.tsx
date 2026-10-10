/**
 * Purpose: the sheet "Check before you sign" (A-3): what the transaction carries, from the SDK's preparation of it —
 *          side, amount, the estimate net of the fee and the creator's share, `min_return_bps` (the floor the program
 *          enforces), `expected_entry_total` (the retry guard), the rents, the network fee, the total and the network —
 *          then the SDK's deterministic summary, read from the very bytes the wallet will sign, and the notices.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatSol, PROGRAM_ID, shortAddress } from "@/lib/brot";
import { CLUSTER, explorerAddress } from "@/lib/config";
import { sol4 } from "./amount";
import { SHEET } from "./copy";
import { EntryNotices } from "./entry-notices";
import { perOne } from "./estimate";
import type { EntryChoice, ReadyJoin } from "./submit";

export type ReviewFacts = {
  sentence: string;
  campaignId: string;
  feeBps: number;
  creatorShareBps: number;
  oneSidedFeeBps: number;
  fromLink: boolean;
  firstEntry: boolean;
  large: { mine: string; small: string } | null;
};

const Row = ({ label, children, note }: { label: string; children: ReactNode; note?: string }) => (
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
  const back = (choice.amount * ready.check.estimateBps) / 10_000n;
  return (
    <div className="space-y-4">
      {refreshed ? (
        <p className="m-0 rounded-sm bg-notice-bg px-3 py-2 text-xs">
          Prepared again: the network moved on while this was open. Check it again before you sign.
        </p>
      ) : null}
      <p className="m-0 text-sm">
        <b>{facts.sentence}</b>
        <small className="block text-xs text-muted">{SHEET.campaign(facts.campaignId)}</small>
      </p>
      <dl className="m-0">
        <Row label={SHEET.sideAmount} note={facts.fromLink ? "This amount came from the link you opened." : undefined}>
          <b>{S}</b> {formatSol(choice.amount)} SOL
        </Row>
        <Row label={SHEET.estimate}>
          {otherAfter === 0n
            ? SHEET.estimateOnesided(sol4(back), O)
            : SHEET.estimateValue(perOne(ready.check.estimateBps), sol4(back), S)}
        </Row>
        <Row label={SHEET.floor} note={SHEET.floorNote(ready.minReturnBps.toLocaleString("en-US"))}>
          {SHEET.floorValue(perOne(BigInt(ready.minReturnBps)))}
        </Row>
        <Row label="Your entry so far" note={SHEET.guard(formatSol(ready.expectedEntryTotal))}>
          {formatSol(ready.expectedEntryTotal)} SOL
        </Row>
        <Row label={SHEET.rents} note={SHEET.rentsNote}>
          {formatSol(ready.debit.rents)} SOL
        </Row>
        <Row label={SHEET.fee}>at most {formatSol(ready.debit.networkFee)} SOL</Row>
        <Row label={SHEET.total}>
          <b>{formatSol(ready.debit.total)} SOL</b>
        </Row>
        <Row label={SHEET.network}>
          Solana {CLUSTER} ·{" "}
          <a href={explorerAddress(PROGRAM_ID)} target="_blank" rel="noreferrer" className="font-mono underline">
            {shortAddress(PROGRAM_ID)}
          </a>
        </Row>
      </dl>
      <div>
        <h3 className="m-0 mb-1.5 text-xs font-semibold text-muted">{SHEET.bytes}</h3>
        <pre className="m-0 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-bg p-2.5 font-mono text-[11px] leading-relaxed">
          {ready.summary.lines.join("\n")}
        </pre>
      </div>
      <EntryNotices
        feeBps={facts.feeBps}
        creatorShareBps={facts.creatorShareBps}
        oneSidedFeeBps={facts.oneSidedFeeBps}
        large={facts.large}
        compact
      />
      <ul className="m-0 list-disc space-y-1 pl-5 text-xs text-muted">
        {facts.firstEntry ? <li>{SHEET.public}</li> : null}
        <li>{SHEET.walletDiffers}</li>
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onBack}>
          {SHEET.back}
        </Button>
        <Button onClick={onSign}>{SHEET.sign}</Button>
      </div>
    </div>
  );
}
