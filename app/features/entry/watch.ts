/**
 * Purpose: watching an entry after the wallet, by polling and never a WebSocket (proposal §2.6): the signature's status
 *          (`getSignatureStatuses`), the finalized block height (`getBlockHeight`) and the wallet's entry account,
 *          every two seconds, until the retry guard's rule (retry-guard.ts) says the entry landed, failed or can no
 *          longer land. A failed poll is retried; after a run of them the watch stops as "network down", and the
 *          record stays for the next visit.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 *
 * Two seconds is the keeper's rebroadcast cadence (proposal §2.6, step 4): the guard's rule, not the cadence, is what
 * prevents a second entry.
 */
import { address, signature as toSignature } from "@solana/kit";
import { decodeEntry, entryAddress, entryTotal, fetchRaw, type SolanaRpc } from "@brot/sdk/read";

import { decidePending, type PendingEntry } from "./retry-guard";

export const POLL_MS = 2_000;
/** Consecutive failed polls before the watch gives up: about 30 seconds of a network that does not answer. */
const MAX_FAILED_POLLS = 15;

/** The wallet's entry total in this campaign now (both sides); 0 before its first entry. */
export async function readEntryTotal(rpc: SolanaRpc, campaign: string, baker: string): Promise<bigint> {
  const raw = await fetchRaw(rpc, await entryAddress(address(campaign), address(baker)));
  return raw && raw.data.length > 0 ? entryTotal(decodeEntry(raw)) : 0n;
}

type Status = { status: "landed" | "failed" | null; err: unknown };

async function statusOf(rpc: SolanaRpc, signature: string | null): Promise<Status> {
  if (!signature) return { status: null, err: null };
  const { value } = await rpc.getSignatureStatuses([toSignature(signature)]).send();
  const found = value[0];
  if (!found) return { status: null, err: null };
  if (found.err) return { status: "failed", err: found.err };
  const done = found.confirmationStatus === "confirmed" || found.confirmationStatus === "finalized";
  return { status: done ? "landed" : null, err: null };
}

export type Watched = { verdict: "landed" | "failed" | "not-landed"; err: unknown; entryTotal: bigint };

export type WatchOptions = {
  intervalMs?: number;
  signal?: AbortSignal;
  /** Called while waiting, with the blocks left before the transaction expires. */
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
      const [status, height, total] = await Promise.all([
        statusOf(rpc, entry.signature),
        rpc.getBlockHeight({ commitment: "finalized" }).send(),
        readEntryTotal(rpc, entry.campaign, entry.baker),
      ]);
      failed = 0;
      const verdict = decidePending(entry, { entryTotal: total, blockHeight: height, status: status.status });
      if (verdict !== "wait") return { verdict, err: status.err, entryTotal: total };
      options.onWait?.(BigInt(entry.lastValidBlockHeight) - height);
    } catch (error) {
      if (error instanceof WatchStopped) throw error;
      if (++failed >= MAX_FAILED_POLLS) throw new WatchStopped("network");
    }
    await sleep(options.intervalMs ?? POLL_MS);
  }
}
