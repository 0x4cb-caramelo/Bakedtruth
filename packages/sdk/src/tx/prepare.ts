/**
 * Purpose: A-3 for the two transactions a person signs: a join and an opening. Each re-reads the accounts
 *          it depends on through the RPC, checks them with the SDK's mirror of the program's rules,
 *          builds the instruction from the checked inputs, simulates the transaction, and summarises it
 *          in deterministic words, with the whole debit (amount, rents, network fee) before the wallet.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * A refusal stops here, named as the program names it; nothing is built. The opening's id is drawn here
 * when not given and returned: the client saves it before signing and reuses it on a retry (T17, A-9).
 */
import { type Address, type TransactionSigner } from "@solana/kit";

import { ACCOUNT_LEN, Side } from "../read/constants";
import { decodeCampaign, decodeEntry, decodeGlobalConfig } from "../read/accounts";
import { configAddress, entryAddress } from "../read/pdas";
import { fetchRaw, readChainTime, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { checkJoin, type JoinCheck } from "../read/validate/join";
import { buildJoinCampaign } from "./builders/campaign";
import { messageFor, networkFee } from "./message";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { summarizeInstructions, type TransactionSummary } from "./summary";

export type PreparedJoin =
  | { ok: false; check: Extract<JoinCheck, { ok: false }> }
  | {
      ok: true;
      check: Extract<JoinCheck, { ok: true }>;
      minReturnBps: number;
      message: ReadyMessage;
      simulation: Simulation;
      summary: TransactionSummary;
      /** What leaves the baker's wallet: the entry, the rents of the join's record (and of the entry, on
       * the first join; both come back at settlement) and the network fee. */
      debit: { amount: bigint; rents: bigint; networkFee: bigint; total: bigint };
    };

/**
 * A join, prepared: `minReturnBps` is the current estimate less `slippageBps` of it (default 1%), so the
 * program refuses the join if the pot moves against the baker by more than that before it lands.
 */
export async function prepareJoin(a: {
  rpc: SolanaRpc;
  baker: TransactionSigner;
  campaign: Address;
  side: Side;
  amount: bigint;
  slippageBps?: number;
}): Promise<PreparedJoin> {
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
  const check = checkJoin({ campaign, config, entry, metric, chain, side: a.side, amount: a.amount });
  if (!check.ok) return { ok: false, check };
  const slippage = BigInt(a.slippageBps ?? 100);
  const minReturnBps = Number((check.estimateBps * (10_000n - slippage)) / 10_000n);
  const ix = await buildJoinCampaign({
    baker: a.baker,
    campaign: a.campaign,
    metricAccount: campaign.metricAccount,
    side: a.side,
    amount: a.amount,
    minReturnBps: Math.min(minReturnBps, 0xffff_ffff),
    expectedEntryTotal: check.expectedEntryTotal,
    joinIndex: check.joinIndex,
  });
  const message = await messageFor(a.rpc, a.baker, ix);
  const joinRent = await rentExemptMinimum(a.rpc, ACCOUNT_LEN.join);
  const rents = joinRent + (entry ? 0n : await rentExemptMinimum(a.rpc, ACCOUNT_LEN.entry));
  const fee = networkFee();
  return {
    ok: true,
    check,
    minReturnBps,
    message,
    simulation: await simulate(a.rpc, message),
    summary: summarizeInstructions([ix]),
    debit: { amount: a.amount, rents, networkFee: fee, total: a.amount + rents + fee },
  };
}
