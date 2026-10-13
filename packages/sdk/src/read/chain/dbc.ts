/**
 * Purpose: the Meteora Dynamic Bonding Curve (DBC) accounts the graduation kind (`DbcGraduated`) reads, parsed the
 *          way the program parses them, owner first: the `VirtualPool` (its config, the quote raised, the stage, the
 *          second the curve completed) and its `PoolConfig` (the quote mint and the threshold). Mirrors
 *          programs/brot-markets/src/readers/dbc_graduation.rs and dbc_graduation/config.rs. Plus, for the screens
 *          only, the pool's base mint, whose symbol names the curve.
 * Version: 0.1.1 (the base mint, display only)
 * Sprint:  the sixth kind, after 05 (docs/technical/meteora-readers-plan.md)
 *
 * Each refuses with the reader's own errors, in the program's order: `ReaderWrongOwner` before a byte is read, then
 * `ReaderBadLayout`; a `TransferHookPool`, the same layout under another discriminator, is `CurveHasTransferHook`.
 */
import { getAddressDecoder, type Address } from "@solana/kit";

import { isRefusal, refuse } from "../errors";
import { bytesEqual } from "../bytes";
import { DBC_PROGRAM_ID } from "../constants";
import { Cursor } from "./cursor";

/** `sha256("account:VirtualPool")[..8]` and `sha256("account:TransferHookPool")[..8]`: both pools are 424 bytes. */
const POOL_DISCRIMINATOR = [0xd5, 0xe0, 0x05, 0xd1, 0x62, 0x45, 0x77, 0x5c] as const;
const TRANSFER_HOOK_POOL_DISCRIMINATOR = [0xed, 0xdb, 0xb8, 0x17, 0x2a, 0xbd, 0xa9, 0x23] as const;
const POOL_LEN = 424;
/** `sha256("account:PoolConfig")[..8]`: a config is 1,048 bytes. */
const CONFIG_DISCRIMINATOR = [0x1a, 0x6c, 0x0e, 0x7b, 0x74, 0xe6, 0x81, 0x2b] as const;
const CONFIG_LEN = 1_048;
/** The fields' offsets, the discriminator counted, as the program pins them on captured mainnet bytes. */
export const DBC_OFFSETS = {
  config: 72,
  quoteReserve: 240,
  migrationProgress: 308,
  finishCurveTimestamp: 344,
  quoteMint: 8,
  threshold: 264,
} as const;
/** The last stage DBC defines (`CreatedPool`); a larger byte is a layout the reader does not know. */
const LAST_STAGE = 3;

/** What the graduation reader takes from a pool (`CurvePool`). */
export type CurvePool = { config: Address; quoteReserve: bigint; stage: number; finishCurveTimestamp: bigint };
/** What it takes from the pool's config at opening (`CurveConfig`). */
export type CurveConfig = { quoteMint: Address; threshold: bigint };

const decodeAddress = (bytes: Uint8Array): Address => getAddressDecoder().decode(bytes);

/** A DBC `VirtualPool` (`read_pool`): the owner, the size, the discriminator, then the four fields. */
export function readCurvePool(owner: string, data: Uint8Array): CurvePool {
  if (owner !== DBC_PROGRAM_ID) refuse("ReaderWrongOwner");
  if (data.length !== POOL_LEN) refuse("ReaderBadLayout");
  const c = new Cursor(data);
  const discriminator = c.take(8);
  if (bytesEqual(discriminator, TRANSFER_HOOK_POOL_DISCRIMINATOR)) refuse("CurveHasTransferHook");
  if (!bytesEqual(discriminator, POOL_DISCRIMINATOR)) refuse("ReaderBadLayout");
  c.skip(DBC_OFFSETS.config - 8);
  const config = decodeAddress(c.take(32));
  c.skip(DBC_OFFSETS.quoteReserve - DBC_OFFSETS.config - 32);
  const quoteReserve = c.u64();
  c.skip(DBC_OFFSETS.migrationProgress - DBC_OFFSETS.quoteReserve - 8);
  const stage = c.u8();
  if (stage > LAST_STAGE) refuse("ReaderBadLayout");
  c.skip(DBC_OFFSETS.finishCurveTimestamp - DBC_OFFSETS.migrationProgress - 1);
  return { config, quoteReserve, stage, finishCurveTimestamp: c.u64() };
}

/** A DBC `PoolConfig` (`read_config`): the owner, the size, the discriminator, the quote mint, the threshold. */
export function readCurveConfig(owner: string, data: Uint8Array): CurveConfig {
  if (owner !== DBC_PROGRAM_ID) refuse("ReaderWrongOwner");
  if (data.length !== CONFIG_LEN) refuse("ReaderBadLayout");
  const c = new Cursor(data);
  if (!bytesEqual(c.take(8), CONFIG_DISCRIMINATOR)) refuse("ReaderBadLayout");
  const quoteMint = decodeAddress(c.take(32));
  c.skip(DBC_OFFSETS.threshold - DBC_OFFSETS.quoteMint - 32);
  return { quoteMint, threshold: c.u64() };
}

/** `base_mint`, the token the curve sells, after the volatility tracker, the config and the creator. */
const BASE_MINT_AT = 136;

/**
 * A DBC pool's base mint, after the same refusals as `readCurvePool`. Display only: the program never reads it, and the
 * site names a graduation campaign's curve by this token's symbol (./token-symbol.ts).
 */
export function readCurveBaseMint(owner: string, data: Uint8Array): Address {
  readCurvePool(owner, data);
  return decodeAddress(data.slice(BASE_MINT_AT, BASE_MINT_AT + 32));
}

/** The curve has completed (`CurvePool::graduated`): its stage left 0, and nothing brings it back. */
export const curveGraduated = (pool: CurvePool): boolean => pool.stage >= 1;

/** The config a DBC pool names (what an opening passes after the nine slots), or `null` when it does not read as one. */
export function curveConfigOf(account: { owner: string; data: Uint8Array } | null): Address | null {
  if (!account) return null;
  try {
    return readCurvePool(account.owner, account.data).config;
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}
