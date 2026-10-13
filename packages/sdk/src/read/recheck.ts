/**
 * Purpose: `recheck(campaign, rpcUrl)` (BR-23, "Anyone can re-check. Same account, same answer"): through
 *          any RPC the caller chooses, read the campaign, then the very account and field the program read
 *          to resolve it, and return that value beside the value the program recorded (`observed_value`).
 * Version: 0.1.2 (the sixth kind: a DBC curve's stamp against the deadline)
 * Sprint:  05 (SDK)
 *
 * What a later read can show depends on the kind (TP 3.4.6, 3.4.8): a burn only lowers a revoked mint's
 * supply and locked liquidity only grows, so a later read may move past the recorded value with the
 * outcome still holding (`consistent` says so: a supply at or below the record, locked liquidity at or
 * above it; a DBC curve stamped by the deadline for a YES and not for a NO, its quote reserve free to
 * move at migration; elsewhere it equals `matches`); a stake pool keeps the measured epoch's snapshot
 * until its next epoch's first update; a price account is overwritten by newer updates, so the YES proof
 * or the sponsored reading is found through the `CampaignResolved` event and compared only while the
 * account still holds that update. When a later read cannot show the recorded value, `matches` is `null`
 * and `note` says why.
 *
 * Trust: the campaign, the account and the event all come through the RPC named, so `matches` is no proof
 * against that RPC; whoever doubts it rechecks through another. Keep the URL on the person's side: a service
 * that took it from a request would fetch whatever it was told. A malformed answer is skipped, never thrown;
 * the event search reads newest first, a page at a time, up to 10,000 signatures, and stops at the first find.
 */
import { address, type Address, type Signature } from "@solana/kit";

import { decodeCampaign, type Campaign } from "./accounts";
import { bytesToHex } from "./bytes";
import { Outcome, ReaderKind, VoidReason } from "./constants";
import { readLockedLiquidity, readMint, readStakePool } from "./chain/accounts";
import { curveGraduated, readCurvePool } from "./chain/dbc";
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
  /** The later read agrees with the record, given the only way the field can move; `null` as for `matches`. */
  consistent: boolean | null;
  note: string;
  asOf: ChainTime;
};

/** How the event search pages: signatures per page, and the most it reads. */
export type EventSearch = { pageSize?: number; maxSignatures?: number };

type Resolved = { readAccount: string; publishTime: bigint; postedSlot: bigint; seq: bigint };

async function resolvedIn(rpc: SolanaRpc, signature: Signature, campaign: Address): Promise<Resolved | null> {
  try {
    const options = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "confirmed" } as const;
    const tx = await rpc.getTransaction(signature, options).send();
    const events = tx ? decodeTransactionEvents(tx as unknown as RpcTransaction) : [];
    const found = events.find((e) => e.name === "CampaignResolved" && e.data.campaign === campaign);
    return found?.name === "CampaignResolved" ? { ...found.data } : null;
  } catch {
    return null;
  }
}

/** The `CampaignResolved` of `campaign` found through `rpc` (the evidence of a price resolution), newest first. */
export async function findResolvedEvent(rpc: SolanaRpc, campaign: Address, search: EventSearch = {}) {
  const pageSize = search.pageSize ?? 1_000;
  const most = search.maxSignatures ?? 10_000;
  let before: Signature | undefined;
  for (let read = 0; read < most;) {
    const page = await rpc
      .getSignaturesForAddress(campaign, { limit: pageSize, before, commitment: "confirmed" })
      .send()
      .catch(() => null);
    if (!Array.isArray(page) || page.length === 0) return null;
    for (const { signature, err } of page.slice(0, pageSize)) {
      if (err !== null) continue;
      const found = await resolvedIn(rpc, signature, campaign);
      if (found) return found;
    }
    read += Math.min(page.length, pageSize);
    if (page.length < pageSize) return null;
    before = page[pageSize - 1].signature;
  }
  return null;
}

const result = (c: Campaign, at: Address, chain: ChainTime) =>
  ({ campaign: at, kind: c.kind, outcome: c.outcome, recorded: c.observedValue, asOf: chain }) as const;

/** `read()`, or `null` when the account no longer reads as the kind expects. */
function attempt<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

/** Re-reads what the program read to resolve `campaign`, through `rpcUrl`. */
export async function recheck(campaign: Address | string, rpcUrl: string, search: EventSearch = {}): Promise<Recheck> {
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
    return { ...base, account: metric, field: "none", reread: null, matches: null, consistent: null, note };
  }
  const read = await fetchRaw(rpc, metric);
  const compare = (reread: bigint | null, field: string, note: string, account: string = metric, moves = "") => {
    const matches = reread === null ? null : reread === c.observedValue;
    const consistent =
      reread === null
        ? null
        : moves === "down"
          ? reread <= c.observedValue
          : moves === "up"
            ? reread >= c.observedValue
            : matches;
    return { ...base, account, field, reread, matches, consistent, note } satisfies Recheck;
  };
  switch (c.kind) {
    case ReaderKind.SupplyAtMost: {
      const supply = read ? attempt(() => readMint(read.owner, read.data).supply) : null;
      return compare(supply, "supply", "a burn only lowers the supply", metric, "down");
    }
    case ReaderKind.DammV2LockedAtLeast: {
      const locked = read ? attempt(() => readLockedLiquidity(read.owner, read.data)) : null;
      return compare(locked, "permanent_lock_liquidity", "locked liquidity only grows", metric, "up");
    }
    case ReaderKind.DbcGraduated: {
      const pool = read ? attempt(() => readCurvePool(read.owner, read.data)) : null;
      if (!pool) return compare(null, "quote_reserve", "the pool no longer reads as a DBC pool");
      const stamp = pool.finishCurveTimestamp;
      const inTime = curveGraduated(pool) && stamp !== 0n && stamp <= c.deadlineAt;
      const note = curveGraduated(pool)
        ? `the curve completed at ${stamp} (stage ${pool.stage}); its quote reserve moves at migration`
        : "the curve has not completed";
      return {
        ...compare(pool.quoteReserve, "quote_reserve", note),
        consistent: inTime === (c.outcome === Outcome.Yes),
      };
    }
    case ReaderKind.StakePoolTvlAtLeast: {
      const pool = read ? attempt(() => readStakePool(read.owner, read.data)) : null;
      if (pool && pool.lastUpdateEpoch === c.epoch) {
        return compare(pool.lastEpochTotalLamports, "last_epoch_total_lamports", "the measured epoch's snapshot");
      }
      return compare(null, "last_epoch_total_lamports", "the pool has written a later epoch's snapshot, or is gone");
    }
    case ReaderKind.PriceTouch: {
      const event = await findResolvedEvent(rpc, at, search);
      if (!event) return compare(null, "price", "no CampaignResolved event found through this RPC");
      const proof = await fetchRaw(rpc, event.readAccount);
      const reading = proof ? attempt(() => readPriceUpdate(proof.owner, proof.data, bytesToHex(c.feedId))) : null;
      const same = reading !== null && reading.publishTime === event.publishTime;
      const note = same ? "the update the program read" : "the account now holds a later update, or is gone";
      return compare(same ? reading.price : null, "price", note, event.readAccount);
    }
    default:
      return compare(null, "epoch stake", "the epoch stake is read by syscall in the measured epoch only");
  }
}
