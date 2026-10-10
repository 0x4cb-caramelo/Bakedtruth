/**
 * Purpose: an entry from the panel to the chain, without React. `prepareEntry` is the SDK's A-3 preparation for the
 *          connected wallet's address (re-read, checked, built, summarised from the bytes, simulated), passing the
 *          retry guard's saved total when there is one. `handToWallet` saves the guard's record for this attempt first,
 *          gives the wallet the very message bytes the summary read, and watches the result by polling (watch.ts). The
 *          wallet signs and sends (`sendTransaction`, which maps to MWA's `sign_and_send_transactions`, TP §3.6 S1 rule
 *          4); the site never holds a key.
 * Version: 0.2.0 (Sprint 11 review: records per attempt, a deadline raised for a late answer, errors by program)
 * Sprint:  11 (site: campaign page and entry)
 */
import { address, createNoopSigner } from "@solana/kit";
import { VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import type { SolanaRpc } from "@brot/sdk/read";
import { prepareJoin, type PreparedJoin } from "@brot/sdk/tx";

import { sideOf, type EntrySide } from "./estimate";
import { fromChainError, fromError, nothingSent, notLanded, type Failure } from "./failures";
import { failedProgram } from "./landed";
import {
  clearAttempt,
  newAttempt,
  savePending,
  updateAttempt,
  type KeyValueStore,
  type PendingEntry,
} from "./retry-guard";
import { watchPending, WatchStopped, type Sides, type WatchOptions } from "./watch";

export type ReadyJoin = Extract<PreparedJoin, { ok: true }>;
export type EntryChoice = { campaign: string; baker: string; side: EntrySide; amount: bigint };

/** A blockhash lives this many blocks: a wallet that signs a newer one can land up to this far past its answer. */
export const BLOCKHASH_LIFE = 150n;

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

/** The `lastValidBlockHeight` of the blockhash the SDK prepared with (never a durable nonce). */
export function lastValidOf(ready: ReadyJoin): bigint {
  const lifetime = ready.message.lifetimeConstraint;
  if (!("lastValidBlockHeight" in lifetime)) throw new Error("a join without a blockhash lifetime cannot be guarded");
  return lifetime.lastValidBlockHeight;
}

/** A new attempt's record, before the wallet sees it. `previous`: the record this attempt replaces, if any. */
export function pendingOf(ready: ReadyJoin, choice: EntryChoice, previous: PendingEntry | null = null): PendingEntry {
  const lastValid = lastValidOf(ready).toString();
  return {
    v: 2,
    attempt: newAttempt(),
    campaign: choice.campaign,
    baker: choice.baker,
    side: choice.side,
    amount: choice.amount.toString(),
    expectedEntryTotal: ready.expectedEntryTotal.toString(),
    lastValidBlockHeight: lastValid,
    deadline: lastValid,
    signature: null,
    state: "handed",
    handedBefore: previous !== null && (previous.handedBefore || previous.state !== "refused"),
    savedAt: Date.now(),
  };
}

/** The wallet adapter's `sendTransaction`, bound to the site's connection: resolves to the signature. */
export type SendToWallet = (transaction: VersionedTransaction) => Promise<string>;

export type Cost = "nothing" | "fee" | "unknown";
export type Outcome =
  | { kind: "landed"; signature: string | null; sides: Sides }
  | { kind: "failed"; failure: Failure; signature: string | null; cost: Cost }
  /** The watch stopped (network or page): the record is kept, and the watch resumes from it. */
  | { kind: "stopped"; record: PendingEntry };

export type Stage = "wallet" | "confirming" | "checking";

/** When the wallet answers (or fails without proof that nothing was sent), the deadline grows to the blockhash life. */
async function raiseDeadline(rpc: SolanaRpc, record: PendingEntry): Promise<PendingEntry> {
  const height = await rpc
    .getBlockHeight({ commitment: "processed" })
    .send()
    .catch(() => null);
  if (height === null) return record;
  const deadline =
    height + BLOCKHASH_LIFE > BigInt(record.deadline) ? height + BLOCKHASH_LIFE : BigInt(record.deadline);
  return { ...record, deadline: deadline.toString() };
}

/** Saves this attempt's record, hands the transaction to the wallet, and watches it until it is decided. */
export async function handToWallet(a: {
  rpc: SolanaRpc;
  ready: ReadyJoin;
  pending: PendingEntry;
  send: SendToWallet;
  store: KeyValueStore | null;
  /** An earlier attempt may have landed: a changed entry then means it did. */
  retry?: boolean;
  onStage?: (stage: Stage) => void;
  watch?: WatchOptions;
}): Promise<Outcome> {
  let record = a.pending;
  savePending(a.store, record);
  a.onStage?.("wallet");
  try {
    record = { ...record, signature: await a.send(walletTransaction(a.ready)) };
    a.onStage?.("confirming");
  } catch (error) {
    const failure = fromError(error);
    if (nothingSent(failure)) {
      updateAttempt(a.store, { ...record, state: "refused" });
      return { kind: "failed", failure, signature: null, cost: "nothing" };
    }
    // No answer that proves nothing was sent: the wallet may have sent it. Watch until it lands or expires.
    a.onStage?.("checking");
  }
  record = await raiseDeadline(a.rpc, record);
  updateAttempt(a.store, record);
  return settle(a.rpc, record, a.store, (a.retry ?? false) || record.handedBefore, a.watch);
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
    clearAttempt(store, record);
    return { kind: "landed", signature: record.signature, sides: watched.sides };
  }
  if (watched.verdict === "failed") {
    const program = record.signature ? await failedProgram(rpc, record.signature, watched.err) : null;
    clearAttempt(store, record);
    const failure = fromChainError(watched.err, retry, program);
    return { kind: "failed", failure, signature: record.signature, cost: "fee" };
  }
  // Expired unlanded: keep the saved total, so the next attempt still cannot add a second entry. Without a signature,
  // a transaction that reached the chain and failed would have cost its fee: the cost is then not known.
  updateAttempt(store, { ...record, state: "expired" });
  return {
    kind: "failed",
    failure: notLanded(),
    signature: record.signature,
    cost: record.signature ? "nothing" : "unknown",
  };
}
