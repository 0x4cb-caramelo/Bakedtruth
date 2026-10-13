/**
 * Purpose: the program's accounts as plain values for the keeper's pure tests: a campaign, an entry and a config
 *          decoded from zeroed bytes by the SDK's own decoders (every field present, every number zero, every
 *          address the zero address), with the fields a test names set on top. No cluster, no LiteSVM.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the keeper's pure tests)
 */
import { address, type Address } from "@solana/kit";
import {
  ACCOUNT_LEN,
  getCampaignDecoder,
  getEntryDecoder,
  getGlobalConfigDecoder,
  type Campaign,
  type Entry,
  type GlobalConfig,
} from "@brot/sdk/read";

import type { EntryAt, OpenCampaign } from "../../src/campaigns";

/** A distinct, valid address per small number (the n-th of a fixed list of base58 keys). */
export const KEY = (n: number): Address => address(`${"1".repeat(31)}${"23456789ABCDEFGHJKLMNPQRSTUVWXYZ"[n]}`);

export const campaignWith = (over: Partial<Campaign> = {}): Campaign => ({
  ...getCampaignDecoder().decode(new Uint8Array(ACCOUNT_LEN.campaign)),
  ...over,
});

export const entryWith = (over: Partial<Entry> = {}): Entry => ({
  ...getEntryDecoder().decode(new Uint8Array(ACCOUNT_LEN.entry)),
  ...over,
});

export function configWith(
  over: Partial<GlobalConfig> = {},
  params: Partial<GlobalConfig["params"]> = {},
): GlobalConfig {
  const base = getGlobalConfigDecoder().decode(new Uint8Array(ACCOUNT_LEN.globalConfig));
  return { ...base, ...over, params: { ...base.params, ...params } };
}

export const at = (n: number, over: Partial<Campaign> = {}): OpenCampaign => ({
  address: KEY(n),
  campaign: campaignWith(over),
});

export const entryAt = (campaign: Address, baker: Address, over: Partial<Entry> = {}): EntryAt => ({
  address: KEY(30),
  entry: entryWith({ campaign, baker, ...over }),
  lamports: 1_239_520n,
});
