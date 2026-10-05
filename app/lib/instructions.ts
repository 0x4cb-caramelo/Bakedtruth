// Instruction builders with the exact account lists the program expects. The devnet smoke test
// (scripts/devnet-smoke.ts) sends these too, so the app's transactions are tested on a real cluster.
// Framework-free.

import { BN, type IdlTypes, type Program } from "@anchor-lang/core";
import { SystemProgram, type PublicKey, type TransactionInstruction } from "@solana/web3.js";

import type { PredProvable } from "./idl/pred_provable";
import * as lib from "./market";

export type PredProgram = Program<PredProvable>;
export type ResolverKind = IdlTypes<PredProvable>["resolverKind"];

/** The accounts every market instruction derives from the market address and its metric account. */
export type MarketKeys = { market: PublicKey; metric: PublicKey; yesMint: PublicKey; noMint: PublicKey; vault: PublicKey };

export const marketKeys = (market: PublicKey, metric: PublicKey): MarketKeys => ({
  market,
  metric,
  yesMint: lib.yesMintPda(market),
  noMint: lib.noMintPda(market),
  vault: lib.vaultPda(market),
});

const u64 = (value: bigint) => new BN(value.toString());
const usdcAccount = (owner: PublicKey) => lib.ataAddress(owner, lib.USDC_MINT);
const tokenProgram = lib.TOKEN_PROGRAM_ID;
const withAta = {
  tokenProgram,
  associatedTokenProgram: lib.ASSOCIATED_TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
};

export type CreateMarketParams = {
  sponsor: PublicKey;
  marketId: bigint;
  kind: ResolverKind;
  /** Mint, program id or vote account, per kind. */
  target: PublicKey;
  /** Account read at resolution: the target itself, its ProgramData, or the incinerator's token account. */
  metric: PublicKey;
  threshold: bigint;
  cutoffSlot: bigint;
  deadlineSlot: bigint;
  yesPriceBps: number;
  budget: bigint;
};

