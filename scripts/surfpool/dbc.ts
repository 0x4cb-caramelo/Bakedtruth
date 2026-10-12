/**
 * Purpose: what the graduation run needs of Meteora DBC on a surfnet: a pool and its config read through the SDK's
 *          readers, with the vaults and the base mint its swap names, and the instructions that complete a curve
 *          with DBC's own `swap2` in `PartialFill` mode: the buyer's wSOL account funded and synced, its base token
 *          account, then the swap, which takes only what the curve still needs and stamps when it completed.
 * Version: 0.0.1
 * Sprint:  the sixth kind, after 05 (docs/technical/meteora-readers-plan.md section 4.6)
 *
 * The accounts of `swap2` follow DBC's `SwapCtx` (programs/dynamic-bonding-curve/src/instructions/swap/ix_swap.rs,
 * read on its main branch on 2026-10-12): the pool authority, the config, the pool, the input and output token
 * accounts, the base and quote vaults, the base and quote mints, the payer, the two token programs, the optional
 * referral account (the program id when absent, as Anchor reads an empty option), the event authority and the
 * program; the instructions sysvar may follow, which DBC's rate limiter reads when it applies.
 */
import { createHash } from "node:crypto";

import {
  AccountRole,
  address,
  getAddressDecoder,
  getAddressEncoder,
  getProgramDerivedAddress,
  getU64Encoder,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import {
  DBC_PROGRAM_ID,
  readCurveConfig,
  readCurvePool,
  SPL_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  WSOL_MINT,
} from "@brot/sdk/read";

import { transferIx } from "../validator/spl-token";
import { account, type Rpc } from "./rpc";

const ATA_PROGRAM_ID = address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const INSTRUCTIONS_SYSVAR = address("Sysvar1nstructions1111111111111111111111111");
const COMPUTE_BUDGET_ID = address("ComputeBudget111111111111111111111111111111");
/** `sha256("global:swap2")[..8]`, and `SwapMode::PartialFill`. */
const SWAP2 = createHash("sha256").update("global:swap2").digest().subarray(0, 8);
const PARTIAL_FILL = 1;
/** Offsets of the pool's base mint, base vault, quote vault and token type (0 SPL Token, 1 Token-2022). */
const AT = { baseMint: 136, baseVault: 168, quoteVault: 200, poolType: 304 } as const;

/** A DBC curve as the surfnet serves it: the fields the reader reads, and the accounts the swap names. */
export type Curve = {
  pool: Address;
  config: Address;
  threshold: bigint;
  raised: bigint;
  stage: number;
  stamp: bigint;
  baseMint: Address;
  baseVault: Address;
  quoteVault: Address;
  baseTokenProgram: Address;
};

/** The pool and its config, fetched from mainnet by the fork on their first read; refused unless priced in SOL. */
export async function readCurve(rpc: Rpc, pool: Address): Promise<Curve> {
  const held = await account(rpc, pool);
  if (!held) throw new Error(`${pool} does not exist on the fork`);
  const read = readCurvePool(held.owner, held.data);
  const configHeld = await account(rpc, read.config);
  if (!configHeld) throw new Error(`the config ${read.config} does not exist on the fork`);
  const config = readCurveConfig(configHeld.owner, configHeld.data);
  if (config.quoteMint !== WSOL_MINT) throw new Error(`${pool}'s curve is priced in ${config.quoteMint}, not SOL`);
  const key = (at: number) => getAddressDecoder().decode(held.data.subarray(at, at + 32));
  return {
    pool,
    config: read.config,
    threshold: config.threshold,
    raised: read.quoteReserve,
    stage: read.stage,
    stamp: read.finishCurveTimestamp,
    baseMint: key(AT.baseMint),
    baseVault: key(AT.baseVault),
    quoteVault: key(AT.quoteVault),
    baseTokenProgram: held.data[AT.poolType] === 1 ? TOKEN_2022_PROGRAM_ID : SPL_TOKEN_PROGRAM_ID,
  };
}

const text = (s: string) => new TextEncoder().encode(s);
const key = (a: Address) => getAddressEncoder().encode(a);
type Seeds = Parameters<typeof getProgramDerivedAddress>[0]["seeds"];
const pda = async (seeds: Seeds, program: Address) =>
  (await getProgramDerivedAddress({ programAddress: program, seeds }))[0];
const ro = (a: Address) => ({ address: a, role: AccountRole.READONLY });
const rw = (a: Address) => ({ address: a, role: AccountRole.WRITABLE });
const bytes = (...parts: ArrayLike<number>[]) => Uint8Array.from(parts.flatMap((p) => Array.from(p)));

/** The associated token account of `owner` for `mint` under `tokenProgram`. */
const associatedToken = (owner: Address, mint: Address, tokenProgram: Address) =>
  pda([key(owner), key(tokenProgram), key(mint)], ATA_PROGRAM_ID);

/** Associated Token `CreateIdempotent` (1): `payer` creates `owner`'s account for `mint`, or finds it made. */
function createAssociatedIx(payer: TransactionSigner, at: Address, owner: Address, mint: Address, program: Address) {
  const accounts = [{ address: payer.address, role: AccountRole.WRITABLE_SIGNER, signer: payer }, rw(at), ro(owner)];
  accounts.push(ro(mint), ro(SYSTEM_PROGRAM_ID), ro(program));
  return { programAddress: ATA_PROGRAM_ID, accounts, data: Uint8Array.of(1) } as Instruction;
}

/**
 * Completes `curve` with up to `lamports` of `buyer`'s SOL: a compute limit, the wSOL account created, funded and
 * synced (SPL Token `SyncNative`, 17), the base token account created, then DBC's `swap2` in `PartialFill` mode with
 * no minimum out, which takes what the curve still needs and leaves the rest in the wSOL account.
 */
export async function completeCurveIxs(buyer: TransactionSigner, curve: Curve, lamports: bigint) {
  const wsol = await associatedToken(buyer.address, WSOL_MINT, SPL_TOKEN_PROGRAM_ID);
  const base = await associatedToken(buyer.address, curve.baseMint, curve.baseTokenProgram);
  const poolAuthority = await pda([text("pool_authority")], DBC_PROGRAM_ID);
  const eventAuthority = await pda([text("__event_authority")], DBC_PROGRAM_ID);
  const swapAccounts = [ro(poolAuthority), ro(curve.config), rw(curve.pool), rw(wsol), rw(base)];
  swapAccounts.push(rw(curve.baseVault), rw(curve.quoteVault), ro(curve.baseMint), ro(WSOL_MINT));
  const payer = { address: buyer.address, role: AccountRole.READONLY_SIGNER, signer: buyer };
  const tail = [ro(curve.baseTokenProgram), ro(SPL_TOKEN_PROGRAM_ID), ro(DBC_PROGRAM_ID)];
  tail.push(ro(eventAuthority), ro(DBC_PROGRAM_ID), ro(INSTRUCTIONS_SYSVAR));
  const u64 = (v: bigint) => getU64Encoder().encode(v);
  const swap: Instruction = {
    programAddress: DBC_PROGRAM_ID,
    accounts: [...swapAccounts, payer, ...tail],
    data: bytes(SWAP2, u64(lamports), u64(0n), [PARTIAL_FILL]),
  };
  const limit: Instruction = {
    programAddress: COMPUTE_BUDGET_ID,
    accounts: [],
    data: Uint8Array.of(2, 0x40, 0x42, 0x0f, 0),
  };
  return [
    limit,
    createAssociatedIx(buyer, wsol, buyer.address, WSOL_MINT, SPL_TOKEN_PROGRAM_ID),
    transferIx(buyer, wsol, lamports),
    { programAddress: SPL_TOKEN_PROGRAM_ID, accounts: [rw(wsol)], data: Uint8Array.of(17) } as Instruction,
    createAssociatedIx(buyer, base, buyer.address, curve.baseMint, curve.baseTokenProgram),
    swap,
  ];
}
