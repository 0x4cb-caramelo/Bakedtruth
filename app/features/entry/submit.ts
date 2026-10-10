/**
 * Purpose: an entry from the panel to the chain, without React. `prepareEntry` is the SDK's A-3 preparation for the
 *          connected wallet's address (re-read, checked, built, summarised from the bytes, simulated), passing the
 *          retry guard's saved total when there is one. `handToWallet` saves the guard's record first, gives the wallet
 *          the very message bytes the summary read, and watches the result by polling (watch.ts). The wallet signs
 *          and sends (`sendTransaction`, which maps to MWA's `sign_and_send_transactions`, TP §3.6 S1 rule 4); the site
 *          never holds a key.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { address, createNoopSigner } from "@solana/kit";
import { VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import type { SolanaRpc } from "@brot/sdk/read";
import { prepareJoin, type PreparedJoin } from "@brot/sdk/tx";

import { sideOf, type EntrySide } from "./estimate";
import { fromChainError, fromError, nothingSent, notLanded, type Failure } from "./failures";
import { clearPending, savePending, type KeyValueStore, type PendingEntry } from "./retry-guard";
import { watchPending, WatchStopped, type WatchOptions } from "./watch";

export type ReadyJoin = Extract<PreparedJoin, { ok: true }>;
export type EntryChoice = { campaign: string; baker: string; side: EntrySide; amount: bigint };

/** A-3 for this entry. `expectedEntryTotal`: the retry guard's saved total, when a record is kept. */
export function prepareEntry(a: EntryChoice & { rpc: SolanaRpc; expectedEntryTotal?: bigint }): Promise<PreparedJoin> {
  return prepareJoin({
    rpc: a.rpc,
    // Only names the fee payer: nothing is signed here; the wallet signs the compiled bytes later.
    baker: createNoopSigner(address(a.baker)),
    campaign: address(a.campaign),
    side: sideOf(a.side),
    amount: a.amount,
    expectedEntryTotal: a.expectedEntryTotal,
  });
}

/** The transaction the wallet receives: exactly the message bytes `summarizeMessage` read, still unsigned. */
export const walletTransaction = (ready: ReadyJoin): VersionedTransaction =>
  new VersionedTransaction(VersionedMessage.deserialize(new Uint8Array(ready.transaction.messageBytes)));

/** The guard's record of a prepared entry, before the wallet sees it. */
export function pendingOf(ready: ReadyJoin, choice: EntryChoice): PendingEntry {
  const lifetime = ready.message.lifetimeConstraint;
  // The SDK prepares every join with the cluster's latest blockhash (tx/message.ts), never a durable nonce.
  if (!("lastValidBlockHeight" in lifetime)) throw new Error("a join without a blockhash lifetime cannot be guarded");
  return {
    v: 1,
    campaign: choice.campaign,
    baker: choice.baker,
    side: choice.side,
    amount: choice.amount.toString(),
    expectedEntryTotal: ready.expectedEntryTotal.toString(),
    lastValidBlockHeight: lifetime.lastValidBlockHeight.toString(),
    signature: null,
    state: "handed",
    savedAt: Date.now(),
  };
}

/** The wallet adapter's `sendTransaction`, bound to the site's connection: resolves to the signature. */
export type SendToWallet = (transaction: VersionedTransaction) => Promise<string>;

export type Outcome =
  | { kind: "landed"; signature: string | null }
  | { kind: "failed"; failure: Failure; signature: string | null; onChain: boolean }
  /** The watch stopped (network or page): the record is kept and the watch resumes on the next visit. */
  | { kind: "stopped"; record: PendingEntry };

export type Stage = "wallet" | "confirming" | "checking";

/** Saves the record, hands the transaction to the wallet, and watches it until it is decided. */
export async function handToWallet(a: {
  rpc: SolanaRpc;
  ready: ReadyJoin;
  pending: PendingEntry;
  send: SendToWallet;
  store: KeyValueStore | null;
  /** This attempt passed a saved total from an earlier one: a changed entry then means the earlier one landed. */
  retry?: boolean;
  onStage?: (stage: Stage) => void;
  watch?: WatchOptions;
}): Promise<Outcome> {
  let record = a.pending;
  savePending(a.store, record);
  a.onStage?.("wallet");
  try {
    record = { ...record, signature: await a.send(walletTransaction(a.ready)) };
    savePending(a.store, record);
    a.onStage?.("confirming");
  } catch (error) {
    const failure = fromError(error);
    if (nothingSent(failure)) {
      savePending(a.store, { ...record, state: "refused" });
      return { kind: "failed", failure, signature: null, onChain: false };
    }
    // No answer that proves nothing was sent: the wallet may have sent it. Watch until it lands or expires.
    a.onStage?.("checking");
  }
  return settle(a.rpc, record, a.store, a.retry ?? false, a.watch);
}

/** Watches a record until it is decided, and keeps or clears it by the guard's rule; also resumes one after a reload. */
export async function settle(
  rpc: SolanaRpc,
  record: PendingEntry,
  store: KeyValueStore | null,
  retry: boolean,
  watch?: WatchOptions,
): Promise<Outcome> {
  let watched;
  try {
    watched = await watchPending(rpc, record, watch);
  } catch (error) {
    if (error instanceof WatchStopped) return { kind: "stopped", record };
    throw error;
  }
  if (watched.verdict === "landed") {
    clearPending(store, record.campaign, record.baker);
    return { kind: "landed", signature: record.signature };
  }
  if (watched.verdict === "failed") {
    clearPending(store, record.campaign, record.baker);
    return { kind: "failed", failure: fromChainError(watched.err, retry), signature: record.signature, onChain: true };
  }
  // Expired unlanded: keep the saved total, so the next attempt still cannot add a second entry.
  savePending(store, { ...record, state: "expired" });
  return { kind: "failed", failure: notLanded(), signature: record.signature, onChain: false };
}
