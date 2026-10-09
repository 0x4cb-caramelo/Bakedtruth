/**
 * Purpose: the third-party accounts the readers read, for the LiteSVM tests: the captured fixtures
 *          written into the world (moved, re-owned or edited in memory), a synthetic SPL mint, the
 *          known offsets of the pool layouts, and the clock's slot and epoch.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution); frozen at the sprint's opening with the program's contract
 */
import { readFileSync } from "node:fs";

import { address, getAddressEncoder, lamports, type Address } from "@solana/kit";

import * as P from "./program";
import type { Client } from "./setup";

type IndexEntry = { address: string; owner: string; length: number; cluster: string; slot: number };
/** tests/fixtures/index.json: each captured account's address, owner, size and slot. */
export const FIXTURES: Record<string, IndexEntry> = JSON.parse(readFileSync("tests/fixtures/index.json", "utf8"));

/** A fresh copy of a captured account's bytes (the file itself is never edited). */
export const fixtureBytes = (name: string) => new Uint8Array(readFileSync(`tests/fixtures/${name}.bin`));

/** Writes any account into the world. */
export function setRawAccount(client: Client, at: Address, data: Uint8Array, owner: Address, sol = 1n) {
  client.svm.setAccount({
    address: at,
    data,
    executable: false,
    lamports: lamports(sol * P.SOL),
    programAddress: owner,
    space: BigInt(data.length),
  });
}

/**
 * Writes a captured account into the world, at its own address unless `at` is given, under its
 * captured owner unless `owner` is given, after `mutate` edits the copy. Returns the address and bytes.
 */
export function setFixture(
  client: Client,
  name: string,
  o: { at?: Address; owner?: Address; mutate?: (data: Uint8Array, view: DataView) => void } = {},
) {
  const entry = FIXTURES[name];
  if (!entry) throw new Error(`no fixture named ${name}`);
  const data = fixtureBytes(name);
  o.mutate?.(data, new DataView(data.buffer));
  const at = o.at ?? address(entry.address);
  setRawAccount(client, at, data, o.owner ?? address(entry.owner));
  return { address: at, data };
}

/** Offsets of the fields the ported readers read (pred-provable's `resolver.rs`, the fixtures). */
export const MINT_OFFSETS = { mintAuthorityTag: 0, supply: 36, decimals: 44, initialized: 45, freezeAuthorityTag: 46 };
export const DAMM_OFFSETS = { tokenAMint: 168, tokenBMint: 200, permanentLockLiquidity: 552 };
/** With every option of the pool unset, as on JitoSOL and bSOL; a set option moves the snapshot. */
export const STAKE_POOL_OFFSETS = {
  poolMint: 162,
  totalLamports: 258,
  lastUpdateEpoch: 274,
  lastEpochTotalLamports: 427,
};

/** A classic SPL Token mint's 82 bytes; an authority given as `null` is revoked. */
export function mintBytes(m: {
  supply: bigint;
  decimals?: number;
  mintAuthority?: Address | null;
  freezeAuthority?: Address | null;
  initialized?: boolean;
}) {
  const data = new Uint8Array(82);
  const view = new DataView(data.buffer);
  const key = (a: Address) => getAddressEncoder().encode(a);
  if (m.mintAuthority) {
    view.setUint32(MINT_OFFSETS.mintAuthorityTag, 1, true);
    data.set(key(m.mintAuthority), 4);
  }
  view.setBigUint64(MINT_OFFSETS.supply, m.supply, true);
  data[MINT_OFFSETS.decimals] = m.decimals ?? 6;
  data[MINT_OFFSETS.initialized] = m.initialized === false ? 0 : 1;
  if (m.freezeAuthority) {
    view.setUint32(MINT_OFFSETS.freezeAuthorityTag, 1, true);
    data.set(key(m.freezeAuthority), 50);
  }
  return data;
}

/** Moves the clock: any of Unix time, slot and epoch, keeping the rest. */
export function setClock(client: Client, c: { unixTimestamp?: bigint; slot?: bigint; epoch?: bigint }) {
  const clock = client.svm.getClock();
  if (c.unixTimestamp !== undefined) clock.unixTimestamp = c.unixTimestamp;
  if (c.slot !== undefined) clock.slot = c.slot;
  if (c.epoch !== undefined) {
    clock.epoch = c.epoch;
    clock.leaderScheduleEpoch = c.epoch + 1n;
  }
  client.svm.setClock(clock);
}

/** The world's EpochSchedule, as mainnet and devnet run it: 432,000 slots, no warmup. */
export function setMainnetEpochSchedule(client: Client) {
  const schedule = client.svm.getEpochSchedule();
  schedule.slotsPerEpoch = 432_000n;
  schedule.leaderScheduleSlotOffset = 432_000n;
  schedule.warmup = false;
  schedule.firstNormalEpoch = 0n;
  schedule.firstNormalSlot = 0n;
  client.svm.setEpochSchedule(schedule);
}
