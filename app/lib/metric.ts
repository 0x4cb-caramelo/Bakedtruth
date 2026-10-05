// Reads a market's KPI the way the program's resolver does (same owners, layouts and comparisons),
// so the progress the app shows is the value `resolve` will read. Framework-free.

import { PublicKey, type AccountInfo, type Connection } from "@solana/web3.js";

import { formatUnits, shortAddress } from "./format";
import {
  BPF_LOADER_UPGRADEABLE_ID,
  DAMM_V2_PROGRAM_ID,
  STAKE_POOL_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "./market";
import { fetchTokenNames, type TokenName } from "./tokens";
import { big, dammShift, kindOf, measuredEpoch, statusOf, type Kind, type MarketAccount } from "./view";

type Info = AccountInfo<Uint8Array> | null;

const SOL_DECIMALS = 9;

const view = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset, data.byteLength);
const u64 = (data: Uint8Array, at: number) => view(data).getBigUint64(at, true);
const u128 = (data: Uint8Array, at: number) => (u64(data, at + 8) << BigInt(64)) | u64(data, at);
/** SPL `COption<Pubkey>`: a little-endian u32 tag, then the key. */
const optionalKey = (data: Uint8Array, at: number) =>
  view(data).getUint32(at, true) === 0 ? null : new PublicKey(data.subarray(at + 4, at + 36));

export type MintView = { mintAuthority: PublicKey | null; supply: bigint; decimals: number; freezeAuthority: PublicKey | null };

/** SPL Token mint (82 bytes), or null if `info` is not one. */
export function parseMint(info: Info): MintView | null {
  if (!info || !info.owner.equals(TOKEN_PROGRAM_ID) || info.data.length !== 82 || info.data[45] !== 1) return null;
  return {
    mintAuthority: optionalKey(info.data, 0),
    supply: u64(info.data, 36),
    decimals: info.data[44]!,
    freezeAuthority: optionalKey(info.data, 46),
  };
}

/** Balance of an SPL Token account (165 bytes), or null if `info` is not one. */
export function parseTokenAmount(info: Info): bigint | null {
  if (!info || !info.owner.equals(TOKEN_PROGRAM_ID) || info.data.length !== 165) return null;
  return u64(info.data, 64);
}

/** Upgrade authority of a loader-v3 ProgramData account (null once revoked), or undefined if not one. */
export function parseUpgradeAuthority(info: Info): PublicKey | null | undefined {
  if (!info || !info.owner.equals(BPF_LOADER_UPGRADEABLE_ID) || info.data.length < 45) return undefined;
  if (view(info.data).getUint32(0, true) !== 3) return undefined;
  return info.data[12] === 0 ? null : new PublicKey(info.data.subarray(13, 45));
}

// --- Third-party accounts: the stake pool, the DAMM v2 pool and Token Metadata --------------------
// These mirror `resolver.rs` (same owner, same layout checks, same offsets), so what the app shows is
// what the program will read.

class Malformed extends Error {}

/** Bounds-checked forward reader for Borsh layouts, like the program's: anything short or out of range throws. */
class Cursor {
  private at = 0;
  private readonly data: Uint8Array;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  take(len: number): Uint8Array {
    const end = this.at + len;
    if (end > this.data.length) throw new Malformed();
    const bytes = this.data.subarray(this.at, end);
    this.at = end;
    return bytes;
  }

  skip(len: number) {
    this.take(len);
  }

  u8() {
    return this.take(1)[0]!;
  }

  u32() {
    return view(this.take(4)).getUint32(0, true);
  }

  u64() {
    return u64(this.take(8), 0);
  }

  key() {
    return new PublicKey(this.take(32));
  }

  /** A Borsh bool or `Option` tag: exactly 0 or 1. */
  flag() {
    const tag = this.u8();
    if (tag > 1) throw new Malformed();
    return tag === 1;
  }

  /** Borsh `Option<Pubkey>`: a tag, then the key if it is 1. */
  skipOptionalKey() {
    if (this.flag()) this.skip(32);
  }

  /** Stake pool `FutureEpoch<Fee>`: tag 0 (none), or 1 and 2 followed by a pending fee (16 bytes). */
  skipFutureFee() {
    const tag = this.u8();
    if (tag === 1 || tag === 2) this.skip(16);
    else if (tag !== 0) throw new Malformed();
  }
}

