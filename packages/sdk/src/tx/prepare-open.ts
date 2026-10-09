/**
 * Purpose: A-3 for an opening: re-read the config, the SOL/USD price account, the metric account, the
 *          campaign's address and the chain's clock; quote the payment and its `max_lamports`; check
 *          every rule of TP 3.4.10 with `validateOpenCampaign`; then build, simulate and summarise, with
 *          the whole debit (the payment, the two rents, the network fee) shown before the wallet.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { type Address, type TransactionSigner } from "@solana/kit";

import { ACCOUNT_LEN, Direction, ReaderKind, SOL_USD_ACCOUNT } from "../read/constants";
import { decodeGlobalConfig, isTeamKey } from "../read/accounts";
import { hexToBytes } from "../read/bytes";
import { campaignAddress, configAddress, sponsoredPriceAddress, vaultAddress } from "../read/pdas";
import { openingDebit, openingQuote, type OpeningDebit } from "../read/quote";
import { fetchRaw, readChainTime, readEpochSchedule, rentExemptMinimum, type SolanaRpc } from "../read/rpc";
import { validateOpenCampaign, type OpenCampaignCheck } from "../read/validate/open-campaign";
import type { FeedCluster } from "../read/feeds";
import { buildOpenCampaign, randomCampaignId } from "./builders/campaign";
import { messageFor, networkFee } from "./message";
import { simulate, type ReadyMessage, type Simulation } from "./simulate";
import { summarizeInstructions, type TransactionSummary } from "./summary";

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

export type PreparedOpening =
  | { ok: false; id: bigint; check: Extract<OpenCampaignCheck, { ok: false }> }
  | {
      ok: true;
      /** Save it before signing; a retry must reuse it. */
      id: bigint;
      check: Extract<OpenCampaignCheck, { ok: true }>;
      maxLamports: bigint;
      message: ReadyMessage;
      simulation: Simulation;
      summary: TransactionSummary;
      debit: OpeningDebit;
    };

const read = async (rpc: SolanaRpc, at: Address) => ({ at, account: await fetchRaw(rpc, at) });

export async function prepareOpenCampaign(a: {
  rpc: SolanaRpc;
  creator: TransactionSigner;
  choice: OpeningChoice;
  id?: bigint;
  marginBps?: number;
  build?: { feeds?: FeedCluster; stakeAtLeastOpens?: boolean };
  voteStake?: bigint | null;
}): Promise<PreparedOpening> {
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
  const quote =
    choice.openingUsd > 0n && solUsd.account
      ? openingQuote({
          params: decoded.params,
          openingUsd: choice.openingUsd,
          solUsd: solUsd.account,
          clock,
          marginBps: a.marginBps,
        })
      : null;
  const args = {
    id,
    kind: choice.kind,
    direction: choice.direction ?? Direction.Above,
    feedId,
    target: choice.target,
    deadlineAt: choice.deadlineAt,
    openingUsd: choice.openingUsd,
    maxLamports: quote?.maxLamports ?? 0n,
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
  if (!check.ok) return { ok: false, id, check };
  const ix = await buildOpenCampaign({ creator: a.creator, args, metricAccount: metricAddress });
  const message = await messageFor(rpc, a.creator, ix);
  const debit = openingDebit({
    payment: check.payment.paid,
    maxPayment: isTeam && choice.openingUsd === 0n ? 0n : args.maxLamports,
    campaignRent: await rentExemptMinimum(rpc, ACCOUNT_LEN.campaign),
    vaultRent: await rentExemptMinimum(rpc, ACCOUNT_LEN.vault),
    networkFee: networkFee(),
  });
  const simulation = await simulate(rpc, message);
  return {
    ok: true,
    id,
    check,
    maxLamports: args.maxLamports,
    message,
    simulation,
    summary: summarizeInstructions([ix]),
    debit,
  };
}
