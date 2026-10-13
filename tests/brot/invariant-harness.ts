/**
 * Purpose: the world of the randomized test: a seeded generator, the wallets, the price accounts the
 *          operations refresh, the reference model of every campaign and of every referral link, and the chain
 *          view the invariant checks read. Operations live in invariant-ops.ts and the files it dispatches to.
 * Version: 0.1.2 (Sprint 14: the referees and their links, cached addresses, the config read once per check; the
 *          event-field checks, moved from invariant-contest.ts for D2; Sprint 15: a SealedFee's rent and address)
 * Sprint:  04 (contract freeze, lane E); 14 (lane INV14); 15 (lane INV15, with Sprint 14 in one branch)
 */
import { type Address, type KeyPairSigner, type Instruction } from "@solana/kit";

import { BTC_PRICE, DEFAULT_PARAMS, initConfig, setTeam, SOL_PRICE } from "./flows";
import { SOL_CONF } from "./opening";
import type { ModelCampaign } from "./invariant-model";
import { layoutSize } from "./layouts";
import * as P from "./program";
import type { BrotErrorName } from "./errors";
import { balance, createWorld, fundedWallet, now, rentFor, setPriceAccount, type Event, type World } from "./setup";
import { CAMPAIGN, ENTRY, JOIN } from "./structs";
import { REFERRAL_LINK, SEALED_FEE } from "./structs-14-15";

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
  /** The name the trace gives the operation when it differs from its kind (a re-read that pays, say). */
  label?: string;
  /** On success, the program's events in order, by name: the operation emits exactly these. */
  events?: string[];
  /** On success, a check of the events and the accounts the operation wrote; it throws on a difference. */
  verify?: (events: Event[]) => void;
  /** Nothing but the listed deltas may change: config, fee vault, campaigns, vaults, entries, joins (a link). */
  still?: boolean;
  /** The campaign whose snapshot this operation takes (an exit): the open count must fall by one if it counted (I7). */
  exit?: number;
};

/** A referral link as the model holds it: its referrer, its lamports and the bytes written at creation. */
export type ModelLink = { referrer: string; lamports: bigint; bytes: Uint8Array };

export type Harness = {
  w: World;
  bank: KeyPairSigner;
  admin: KeyPairSigner;
  team: KeyPairSigner[];
  creators: KeyPairSigner[];
  bakers: KeyPairSigner[];
  /** The wallets that link a referrer (Sprint 14): the bakers and four more. */
  referees: KeyPairSigner[];
  sink: Address;
  camps: ModelCampaign[];
  addrs: { campaign: Address; vault: Address }[];
  /** Each referee's link once made, and the SOL sent by hand to a link address not yet made. */
  links: Map<string, ModelLink>;
  linkFunds: Map<string, bigint>;
  paused: boolean;
  max: number;
  feeVault: Address;
  feeVaultModel: bigint;
  /** Rent of the 512-byte campaign, of the data-less vault, of an Entry, of a data-less wallet (the reserve), of a
   *  Join, of a ReferralLink and of a sponsor's SealedFee (Sprint 15). */
  rent: { campaign: bigint; vault: bigint; entry: bigint; wallet: bigint; join: bigint; link: bigint; sealed: bigint };
  drained: Set<string>;
  nextId: bigint;
  trace: string[];
  /** The operations that succeeded while entries were paused, by label (I10′). */
  pausedOk: Map<string, number>;
  /** The snapshot exits taken, by label, paid or free, with entries or none (I7). */
  exits: Map<string, number>;
  /** Derived addresses, cached: an Entry by `campaign|baker`, a link by referee. */
  cache: Map<string, Address>;
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
  const others = await Promise.all([1, 2, 3, 4].map(() => fundedWallet(w, 10n)));
  const feeVault = await P.feeVaultPda();
  const rent = {
    campaign: rentFor(w, layoutSize(CAMPAIGN)),
    vault: rentFor(w, 0),
    entry: rentFor(w, layoutSize(ENTRY)),
    join: rentFor(w, layoutSize(JOIN)),
    wallet: rentFor(w, 0),
    link: rentFor(w, layoutSize(REFERRAL_LINK)),
    sealed: rentFor(w, layoutSize(SEALED_FEE)),
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
    referees: [...bakers, ...others],
    sink,
    camps: [],
    addrs: [],
    links: new Map(),
    linkFunds: new Map(),
    paused: false,
    max: MAX_OPEN,
    feeVault,
    feeVaultModel,
    rent,
    drained: new Set(),
    nextId: 1n,
    trace: [],
    pausedOk: new Map(),
    exits: new Map(),
    cache: new Map(),
  };
}

export const clock = (h: Harness) => now(h.w.client);

/** `derive()` once per key, then from the cache. */
async function cached(h: Harness, key: string, derive: () => Promise<Address>): Promise<Address> {
  const hit = h.cache.get(key);
  if (hit) return hit;
  const found = await derive();
  h.cache.set(key, found);
  return found;
}
export const entryOf = (h: Harness, campaign: Address, baker: string) =>
  cached(h, `${campaign}|${baker}`, () => P.entryPda(campaign, baker as Address));
export const linkOf = (h: Harness, referee: string) =>
  cached(h, `link|${referee}`, () => P.referralLinkPda(referee as Address));
/** A sponsor's SealedFee on a campaign, `["sealed", campaign, sponsor]` (Sprint 15). */
export const sealedAt = (h: Harness, campaign: Address, sponsor: string) =>
  cached(h, `sealed|${campaign}|${sponsor}`, () => P.sealedFeePda(campaign, sponsor as Address));

/** The sponsored BTC/USD account at `price`, published at `publishTime`, in the current slot. */
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

/** The event field `snake` (the kit's layout) or `camel` (the SDK's decoder), whichever the event carries. */
export const field = (e: Event, snake: string, camel = snake) => e.data[snake] ?? e.data[camel];

/** Throws unless each field of the event holds its expected value (`[value, camelCase name]`). */
export function expectFields(e: Event, want: Record<string, [unknown, string?]>) {
  for (const [snake, [value, camel]] of Object.entries(want)) {
    const have = field(e, snake, camel);
    const equal = typeof have === "boolean" ? Number(have) === value : have === value;
    if (!equal) throw new Error(`${e.name}.${snake} is ${have}, the model expects ${value}`);
  }
}
