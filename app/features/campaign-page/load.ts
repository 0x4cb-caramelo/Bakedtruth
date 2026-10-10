/**
 * Purpose: what the campaign page reads, through the SDK over RPC (the read API has no account bytes, no entries and no
 *          metric reading): the campaign at the route's id, the config (the pause), the chain's clock (A-7), the
 *          account the campaign reads, the connected wallet's `Entry`, and the creator's own `Entry` (BR-26's flag).
 *          The public state is the SDK's, against chain time, with the join lock read from the metric account.
 * Version: 0.2.0 (Sprint 12: whether a missing campaign was closed)
 * Sprint:  11 (site: campaign page and entry); 12
 *
 * Two round trips: the campaign first (it names the metric account), then the rest in one `getMultipleAccounts`.
 */
import { address, type Address } from "@solana/kit";
import {
  AccountRefused,
  campaignAddress,
  configAddress,
  decodeCampaign,
  decodeEntry,
  decodeGlobalConfig,
  entryAddress,
  fetchRawMany,
  isRefusal,
  outcomeKnowable,
  publicState,
  readChainTime,
  type BrotErrorName,
  type Campaign,
  type ChainTime,
  type Entry,
  type FetchedAccount,
  type GlobalConfig,
  type PublicView,
  type SolanaRpc,
} from "@brot/sdk/read";

import { eventsIn } from "../my-entries/events-in";

export type PageData = {
  address: Address;
  campaign: Campaign;
  config: GlobalConfig;
  chain: ChainTime;
  metric: FetchedAccount | null;
  /** The connected wallet's entry in this campaign; `null` with no wallet or before its first entry. */
  mine: Entry | null;
  /** The creator's own entry, from the creator's wallet (an entry from another wallet cannot be seen). */
  creatorEntry: Entry | null;
  view: PublicView;
  /** The join lock (BR-06): `null` when the metric account could not be read the way the join reads it. */
  knowable: boolean | null;
  /** Why the metric account could not be read the way the join reads it (the reader's refusal), if so. */
  readProblem: BrotErrorName | null;
};

const U64_MAX = 18_446_744_073_709_551_615n;

/** The route's `[id]`: the client-drawn u64 (TP §3.4.1), written in decimal. `null` for anything else. */
export function campaignIdFrom(param: string): bigint | null {
  if (!/^\d{1,20}$/.test(param)) return null;
  const id = BigInt(param);
  return id <= U64_MAX ? id : null;
}

const decodeOrNull = <T>(decode: () => T): T | null => {
  try {
    return decode();
  } catch (error) {
    if (error instanceof AccountRefused) return null;
    throw error;
  }
};

/**
 * Whether the campaign at `id` existed and was closed: no account now, and its address's recent history holds the
 * program's own `CampaignClosed` for it (a stranger's transfer to the address proves nothing). `close_campaign` runs
 * only after every payout, so a closed campaign has paid out; what it paid lives in its events.
 */
export async function campaignClosed(rpc: SolanaRpc, id: bigint): Promise<boolean> {
  const at = await campaignAddress(id);
  const sigs = await rpc.getSignaturesForAddress(at, { limit: 10, commitment: "confirmed" }).send();
  for (const s of sigs) {
    if (s.err !== null) continue;
    const events = await eventsIn(rpc, s.signature as string);
    if (events?.some((e) => e.name === "CampaignClosed" && e.data.campaign === at)) return true;
  }
  return false;
}

/** Reads the page's accounts; `null` when no campaign of this program lives at the id's address. */
export async function loadCampaignPage(rpc: SolanaRpc, id: bigint, wallet: string | null): Promise<PageData | null> {
  const at = await campaignAddress(id);
  const [chain, [campaignRaw, configRaw]] = await Promise.all([
    readChainTime(rpc),
    fetchRawMany(rpc, [at, await configAddress()]),
  ]);
  const campaign = campaignRaw ? decodeOrNull(() => decodeCampaign(campaignRaw)) : null;
  if (!campaign) return null;
  if (!configRaw) throw new Error("the program's config account is missing");
  const config = decodeGlobalConfig(configRaw);
  const mineAt = wallet ? await entryAddress(at, address(wallet)) : null;
  const creatorAt = await entryAddress(at, campaign.creator);
  const [metric, mineRaw, creatorRaw] = await fetchRawMany(rpc, [
    campaign.metricAccount,
    mineAt ?? creatorAt,
    creatorAt,
  ]);
  const entryOf = (raw: FetchedAccount | null) =>
    raw && raw.data.length > 0 ? decodeOrNull(() => decodeEntry(raw)) : null;
  let knowable: boolean | null = null;
  let readProblem: BrotErrorName | null = null;
  if (metric) {
    try {
      knowable = outcomeKnowable(campaign, metric, chain);
    } catch (error) {
      if (!isRefusal(error)) throw error;
      readProblem = error.errorName;
    }
  }
  return {
    address: at,
    campaign,
    config,
    chain,
    metric,
    mine: mineAt ? entryOf(mineRaw) : null,
    creatorEntry: entryOf(creatorRaw),
    view: publicState(campaign, chain, { outcomeKnowable: knowable === true }),
    knowable,
    readProblem,
  };
}
