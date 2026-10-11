/**
 * Purpose: the live estimate under the amount (BR-09), in a polite live region: what the entry returns if its side
 *          wins, net of Brot's fee and the creator's share, with the entry itself counted; the refund while the other
 *          side is empty, or too small to pay the fees (Sprint 13: the pot would not split); the program's refusal in the
 *          panel's words when the entry would be refused. The numbers are estimate.ts's: what finalize would pay if
 *          entries closed now.
 * Version: 0.2.1 (the UI overhaul: YES and NO in their colours; 0.2.0, Sprint 13: the too-small case)
 * Sprint:  11 (site: campaign page and entry); 13
 */
"use client";

import { sol4 } from "./amount";
import { PANEL } from "./copy";
import { failureCopy, type FailureContext } from "./copy-failures";
import { perOne, type EntryEstimate, type EntrySide } from "./estimate";
import { fromRefusal } from "./failures";
import { SidesTinted } from "./sides-tinted";

const other = (side: EntrySide) => (side === "yes" ? "NO" : "YES");

export function EstimateBlock({
  estimate,
  side,
  amount,
  oneSidedFeeBps,
  context,
}: {
  estimate: EntryEstimate | null;
  side: EntrySide;
  amount: bigint | null;
  oneSidedFeeBps: number;
  context: FailureContext;
}) {
  return (
    <div aria-live="polite" className="en-est text-[13px]" data-tone={side}>
      {body(estimate, side, amount, oneSidedFeeBps, context)}
    </div>
  );
}

function body(
  e: EntryEstimate | null,
  side: EntrySide,
  amount: bigint | null,
  oneSidedFeeBps: number,
  context: FailureContext,
) {
  if (!e || amount === null) return <p className="m-0 text-muted">{PANEL.enterAmount}</p>;
  if (!e.ok) {
    const copy = failureCopy(fromRefusal(e.refusal).key, context);
    return (
      <p className="m-0 text-warn">
        <b>{copy.title}.</b> {copy.text}
      </p>
    );
  }
  const S = side.toUpperCase();
  if (e.mode === "onesided") {
    return (
      <>
        <p className="m-0 font-semibold">
          <SidesTinted text={PANEL.onesided(other(side), sol4(e.returns))} />
        </p>
        <p className="m-0 mt-1 text-xs text-muted">{PANEL.onesidedSub(e.isFirst, other(side), oneSidedFeeBps)}</p>
      </>
    );
  }
  return (
    <>
      <p className="m-0 font-semibold tabular-nums">
        <SidesTinted text={PANEL.ifWins(S, sol4(e.returns), sol4(amount))} />
      </p>
      <p className="m-0 mt-1 text-xs text-muted tabular-nums">
        {PANEL.perOne(perOne(e.bps))}. <SidesTinted text={PANEL.ifLoses(other(side))} />
      </p>
      {e.mode === "toosmall" ? (
        <p className="m-0 mt-1 text-xs text-warn">{PANEL.tooSmall(other(side), oneSidedFeeBps)}</p>
      ) : null}
    </>
  );
}
