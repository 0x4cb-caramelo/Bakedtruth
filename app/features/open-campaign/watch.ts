/**
 * Purpose: watching an opening after the wallet, by polling and never a WebSocket (proposal §2.6): the signature's
 *          status (`getSignatureStatuses`), the finalized block height and the campaign at the guard's id, every two
 *          seconds, until the guard's rule (retry-guard.ts) says it landed, failed or can no longer land. A landed
 *          opening with a signature is then followed to `finalized` before the box links `/c/{id}` as final (Sprint 19
 *          DoD). A failure is read from the landed transaction: a retry refused as `AlreadyInitialized` by a campaign
 *          this wallet opened is the first attempt landing, not a failure.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { signature as toSignature } from "@solana/kit";
import { decodeCampaign, type SolanaRpc } from "@brot/sdk/read";

import { fromChainError } from "../entry/failures";
import { failedProgram } from "../entry/landed";
import type { KeyValueStore } from "../entry/retry-guard";
import { POLL_MS, statusFrom } from "../entry/watch";
import { readCampaignAt } from "./reads";
import { clearOpening, decideOpening, updateOpening, type PendingOpening } from "./retry-guard";
import type { OpenOutcome, Stage } from "./submit";

const MAX_FAILED_POLLS = 15;
/** How long the box follows a landed opening to `finalized` before it links the page as confirmed only. */
const FINALIZE_POLLS = 45;

export class WatchStopped extends Error {
  constructor(readonly reason: "aborted" | "network") {
    super(reason === "aborted" ? "the watch was stopped" : "the network did not answer while watching the opening");
    this.name = "WatchStopped";
  }
}

export type OpeningWatchOptions = {
  intervalMs?: number;
  signal?: AbortSignal;
  onWait?: (blocksLeft: bigint) => void;
  onStage?: (stage: Stage) => void;
  sleep?: (ms: number) => Promise<void>;
};

const nap = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Found = { err: unknown; confirmationStatus?: string | null } | null;

async function found(rpc: SolanaRpc, signature: string | null, history = false): Promise<Found> {
  if (!signature) return null;
  const { value } = await rpc
    .getSignatureStatuses([toSignature(signature)], { searchTransactionHistory: history })
    .send();
  return (value[0] as Found) ?? null;
}

/** The creator stored at the record's id, or `null` when no campaign of the program is there. */
async function creatorAt(rpc: SolanaRpc, id: bigint): Promise<string | null> {
  const raw = await readCampaignAt(rpc, id);
  if (!raw || raw.data.length === 0) return null;
  try {
    return decodeCampaign(raw).creator;
  } catch {
    return "another account";
  }
}

async function finalize(rpc: SolanaRpc, signature: string | null, o: OpeningWatchOptions): Promise<boolean> {
  if (!signature) return false;
  o.onStage?.("finalizing");
  for (let i = 0; i < FINALIZE_POLLS; i++) {
    if (o.signal?.aborted) throw new WatchStopped("aborted");
    const status = await found(rpc, signature).catch(() => null);
    if (status?.confirmationStatus === "finalized") return true;
    await (o.sleep ?? nap)(o.intervalMs ?? POLL_MS);
  }
  return false;
}

/** Polls until the record's opening is decided, keeping or clearing the record by the guard's rule. */
export async function watchOpening(
  rpc: SolanaRpc,
  record: PendingOpening,
  store: KeyValueStore | null,
  o: OpeningWatchOptions = {},
): Promise<OpenOutcome> {
  const id = BigInt(record.id);
  let failed = 0;
  for (;;) {
    if (o.signal?.aborted) throw new WatchStopped("aborted");
    try {
      const [status, height, creator] = await Promise.all([
        found(rpc, record.signature),
        rpc.getBlockHeight({ commitment: "finalized" }).send(),
        creatorAt(rpc, id),
      ]);
      failed = 0;
      let seen = statusFrom(status);
      let verdict = decideOpening(record, { campaignCreator: creator, blockHeight: height, status: seen.status });
      if (verdict === "not-landed" && record.signature) {
        seen = statusFrom(await found(rpc, record.signature, true));
        verdict = decideOpening(record, { campaignCreator: creator, blockHeight: height, status: seen.status });
      }
      if (verdict === "landed") {
        clearOpening(store, record.creator);
        if (seen.status === "failed") return { kind: "already", id };
        return { kind: "opened", id, signature: record.signature, finalized: await finalize(rpc, record.signature, o) };
      }
      if (verdict === "taken") {
        clearOpening(store, record.creator);
        return { kind: "taken", id };
      }
      if (verdict === "failed") {
        const program = record.signature ? await failedProgram(rpc, record.signature, seen.err) : null;
        updateOpening(store, { ...record, state: "expired" });
        return {
          kind: "failed",
          failure: fromChainError(seen.err, false, program),
          signature: record.signature,
          cost: "fee",
        };
      }
      if (verdict === "not-landed") {
        updateOpening(store, { ...record, state: "expired" });
        return { kind: "not-landed", id, cost: record.signature ? "nothing" : "unknown" };
      }
      o.onWait?.(BigInt(record.deadline) - height);
    } catch (error) {
      if (error instanceof WatchStopped) throw error;
      if (++failed >= MAX_FAILED_POLLS) throw new WatchStopped("network");
    }
    await (o.sleep ?? nap)(o.intervalMs ?? POLL_MS);
  }
}