/** Runs a layout walk over `data`; a malformed account reads as null. */
function walk<T>(data: Uint8Array, read: (cursor: Cursor) => T | null): T | null {
  try {
    return read(new Cursor(data));
  } catch (error) {
    if (error instanceof Malformed) return null;
    throw error;
  }
}

export type StakePoolView = {
  poolMint: PublicKey;
  /** Lamports in the pool now: it moves with every deposit and withdrawal. */
  totalLamports: bigint;
  lastUpdateEpoch: bigint;
  /**
   * The pool's total at the start of `lastUpdateEpoch`. The pool writes it once, on its first balance
   * update of an epoch, and deposits are blocked until then, so a flash loan cannot move it.
   */
  lastEpochTotalLamports: bigint;
};

const STAKE_POOL_ACCOUNT_TYPE = 1;

/**
 * SPL stake pool `StakePool` (Borsh), or null if `info` is not one. The two epoch totals sit after
 * `next_epoch_fee` and a run of options, so they are found by walking the layout (offsets 258, 274
 * and 427 when every option is unset, as on JitoSOL and bSOL).
 */
export function parseStakePool(info: Info): StakePoolView | null {
  if (!info || !info.owner.equals(STAKE_POOL_PROGRAM_ID)) return null;
  return walk(info.data, (c) => {
    if (c.u8() !== STAKE_POOL_ACCOUNT_TYPE) return null;
    c.skip(3 * 32 + 1 + 2 * 32); // manager, staker, stake_deposit_authority, bump, validator_list, reserve_stake
    const poolMint = c.key();
    c.skip(2 * 32); // manager_fee_account, token_program_id
    const totalLamports = c.u64();
    c.skip(8); // pool_token_supply
    const lastUpdateEpoch = c.u64();
    c.skip(48 + 16); // lockup, epoch_fee
    c.skipFutureFee(); // next_epoch_fee
    c.skipOptionalKey(); // preferred_deposit_validator_vote_address
    c.skipOptionalKey(); // preferred_withdraw_validator_vote_address
    c.skip(16 + 16); // stake_deposit_fee, stake_withdrawal_fee
    c.skipFutureFee(); // next_stake_withdrawal_fee
    c.skip(1); // stake_referral_fee
    c.skipOptionalKey(); // sol_deposit_authority
    c.skip(16 + 1); // sol_deposit_fee, sol_referral_fee
    c.skipOptionalKey(); // sol_withdraw_authority
    c.skip(16); // sol_withdrawal_fee
    c.skipFutureFee(); // next_sol_withdrawal_fee
    c.skip(8); // last_epoch_pool_token_supply
    return { poolMint, totalLamports, lastUpdateEpoch, lastEpochTotalLamports: c.u64() };
  });
}

export type DammPoolView = {
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  /** Total liquidity of the pool, locked or not (u128). */
  liquidity: bigint;
  /** Liquidity locked forever (u128). Only ever grows. */
  permanentLockLiquidity: bigint;
  /** Price range and current price, as square roots in Q64.64. A compounding pool has no range. */
  sqrtMinPrice: bigint;
  sqrtMaxPrice: bigint;
  sqrtPrice: bigint;
  /** 0 and 1 are concentrated liquidity in a price range, 2 is a compounding constant-product pool. */
  collectFeeMode: number;
  /** From layout version 1 the pool tracks its reserves, which a compounding pool needs. */
  layoutVersion: number;
  tokenAAmount: bigint;
  tokenBAmount: bigint;
};

const DAMM_POOL_LEN = 1112;
/** First 8 bytes of sha256("account:Pool"). */
const DAMM_POOL_DISCRIMINATOR = [0xf1, 0x9a, 0x6d, 0x04, 0x11, 0xb1, 0x6d, 0xbc];
const DAMM_COMPOUNDING = 2;

/** Meteora DAMM v2 `Pool` (zero-copy, 1112 bytes with its discriminator), or null if `info` is not one. */
export function parseDammPool(info: Info): DammPoolView | null {
  if (!info || !info.owner.equals(DAMM_V2_PROGRAM_ID) || info.data.length !== DAMM_POOL_LEN) return null;
  const { data } = info;
  if (!DAMM_POOL_DISCRIMINATOR.every((byte, i) => data[i] === byte)) return null;
  return {
    tokenAMint: new PublicKey(data.subarray(168, 200)),
    tokenBMint: new PublicKey(data.subarray(200, 232)),
    liquidity: u128(data, 360),
    sqrtMinPrice: u128(data, 424),
    sqrtMaxPrice: u128(data, 440),
    sqrtPrice: u128(data, 456),
    collectFeeMode: data[484]!,
    permanentLockLiquidity: u128(data, 552),
    tokenAAmount: u64(data, 680),
    tokenBAmount: u64(data, 688),
    layoutVersion: data[696]!,
  };
}

