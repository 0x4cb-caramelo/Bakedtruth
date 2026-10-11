/**
 * Purpose: the one dialog of an opening, from "Review and sign" to the campaign's link (spec 3.12): the recent opening
 *          found on-chain, the review (open-review.tsx), the signing steps (the wallet, confirming, finalizing, or
 *          checking an attempt the wallet never answered for, with the blocks left), the opened campaign with its link,
 *          the retried opening already open (T17), the id another wallet took, and each failure with its message, the
 *          program's own code, what it cost and its way out. It cannot be closed while the wallet has the transaction.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import Link from "next/link";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { errorMessage } from "@brot/sdk/read";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FAUCET_URL } from "@/features/wallet/wallet-state";
import { ACTIONS, COST, programLine } from "../entry/copy-failures";
import { reloadForUpgrade } from "../entry/upgrade-pause";
import { refusalCopy } from "./copy-refusals";
import { ALREADY, DONE, FAIL, failTitle, RECENT, SHEET, STEPS, TAKEN } from "./copy-sheet";
import { OpenReview } from "./open-review";
import { exactSol } from "./quote";
import type { OpenFlow } from "./use-open-flow";

type ReviewProps = Omit<Parameters<typeof OpenReview>[0], "ready" | "choice" | "refreshed" | "onSign" | "onBack">;

const Go = ({ id, text }: { id: bigint; text: string }) => (
  <Link
    href={`/c/${id}`}
    className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-cta-bg px-4 text-sm font-semibold text-on-accent hover:bg-cta-hover"
  >
    {text}
  </Link>
);

function Signing({ flow }: { flow: Extract<OpenFlow, { step: "signing" }> }) {
  const text =
    flow.stage === "wallet"
      ? STEPS.wallet(flow.total === null ? "the total" : exactSol(flow.total))
      : flow.stage === "checking"
        ? STEPS.checkingText(flow.blocksLeft && flow.blocksLeft > 0n ? flow.blocksLeft.toLocaleString("en-US") : null)
        : flow.stage === "finalizing"
          ? STEPS.finalizing
          : STEPS.confirming;
  const at = flow.stage === "wallet" ? 1 : 2;
  return (
    <div className="space-y-3 text-sm">
      <ol className="grid list-none grid-cols-3 gap-1.5 p-0 text-xs">
        {STEPS.labels.map((label, i) => (
          <li key={label} aria-current={i === at ? "step" : undefined} className="flex items-center gap-1.5">
            {i < at ? (
              <Check className="size-4" aria-hidden="true" />
            ) : i === at ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <span className="size-4" />
            )}
            {label}
          </li>
        ))}
      </ol>
      <p aria-live="polite">{text}</p>
      <p className="text-xs text-muted">{STEPS.closable}</p>
    </div>
  );
}

type RefusalContext = { owner: string; kind: string };

function Failed(p: {
  flow: Extract<OpenFlow, { step: "failed" }>;
  context: RefusalContext;
  onAgain: () => void;
  onCheck: () => void;
  onClose: () => void;
}) {
  const { failure, cost, resume } = p.flow;
  const text = failure.name ? refusalCopy(failure.name).text(p.context) : FAIL[failure.key]?.text;
  const way = resume
    ? { label: ACTIONS.check, act: p.onCheck }
    : failure.key === "programUpgraded"
      ? { label: ACTIONS.reload, act: () => reloadForUpgrade() }
      : { label: ACTIONS.again, act: p.onAgain };
  return (
    <div className="space-y-3 text-sm">
      <p className="flex gap-2 rounded-sm bg-danger-bg p-3 text-error" data-refusal={failure.name ?? failure.key}>
        <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
        {text}
      </p>
      {failure.code !== null && failure.name ? (
        <p className="text-xs text-muted">
          {programLine(failure.code, failure.name, failure.programMessage ?? errorMessage(failure.code) ?? "")}
        </p>
      ) : null}
      <p className="text-xs text-muted">{COST[cost]}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {failure.key === "notEnoughSol" ? (
          <a href={FAUCET_URL} target="_blank" rel="noreferrer" className="text-sm underline">
            {ACTIONS.faucet}
          </a>
        ) : null}
        <Button variant="secondary" onClick={p.onClose}>
          {ACTIONS.close}
        </Button>
        <Button onClick={way.act}>{way.label}</Button>
      </div>
    </div>
  );
}

export function OpenSheet(p: {
  flow: OpenFlow;
  review: ReviewProps;
  /** The kind's names, for a refusal that names the account's owner (row 2). */
  context: RefusalContext;
  onSign: () => void;
  onAgain: () => void;
  onAnyway: () => void;
  onCheck: () => void;
  onClose: () => void;
}) {
  const { flow } = p;
  const open = flow.step !== "idle" && flow.step !== "preparing";
  const title =
    flow.step === "review"
      ? SHEET.title
      : flow.step === "recent"
        ? RECENT.title
        : flow.step === "signing"
          ? flow.stage === "checking"
            ? STEPS.checking
            : STEPS.title
          : flow.step === "done"
            ? flow.outcome.kind === "opened"
              ? DONE.title
              : flow.outcome.kind === "already"
                ? ALREADY.title(flow.outcome.id.toString())
                : TAKEN.title
            : flow.step === "failed"
              ? (FAIL[flow.failure.key]?.title ?? failTitle(flow.failure.name !== null))
              : "";
  return (
    <Dialog open={open} title={title} onClose={p.onClose} dismissable={flow.step !== "signing"}>
      {flow.step === "review" ? (
        <OpenReview
          {...p.review}
          ready={flow.ready}
          choice={flow.choice}
          refreshed={flow.refreshed}
          onBack={p.onClose}
          onSign={p.onSign}
        />
      ) : flow.step === "recent" ? (
        <div className="space-y-3 text-sm">
          <p>{RECENT.text(flow.recent.id.toString(), RECENT.ago(flow.chainNow - flow.recent.at))}</p>
          <Go id={flow.recent.id} text={RECENT.go} />
          <Button variant="secondary" wide onClick={p.onAnyway}>
            {RECENT.anyway}
          </Button>
        </div>
      ) : flow.step === "signing" ? (
        <Signing flow={flow} />
      ) : flow.step === "done" ? (
        <div className="space-y-3 text-sm">
          {flow.outcome.kind === "opened" ? (
            <>
              <p>{flow.outcome.finalized ? DONE.final : DONE.confirmedOnly}</p>
              <p className="text-xs text-muted">{DONE.listed}</p>
              <Go id={flow.outcome.id} text={DONE.go} />
            </>
          ) : flow.outcome.kind === "already" ? (
            <>
              <p>{ALREADY.text}</p>
              <Go id={flow.outcome.id} text={ALREADY.go} />
            </>
          ) : (
            <p>{TAKEN.text}</p>
          )}
        </div>
      ) : flow.step === "failed" ? (
        <Failed flow={flow} context={p.context} onAgain={p.onAgain} onCheck={p.onCheck} onClose={p.onClose} />
      ) : null}
    </Dialog>
  );
}
