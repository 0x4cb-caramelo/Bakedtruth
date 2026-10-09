/**
 * Purpose: which cluster an RPC really is, by its genesis hash, so an ops script never writes to a cluster other
 *          than the one its operator named: mainnet is refused outright until Sprint 18, devnet only with
 *          `--cluster devnet`, and a local cluster (any other genesis on 127.0.0.1) by default.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { parseArgs } from "node:util";

import { connect, describeCluster, isLocalUrl, type Rpc } from "./rpc";

/** The public clusters' genesis hashes (`solana genesis-hash` on each). */
export const GENESIS = {
  mainnet: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
  testnet: "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY",
} as const;

export type ClusterName = "local" | "devnet";

/**
 * Connects to `url` and checks it is the cluster named: `devnet` must answer devnet's genesis hash; `local`
 * must be a loopback URL whose genesis is none of the public clusters'. Prints the genesis hash first.
 */
export async function openCluster(url: string, cluster: ClusterName): Promise<Rpc> {
  if (cluster === "local" && !isLocalUrl(url))
    throw new Error(`${new URL(url).host} is not local: pass --cluster devnet`);
  const rpc = connect(url, cluster === "devnet" ? "devnet" : null);
  const { genesisHash } = await describeCluster(rpc);
  if (genesisHash === GENESIS.mainnet) throw new Error("this is mainnet: nothing in Sprint 05 writes there");
  if (cluster === "devnet" && genesisHash !== GENESIS.devnet) throw new Error(`not devnet (genesis ${genesisHash})`);
  if (cluster === "local" && Object.values(GENESIS).includes(genesisHash as never)) {
    throw new Error(`a public cluster (genesis ${genesisHash}) answers on a local URL: refusing`);
  }
  return rpc;
}

/** `--url` and `--cluster` from the command line; the RPC defaults to `DEVNET_RPC_URL`, then devnet's public one. */
export function clusterArgs(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: { url: { type: "string" }, cluster: { type: "string" } },
  });
  const cluster = (values.cluster as string | undefined) ?? "local";
  if (cluster !== "local" && cluster !== "devnet") throw new Error(`--cluster must be local or devnet, not ${cluster}`);
  const url = (values.url as string | undefined) || process.env.DEVNET_RPC_URL || "https://api.devnet.solana.com";
  return { url, cluster: cluster as ClusterName, positionals };
}
