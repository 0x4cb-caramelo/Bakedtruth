// Purpose: capture real on-chain accounts into tests/fixtures, so the reader tests decode the bytes third-party
//          programs actually write instead of a layout someone typed from memory.
// Version: 0.3.0
// Sprint:  01 (price reader proof); the mainnet set came from upstream pred-provable; mints, a vote account and the
//          mainnet price accounts added in Sprint 03
//
// Usage:   bun run scripts/capture-fixtures.ts            every fixture, all clusters
//          bun run scripts/capture-fixtures.ts pyth       only the fixtures whose name starts with "pyth"
// MAINNET_RPC_URL and DEVNET_RPC_URL override the public endpoints. Re-run after an upstream upgrade and review the
// diff. A filtered run leaves the other fixtures and their index entries untouched: re-capturing a live account
// changes its bytes, and the tests that read it may assert on them. The index records the SHA-256 of every file, and
// tests/fixtures.test.ts fails when a .bin and its index entry disagree.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Connection, PublicKey } from "@solana/web3.js";

type Cluster = "mainnet" | "devnet";
type Entry = {
  address: string;
  owner: string;
  length: number;
  sha256: string;
  slot: number;
  note: string;
  cluster: Cluster;
};

// fileURLToPath, not URL.pathname: on Windows the pathname is "/F:/...", which is not a usable path.
const OUT = fileURLToPath(new URL("../tests/fixtures/", import.meta.url));
const RPC: Record<Cluster, string> = {
  mainnet: process.env.MAINNET_RPC_URL ?? "https://api.mainnet-beta.solana.com",
  devnet: process.env.DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
};
// Third-party programs keep one address on every cluster, so an RPC URL pointing at the wrong network would
// capture that network's bytes under the right name. The genesis hash is what tells the clusters apart.
const GENESIS: Record<Cluster, string> = {
  mainnet: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  devnet: "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
};

/** name -> [address, what it is, cluster the bytes come from]. */
const FIXTURES: Record<string, [string, string, Cluster]> = {
  "stakepool-jitosol": [
    "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb",
    "JitoSOL SPL stake pool, fees all unset",
    "mainnet",
  ],
  "stakepool-bsol": ["stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi", "bSOL SPL stake pool, same layout", "mainnet"],
  "damm-sol-usdc": [
    "8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie",
    "Meteora DAMM v2 SOL-USDC pool, 0.02% locked",
    "mainnet",
  ],
  "damm-ft8fd9": [
    "Ft8FD9gg1TdawhWijNzdkpYTiVL8ETfY6gAwS24bwYio",
    "Meteora DAMM v2 pool, 59.7% of liquidity locked",
    "mainnet",
  ],
  "metadata-usdc": [
    "5x38Kp4hvdomTCnCrAny4UtMUt5rQBdB6px2K1Ui45Wq",
    "Metaplex metadata of USDC: mutable, no creators",
    "mainnet",
  ],
  "metadata-wif": [
    "C1BpuaMytZAbSCFf9WM2gm6fAm54Yh1gh32ieptrp12B",
    "Metaplex metadata of WIF: immutable, no creators",
    "mainnet",
  ],
  "metadata-smb-1301": [
    "91tCv8sG8esgP5dVQ9WchuzBmojXbdaqxMxA16qt6CnE",
    "Metaplex pNFT SMB #1301: immutable, 3 creators",
    "mainnet",
  ],
  "metadata-madlads-1725": [
    "2zjfABAdNg7SuqvwpPR3jFH3p91SjH4LKsGfBQ2hdrc7",
    "Metaplex pNFT Mad Lads #1725: mutable, 2 creators",
    "mainnet",
  ],
  // Pyth push feeds, shard 0. "Upgraded" is the Core generation Pyth recommends for new integrations since its
  // 2026-08-26 upgrade (receiver rec2HH..., feed program pyt2F4...). "Legacy" is the same feed under the
  // pre-upgrade receiver (rec5EK...), kept so the reader is tested rejecting an owner it does not trust.
  "pyth-sol-usd-devnet": [
    "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    "Pyth PriceUpdateV2, SOL/USD, upgraded Core receiver, sponsored push feed",
    "devnet",
  ],
  "pyth-btc-usd-devnet": [
    "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    "Pyth PriceUpdateV2, BTC/USD, upgraded Core receiver, sponsored push feed",
    "devnet",
  ],
  "pyth-sol-usd-devnet-legacy": [
    "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
    "Pyth PriceUpdateV2, SOL/USD, pre-upgrade receiver: same layout, an owner the reader rejects",
    "devnet",
  ],
  // Sprint 03: the mainnet price accounts, the burn kind's mints and a vote account.
  "pyth-sol-usd-mainnet": [
    "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    "Pyth PriceUpdateV2, SOL/USD, upgraded Core receiver, sponsored push feed",
    "mainnet",
  ],
  "pyth-btc-usd-mainnet": [
    "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    "Pyth PriceUpdateV2, BTC/USD, upgraded Core receiver, sponsored push feed",
    "mainnet",
  ],
  "mint-wif": [
    "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    "SPL Token mint of WIF: both authorities revoked",
    "mainnet",
  ],
  "mint-bonk": [
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "SPL Token mint of BONK: both authorities revoked, supply near the u64 ceiling",
    "mainnet",
  ],
  "mint-usdc": [
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "SPL Token mint of USDC: mint authority live, so the burn kind refuses it",
    "mainnet",
  ],
  "mint-pyusd": [
    "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    "Token-2022 mint of PYUSD, with extensions: an owner the burn kind refuses",
    "mainnet",
  ],
  "vote-mainnet-top": [
    "CcaHc2L43ZWjwCHART3oZoJvHLAe9hzT2DJNUpBzoTN1",
    "Vote account with the most active stake on 2026-10-09, 3,762 bytes, version tag 3",
    "mainnet",
  ],
};

