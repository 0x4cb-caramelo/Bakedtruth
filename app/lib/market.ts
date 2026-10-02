// Framework-free client helpers for pred-provable: addresses, the program's integer math, event
// decoding and ATA setup. The bun + LiteSVM suite imports this module, so every quote here is
// checked against the program.

import { BorshEventCoder, convertIdlToCamelCase, type Idl, type IdlEvents } from "@anchor-lang/core";
import { PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
// Browsers have no global Buffer.
import { Buffer } from "buffer";

// Synced from target/ by `bun run sync-idl` after `anchor build`.
import idl from "./idl/pred_provable.json";
import type { PredProvable } from "./idl/pred_provable";

const constant = (name: string) => {
  const c = idl.constants.find((c) => c.name === name);
  if (!c) throw new Error(`IDL constant ${name} not found`);
  return c.value;
};

export const PROGRAM_ID = new PublicKey(idl.address);
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
export const BPF_LOADER_UPGRADEABLE_ID = new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
/** Address with no private key; tokens in its associated token accounts are locked forever. */
export const INCINERATOR = new PublicKey("1nc1nerator11111111111111111111111111111111");

/** Collateral mint the program was built for (Circle devnet USDC unless built with `--features mainnet`). */
export const USDC_MINT = new PublicKey(constant("USDC_MINT"));
export const USDC_DECIMALS = Number(constant("USDC_DECIMALS"));
/** Outcome and LP tokens use USDC's decimals: one base unit redeems for one USDC base unit. */
export const OUTCOME_DECIMALS = Number(constant("OUTCOME_DECIMALS"));
export const BPS_DENOMINATOR = BigInt(constant("BPS_DENOMINATOR"));
export const SWAP_FEE_BPS = BigInt(constant("SWAP_FEE_BPS"));
/** Smallest budget, YES purchase, pair mint and first pool deposit (1 USDC). */
export const MIN_STAKE = BigInt(constant("MIN_STAKE"));

// --- Addresses ------------------------------------------------------------------------------

const pda = (seeds: (Buffer | Uint8Array)[], programId = PROGRAM_ID) =>
  PublicKey.findProgramAddressSync(seeds, programId)[0];

const u64le = (value: bigint) => {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64LE(value);
  return bytes;
};

export const marketPda = (sponsor: PublicKey, marketId: bigint) =>
  pda([Buffer.from("market"), sponsor.toBuffer(), u64le(marketId)]);
export const yesMintPda = (market: PublicKey) => pda([Buffer.from("yes_mint"), market.toBuffer()]);
export const noMintPda = (market: PublicKey) => pda([Buffer.from("no_mint"), market.toBuffer()]);
export const vaultPda = (market: PublicKey) => pda([Buffer.from("vault"), market.toBuffer()]);
export const lpMintPda = (market: PublicKey) => pda([Buffer.from("lp_mint"), market.toBuffer()]);

/** Associated token account of `owner` for a classic SPL Token `mint` (owner may be a PDA). */
export const ataAddress = (owner: PublicKey, mint: PublicKey) =>
  pda([owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], ASSOCIATED_TOKEN_PROGRAM_ID);

/** The pool's YES and NO token accounts: associated token accounts of the market PDA. */
export const poolAccounts = (market: PublicKey) => ({
  yes: ataAddress(market, yesMintPda(market)),
  no: ataAddress(market, noMintPda(market)),
});

/** Metric account of a `LockedAtLeast` market on `mint`. */
export const incineratorAta = (mint: PublicKey) => ataAddress(INCINERATOR, mint);

/** Metric account of an `Immutable` market on `programId`. */
export const programDataPda = (programId: PublicKey) => pda([programId.toBuffer()], BPF_LOADER_UPGRADEABLE_ID);

/**
 * Creates `owner`'s associated token account for `mint` if it does not exist. Prepend it to
 * `redeem`, `burn_pair` and `withdraw_budget` (they take an existing USDC account), and to a
 * `LockedAtLeast` `create_market` for the incinerator's account (`owner = INCINERATOR`).
 */
export function createAtaIdempotentIx(payer: PublicKey, owner: PublicKey, mint: PublicKey) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ataAddress(owner, mint), isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]), // CreateIdempotent
  });
}

// --- Math (mirrors the program; all amounts in base units) ---------------------------------

export type Pool = { yes: bigint; no: bigint };
export type Side = "yes" | "no";

const ceilDiv = (a: bigint, b: bigint) => (a + b - BigInt(1)) / b;
const min = (a: bigint, b: bigint) => (a < b ? a : b);

export function isqrt(n: bigint): bigint {
  if (n < BigInt(2)) return n;
  let x = n;
  let y = (x + BigInt(1)) / BigInt(2);
  while (y < x) [x, y] = [y, (y + n / y) / BigInt(2)];
  return x;
}

/** USDC a buyer pays for `amount` YES from the sponsor sale: the price, rounded up. */
export const salePrice = (amount: bigint, yesPriceBps: number) =>
  ceilDiv(amount * BigInt(yesPriceBps), BPS_DENOMINATOR);

