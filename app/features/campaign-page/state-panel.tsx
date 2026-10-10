/**
 * Purpose: what takes the entry panel's place once a campaign takes no entry (Sprint 12; BR-05, BR-10, BR-11, BR-25,
 *          BR-45): closed and why; in review with the result, the value read, the target, the account read and the
 *          six-hour clock; contested with the payout paused and the new deadline (L-04); paid, with the split, the
 *          one-sided refund rule or the empty pot; voided with the public reason, the team's note when the void log has
 *          one, and what returns to whoever opened. Every state after the result says where to report a wrong one
 *          (L-13). The words are copy-states.ts; the values are states.ts, from the chain's time (A-7).
 * Version: 0.2.0 (Sprint 12: every public state; 0.1.0 was Sprint 11's state card)
 * Sprint:  12 (site: my entries and campaign states)
 */
"use client";

import { useEffect, useState } from "react";

import { SettleMode } from "@/lib/brot";
import { explorerAddress } from "@/lib/config";
import { PANEL } from "@/features/entry/copy";
import { clockText, REPORT, STATES, VOID_REASON } from "./copy-states";
import { utc, valueText } from "./format";
import type { PageData } from "./load";
import type { Proof } from "./proof";
import { pageStateOf, type StateView } from "./states";
import type { VoidNote } from "./void-note";

/** The review clock: the seconds left at the chain time read, counted down on screen between reads. */
function useCountdown(atRead: bigint): bigint {
  const [left, setLeft] = useState(atRead);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const passed = BigInt(Math.floor((Date.now() - started) / 1000));
      setLeft(atRead > passed ? atRead - passed : 0n);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [atRead]);
  return left;
}

function ReviewClock({ state }: { state: Extract<StateView, { kind: "review" }> }) {
  const left = useCountdown(state.secondsLeft);
  return (
    <p className="m-0 flex flex-wrap items-baseline justify-between gap-2 text-sm">
      <span className="text-muted">{STATES.endsAt(utc(state.reviewEndsAt))}</span>
      <b className="font-display text-2xl tabular-nums" role="timer" aria-live="off">
        {left > 0n ? STATES.left(clockText(left)) : STATES.ended}
      </b>
    </p>
  );
}

function Report() {
  return (
    <p className="m-0 border-t border-line pt-3 text-xs text-muted">
      {REPORT.text}{" "}
      <a href={REPORT.url} target="_blank" rel="noopener noreferrer" className="text-accent-soft hover:underline">
        {REPORT.link}
      </a>
    </p>
  );
}

const Line = ({ children }: { children: React.ReactNode }) => <p className="m-0 text-sm text-muted">{children}</p>;

function Body({ data, proof, state, note }: { data: PageData; proof: Proof; state: StateView; note: VoidNote | null }) {
  const c = data.campaign;
  const paidOpening = c.prizeLamports > 0n;
  switch (state.kind) {
    case "open":
      return null;
    case "closed":
      return (
        <>
          <Line>
            {state.because === "outcomeKnowable"
              ? STATES.closedKnowable
              : state.because === "epochStarted"
                ? STATES.closedEpoch
                : STATES.closedOnTime(utc(c.entriesCloseAt))}
          </Line>
          <Line>{STATES.closedNext(utc(c.deadlineAt))}</Line>
        </>
      );
    case "review":
      return (
        <>
          <p className="m-0 font-semibold">
            {state.result === "VOID" ? STATES.voidRead : STATES.resultRead(state.result)}
          </p>
          {state.result === "VOID" ? <Line>{VOID_REASON[state.reason]}</Line> : null}
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted">{STATES.valueRead}</dt>
            <dd className="m-0 tabular-nums">{valueText(proof.kind, state.observed, c.priceExponent)}</dd>
            <dt className="text-muted">{STATES.target}</dt>
            <dd className="m-0 tabular-nums">
              {proof.comparator} {valueText(proof.kind, c.target, c.priceExponent)}
            </dd>
            <dt className="text-muted">{STATES.accountRead}</dt>
            <dd className="m-0 truncate">
              <a
                href={explorerAddress(c.metricAccount)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-soft hover:underline"
              >
                {c.metricAccount}
              </a>
            </dd>
          </dl>
          {state.metLate ? <Line>{STATES.metLate}</Line> : null}
          <ReviewClock state={state} />
          <Line>{STATES.reviewRule}</Line>
        </>
      );
    case "contested":
      return (
        <>
          <p className="m-0 font-semibold">{STATES.contestedText}</p>
          <Line>{STATES.contestEnds(utc(state.contestEndsAt))}</Line>
        </>
      );
    case "paid":
      return (
        <>
          {state.empty ? (
            <Line>
              {STATES.empty} {paidOpening ? STATES.emptyPaid : null}
            </Line>
          ) : state.mode === SettleMode.OneSided ? (
            <>
              <Line>{STATES.oneSided}</Line>
              {paidOpening ? <Line>{STATES.prizeBack}</Line> : null}
            </>
          ) : (
            <Line>{STATES.split(state.result)}</Line>
          )}
          {state.empty ? null : <Line>{state.allPaid ? STATES.allPaid : STATES.waiting}</Line>}
        </>
      );
    case "void":
      return (
        <>
          <p className="m-0 font-semibold">{VOID_REASON[state.reason]}</p>
          {note ? (
            <blockquote className="m-0 border-l-2 border-line pl-3 text-sm">
              <b className="block text-xs text-muted">{STATES.teamNote}</b>
              <span className="whitespace-pre-line">{note.text}</span>
            </blockquote>
          ) : null}
          {state.empty ? <Line>{STATES.empty}</Line> : <Line>{STATES.refunded}</Line>}
          {paidOpening ? <Line>{STATES.prizeBack}</Line> : null}
          {paidOpening ? (
            <Line>{state.empty ? STATES.feeKeptEmpty : state.house ? STATES.feeRefunded : STATES.feeKept}</Line>
          ) : null}
          {state.empty ? null : <Line>{state.allPaid ? STATES.allPaid : STATES.waiting}</Line>}
        </>
      );
  }
}

const TITLE: Record<StateView["kind"], (s: StateView) => string> = {
  open: () => PANEL.title,
  closed: () => STATES.closed,
  review: () => STATES.review,
  contested: () => STATES.contested,
  paid: (s) => STATES.paid((s as Extract<StateView, { kind: "paid" }>).result),
  void: () => STATES.void,
};

export function StatePanel(props: { data: PageData; proof: Proof; entriesTaken: boolean; note: VoidNote | null }) {
  const state = pageStateOf(props.data.campaign, props.data.view, props.data.chain);
  const resolved = state.kind !== "open" && state.kind !== "closed";
  return (
    <section
      aria-labelledby="state-title"
      className="space-y-3 rounded-md border border-line bg-panel p-4"
      data-state={state.kind}
    >
      <h2 id="state-title" className="m-0 font-display text-2xl font-bold">
        {TITLE[state.kind](state)}
      </h2>
      {state.kind === "open" && !props.entriesTaken ? <Line>{PANEL.notTaken}</Line> : null}
      <Body data={props.data} proof={props.proof} state={state} note={props.note} />
      {resolved ? <Report /> : null}
    </section>
  );
}
