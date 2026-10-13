/**
 * Purpose: A-3 for a sealed entry (Sprint 15; red team L4): re-read the campaign, the config, the sponsor's entry and
 *          SealedFee, the metric and SOL/USD accounts and the chain's clock through the RPC; quote the charge and its
 *          `max_lamports`; check them with `checkSealedEntry`, in the program's order; build from the checked inputs,
 *          bound to the creation rules' version (read, or a retry's saved one); summarise the signed bytes; simulate;
 *          and show the whole debit (the charge, the rents, the network fee) before the wallet. `ok` only when all of
 *          it passed.
 * Version: 0.1.1 (second red-team pass: a retry keeps the terms approved; SOL/USD read once when it is the metric)
 * Sprint:  15 (lane L15)
 *
 * The retry guard (A-9), as for a join: save `expectedEntryTotal`, `expectedParamsVersion` and `maxLamports` before
 * signing, and pass them back when the answer never comes. An entry that did land makes the retry refuse
 * `EntryTotalMismatch` instead of charging twice; creation rules that moved stop it at the check
 * (`CreationParamsChanged`) instead of signing a split the sponsor never saw; the bound signed never exceeds the one
 * approved. A screen must show the summary again on every retry. A quote the price refuses does not stop the checks:
 * they run with no bound and return the program's first refusal in its order (the pause, say, before the price).
 */
import { compileTransaction, type Address, type Transaction, type TransactionSigner } from "@solana/kit";

