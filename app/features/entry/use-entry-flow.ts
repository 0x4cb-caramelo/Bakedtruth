/**
 * Purpose: the entry's steps in React, around submit.ts: review (A-3: the SDK re-reads the campaign and the wallet's
 *          entry, checks, builds, summarises the bytes and simulates), sign (the guard's record saved, then the wallet,
 *          then the watch), and the result. On mount, a record a frozen tab left behind is watched to its end first
 *          (A-9). Every attempt passes the saved total while a record is kept. A summary older than 40 seconds is
 *          prepared again before the wallet sees it, since its blockhash ages and the pot may have moved.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 *
 * Not here: A-8, the pause of signing during a program upgrade. It reads ProgramData through `/rpc`, which Sprint 08
 * has not built; where to read it from until then is the founder's question (Sprint 11 record).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { rpc } from "@/lib/rpc";
import { failure as plain, fromError, fromRefusal, fromSimulation, type Failure } from "./failures";
import { clearPending, guardedTotal, loadPending, type PendingEntry } from "./retry-guard";
import {
  handToWallet,
  pendingOf,
  prepareEntry,
  settle,
  type EntryChoice,
  type Outcome,
  type ReadyJoin,
  type Stage,
} from "./submit";
import { browserStore } from "./use-rents";

export type FlowState =
  | { step: "idle" }
  | { step: "preparing"; choice: EntryChoice }
  | { step: "review"; choice: EntryChoice; ready: ReadyJoin; retry: boolean; preparedAt: number; refreshed: boolean }
  | { step: "signing"; choice: EntryChoice; stage: Stage; blocksLeft: bigint | null }
  | { step: "done"; choice: EntryChoice; signature: string | null }
  /** `cost`: nothing moved; only the network fee (it landed and failed); or unknown (the watch could not finish). */
  | {
      step: "failed";
      choice: EntryChoice;
      failure: Failure;
      cost: "nothing" | "fee" | "unknown";
      floorBps: number | null;
    };

const FRESH_MS = 40_000;

const choiceOf = (record: PendingEntry): EntryChoice => ({
  campaign: record.campaign,
  baker: record.baker,
  side: record.side,
  amount: BigInt(record.amount),
});

export function useEntryFlow(a: { campaign: string; wallet: string | null; onLanded: () => void }) {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const store = useMemo(() => browserStore(), []);
  const [state, setState] = useState<FlowState>({ step: "idle" });
  const landed = useRef(a.onLanded);
  useEffect(() => {
    landed.current = a.onLanded;
  });

  const finish = useCallback((choice: EntryChoice, outcome: Outcome, floorBps: number | null = null) => {
    if (outcome.kind === "landed") {
      setState({ step: "done", choice, signature: outcome.signature });
      landed.current();
    } else if (outcome.kind === "stopped") {
      setState({ step: "failed", choice, failure: plain("networkDown"), cost: "unknown", floorBps: null });
    } else {
      setState({
        step: "failed",
        choice,
        failure: outcome.failure,
        cost: outcome.onChain ? "fee" : "nothing",
        floorBps,
      });
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

  // A record left by a frozen tab or a closed page: watch it to its end before anything else (A-9).
  useEffect(() => {
    if (!a.wallet) return;
    const record = loadPending(store, a.campaign, a.wallet);
    if (!record || record.state !== "handed") return;
    const choice = choiceOf(record);
    const abort = new AbortController();
    settle(rpc, record, store, true, { signal: abort.signal, onWait: waiting(choice) }).then((outcome) => {
      if (!abort.signal.aborted) finish(choice, outcome);
    });
    return () => abort.abort();
  }, [a.campaign, a.wallet, store, finish, waiting]);

  const review = useCallback(
    async (choice: EntryChoice) => {
      setState({ step: "preparing", choice });
      const saved = loadPending(store, choice.campaign, choice.baker);
      const retry = saved !== null && saved.state !== "refused";
      try {
        const prepared = await prepareEntry({ rpc, ...choice, expectedEntryTotal: guardedTotal(saved) });
        if (prepared.ok) {
          setState({ step: "review", choice, ready: prepared, retry, preparedAt: Date.now(), refreshed: false });
          return;
        }
        const failure =
          prepared.stage === "check"
            ? fromRefusal(prepared.check.refusal.errorName, retry)
            : fromSimulation(prepared.simulation, retry);
        // A saved total the chain no longer shows is spent: the entry it guarded landed, or another one did.
        if (failure.name === "EntryTotalMismatch") clearPending(store, choice.campaign, choice.baker);
        setState({ step: "failed", choice, failure, cost: "nothing", floorBps: null });
      } catch (error) {
        setState({ step: "failed", choice, failure: fromError(error), cost: "nothing", floorBps: null });
      }
    },
    [store],
  );

  const sign = useCallback(async () => {
    if (state.step !== "review") return;
    const { choice, ready, retry, preparedAt } = state;
    if (Date.now() - preparedAt > FRESH_MS) {
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
      pending: pendingOf(ready, choice),
      send: (transaction) => sendTransaction(transaction, connection, { preflightCommitment: "confirmed" }),
      onStage: (stage) => setState((s) => (s.step === "signing" ? { ...s, stage } : s)),
      watch: { onWait: waiting(choice) },
    });
    finish(choice, outcome, ready.minReturnBps);
  }, [state, review, store, sendTransaction, connection, finish, waiting]);

  const reset = useCallback(() => setState({ step: "idle" }), []);
  return { state, review, sign, reset };
}