/**
 * What `liquidity` is worth in the pool's two tokens at its current price, in base units, rounded down
 * (cp-amm's `get_amounts_for_modify_liquidity`), or null when this pool's layout is not one it knows.
 * A concentrated pool prices it over its range, with the Q64.64 prices as plain integers:
 * a = L (Pmax - P) / (P Pmax), b = L (P - Pmin) / 2^128. A compounding pool owns the same share of its
 * reserves as it owns of its liquidity.
 */
export function dammAmounts(pool: DammPoolView, liquidity: bigint): { a: bigint; b: bigint } | null {
  const zero = BigInt(0);
  if (pool.collectFeeMode === DAMM_COMPOUNDING) {
    if (pool.layoutVersion < 1 || pool.liquidity === zero) return null;
    return {
      a: (liquidity * pool.tokenAAmount) / pool.liquidity,
      b: (liquidity * pool.tokenBAmount) / pool.liquidity,
    };
  }
  if (pool.collectFeeMode > 1) return null;
  const { sqrtPrice: price, sqrtMinPrice: min, sqrtMaxPrice: max } = pool;
  const above = price < max ? max - price : zero;
  const below = price > min ? price - min : zero;
  const denominator = price * max;
  return {
    a: denominator === zero ? zero : (liquidity * above) / denominator,
    b: (liquidity * below) >> BigInt(128),
  };
}

export type MetadataView = { updateAuthority: PublicKey; isMutable: boolean };

/** `Key::MetadataV1`, the first byte of a Metadata account. */
const KEY_METADATA_V1 = 4;

/**
 * Metaplex Token Metadata `Metadata` of `mint` (Borsh), or null if `info` is not one. The strings and
 * creators move `is_mutable` (offset 323 with no creators), so it is found by walking; trailing fields
 * are ignored.
 */
export function parseMetadata(info: Info, mint: PublicKey): MetadataView | null {
  if (!info || !info.owner.equals(TOKEN_METADATA_PROGRAM_ID)) return null;
  return walk(info.data, (c) => {
    if (c.u8() !== KEY_METADATA_V1) return null;
    const updateAuthority = c.key();
    if (!c.key().equals(mint)) return null;
    for (const maxLen of [32, 10, 200]) {
      // name, symbol, uri
      const len = c.u32();
      if (len > maxLen) return null;
      c.skip(len);
    }
    c.skip(2); // seller_fee_basis_points
    if (c.flag()) {
      const creators = c.u32();
      if (creators > 5) return null;
      c.skip(creators * 34); // address, verified, share
    }
    c.flag(); // primary_sale_happened
    return { updateAuthority, isMutable: c.flag() };
  });
}

// --- Readings -------------------------------------------------------------------------------

/** A DAMM pool's two tokens, to value its locked liquidity in them. */
export type PoolTokens = { a: { symbol: string; decimals: number }; b: { symbol: string; decimals: number } };

const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

/** Decimals of a classic or Token-2022 mint (the same first 82 bytes), which DAMM pools may hold. */
function mintDecimals(info: Info): number | null {
  if (!info || info.data.length < 82 || info.data[45] !== 1) return null;
  if (!info.owner.equals(TOKEN_PROGRAM_ID) && !info.owner.equals(TOKEN_2022_PROGRAM_ID)) return null;
  return info.data[44]!;
}

export type Reading =
  /** A number moving toward a target: supply down to it, locked tokens, locked liquidity, pool total or stake up to it. */
  | {
      type: "quantity";
      current: bigint;
      target: bigint;
      direction: "atMost" | "atLeast";
      decimals: number;
      unit: string;
      met: boolean;
      /** 0..1, how close the metric is to the target. */
      progress: number;
      note?: string;
      /** Stake pool markets: whether the pool has recorded its total at the start of the market's epoch. */
      snapshot?: "pending" | "recorded";
      /** DAMM markets: the pool's token pair ("SOL-USDC"), which the target mint alone does not name. */
      pair?: string;
    }
  /** A one-way switch: an authority that is either still live or revoked, or a flag that is set or not. */
  | {
      type: "authority";
      what: string;
      authority: string | null;
      met: boolean;
      /** Wording for the two states when "<what> revoked" and "still live" do not fit. */
      words?: { subject: string; met: string; open: string };
    }
  | { type: "unavailable"; reason: string };

