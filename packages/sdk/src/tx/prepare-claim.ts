/**
 * Purpose: A-3 for the one claim a person ever signs (TP §3.4.5, the reserve path; TP v0.0.1 Q2, answered b): a creator
 *          share the program kept in the vault because paying it would have left the creator's empty wallet below the
 *          rent-exempt minimum. Re-read the campaign and the chain; check it as `settle_creator_share` does; check the
 *          wallet can now take it; build the instruction, whose destination is the creator the program stored;
 *          summarise the very bytes the wallet signs; simulate. `ok` only when all of it passed.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * There is no other claim: every other payout is sent for the baker by any wallet (Q1), and a share not yet sent is
 * not claimable here (`NothingReserved`), so no claim button exists outside the reserve path. A repeated claim cannot
 * pay twice: the program refuses it (`AlreadySettled`) once the reserve is zero. A-8 is checked first.
 */
import { compileTransaction, type Address, type Transaction, type TransactionSigner } from "@solana/kit";

import { decodeCampaign } from "../read/accounts";
import type { BrotErrorName } from "../read/errors";
import { creatorShareStatus } from "../read/math/stored";
import { assertDeploy } from "../read/program-data";
import { fetchRaw, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { Status } from "../read/constants";
import { buildSettleCreatorShare } from "./builders/settlement";
import { messageFor } from "./message";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { summarizeMessage, type MessageSummary } from "./summary";

/**
 * Why a claim cannot be prepared: the program's refusal it would meet; nothing reserved to claim; or a wallet that
 * cannot pay the network fee and stay at the rent-exempt minimum (`WalletBelowMinimum`).
 */
export type ClaimRefusal =
  | Extract<BrotErrorName, "NotFinalized" | "WrongCreator" | "CreatorShareNotDue">
  | "NothingReserved"
  | "WalletBelowMinimum";

export type PreparedClaim =
  | {
      ok: false;
      stage: "check";
      refusal: ClaimRefusal;
      reserved: bigint;
      balance: bigint;
      rentMinimum: bigint;
      /** `WalletBelowMinimum`: the balance the wallet needs (`claimFloor`); `null` for the other refusals. */
      floor: bigint | null;
    }
  | { ok: false; stage: "simulation"; reserved: bigint; simulation: Simulation; summary: MessageSummary }
  | {
      ok: true;
      stage: "ready";
      /** The lamports the program sends to the stored creator. */
      reserved: bigint;
      message: ReadyMessage;
      /** The compiled, unsigned transaction: exactly the bytes `summary` describes. */
      transaction: Transaction;
      simulation: Simulation;
      summary: MessageSummary;
      networkFee: bigint;
    };

/**
 * The lamports the creator's wallet needs before it can claim: it pays the network fee and must stay at the rent-exempt
 * minimum after it (the cluster refuses a fee payer that would drop below it), which also clears the program's own
 * check, that the wallet with the reserve reaches the minimum (`claimable`, `ReserveNotClaimable`).
 */
export const claimFloor = (rentMinimum: bigint, networkFee: bigint): bigint => rentMinimum + networkFee;

/** Prepares `settle_creator_share` for the creator's reserved share, signed and paid by the creator's own wallet. */
export async function prepareClaim(a: {
  rpc: SolanaRpc;
  creator: TransactionSigner;
  campaign: Address;
  /** A-8, as for a join: given, the preparation throws `ProgramUpgraded` unless the program's last deploy is it. */
  deploySlot?: bigint | null;
}): Promise<PreparedClaim> {
  if (a.deploySlot !== undefined) await assertDeploy(a.rpc, a.deploySlot);
  const raw = await fetchRaw(a.rpc, a.campaign);
  if (!raw) throw new Error("the campaign does not exist");
  const c = decodeCampaign(raw);
  const [{ value: balance }, rentMinimum] = await Promise.all([
    a.rpc.getBalance(a.creator.address, { commitment: "confirmed" }).send(),
    rentExemptMinimum(a.rpc, 0),
  ]);
  const share = creatorShareStatus(c);
  const reserved = c.creatorShareReserved;
  const refused = (refusal: ClaimRefusal, floor: bigint | null = null): PreparedClaim => ({
    ok: false,
    stage: "check",
    refusal,
    reserved,
    balance,
    rentMinimum,
    floor,
  });
  // The program's order: finalized, the stored creator, a share due; then the reserve and the wallet.
  if (c.status !== Status.Settling && c.status !== Status.Settled) return refused("NotFinalized");
  if (c.creator !== a.creator.address) return refused("WrongCreator");
  if (share.status === "none") return refused("CreatorShareNotDue");
  if (share.status !== "reserved") return refused("NothingReserved");

  const ix = await buildSettleCreatorShare({ campaign: a.campaign, creator: c.creator });
  const message = await messageFor(a.rpc, a.creator, ix);
  const transaction = compileTransaction(message);
  const context = { campaigns: new Map([[a.campaign as string, c]]) };
  const summary = summarizeMessage(transaction.messageBytes, { signer: a.creator.address, context });
  if (!summary.trusted) {
    throw new Error(`the SDK built a claim its summary does not trust: ${summary.lines.join(" | ")}`);
  }
  const floor = claimFloor(rentMinimum, summary.networkFeeAtMost);
  if (balance < floor) return refused("WalletBelowMinimum", floor);
  const simulation = await simulate(a.rpc, message);
  if (!simulation.ok) return { ok: false, stage: "simulation", reserved, simulation, summary };
  return {
    ok: true,
    stage: "ready",
    reserved,
    message,
    transaction,
    simulation,
    summary,
    networkFee: summary.networkFeeAtMost,
  };
}
