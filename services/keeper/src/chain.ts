/**
 * Purpose: what one keeper cycle reads, in as few calls as the chain allows (TP §3.5, "100 per getMultipleAccounts"):
 *          every campaign in one `getProgramAccounts`; the config, the fee vault, Pyth's SOL/USD sponsored account,
 *          the metric account of every open campaign (each address once, however many campaigns share it: "price per
 *          feed, not per campaign") and the vault of every campaign, all through `getMultipleAccounts` in chunks of
 *          100; the chain's clock from the Clock sysvar (never this machine's, A-7); the keeper's balance.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: batched reads)
 */
import { address, getBase64Encoder, type Address } from "@solana/kit";
import {
  SOL_USD_ACCOUNT,
  Status,
  configAddress,
  decodeGlobalConfig,
  feeVaultAddress,
  readChainTime,
  vaultAddress,
  type ChainTime,
  type FetchedAccount,
  type GlobalConfig,
  type SolanaRpc,
} from "@brot/sdk/read";

import { listAllCampaigns, type OpenCampaign } from "./campaigns";

/** An account as `getMultipleAccounts` returns it: the owner, the bytes and the lamports. */
export type Held = FetchedAccount & { lamports: bigint };

export type ChainView = {
  chain: ChainTime;
  campaigns: OpenCampaign[];
  config: GlobalConfig | null;
  feeVault: Held | null;
  solUsd: Held | null;
  /** Each open campaign's metric account, by address; `null` when it does not exist. */
  metrics: Map<string, Held | null>;
  /** Each campaign's vault lamports, by campaign address. */
  vaults: Map<string, bigint>;
  keeperLamports: bigint;
  /** `getMultipleAccounts` calls this view took, for /healthz and the load test. */
  batches: number;
};

/** The largest `getMultipleAccounts` the RPC accepts. */
export const BATCH = 100;

const vaultCache = new Map<string, Address>();
async function vaultOf(campaign: Address): Promise<Address> {
  const known = vaultCache.get(campaign);
  if (known) return known;
  const vault = await vaultAddress(campaign);
  vaultCache.set(campaign, vault);
  return vault;
}

/** `addresses` (duplicates read once), 100 per call; the map answers every address asked, `null` if missing. */
export async function fetchMany(
  rpc: SolanaRpc,
  addresses: readonly string[],
): Promise<{ accounts: Map<string, Held | null>; calls: number }> {
  const unique = [...new Set(addresses)];
  const accounts = new Map<string, Held | null>();
  let calls = 0;
  for (let from = 0; from < unique.length; from += BATCH) {
    const chunk = unique.slice(from, from + BATCH);
    const { value } = await rpc
      .getMultipleAccounts(
        chunk.map((at) => address(at)),
        { encoding: "base64", commitment: "confirmed" },
      )
      .send();
    calls++;
    chunk.forEach((at, i) => {
      const account = value[i];
      accounts.set(
        at,
        account
          ? {
              address: at,
              owner: account.owner,
              data: new Uint8Array(getBase64Encoder().encode(account.data[0])),
              lamports: BigInt(account.lamports),
            }
          : null,
      );
    });
  }
  return { accounts, calls };
}

/** One cycle's view of the chain. */
export async function readChainView(rpc: SolanaRpc, keeper: Address): Promise<ChainView> {
  const campaigns = await listAllCampaigns(rpc);
  const chain = await readChainTime(rpc);
  const [config, feeVault] = [await configAddress(), await feeVaultAddress()];
  const metricOf = campaigns.filter((c) => c.campaign.status === Status.Open).map((c) => c.campaign.metricAccount);
  const vaults = await Promise.all(campaigns.map((c) => vaultOf(c.address)));
  const { accounts, calls } = await fetchMany(rpc, [config, feeVault, SOL_USD_ACCOUNT, ...metricOf, ...vaults]);
  const configAccount = accounts.get(config) ?? null;
  let decoded: GlobalConfig | null = null;
  try {
    decoded = configAccount ? decodeGlobalConfig(configAccount) : null;
  } catch {
    decoded = null; // not the program's config: nothing that reads it is trusted this cycle
  }
  const { value: keeperLamports } = await rpc.getBalance(keeper).send();
  return {
    chain,
    campaigns,
    config: decoded,
    feeVault: accounts.get(feeVault) ?? null,
    solUsd: accounts.get(SOL_USD_ACCOUNT) ?? null,
    metrics: new Map(metricOf.map((at) => [at, accounts.get(at) ?? null])),
    vaults: new Map(campaigns.map((c, i) => [c.address, accounts.get(vaults[i]!)?.lamports ?? 0n])),
    keeperLamports: BigInt(keeperLamports),
    batches: calls,
  };
}
