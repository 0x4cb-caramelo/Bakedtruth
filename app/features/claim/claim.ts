/**
 * Purpose: "Receive" for a reserved creator share (TP §3.4.5, the reserve path), without React: the SDK's A-3
 *          preparation for the connected wallet (`prepareClaim`: A-8's deploy check first, the campaign re-read, the
 *          program's checks, the wallet's floor, the summary of the very bytes, the simulation), the hand-off of those
 *          bytes to the wallet, and a watch by polling (no WebSocket). The destination is the creator the program
 *          stored; the site picks nothing. There is no claim for anything else (Sprint 12 security gate).
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * No retry guard is needed here, unlike a join: a claim that landed leaves nothing reserved, so a second one is
 * refused on-chain (`AlreadySettled`) and the SDK says so before the wallet (`NothingReserved`).
 */
import { address, createNoopSigner, signature as toSignature } from "@solana/kit";
import { VersionedMessage, VersionedTransaction } from "@solana/web3.js";
import { ProgramDataRefused, ProgramUpgraded, type SolanaRpc } from "@brot/sdk/read";
import { prepareClaim, type ClaimRefusal, type PreparedClaim } from "@brot/sdk/tx";

export type ReadyClaim = Extract<PreparedClaim, { ok: true }>;

export type ClaimFailure =
  | ClaimRefusal
  | "programUpgraded"
  | "versionUnknown"
  | "simulationFailed"
  | "refusedInWallet"
  | "walletNoAnswer"
  | "failedOnChain"
  | "notLanded"
  | "network";

export type Prepared = { ok: true; ready: ReadyClaim } | { ok: false; failure: ClaimFailure; floor?: bigint };

/** A-3 for the claim, for `wallet`. A-8: `deploySlot` is the deploy this site was built for. */
export async function prepareReceive(a: {
  rpc: SolanaRpc;
  wallet: string;
  campaign: string;
  deploySlot: bigint | null;
}): Promise<Prepared> {
  let prepared: PreparedClaim;
  try {
    prepared = await prepareClaim({
      rpc: a.rpc,
      // Only names the fee payer: the wallet signs the compiled bytes later; the site never holds a key.
      creator: createNoopSigner(address(a.wallet)),
      campaign: address(a.campaign),
      deploySlot: a.deploySlot,
    });
  } catch (error) {
    if (error instanceof ProgramUpgraded) return { ok: false, failure: "programUpgraded" };
    if (error instanceof ProgramDataRefused) return { ok: false, failure: "versionUnknown" };
    return { ok: false, failure: "network" };
  }
  if (prepared.ok) return { ok: true, ready: prepared };
  if (prepared.stage === "simulation") return { ok: false, failure: "simulationFailed" };
  return { ok: false, failure: prepared.refusal, floor: prepared.floor ?? undefined };
}

/** The transaction the wallet receives: exactly the message bytes the SDK's summary read, unsigned. */
export const claimTransaction = (ready: ReadyClaim): VersionedTransaction =>
  new VersionedTransaction(VersionedMessage.deserialize(new Uint8Array(ready.transaction.messageBytes)));

/** A wallet's refusal (code 4001, or its words): nothing was sent. */
export function refusedInWallet(error: unknown): boolean {
  const e = error as { code?: unknown; message?: unknown; name?: unknown } | null;
  return e?.code === 4001 || /reject|declin|denied|cancel/i.test(`${e?.name ?? ""} ${e?.message ?? ""}`);
}

export type Watched = "landed" | "failedOnChain" | "notLanded";

const nap = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Polls the signature until it is confirmed (landed or failed) or its blockhash can no longer land. */
export async function watchClaim(
  rpc: SolanaRpc,
  signature: string,
  lastValidBlockHeight: bigint,
  options: { intervalMs?: number; sleep?: (ms: number) => Promise<void>; maxFailedPolls?: number } = {},
): Promise<Watched> {
  const sleep = options.sleep ?? nap;
  let failed = 0;
  for (;;) {
    try {
      const [{ value }, height] = await Promise.all([
        rpc.getSignatureStatuses([toSignature(signature)], { searchTransactionHistory: false }).send(),
        rpc.getBlockHeight({ commitment: "finalized" }).send(),
      ]);
      failed = 0;
      const found = value[0];
      const done = found?.confirmationStatus === "confirmed" || found?.confirmationStatus === "finalized";
      if (found && done) return found.err ? "failedOnChain" : "landed";
      if (height > lastValidBlockHeight) {
        const { value: late } = await rpc
          .getSignatureStatuses([toSignature(signature)], { searchTransactionHistory: true })
          .send();
        if (late[0]) return late[0].err ? "failedOnChain" : "landed";
        return "notLanded";
      }
    } catch {
      if (++failed >= (options.maxFailedPolls ?? 15)) throw new Error("network");
    }
    await sleep(options.intervalMs ?? 2_000);
  }
}

/** The blockhash's last valid height of a prepared claim. */
export function lastValidOf(ready: ReadyClaim): bigint {
  const lifetime = ready.message.lifetimeConstraint;
  if (!("lastValidBlockHeight" in lifetime)) throw new Error("a claim without a blockhash lifetime cannot be watched");
  return lifetime.lastValidBlockHeight;
}
