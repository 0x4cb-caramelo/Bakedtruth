/**
 * Purpose: which cluster a mainnet run talks to, checked before anything else (Sprint 18; deploy/mainnet/README.md):
 *          the RPC's genesis hash must be mainnet-beta's. A Surfpool fork of mainnet answers the same genesis hash,
 *          so it is told apart by the `surfnet-version` its `getVersion` carries and by its loopback URL: a real run
 *          refuses a fork and any loopback RPC, a rehearsal refuses anything but a local fork, and every other
 *          cluster is refused outright.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Mainnet-beta's genesis hash is the value Anza's cluster page passes to `agave-validator --expected-genesis-hash`
 * for Mainnet Beta (https://docs.anza.xyz/clusters/available, read 2026-10-13), and what
 * https://api.mainnet-beta.solana.com answered to `getGenesisHash` the same day. scripts/validator/clusters.ts holds
 * the same value to refuse mainnet; the mainnet scripts are the only ones that accept it.
 */
import { GENESIS } from "../validator/clusters";
import { connect, isLocalUrl, type Rpc } from "../validator/rpc";

export const MAINNET_GENESIS = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
if (GENESIS.mainnet !== MAINNET_GENESIS)
  throw new Error("scripts/validator/clusters.ts disagrees on mainnet's genesis");

/** `mainnet`: mainnet-beta itself, for the real run. `mainnet-fork`: a local Surfpool fork, for the rehearsal. */
export type MainnetMode = "mainnet" | "mainnet-fork";

export type ClusterFacts = { genesisHash: string; surfnet: string | null; core: string };

export function parseMainnetMode(value: unknown): MainnetMode {
  if (value === "mainnet" || value === "mainnet-fork") return value;
  throw new Error(`--cluster must be mainnet or mainnet-fork, not ${String(value)}`);
}

/** The genesis hash and the node's version; `surfnet` is Surfpool's version when the node is a surfnet. */
export async function clusterFacts(rpc: Rpc): Promise<ClusterFacts> {
  const genesisHash = await rpc.call<string>("getGenesisHash");
  const version = await rpc.call<Record<string, unknown>>("getVersion");
  const surfnet = typeof version["surfnet-version"] === "string" ? (version["surfnet-version"] as string) : null;
  return { genesisHash, surfnet, core: String(version["solana-core"] ?? "unknown") };
}

/** Why the node at `url` is not the cluster `mode` names, or null when it is. Pure, so each refusal is testable. */
export function mainnetProblem(mode: MainnetMode, url: string, facts: ClusterFacts): string | null {
  if (facts.genesisHash !== MAINNET_GENESIS) {
    return `this RPC is not mainnet-beta (genesis ${facts.genesisHash}): the mainnet scripts run nowhere else`;
  }
  if (mode === "mainnet") {
    if (facts.surfnet) return `this RPC is a Surfpool fork (surfnet ${facts.surfnet}): a real run needs mainnet itself`;
    if (isLocalUrl(url)) return "a real run never goes through a loopback RPC: pass the provider's mainnet URL";
    return null;
  }
  if (!isLocalUrl(url)) return "a rehearsal runs only on a local Surfpool fork (127.0.0.1), never on mainnet itself";
  if (!facts.surfnet) return "a rehearsal needs a Surfpool fork of mainnet: this loopback node is not a surfnet";
  return null;
}

/** A URL as it may be printed: its origin, never a path or a query that could carry a provider's key. */
export const originOf = (url: string): string => new URL(url).origin;

/** Connects, prints the origin and the genesis hash, and refuses unless the node is what `mode` names. */
export async function openMainnet(url: string, mode: MainnetMode): Promise<{ rpc: Rpc; facts: ClusterFacts }> {
  const rpc = connect(url, mode === "mainnet" ? "mainnet (--cluster mainnet)" : null);
  const facts = await clusterFacts(rpc);
  const node = facts.surfnet ? `surfnet ${facts.surfnet}` : `solana-core ${facts.core}`;
  console.log(`cluster: ${originOf(url)}  genesis ${facts.genesisHash}  ${node}`);
  const problem = mainnetProblem(mode, url, facts);
  if (problem) throw new Error(problem);
  return { rpc, facts };
}