/** Largest `buy_yes` amount the remaining `budget` can cover, or 0 if below `MIN_STAKE`. */
export function maxSaleAmount(budget: bigint, yesPriceBps: number): bigint {
  // The budget covers amount - ceil(amount * p / N) = floor(amount * (N - p) / N).
  const max = ((budget + BigInt(1)) * BPS_DENOMINATOR - BigInt(1)) / (BPS_DENOMINATOR - BigInt(yesPriceBps));
  return max >= MIN_STAKE ? max : BigInt(0);
}

/** Tokens out of the pool for `amountIn`: 1% fee kept by providers, constant product on the rest. */
export function swapQuote(reserveIn: bigint, reserveOut: bigint, amountIn: bigint): bigint {
  if (reserveIn === BigInt(0) || reserveOut === BigInt(0)) return BigInt(0);
  const afterFee = (amountIn * (BPS_DENOMINATOR - SWAP_FEE_BPS)) / BPS_DENOMINATOR;
  return (reserveOut * afterFee) / (reserveIn + afterFee);
}

const reserves = (side: Side, pool: Pool) => (side === "yes" ? [pool.yes, pool.no] : [pool.no, pool.yes]);

/**
 * Buy `side` with `usdc` in one transaction: `mint_pair(usdc)` then `swap` the other side in.
 * `swapOut` is the swap's quote (pass it, minus slippage, as `min_out`).
 */
export function buyQuote(side: Side, usdc: bigint, pool: Pool) {
  const [reserveSide, reserveOther] = reserves(side, pool);
  const swapOut = swapQuote(reserveOther, reserveSide, usdc);
  return { mintPair: usdc, swapIn: usdc, swapOut, tokensOut: usdc + swapOut };
}

/**
 * Sell `held` tokens of `side` for USDC in one transaction: `swap(side in, swapIn)` then
 * `burn_pair(usdcOut)`. Picks the smallest swap whose proceeds pair off what is left;
 * `leftover` other-side tokens (rounding dust) stay with the seller.
 */
export function sellQuote(side: Side, held: bigint, pool: Pool) {
  const [reserveIn, reserveOut] = reserves(side, pool);
  let [lo, hi] = [BigInt(0), held];
  while (lo < hi) {
    const mid = (lo + hi) / BigInt(2);
    if (swapQuote(reserveIn, reserveOut, mid) >= held - mid) hi = mid;
    else lo = mid + BigInt(1);
  }
  const swapOut = swapQuote(reserveIn, reserveOut, lo);
  const usdcOut = held - lo;
  return { swapIn: lo, swapOut, usdcOut, leftover: swapOut - usdcOut };
}

/** What `add_liquidity(maxYes, maxNo)` takes and mints. The first deposit sets the price. */
export function addLiquidityQuote(maxYes: bigint, maxNo: bigint, pool: Pool, lpSupply: bigint) {
  if (lpSupply === BigInt(0)) return { yesIn: maxYes, noIn: maxNo, shares: isqrt(maxYes * maxNo) };
  const shares = min((maxYes * lpSupply) / pool.yes, (maxNo * lpSupply) / pool.no);
  return { yesIn: ceilDiv(shares * pool.yes, lpSupply), noIn: ceilDiv(shares * pool.no, lpSupply), shares };
}

/** What `remove_liquidity(shares)` pays out, rounded down. */
export const removeLiquidityQuote = (shares: bigint, pool: Pool, lpSupply: bigint) => ({
  yesOut: (shares * pool.yes) / lpSupply,
  noOut: (shares * pool.no) / lpSupply,
});

/** NO to deposit next to `yes` YES so the first deposit prices YES at `yesPriceBps`. */
export const seedNoForPrice = (yes: bigint, yesPriceBps: number) =>
  (yes * BigInt(yesPriceBps)) / (BPS_DENOMINATOR - BigInt(yesPriceBps));

/** Pool price of YES in basis points of its payout, or null for an empty pool. */
export function poolYesPriceBps(pool: Pool): number | null {
  const total = pool.yes + pool.no;
  return total === BigInt(0) ? null : Number((pool.no * BPS_DENOMINATOR) / total);
}

// --- Events ---------------------------------------------------------------------------------

type Events = IdlEvents<PredProvable>;
/** A decoded event, discriminated by `name`. Fields are camelCase like `program.account.*`; u64s are BN. */
export type ProgramEvent = { [K in keyof Events]: { name: K; data: Events[K] } }[keyof Events];

// Same camelCase conversion `Program` applies, so events match fetched accounts.
const eventCoder = new BorshEventCoder(convertIdlToCamelCase(idl as Idl));

/** Decodes the program's events from a transaction's log messages, in order. */
export function decodeEvents(logs: readonly string[]): ProgramEvent[] {
  const events: ProgramEvent[] = [];
  for (const line of logs) {
    if (!line.startsWith("Program data: ")) continue;
    const event = eventCoder.decode(line.slice("Program data: ".length));
    if (event) events.push(event as ProgramEvent);
  }
  return events;
}
