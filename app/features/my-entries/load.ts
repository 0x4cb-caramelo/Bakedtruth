/**
 * Purpose: what "my entries" reads from the chain (Sprint 12 DoD: open entries come from the chain): for every campaign
 *          the wallet may be in (the read API's list, and every campaign its history names), the `Campaign` and the
 *          wallet's `Entry` at its PDA, the account the campaign reads while entries may still be open (the join lock,
 *          BR-06), and the chain's clock, so the public state is the SDK's against chain time (A-7). A campaign whose
 *          account is gone was closed after every payout; what it paid is in the wallet's events.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 * `getMultipleAccounts` takes at most 100 keys: two per campaign, so 50 campaigns a call.
 */
import { address } from "@solana/kit";
import {
  AccountRefused,
  decodeCampaign,
  decodeEntry,
  entryAddress,
  fetchRawMany,
  isRefusal,
  outcomeKnowable,
  publicState,
  readChainTime,
  Status,
  type Campaign,
  type ChainTime,
  type Entry,
  type FetchedAccount,
  type PublicView,
  type SolanaRpc,
} from "@brot/sdk/read";

export type CampaignRead = {
  address: string;
  /** `null` once the program closed the account (every payout went out). */
  campaign: Campaign | null;
  /** The wallet's `Entry`; `null` before its first entry or once settled (settlement closes it). */
  entry: Entry | null;
  view: PublicView | null;
};

export type MyEntriesData = { chain: ChainTime; campaigns: CampaignRead[] };

const PER_CALL = 50;

const decodeOr = <T>(raw: FetchedAccount | null, decode: (raw: FetchedAccount) => T): T | null => {
  if (!raw || raw.data.length === 0) return null;
  try {
    return decode(raw);
  } catch (error) {
    if (error instanceof AccountRefused) return null;
    throw error;
  }
};

/** The join lock of an open campaign from its metric account; `false` when the account cannot be read that way. */
function knowable(c: Campaign, metric: FetchedAccount | null, chain: ChainTime): boolean {
  if (!metric) return false;
  try {
    return outcomeKnowable(c, metric, chain);
  } catch (error) {
    if (isRefusal(error)) return false;
    throw error;
  }
}

/** Reads `campaigns` (addresses, any order, duplicates dropped) with `wallet`'s entry in each. */
export async function loadMyEntries(
  rpc: SolanaRpc,
  wallet: string,
  campaigns: readonly string[],
): Promise<MyEntriesData> {
  const unique = [...new Set(campaigns)];
  const chain = await readChainTime(rpc);
  const reads: CampaignRead[] = [];
  for (let i = 0; i < unique.length; i += PER_CALL) {
    const slice = unique.slice(i, i + PER_CALL);
    const entries = await Promise.all(slice.map((c) => entryAddress(address(c), address(wallet))));
    const raws = await fetchRawMany(
      rpc,
      slice.flatMap((c, j) => [c, entries[j]]),
    );
    slice.forEach((at, j) => {
      const campaign = decodeOr(raws[2 * j], decodeCampaign);
      const entry = decodeOr(raws[2 * j + 1], decodeEntry);
      reads.push({ address: at, campaign, entry, view: null });
    });
  }
  // The join lock matters only for an open campaign the wallet is in: read those metric accounts.
  const open = reads.filter((r) => r.campaign?.status === Status.Open && r.entry);
  for (let i = 0; i < open.length; i += 100) {
    const slice = open.slice(i, i + 100);
    const metrics = await fetchRawMany(
      rpc,
      slice.map((r) => r.campaign!.metricAccount),
    );
    slice.forEach((r, j) => {
      r.view = publicState(r.campaign!, chain, { outcomeKnowable: knowable(r.campaign!, metrics[j], chain) });
    });
  }
  for (const r of reads) if (r.campaign && !r.view) r.view = publicState(r.campaign, chain);
  return { chain, campaigns: reads };
}