type Quantity = Extract<Reading, { type: "quantity" }>;
type Authority = Extract<Reading, { type: "authority" }>;

/** The words for an authority reading: "Mint authority" + "revoked", "Metadata" + "still mutable". */
export function authorityWords(reading: Authority) {
  const subject = reading.words?.subject ?? reading.what;
  const state = reading.met ? (reading.words?.met ?? "revoked") : (reading.words?.open ?? "still live");
  return { subject, state, badge: `${state.charAt(0).toUpperCase()}${state.slice(1)}` };
}

function quantity(
  current: bigint,
  target: bigint,
  direction: "atMost" | "atLeast",
  decimals: number,
  unit: string,
  note?: string,
): Quantity {
  const met = direction === "atMost" ? current <= target : current >= target;
  let progress: number;
  if (met) progress = 1;
  else if (direction === "atLeast") progress = target === BigInt(0) ? 1 : Number((current * BigInt(10_000)) / target) / 10_000;
  // Supply going down: the target's share of the current supply.
  else progress = current === BigInt(0) ? 1 : Number((target * BigInt(10_000)) / current) / 10_000;
  return { type: "quantity", current, target, direction, decimals, unit, met, progress, note };
}

/**
 * A stake pool market reads the pool's total at the start of its epoch, which the pool records itself
 * (`last_epoch_total_lamports`) on its first balance update of that epoch. Until then the pool's total
 * now is shown; once a later epoch has overwritten the record, the market can only resolve NO.
 */
function stakePoolReading(market: MarketAccount, metric: Info): Reading {
  const pool = parseStakePool(metric);
  if (!pool) return { type: "unavailable", reason: "The stake pool could not be read." };
  const epoch = measuredEpoch(market)!;
  const threshold = big(market.metricThreshold);
  const resolved = statusOf(market) !== "active";
  if (pool.lastUpdateEpoch === BigInt(epoch)) {
    const note = `The pool's total at the start of epoch ${epoch}, as the pool recorded it. ${
      resolved ? "The market resolved on this value." : "This is the value the market reads."
    }`;
    return {
      ...quantity(pool.lastEpochTotalLamports, threshold, "atLeast", SOL_DECIMALS, "SOL in the pool", note),
      snapshot: "recorded",
    };
  }
  if (pool.lastUpdateEpoch > BigInt(epoch)) {
    return {
      type: "unavailable",
      reason: resolved
        ? `The pool has recorded a later epoch since. The market resolved on its total at the start of epoch ${epoch}.`
        : `The pool has recorded a later epoch, so its total for epoch ${epoch} is gone. This market resolves NO.`,
    };
  }
  const note = resolved
    ? `The pool's total now. The market resolved on its total at the start of epoch ${epoch}.`
    : `The pool's total now. The market reads its total at the start of epoch ${epoch}, which the pool records on its first update of that epoch.`;
  return {
    ...quantity(pool.totalLamports, threshold, "atLeast", SOL_DECIMALS, "SOL in the pool", note),
    snapshot: "pending",
  };
}

/** A token amount short enough for a sentence: whole numbers from 1,000, two decimals from 1, more below. */
function approximate(amount: bigint, decimals: number) {
  const whole = amount / BigInt(10) ** BigInt(decimals);
  if (whole >= BigInt(1_000)) return formatUnits(amount, decimals, 0);
  return formatUnits(amount, decimals, whole >= BigInt(1) ? 2 : Math.min(decimals, 6));
}

/** The share `part` is of `total`, as a percentage: "59.74%", "<0.01%" for a sliver, never "100%" for less. */
function share(part: bigint, total: bigint) {
  const hundredths = (part * BigInt(10_000) + total / BigInt(2)) / total;
  if (part > BigInt(0) && hundredths === BigInt(0)) return "<0.01%";
  const shown = part < total && hundredths >= BigInt(10_000) ? BigInt(9_999) : hundredths;
  return `${Number(shown) / 100}%`;
}

/**
 * A DAMM v2 market reads the pool's permanently locked liquidity against `threshold << shift`. That is
 * shown as `locked >> shift` against the threshold, which compares exactly like the program's check.
 */
