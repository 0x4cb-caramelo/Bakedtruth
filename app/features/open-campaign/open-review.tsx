/**
 * Purpose: "Check before you sign" for an opening (A-3; spec 3.12): every argument the transaction carries, from the
 *          choice the SDK prepared and its preparation (the id the guard saved, the kind and its template, the account,
 *          the feed and the direction, the target as the program stores it, the epoch, the deadline and when entries
 *          close, the payment and its 90/10 split at the price read, `max_lamports`, the rents, the network fee, the
 *          total), then the SDK's deterministic summary of the very bytes the wallet will sign, and the notices: the
 *          creator notice highlighted on every kind but price, with who else can move the number; the devnet line,
 *          where the prize goes, no taking it back, the no-entry rule, what devnet does not send by itself, that an
 *          opening is public, the age line. A team key's free opening drops what it does not have: a prize, a share.
 * Version: 0.2.0 (the Sprint 19 copy and legal reviews: the team variant, the notes on the prize and the fee)
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { bytesToHex, CAMPAIGN_TEMPLATE_VERSION, Direction, formatUtc, PROGRAM_ID, ReaderKind } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/brot";
import { CLUSTER, explorerAddress } from "@/lib/config";
import { KIND_NAME } from "../campaign-page/copy";
import { KIND_OF } from "../campaign-page/proof";
import { local } from "../campaign-page/format";
import { AGE_NOTICE } from "@/components/copy-site";
import { BOX, PREVIEW, SLOTS } from "./copy";
import {
  MONEY,
  NO_ENTRY_RULE,
  NO_TAKE_BACK,
  OPEN_DEVNET,
  OPEN_DEVNET_TEAM,
  PRIZE_FATE,
  RETURNS_DEVNET,
  RETURNS_DEVNET_TEAM,
} from "./copy-money";
import { SHEET } from "./copy-sheet";
import { creatorCanPush, templateOf } from "./kinds";
import type { KnownName } from "./names";
import { reviewFacts } from "./review-facts";
import { exactSol, usdText } from "./quote";
import type { ReadyOpening } from "./submit";

const Row = ({ label, children, note }: { label: string; children: ReactNode; note?: string }) => (
  <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-0.5 border-b border-line py-2 text-sm last:border-0 max-sm:grid-cols-1">
    <dt className="text-muted">{label}</dt>
    <dd className="break-words tabular-nums">
      {children}
      {note ? <small className="block text-xs text-muted">{note}</small> : null}
    </dd>
  </div>
);

export function OpenReview(p: {
  ready: ReadyOpening;
  choice: OpeningChoice;
  /** The account the signed instruction reads. */
  metric: string;
  names: readonly KnownName[];
  persists: boolean;
  refreshed: boolean;
  onBack: () => void;
  onSign: () => void;
}) {
  const { ready, choice } = p;
  // From the signed arguments only (H1): never the draft, which may have changed while this was prepared.
  const facts = reviewFacts({ choice, priceExponent: ready.check.priceExponent, metric: p.metric, names: p.names });
  const kind = KIND_OF[choice.kind as ReaderKind];
  const t = templateOf(kind);
  const pay = ready.check.payment;
  const free = ready.check.isTeam && choice.openingUsd === 0n;
  const close = ready.check.entriesCloseAt;
  const feedHex = typeof choice.feedId === "string" ? choice.feedId : bytesToHex(choice.feedId ?? new Uint8Array(32));
  return (
    <div className="space-y-4">
      {p.refreshed ? <p className="rounded-sm bg-notice-bg px-3 py-2 text-xs">{SHEET.refreshed}</p> : null}
      <p className="font-display text-xl font-bold" data-testid="review-sentence">
        {facts.sentence}
      </p>
      <dl>
        <Row label={SHEET.network}>
          {SHEET.onNetwork(CLUSTER)} · {SHEET.program}{" "}
          <a href={explorerAddress(PROGRAM_ID)} target="_blank" rel="noreferrer" className="font-mono underline">
            {shortAddress(PROGRAM_ID)}
          </a>
        </Row>
        <Row label={SHEET.id} note={p.persists ? SHEET.idNote : SHEET.idNotKept}>
          <span className="break-all font-mono">{ready.id.toString()}</span>
        </Row>
        <Row label={SHEET.kind} note={BOX.template(t.id, CAMPAIGN_TEMPLATE_VERSION)}>
          {KIND_NAME[kind]}
        </Row>
        <Row label={SHEET.account} note={facts.account.label}>
          <span className="break-all font-mono">{facts.account.address}</span>
        </Row>
        {kind === "price" ? (
          <>
            <Row label={SHEET.feed}>
              <span className="break-all font-mono">0x{feedHex}</span>
            </Row>
            <Row label={SHEET.direction}>{choice.direction === Direction.Below ? SLOTS.below : SLOTS.above}</Row>
          </>
        ) : null}
        <Row label={SHEET.target} note={SHEET.targetRaw(choice.target.toString())}>
          {facts.target}
        </Row>
        {t.epoch ? <Row label={SHEET.epoch}>{(choice.epoch ?? 0n).toString()}</Row> : null}
        <Row label={SHEET.deadline} note={local(choice.deadlineAt)}>
          {formatUtc(choice.deadlineAt)}
        </Row>
        <Row
          label={SHEET.closes}
          note={t.epoch ? `${local(close)}. ${SHEET.closesEpoch((choice.epoch ?? 0n).toString())}` : local(close)}
        >
          {formatUtc(close)}
        </Row>
        {free ? (
          <Row label={SHEET.openingFree} note={SHEET.freeNote}>
            {SHEET.free}
          </Row>
        ) : (
          <>
            <Row
              label={SHEET.opening(`US$${choice.openingUsd.toString()}`)}
              note={SHEET.openingNote(
                usdText(pay.price, pay.exponent),
                formatUtc(pay.publishTime),
                pay.price.toString(),
                pay.exponent,
              )}
            >
              <b>{exactSol(pay.paid)} SOL</b>
            </Row>
            <Row label={SHEET.prize} note={MONEY.prizeNote}>
              {exactSol(pay.prize)} SOL
            </Row>
            <Row label={SHEET.fee} note={MONEY.feeNote}>
              {exactSol(pay.fee)} SOL
            </Row>
            <Row label={SHEET.most} note={SHEET.mostNote}>
              {exactSol(ready.maxLamports)} SOL
            </Row>
          </>
        )}
        <Row label={SHEET.rent} note={SHEET.rentNote}>
          {exactSol(ready.debit.campaignRent + ready.debit.vaultRent)} SOL
        </Row>
        <Row label={SHEET.networkFee}>≈ {exactSol(ready.debit.networkFee)} SOL</Row>
        <Row label={SHEET.total} note={free ? undefined : MONEY.atMost(exactSol(ready.debit.maxTotal))}>
          <b>≈ {exactSol(ready.debit.total)} SOL</b>
        </Row>
      </dl>
      <div>
        <h3 className="mb-1.5 text-xs font-semibold text-muted">{SHEET.bytes}</h3>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-sm bg-bg p-2.5 font-mono text-[11px] leading-relaxed">
          {ready.summary.lines.join("\n")}
        </pre>
      </div>
      {creatorCanPush(kind) ? (
        <p className="flex gap-2 rounded-sm bg-st-review-bg p-3 text-xs text-st-review-fg" data-notice="creator">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {PREVIEW.creatorNotice}
            {kind !== "price" && !free ? ` ${PREVIEW.othersCanPush[kind]}` : null}
          </span>
        </p>
      ) : null}
      <ul className="list-disc space-y-1 pl-5 text-xs" data-testid="sheet-notices">
        {CLUSTER === "devnet" ? <li>{free ? OPEN_DEVNET_TEAM : OPEN_DEVNET}</li> : null}
        {free ? null : <li>{PRIZE_FATE}</li>}
        {free ? null : <li>{NO_TAKE_BACK}</li>}
        {free ? null : <li>{NO_ENTRY_RULE}</li>}
        {CLUSTER === "devnet" ? <li>{free ? RETURNS_DEVNET_TEAM : RETURNS_DEVNET}</li> : null}
        <li>{SHEET.public}</li>
        <li>{AGE_NOTICE}</li>
        <li className="font-semibold">{SHEET.walletDiffers}</li>
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={p.onBack}>
          {SHEET.back}
        </Button>
        <Button onClick={p.onSign}>{SHEET.sign}</Button>
      </div>
    </div>
  );
}
