/**
 * Purpose: the few System Program and classic SPL Token instructions the ops scripts need to make a burn
 *          campaign's mint (`SupplyAtMost`): create an account, transfer SOL, initialize a mint and a token
 *          account, mint, revoke the mint authority, burn. Written by hand from the programs' layouts, with no
 *          new dependency.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Layouts: System Program `CreateAccount` (0) and `Transfer` (2), a u32 tag then u64s and an address; SPL Token
 * `InitializeMint2` (20), `InitializeAccount3` (18), `MintTo` (7), `SetAuthority` (6), `Burn` (8), a u8 tag then
 * the fields, `COption<Pubkey>` as a u8 tag and the key. The burn kind's reader accepts classic SPL Token only.
 */
import {
  AccountRole,
  getAddressEncoder,
  getU64Encoder,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import { SPL_TOKEN_PROGRAM_ID, SYSTEM_PROGRAM_ID } from "@brot/sdk/read";

/** Sizes of a classic SPL Token mint and token account. */
export const MINT_LEN = 82;
export const TOKEN_ACCOUNT_LEN = 165;

const key = (address: Address) => getAddressEncoder().encode(address);
const u64 = (value: bigint) => getU64Encoder().encode(value);
const bytes = (...parts: (Uint8Array | ArrayLike<number>)[]) => Uint8Array.from(parts.flatMap((p) => Array.from(p)));
const u32 = (value: number) => Uint8Array.of(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, value >>> 24);
const signer = (s: TransactionSigner, writable: boolean) => ({
  address: s.address,
  role: writable ? AccountRole.WRITABLE_SIGNER : AccountRole.READONLY_SIGNER,
  signer: s,
});
const writable = (address: Address) => ({ address, role: AccountRole.WRITABLE });

/** System Program `CreateAccount`: `space` bytes owned by `owner`, funded by `payer`, the new account signing. */
export function createAccountIx(
  payer: TransactionSigner,
  account: TransactionSigner,
  lamports: bigint,
  space: number,
  owner: Address,
): Instruction {
  return {
    programAddress: SYSTEM_PROGRAM_ID,
    accounts: [signer(payer, true), signer(account, true)],
    data: bytes(u32(0), u64(lamports), u64(BigInt(space)), key(owner)),
  };
}

/** System Program `Transfer`. */
export function transferIx(from: TransactionSigner, to: Address, lamports: bigint): Instruction {
  return {
    programAddress: SYSTEM_PROGRAM_ID,
    accounts: [signer(from, true), writable(to)],
    data: bytes(u32(2), u64(lamports)),
  };
}

/** `InitializeMint2`: decimals, the mint authority, no freeze authority. */
export function initializeMintIx(mint: Address, decimals: number, authority: Address): Instruction {
  return {
    programAddress: SPL_TOKEN_PROGRAM_ID,
    accounts: [writable(mint)],
    data: bytes([20, decimals], key(authority), [0], new Uint8Array(32)),
  };
}

/** `InitializeAccount3`: a token account of `mint` owned by `owner`. */
export function initializeTokenAccountIx(account: Address, mint: Address, owner: Address): Instruction {
  return {
    programAddress: SPL_TOKEN_PROGRAM_ID,
    accounts: [writable(account), { address: mint, role: AccountRole.READONLY }],
    data: bytes([18], key(owner)),
  };
}

/** `MintTo`: `amount` base units to `destination`, signed by the mint authority. */
export function mintToIx(
  mint: Address,
  destination: Address,
  authority: TransactionSigner,
  amount: bigint,
): Instruction {
  return {
    programAddress: SPL_TOKEN_PROGRAM_ID,
    accounts: [writable(mint), writable(destination), signer(authority, false)],
    data: bytes([7], u64(amount)),
  };
}

/** `SetAuthority(MintTokens, None)`: the mint authority revoked for good, so the supply can only fall. */
export function revokeMintAuthorityIx(mint: Address, authority: TransactionSigner): Instruction {
  return {
    programAddress: SPL_TOKEN_PROGRAM_ID,
    accounts: [writable(mint), signer(authority, false)],
    data: Uint8Array.of(6, 0, 0),
  };
}

/** `Burn`: `amount` base units out of `account`, signed by its owner; the mint's supply falls by as much. */
export function burnIx(account: Address, mint: Address, owner: TransactionSigner, amount: bigint): Instruction {
  return {
    programAddress: SPL_TOKEN_PROGRAM_ID,
    accounts: [writable(account), writable(mint), signer(owner, false)],
    data: bytes([8], u64(amount)),
  };
}

/** A mint's supply, from its bytes (u64 at offset 36). */
export const mintSupply = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset).getBigUint64(36, true);