function dammReading(market: MarketAccount, metric: Info, tokens?: PoolTokens): Reading {
  const pool = parseDammPool(metric);
  if (!pool) return { type: "unavailable", reason: "The Meteora pool could not be read." };
  const shift = dammShift(market);
  const locked = pool.permanentLockLiquidity;
  const parts: string[] = [];
  if (pool.liquidity > BigInt(0)) {
    parts.push(`${share(locked, pool.liquidity)} of the pool's liquidity is locked forever`);
  }
  const amounts = tokens && locked > BigInt(0) ? dammAmounts(pool, locked) : null;
  if (tokens && amounts) {
    parts.push(
      `worth about ${approximate(amounts.a, tokens.a.decimals)} ${tokens.a.symbol} + ${approximate(amounts.b, tokens.b.decimals)} ${tokens.b.symbol} at today's price`,
    );
  }
  const pair = tokens ? `${tokens.a.symbol}-${tokens.b.symbol}` : undefined;
  const unit = `liquidity locked${pair ? ` in the ${pair} pool` : ""}${shift === 0 ? "" : `, in units of 2^${shift}`}`;
  return {
    ...quantity(
      locked >> BigInt(shift),
      big(market.metricThreshold),
      "atLeast",
      0,
      unit,
      parts.length > 0 ? `${parts.join(", ")}.` : undefined,
    ),
    pair,
  };
}

/**
 * Builds a market's reading from its fetched accounts: the metric account, the target mint (for
 * `LockedAtLeast`, whose metric is a token account), the vote account's current stake and a DAMM
 * pool's two tokens.
 */
export function readingFrom(
  market: MarketAccount,
  metric: Info,
  targetMint: Info,
  currentStake?: bigint | null,
  poolTokens?: PoolTokens,
): Reading {
  const threshold = big(market.metricThreshold);
  switch (kindOf(market)) {
    case "supplyAtMost": {
      const mint = parseMint(metric);
      if (!mint) return { type: "unavailable", reason: "The target mint could not be read." };
      return quantity(mint.supply, threshold, "atMost", mint.decimals, "tokens");
    }
    case "lockedAtLeast": {
      const locked = parseTokenAmount(metric);
      const decimals = parseMint(targetMint)?.decimals ?? 0;
      if (locked === null) return { type: "unavailable", reason: "The lock account could not be read." };
      return quantity(locked, threshold, "atLeast", decimals, "tokens locked");
    }
    case "mintAuthorityRevoked":
    case "freezeAuthorityRevoked": {
      const mint = parseMint(metric);
      if (!mint) return { type: "unavailable", reason: "The target mint could not be read." };
      const mintSide = kindOf(market) === "mintAuthorityRevoked";
      const authority = mintSide ? mint.mintAuthority : mint.freezeAuthority;
      return {
        type: "authority",
        what: mintSide ? "Mint authority" : "Freeze authority",
        authority: authority?.toBase58() ?? null,
        met: authority === null,
      };
    }
    case "immutable": {
      const authority = parseUpgradeAuthority(metric);
      if (authority === undefined) return { type: "unavailable", reason: "The program's ProgramData could not be read." };
      return { type: "authority", what: "Upgrade authority", authority: authority?.toBase58() ?? null, met: authority === null };
    }
    case "stakeAtLeast": {
      if (currentStake === undefined || currentStake === null) {
        return { type: "unavailable", reason: `Resolves on the stake in epoch ${measuredEpoch(market)}.` };
      }
      return quantity(
        currentStake,
        threshold,
        "atLeast",
        SOL_DECIMALS,
        "SOL staked",
        `Stake in the current epoch. The market reads epoch ${measuredEpoch(market)}.`,
      );
    }
    case "stakePoolTvlAtLeast":
      return stakePoolReading(market, metric);
    case "dammV2LockedAtLeast":
      return dammReading(market, metric, poolTokens);
    case "metadataImmutable": {
      const metadata = parseMetadata(metric, market.targetPubkey);
      if (!metadata) return { type: "unavailable", reason: "The token's metadata account could not be read." };
      return {
        type: "authority",
        what: "Metadata update authority",
        // The account keeps the old key once immutable; nobody holds the power any more.
        authority: metadata.isMutable ? metadata.updateAuthority.toBase58() : null,
        met: !metadata.isMutable,
        words: { subject: "Metadata", met: "immutable", open: "still mutable" },
      };
    }
  }
}

