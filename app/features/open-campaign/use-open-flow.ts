/**
 * Purpose: an opening's steps in React, around submit.ts (A-3, A-8, A-9; T17): "Review and sign" saves the guard's id
 *          before anything else, then the SDK re-reads the accounts, checks every rule, builds, summarises the very
 *          bytes and simulates; "Sign in wallet" checks the deploy and the blockhash again, hands the bytes over and
 *          watches the result. While an attempt may still land, no new one is prepared: the box watches it (on mount
 *          and on "Review and sign"). With no saved record, a paid opening first looks for this wallet's opening of
 *          the last half hour on-chain (recent.ts) and offers it instead of a second payment.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { assertDeploy } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { BUILT_FOR } from "@/lib/deploy";
import { rpc } from "@/lib/rpc";
import { failure as plain, fromError, fromRefusal, fromSimulation, type Failure } from "../entry/failures";
import type { KeyValueStore } from "../entry/retry-guard";
import { deployConfirmed } from "../entry/upgrade-pause";
import { recentOpening, type RecentOpening } from "./recent";
import { idFor, loadOpening, type PendingOpening } from "./retry-guard";
import { handToWallet, lastValidOf, prepareOpening, settleOpening, type OpenOutcome } from "./submit";
import type { ReadyOpening, Stage } from "./submit";

export type OpenFlow =
  | { step: "idle" }
  | { step: "preparing" }
  | { step: "recent"; choice: OpeningChoice; recent: RecentOpening; chainNow: bigint }
  | { step: "review"; choice: OpeningChoice; ready: ReadyOpening; refreshed: boolean }
  | { step: "signing"; stage: Stage; blocksLeft: bigint | null; total: bigint | null }
  | { step: "done"; outcome: Extract<OpenOutcome, { kind: "opened" | "already" | "taken" }> }
  | { step: "failed"; failure: Failure; cost: "nothing" | "fee" | "unknown"; resume?: PendingOpening };

/** Fewer blocks than this left on the prepared blockhash, and the opening is prepared again before the wallet. */
const FRESH_BLOCKS = 60n;

