/**
 * Purpose: one row of "My entries": the campaign's sentence (a link to its page), its state, the wallet's sides, what
 *          the entry returns or is owed, what it received (from the settlement events), and for the campaign's creator
 *          the 1% and any prize or opening fee returned, with "Receive" only for a reserved share. Amounts owed or
 *          received are exact to the lamport; estimates say so.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
"use client";

import Link from "next/link";

import { StateChip } from "@/components/ui/state-chip";
import { ClaimButton } from "@/features/claim/claim-button";
import { sol4 } from "@/features/entry/amount";
import { exactSol, OPENER, WAITING, YOURS } from "@/features/campaign-page/copy-states";
import type { YourPayout } from "@/features/campaign-page/states";
import { MINE } from "./copy";
import type { Row } from "./model";
import { totalOf } from "./received";

function payoutText(p: YourPayout): string | null {
  switch (p.kind) {
    case "none":
      return null;
    case "estimate":
      return [
        p.ifYes !== null && YOURS.ifWins("YES", sol4(p.ifYes)),
        p.ifNo !== null && YOURS.ifWins("NO", sol4(p.ifNo)),
      ]
        .filter(Boolean)
        .join(" · ");
    case "ifConfirmed":
      return YOURS.ifConfirmed(exactSol(p.amount));
    case "owed":
      return YOURS.owed(exactSol(p.amount));
    case "received":
      return YOURS.received(exactSol(p.amount));
    case "settledUnread":
      return YOURS.unread;
  }
}

export function EntryRow({ row, onChange }: { row: Row; onChange: () => void }) {
  const sides = [
    row.sides.yes > 0n && `YES ${exactSol(row.sides.yes)} SOL`,
    row.sides.no > 0n && `NO ${exactSol(row.sides.no)} SOL`,
  ]
    .filter(Boolean)
    .join(" and ");
  const payout = payoutText(row.payout);
  const fromOpening = row.received.asCreator + row.received.prize + row.received.openingFee;
  const share = row.opener?.share;
  return (
    <li
      className="space-y-2 rounded-md border border-line bg-panel p-4"
      data-campaign={row.campaign}
      data-payout={row.payout.kind}
    >
      <div className="flex flex-wrap items-center gap-2">
        {row.state === "closedAccount" ? (
          <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold">{MINE.closedAccount}</span>
        ) : (
          <StateChip state={row.state} />
        )}
        {row.isCreator ? <span className="text-xs text-muted">{MINE.created}</span> : null}
      </div>
      {row.id ? (
        <Link href={`/c/${row.id}`} className="block font-semibold hover:underline">
          {row.title}
        </Link>
      ) : (
        <p className="m-0 font-semibold">{row.title}</p>
      )}
      {sides ? <p className="m-0 text-sm">{MINE.youEntered(sides)}</p> : null}
      {payout ? <p className="m-0 text-sm tabular-nums">{payout}</p> : null}
      {row.state === "closedAccount" ? <p className="m-0 text-xs text-muted">{MINE.closedText}</p> : null}
      {share && share.status !== "none" ? (
        <p className="m-0 text-sm tabular-nums">
          {OPENER.share(exactSol(share.amount))} · {OPENER.status[share.status]}
        </p>
      ) : null}
      {share?.status === "reserved" ? (
        <div className="space-y-1 text-sm">
          <p className="m-0 text-muted">{OPENER.reserved}</p>
          <ClaimButton campaign={row.campaign} amount={share.amount} onDone={onChange} />
        </div>
      ) : null}
      {row.opener && row.opener.prizeBack > 0n ? (
        <p className="m-0 text-sm tabular-nums">
          {OPENER.prize(exactSol(row.opener.prizeBack))}
          {row.opener.openingFeeBack > 0n ? ` · ${OPENER.openingFee(exactSol(row.opener.openingFeeBack))}` : ""}
          {row.opener.prizeSent ? ` · ${OPENER.sent}` : ` · ${WAITING}`}
        </p>
      ) : null}
      {fromOpening > 0n && row.payout.kind !== "received" ? (
        <p className="m-0 text-sm font-semibold tabular-nums">{YOURS.received(exactSol(totalOf(row.received)))}</p>
      ) : null}
    </li>
  );
}
