/**
 * Purpose: A-3 for an opening: re-read the config, the SOL/USD price account, the metric account, the
 *          campaign's address and the chain's clock; quote the payment and its `max_lamports`; check every rule
 *          of TP 3.4.10 with `validateOpenCampaign`, in the program's order; then build, summarise the very bytes
 *          the wallet signs, simulate, and show the whole debit (the payment, the two rents, the network fee)
 *          before the wallet. `ok` only when all of it passed.
 * Version: 0.3.0 (Sprint 11: A-8, the deploy a client was built for is checked first when it names one)
 * Sprint:  05 (SDK)
 *
 * The opening's id is drawn here when not given and returned: the client saves it before signing and reuses
 * it on a retry (T17, A-9). A quote the price refuses (a stale SOL/USD account, say) does not stop the checks:
 * they run with no payment bound and return the program's first refusal, which may come from an earlier row.
 */
import { compileTransaction, type Address, type Transaction, type TransactionSigner } from "@solana/kit";

import { ACCOUNT_LEN, Direction, ReaderKind, SOL_USD_ACCOUNT } from "../read/constants";
import { decodeGlobalConfig, isTeamKey } from "../read/accounts";
import { hexToBytes } from "../read/bytes";
import { isRefusal } from "../read/errors";
import type { FeedCluster } from "../read/feeds";
import { U64_MAX } from "../read/math/integers";
import type { ScheduleConstants } from "../read/math/schedule";
import { campaignAddress, configAddress, sponsoredPriceAddress, vaultAddress } from "../read/pdas";
import { assertDeploy } from "../read/program-data";
import { openingDebit, openingQuote, type OpeningDebit, type OpeningQuote } from "../read/quote";
import { fetchRaw, readChainTime, readEpochSchedule, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { validateOpenCampaign, type OpenCampaignCheck } from "../read/validate/open-campaign";
import { buildOpenCampaign, randomCampaignId } from "./builders/campaign";
import { messageFor } from "./message";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { summarizeMessage, type MessageSummary } from "./summary";

/** What a creator chooses; the fees, the share, the price and the template are the program's. */
export type OpeningChoice = {
  kind: ReaderKind;
  direction?: Direction;
  feedId?: Uint8Array | string;
  target: bigint;
  deadlineAt: bigint;
  epoch?: bigint;
  /** The account the kind reads; derived for the price kind. */
  metricAccount?: Address;
  /** Whole US$; 0 for a team key that opens free. */
  openingUsd: bigint;
};

type CheckedOpening = Extract<OpenCampaignCheck, { ok: true }>;

export type PreparedOpening =
  | { ok: false; stage: "check"; id: bigint; check: Extract<OpenCampaignCheck, { ok: false }> }
  | {
      ok: false;
      stage: "simulation";
      id: bigint;
      check: CheckedOpening;
      simulation: Simulation;
      summary: MessageSummary;
    }
  | {
      ok: true;
      stage: "ready";
      /** Save it before signing; a retry must reuse it. */
      id: bigint;
      check: CheckedOpening;
      maxLamports: bigint;
      message: ReadyMessage;
      /** The compiled, unsigned transaction: exactly the bytes `summary` describes. */
      transaction: Transaction;
      simulation: Simulation;
      summary: MessageSummary;
      debit: OpeningDebit;
    };

const read = async (rpc: SolanaRpc, at: Address) => ({ at, account: await fetchRaw(rpc, at) });

export async function prepareOpenCampaign(a: {
  rpc: SolanaRpc;
  creator: TransactionSigner;
  choice: OpeningChoice;
  id?: bigint;
  marginBps?: number;
  /** The target cluster's build: its feed list, whether `StakeAtLeast` opens, its schedule (drill or real). */
  build?: { feeds?: FeedCluster; stakeAtLeastOpens?: boolean; schedule?: ScheduleConstants };
  voteStake?: bigint | null;
  /** A-8: the program deploy this client was built for (`null`: none known); checked first when given. */
  deploySlot?: bigint | null;
}): Promise<PreparedOpening> {
  if (a.deploySlot !== undefined) await assertDeploy(a.rpc, a.deploySlot);
  const id = a.id ?? randomCampaignId();
  const { choice, rpc } = a;
  const feedId =
    choice.feedId === undefined
      ? new Uint8Array(32)
      : typeof choice.feedId === "string"
        ? hexToBytes(choice.feedId)
        : choice.feedId;
  const metricAddress = choice.metricAccount ?? (await sponsoredPriceAddress(feedId));
  const campaign = await campaignAddress(id);
  const [config, solUsd, metric, campaignAccount, vaultAccount] = await Promise.all([
    read(rpc, await configAddress()),
    read(rpc, SOL_USD_ACCOUNT),
    read(rpc, metricAddress),
    read(rpc, campaign),
    read(rpc, await vaultAddress(campaign)),
  ]);
  if (!config.account) throw new Error("the program's config does not exist on this cluster");
  const decoded = decodeGlobalConfig(config.account);
  const [clock, epochSchedule] = await Promise.all([readChainTime(rpc), readEpochSchedule(rpc)]);
  const isTeam = isTeamKey(decoded, a.creator.address);
  let quote: OpeningQuote | null = null;
  let quoteRefused = false;
  if (choice.openingUsd > 0n && solUsd.account) {
    try {
      const params = decoded.params;
      quote = openingQuote({
        params,
        openingUsd: choice.openingUsd,
        solUsd: solUsd.account,
        clock,
        marginBps: a.marginBps,
      });
    } catch (error) {
      if (!isRefusal(error)) throw error;
      quoteRefused = true;
    }
  }
  const args = {
    id,
    kind: choice.kind,
    direction: choice.direction ?? Direction.Above,
    feedId,
    target: choice.target,
    deadlineAt: choice.deadlineAt,
    openingUsd: choice.openingUsd,
    maxLamports: quote?.maxLamports ?? (quoteRefused ? U64_MAX : 0n),
    epoch: choice.epoch ?? 0n,
    expectedParamsVersion: decoded.paramsVersion,
  };
  const shape = (x: { account: { owner: string; data: Uint8Array } | null }) =>
    x.account ? { owner: x.account.owner, dataLength: x.account.data.length } : null;
  const check = await validateOpenCampaign({
    signer: a.creator.address,
    args,
    config: decoded,
    clock,
    metricAddress,
    metric: metric.account,
    solUsd: solUsd.account,
    campaignAccount: shape(campaignAccount),
    vaultAccount: shape(vaultAccount),
    build: a.build,
    epochSchedule,
    voteStake: a.voteStake ?? null,
  });
  if (!check.ok) return { ok: false, stage: "check", id, check };
  if (quoteRefused) throw new Error("the quote refused an opening the checks accept: nothing was built");
  const ix = await buildOpenCampaign({ creator: a.creator, args, metricAccount: metricAddress });
  const message = await messageFor(rpc, a.creator, ix);
  const transaction = compileTransaction(message);
  const p = decoded.params;
  const context = {
    priceExponent: choice.kind === ReaderKind.PriceTouch ? check.priceExponent : undefined,
    terms: { version: decoded.paramsVersion, ...p, minEntryLamports: BigInt(p.minEntryLamports) },
  };
  const summary = summarizeMessage(transaction.messageBytes, { signer: a.creator.address, context });
  if (!summary.trusted)
    throw new Error(`the SDK built an opening its summary does not trust: ${summary.lines.join(" | ")}`);
  const simulation = await simulate(rpc, message);
  if (!simulation.ok) return { ok: false, stage: "simulation", id, check, simulation, summary };
  const debit = openingDebit({
    payment: check.payment.paid,
    maxPayment: isTeam && choice.openingUsd === 0n ? 0n : args.maxLamports,
    campaignRent: await rentExemptMinimum(rpc, ACCOUNT_LEN.campaign),
    vaultRent: await rentExemptMinimum(rpc, ACCOUNT_LEN.vault),
    networkFee: summary.networkFeeAtMost,
  });
  return {
    ok: true,
    stage: "ready",
    id,
    check,
    maxLamports: args.maxLamports,
    message,
    transaction,
    simulation,
    summary,
    debit,
  };
}
