/**
 * Purpose: the connected wallet's own lines on the campaign page (Sprint 12): "Your entry" with its sides and what it
 *          returns, as an estimate while the pot or the result can move, "Waiting for payout" with the exact amount
 *          once final, or "Received" from its `EntrySettled` event once the program closed the Entry; and, for the
 *          wallet that opened the campaign, its creator share (with "Receive" only when the share is reserved below
 *          the rent minimum, the one claim on the site) and the prize returned. Amounts are the SDK's mirror of the
 *          program; nothing here computes money.
 * Version: 0.2.0 (Sprint 12; 0.1.0 was Sprint 11's "Your entry" in pot-panel.tsx)
 * Sprint:  12 (site: my entries and campaign states)
 */
"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";

import { rentExemptMinimum, tx } from "@/lib/brot";
import { rpc } from "@/lib/rpc";
import { ClaimButton } from "@/features/claim/claim-button";
import { sol4 } from "@/features/entry/amount";
import { readEntrySettlement } from "@/features/my-entries/history";
import { exactSol, OPENER, WAITING, YOURS } from "./copy-states";
import type { PageData } from "./load";
import { openerViewOf, pageStateOf, yourPayoutOf, type StateView, type YourPayout } from "./states";

/** The wallet's `EntrySettled` amount once the Entry is gone, and whether its Entry address has any history. */
function useSettlement(data: PageData, wallet: string | null, state: StateView, round: number) {
  const [found, setFound] = useState<{ amount: bigint | null; touched: boolean }>({ amount: null, touched: false });
  const look = wallet !== null && data.mine === null && (state.kind === "paid" || state.kind === "void");
  useEffect(() => {
    if (!look || !wallet) return;
    let live = true;
    readEntrySettlement(rpc, data.address, wallet)
      .then((r) => live && setFound({ amount: r.event?.data.amount ?? null, touched: r.touched }))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [look, wallet, data.address, round]);
  return look ? found : { amount: null, touched: false };
}

function PayoutLine({ payout }: { payout: YourPayout }) {
  switch (payout.kind) {
    case "none":
      return null;
    case "estimate":
      return (
        <>
          {payout.ifYes !== null ? <p className="m-0 tabular-nums">{YOURS.ifWins("YES", sol4(payout.ifYes))}</p> : null}
          {payout.ifNo !== null ? <p className="m-0 tabular-nums">{YOURS.ifWins("NO", sol4(payout.ifNo))}</p> : null}
          <p className="m-0 text-xs text-muted">{YOURS.estimateNote}</p>
        </>
      );
    case "ifConfirmed":
      return (
        <p className="m-0 tabular-nums">
          {(payout.estimate ? YOURS.ifConfirmedEst : YOURS.ifConfirmed)(exactSol(payout.amount))}
        </p>
      );
    case "owed":
      return (
        <>
          <p className="m-0 font-semibold tabular-nums">{YOURS.owed(exactSol(payout.amount))}</p>
          {payout.amount === 0n ? <p className="m-0 text-xs text-muted">{YOURS.lost}</p> : null}
          <p className="m-0 text-xs text-muted">{YOURS.deposit}</p>
        </>
      );
    case "received":
      return (
        <>
          <p className="m-0 font-semibold tabular-nums text-yes-fg">{YOURS.received(exactSol(payout.amount))}</p>
          {payout.amount === 0n ? <p className="m-0 text-xs text-muted">{YOURS.lost}</p> : null}
        </>
      );
    case "settledUnread":
      return <p className="m-0 text-sm text-muted">{YOURS.unread}</p>;
  }
}

function useClaimFloor(needed: boolean): bigint | null {
  const [floor, setFloor] = useState<bigint | null>(null);
  useEffect(() => {
    if (!needed) return;
    let live = true;
    // The wallet pays one signature's fee (5,000 lamports, no priority fee) and must stay at the minimum after it.
    rentExemptMinimum(rpc, 0)
      .then((rent) => live && setFloor(tx.claimFloor(rent, 5_000n)))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [needed]);
  return floor;
}

function OpenerLines({ data, onChange }: { data: PageData; onChange: () => void }) {
  const view = openerViewOf(data.campaign);
  const reserved = view?.share.status === "reserved";
  const floor = useClaimFloor(reserved);
  if (!view) return null;
  const { share } = view;
  return (
    <div className="space-y-2 border-t border-line pt-3 text-sm">
      <b className="block text-xs text-muted">{OPENER.title}</b>
      {share.status !== "none" ? (
        <p className="m-0 tabular-nums">
          {OPENER.share(exactSol(share.amount))} · {OPENER.status[share.status]}
        </p>
      ) : null}
      {share.status === "reserved" ? (
        <>
          <p className="m-0 text-muted">{OPENER.reserved}</p>
          {floor !== null ? <p className="m-0 text-muted">{OPENER.reservedHow(exactSol(floor))}</p> : null}
          <ClaimButton campaign={data.address} amount={share.amount} onDone={onChange} />
        </>
      ) : null}
      {view.prizeBack > 0n ? (
        <p className="m-0 tabular-nums">
          {OPENER.prize(exactSol(view.prizeBack))}
          {view.openingFeeBack > 0n ? ` · ${OPENER.openingFee(exactSol(view.openingFeeBack))}` : ""}
          {view.prizeSent ? ` · ${OPENER.sent}` : ` · ${WAITING}`}
        </p>
      ) : null}
    </div>
  );
}

export function PayoutPanel(props: { data: PageData; wallet: string | null; round: number; onChange: () => void }) {
  const { data, wallet } = props;
  const state = pageStateOf(data.campaign, data.view, data.chain);
  const settled = useSettlement(data, wallet, state, props.round);
  const mine = data.mine && data.mine.amountYes + data.mine.amountNo > 0n ? data.mine : null;
  const payout = yourPayoutOf({
    campaign: data.campaign,
    state,
    mine,
    settled: settled.amount,
    entered: settled.touched,
  });
  const isCreator = wallet !== null && wallet === data.campaign.creator;
  if (payout.kind === "none" && !isCreator) return null;
  const sides = mine
    ? [
        mine.amountYes > 0n && `YES ${exactSol(mine.amountYes)} SOL`,
        mine.amountNo > 0n && `NO ${exactSol(mine.amountNo)} SOL`,
      ]
        .filter(Boolean)
        .join(" and ")
    : "";
  return (
    <section
      aria-labelledby="mine-title"
      className="space-y-2 rounded-md border border-line bg-panel p-4"
      data-payout={payout.kind}
    >
      <h2 id="mine-title" className="m-0 flex items-center gap-2 font-display text-2xl font-bold">
        <Receipt className="size-5" aria-hidden="true" />
        {YOURS.title}
      </h2>
      {sides ? <p className="m-0 text-sm">{YOURS.sides(sides)}</p> : null}
      <div className="space-y-1 text-sm">
        <PayoutLine payout={payout} />
      </div>
      {isCreator ? <OpenerLines data={data} onChange={props.onChange} /> : null}
    </section>
  );
}
