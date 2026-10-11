/**
 * Purpose: two steps of an opening's sheet (spec 3.12; split from open-sheet.tsx in the Sprint 19 reviews): signing
 *          (the wallet, with the total and the most it can take; confirming; finalizing; or checking an attempt the
 *          wallet never answered for, with the blocks left), and a failure with its message, the program's own line
 *          (no row number), what it cost and its way out; the faucet only on devnet.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { errorMessage } from "@brot/sdk/read";

import { Button } from "@/components/ui/button";
import { CLUSTER } from "@/lib/config";
import { FAUCET_URL } from "@/features/wallet/wallet-state";
import { ACTIONS, COST, programLine } from "../entry/copy-failures";
import { reloadForUpgrade } from "../entry/upgrade-pause";
import { refusalCopy, type RefusalContext } from "./copy-refusals";
import { FAIL, STEPS } from "./copy-sheet";
import type { OpenFlow } from "./flow-state";
import { exactSol } from "./quote";

export function Signing({ flow, persists }: { flow: Extract<OpenFlow, { step: "signing" }>; persists: boolean }) {
  const text =
    flow.stage === "wallet"
      ? flow.total !== null && flow.most !== null
        ? STEPS.wallet(exactSol(flow.total), exactSol(flow.most))
        : STEPS.walletPlain
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
      <p className="text-xs text-muted">{persists ? STEPS.closable : STEPS.closableMemory}</p>
    </div>
  );
}

export function Failed(p: {
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
        {failure.key === "notEnoughSol" && CLUSTER === "devnet" ? (
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