export function createMarketIx(program: PredProgram, p: CreateMarketParams): Promise<TransactionInstruction> {
  const market = lib.marketPda(p.sponsor, p.marketId);
  const m = marketKeys(market, p.metric);
  return program.methods
    .createMarket({
      marketId: u64(p.marketId),
      kind: p.kind,
      metricThreshold: u64(p.threshold),
      cutoffSlot: u64(p.cutoffSlot),
      deadlineSlot: u64(p.deadlineSlot),
      yesPriceBps: p.yesPriceBps,
      sponsorBudget: u64(p.budget),
    })
    .accountsStrict({
      sponsor: p.sponsor,
      market,
      yesMint: m.yesMint,
      noMint: m.noMint,
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      sponsorUsdcAccount: usdcAccount(p.sponsor),
      target: p.target,
      metricAccount: p.metric,
      tokenProgram,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export const buyYesIx = (program: PredProgram, m: MarketKeys, buyer: PublicKey, amount: bigint) =>
  program.methods
    .buyYes(u64(amount))
    .accountsStrict({
      buyer,
      market: m.market,
      metricAccount: m.metric,
      yesMint: m.yesMint,
      buyerYesAccount: lib.ataAddress(buyer, m.yesMint),
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      buyerUsdcAccount: usdcAccount(buyer),
      ...withAta,
    })
    .instruction();

const pairAccounts = (m: MarketKeys, owner: PublicKey) => ({
  owner,
  market: m.market,
  yesMint: m.yesMint,
  noMint: m.noMint,
  ownerYesAccount: lib.ataAddress(owner, m.yesMint),
  ownerNoAccount: lib.ataAddress(owner, m.noMint),
  usdcMint: lib.USDC_MINT,
  vault: m.vault,
  ownerUsdcAccount: usdcAccount(owner),
  tokenProgram,
});

export const mintPairIx = (program: PredProgram, m: MarketKeys, owner: PublicKey, amount: bigint) =>
  program.methods
    .mintPair(u64(amount))
    .accountsStrict({ ...pairAccounts(m, owner), ...withAta })
    .instruction();

export const burnPairIx = (program: PredProgram, m: MarketKeys, owner: PublicKey, amount: bigint) =>
  program.methods.burnPair(u64(amount)).accountsStrict(pairAccounts(m, owner)).instruction();

const poolAccounts = (m: MarketKeys) => ({
  market: m.market,
  yesMint: m.yesMint,
  noMint: m.noMint,
  poolYesAccount: lib.poolAccounts(m.market).yes,
  poolNoAccount: lib.poolAccounts(m.market).no,
  ...withAta,
});

export function addLiquidityIx(
  program: PredProgram,
  m: MarketKeys,
  provider: PublicKey,
  amounts: { maxYes: bigint; maxNo: bigint; minShares: bigint },
) {
  const lpMint = lib.lpMintPda(m.market);
  return program.methods
    .addLiquidity(u64(amounts.maxYes), u64(amounts.maxNo), u64(amounts.minShares))
    .accountsStrict({
      ...poolAccounts(m),
      provider,
      metricAccount: m.metric,
      lpMint,
      providerYesAccount: lib.ataAddress(provider, m.yesMint),
      providerNoAccount: lib.ataAddress(provider, m.noMint),
      providerLpAccount: lib.ataAddress(provider, lpMint),
    })
    .instruction();
}

export function removeLiquidityIx(
  program: PredProgram,
  m: MarketKeys,
  provider: PublicKey,
  amounts: { shares: bigint; minYes: bigint; minNo: bigint },
) {
  const lpMint = lib.lpMintPda(m.market);
  return program.methods
    .removeLiquidity(u64(amounts.shares), u64(amounts.minYes), u64(amounts.minNo))
    .accountsStrict({
      ...poolAccounts(m),
      provider,
      lpMint,
      providerLpAccount: lib.ataAddress(provider, lpMint),
      providerYesAccount: lib.ataAddress(provider, m.yesMint),
      providerNoAccount: lib.ataAddress(provider, m.noMint),
    })
    .instruction();
}

export const swapIx = (
  program: PredProgram,
  m: MarketKeys,
  trader: PublicKey,
  tokenIn: lib.Side,
  amountIn: bigint,
  minOut: bigint,
) =>
  program.methods
    .swap(tokenIn === "yes" ? { yes: {} } : { no: {} }, u64(amountIn), u64(minOut))
    .accountsStrict({
      ...poolAccounts(m),
      trader,
      metricAccount: m.metric,
      traderYesAccount: lib.ataAddress(trader, m.yesMint),
      traderNoAccount: lib.ataAddress(trader, m.noMint),
    })
    .instruction();

/**
 * Buy `side` with `usdc` through the pool in one transaction: mint pairs, then swap the other side
 * in. `minOut` is the least the swap may return (the quote minus slippage).
 */
export const buyViaPoolIxs = async (
  program: PredProgram,
  m: MarketKeys,
  trader: PublicKey,
  side: lib.Side,
  usdc: bigint,
  minOut: bigint,
) => [
  await mintPairIx(program, m, trader, usdc),
  await swapIx(program, m, trader, side === "yes" ? "no" : "yes", usdc, minOut),
];

export const resolveIx = (program: PredProgram, m: MarketKeys) =>
  program.methods.resolve().accountsStrict({ market: m.market, metricAccount: m.metric }).instruction();

export const redeemIx = (program: PredProgram, m: MarketKeys, owner: PublicKey, winningMint: PublicKey) =>
  program.methods
    .redeem()
    .accountsStrict({
      owner,
      market: m.market,
      winningMint,
      ownerTokens: lib.ataAddress(owner, winningMint),
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      ownerUsdcAccount: usdcAccount(owner),
      tokenProgram,
    })
    .instruction();

export const withdrawBudgetIx = (program: PredProgram, m: MarketKeys, sponsor: PublicKey) =>
  program.methods
    .withdrawBudget()
    .accountsStrict({
      sponsor,
      market: m.market,
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      sponsorUsdcAccount: usdcAccount(sponsor),
      tokenProgram,
    })
    .instruction();
