/**
 * Purpose: an opening from the box to the chain, without React. `prepareOpening` is the SDK's A-3 preparation for the
 *          connected wallet's address (the config, the SOL/USD account, the metric account, the campaign's address and
 *          the clock re-read; the quote and its `max_lamports`; every rule of TP §3.4.10 checked in the program's order;
 *          the very bytes summarised and simulated; the whole debit), with the retry guard's saved id and the program
 *          deploy the site was built for (A-8). `handToWallet` saves the record first, gives the wallet those exact
 *          bytes, and watches the result by polling (watch.ts). The site never holds a key.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { address, createNoopSigner } from "@solana/kit";
import { VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import type { SolanaRpc } from "@brot/sdk/read";
import { prepareOpenCampaign, type OpeningChoice, type PreparedOpening } from "@brot/sdk/tx";

import { fromError, nothingSent, type Failure } from "../entry/failures";
import { BLOCKHASH_LIFE } from "../entry/submit";
import type { KeyValueStore } from "../entry/retry-guard";
import { STAKE_AT_LEAST_OPENS } from "./kinds";
import { MARGIN_BPS } from "./quote";
import { FEED_CLUSTER } from "./reads";
import { handedRecord, saveOpening, updateOpening, type PendingOpening } from "./retry-guard";
import { watchOpening, WatchStopped, type OpeningWatchOptions } from "./watch";

export type ReadyOpening = Extract<PreparedOpening, { ok: true }>;

/** A-3 for this opening, with the guard's id; the SDK throws `ProgramUpgraded` first when the deploy is not `deploySlot`. */
export function prepareOpening(a: {
  rpc: SolanaRpc;
  creator: string;
  choice: OpeningChoice;
  id: bigint;
  deploySlot?: bigint | null;
}): Promise<PreparedOpening> {
  return prepareOpenCampaign({
    rpc: a.rpc,
    // Only names the fee payer: nothing is signed here; the wallet signs the compiled bytes later.
    creator: createNoopSigner(address(a.creator)),
    choice: a.choice,
    id: a.id,
    marginBps: MARGIN_BPS,
    build: { feeds: FEED_CLUSTER, stakeAtLeastOpens: STAKE_AT_LEAST_OPENS },
    deploySlot: a.deploySlot,
  });
}

/** The transaction the wallet receives: exactly the message bytes `summarizeMessage` read, still unsigned. */
export const walletTransaction = (ready: ReadyOpening): VersionedTransaction =>
  new VersionedTransaction(VersionedMessage.deserialize(new Uint8Array(ready.transaction.messageBytes)));

/** The `lastValidBlockHeight` of the blockhash the SDK prepared with (never a durable nonce). */
export function lastValidOf(ready: ReadyOpening): bigint {
  const lifetime = ready.message.lifetimeConstraint;
  if (!("lastValidBlockHeight" in lifetime))
    throw new Error("an opening without a blockhash lifetime cannot be guarded");
  return lifetime.lastValidBlockHeight;
}

export type SendToWallet = (transaction: VersionedTransaction) => Promise<string>;
export type Stage = "wallet" | "confirming" | "checking" | "finalizing";

export type OpenOutcome =
  | { kind: "opened"; id: bigint; signature: string | null; finalized: boolean }
  /** The campaign at this id was already open by this wallet: an earlier attempt landed (T17). */
  | { kind: "already"; id: bigint }
  | { kind: "taken"; id: bigint }
  | { kind: "failed"; failure: Failure; signature: string | null; cost: "nothing" | "fee" | "unknown" }
  | { kind: "not-landed"; id: bigint; cost: "nothing" | "unknown" }
  | { kind: "stopped"; record: PendingOpening };

async function raiseDeadline(rpc: SolanaRpc, record: PendingOpening): Promise<PendingOpening> {
  const height = await rpc
    .getBlockHeight({ commitment: "processed" })
    .send()
    .catch(() => null);
  if (height === null) return record;
  const floor = height + BLOCKHASH_LIFE;
  return floor > BigInt(record.deadline) ? { ...record, deadline: floor.toString() } : record;
}

/** Saves the hand-off's record, hands the bytes to the wallet, and watches until the opening is decided. */
export async function handToWallet(a: {
  rpc: SolanaRpc;
  ready: ReadyOpening;
  record: PendingOpening;
  send: SendToWallet;
  store: KeyValueStore | null;
  onStage?: (stage: Stage) => void;
  watch?: OpeningWatchOptions;
}): Promise<OpenOutcome> {
  let record = handedRecord(a.record, lastValidOf(a.ready));
  saveOpening(a.store, record);
  a.onStage?.("wallet");
  try {
    record = { ...record, signature: await a.send(walletTransaction(a.ready)) };
    a.onStage?.("confirming");
  } catch (error) {
    const failure = fromError(error);
    if (nothingSent(failure)) {
      updateOpening(a.store, { ...record, state: "refused" });
      return { kind: "failed", failure, signature: null, cost: "nothing" };
    }
    // No answer that proves nothing was sent: the wallet may have sent it. Watch until it lands or expires.
    a.onStage?.("checking");
  }
  record = await raiseDeadline(a.rpc, record);
  updateOpening(a.store, record);
  return settleOpening(a.rpc, record, a.store, { ...a.watch, onStage: a.onStage });
}

/** Watches a record until it is decided; also resumes one after a reload or a lost answer. */
export async function settleOpening(
  rpc: SolanaRpc,
  record: PendingOpening,
  store: KeyValueStore | null,
  watch?: OpeningWatchOptions & { onStage?: (stage: Stage) => void },
): Promise<OpenOutcome> {
  try {
    return await watchOpening(rpc, record, store, watch);
  } catch (error) {
    if (error instanceof WatchStopped) return { kind: "stopped", record };
    throw error;
  }
}
