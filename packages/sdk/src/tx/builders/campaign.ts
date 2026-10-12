/**
 * Purpose: the instructions of a campaign's open life, built by the Codama client with every program
 *          address derived here: opening (`user_open_campaign`), joining (`user_join_campaign`) and
 *          resolving (`resolve_campaign`); and the random campaign id the retry guard needs (T17).
 * Version: 0.1.1 (the sixth kind: a graduation opening carries its pool's config after the nine slots)
 * Sprint:  05 (SDK)
 *
 * A builder checks nothing a program rule decides: ../../read/validate/open-campaign.ts mirrors the
 * opening's rules for the preview, and the program decides (A-10).
 */
import { AccountRole, type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import {
  getResolveCampaignInstruction,
  getUserJoinCampaignInstruction,
  getUserOpenCampaignInstruction,
} from "../../idl/generated/instructions";
import { Direction, ReaderKind, SOL_USD_ACCOUNT, Side } from "../../read/constants";
import { hexToBytes } from "../../read/bytes";
import {
  campaignAddress,
  configAddress,
  entryAddress,
  joinAddress,
  sponsoredPriceAddress,
  vaultAddress,
} from "../../read/pdas";

/** The arguments of an opening (`OpenCampaignArgs`); the price-only and epoch-only fields default to zero. */
export type OpenCampaignArgs = {
  /** Drawn once with `randomCampaignId` and saved before signing: a retry reuses it (T17, A-9). */
  id: bigint;
  kind: ReaderKind;
  direction?: Direction;
  /** Price kind: the Pyth feed id (32 bytes or 64 hex characters); zero for the other kinds. */
  feedId?: Uint8Array | string;
  target: bigint;
  deadlineAt: bigint;
  /** Whole US$: at least `opening_fee_usd` for any wallet; 0 for a team key that adds no prize. */
  openingUsd: bigint;
  /** The most lamports the creator accepts to pay (T25); only what moves into the vault, rents apart. */
  maxLamports: bigint;
  /** Epoch kinds: the measured epoch; 0 for the others. */
  epoch?: bigint;
  /** `GlobalConfig.params_version` as read for the preview. */
  expectedParamsVersion: number;
};

const feedBytes = (feedId: Uint8Array | string | undefined) =>
  feedId === undefined ? new Uint8Array(32) : typeof feedId === "string" ? hexToBytes(feedId) : feedId;

/**
 * `user_open_campaign`. The metric account defaults to the feed's sponsored account for the price
 * kind, the only one the program accepts there; the other kinds must name theirs. `DbcGraduated`
 * also passes its pool's `PoolConfig`, read-only, after the nine listed accounts; no other kind does.
 */
export async function buildOpenCampaign(a: {
  creator: TransactionSigner;
  args: OpenCampaignArgs;
  metricAccount?: Address;
  curveConfig?: Address;
}): Promise<Instruction> {
  const feedId = feedBytes(a.args.feedId);
  if (feedId.length !== 32) throw new RangeError("feedId must be 32 bytes");
  const metricAccount =
    a.metricAccount ?? (a.args.kind === ReaderKind.PriceTouch ? await sponsoredPriceAddress(feedId) : undefined);
  if (!metricAccount) throw new RangeError("this kind needs its metric account");
  const graduation = a.args.kind === ReaderKind.DbcGraduated;
  if (graduation !== (a.curveConfig !== undefined)) throw new RangeError("only DbcGraduated takes a curve config");
  const campaign = await campaignAddress(a.args.id);
  const ix = getUserOpenCampaignInstruction({
    creator: a.creator,
    config: await configAddress(),
    campaign,
    vault: await vaultAddress(campaign),
    metricAccount,
    solUsdPrice: SOL_USD_ACCOUNT,
    id: a.args.id,
    kind: a.args.kind,
    direction: a.args.direction ?? Direction.Above,
    feedId,
    target: a.args.target,
    deadlineAt: a.args.deadlineAt,
    openingUsd: a.args.openingUsd,
    maxLamports: a.args.maxLamports,
    epoch: a.args.epoch ?? 0n,
    expectedParamsVersion: a.args.expectedParamsVersion,
  });
  if (!a.curveConfig) return ix;
  return { ...ix, accounts: [...ix.accounts, { address: a.curveConfig, role: AccountRole.READONLY }] };
}

/** `user_join_campaign`. `joinIndex` is the baker's `join_count` before this join (0 for the first). */
export async function buildJoinCampaign(a: {
  baker: TransactionSigner;
  campaign: Address;
  /** The campaign's stored `metric_account`. */
  metricAccount: Address;
  side: Side;
  amount: bigint;
  /** The least return, in bps of the amount, the baker accepts (the program refuses below it). */
  minReturnBps: number;
  /** The baker's entry total before this join: the retry guard (A-9). */
  expectedEntryTotal: bigint;
  joinIndex: number;
}): Promise<Instruction> {
  return getUserJoinCampaignInstruction({
    baker: a.baker,
    config: await configAddress(),
    campaign: a.campaign,
    vault: await vaultAddress(a.campaign),
    entry: await entryAddress(a.campaign, a.baker.address),
    metricAccount: a.metricAccount,
    join: await joinAddress(a.campaign, a.baker.address, a.joinIndex),
    side: a.side,
    amount: a.amount,
    minReturnBps: a.minReturnBps,
    expectedEntryTotal: a.expectedEntryTotal,
  });
}

/** `resolve_campaign`: any wallet, top level only. The price kind's YES proof defaults to the metric account. */
export function buildResolveCampaign(a: { campaign: Address; metricAccount: Address; proofAccount?: Address }) {
  return getResolveCampaignInstruction({
    campaign: a.campaign,
    metricAccount: a.metricAccount,
    proofAccount: a.proofAccount ?? a.metricAccount,
  });
}

/**
 * A random u64 campaign id (T17): draw it once, save it, and reuse it on every retry, so a repeated
 * opening fails on the existing account instead of paying twice. Needs `crypto.getRandomValues`,
 * which React Native must polyfill.
 */
export function randomCampaignId(): bigint {
  const webCrypto = (globalThis as { crypto?: { getRandomValues?: (bytes: Uint8Array) => Uint8Array } }).crypto;
  if (!webCrypto?.getRandomValues) throw new Error("crypto.getRandomValues is missing: polyfill it on this runtime");
  const bytes = webCrypto.getRandomValues(new Uint8Array(8));
  return bytes.reduce((value, byte, i) => value | (BigInt(byte) << BigInt(8 * i)), 0n);
}