export function useOpenFlow(a: {
  wallet: string | null;
  store: KeyValueStore;
  /** The id a new record takes: the page's own; `redraw` replaces it once another wallet took it. */
  draw: () => bigint;
  redraw: () => void;
  onLanded: () => void;
}) {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [flow, setFlow] = useState<OpenFlow>({ step: "idle" });
  const { wallet, store, draw } = a;
  // The page's callbacks change on every render; the watch must not restart for that, so it reads them here.
  const page = useRef({ redraw: a.redraw, onLanded: a.onLanded });
  useEffect(() => {
    page.current = { redraw: a.redraw, onLanded: a.onLanded };
  });

  const finish = useCallback((outcome: OpenOutcome) => {
    if (outcome.kind === "taken") page.current.redraw();
    if (outcome.kind === "opened" || outcome.kind === "already" || outcome.kind === "taken") {
      setFlow({ step: "done", outcome });
      page.current.onLanded();
    } else if (outcome.kind === "stopped") {
      setFlow({ step: "failed", failure: plain("stillChecking"), cost: "unknown", resume: outcome.record });
    } else if (outcome.kind === "not-landed") {
      setFlow({ step: "failed", failure: plain("notLanded"), cost: outcome.cost });
    } else {
      setFlow({ step: "failed", failure: outcome.failure, cost: outcome.cost });
      if (outcome.cost === "fee") page.current.onLanded();
    }
  }, []);

  /** While an attempt is watched: the blocks left, and the checking step shown for an attempt found on load. */
  const onWait = useCallback(
    (left: bigint) =>
      setFlow((f) =>
        f.step === "signing"
          ? { ...f, blocksLeft: left }
          : { step: "signing", stage: "checking", blocksLeft: left, total: null },
      ),
    [],
  );

  /** Watches an unresolved attempt to its end (a reload, a lost answer, "Check again"). */
  const resume = useCallback(
    async (record: PendingOpening, signal?: AbortSignal) => {
      setFlow({ step: "signing", stage: "checking", blocksLeft: null, total: null });
      const outcome = await settleOpening(rpc, record, store, { signal, onWait });
      if (!signal?.aborted) finish(outcome);
    },
    [store, finish, onWait],
  );

  // A record left by a frozen tab or a closed page: watch it to its end before anything else (A-9).
  useEffect(() => {
    if (!wallet) return;
    const record = loadOpening(store, wallet);
    if (record?.state !== "handed") return;
    const abort = new AbortController();
    settleOpening(rpc, record, store, { signal: abort.signal, onWait }).then((outcome) => {
      if (!abort.signal.aborted) finish(outcome);
    });
    return () => abort.abort();
  }, [wallet, store, finish, onWait]);

  const prepare = useCallback(
    async (choice: OpeningChoice, refreshed = false) => {
      if (!wallet) return;
      const record = idFor(store, wallet, draw); // saved before anything reaches the wallet (T17)
      try {
        const prepared = await prepareOpening({
          rpc,
          creator: wallet,
          choice,
          id: BigInt(record.id),
          deploySlot: BUILT_FOR,
        });
        deployConfirmed(); // the SDK checked the deploy before anything else
        if (prepared.ok) return setFlow({ step: "review", choice, ready: prepared, refreshed });
        const failure =
          prepared.stage === "check"
            ? fromRefusal(prepared.check.refusal.errorName)
            : fromSimulation(prepared.simulation);
        if (failure.name === "AlreadyInitialized") {
          // A campaign already sits at the saved id: this wallet's (another tab, an answer lost before the record
          // was handed) or another wallet's. The guard's rule says which; nothing is sent either way.
          const found = await settleOpening(rpc, { ...record, state: "handed", deadline: "0", signature: null }, store);
          if (found.kind === "opened") return finish({ kind: "already", id: found.id });
          if (found.kind === "taken") return finish(found);
        }
        setFlow({ step: "failed", failure, cost: "nothing" });
      } catch (error) {
        setFlow({ step: "failed", failure: fromError(error), cost: "nothing" });
      }
    },
    [wallet, store, draw, finish],
  );

  const review = useCallback(
    async (choice: OpeningChoice, chainNow: bigint, skipRecent = false) => {
      if (!wallet) return;
      const saved = loadOpening(store, wallet);
      if (saved?.state === "handed") return resume(saved); // never a new attempt while one may still land
      setFlow({ step: "preparing" });
      if (!saved && !skipRecent && choice.openingUsd > 0n) {
        const recent = await recentOpening(rpc, wallet, chainNow).catch(() => null);
        if (recent) return setFlow({ step: "recent", choice, recent, chainNow });
      }
      await prepare(choice);
    },
    [wallet, store, resume, prepare],
  );

  const sign = useCallback(async () => {
    if (flow.step !== "review") return;
    const { choice, ready } = flow;
    const record = wallet ? loadOpening(store, wallet) : null;
    if (!wallet || !record || BigInt(record.id) !== ready.id) {
      return setFlow({ step: "failed", failure: plain("walletChanged"), cost: "nothing" });
    }
    let left: bigint;
    try {
      // A-8 again: an upgrade may have landed while the summary was on screen.
      const [height] = await Promise.all([
        rpc.getBlockHeight({ commitment: "confirmed" }).send(),
        assertDeploy(rpc, BUILT_FOR),
      ]);
      left = lastValidOf(ready) - height;
    } catch (error) {
      return setFlow({ step: "failed", failure: fromError(error), cost: "nothing" });
    }
    if (left < FRESH_BLOCKS) return prepare(choice, true);
    setFlow({ step: "signing", stage: "wallet", blocksLeft: null, total: ready.debit.total });
    const outcome = await handToWallet({
      rpc,
      ready,
      record,
      store,
      send: (transaction) => sendTransaction(transaction, connection, { preflightCommitment: "confirmed" }),
      onStage: (stage) => setFlow((f) => (f.step === "signing" ? { ...f, stage } : f)),
      watch: { onWait },
    });
    finish(outcome);
  }, [flow, wallet, store, prepare, sendTransaction, connection, finish, onWait]);

  const reset = useCallback(() => setFlow({ step: "idle" }), []);
  return { flow, review, prepare, sign, resume, reset };
}
