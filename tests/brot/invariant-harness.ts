/**
 * Purpose: the world of the randomized test: a seeded generator, the wallets, the price accounts the
 *          operations refresh, the reference model of every campaign, and the chain view the invariant
 *          checks read. Operations live in invariant-ops.ts and invariant-settle.ts.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { type Address, type KeyPairSigner, type Instruction } from "@solana/kit";

import { BTC_PRICE, DEFAULT_PARAMS, initConfig, readConfig, setTeam, SOL_PRICE } from "./flows";
import { SOL_CONF } from "./opening";
import type { ModelCampaign } from "./invariant-model";
import { decode, layoutSize } from "./layouts";
import * as P from "./program";
import type { BrotErrorName } from "./errors";
import { balance, createWorld, fundedWallet, now, rentFor, setPriceAccount, type World } from "./setup";
import { CAMPAIGN, ENTRY } from "./structs";

/** A seeded generator (mulberry32): the same seed gives the same operations on every machine. */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    big: (lo: bigint, hi: bigint) => lo + BigInt(Math.floor(next() * Number(hi - lo + 1n))),
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)],
  };
}
export type Rng = ReturnType<typeof seededRandom>;

/** What one operation expects: the refusal the program must return, and the balance changes it makes. */
export type Plan = {
  ixs: Instruction[];
  error?: BrotErrorName;
  deltas: Map<string, bigint>;
  apply: () => void;
  /** Runs after the transaction whether it succeeded or not (a price put back, for one). */
  after?: () => void;
};

export type Harness = {
  w: World;
  bank: KeyPairSigner;
  admin: KeyPairSigner;
  team: KeyPairSigner[];
  creators: KeyPairSigner[];
  bakers: KeyPairSigner[];
  sink: Address;
  camps: ModelCampaign[];
  addrs: { campaign: Address; vault: Address }[];
  paused: boolean;
  max: number;
  feeVault: Address;
  feeVaultModel: bigint;
  /** Rent of the 512-byte campaign, of the data-less vault, of an Entry and of a data-less wallet (the reserve). */
  rent: { campaign: bigint; vault: bigint; entry: bigint; wallet: bigint };
  drained: Set<string>;
  nextId: bigint;
  trace: string[];
};

export const MAX_OPEN = 6;

/** A world with the founder's config (a small valve, so the refusal is reachable), 2 team keys, 3 creators, 6 bakers. */
export async function makeHarness(): Promise<Harness> {
  const w = await createWorld();
  const { admin } = await initConfig(w, { ...DEFAULT_PARAMS, max_open_campaigns: MAX_OPEN });
  const team = await setTeam(w, admin, 2);
  const bank = await fundedWallet(w, 100_000n);
  const creators = await Promise.all([1, 2, 3].map(() => fundedWallet(w, 50_000n)));
  const bakers = await Promise.all([1, 2, 3, 4, 5, 6].map(() => fundedWallet(w, 500n)));
  const sink = (await fundedWallet(w, 1n)).address;
  const feeVault = await P.feeVaultPda();
  const rent = {
    campaign: rentFor(w, layoutSize(CAMPAIGN)),
    vault: rentFor(w, 0),
    entry: rentFor(w, layoutSize(ENTRY)),
    wallet: rentFor(w, 0),
  };
  const feeVaultModel = balance(w, feeVault);
  refreshBase(w);
  refreshSol(w);
  return {
    w,
    bank,
    admin,
    team,
    creators,
    bakers,
    sink,
    camps: [],
    addrs: [],
    paused: false,
    max: MAX_OPEN,
    feeVault,
    feeVaultModel,
    rent,
    drained: new Set(),
    nextId: 1n,
    trace: [],
  };
}

export const clock = (h: Harness) => now(h.w.client);

/** The sponsored BTC/USD account at its base price, published 5 s ago, in the current slot. */
export function setBtc(w: World, price: bigint, publishTime: bigint) {
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", {
    price,
    conf: 0n,
    publishTime,
    postedSlot: w.client.svm.getClock().slot,
  });
}

export const refreshBase = (w: World) => setBtc(w, BTC_PRICE, now(w.client) - 5n);
export function refreshSol(w: World) {
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: now(w.client) - 5n });
}

/** The opening's price: SOL/USD minus its confidence (TP section 3.4.16). */
export const OPENING_PRICE = SOL_PRICE - SOL_CONF;

/** The chain side of one campaign, as the invariant checks read it. */
export type ChainView = {
  vault: bigint;
  campaign: Record<string, any> | null;
  entries: Map<string, { amount_yes: bigint; amount_no: bigint }>;
  config: Record<string, any>;
  feeVault: bigint;
};

export async function chainView(h: Harness, index: number): Promise<ChainView> {
  const { campaign, vault } = h.addrs[index];
  const c = h.w.client.svm.getAccount(campaign);
  const entries = new Map<string, { amount_yes: bigint; amount_no: bigint }>();
  for (const baker of h.bakers) {
    const entry = await P.entryPda(campaign, baker.address);
    const account = h.w.client.svm.getAccount(entry);
    if (account.exists) {
      const d = decode(ENTRY, account.data);
      entries.set(baker.address, { amount_yes: d.amount_yes, amount_no: d.amount_no });
    }
  }
  return {
    vault: balance(h.w, vault),
    campaign: c.exists ? decode(CAMPAIGN, c.data) : null,
    entries,
    config: await readConfig(h.w),
    feeVault: balance(h.w, h.feeVault),
  };
}
