/**
 * Purpose: the entry's steps in React, around submit.ts: review (A-3: the SDK re-reads the campaign and the wallet's
 *          entry, checks, builds, summarises the bytes and simulates), sign (the guard's record saved, then the wallet,
 *          then the watch), and the result. While an attempt is unresolved, no new one is prepared: the page watches it
 *          (on mount, on "Review entry", and on "Check again" after the network stopped answering) (A-9). Every attempt
 *          passes the saved total while a record is kept. A stale join is prepared again in place before the wallet, and
 *          the same click goes on when only its blockhash moved (fresh-join.ts); one click makes one attempt, the sheet
 *          busy meanwhile. An entry prepared for another wallet is never handed over.
 *          A-8: the program's last deploy (its ProgramData, through the site's RPC) is checked by the SDK's preparation
 *          and again right before the wallet; when it is not the deploy this site was built for, nothing is signed and
 *          the failure counts down to a reload (upgrade-pause.ts).
 * Version: 0.4.0 (2026-10-15: "Sign" works on the first click after a long read; 0.3.0, A-8, 2026-10-10; 0.2.0, the
 *          Sprint 11 review: one unresolved attempt at a time, freshness in blocks, the wallet re-checked)
 * Sprint:  11 (site: campaign page and entry)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { BUILT_FOR } from "@/lib/deploy";
import { rpc } from "@/lib/rpc";
import { failure as plain, fromError, fromRefusal, fromSimulation, type Failure } from "./failures";
import { clearPending, guardedTotal, layeredStore, loadPending, retrying, type PendingEntry } from "./retry-guard";
import { freshJoin, type Prepared } from "./fresh-join";
import { handToWallet, pendingOf, prepareEntry, settle } from "./submit";
import type { Cost, EntryChoice, Outcome, ReadyJoin, Stage } from "./submit";
import { deployConfirmed } from "./upgrade-pause";
import { browserStore } from "./use-rents";
import type { Sides } from "./watch";

export type FlowState =
  | { step: "idle" }
  | { step: "preparing"; choice: EntryChoice }
  /** `busy`: "Sign" was clicked and the page is checking the join before the wallet (and may prepare it again). */
  | { step: "review"; choice: EntryChoice; ready: ReadyJoin; retry: boolean; refreshed: boolean; busy?: boolean }
  | { step: "signing"; choice: EntryChoice; stage: Stage; blocksLeft: bigint | null }
  | { step: "done"; choice: EntryChoice; signature: string | null; sides: Sides }
  /** `resume`: the record whose watch stopped; "Check again" watches it once more. */
  | { step: "failed"; choice: EntryChoice; failure: Failure; cost: Cost; floorBps: number | null; resume?: PendingEntry };

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

  /** A-3 for `choice`: the SDK's preparation, carrying the saved total while a record is kept. */
  const prepare = useCallback(
    async (choice: EntryChoice) => {
      const saved = loadPending(store, choice.campaign, choice.baker);
      const retry = retrying(saved);
      const prepared = await prepareEntry({ rpc, ...choice, expectedEntryTotal: guardedTotal(saved), deploySlot: BUILT_FOR });
      deployConfirmed(); // the SDK checked the deploy before anything else
      return { prepared, retry };
    },
    [store],
  );

  /** A preparation the SDK refused, at its check or its simulation, as the sheet's failure. */
  const refused = useCallback(
    (choice: EntryChoice, prepared: Exclude<Prepared, { ok: true }>, retry: boolean) => {
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
    },
    [store],
  );

  const review = useCallback(
    async (choice: EntryChoice) => {
      const saved = loadPending(store, choice.campaign, choice.baker);
      if (saved?.state === "handed") return resume(saved); // never a new attempt while one may still land
      setState({ step: "preparing", choice });
      try {
        const { prepared, retry } = await prepare(choice);
        if (prepared.ok) setState({ step: "review", choice, ready: prepared, retry, refreshed: false });
        else refused(choice, prepared, retry);
      } catch (error) {
        setState({ step: "failed", choice, failure: fromError(error), cost: "nothing", floorBps: null });
      }
    },
    [store, resume, prepare, refused],
  );

  // One click, one attempt: a second click while the first is still checking does nothing.
  const busy = useRef(false);
  const sign = useCallback(async () => {
    if (state.step !== "review" || busy.current) return;
    const { choice } = state;
    let { ready, retry } = state;
    if (a.wallet !== choice.baker) {
      setState({ step: "failed", choice, failure: plain("walletChanged"), cost: "nothing", floorBps: null });
      return;
    }
    busy.current = true;
    setState((s) => (s.step === "review" ? { ...s, busy: true } : s));
    try {
      // A-8 again and the blockhash's life (fresh-join.ts): a stale join is prepared again in place, the sheet open.
      const fresh = await freshJoin(rpc, BUILT_FOR, ready, () => prepare(choice)).catch((error: unknown) => {
        setState({ step: "failed", choice, failure: fromError(error), cost: "nothing", floorBps: null });
        return null;
      });
      if (fresh === null) return;
      if (fresh.kind === "again") {
        // Never a new attempt while one may still land; refused, or new terms for the person to review.
        const saved = loadPending(store, choice.campaign, choice.baker);
        if (saved?.state === "handed") return await resume(saved);
        if (!fresh.prepared.ok) return refused(choice, fresh.prepared, fresh.retry);
        setState({ step: "review", choice, ready: fresh.prepared, retry: fresh.retry, refreshed: true });
        return;
      }
      ready = fresh.ready;
      retry = fresh.retry ?? retry;
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
    } finally {
      busy.current = false;
    }
  }, [state, a.wallet, prepare, refused, resume, store, sendTransaction, connection, finish, waiting]);

  const reset = useCallback(() => setState({ step: "idle" }), []);
  return { state, review, sign, resume, reset, persists: store.persists };
}
