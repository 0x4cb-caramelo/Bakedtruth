/**
 * Purpose: a local cluster ready for the ops rehearsals: an offline surfnet, the brot-markets binary installed at
 *          the id the program declares with an upgrade authority held in memory (as `solana-test-validator
 *          --upgradeable-program` would), the sponsored SOL/USD and BTC/USD accounts kept fresh from the captured
 *          devnet bytes, and captured mainnet accounts of the other kinds written in place.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The captured files are never edited: a price account is read, its publish time and posted slot changed in
 * memory (tests/brot/setup.ts PRICE_OFFSETS), and written to the surfnet. Its posted slot is set far ahead,
 * which the program counts as posted now, so only the publish time ages; `refreshPrices` stamps it again.
 */
import { readFileSync } from "node:fs";

import { address, generateKeyPairSigner, getAddressEncoder, type KeyPairSigner } from "@solana/kit";

import { BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, programDataAddress } from "@brot/sdk/read";

import { airdrop, clock, rentFor, type Rpc } from "./rpc";
import { setAccount, startOfflineSurfnet, type Surfnet } from "./surfnet";

export const PROGRAM_SO = "target/deploy/brot_markets.so";
export const SOL = 1_000_000_000n;
/** Byte offsets of the `PriceUpdateV2` fields a rehearsal changes. */
const PRICE = { publishTime: 93, postedSlot: 125 };
/** A posted slot far ahead of any local clock: the slot bound counts it as posted now. */
const FAR_SLOT = 1n << 60n;

/** The captured accounts a rehearsal writes, by fixture name: [address, owner]. */
export const FIXTURES: Record<string, [string, string]> = {
  "pyth-sol-usd-devnet": [
    "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    "rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp",
  ],
  "pyth-btc-usd-devnet": [
    "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    "rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp",
  ],
  "damm-sol-usdc": ["8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie", "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"],
  "stakepool-jitosol": ["Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb", "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy"],
};

export type LocalWorld = { surfnet: Surfnet; rpc: Rpc; upgradeAuthority: KeyPairSigner; programSha256: string };

/** The loader-v3 ProgramData (tag 3, slot, Some(authority), ELF) and program (tag 2, ProgramData) accounts. */
async function installProgram(rpc: Rpc, authority: string, soPath: string): Promise<string> {
  const elf = new Uint8Array(readFileSync(soPath));
  const key = getAddressEncoder();
  const programData = await programDataAddress();
  const data = new Uint8Array(45 + elf.length);
  new DataView(data.buffer).setUint32(0, 3, true);
  data[12] = 1;
  data.set(key.encode(address(authority)), 13);
  data.set(elf, 45);
  await setAccount(rpc, programData, {
    lamports: await rentFor(rpc, data.length),
    data,
    owner: BPF_LOADER_UPGRADEABLE_ID,
  });
  const program = new Uint8Array(36);
  new DataView(program.buffer).setUint32(0, 2, true);
  program.set(key.encode(programData), 4);
  await setAccount(rpc, PROGRAM_ID, {
    lamports: await rentFor(rpc, 36),
    data: program,
    owner: BPF_LOADER_UPGRADEABLE_ID,
    executable: true,
  });
  return new Bun.CryptoHasher("sha256").update(elf).digest("hex");
}

/** Writes a captured account; for a price account, publish time `publishTime` and a far-ahead posted slot. */
export async function writeFixture(rpc: Rpc, name: string, publishTime?: bigint): Promise<void> {
  const [address, owner] = FIXTURES[name];
  const data = new Uint8Array(readFileSync(`tests/fixtures/${name}.bin`));
  if (publishTime !== undefined) {
    const view = new DataView(data.buffer);
    view.setBigInt64(PRICE.publishTime, publishTime, true);
    view.setBigUint64(PRICE.postedSlot, FAR_SLOT, true);
  }
  await setAccount(rpc, address, { lamports: SOL, data, owner });
}

/** Stamps both sponsored price accounts with the cluster's current time, so a paid opening reads them fresh. */
export async function refreshPrices(rpc: Rpc): Promise<bigint> {
  const now = (await clock(rpc)).unixTimestamp;
  await writeFixture(rpc, "pyth-sol-usd-devnet", now);
  await writeFixture(rpc, "pyth-btc-usd-devnet", now);
  return now;
}

/** Starts the surfnet, installs the program and writes the captured accounts. */
export async function startLocalWorld(soPath = PROGRAM_SO, slotMs = 400): Promise<LocalWorld> {
  const surfnet = await startOfflineSurfnet(undefined, slotMs);
  const rpc = surfnet.rpc;
  const upgradeAuthority = await generateKeyPairSigner();
  const programSha256 = await installProgram(rpc, upgradeAuthority.address, soPath);
  await airdrop(rpc, upgradeAuthority.address, 10n * SOL);
  await refreshPrices(rpc);
  await writeFixture(rpc, "damm-sol-usdc");
  await writeFixture(rpc, "stakepool-jitosol");
  console.log(
    `local surfnet ${surfnet.version} (offline) at ${rpc.url}; program ${PROGRAM_ID} sha256 ${programSha256}`,
  );
  return { surfnet, rpc, upgradeAuthority, programSha256 };
}

/** A fresh wallet holding `sol` SOL on the local cluster. */
export async function fundedWallet(rpc: Rpc, sol = 100n): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  await airdrop(rpc, signer.address, sol * SOL);
  return signer;
}
