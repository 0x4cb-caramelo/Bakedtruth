/**
 * Purpose: the one dialog of an entry, from "Review entry" to the result: the review (entry-review.tsx), the signing
 *          steps, the receipt and the failures (entry-status.tsx). It cannot be closed while the wallet has the
 *          transaction or the page is checking it; the record of the retry guard is already saved by then.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
"use client";

import { Dialog } from "@/components/ui/dialog";
import { DONE, SHEET, STEPS } from "./copy";
import { failureCopy, type FailureContext } from "./copy-failures";
import { perOne } from "./estimate";
import { EntryReview, type ReviewFacts } from "./entry-review";
import { FailureView, Receipt, SigningSteps } from "./entry-status";
import type { FlowState } from "./use-entry-flow";

export function EntrySheet({
  state,
  facts,
  context,
  onSign,
  onAgain,
  onAmount,
  onClose,
}: {
  state: FlowState;
  facts: ReviewFacts;
  context: FailureContext;
  onSign: () => void;
  onAgain: () => void;
  onAmount: () => void;
  onClose: () => void;
}) {
  const open = state.step === "review" || state.step === "signing" || state.step === "done" || state.step === "failed";
  const title =
    state.step === "review"
      ? SHEET.title
      : state.step === "signing"
        ? state.stage === "checking"
          ? STEPS.checking
          : "Signing your entry"
        : state.step === "done"
          ? DONE.title
          : state.step === "failed"
            ? failureCopy(state.failure.key, context).title
            : "";
  const floor = state.step === "failed" && state.floorBps !== null ? perOne(BigInt(state.floorBps)) : undefined;
  return (
    <Dialog open={open} title={title} onClose={onClose} dismissable={state.step !== "signing"}>
      {state.step === "review" ? (
        <EntryReview
          ready={state.ready}
          choice={state.choice}
          facts={facts}
          refreshed={state.refreshed}
          onBack={onClose}
          onSign={onSign}
        />
      ) : state.step === "signing" ? (
        <SigningSteps state={state} />
      ) : state.step === "done" ? (
        <Receipt state={state} onClose={onClose} />
      ) : state.step === "failed" ? (
        <FailureView
          state={state}
          context={{ ...context, floor }}
          onAgain={onAgain}
          onAmount={onAmount}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}
