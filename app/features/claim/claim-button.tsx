/**
 * Purpose: the "Receive" button for a reserved creator share (Sprint 12 DoD: the only claim on the site): prepares
 *          through the SDK (A-3, A-8 first), hands the exact bytes to the connected wallet, watches by polling, then
 *          tells the page to read the chain again. On A-8's mismatch it signs nothing and reloads on Sprint 11's
 *          back-off.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { BUILT_FOR } from "@/lib/deploy";
import { rpc } from "@/lib/rpc";
import { ReloadCountdown } from "@/features/entry/reload-countdown";
import { deployConfirmed } from "@/features/entry/upgrade-pause";
import { exactSol } from "@/features/campaign-page/copy-states";
import { claimTransaction, lastValidOf, prepareReceive, refusedInWallet, watchClaim, type ClaimFailure } from "./claim";
import { CLAIM, CLAIM_FAILURE, floorText } from "./copy";

type Step =
  | { at: "idle" }
  | { at: "preparing" | "wallet" | "confirming" }
  | { at: "done" }
  | { at: "failed"; failure: ClaimFailure; floor?: bigint };

export function ClaimButton(props: { campaign: string; amount: bigint; onDone: () => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState<Step>({ at: "idle" });
  const wallet = publicKey?.toBase58() ?? null;

  async function receive() {
    if (!wallet) return;
    setStep({ at: "preparing" });
    const prepared = await prepareReceive({ rpc, wallet, campaign: props.campaign, deploySlot: BUILT_FOR });
    if (!prepared.ok) return setStep({ at: "failed", failure: prepared.failure, floor: prepared.floor });
    deployConfirmed(); // the SDK checked the deploy before anything else
    setStep({ at: "wallet" });
    let signature: string;
    try {
      signature = await sendTransaction(claimTransaction(prepared.ready), connection, {
        preflightCommitment: "confirmed",
      });
    } catch (error) {
      return setStep({ at: "failed", failure: refusedInWallet(error) ? "refusedInWallet" : "walletNoAnswer" });
    }
    setStep({ at: "confirming" });
    try {
      const watched = await watchClaim(rpc, signature, lastValidOf(prepared.ready));
      if (watched !== "landed") return setStep({ at: "failed", failure: watched });
    } catch {
      return setStep({ at: "failed", failure: "network" });
    }
    setStep({ at: "done" });
    props.onDone();
  }

  const sol = exactSol(props.amount);
  if (!wallet) return <p className="m-0 text-sm text-muted">{CLAIM.connect}</p>;
  if (step.at === "done") return <p className="m-0 text-sm font-semibold text-yes-fg">{CLAIM.done(sol)}</p>;
  const busy = step.at === "preparing" || step.at === "wallet" || step.at === "confirming";
  return (
    <div className="space-y-2">
      <Button wide disabled={busy} onClick={() => void receive()}>
        {busy ? CLAIM[step.at] : CLAIM.button(sol)}
      </Button>
      <p className="m-0 text-xs text-muted">{CLAIM.signs}</p>
      {step.at === "failed" ? (
        <div role="alert" className="space-y-1 text-sm text-error">
          <p className="m-0">{CLAIM_FAILURE[step.failure]}</p>
          {step.floor !== undefined ? <p className="m-0">{floorText(exactSol(step.floor))}</p> : null}
          {step.failure === "programUpgraded" ? <ReloadCountdown /> : null}
        </div>
      ) : null}
    </div>
  );
}
