/**
 * Purpose: the entry's steps in React, around submit.ts: review (A-3: the SDK re-reads the campaign and the wallet's
 *          entry, checks, builds, summarises the bytes and simulates), sign (the guard's record saved, then the wallet,
 *          then the watch), and the result. While an attempt is unresolved, no new one is prepared: the page watches it
 *          (on mount, on "Review entry", and on "Check again" after the network stopped answering) (A-9). Every attempt
 *          passes the saved total while a record is kept. A summary whose blockhash has under 60 blocks left is prepared
 *          again before the wallet sees it, and an entry prepared for another wallet is never handed over.
 * Version: 0.2.0 (Sprint 11 review: one unresolved attempt at a time, freshness in blocks, the wallet re-checked)
 * Sprint:  11 (site: campaign page and entry)
 *
 * Not here: A-8, the pause of signing during a program upgrade. It reads ProgramData through `/rpc`, which Sprint 08
 * has not built; where to read it from until then is the founder's question (Sprint 11 record).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { rpc } from "@/lib/rpc";
import { failure as plain, fromError, fromRefusal, fromSimulation, type Failure } from "./failures";
import { clearPending, guardedTotal, layeredStore, loadPending, retrying, type PendingEntry } from "./retry-guard";
import { handToWallet, lastValidOf, pendingOf, prepareEntry, settle } from "./submit";
import type { Cost, EntryChoice, Outcome, ReadyJoin, Stage } from "./submit";
import { browserStore } from "./use-rents";
import type { Sides } from "./watch";

export type FlowState =
  | { step: "idle" }
  | { step: "preparing"; choice: EntryChoice }
  | { step: "review"; choice: EntryChoice; ready: ReadyJoin; retry: boolean; refreshed: boolean }
  | { step: "signing"; choice: EntryChoice; stage: Stage; blocksLeft: bigint | null }
  | { step: "done"; choice: EntryChoice; signature: string | null; sides: Sides }
  /** `resume`: the record whose watch stopped; "Check again" watches it once more. */
  | {
      step: "failed";
      choice: EntryChoice;
      failure: Failure;
      cost: Cost;
      floorBps: number | null;
      resume?: PendingEntry;
    };

/** Fewer blocks than this left on the prepared blockhash, and the entry is prepared again before the wallet. */
const FRESH_BLOCKS = 60n;

const choiceOf = (record: PendingEntry): EntryChoice => ({
  campaign: record.campaign,
  baker: record.baker,
  side: record.side,
  amount: BigInt(record.amount),
});

export function useEntryFlow(a: { campaign: string; wallet: string | null; onChange: () => void }) {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const store = useMemo(() => layeredStore(browserStore()), []);
  const [state, setState] = useState<FlowState>({ step: "idle" });
  const changed = useRef(a.onChange);
  useEffect(() => {
    changed.current = a.onChange;
  });

  const finish = useCallback((choice: EntryChoice, outcome: Outcome, floorBps: number | null = null) => {
    if (outcome.kind === "landed") {
      setState({ step: "done", choice, signature: outcome.signature, sides: outcome.sides });
      changed.current();
    } else if (outcome.kind === "stopped") {
      const failure = plain("stillChecking");
      setState({ step: "failed", choice, failure, cost: "unknown", floorBps: null, resume: outcome.record });
    } else {
      setState({ step: "failed", choice, failure: outcome.failure, cost: outcome.cost, floorBps });
      if (outcome.cost === "fee") changed.current();
    }
  }, []);

  const waiting = useCallback(
    (choice: EntryChoice) => (left: bigint) =>
      setState((s) =>
        s.step === "signing"
          ? { ...s, blocksLeft: left }
          : { step: "signing", choice, stage: "checking", blocksLeft: left },
      ),
    [],
  );

  /** Watches an unresolved attempt to its end. */
  const resume = useCallback(
    async (record: PendingEntry, signal?: AbortSignal) => {
      const choice = choiceOf(record);
      setState({ step: "signing", choice, stage: "checking", blocksLeft: null });
      const outcome = await settle(rpc, record, store, true, { signal, onWait: waiting(choice) });
      if (!signal?.aborted) finish(choice, outcome);
    },
    [store, finish, waiting],
  );

  // A record left by a frozen tab or a closed page: watch it to its end before anything else (A-9).
  useEffect(() => {
    if (!a.wallet) return;
    const record = loadPending(store, a.campaign, a.wallet);
    if (record?.state !== "handed") return;
    const abort = new AbortController();
    const choice = choiceOf(record);
    settle(rpc, record, store, true, { signal: abort.signal, onWait: waiting(choice) }).then((outcome) => {
      if (!abort.signal.aborted) finish(choice, outcome);
    });
    return () => abort.abort();
  }, [a.campaign, a.wallet, store, finish, waiting]);

  const review = useCallback(
    async (choice: EntryChoice) => {
      const saved = loadPending(store, choice.campaign, choice.baker);
      if (saved?.state === "handed") return resume(saved); // never a new attempt while one may still land
      setState({ step: "preparing", choice });
      const retry = retrying(saved);
      try {
        const prepared = await prepareEntry({ rpc, ...choice, expectedEntryTotal: guardedTotal(saved) });
        if (prepared.ok) {
          setState({ step: "review", choice, ready: prepared, retry, refreshed: false });
          return;
        }
        const failure =
          prepared.stage === "check"
            ? fromRefusal(prepared.check.refusal.errorName, retry)
            : fromSimulation(prepared.simulation, retry);
        if (failure.name === "EntryTotalMismatch") {
          // The chain moved past the saved total: no attempt carrying it can land any more. Show the entry as it is.
          clearPending(store, choice.campaign, choice.baker);
          changed.current();
        }
        setState({ step: "failed", choice, failure, cost: "nothing", floorBps: null });
      } catch (error) {
        setState({ step: "failed", choice, failure: fromError(error), cost: "nothing", floorBps: null });
      }
    },
    [store, resume],
  );

  const sign = useCallback(async () => {
    if (state.step !== "review") return;
    const { choice, ready, retry } = state;
    if (a.wallet !== choice.baker) {
      setState({ step: "failed", choice, failure: plain("walletChanged"), cost: "nothing", floorBps: null });
      return;
    }
    let left: bigint;
    try {
      left = lastValidOf(ready) - (await rpc.getBlockHeight({ commitment: "confirmed" }).send());
    } catch (error) {
      setState({ step: "failed", choice, failure: fromError(error), cost: "nothing", floorBps: null });
      return;
    }
    if (left < FRESH_BLOCKS) {
      await review(choice);
      setState((s) => (s.step === "review" ? { ...s, refreshed: true } : s));
      return;
    }
    setState({ step: "signing", choice, stage: "wallet", blocksLeft: null });
    const outcome = await handToWallet({
      rpc,
      ready,
      store,
      retry,
      pending: pendingOf(ready, choice, loadPending(store, choice.campaign, choice.baker)),
      send: (transaction) => sendTransaction(transaction, connection, { preflightCommitment: "confirmed" }),
      onStage: (stage) => setState((s) => (s.step === "signing" ? { ...s, stage } : s)),
      watch: { onWait: waiting(choice) },
    });
    finish(choice, outcome, ready.minReturnBps);
  }, [state, a.wallet, review, store, sendTransaction, connection, finish, waiting]);

  const reset = useCallback(() => setState({ step: "idle" }), []);
  return { state, review, sign, resume, reset, persists: store.persists };
}
