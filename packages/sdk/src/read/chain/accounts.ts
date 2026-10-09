/**
 * Purpose: the other programs' accounts the four non-price kinds read, parsed the way the program
 *          parses them, owner first: a classic SPL Token mint (`SupplyAtMost`), a Meteora DAMM v2 pool
 *          (`DammV2LockedAtLeast`), an SPL stake pool (`StakePoolTvlAtLeast`), a vote account
 *          (`StakeAtLeast`). Mirrors programs/brot-markets/src/readers/{spl_mint,damm_v2,stake_pool,
 *          vote_stake}.rs.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Each refuses with the reader's own errors, in the program's order: `ReaderWrongOwner` before a byte
 * is read, then `ReaderBadLayout`. Token-2022 fails the mint's owner check on purpose.
 */
import { refuse } from "../errors";
import { bytesEqual } from "../bytes";
import { DAMM_V2_PROGRAM_ID, SPL_TOKEN_PROGRAM_ID, STAKE_POOL_PROGRAM_ID, VOTE_PROGRAM_ID } from "../constants";
import { I128_MAX } from "../math/integers";
import { Cursor } from "./cursor";

/** A classic SPL Token mint: whether it can still mint, and its supply (`read_mint`). */
export type MintReading = { mintAuthorityLive: boolean; supply: bigint };

/** An SPL `COption<Pubkey>`: a u32 tag, exactly 0 or 1, then 32 bytes either way. */
function coptionIsSome(cursor: Cursor): boolean {
  const tag = cursor.u32();
  if (tag > 1) refuse("ReaderBadLayout");
  cursor.skip(32);
  return tag === 1;
}

export function readMint(owner: string, data: Uint8Array): MintReading {
  if (owner !== SPL_TOKEN_PROGRAM_ID) refuse("ReaderWrongOwner");
  if (data.length !== 82) refuse("ReaderBadLayout");
  const cursor = new Cursor(data);
  const mintAuthorityLive = coptionIsSome(cursor);
  const supply = cursor.u64();
  cursor.skip(1); // decimals
  if (cursor.u8() !== 1) refuse("ReaderBadLayout");
  coptionIsSome(cursor); // the freeze authority: its tag must be valid
  return { mintAuthorityLive, supply };
}

/** `sha256("account:Pool")[..8]`; `permanent_lock_liquidity` (u128) sits at byte 552 of 1,112. */
const POOL_DISCRIMINATOR = [0xf1, 0x9a, 0x6d, 0x04, 0x11, 0xb1, 0x6d, 0xbc] as const;
const POOL_LEN = 1_112;
const PERMANENT_LOCK_LIQUIDITY_AT = 552;

/** A DAMM v2 pool's permanently locked liquidity, saturated at `i128::MAX` (`locked_liquidity`). */
export function readLockedLiquidity(owner: string, data: Uint8Array): bigint {
  if (owner !== DAMM_V2_PROGRAM_ID) refuse("ReaderWrongOwner");
  if (data.length !== POOL_LEN) refuse("ReaderBadLayout");
  const cursor = new Cursor(data);
  if (!bytesEqual(cursor.take(8), POOL_DISCRIMINATOR)) refuse("ReaderBadLayout");
  cursor.skip(PERMANENT_LOCK_LIQUIDITY_AT - 8);
  const locked = cursor.u128();
  return locked > I128_MAX ? I128_MAX : locked;
}

/** What the stake pool reader takes from a pool (`StakePoolView`). */
export type StakePoolView = {
  totalLamports: bigint;
  lastUpdateEpoch: bigint;
  lastEpochTotalLamports: bigint;
};

/** A stake pool `FutureEpoch<Fee>`: tag 0, or 1 and 2 with a 16-byte fee. */
function skipFutureFee(cursor: Cursor): void {
  const tag = cursor.u8();
  if (tag > 2) refuse("ReaderBadLayout");
  if (tag !== 0) cursor.skip(16);
}

/** The Borsh `StakePool` walked to `last_epoch_total_lamports` (`parse_stake_pool`), owner first. */
export function readStakePool(owner: string, data: Uint8Array): StakePoolView {
  if (owner !== STAKE_POOL_PROGRAM_ID) refuse("ReaderWrongOwner");
  const c = new Cursor(data);
  if (c.u8() !== 1) refuse("ReaderBadLayout");
  c.skip(161);
  c.skip(32); // pool_mint
  c.skip(64);
  const totalLamports = c.u64();
  c.skip(8); // pool_token_supply
  const lastUpdateEpoch = c.u64();
  c.skip(64); // lockup and epoch_fee
  skipFutureFee(c); // next_epoch_fee
  c.skipOption(32); // preferred deposit validator
  c.skipOption(32); // preferred withdraw validator
  c.skip(32); // stake deposit and withdrawal fees
  skipFutureFee(c); // next_stake_withdrawal_fee
  c.skip(1); // stake_referral_fee
  c.skipOption(32); // sol_deposit_authority
  c.skip(16); // sol_deposit_fee
  c.skip(1); // sol_referral_fee
  c.skipOption(32); // sol_withdraw_authority
  c.skip(16); // sol_withdrawal_fee
  skipFutureFee(c); // next_sol_withdrawal_fee
  c.skip(8); // last_epoch_pool_token_supply
  return { totalLamports, lastUpdateEpoch, lastEpochTotalLamports: c.u64() };
}

/** A vote account: a known version at its size, initialized (`parse_vote_account`), owner first. */
export function readVoteAccount(owner: string, data: Uint8Array): "V1_14_11" | "V3" | "V4" {
  if (owner !== VOTE_PROGRAM_ID) refuse("ReaderWrongOwner");
  const tag = new Cursor(data).u32();
  const shape =
    tag === 1
      ? (["V1_14_11", 3_731, 86] as const)
      : tag === 2
        ? (["V3", 3_762, 118] as const)
        : tag === 3
          ? (["V4", 3_762, null] as const)
          : refuse("ReaderBadLayout");
  const [version, len, initializedEnd] = shape;
  if (data.length !== len) refuse("ReaderBadLayout");
  if (initializedEnd !== null && data.subarray(4, initializedEnd).every((byte) => byte === 0)) {
    refuse("ReaderBadLayout");
  }
  return version;
}
