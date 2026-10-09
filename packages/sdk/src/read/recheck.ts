/**
 * Purpose: `recheck(campaign, rpcUrl)` (BR-23, "Anyone can re-check. Same account, same answer"): through
 *          any RPC the caller chooses, read the campaign, then the very account and field the program read
 *          to resolve it, and return that value beside the value the program recorded (`observed_value`).
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * What a later read can show depends on the kind (TP 3.4.6, 3.4.8): a burn only lowers a revoked mint's
 * supply and locked liquidity only grows, so a later read may move past the recorded value with the
 * outcome still holding; a stake pool keeps the measured epoch's snapshot until its next epoch's first
 * update; a price account is overwritten by newer updates, so the YES proof or the sponsored reading is
 * found through the `CampaignResolved` event and compared only while the account still holds that
 * update. When a later read cannot show the recorded value, `matches` is `null` and `note` says why.
 */
import { address, type Address } from "@solana/kit";

import { decodeCampaign, type Campaign } from "./accounts";
import { bytesToHex } from "./bytes";
import { Outcome, ReaderKind, VoidReason } from "./constants";
import { readLockedLiquidity, readMint, readStakePool } from "./chain/accounts";
import { readPriceUpdate } from "./chain/price-update";
import { decodeTransactionEvents, type RpcTransaction } from "./decoder";
import { fetchRaw, readChainTime, rpcFor, type ChainTime, type SolanaRpc } from "./rpc";

export type Recheck = {
  campaign: Address;
  kind: ReaderKind;
  outcome: Outcome;
  /** The account the program read, and the field. */
  account: string;
  field: string;
  /** What the program recorded, and what the account holds now through this RPC (`null`: not readable now). */
  recorded: bigint;
  reread: bigint | null;
  /** `reread === recorded`, or `null` when a later read cannot show the recorded value. */
  matches: boolean | null;
  note: string;
  asOf: ChainTime;
};

/** The latest `CampaignResolved` of `campaign` found through `rpc` (the evidence of a price resolution). */
export async function findResolvedEvent(rpc: SolanaRpc, campaign: Address) {
  const signatures = await rpc.getSignaturesForAddress(campaign, { limit: 1_000, commitment: "confirmed" }).send();
  let latest: { readAccount: string; publishTime: bigint; postedSlot: bigint; seq: bigint } | null = null;
  for (const { signature, err } of signatures) {
    if (err !== null) continue;
    const tx = await rpc
      .getTransaction(signature, { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" })
      .send();
    for (const event of tx ? decodeTransactionEvents(tx as unknown as RpcTransaction) : []) {
      if (event.name !== "CampaignResolved" || event.data.campaign !== campaign) continue;
      if (!latest || event.data.seq > latest.seq) latest = { ...event.data };
    }
  }
  return latest;
}

const result = (c: Campaign, at: Address, chain: ChainTime) =>
  ({ campaign: at, kind: c.kind, outcome: c.outcome, recorded: c.observedValue, asOf: chain }) as const;

/** Re-reads what the program read to resolve `campaign`, through `rpcUrl`. */
export async function recheck(campaign: Address | string, rpcUrl: string): Promise<Recheck> {
  const rpc = rpcFor(rpcUrl);
  const at = address(campaign);
  const raw = await fetchRaw(rpc, at);
  if (!raw) throw new Error(`no campaign at ${at} (closed campaigns are re-checked from their events)`);
  const c = decodeCampaign({ owner: raw.owner, data: raw.data });
  if (c.outcome === Outcome.Unresolved) throw new Error("the campaign is not resolved yet");
  const chain = await readChainTime(rpc);
  const base = result(c, at, chain);
  const metric = c.metricAccount;
  if (c.outcome === Outcome.Void && c.voidReason !== VoidReason.StaleFeed) {
    const note = `voided (${VoidReason[c.voidReason]}): nothing was read to record a value`;
    return { ...base, account: metric, field: "none", reread: null, matches: null, note };
  }
  const read = await fetchRaw(rpc, metric);
  const compare = (reread: bigint | null, field: string, note: string, account: string = metric): Recheck => ({
    ...base,
    account,
    field,
    reread,
    matches: reread === null ? null : reread === c.observedValue,
    note,
  });
  switch (c.kind) {
    case ReaderKind.SupplyAtMost:
      return compare(read ? readMint(read.owner, read.data).supply : null, "supply", "a burn only lowers the supply");
    case ReaderKind.DammV2LockedAtLeast: {
      const locked = read ? readLockedLiquidity(read.owner, read.data) : null;
      return compare(locked, "permanent_lock_liquidity", "locked liquidity only grows");
    }
    case ReaderKind.StakePoolTvlAtLeast: {
      const pool = read ? readStakePool(read.owner, read.data) : null;
      if (pool && pool.lastUpdateEpoch === c.epoch) {
        return compare(pool.lastEpochTotalLamports, "last_epoch_total_lamports", "the measured epoch's snapshot");
      }
      return compare(null, "last_epoch_total_lamports", "the pool has written a later epoch's snapshot");
    }
    case ReaderKind.PriceTouch: {
      const event = await findResolvedEvent(rpc, at);
      if (!event) return compare(null, "price", "no CampaignResolved event found through this RPC");
      const proof = await fetchRaw(rpc, event.readAccount);
      const reading = proof ? readPriceUpdate(proof.owner, proof.data, bytesToHex(c.feedId)) : null;
      const same = reading !== null && reading.publishTime === event.publishTime;
      const note = same ? "the update the program read" : "the account now holds a later update";
      return compare(same ? reading.price : null, "price", note, event.readAccount);
    }
    default:
      return compare(null, "epoch stake", "the epoch stake is read by syscall in the measured epoch only");
  }
}
