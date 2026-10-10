/**
 * Purpose: the session the devnet scripts (smoke, seed) share: the cluster they write to, the payer, a team key,
 *          wallets, funding and fresh prices. `--cluster local` (the default) starts its own offline surfnet in a
 *          loopback-only namespace, with the program installed, the config initialized and a team set, so a run
 *          touches no live cluster; `--cluster devnet` needs the deployed, initialized program and is refused
 *          without that flag.
 * Version: 0.2.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; replaces the pred-provable/USDC/Anchor helpers
 *
 * Environment (TP §11): DEVNET_RPC_URL (default devnet's public RPC), DEVNET_WALLET (the payer's keypair file,
 * default ~/.config/solana/pred-provable-devnet.json), TEAM_KEYPAIR (your own team key). Keys stay on the machine.
 */
import { address, generateKeyPairSigner, type KeyPairSigner } from "@solana/kit";

import { configAddress, decodeGlobalConfig, isTeamKey, type GlobalConfig } from "@brot/sdk/read";

import { initializeConfig, readInitParams, setTeam } from "./deploy/initialize";
import { clusterArgs, openCluster, type ClusterName } from "./validator/clusters";
import { isolateOrExit } from "./validator/isolate";
import { derivedSigner, keypairFromEnv } from "./validator/keys";
import { account, airdrop, expectOk, send, type Rpc } from "./validator/rpc";
import { transferIx } from "./validator/spl-token";
import { refreshPrices, SOL, startLocalWorld } from "./validator/world";

export { SOL };
export const DEFAULT_WALLET = "~/.config/solana/pred-provable-devnet.json";

export type Session = {
  rpc: Rpc;
  cluster: ClusterName;
  /** Pays the network fees of the steps nobody in particular signs (resolve, settle, close). */
  payer: KeyPairSigner;
  /** A key in `GlobalConfig.team`: yours on devnet, a fresh one locally. */
  team: KeyPairSigner;
  config: () => Promise<GlobalConfig>;
  /** A wallet for `role`: fresh locally; derived from DEVNET_WALLET on devnet, so a rerun reuses it. */
  wallet: (role: string) => Promise<KeyPairSigner>;
  /** Tops `address` up to at least `lamports`. */
  fund: (address: string, lamports: bigint) => Promise<void>;
  /** Locally, stamps the price accounts with the cluster's time; on devnet the push oracle does. */
  freshPrices: () => Promise<void>;
  stop: () => void;
};

const readConfig = async (rpc: Rpc) => {
  const found = await account(rpc, await configAddress());
  if (!found) throw new Error("no initialized config on this cluster: deploy first (deploy/devnet/README.md)");
  return decodeGlobalConfig(found);
};

/** A local session: offline surfnet, program at its id, config from deploy/devnet/init-params.json, one team key. */
async function localSession(): Promise<Session> {
  const world = await startLocalWorld();
  const { rpc } = world;
  const [payer, team, admin] = await Promise.all([
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
  ]);
  for (const s of [payer, team, admin]) await airdrop(rpc, s.address, 1_000n * SOL);
  const params = readInitParams("deploy/devnet/init-params.json");
  const plan = { authority: world.upgradeAuthority, admin: admin.address, feeRecipient: admin.address, params };
  await initializeConfig(rpc, world.upgradeAuthority, plan);
  await setTeam(rpc, admin, admin, [team.address]);
  return {
    rpc,
    cluster: "local",
    payer,
    team,
    config: () => readConfig(rpc),
    wallet: () => generateKeyPairSigner(),
    fund: async (to, lamports) => airdrop(rpc, to, lamports),
    freshPrices: async () => void (await refreshPrices(rpc)),
    stop: () => world.surfnet.stop(),
  };
}

/** A devnet session: the program must be deployed and initialized, and TEAM_KEYPAIR must be a team key. */
async function devnetSession(url: string): Promise<Session> {
  const rpc = await openCluster(url, "devnet");
  const walletPath = process.env.DEVNET_WALLET ?? DEFAULT_WALLET;
  const payer = await keypairFromEnv("DEVNET_WALLET", DEFAULT_WALLET);
  const team = await keypairFromEnv("TEAM_KEYPAIR");
  const config = await readConfig(rpc);
  if (!isTeamKey(config, team.address)) throw new Error(`TEAM_KEYPAIR ${team.address} is not a team key on devnet`);
  return {
    rpc,
    cluster: "devnet",
    payer,
    team,
    config: () => readConfig(rpc),
    wallet: (role) => derivedSigner(walletPath, role),
    fund: async (to, lamports) => {
      const have = (await account(rpc, to))?.lamports ?? 0n;
      if (have >= lamports) return;
      expectOk(await send(rpc, payer, [transferIx(payer, address(to), lamports - have)]), `fund ${to}`);
    },
    freshPrices: async () => {},
    stop: () => {},
  };
}

/**
 * Opens the session the command line asks for. `scriptPath` is the calling script (`import.meta.path`): a local
 * session re-runs it inside the loopback-only namespace before anything starts.
 */
export async function openSession(scriptPath: string): Promise<Session> {
  const { url, cluster } = clusterArgs();
  if (cluster === "local") {
    isolateOrExit(scriptPath);
    return localSession();
  }
  return devnetSession(url);
}

/** One step's line in the log. */
export const step = (label: string) => console.log(`\n▸ ${label}`);

/** Fails the run unless `condition` holds; a smoke run exits 0 only if every check passed. */
export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`check failed: ${message}`);
  console.log(`  ✓ ${message}`);
}

/** Lamports as SOL, for the log. */
export const sol = (lamports: bigint) => `${(Number(lamports) / 1e9).toFixed(9)} SOL`;
