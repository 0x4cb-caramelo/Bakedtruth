// Reads a market's KPI the way the program's resolver does (same owners, layouts and comparisons),
// so the progress the app shows is the value `resolve` will read. Framework-free.

import { PublicKey, type AccountInfo, type Connection } from "@solana/web3.js";

import { formatUnits } from "./format";
import { BPF_LOADER_UPGRADEABLE_ID, TOKEN_PROGRAM_ID } from "./market";
import { big, kindOf, stakeEpoch, type MarketAccount } from "./view";

type Info = AccountInfo<Uint8Array> | null;

const view = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset, data.byteLength);
const u64 = (data: Uint8Array, at: number) => view(data).getBigUint64(at, true);
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

export type Reading =
  /** A number moving toward a target: supply down to it, locked tokens or stake up to it. */
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
    }
  /** A one-way switch: an authority that is either still live or revoked. */
  | { type: "authority"; what: string; authority: string | null; met: boolean }
  | { type: "unavailable"; reason: string };

function quantity(
  current: bigint,
  target: bigint,
  direction: "atMost" | "atLeast",
  decimals: number,
  unit: string,
  note?: string,
): Reading {
  const met = direction === "atMost" ? current <= target : current >= target;
  let progress: number;
  if (met) progress = 1;
  else if (direction === "atLeast") progress = target === BigInt(0) ? 1 : Number((current * BigInt(10_000)) / target) / 10_000;
  // Supply going down: the target's share of the current supply.
  else progress = current === BigInt(0) ? 1 : Number((target * BigInt(10_000)) / current) / 10_000;
  return { type: "quantity", current, target, direction, decimals, unit, met, progress, note };
}

/**
 * Builds a market's reading from its fetched accounts: the metric account, the target mint (for
 * `LockedAtLeast`, whose metric is a token account) and the vote account's current stake.
 */
export function readingFrom(
  market: MarketAccount,
  metric: Info,
  targetMint: Info,
  currentStake?: bigint | null,
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
      if (locked === null) return { type: "unavailable", reason: "The incinerator's token account could not be read." };
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
        return { type: "unavailable", reason: `Resolves on the stake in epoch ${stakeEpoch(market)}.` };
      }
      return quantity(
        currentStake,
        threshold,
        "atLeast",
        9,
        "SOL staked",
        `Stake in the current epoch. The market reads epoch ${stakeEpoch(market)}.`,
      );
    }
  }
}

/** The goal in words, e.g. "Supply ≤ 500,000". `decimals` comes from the reading when known. */
export function goalText(market: MarketAccount, reading?: Reading): string {
  const decimals = reading?.type === "quantity" ? reading.decimals : 0;
  const threshold = formatUnits(big(market.metricThreshold), kindOf(market) === "stakeAtLeast" ? 9 : decimals);
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
      return `${threshold} SOL staked in epoch ${stakeEpoch(market)}`;
  }
}

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

/**
 * Reads every market's KPI in a few batched calls (`getMultipleAccountsInfo`, plus one
 * `getVoteAccounts` when `withStake` and a stake market is present). Keyed by market address.
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
  const infos = new Map<string, Info>();
  for (const batch of chunks([...keys.values()], 100)) {
    const results = await connection.getMultipleAccountsInfo(batch);
    batch.forEach((key, i) => infos.set(key.toBase58(), results[i] ?? null));
  }

  const stakes = new Map<string, bigint>();
  if (withStake && markets.some((m) => kindOf(m.account) === "stakeAtLeast")) {
    const { current, delinquent } = await connection.getVoteAccounts();
    for (const v of [...current, ...delinquent]) stakes.set(v.votePubkey, BigInt(v.activatedStake));
  }

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
      ),
    );
  }
  return readings;
}
