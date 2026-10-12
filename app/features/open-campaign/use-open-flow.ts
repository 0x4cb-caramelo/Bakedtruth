/**
 * Purpose: an opening's steps in React, around submit.ts (A-3, A-8, A-9; T17): "Review and sign" takes the guard's id
 *          (the saved one, or the page's for this wallet), then the SDK re-reads the accounts, checks every rule,
 *          builds, summarises the very bytes and simulates; "Sign in wallet" checks the deploy and the blockhash again,
 *          saves the guard's record, hands the bytes over and watches the result. While an attempt may still land, no
 *          new one is prepared: the box watches it. With no attempt in flight, a paid opening first looks for this
 *          wallet's opening of the last half hour on-chain (recent.ts) and, found or not known, asks before paying.
 *          Each step belongs to one generation: a watch a newer step superseded never overwrites it.
 * Version: 0.3.0 (the Sprint 19 adversarial review: generations, the recent check closed, the id spent at once; the
 *          states and the step after an outcome in flow-state.ts)
 * Sprint:  19 (site: open a campaign)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { assertDeploy, sponsoredPriceAddress } from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { BUILT_FOR } from "@/lib/deploy";
import { rpc } from "@/lib/rpc";
import { failure as plain, fromError, fromRefusal, fromSimulation } from "../entry/failures";
import type { KeyValueStore } from "../entry/retry-guard";
import { deployConfirmed } from "../entry/upgrade-pause";
import { advance, CHECKING, FRESH_BLOCKS, isCurrent, movedFunds, stepAfter } from "./flow-state";
import type { OpenFlow, Receipt } from "./flow-state";
import { recentOpening } from "./recent";
import { idFor, loadOpening, type PendingOpening } from "./retry-guard";
import { handToWallet, lastValidOf, prepareOpening, settleOpening, type OpenOutcome } from "./submit";

export function useOpenFlow(a: {
  wallet: string | null;
  store: KeyValueStore;
  /** The id a new record takes for a wallet: the page's own; `redraw` replaces it once a campaign sits at it. */
  draw: (wallet: string) => bigint;
  redraw: (wallet: string) => void;
  onLanded: () => void;
}) {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [flow, setFlow] = useState<OpenFlow>({ step: "idle" });
  const { wallet, store, draw } = a;
  // The page's callbacks change on every render; the watch must not restart for that, so it reads them here.
  const page = useRef({ redraw: a.redraw, onLanded: a.onLanded });
  const paying = useRef<Receipt | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    page.current = { redraw: a.redraw, onLanded: a.onLanded };
  });

  const next = useCallback(() => advance(generation), []);
  const mine = useCallback((g: number) => isCurrent(generation, g), []);

  const finish = useCallback(
    (outcome: OpenOutcome, g: number) => {
      if (movedFunds(outcome)) page.current.onLanded();
      if (mine(g)) setFlow(stepAfter(outcome, paying.current));
    },
    [mine],
  );

  /** The watch's options for generation `g`: the blocks left, the checking step, and the spent id redrawn at once. */
  const watchFor = useCallback(
    (g: number, creator: string, signal?: AbortSignal) => ({
      signal,
      onSpent: () => page.current.redraw(creator),
      onWait: (left: bigint) =>
        mine(g) &&
        setFlow((f) => (f.step === "signing" ? { ...f, blocksLeft: left } : { ...CHECKING, blocksLeft: left })),
    }),
    [mine],
  );

  /** Watches an unresolved attempt to its end (a reload, a lost answer, "Check again"). */
  const resume = useCallback(
    async (record: PendingOpening, signal?: AbortSignal) => {
      const g = next();
      paying.current = null; // an attempt found on load: its payment is the campaign page's to show
      setFlow(CHECKING);
      const outcome = await settleOpening(rpc, record, store, watchFor(g, record.creator, signal));
      if (!signal?.aborted) finish(outcome, g);
    },
    [store, finish, watchFor, next],
  );

  // A record left by a frozen tab or a closed page: watch it to its end before anything else (A-9). Its first wait
  // shows the checking step (watchFor's onWait), so the effect itself sets no state.
  useEffect(() => {
    if (!wallet) return;
    const record = loadOpening(store, wallet);
    if (record?.state !== "handed") return;
    const abort = new AbortController();
    const g = next();
    paying.current = null;
    settleOpening(rpc, record, store, watchFor(g, record.creator, abort.signal)).then((outcome) => {
      if (!abort.signal.aborted) finish(outcome, g);
    });
    return () => abort.abort();
  }, [wallet, store, next, watchFor, finish]);

  const prepare = useCallback(
    async (choice: OpeningChoice, refreshed = false, generationOf?: number) => {
      if (!wallet) return;
      const g = generationOf ?? next();
      setFlow({ step: "preparing" });
      const record = idFor(store, wallet, () => draw(wallet)); // saved only at the hand-off (T17)
      try {
        const [prepared, metric] = await Promise.all([
          prepareOpening({ rpc, creator: wallet, choice, id: BigInt(record.id), deploySlot: BUILT_FOR }),
          choice.metricAccount ? Promise.resolve(choice.metricAccount) : sponsoredPriceAddress(choice.feedId ?? ""),
        ]);
        deployConfirmed(); // the SDK checked the deploy before anything else
        if (!mine(g)) return;
        if (prepared.ok)
          return setFlow({ step: "review", choice, ready: prepared, refreshed, creator: wallet, metric, record });
        const failure =
          prepared.stage === "check"
            ? fromRefusal(prepared.check.refusal.errorName)
            : fromSimulation(prepared.simulation);
        if (failure.name === "AlreadyInitialized") {
          // A campaign already sits at this id: this wallet's (another tab, an answer lost before the record was
          // saved) or another wallet's. The guard's rule says which; nothing is sent either way.
          // Nothing was handed over, so nothing is written or cleared here (the store is not passed).
          const synthetic = { ...record, state: "handed" as const, deadline: "0", signature: null };
          const found = await settleOpening(rpc, synthetic, null, watchFor(g, wallet));
          if (found.kind === "opened") return finish({ kind: "already", id: found.id }, g);
          if (found.kind === "taken") return finish(found, g);
        }
        setFlow({ step: "failed", failure, cost: "nothing" });
      } catch (error) {
        if (mine(g)) setFlow({ step: "failed", failure: fromError(error), cost: "nothing" });
      }
    },
    [wallet, store, draw, finish, watchFor, next, mine],
  );

  const review = useCallback(
    async (choice: OpeningChoice, chainNow: bigint, skipRecent = false) => {
      if (!wallet) return;
      const saved = loadOpening(store, wallet);
      if (saved?.state === "handed") return resume(saved); // never a new attempt while one may still land
      const g = next();
      setFlow({ step: "preparing" });
      if (!skipRecent && choice.openingUsd > 0n) {
        const check = await recentOpening(rpc, wallet, chainNow);
        if (!mine(g)) return;
        if (check.status !== "none") return setFlow({ step: "recent", choice, check, chainNow });
      }
      await prepare(choice, false, g);
    },
    [wallet, store, resume, prepare, next, mine],
  );

  const sign = useCallback(async () => {
    if (flow.step !== "review") return;
    const { choice, ready, record } = flow;
    const g = next();
    const saved = wallet ? loadOpening(store, wallet) : null;
    // Prepared for another wallet, or another tab saved another id meanwhile: never hand these bytes over.
    if (!wallet || wallet !== flow.creator || BigInt(record.id) !== ready.id || (saved && saved.id !== record.id)) {
      return setFlow({ step: "failed", failure: plain("walletChanged"), cost: "nothing" });
    }
    // The review leaves the screen at once, so a second click cannot hand the bytes over twice.
    setFlow({ ...CHECKING, stage: "wallet", total: ready.debit.total, most: ready.debit.maxTotal });
    let left: bigint;
    try {
      // A-8 again: an upgrade may have landed while the summary was on screen.
      const [height] = await Promise.all([
        rpc.getBlockHeight({ commitment: "confirmed" }).send(),
        assertDeploy(rpc, BUILT_FOR),
      ]);
      left = lastValidOf(ready) - height;
    } catch (error) {
      if (mine(g)) setFlow({ step: "failed", failure: fromError(error), cost: "nothing" });
      return;
    }
    if (!mine(g)) return;
    if (left < FRESH_BLOCKS) return prepare(choice, true, g);
    const pay = ready.check.payment;
    paying.current = pay.paid > 0n ? { paid: pay.paid, price: pay.price, exponent: pay.exponent } : null;
    const outcome = await handToWallet({
      rpc,
      ready,
      record,
      store,
      send: (transaction) => sendTransaction(transaction, connection, { preflightCommitment: "confirmed" }),
      onStage: (stage) => mine(g) && setFlow((f) => (f.step === "signing" ? { ...f, stage } : f)),
      watch: watchFor(g, wallet),
    });
    finish(outcome, g);
  }, [flow, wallet, store, prepare, sendTransaction, connection, finish, watchFor, next, mine]);

  const reset = useCallback(() => {
    next();
    setFlow({ step: "idle" });
  }, [next]);
  return { flow, review, prepare, sign, resume, reset };
}
