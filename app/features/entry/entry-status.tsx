/**
 * Purpose: the sheet after "Sign in wallet": the signing steps (the wallet, then confirming by polling, or checking a
 *          transaction the wallet never answered for, with the blocks left before it expires), the receipt, and each
 *          failure with what happened, what it cost, the program's own message from the SDK's error map, and its way
 *          out (review again, change the amount, the devnet faucet, or close).
 * Version: 0.2.0 (Sprint 11 review: "Check again" for a stopped watch; the entry's sides when no signature came back)
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { CLUSTER, explorerTx } from "@/lib/config";
import { FAUCET_URL } from "@/features/wallet/wallet-state";
import { sol4 } from "./amount";
import { DONE, STEPS } from "./copy";
import { ACTIONS, COST, failureCopy, programLine, type FailureContext } from "./copy-failures";
import type { FlowState } from "./use-entry-flow";

type Signing = Extract<FlowState, { step: "signing" }>;
type Done = Extract<FlowState, { step: "done" }>;
type Failed = Extract<FlowState, { step: "failed" }>;

export function SigningSteps({ state }: { state: Signing }) {
  const steps = state.stage === "checking" ? (["wallet", "checking"] as const) : (["wallet", "confirming"] as const);
  const at = steps.indexOf(state.stage as never);
  return (
    <div className="space-y-3 text-sm">
      <ol className="m-0 list-none space-y-2 p-0">
        {steps.map((step, i) => (
          <li
            key={step}
            aria-current={i === at ? "step" : undefined}
            className={cx("flex items-center gap-2", i > at && "text-muted")}
          >
            {i < at ? (
              <Check className="size-4" aria-hidden="true" />
            ) : i === at ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <span className="size-4" />
            )}
            <span>{STEPS[step]}</span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {STEPS[state.stage]}
      </p>
      {state.stage === "checking" ? <p className="m-0 text-xs text-muted">{STEPS.checkingNote}</p> : null}
      {state.blocksLeft !== null && state.blocksLeft > 0n ? (
        <p className="m-0 text-xs text-muted">{STEPS.blocksLeft(state.blocksLeft.toLocaleString("en-US"))}</p>
      ) : null}
      <p className="m-0 text-xs text-muted">{STEPS.keepOpen}</p>
    </div>
  );
}

export function Receipt({ state, onClose }: { state: Done; onClose: () => void }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="m-0 flex items-start gap-2 rounded-sm bg-st-paid-bg px-3 py-2 text-st-paid-fg">
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{DONE.text(state.choice.side.toUpperCase(), sol4(state.choice.amount))}</span>
      </p>
      {state.signature ? (
        <p className="m-0">
          {DONE.transaction}:{" "}
          <a
            href={explorerTx(state.signature)}
            target="_blank"
            rel="noreferrer"
            className="break-all font-mono underline"
          >
            {state.signature}
          </a>
        </p>
      ) : (
        <p className="m-0 text-muted">
          {DONE.landedNoSignature} {DONE.holdsNow(sol4(state.sides.yes), sol4(state.sides.no))}
        </p>
      )}
      <p className="m-0 text-xs text-muted">{DONE.paidOut}</p>
      <div className="flex justify-end">
        <Button onClick={onClose}>{DONE.close}</Button>
      </div>
    </div>
  );
}

export function FailureView({
  state,
  context,
  onAgain,
  onAmount,
  onCheck,
  onClose,
}: {
  state: Failed;
  context: FailureContext;
  onAgain: () => void;
  onAmount: () => void;
  onCheck: () => void;
  onClose: () => void;
}) {
  const copy = failureCopy(state.failure.key, context);
  const { code, name, programMessage } = state.failure;
  const act =
    copy.way === "amount"
      ? onAmount
      : copy.way === "check"
        ? onCheck
        : copy.way === "again" || copy.way === "wait"
          ? onAgain
          : null;
  // A stopped watch says itself what it does not know; an expired attempt with no signature may have cost its fee.
  const cost =
    state.cost === "fee"
      ? COST.fee
      : state.cost === "nothing"
        ? COST.nothing
        : copy.way === "check"
          ? null
          : COST.unknown;
  return (
    <div className="space-y-3 text-sm">
      <p className="m-0 flex items-start gap-2 rounded-sm bg-danger-bg px-3 py-2 text-error">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{copy.text}</span>
      </p>
      {cost ? <p className="m-0 text-muted">{cost}</p> : null}
      {code !== null && name && programMessage ? (
        <p className="m-0 font-mono text-[11px] text-muted">{programLine(code, name, programMessage)}</p>
      ) : null}
      {copy.way === "faucet" && CLUSTER === "devnet" ? (
        <p className="m-0">
          <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="text-accent-soft underline">
            {ACTIONS.faucet}
          </a>
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        {act ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              {ACTIONS.close}
            </Button>
            <Button onClick={act}>{ACTIONS[copy.way]}</Button>
          </>
        ) : (
          <Button onClick={onClose}>{ACTIONS.close}</Button>
        )}
      </div>
    </div>
  );
}