const SOL_KINDS: Kind[] = ["stakeAtLeast", "stakePoolTvlAtLeast"];

/** The goal's threshold as the reader sees it: lamports as SOL, token amounts with the reading's decimals. */
function thresholdText(market: MarketAccount, reading?: Reading) {
  if (SOL_KINDS.includes(kindOf(market))) return formatUnits(big(market.metricThreshold), SOL_DECIMALS);
  return formatUnits(big(market.metricThreshold), reading?.type === "quantity" ? reading.decimals : 0);
}

/** A DAMM goal's liquidity: the threshold, times 2^shift when there is a shift. */
function liquidityText(market: MarketAccount, reading?: Reading) {
  const shift = dammShift(market);
  return `${thresholdText(market, reading)}${shift === 0 ? "" : ` × 2^${shift}`}`;
}

/** The goal in words, e.g. "Supply ≤ 500,000". `decimals` comes from the reading when known. */
export function goalText(market: MarketAccount, reading?: Reading): string {
  const threshold = thresholdText(market, reading);
  switch (kindOf(market)) {
    case "supplyAtMost":
      return `Supply falls to ${threshold} or less`;
    case "lockedAtLeast":
      return `${threshold} tokens locked forever`;
    case "mintAuthorityRevoked":
      return "Mint authority revoked";
    case "freezeAuthorityRevoked":
      return "Freeze authority revoked";
    case "immutable":
      return "Program made immutable";
    case "stakeAtLeast":
      return `${threshold} SOL staked in epoch ${measuredEpoch(market)}`;
    case "stakePoolTvlAtLeast":
      return `${threshold} SOL in the pool at the start of epoch ${measuredEpoch(market)}`;
    case "dammV2LockedAtLeast":
      return `${liquidityText(market, reading)} liquidity locked forever`;
    case "metadataImmutable":
      return "Metadata made immutable";
  }
}

/** How a market's target reads in a sentence: "$SYMBOL", the token name, or a short address. */
export function targetLabel(market: MarketAccount, name?: TokenName): string {
  if (name?.symbol) return name.symbol.startsWith("$") ? name.symbol : `$${name.symbol}`;
  if (name?.name) return name.name;
  return shortAddress(market.targetPubkey.toBase58());
}

/** The market as a yes/no question, e.g. "Will $BONK supply fall to 500,000?". */
export function questionText(market: MarketAccount, reading?: Reading, name?: TokenName): string {
  const target = targetLabel(market, name);
  const threshold = thresholdText(market, reading);
  switch (kindOf(market)) {
    case "supplyAtMost":
      return `Will ${target} supply fall to ${threshold}?`;
    case "lockedAtLeast":
      return `Will ${threshold} ${target} be locked forever?`;
    case "mintAuthorityRevoked":
      return `Will ${target} renounce its mint authority?`;
    case "freezeAuthorityRevoked":
      return `Will ${target} renounce its freeze authority?`;
    case "immutable":
      return `Will program ${target} become immutable?`;
    case "stakeAtLeast":
      return `Will ${target} have ${threshold} SOL staked in epoch ${measuredEpoch(market)}?`;
    case "stakePoolTvlAtLeast":
      return `Will ${target} have ${threshold} SOL staked at the start of epoch ${measuredEpoch(market)}?`;
    case "dammV2LockedAtLeast": {
      const pool = reading?.type === "quantity" && reading.pair ? `the ${reading.pair} pool` : `${target}'s pool`;
      return `Will ${liquidityText(market, reading)} liquidity be locked forever in ${pool}?`;
    }
    case "metadataImmutable":
      return `Will ${target} make its metadata immutable?`;
  }
}

/** The resolution rule in one sentence, for the market page. */
export function ruleText(market: MarketAccount): string {
  switch (kindOf(market)) {
    case "stakeAtLeast":
      return `Resolves on the vote account's stake in epoch ${measuredEpoch(market)}, read on-chain by anyone during that epoch. No oracle.`;
    case "stakePoolTvlAtLeast":
      return `Resolves on the pool's total at the start of epoch ${measuredEpoch(market)}, which the pool records itself. Anyone can resolve it once the pool has recorded it and before the pool's first update of the next epoch replaces it (then NO). No oracle.`;
    default:
      return "Resolves YES the moment the goal is met on-chain, by anyone, in the same transaction. Not met by the deadline: NO. No oracle, no dispute window.";
  }
}

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

