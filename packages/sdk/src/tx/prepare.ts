/**
 * Purpose: A-3 for a join: re-read the campaign, the config, the baker's entry, the metric account and the
 *          chain's clock through the RPC; check them with the SDK's mirror of the program's rules; build the
 *          instruction from the checked inputs; summarise the very bytes the wallet signs; simulate; and show
 *          the whole debit (amount, rents, network fee) before the wallet. `ok` only when all of it passed.
 * Version: 0.3.0 (Sprint 11: A-8, the deploy a client was built for is checked first when it names one)
 * Sprint:  05 (SDK)
 *
 * A refusal stops here, named as the program names it. The retry guard (A-9): the join is signed against the
 * baker's entry total, returned as `expectedEntryTotal`. Save it before signing; when the answer never comes,
 * pass it back on the retry, so a join that did land makes the retry refuse `EntryTotalMismatch` instead of
 * adding a second entry (entries cannot be withdrawn). Left out, the total is read now.
 */
import { compileTransaction, type Address, type Transaction, type TransactionSigner } from "@solana/kit";

import { ACCOUNT_LEN, Side } from "../read/constants";
import { decodeCampaign, decodeEntry, decodeGlobalConfig } from "../read/accounts";
import { U32_MAX } from "../read/math/integers";
import { configAddress, entryAddress } from "../read/pdas";
import { assertDeploy } from "../read/program-data";
import { fetchRaw, readChainTime, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { checkJoin, type JoinCheck } from "../read/validate/join";
import { buildJoinCampaign } from "./builders/campaign";
import { messageFor } from "./message";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { summarizeMessage, type MessageSummary } from "./summary";

/** The most slippage a join accepts: the program refuses it if its return estimate falls 20% or more. */
export const MAX_SLIPPAGE_BPS = 2_000;

type CheckedJoin = Extract<JoinCheck, { ok: true }>;

export type PreparedJoin =
  | { ok: false; stage: "check"; check: Extract<JoinCheck, { ok: false }> }
  | { ok: false; stage: "simulation"; check: CheckedJoin; simulation: Simulation; summary: MessageSummary }
  | {
      ok: true;
      stage: "ready";
      check: CheckedJoin;
      /** The entry total the join is signed against: save it before signing, pass it back on a retry. */
      expectedEntryTotal: bigint;
      minReturnBps: number;
      message: ReadyMessage;
      /** The compiled, unsigned transaction: exactly the bytes `summary` describes. */
      transaction: Transaction;
      simulation: Simulation;
      summary: MessageSummary;
      /** What leaves the baker's wallet: the entry, the rents of the join's record (and of the entry, on
       * the first join; both come back when the campaign settles) and the network fee. */
      debit: { amount: bigint; rents: bigint; networkFee: bigint; total: bigint };
    };

/**
 * A join, prepared: `minReturnBps` is the current estimate less `slippageBps` of it (default 1%, at most
 * 20%), so the program refuses the join if the pot moves against the baker by more than that.
 */
export async function prepareJoin(a: {
  rpc: SolanaRpc;
  baker: TransactionSigner;
  campaign: Address;
  side: Side;
  amount: bigint;
  slippageBps?: number;
  /** On a retry: the `expectedEntryTotal` saved from the first attempt. */
  expectedEntryTotal?: bigint;
  /** A-8: the program deploy (ProgramData's slot) this client was built for; `null` when it knows none. Given, the
   * preparation throws `ProgramUpgraded` unless the program's last deploy is that one. Left out, nothing is checked. */
  deploySlot?: bigint | null;
}): Promise<PreparedJoin> {
  const slippageBps = a.slippageBps ?? 100;
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > MAX_SLIPPAGE_BPS) {
    throw new RangeError(`slippageBps must be an integer from 0 to ${MAX_SLIPPAGE_BPS}`);
  }
  if (a.deploySlot !== undefined) await assertDeploy(a.rpc, a.deploySlot);
  const [campaignRaw, configRaw, entryRaw] = await Promise.all([
    fetchRaw(a.rpc, a.campaign),
    fetchRaw(a.rpc, await configAddress()),
    fetchRaw(a.rpc, await entryAddress(a.campaign, a.baker.address)),
  ]);
  if (!campaignRaw || !configRaw) throw new Error("the campaign or the config does not exist");
  const campaign = decodeCampaign(campaignRaw);
  const entry = entryRaw && entryRaw.data.length > 0 ? decodeEntry(entryRaw) : null;
  const metric = await fetchRaw(a.rpc, campaign.metricAccount);
  if (!metric) throw new Error(`the metric account ${campaign.metricAccount} does not exist`);
  const chain = await readChainTime(a.rpc);
  const config = decodeGlobalConfig(configRaw);
  const input = { campaign, config, entry, metric, chain, side: a.side, amount: a.amount };
  const check = checkJoin({ ...input, expectedEntryTotal: a.expectedEntryTotal });
  if (!check.ok) return { ok: false, stage: "check", check };
  const estimate = (check.estimateBps * BigInt(10_000 - slippageBps)) / 10_000n;
  const minReturnBps = Number(estimate > BigInt(U32_MAX) ? BigInt(U32_MAX) : estimate);
  const ix = await buildJoinCampaign({
    baker: a.baker,
    campaign: a.campaign,
    metricAccount: campaign.metricAccount,
    side: a.side,
    amount: a.amount,
    minReturnBps,
    expectedEntryTotal: check.expectedEntryTotal,
    joinIndex: check.joinIndex,
  });
  const message = await messageFor(a.rpc, a.baker, ix);
  const transaction = compileTransaction(message);
  const context = { campaigns: new Map([[a.campaign as string, campaign]]) };
  const summary = summarizeMessage(transaction.messageBytes, { signer: a.baker.address, context });
  if (!summary.trusted)
    throw new Error(`the SDK built a join its summary does not trust: ${summary.lines.join(" | ")}`);
  const simulation = await simulate(a.rpc, message);
  if (!simulation.ok) return { ok: false, stage: "simulation", check, simulation, summary };
  const joinRent = await rentExemptMinimum(a.rpc, ACCOUNT_LEN.join);
  const rents = joinRent + (entry ? 0n : await rentExemptMinimum(a.rpc, ACCOUNT_LEN.entry));
  const fee = summary.networkFeeAtMost;
  return {
    ok: true,
    stage: "ready",
    check,
    expectedEntryTotal: check.expectedEntryTotal,
    minReturnBps,
    message,
    transaction,
    simulation,
    summary,
    debit: { amount: a.amount, rents, networkFee: fee, total: a.amount + rents + fee },
  };
}