import { ACCOUNT_LEN, SOL_USD_ACCOUNT, SYSTEM_PROGRAM_ID, type Side } from "../read/constants";
import { decodeCampaign, decodeEntry, decodeGlobalConfig } from "../read/accounts";
import { isRefusal } from "../read/errors";
import { U32_MAX, U64_MAX } from "../read/math/integers";
import { configAddress, entryAddress, sealedFeeAddress } from "../read/pdas";
import { assertDeploy } from "../read/program-data";
import { fetchRaw, readChainTime, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { sealedEntryQuote, type SealedEntryQuote } from "../read/sealed-quote";
import { checkSealedEntry, type SealedEntryCheck } from "../read/validate/sealed-entry";
import { messageFor } from "./message";
import { MAX_SLIPPAGE_BPS } from "./prepare";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { buildSponsorJoinCampaign } from "./sponsor-join";
import { summarizeMessage, type MessageSummary } from "./summary";

type CheckedSealedEntry = Extract<SealedEntryCheck, { ok: true }>;

/** What leaves the sponsor's wallet: the charge now and at most, the rents (back at settlement), the network fee. */
export type SealedEntryDebit = {
  payment: bigint;
  maxPayment: bigint;
  rents: bigint;
  networkFee: bigint;
  total: bigint;
  maxTotal: bigint;
};

export type PreparedSealedEntry =
  | { ok: false; stage: "check"; check: Extract<SealedEntryCheck, { ok: false }> }
  | { ok: false; stage: "simulation"; check: CheckedSealedEntry; simulation: Simulation; summary: MessageSummary }
  | {
      ok: true;
      stage: "ready";
      check: CheckedSealedEntry;
      /** The entry total the sealed entry is signed against: save it before signing, pass it back on a retry. */
      expectedEntryTotal: bigint;
      /** The creation rules' version it is signed under: the split and the floor the summary shows. */
      expectedParamsVersion: number;
      minReturnBps: number;
      maxLamports: bigint;
      message: ReadyMessage;
      /** The compiled, unsigned transaction: exactly the bytes `summary` describes. */
      transaction: Transaction;
      simulation: Simulation;
      summary: MessageSummary;
      /** The rents are at most these: an address someone funded in advance needs less. */
      debit: SealedEntryDebit;
    };

/** The quote now, or `null` when the price refuses it (the checks then name the program's first refusal). */
function quoteOrNull(quote: () => SealedEntryQuote): SealedEntryQuote | null {
  try {
    return quote();
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}

/**
 * A sealed entry, prepared: `maxLamports` is the charge now plus `marginBps` (default 1%), never above a retry's saved
 * bound, and `minReturnBps` the estimate on the entry part less `slippageBps` of it (default 1%, at most 20%).
 */
export async function prepareSealedEntry(a: {
  rpc: SolanaRpc;
  sponsor: TransactionSigner;
  campaign: Address;
  side: Side;
  entryUsd: bigint;
  slippageBps?: number;
  marginBps?: number;
  /** On a retry, as saved from the first attempt: the entry total, the creation rules' version, the bound. */
  expectedEntryTotal?: bigint;
  expectedParamsVersion?: number;
  maxLamports?: bigint;
  /** A-8: the program deploy this client was built for (`null`: none known); checked first when given. */
  deploySlot?: bigint | null;
}): Promise<PreparedSealedEntry> {
  const slippageBps = a.slippageBps ?? 100;
  if (!Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > MAX_SLIPPAGE_BPS) {
    throw new RangeError(`slippageBps must be an integer from 0 to ${MAX_SLIPPAGE_BPS}`);
  }
  const saved = a.expectedParamsVersion;
  if (saved !== undefined && !(Number.isInteger(saved) && saved >= 0 && saved <= U32_MAX))
    throw new RangeError("expectedParamsVersion must be a u32");
  const ceiling = a.maxLamports ?? U64_MAX;
  if (ceiling < 0n || ceiling > U64_MAX) throw new RangeError("maxLamports must be a u64");
  if (a.deploySlot !== undefined) await assertDeploy(a.rpc, a.deploySlot);
  const [campaignRaw, configRaw, entryRaw, sealedFee, solUsdRaw] = await Promise.all([
    fetchRaw(a.rpc, a.campaign),
    fetchRaw(a.rpc, await configAddress()),
    fetchRaw(a.rpc, await entryAddress(a.campaign, a.sponsor.address)),
    fetchRaw(a.rpc, await sealedFeeAddress(a.campaign, a.sponsor.address)),
    fetchRaw(a.rpc, SOL_USD_ACCOUNT),
  ]);
  if (!campaignRaw || !configRaw) throw new Error("the campaign or the config does not exist");
  const campaign = decodeCampaign(campaignRaw);
  const config = decodeGlobalConfig(configRaw);
  const entry = entryRaw && entryRaw.data.length > 0 ? decodeEntry(entryRaw) : null;
  // A campaign on SOL/USD itself reads one account in both slots: one snapshot serves both reads, as in the program.
  const metric = campaign.metricAccount === SOL_USD_ACCOUNT ? solUsdRaw : await fetchRaw(a.rpc, campaign.metricAccount);
  if (!metric) throw new Error(`the metric account ${campaign.metricAccount} does not exist`);
  const solUsd = solUsdRaw ?? { address: SOL_USD_ACCOUNT, owner: SYSTEM_PROGRAM_ID, data: new Uint8Array() };
  const chain = await readChainTime(a.rpc);
  const params = config.params;
  const quote = quoteOrNull(() =>
    sealedEntryQuote({ params, entryUsd: a.entryUsd, solUsd, clock: chain, marginBps: a.marginBps }),
  );
  const maxLamports = quote && quote.maxLamports < ceiling ? quote.maxLamports : ceiling;
  const signedVersion = saved ?? config.paramsVersion;
  const check = checkSealedEntry({
    campaignAddress: a.campaign,
    campaign,
    config,
    sponsor: a.sponsor.address,
    entry,
    sealedFee,
    metric,
    solUsd,
    chain,
    side: a.side,
    entryUsd: a.entryUsd,
    maxLamports,
    expectedEntryTotal: a.expectedEntryTotal,
    expectedParamsVersion: signedVersion,
  });
  if (!check.ok) return { ok: false, stage: "check", check };
  if (!quote) throw new Error("the quote refused a sealed entry the checks accept: nothing was built");
  const estimate = (check.estimateBps * BigInt(10_000 - slippageBps)) / 10_000n;
  const minReturnBps = Number(estimate > BigInt(U32_MAX) ? BigInt(U32_MAX) : estimate);
  const ix = await buildSponsorJoinCampaign({
    sponsor: a.sponsor,
    campaign: a.campaign,
    metricAccount: campaign.metricAccount,
    side: a.side,
    entryUsd: a.entryUsd,
    maxLamports,
    minReturnBps,
    expectedEntryTotal: check.expectedEntryTotal,
    expectedParamsVersion: signedVersion,
    joinIndex: check.joinIndex,
  });
  const message = await messageFor(a.rpc, a.sponsor, ix);
  const transaction = compileTransaction(message);
  const terms = { version: config.paramsVersion, ...params, minEntryLamports: BigInt(params.minEntryLamports) };
  const context = { campaigns: new Map([[a.campaign as string, campaign]]), terms };
  const summary = summarizeMessage(transaction.messageBytes, { signer: a.sponsor.address, context });
  if (!summary.trusted)
    throw new Error(`the SDK built a sealed entry its summary does not trust: ${summary.lines.join(" | ")}`);
  const simulation = await simulate(a.rpc, message);
  if (!simulation.ok) return { ok: false, stage: "simulation", check, simulation, summary };
  const rent = (size: number) => rentExemptMinimum(a.rpc, size);
  const rents =
    (await rent(ACCOUNT_LEN.join)) +
    (entry ? 0n : await rent(ACCOUNT_LEN.entry)) +
    (check.createsSealedFee ? await rent(ACCOUNT_LEN.sealedFee) : 0n);
  const [fee, paid] = [summary.networkFeeAtMost, check.charge.paid];
  return {
    ok: true,
    stage: "ready",
    check,
    expectedEntryTotal: check.expectedEntryTotal,
    expectedParamsVersion: signedVersion,
    minReturnBps,
    maxLamports,
    message,
    transaction,
    simulation,
    summary,
    debit: {
      payment: paid,
      maxPayment: maxLamports,
      rents,
      networkFee: fee,
      total: paid + rents + fee,
      maxTotal: maxLamports + rents + fee,
    },
  };
}