/** Fetches `keys` in batches of 100 (`getMultipleAccountsInfo`), keyed by address. */
async function fetchInfos(connection: Connection, keys: PublicKey[]) {
  const infos = new Map<string, Info>();
  for (const batch of chunks(keys, 100)) {
    const results = await connection.getMultipleAccountsInfo(batch);
    batch.forEach((key, i) => infos.set(key.toBase58(), results[i] ?? null));
  }
  return infos;
}

/** Wrapped SOL has no Metaplex metadata, and a pool of it is the common case. */
const WRAPPED_SOL = "So11111111111111111111111111111111111111112";

/** Decimals and symbols of the two tokens of every DAMM pool among `markets`, keyed by pool address. */
async function fetchPoolTokens(
  connection: Connection,
  markets: { account: MarketAccount }[],
  infos: Map<string, Info>,
): Promise<Map<string, PoolTokens>> {
  const pools = new Map<string, DammPoolView>();
  for (const { account } of markets) {
    if (kindOf(account) !== "dammV2LockedAtLeast") continue;
    const pool = parseDammPool(infos.get(account.metricAccount.toBase58()) ?? null);
    if (pool) pools.set(account.metricAccount.toBase58(), pool);
  }
  const tokens = new Map<string, PoolTokens>();
  if (pools.size === 0) return tokens;

  const mints = new Map<string, PublicKey>();
  for (const pool of pools.values()) {
    for (const mint of [pool.tokenAMint, pool.tokenBMint]) mints.set(mint.toBase58(), mint);
  }
  const [mintInfos, names] = await Promise.all([
    fetchInfos(connection, [...mints.values()]),
    fetchTokenNames(connection, [...mints.values()]).catch(() => new Map<string, TokenName>()),
  ]);
  const tokenOf = (mint: PublicKey) => {
    const decimals = mintDecimals(mintInfos.get(mint.toBase58()) ?? null);
    if (decimals === null) return null;
    const address = mint.toBase58();
    const name = names.get(address);
    const symbol = address === WRAPPED_SOL ? "SOL" : name?.symbol || name?.name || shortAddress(address);
    return { symbol, decimals };
  };
  for (const [address, pool] of pools) {
    const [a, b] = [tokenOf(pool.tokenAMint), tokenOf(pool.tokenBMint)];
    if (a && b) tokens.set(address, { a, b });
  }
  return tokens;
}

/**
 * Reads every market's KPI in a few batched calls (`getMultipleAccountsInfo`, plus one
 * `getVoteAccounts` when `withStake` and a stake market is present, and one more batch for the tokens
 * of any DAMM pool). Keyed by market address.
 */
export async function fetchReadings(
  connection: Connection,
  markets: { publicKey: PublicKey; account: MarketAccount }[],
  { withStake = false } = {},
): Promise<Map<string, Reading>> {
  const keys = new Map<string, PublicKey>();
  for (const { account } of markets) {
    if (kindOf(account) === "stakeAtLeast") continue;
    keys.set(account.metricAccount.toBase58(), account.metricAccount);
    if (kindOf(account) === "lockedAtLeast") keys.set(account.targetPubkey.toBase58(), account.targetPubkey);
  }
  const infos = await fetchInfos(connection, [...keys.values()]);

  const stakes = new Map<string, bigint>();
  if (withStake && markets.some((m) => kindOf(m.account) === "stakeAtLeast")) {
    const { current, delinquent } = await connection.getVoteAccounts();
    for (const v of [...current, ...delinquent]) stakes.set(v.votePubkey, BigInt(v.activatedStake));
  }

  // The token amounts are a nicety: without them a DAMM reading still shows its locked share.
  const poolTokens = await fetchPoolTokens(connection, markets, infos).catch(() => new Map<string, PoolTokens>());

  const readings = new Map<string, Reading>();
  for (const { publicKey, account } of markets) {
    const stake = withStake ? (stakes.get(account.metricAccount.toBase58()) ?? BigInt(0)) : undefined;
    readings.set(
      publicKey.toBase58(),
      readingFrom(
        account,
        infos.get(account.metricAccount.toBase58()) ?? null,
        infos.get(account.targetPubkey.toBase58()) ?? null,
        stake,
        poolTokens.get(account.metricAccount.toBase58()),
      ),
    );
  }
  return readings;
}