const prefix = process.argv[2] ?? "";
const names = Object.keys(FIXTURES).filter((name) => name.startsWith(prefix));
if (names.length === 0) throw new Error(`no fixture name starts with "${prefix}"`);

mkdirSync(OUT, { recursive: true });
const indexFile = `${OUT}index.json`;
const index: Record<string, Entry> = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")) : {};
// Entries written before clusters existed are all mainnet.
for (const entry of Object.values(index)) entry.cluster ??= "mainnet";

for (const cluster of ["mainnet", "devnet"] as const) {
  const wanted = names.filter((name) => FIXTURES[name]![2] === cluster);
  if (wanted.length === 0) continue;

  const connection = new Connection(RPC[cluster], "confirmed");
  const genesis = await connection.getGenesisHash();
  if (genesis !== GENESIS[cluster]) throw new Error(`the ${cluster} RPC answers for another cluster (${genesis})`);
  const { context, value } = await connection.getMultipleAccountsInfoAndContext(
    wanted.map((name) => new PublicKey(FIXTURES[name]![0])),
  );
  wanted.forEach((name, i) => {
    const [address, note] = FIXTURES[name]!;
    const info = value[i];
    if (!info) throw new Error(`${name} (${address}) does not exist on ${cluster}`);
    const owner = info.owner.toBase58();
    // An account that changed hands is not the one the tests were written against. To accept a new owner on
    // purpose, delete the entry from index.json and capture again.
    const before = index[name];
    if (before && before.owner !== owner) throw new Error(`${name}: owner was ${before.owner}, is now ${owner}`);
    writeFileSync(`${OUT}${name}.bin`, info.data);
    index[name] = {
      address,
      owner,
      length: info.data.length,
      sha256: createHash("sha256").update(info.data).digest("hex"),
      slot: context.slot,
      note,
      cluster,
    };
    console.log(`${name}: ${info.data.length} bytes, owner ${owner}, ${cluster} slot ${context.slot}`);
  });
}

writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(`wrote ${names.length} of ${Object.keys(FIXTURES).length} fixtures`);
