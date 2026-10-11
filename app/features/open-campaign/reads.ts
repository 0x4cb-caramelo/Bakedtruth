/**
 * Purpose: what the creation box reads through the site's RPC (the public devnet one until Sprint 08's `/rpc` relay
 *          exists; TP §7.2): the program's config, the chain's clock and epoch schedule, Pyth's sponsored SOL/USD account
 *          (the one the program charges at), each listed feed's sponsored account (row 4), the rents of the two new
 *          accounts, and, for a draft, the account in its slot and whether the campaign's address and its vault are
 *          still free (row 10). Reads only; the SDK's preparation reads all of it again before signing (A-3).
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import type { Address } from "@solana/kit";
import {
  ACCOUNT_LEN,
  bytesToHex,
  campaignAddress,
  configAddress,
  decodeGlobalConfig,
  feedsOf,
  fetchRaw,
  fetchRawMany,
  readChainTime,
  readEpochSchedule,
  rentExemptMinimum,
  SOL_USD_ACCOUNT,
  sponsoredPriceAddress,
  vaultAddress,
  type AccountShape,
  type ChainTime,
  type EpochSchedule,
  type FeedCluster,
  type FetchedAccount,
  type GlobalConfig,
  type SolanaRpc,
} from "@brot/sdk/read";

/** The build the site talks to: devnet's feed list on every cluster but mainnet (programs/brot-markets/src/feeds.rs). */
export const FEED_CLUSTER: FeedCluster = process.env.NEXT_PUBLIC_CLUSTER === "mainnet-beta" ? "mainnet" : "devnet";

export type FeedRead = { hex: string; symbol: string; address: Address; account: FetchedAccount | null };

export type BoxWorld = {
  config: GlobalConfig | null;
  clock: ChainTime;
  epochSchedule: EpochSchedule;
  solUsd: FetchedAccount | null;
  feeds: FeedRead[];
  rents: { campaign: bigint; vault: bigint };
};

let feedAddresses: Promise<{ hex: string; symbol: string; address: Address }[]> | null = null;

/** The listed feeds' sponsored accounts, derived once per page (PDAs of the Pyth push oracle). */
function listedFeeds() {
  feedAddresses ??= Promise.all(
    feedsOf(FEED_CLUSTER).map(async ([hex, symbol]) => ({
      hex,
      symbol: symbol.replace(/^Crypto\./, ""),
      address: await sponsoredPriceAddress(hex),
    })),
  );
  return feedAddresses;
}

let rents: Promise<BoxWorld["rents"]> | null = null;

/** Everything the box reads once per refresh, in three calls and a cached fourth. */
export async function readWorld(rpc: SolanaRpc): Promise<BoxWorld> {
  const feeds = await listedFeeds();
  const [configAt, clock, epochSchedule] = await Promise.all([
    configAddress(),
    readChainTime(rpc),
    readEpochSchedule(rpc),
  ]);
  rents ??= Promise.all([rentExemptMinimum(rpc, ACCOUNT_LEN.campaign), rentExemptMinimum(rpc, ACCOUNT_LEN.vault)])
    .then(([campaign, vault]) => ({ campaign, vault }))
    .catch((error) => {
      rents = null; // asked again on the next refresh, never remembered as failed
      throw error;
    });
  const [accounts, rent] = await Promise.all([
    fetchRawMany(rpc, [configAt, SOL_USD_ACCOUNT, ...feeds.map((f) => f.address)]),
    rents,
  ]);
  const [config, solUsd, ...feedAccounts] = accounts;
  return {
    config: config ? decodeGlobalConfig(config) : null,
    clock,
    epochSchedule,
    solUsd,
    feeds: feeds.map((f, i) => ({ ...f, account: feedAccounts[i] })),
    rents: rent,
  };
}

const shape = (account: FetchedAccount | null): AccountShape =>
  account ? { owner: account.owner, dataLength: account.data.length } : null;

/** The account in the draft's slot, and the campaign's address and vault for `id` as they stand (row 10). */
export async function readDraftAccounts(rpc: SolanaRpc, id: bigint, metric: Address | null) {
  const campaign = await campaignAddress(id);
  const vault = await vaultAddress(campaign);
  const [campaignAccount, vaultAccount, metricAccount] = await fetchRawMany(rpc, [
    campaign,
    vault,
    ...(metric ? [metric] : []),
  ]);
  return {
    campaign: shape(campaignAccount),
    vault: shape(vaultAccount),
    metric: metric ? (metricAccount ?? null) : null,
  };
}

/** The campaign's own account at `id`, for the retry guard (`null`: it does not exist). */
export const readCampaignAt = async (rpc: SolanaRpc, id: bigint) => fetchRaw(rpc, await campaignAddress(id));

/** A feed's hex id as the program stores it, for a match against a stored campaign. */
export const feedHexOf = (feedId: Uint8Array) => bytesToHex(feedId);
