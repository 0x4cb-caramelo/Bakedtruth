/**
 * Purpose: watching an entry after the wallet, by polling and never a WebSocket (proposal §2.6): the signature's status
 *          (`getSignatureStatuses`), the finalized block height (`getBlockHeight`) and the wallet's entry account, every
 *          two seconds, until the retry guard's rule (retry-guard.ts) says the entry landed, failed or can no longer
 *          land. A status counts only once confirmed: a failure seen at `processed` may sit on a fork that is dropped.
 *          Before "can no longer land", the signature is looked up once more with the ledger's history. A failed poll is
 *          retried; after a run of them the watch stops as "network", and the record stays to be watched again.
 * Version: 0.2.0 (Sprint 11 review: confirmed statuses only, a history lookup, the entry's sides for the receipt)
 * Sprint:  11 (site: campaign page and entry)
 *
 * Two seconds is the keeper's rebroadcast cadence (proposal §2.6, step 4): the guard's rule, not the cadence, is what
 * prevents a second entry.
 */
import { address, signature as toSignature } from "@solana/kit";
import { decodeEntry, entryAddress, fetchRaw, type SolanaRpc } from "@brot/sdk/read";

import { decidePending, type PendingEntry } from "./retry-guard";

export const POLL_MS = 2_000;
/** Consecutive failed polls before the watch gives up: about 30 seconds of a network that does not answer. */
const MAX_FAILED_POLLS = 15;

export type Sides = { yes: bigint; no: bigint };

/** The wallet's entry in this campaign now, by side; zero before its first entry. */
export async function readSides(rpc: SolanaRpc, campaign: string, baker: string): Promise<Sides> {
  const raw = await fetchRaw(rpc, await entryAddress(address(campaign), address(baker)));
  if (!raw || raw.data.length === 0) return { yes: 0n, no: 0n };
  const entry = decodeEntry(raw);
  return { yes: entry.amountYes, no: entry.amountNo };
}

/** The entry total in this campaign now (both sides). */
export const readEntryTotal = async (rpc: SolanaRpc, campaign: string, baker: string) => {
  const sides = await readSides(rpc, campaign, baker);
  return sides.yes + sides.no;
};

type Found = { err: unknown; confirmationStatus?: string | null } | null;
export type Status = { status: "landed" | "failed" | null; err: unknown };

/** A signature's status as the guard reads it: landed or failed once confirmed; anything earlier is not yet seen. */
export function statusFrom(found: Found): Status {
  if (!found) return { status: null, err: null };
  const done = found.confirmationStatus === "confirmed" || found.confirmationStatus === "finalized";
  if (!done) return { status: null, err: null };
  return found.err ? { status: "failed", err: found.err } : { status: "landed", err: null };
}

async function statusOf(rpc: SolanaRpc, signature: string | null, history = false): Promise<Status> {
  if (!signature) return { status: null, err: null };
  const { value } = await rpc
    .getSignatureStatuses([toSignature(signature)], { searchTransactionHistory: history })
    .send();
  return statusFrom(value[0] as Found);
}

export type Watched = { verdict: "landed" | "failed" | "not-landed"; err: unknown; sides: Sides };

export type WatchOptions = {
  intervalMs?: number;
  signal?: AbortSignal;
  /** Called while waiting, with the blocks left before the deadline. */
  onWait?: (blocksLeft: bigint) => void;
  sleep?: (ms: number) => Promise<void>;
};

const nap = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class WatchStopped extends Error {
  constructor(readonly reason: "aborted" | "network") {
    super(reason === "aborted" ? "the watch was stopped" : "the network did not answer while watching the entry");
    this.name = "WatchStopped";
  }
}

/** Polls until `entry` landed, failed, or can no longer land. */
export async function watchPending(rpc: SolanaRpc, entry: PendingEntry, options: WatchOptions = {}): Promise<Watched> {
  const sleep = options.sleep ?? nap;
  let failed = 0;
  for (;;) {
    if (options.signal?.aborted) throw new WatchStopped("aborted");
    try {
      const [status, height, sides] = await Promise.all([
        statusOf(rpc, entry.signature),
        rpc.getBlockHeight({ commitment: "finalized" }).send(),
        readSides(rpc, entry.campaign, entry.baker),
      ]);
      failed = 0;
      const now = { entryTotal: sides.yes + sides.no, blockHeight: height, status: status.status };
      let verdict = decidePending(entry, now);
      if (verdict === "not-landed" && entry.signature) {
        // Last word before "can no longer land": the node's ledger history, not only its recent statuses.
        const late = await statusOf(rpc, entry.signature, true);
        if (late.status) return { verdict: late.status, err: late.err, sides };
        verdict = decidePending(entry, { ...now, status: late.status });
      }
      if (verdict !== "wait") return { verdict, err: status.err, sides };
      options.onWait?.(BigInt(entry.deadline) - height);
    } catch (error) {
      if (error instanceof WatchStopped) throw error;
      if (++failed >= MAX_FAILED_POLLS) throw new WatchStopped("network");
    }
    await sleep(options.intervalMs ?? POLL_MS);
  }
}
