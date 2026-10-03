import { describe, expect, test } from "bun:test";
import { BN } from "@anchor-lang/core";
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";
import type { PublicKey } from "@solana/web3.js";

import * as lib from "../app/lib/market";
import {
  ATA_PROGRAM_ID,
  INCINERATOR,
  SOL,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  USDC,
  USDC_MINT,
  ata,
  createAtaIdempotentIx,
  createTestClient,
  eventsOf,
  fetchMarket,
  fundedSigner,
  incineratorAta,
  lpMintPda,
  marketPda,
  mintSupply,
  outcomeMints,
  pk,
  program,
  send,
  setEpoch,
  setMint,
  setTokenAccount,
  setUpgradeableProgram,
  setVoteAccount,
  splBurnIx,
  splCloseAccountIx,
  splTransferIx,
  tokenBalance,
  usdcAta,
  usdcBalance,
  vaultPda,
  type TestClient,
} from "./helpers";

const CUTOFF = 100n;
const DEADLINE = 200n;
/** Default YES price: 10% of the payout, so the sponsor's bounty is 0.9 USDC per whole YES token. */
const PRICE_BPS = 1_000;
const BUDGET = 2n * USDC;
const MIN_STAKE = lib.MIN_STAKE;
/** Rent-exempt minimum of a 165-byte SPL token account. */
const TOKEN_ACCOUNT_RENT = 2_039_280n;

type Kind =
  | { supplyAtMost: {} }
  | { immutable: {} }
  | { stakeAtLeast: { epoch: BN } }
  | { mintAuthorityRevoked: {} }
  | { freezeAuthorityRevoked: {} }
  | { lockedAtLeast: {} };

type MarketRef = {
  address: Address;
  sponsor: Address;
  metric: Address;
  yesMint: Address;
  noMint: Address;
  vault: Address;
};

type Overrides = Record<string, PublicKey>;

/** Swaps some of an instruction's accounts, to aim it at accounts the signer does not own. */
const withOverrides = <T extends object>(accounts: T, overrides: Overrides = {}) =>
  ({ ...accounts, ...overrides }) as T;

async function createMarket(
  client: TestClient,
  sponsor: KeyPairSigner,
  opts: {
    id: bigint;
    kind: Kind;
    threshold: bigint;
    target: Address;
    metric: Address;
    priceBps?: number;
    budget?: bigint;
    usdcMint?: Address;
    cutoff?: bigint;
    deadline?: bigint;
  },
) {
  const market = marketPda(sponsor.address, opts.id);
  const mints = outcomeMints(market);
  const vault = vaultPda(market);
  const usdcMint = opts.usdcMint ?? USDC_MINT;
  const ix = await program.methods
    .createMarket({
      marketId: new BN(opts.id.toString()),
      kind: opts.kind as never,
      metricThreshold: new BN(opts.threshold.toString()),
      cutoffSlot: new BN((opts.cutoff ?? CUTOFF).toString()),
      deadlineSlot: new BN((opts.deadline ?? DEADLINE).toString()),
      yesPriceBps: opts.priceBps ?? PRICE_BPS,
      sponsorBudget: new BN((opts.budget ?? BUDGET).toString()),
    })
    .accountsStrict({
      sponsor: pk(sponsor.address),
      market: pk(market),
      yesMint: pk(mints.yes),
      noMint: pk(mints.no),
      usdcMint: pk(usdcMint),
      vault: pk(vault),
      sponsorUsdcAccount: pk(ata(sponsor.address, usdcMint)),
      target: pk(opts.target),
      metricAccount: pk(opts.metric),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
  const created = await send(client, [ix], [sponsor]);
  const ref: MarketRef = {
    address: market,
    sponsor: sponsor.address,
    metric: opts.metric,
    yesMint: mints.yes,
    noMint: mints.no,
    vault,
  };
  return { ...ref, created };
}

async function buyYesIx(buyer: Address, market: MarketRef, amount: bigint, overrides?: Overrides) {
  return program.methods
    .buyYes(new BN(amount.toString()))
    .accountsStrict(
      withOverrides(
        {
          buyer: pk(buyer),
          market: pk(market.address),
          metricAccount: pk(market.metric),
          yesMint: pk(market.yesMint),
          buyerYesAccount: pk(ata(buyer, market.yesMint)),
          usdcMint: pk(USDC_MINT),
          vault: pk(market.vault),
          buyerUsdcAccount: pk(usdcAta(buyer)),
          tokenProgram: pk(TOKEN_PROGRAM_ID),
          associatedTokenProgram: pk(ATA_PROGRAM_ID),
          systemProgram: pk(SYSTEM_PROGRAM_ID),
        },
        overrides,
      ),
    )
    .instruction();
}

const buyYes = async (
  client: TestClient,
  buyer: KeyPairSigner,
  market: MarketRef,
  amount: bigint,
  overrides?: Overrides,
) => send(client, [await buyYesIx(buyer.address, market, amount, overrides)], [buyer]);

async function resolve(client: TestClient, market: MarketRef, metric = market.metric) {
  const ix = await program.methods
    .resolve()
    .accountsStrict({ market: pk(market.address), metricAccount: pk(metric) })
    .instruction();
  return send(client, [ix]);
}

async function redeem(
  client: TestClient,
  owner: KeyPairSigner,
  market: MarketRef,
  mint: Address,
  overrides?: Overrides,
) {
  const ix = await program.methods
    .redeem()
    .accountsStrict(
      withOverrides(
        {
          owner: pk(owner.address),
          market: pk(market.address),
          winningMint: pk(mint),
          ownerTokens: pk(ata(owner.address, mint)),
          usdcMint: pk(USDC_MINT),
          vault: pk(market.vault),
          ownerUsdcAccount: pk(usdcAta(owner.address)),
          tokenProgram: pk(TOKEN_PROGRAM_ID),
        },
        overrides,
      ),
    )
    .instruction();
  return send(client, [ix], [owner]);
}

async function withdrawBudget(client: TestClient, sponsor: KeyPairSigner, market: MarketRef, overrides?: Overrides) {
  const ix = await program.methods
    .withdrawBudget()
    .accountsStrict(
      withOverrides(
        {
          sponsor: pk(sponsor.address),
          market: pk(market.address),
          usdcMint: pk(USDC_MINT),
          vault: pk(market.vault),
          sponsorUsdcAccount: pk(usdcAta(sponsor.address)),
          tokenProgram: pk(TOKEN_PROGRAM_ID),
        },
        overrides,
      ),
    )
    .instruction();
  return send(client, [ix], [sponsor]);
}

async function mintPairIx(owner: Address, market: MarketRef, amount: bigint) {
  return program.methods
    .mintPair(new BN(amount.toString()))
    .accountsStrict({
      owner: pk(owner),
      market: pk(market.address),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      ownerYesAccount: pk(ata(owner, market.yesMint)),
      ownerNoAccount: pk(ata(owner, market.noMint)),
      usdcMint: pk(USDC_MINT),
      vault: pk(market.vault),
      ownerUsdcAccount: pk(usdcAta(owner)),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
}

const mintPair = async (client: TestClient, owner: KeyPairSigner, market: MarketRef, amount: bigint) =>
  send(client, [await mintPairIx(owner.address, market, amount)], [owner]);

async function burnPairIx(owner: Address, market: MarketRef, amount: bigint, overrides?: Overrides) {
  return program.methods
    .burnPair(new BN(amount.toString()))
    .accountsStrict(
      withOverrides(
        {
          owner: pk(owner),
          market: pk(market.address),
          yesMint: pk(market.yesMint),
          noMint: pk(market.noMint),
          ownerYesAccount: pk(ata(owner, market.yesMint)),
          ownerNoAccount: pk(ata(owner, market.noMint)),
          usdcMint: pk(USDC_MINT),
          vault: pk(market.vault),
          ownerUsdcAccount: pk(usdcAta(owner)),
          tokenProgram: pk(TOKEN_PROGRAM_ID),
        },
        overrides,
      ),
    )
    .instruction();
}

const burnPair = async (
  client: TestClient,
  owner: KeyPairSigner,
  market: MarketRef,
  amount: bigint,
  overrides?: Overrides,
) => send(client, [await burnPairIx(owner.address, market, amount, overrides)], [owner]);

async function addLiquidity(
  client: TestClient,
  provider: KeyPairSigner,
  market: MarketRef,
  maxYes: bigint,
  maxNo: bigint,
  minShares = 0n,
) {
  const lpMint = lpMintPda(market.address);
  const ix = await program.methods
    .addLiquidity(new BN(maxYes.toString()), new BN(maxNo.toString()), new BN(minShares.toString()))
    .accountsStrict({
      provider: pk(provider.address),
      market: pk(market.address),
      metricAccount: pk(market.metric),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      lpMint: pk(lpMint),
      poolYesAccount: pk(ata(market.address, market.yesMint)),
      poolNoAccount: pk(ata(market.address, market.noMint)),
      providerYesAccount: pk(ata(provider.address, market.yesMint)),
      providerNoAccount: pk(ata(provider.address, market.noMint)),
      providerLpAccount: pk(ata(provider.address, lpMint)),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
  return send(client, [ix], [provider]);
}

async function removeLiquidity(
  client: TestClient,
  provider: KeyPairSigner,
  market: MarketRef,
  shares: bigint,
  opts: { minYes?: bigint; minNo?: bigint; overrides?: Overrides } = {},
) {
  const lpMint = lpMintPda(market.address);
  const ix = await program.methods
    .removeLiquidity(
      new BN(shares.toString()),
      new BN((opts.minYes ?? 0n).toString()),
      new BN((opts.minNo ?? 0n).toString()),
    )
    .accountsStrict(
      withOverrides(
        {
          provider: pk(provider.address),
          market: pk(market.address),
          yesMint: pk(market.yesMint),
          noMint: pk(market.noMint),
          lpMint: pk(lpMint),
          poolYesAccount: pk(ata(market.address, market.yesMint)),
          poolNoAccount: pk(ata(market.address, market.noMint)),
          providerLpAccount: pk(ata(provider.address, lpMint)),
          providerYesAccount: pk(ata(provider.address, market.yesMint)),
          providerNoAccount: pk(ata(provider.address, market.noMint)),
          tokenProgram: pk(TOKEN_PROGRAM_ID),
          associatedTokenProgram: pk(ATA_PROGRAM_ID),
          systemProgram: pk(SYSTEM_PROGRAM_ID),
        },
        opts.overrides,
      ),
    )
    .instruction();
  return send(client, [ix], [provider]);
}

async function swapIx(trader: Address, market: MarketRef, tokenIn: lib.Side, amountIn: bigint, minOut = 0n) {
  return program.methods
    .swap(tokenIn === "yes" ? { yes: {} } : { no: {} }, new BN(amountIn.toString()), new BN(minOut.toString()))
    .accountsStrict({
      trader: pk(trader),
      market: pk(market.address),
      metricAccount: pk(market.metric),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      poolYesAccount: pk(ata(market.address, market.yesMint)),
      poolNoAccount: pk(ata(market.address, market.noMint)),
      traderYesAccount: pk(ata(trader, market.yesMint)),
      traderNoAccount: pk(ata(trader, market.noMint)),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
}

const swap = async (
  client: TestClient,
  trader: KeyPairSigner,
  market: MarketRef,
  tokenIn: lib.Side,
  amountIn: bigint,
  minOut = 0n,
) => send(client, [await swapIx(trader.address, market, tokenIn, amountIn, minOut)], [trader]);

function poolOf(client: TestClient, market: MarketRef): lib.Pool {
  const m = fetchMarket(client, market.address);
  return { yes: BigInt(m.pool_yes.toString()), no: BigInt(m.pool_no.toString()) };
}

/** Moves outcome tokens with the plain SPL programs, as a DEX trade would. */
async function transferTokens(client: TestClient, from: KeyPairSigner, to: Address, mint: Address, amount: bigint) {
  await send(
    client,
    [
      createAtaIdempotentIx(from.address, to, mint),
      splTransferIx(ata(from.address, mint), ata(to, mint), from.address, amount),
    ],
    [from],
  );
}

const budgetOf = (client: TestClient, market: MarketRef) =>
  BigInt(fetchMarket(client, market.address).budget.toString());
const sponsorNoOf = (client: TestClient, market: MarketRef) =>
  BigInt(fetchMarket(client, market.address).sponsor_no.toString());
const vaultBalance = (client: TestClient, market: MarketRef) => tokenBalance(client, market.vault)!;
const lamportsOf = (client: TestClient, owner: Address) => BigInt(client.svm.getBalance(owner)!);

/**
 * Collateral invariant while the market is open: every YES is matched by a NO token or by NO
 * booked to the sponsor, and the vault holds the unspent budget plus one USDC base unit per YES.
 */
function expectFullyBacked(client: TestClient, market: MarketRef) {
  const yes = mintSupply(client, market.yesMint);
  expect(yes).toBe(mintSupply(client, market.noMint) + sponsorNoOf(client, market));
  expect(vaultBalance(client, market)).toBe(budgetOf(client, market) + yes);
}

/** A burn-goal market on a fresh mint with 1M supply and no mint authority. */
async function burnGoalMarket(
  client: TestClient,
  sponsor: KeyPairSigner,
  id: bigint,
  opts: { priceBps?: number; budget?: bigint } = {},
) {
  const mint = (await generateKeyPairSigner()).address;
  setMint(client, mint, 1_000_000n, null);
  const market = await createMarket(client, sponsor, {
    id,
    kind: { supplyAtMost: {} },
    threshold: 500_000n,
    target: mint,
    metric: mint,
    ...opts,
  });
  return { mint, market };
}

describe("SupplyAtMost (burn goal)", () => {
  test("goal hit: resolves YES in the same slot, YES holders redeem 1:1 in USDC", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 1n);

    const start = await usdcBalance(client, doer.address);
    await buyYes(client, doer, market, USDC);
    await mintPair(client, speculator, market, USDC);

    // The doer burns half the supply (injected: the mint has no authority, so this is a real burn).
    client.svm.warpToSlot(150n);
    setMint(client, mint, 400_000n, null);

    // Past the cutoff nobody can buy, and before it the sniping guard below applies.
    const sniper = await fundedSigner(client);
    await expect(buyYes(client, sniper, market, USDC)).rejects.toThrow("BettingClosed");

    // No dispute window: the read that sees the burn settles the market in that same slot.
    await resolve(client, market);
    const resolved = fetchMarket(client, market.address);
    expect(resolved.outcome).toEqual({ Yes: {} });
    expect(BigInt(resolved.resolved_slot.toString())).toBe(150n);

    await redeem(client, doer, market, market.yesMint);
    // Paid 0.1 USDC, redeemed 1 USDC.
    expect((await usdcBalance(client, doer.address)) - start).toBe(USDC - USDC / 10n);
    expect(tokenBalance(client, ata(doer.address, market.yesMint))).toBeNull();

    // The losing side cannot redeem; the winning half of the speculator's pair can.
    await expect(redeem(client, speculator, market, market.noMint)).rejects.toThrow("NotWinningMint");
    await redeem(client, speculator, market, market.yesMint);
    expect(mintSupply(client, market.yesMint)).toBe(0n);

    // What is left is exactly the unspent budget.
    await withdrawBudget(client, sponsor, market);
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("sniping guard: buying reverts once the metric is met, even before cutoff", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const sniper = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 2n);
    setMint(client, mint, 400_000n, null);

    await expect(buyYes(client, sniper, market, USDC)).rejects.toThrow("MetricAlreadyMet");
  });

  test("deadline passes unmet: the sponsor withdraws its budget and its NO, paid 1:1", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 3n);
    await buyYes(client, doer, market, USDC);

    client.svm.warpToSlot(150n);
    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");

    // Even a burn that lands after the deadline cannot flip the market to YES.
    client.svm.warpToSlot(DEADLINE + 1n);
    setMint(client, mint, 1n, null);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ No: {} });

    await expect(redeem(client, doer, market, market.yesMint)).rejects.toThrow("NotWinningMint");

    const before = await usdcBalance(client, sponsor.address);
    await withdrawBudget(client, sponsor, market);
    // 1.1 USDC unspent budget + 1 USDC of NO (0.1 from the buyer + 0.9 of the sponsor's own cover).
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET + USDC / 10n);
    expect(sponsorNoOf(client, market)).toBe(0n);
    expect(vaultBalance(client, market)).toBe(0n);
    await expect(withdrawBudget(client, sponsor, market)).rejects.toThrow("NothingToWithdraw");
  });

  test("a goal met in the deadline slot itself still resolves YES", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 6n);

    client.svm.warpToSlot(DEADLINE);
    setMint(client, mint, 400_000n, null);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });
  });

  test("rejects a mint whose authority can mint-then-burn", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, sponsor.address);

    await expect(
      createMarket(client, sponsor, {
        id: 4n,
        kind: { supplyAtMost: {} },
        threshold: 500_000n,
        target: mint,
        metric: mint,
      }),
    ).rejects.toThrow("MintAuthorityLive");
  });

  test("rejects a spoofed metric account at resolution", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 5n);
    const fakeMint = (await generateKeyPairSigner()).address;
    setMint(client, fakeMint, 0n, null);

    await expect(resolve(client, market, fakeMint)).rejects.toThrow("InvalidMetricAccount");
  });
});

describe("Outcome tokens (sponsor sale)", () => {
  test("buying mints one YES to the buyer and books one NO to the sponsor, fully backed", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 40n);
    expectFullyBacked(client, market);

    const before = await usdcBalance(client, doer.address);
    await buyYes(client, doer, market, USDC);

    // The buyer pays only the price.
    expect(before - (await usdcBalance(client, doer.address))).toBe(USDC / 10n);
    expect(tokenBalance(client, ata(doer.address, market.yesMint))).toBe(USDC);
    // The sponsor's NO is a balance on the market, not a token.
    expect(sponsorNoOf(client, market)).toBe(USDC);
    expect(mintSupply(client, market.noMint)).toBe(0n);
    // The other 0.9 USDC of collateral came out of the sponsor's budget.
    expect(budgetOf(client, market)).toBe(BUDGET - (USDC * 9n) / 10n);
    expectFullyBacked(client, market);
  });

  test("the buyer's price rounds up, so odd amounts stay fully backed", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 41n, { priceBps: 3_333 });

    const amount = 1_000_001n;
    const vaultBefore = vaultBalance(client, market);
    await buyYes(client, doer, market, amount);

    // ceil(1_000_001 * 3_333 / 10_000) = 333_301; the budget covers the remaining 666_700.
    expect(lib.salePrice(amount, 3_333)).toBe(333_301n);
    expect(vaultBalance(client, market) - vaultBefore).toBe(333_301n);
    expect(budgetOf(client, market)).toBe(BUDGET - 666_700n);
    expectFullyBacked(client, market);
  });

  test("the budget caps the sale at exactly the client's maxSaleAmount", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    // Odd price and budget, so the client's bound must be exact, not just safe.
    const budget = 2n * USDC + 7n;
    const { market } = await burnGoalMarket(client, sponsor, 42n, { priceBps: 3_333, budget });

    const max = lib.maxSaleAmount(budget, 3_333);
    await expect(buyYes(client, doer, market, max + 1n)).rejects.toThrow("BudgetExhausted");
    await buyYes(client, doer, market, max);
    expect(budgetOf(client, market)).toBe(0n);
    expect(lib.maxSaleAmount(0n, 3_333)).toBe(0n);
    await expect(buyYes(client, doer, market, MIN_STAKE)).rejects.toThrow("BudgetExhausted");
    expectFullyBacked(client, market);
  });

  test("rejects a price of 0% or 100%", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    for (const [i, priceBps] of [0, 10_000].entries()) {
      await expect(burnGoalMarket(client, sponsor, 43n + BigInt(i), { priceBps })).rejects.toThrow("InvalidPrice");
    }
  });

  test("redeem is rejected before resolution", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 45n);
    await buyYes(client, doer, market, USDC);

    await expect(redeem(client, doer, market, market.yesMint)).rejects.toThrow("NotResolved");
  });

  test("once a YES is sold the budget is locked until the cutoff, then returns to the sponsor", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 46n);
    await buyYes(client, doer, market, USDC);

    await expect(withdrawBudget(client, sponsor, market)).rejects.toThrow("SaleStillOpen");

    client.svm.warpToSlot(CUTOFF);
    await expect(buyYes(client, doer, market, USDC)).rejects.toThrow("BettingClosed");
    const before = await usdcBalance(client, sponsor.address);
    await withdrawBudget(client, sponsor, market);
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET - (USDC * 9n) / 10n);
    // Sold YES stays backed after the withdrawal; the sponsor's NO waits for resolution.
    expectFullyBacked(client, market);
    await expect(withdrawBudget(client, sponsor, market)).rejects.toThrow("NothingToWithdraw");
  });

  test("the sponsor cannot pull the budget out mid-sale by buying its own YES", async () => {
    // The exploit this closes: buy out your own sale, then burn each YES against the NO it
    // minted to you, recovering the budget while doers still count on it.
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 47n);
    const start = await usdcBalance(client, sponsor.address);

    const amount = lib.maxSaleAmount(BUDGET, PRICE_BPS);
    await buyYes(client, sponsor, market, amount);
    expect(budgetOf(client, market)).toBe(0n);
    expect(sponsorNoOf(client, market)).toBe(amount);
    // No NO token reached the sponsor, so there is nothing to burn the YES against.
    expect(tokenBalance(client, ata(sponsor.address, market.noMint))).toBeNull();
    await expect(burnPair(client, sponsor, market, amount)).rejects.toThrow("AccountNotInitialized");

    // A pair minted on top only returns its own collateral.
    await mintPair(client, sponsor, market, USDC);
    await expect(burnPair(client, sponsor, market, amount)).rejects.toThrow("insufficient funds");
    await burnPair(client, sponsor, market, USDC);
    await expect(withdrawBudget(client, sponsor, market)).rejects.toThrow("SaleStillOpen");

    // Buying out the sale cost the sponsor the full sale price, locked until resolution.
    expect((await usdcBalance(client, sponsor.address)) - start).toBe(-lib.salePrice(amount, PRICE_BPS));
    expectFullyBacked(client, market);
  });

  test("the sale touches no sponsor account: buyers pay rent only for their own YES account", async () => {
    // Previously the NO went to the sponsor's token account, which the sponsor could close
    // (making each buyer pay to recreate it) or reassign to another owner (halting the sale).
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 48n);

    const ix = await buyYesIx(doer.address, market, USDC);
    expect(ix.keys.map((k) => k.pubkey.toBase58())).not.toContain(sponsor.address);
    const before = lamportsOf(client, doer.address);
    await send(client, [ix], [doer]);
    expect(before - lamportsOf(client, doer.address)).toBe(TOKEN_ACCOUNT_RENT);
  });

  test("a sale that has sold nothing can be cancelled before the cutoff", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 49n);
    // Pairs are not sales: they never touch the budget, so they do not lock it.
    await mintPair(client, speculator, market, USDC);

    const before = await usdcBalance(client, sponsor.address);
    await withdrawBudget(client, sponsor, market);
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET);
    await expect(buyYes(client, doer, market, USDC)).rejects.toThrow("BudgetExhausted");
    expectFullyBacked(client, market);
  });

  test("when YES wins the sponsor's NO is worthless: it withdraws only the unspent budget", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 50n);
    await buyYes(client, doer, market, USDC);

    setMint(client, mint, 400_000n, null);
    await resolve(client, market);
    const before = await usdcBalance(client, sponsor.address);
    await withdrawBudget(client, sponsor, market);
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET - (USDC * 9n) / 10n);
    await expect(withdrawBudget(client, sponsor, market)).rejects.toThrow("NothingToWithdraw");

    await redeem(client, doer, market, market.yesMint);
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("outcome tokens are plain SPL: a transferred YES redeems for its new holder", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const trader = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 51n);
    await buyYes(client, doer, market, USDC);

    // Sell half the position with nothing but the SPL Token and ATA programs.
    await transferTokens(client, doer, trader.address, market.yesMint, USDC / 2n);

    setMint(client, mint, 400_000n, null);
    await resolve(client, market);

    const before = await usdcBalance(client, trader.address);
    await redeem(client, trader, market, market.yesMint);
    expect((await usdcBalance(client, trader.address)) - before).toBe(USDC / 2n);
    await redeem(client, doer, market, market.yesMint);
    expect(mintSupply(client, market.yesMint)).toBe(0n);
  });
});

describe("Input validation", () => {
  test("rejects a cutoff that is not in the future or falls after the deadline", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);
    const base = { kind: { supplyAtMost: {} }, threshold: 500_000n, target: mint, metric: mint } as const;

    // The clock is at slot 1.
    await expect(createMarket(client, sponsor, { ...base, id: 1n, cutoff: 1n })).rejects.toThrow("InvalidSchedule");
    await expect(createMarket(client, sponsor, { ...base, id: 2n, cutoff: 150n, deadline: 149n })).rejects.toThrow(
      "InvalidSchedule",
    );
  });

  test("amounts below the 1 USDC minimum, or zero, are rejected", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const user = await fundedSigner(client, 20n);
    await expect(burnGoalMarket(client, sponsor, 1n, { budget: MIN_STAKE - 1n })).rejects.toThrow("StakeTooSmall");

    const { market } = await burnGoalMarket(client, sponsor, 2n);
    await expect(buyYes(client, user, market, MIN_STAKE - 1n)).rejects.toThrow("StakeTooSmall");
    await expect(mintPair(client, user, market, MIN_STAKE - 1n)).rejects.toThrow("StakeTooSmall");

    await mintPair(client, user, market, 5n * USDC);
    await expect(burnPair(client, user, market, 0n)).rejects.toThrow("StakeTooSmall");
    await expect(addLiquidity(client, user, market, MIN_STAKE - 1n, MIN_STAKE)).rejects.toThrow("StakeTooSmall");
    await addLiquidity(client, user, market, MIN_STAKE, MIN_STAKE);
    await expect(swap(client, user, market, "yes", 0n)).rejects.toThrow("StakeTooSmall");
    await expect(removeLiquidity(client, user, market, 0n)).rejects.toThrow("StakeTooSmall");
  });
});

describe("USDC vault", () => {
  test("collateral must be USDC", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const fakeUsdc = (await generateKeyPairSigner()).address;
    setMint(client, fakeUsdc, 1_000_000n * USDC, sponsor.address);
    setTokenAccount(client, ata(sponsor.address, fakeUsdc), {
      mint: fakeUsdc,
      owner: sponsor.address,
      amount: 10n * USDC,
    });
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null);

    await expect(
      createMarket(client, sponsor, {
        id: 70n,
        kind: { supplyAtMost: {} },
        threshold: 500_000n,
        target: mint,
        metric: mint,
        usdcMint: fakeUsdc,
      }),
    ).rejects.toThrow("NotUsdc");
  });

  test("a market only pays out of its own vault", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 71n);
    const { market: other } = await burnGoalMarket(client, sponsor, 72n);

    client.svm.warpToSlot(CUTOFF);
    await expect(withdrawBudget(client, sponsor, { ...market, vault: other.vault })).rejects.toThrow(
      "ConstraintAddress",
    );
    await withdrawBudget(client, sponsor, market);
    expect(vaultBalance(client, market)).toBe(0n);
    expect(vaultBalance(client, other)).toBe(BUDGET);
  });
});

describe("Speculator pairs (mint_pair / burn_pair)", () => {
  test("mint_pair: 1 USDC in, 1 YES + 1 NO out, and the sponsor's budget is untouched", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 50n);

    const before = await usdcBalance(client, speculator.address);
    await mintPair(client, speculator, market, USDC);

    expect(before - (await usdcBalance(client, speculator.address))).toBe(USDC);
    expect(tokenBalance(client, ata(speculator.address, market.yesMint))).toBe(USDC);
    expect(tokenBalance(client, ata(speculator.address, market.noMint))).toBe(USDC);
    expect(budgetOf(client, market)).toBe(BUDGET);
    expectFullyBacked(client, market);
  });

  test("burn_pair: 1 YES + 1 NO in, 1 USDC out, while the market is open", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 51n);
    await mintPair(client, speculator, market, 2n * USDC);

    const before = await usdcBalance(client, speculator.address);
    await burnPair(client, speculator, market, USDC);

    expect((await usdcBalance(client, speculator.address)) - before).toBe(USDC);
    expect(tokenBalance(client, ata(speculator.address, market.yesMint))).toBe(USDC);
    expect(tokenBalance(client, ata(speculator.address, market.noMint))).toBe(USDC);
    expect(mintSupply(client, market.yesMint)).toBe(USDC);
    expectFullyBacked(client, market);
  });

  test("burn_pair needs both sides", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const buyer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 52n);
    await mintPair(client, speculator, market, USDC);
    await transferTokens(client, speculator, buyer.address, market.noMint, USDC);

    await expect(burnPair(client, speculator, market, USDC)).rejects.toThrow("insufficient funds");
  });

  test("once the sponsor's budget is drained, pairs keep supplying YES", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    // A 1 USDC budget at a 50% price sells 2 subsidized YES.
    const { mint, market } = await burnGoalMarket(client, sponsor, 53n, { priceBps: 5_000, budget: USDC });

    await buyYes(client, doer, market, 2n * USDC);
    await expect(buyYes(client, doer, market, 1_000_000n)).rejects.toThrow("BudgetExhausted");

    // Unsubsidized supply: the speculator mints pairs and sells the YES side to the doer.
    await mintPair(client, speculator, market, 5n * USDC);
    await transferTokens(client, speculator, doer.address, market.yesMint, 5n * USDC);
    expect(budgetOf(client, market)).toBe(0n);
    expect(mintSupply(client, market.yesMint)).toBe(7n * USDC);
    expectFullyBacked(client, market);

    setMint(client, mint, 400_000n, null);
    await resolve(client, market);
    const before = await usdcBalance(client, doer.address);
    await redeem(client, doer, market, market.yesMint);
    expect((await usdcBalance(client, doer.address)) - before).toBe(7n * USDC);
    // Every unit of collateral went to a winner.
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("a speculator takes the NO side by minting a pair and selling the YES", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 54n);

    await buyYes(client, doer, market, USDC);
    await mintPair(client, speculator, market, USDC);
    await transferTokens(client, speculator, doer.address, market.yesMint, USDC);

    client.svm.warpToSlot(DEADLINE + 1n);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ No: {} });

    const before = await usdcBalance(client, speculator.address);
    await redeem(client, speculator, market, market.noMint);
    expect((await usdcBalance(client, speculator.address)) - before).toBe(USDC);
    await withdrawBudget(client, sponsor, market);
    await expect(redeem(client, doer, market, market.yesMint)).rejects.toThrow("NotWinningMint");
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("pairs carry no outcome risk: minting stays open after the metric is met, until resolution", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 55n);

    setMint(client, mint, 400_000n, null);
    await expect(buyYes(client, speculator, market, USDC)).rejects.toThrow("MetricAlreadyMet");
    await mintPair(client, speculator, market, USDC);

    await resolve(client, market);
    await expect(mintPair(client, speculator, market, USDC)).rejects.toThrow("AlreadyResolved");
    await expect(burnPair(client, speculator, market, USDC)).rejects.toThrow("AlreadyResolved");

    // After resolution the winning side alone redeems; the NO half of the pair is worthless.
    const before = await usdcBalance(client, speculator.address);
    await redeem(client, speculator, market, market.yesMint);
    expect((await usdcBalance(client, speculator.address)) - before).toBe(USDC);
  });

  test("worthless losing tokens can be burned and their account closed for the rent, with plain SPL", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const speculator = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 56n);
    await mintPair(client, speculator, market, USDC);
    setMint(client, mint, 400_000n, null);
    await resolve(client, market);

    const losing = ata(speculator.address, market.noMint);
    const before = lamportsOf(client, speculator.address);
    await send(
      client,
      [
        splBurnIx(losing, market.noMint, speculator.address, USDC),
        splCloseAccountIx(losing, speculator.address, speculator.address),
      ],
      [speculator],
    );
    expect(lamportsOf(client, speculator.address) - before).toBe(TOKEN_ACCOUNT_RENT);
    expect(mintSupply(client, market.noMint)).toBe(0n);
  });
});

describe("Guarded pool (add_liquidity / swap / remove_liquidity)", () => {
  /** 9 YES against 1 NO prices YES at 10%, the same as the default sale price. */
  async function seededPool(client: TestClient, sponsor: KeyPairSigner, provider: KeyPairSigner, id: bigint) {
    const { mint, market } = await burnGoalMarket(client, sponsor, id);
    const yes = 9n * USDC;
    const no = lib.seedNoForPrice(yes, PRICE_BPS);
    await mintPair(client, provider, market, yes);
    await addLiquidity(client, provider, market, yes, no);
    return { mint, market };
  }
  const lpBalance = (client: TestClient, owner: Address, market: MarketRef) =>
    tokenBalance(client, ata(owner, lpMintPda(market.address)));
  const lpSupply = (client: TestClient, market: MarketRef) => mintSupply(client, lpMintPda(market.address));

  test("the first deposit sets the price and mints sqrt(yes * no) shares", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, provider, 60n);

    expect(poolOf(client, market)).toEqual({ yes: 9n * USDC, no: USDC });
    expect(lib.poolYesPriceBps(poolOf(client, market))).toBe(PRICE_BPS);
    expect(lpBalance(client, provider.address, market)).toBe(lib.isqrt(9n * USDC * USDC));
    // The 8 NO the price did not need stay with the provider.
    expect(tokenBalance(client, ata(provider.address, market.noMint))).toBe(8n * USDC);
    expectFullyBacked(client, market);
  });

  test("later deposits take both sides at the current ratio and leave the excess", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const first = await fundedSigner(client, 20n);
    const second = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, first, 61n);
    await mintPair(client, second, market, 4n * USDC);

    const pool = poolOf(client, market);
    const quote = lib.addLiquidityQuote(4n * USDC, 4n * USDC, pool, lpSupply(client, market));
    await addLiquidity(client, second, market, 4n * USDC, 4n * USDC, quote.shares);

    expect(lpBalance(client, second.address, market)).toBe(quote.shares);
    expect(poolOf(client, market)).toEqual({ yes: pool.yes + quote.yesIn, no: pool.no + quote.noIn });
    expect(tokenBalance(client, ata(second.address, market.yesMint))).toBe(4n * USDC - quote.yesIn);
    expect(tokenBalance(client, ata(second.address, market.noMint))).toBe(4n * USDC - quote.noIn);
  });

  test("buy YES with USDC in one transaction: mint_pair + swap the NO in", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 62n);

    const pool = poolOf(client, market);
    const quote = lib.buyQuote("yes", USDC, pool);
    await send(
      client,
      [
        await mintPairIx(trader.address, market, quote.mintPair),
        await swapIx(trader.address, market, "no", quote.swapIn, quote.swapOut),
      ],
      [trader],
    );

    expect(tokenBalance(client, ata(trader.address, market.yesMint))).toBe(quote.tokensOut);
    expect(tokenBalance(client, ata(trader.address, market.noMint))).toBe(0n);
    expect(poolOf(client, market)).toEqual({ yes: pool.yes - quote.swapOut, no: pool.no + quote.swapIn });
    expectFullyBacked(client, market);
  });

  test("sell YES for USDC in one transaction: swap part of it to NO + burn_pair", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 63n);
    await buyYes(client, trader, market, USDC);

    const quote = lib.sellQuote("yes", USDC, poolOf(client, market));
    const before = await usdcBalance(client, trader.address);
    await send(
      client,
      [
        await swapIx(trader.address, market, "yes", quote.swapIn, quote.swapOut),
        await burnPairIx(trader.address, market, quote.usdcOut),
      ],
      [trader],
    );
    expect((await usdcBalance(client, trader.address)) - before).toBe(quote.usdcOut);
    expect(tokenBalance(client, ata(trader.address, market.yesMint))).toBe(0n);
    expect(tokenBalance(client, ata(trader.address, market.noMint))).toBe(quote.leftover);
    expect(quote.leftover).toBeLessThan(10n);
    expectFullyBacked(client, market);
  });

  test("trading halts the moment the metric is met; liquidity can still leave", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const sniper = await fundedSigner(client);
    const { mint, market } = await seededPool(client, sponsor, provider, 64n);

    // The goal is met: the pool's 9 YES at 10% are now worth 100%, and nobody can take them.
    setMint(client, mint, 400_000n, null);
    await expect(
      send(
        client,
        [await mintPairIx(sniper.address, market, USDC), await swapIx(sniper.address, market, "no", USDC)],
        [sniper],
      ),
    ).rejects.toThrow("MetricAlreadyMet");
    await expect(addLiquidity(client, provider, market, USDC, USDC)).rejects.toThrow("MetricAlreadyMet");

    await removeLiquidity(client, provider, market, lpBalance(client, provider.address, market)!);
    expect(poolOf(client, market)).toEqual({ yes: 0n, no: 0n });
    expect(tokenBalance(client, ata(provider.address, market.yesMint))).toBe(9n * USDC);

    await resolve(client, market);
    const before = await usdcBalance(client, provider.address);
    await redeem(client, provider, market, market.yesMint);
    expect((await usdcBalance(client, provider.address)) - before).toBe(9n * USDC);
  });

  test("swaps stop at the cutoff", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, provider, 65n);

    client.svm.warpToSlot(CUTOFF);
    await expect(swap(client, provider, market, "no", USDC)).rejects.toThrow("BettingClosed");
  });

  test("swap fees stay in the pool for liquidity providers", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 66n);
    const k = (pool: lib.Pool) => pool.yes * pool.no;
    const k0 = k(poolOf(client, market));

    // A round trip that only pays fees.
    await mintPair(client, trader, market, USDC);
    await swap(client, trader, market, "no", USDC);
    const yesHeld = tokenBalance(client, ata(trader.address, market.yesMint))!;
    await swap(client, trader, market, "yes", yesHeld - USDC);
    const grown = poolOf(client, market);
    expect(k(grown)).toBeGreaterThan(k0);

    // The sole provider takes all of it back out.
    await removeLiquidity(client, provider, market, lpBalance(client, provider.address, market)!);
    expect(tokenBalance(client, ata(provider.address, market.yesMint))).toBe(grown.yes);
    expect(tokenBalance(client, ata(provider.address, market.noMint))).toBe(8n * USDC + grown.no);
  });

  test("tokens sent to the pool by hand do not move its price", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const donor = await fundedSigner(client);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 67n);

    await mintPair(client, donor, market, 5n * USDC);
    await transferTokens(client, donor, market.address, market.yesMint, 5n * USDC);
    expect(poolOf(client, market)).toEqual({ yes: 9n * USDC, no: USDC });

    await mintPair(client, trader, market, USDC);
    const out = lib.swapQuote(USDC, 9n * USDC, USDC / 10n);
    await swap(client, trader, market, "no", USDC / 10n, out);
    expect(tokenBalance(client, ata(trader.address, market.yesMint))).toBe(USDC + out);
  });

  test("a min_out above the quote reverts", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 68n);
    await mintPair(client, trader, market, USDC);

    const out = lib.swapQuote(USDC, 9n * USDC, USDC / 10n);
    await expect(swap(client, trader, market, "no", USDC / 10n, out + 1n)).rejects.toThrow("SlippageExceeded");
  });

  test("an emptied pool cannot be traded until someone seeds it again", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, provider, 69n);

    await removeLiquidity(client, provider, market, lpBalance(client, provider.address, market)!);
    await expect(swap(client, provider, market, "no", USDC)).rejects.toThrow("PoolEmpty");

    // Re-seeding at an even price works like a first deposit.
    await addLiquidity(client, provider, market, USDC, USDC);
    expect(poolOf(client, market)).toEqual({ yes: USDC, no: USDC });
  });
});

describe("Resolution and authority attacks", () => {
  test("a market resolves once; afterwards only redeem, withdraw and remove_liquidity work", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const user = await fundedSigner(client, 20n);
    const other = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 1n);
    await buyYes(client, user, market, USDC);
    await mintPair(client, user, market, 3n * USDC);
    await addLiquidity(client, user, market, USDC, USDC);

    setMint(client, mint, 400_000n, null);
    await resolve(client, market);
    await expect(resolve(client, market)).rejects.toThrow("AlreadyResolved");
    client.svm.warpToSlot(DEADLINE + 1n);
    await expect(resolve(client, market)).rejects.toThrow("AlreadyResolved");
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });

    await expect(buyYes(client, user, market, USDC)).rejects.toThrow("AlreadyResolved");
    await expect(mintPair(client, user, market, USDC)).rejects.toThrow("AlreadyResolved");
    await expect(burnPair(client, user, market, USDC)).rejects.toThrow("AlreadyResolved");
    await expect(swap(client, user, market, "no", USDC)).rejects.toThrow("AlreadyResolved");
    await expect(addLiquidity(client, user, market, USDC, USDC)).rejects.toThrow("AlreadyResolved");

    await removeLiquidity(client, user, market, tokenBalance(client, ata(user.address, lpMintPda(market.address)))!);
    // A winning account that was emptied by a transfer has nothing to redeem.
    const yesHeld = tokenBalance(client, ata(user.address, market.yesMint))!;
    await transferTokens(client, user, other.address, market.yesMint, yesHeld);
    await expect(redeem(client, user, market, market.yesMint)).rejects.toThrow("NothingToRedeem");
    await redeem(client, other, market, market.yesMint);
    await withdrawBudget(client, sponsor, market);
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("instructions reject token accounts the signer does not own", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const victim = await fundedSigner(client, 20n);
    const attacker = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 2n);
    const lpMint = lpMintPda(market.address);
    await buyYes(client, victim, market, USDC);
    await mintPair(client, victim, market, 3n * USDC);
    await addLiquidity(client, victim, market, USDC, USDC);

    const victimYes = pk(ata(victim.address, market.yesMint));
    await expect(
      burnPair(client, attacker, market, USDC, {
        ownerYesAccount: victimYes,
        ownerNoAccount: pk(ata(victim.address, market.noMint)),
      }),
    ).rejects.toThrow("ConstraintTokenOwner");
    await expect(
      buyYes(client, attacker, market, USDC, { buyerUsdcAccount: pk(usdcAta(victim.address)) }),
    ).rejects.toThrow("ConstraintTokenOwner");
    await expect(
      removeLiquidity(client, attacker, market, 1n, {
        overrides: { providerLpAccount: pk(ata(victim.address, lpMint)) },
      }),
    ).rejects.toThrow("ConstraintTokenOwner");

    setMint(client, mint, 400_000n, null);
    await resolve(client, market);
    await expect(redeem(client, attacker, market, market.yesMint, { ownerTokens: victimYes })).rejects.toThrow(
      "ConstraintTokenOwner",
    );
    await expect(withdrawBudget(client, attacker, market)).rejects.toThrow("ConstraintHasOne");
    await expect(
      withdrawBudget(client, sponsor, market, { sponsorUsdcAccount: pk(usdcAta(attacker.address)) }),
    ).rejects.toThrow("ConstraintTokenOwner");
  });
});

describe("Immutable (upgrade authority revoked)", () => {
  test("revoking the authority resolves YES", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const programData = await setUpgradeableProgram(client, targetProgram, doer.address);

    const market = await createMarket(client, sponsor, {
      id: 10n,
      kind: { immutable: {} },
      threshold: 0n,
      target: targetProgram,
      metric: programData,
    });
    await buyYes(client, doer, market, USDC);

    await setUpgradeableProgram(client, targetProgram, null);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });
  });

  test("an upgradeable program at the deadline resolves NO", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const programData = await setUpgradeableProgram(client, targetProgram, sponsor.address);
    const market = await createMarket(client, sponsor, {
      id: 12n,
      kind: { immutable: {} },
      threshold: 0n,
      target: targetProgram,
      metric: programData,
    });

    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");
    client.svm.warpToSlot(DEADLINE + 1n);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ No: {} });
  });

  test("rejects a ProgramData account not derived from the target", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const otherProgram = (await generateKeyPairSigner()).address;
    await setUpgradeableProgram(client, targetProgram, sponsor.address);
    const otherData = await setUpgradeableProgram(client, otherProgram, sponsor.address);

    await expect(
      createMarket(client, sponsor, {
        id: 11n,
        kind: { immutable: {} },
        threshold: 0n,
        target: targetProgram,
        metric: otherData,
      }),
    ).rejects.toThrow("ProgramDataMismatch");
  });

  test("rejects a program that is already immutable", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const targetProgram = (await generateKeyPairSigner()).address;
    const programData = await setUpgradeableProgram(client, targetProgram, null);

    await expect(
      createMarket(client, sponsor, {
        id: 13n,
        kind: { immutable: {} },
        threshold: 0n,
        target: targetProgram,
        metric: programData,
      }),
    ).rejects.toThrow("AlreadyImmutable");
  });
});

describe("StakeAtLeast (stake in a named epoch)", () => {
  // LiteSVM cannot inject stake: `sol_get_epoch_stake` reads 0 for every vote account here. These
  // tests cover validation, the trading halt and the NO paths; YES needs a staked validator.
  const stakeMarket = async (
    client: TestClient,
    sponsor: KeyPairSigner,
    id: bigint,
    epoch: bigint,
    threshold = SOL,
  ) => {
    const vote = (await generateKeyPairSigner()).address;
    setVoteAccount(client, vote);
    return createMarket(client, sponsor, {
      id,
      kind: { stakeAtLeast: { epoch: new BN(epoch.toString()) } },
      threshold,
      target: vote,
      metric: vote,
    });
  };

  test("rejects an epoch that has started, a non-vote account and a zero threshold", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    setEpoch(client, 5n);
    await expect(stakeMarket(client, sponsor, 1n, 5n)).rejects.toThrow("InvalidEpoch");
    await expect(stakeMarket(client, sponsor, 2n, 6n, 0n)).rejects.toThrow("MetricAlreadyMet");

    const notVote = (await generateKeyPairSigner()).address;
    setMint(client, notVote, 1n, null);
    await expect(
      createMarket(client, sponsor, {
        id: 3n,
        kind: { stakeAtLeast: { epoch: new BN(6) } },
        threshold: SOL,
        target: notVote,
        metric: notVote,
      }),
    ).rejects.toThrow("InvalidMetricAccount");
  });

  test("trading halts when the measured epoch starts; resolution reads that epoch only", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const market = await stakeMarket(client, sponsor, 1n, 2n);

    await buyYes(client, doer, market, USDC);
    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");
    setEpoch(client, 1n);
    await buyYes(client, doer, market, USDC);
    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");

    setEpoch(client, 2n);
    await expect(buyYes(client, doer, market, USDC)).rejects.toThrow("BettingClosed");
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ No: {} });

    const before = await usdcBalance(client, sponsor.address);
    await withdrawBudget(client, sponsor, market);
    // Everything in the vault: 0.2 USDC unspent budget, plus 2 NO (the buyer's 0.2 and 1.8 of cover).
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET + (2n * USDC) / 10n);
    expect(vaultBalance(client, market)).toBe(0n);
  });

  test("a target epoch that passes unresolved resolves NO", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const market = await stakeMarket(client, sponsor, 1n, 2n);

    setEpoch(client, 3n);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ No: {} });
  });
});

describe("MintAuthorityRevoked / FreezeAuthorityRevoked (renounce goals)", () => {
  test("renouncing the mint authority resolves YES and locks buying", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, doer.address, doer.address);

    const market = await createMarket(client, sponsor, {
      id: 20n,
      kind: { mintAuthorityRevoked: {} },
      threshold: 0n,
      target: mint,
      metric: mint,
    });
    await buyYes(client, doer, market, USDC);

    setMint(client, mint, 1_000_000n, null, doer.address);
    const sniper = await fundedSigner(client);
    await expect(buyYes(client, sniper, market, USDC)).rejects.toThrow("MetricAlreadyMet");

    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });
  });

  test("freeze market reads the freeze authority, not the mint authority", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, doer.address, doer.address);

    const market = await createMarket(client, sponsor, {
      id: 21n,
      kind: { freezeAuthorityRevoked: {} },
      threshold: 0n,
      target: mint,
      metric: mint,
    });

    setMint(client, mint, 1_000_000n, null, doer.address);
    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");

    setMint(client, mint, 1_000_000n, null, null);
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });
  });

  test("rejects a market on an authority that is already revoked", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const mint = (await generateKeyPairSigner()).address;
    setMint(client, mint, 1_000_000n, null, sponsor.address);

    await expect(
      createMarket(client, sponsor, {
        id: 22n,
        kind: { mintAuthorityRevoked: {} },
        threshold: 0n,
        target: mint,
        metric: mint,
      }),
    ).rejects.toThrow("MetricAlreadyMet");
  });
});

describe("LockedAtLeast (tokens locked under the incinerator)", () => {
  test("locking LP tokens past the threshold resolves YES; the doer redeems", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    // LP mints keep a live authority (the AMM), which is why burn goals cannot cover them.
    const amm = (await generateKeyPairSigner()).address;
    const lpMint = (await generateKeyPairSigner()).address;
    setMint(client, lpMint, 10_000_000n, amm);
    const locked = incineratorAta(lpMint);
    setTokenAccount(client, locked, { mint: lpMint, owner: INCINERATOR, amount: 0n });

    const market = await createMarket(client, sponsor, {
      id: 30n,
      kind: { lockedAtLeast: {} },
      threshold: 5_000_000n,
      target: lpMint,
      metric: locked,
    });
    const start = await usdcBalance(client, doer.address);
    await buyYes(client, doer, market, USDC);

    client.svm.warpToSlot(150n);
    setTokenAccount(client, locked, { mint: lpMint, owner: INCINERATOR, amount: 2_000_000n });
    await expect(resolve(client, market)).rejects.toThrow("NotResolvableYet");

    setTokenAccount(client, locked, { mint: lpMint, owner: INCINERATOR, amount: 6_000_000n });
    await resolve(client, market);
    expect(fetchMarket(client, market.address).outcome).toEqual({ Yes: {} });

    await redeem(client, doer, market, market.yesMint);
    expect((await usdcBalance(client, doer.address)) - start).toBe(USDC - USDC / 10n);
  });

  test("the client's ATA prelude creates the incinerator account a new market needs", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const lpMint = (await generateKeyPairSigner()).address;
    setMint(client, lpMint, 10_000_000n, null);
    const locked = incineratorAta(lpMint);
    expect(tokenBalance(client, locked)).toBeNull();

    await send(client, [createAtaIdempotentIx(sponsor.address, INCINERATOR, lpMint)], [sponsor]);
    await createMarket(client, sponsor, {
      id: 35n,
      kind: { lockedAtLeast: {} },
      threshold: 5_000_000n,
      target: lpMint,
      metric: locked,
    });
  });

  test("rejects a token account that is not the incinerator's ATA", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const lpMint = (await generateKeyPairSigner()).address;
    setMint(client, lpMint, 10_000_000n, null);
    const ownAccount = (await generateKeyPairSigner()).address;
    setTokenAccount(client, ownAccount, { mint: lpMint, owner: sponsor.address, amount: 0n });

    await expect(
      createMarket(client, sponsor, {
        id: 31n,
        kind: { lockedAtLeast: {} },
        threshold: 5_000_000n,
        target: lpMint,
        metric: ownAccount,
      }),
    ).rejects.toThrow("InvalidMetricAccount");
  });

  test("rejects an incinerator account that someone can still sign for", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const lpMint = (await generateKeyPairSigner()).address;
    setMint(client, lpMint, 10_000_000n, null);
    const locked = incineratorAta(lpMint);

    for (const [i, escape] of [{ delegate: sponsor.address }, { closeAuthority: sponsor.address }].entries()) {
      setTokenAccount(client, locked, { mint: lpMint, owner: INCINERATOR, amount: 0n, ...escape });
      await expect(
        createMarket(client, sponsor, {
          id: 32n + BigInt(i),
          kind: { lockedAtLeast: {} },
          threshold: 5_000_000n,
          target: lpMint,
          metric: locked,
        }),
      ).rejects.toThrow("InvalidMetricAccount");
    }
  });

  test("rejects a goal that is already met", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const lpMint = (await generateKeyPairSigner()).address;
    setMint(client, lpMint, 10_000_000n, null);
    const locked = incineratorAta(lpMint);
    setTokenAccount(client, locked, { mint: lpMint, owner: INCINERATOR, amount: 5_000_000n });

    await expect(
      createMarket(client, sponsor, {
        id: 34n,
        kind: { lockedAtLeast: {} },
        threshold: 5_000_000n,
        target: lpMint,
        metric: locked,
      }),
    ).rejects.toThrow("MetricAlreadyMet");
  });
});

describe("Events", () => {
  test("every state change logs one decodable event", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const lp = await fundedSigner(client, 20n);
    const { mint, market } = await burnGoalMarket(client, sponsor, 1n);
    const only = (result: { logs(): string[] }) => {
      const events = eventsOf(result);
      expect(events).toHaveLength(1);
      return events[0]!;
    };

    expect(only(market.created)).toEqual({
      name: "marketCreated",
      data: expect.objectContaining({
        market: market.address,
        sponsor: sponsor.address,
        metricThreshold: 500_000n,
        cutoffSlot: CUTOFF,
        deadlineSlot: DEADLINE,
        yesPriceBps: PRICE_BPS,
        budget: BUDGET,
      }),
    });
    expect(only(await buyYes(client, doer, market, USDC))).toEqual({
      name: "yesBought",
      data: {
        market: market.address,
        buyer: doer.address,
        amount: USDC,
        price: USDC / 10n,
        budgetLeft: BUDGET - (USDC * 9n) / 10n,
      },
    });
    expect(only(await mintPair(client, lp, market, 10n * USDC))).toEqual({
      name: "pairMinted",
      data: { market: market.address, owner: lp.address, amount: 10n * USDC },
    });
    const shares = lib.isqrt(9n * USDC * USDC);
    expect(only(await addLiquidity(client, lp, market, 9n * USDC, USDC))).toEqual({
      name: "liquidityAdded",
      data: {
        market: market.address,
        provider: lp.address,
        yesIn: 9n * USDC,
        noIn: USDC,
        shares,
        poolYes: 9n * USDC,
        poolNo: USDC,
      },
    });
    const out = lib.swapQuote(USDC, 9n * USDC, USDC);
    const swapped = only(await swap(client, lp, market, "no", USDC));
    expect(swapped.name).toBe("swapped");
    expect(swapped.data).toMatchObject({
      amountIn: USDC,
      amountOut: out,
      poolYes: 9n * USDC - out,
      poolNo: 2n * USDC,
    });
    expect(only(await burnPair(client, lp, market, USDC))).toEqual({
      name: "pairBurned",
      data: { market: market.address, owner: lp.address, amount: USDC },
    });
    const removed = only(await removeLiquidity(client, lp, market, shares));
    expect(removed.name).toBe("liquidityRemoved");
    expect(removed.data).toMatchObject({
      shares,
      yesOut: 9n * USDC - out,
      noOut: 2n * USDC,
      poolYes: 0n,
      poolNo: 0n,
    });

    setMint(client, mint, 400_000n, null);
    const resolved = only(await resolve(client, market));
    expect(resolved.name).toBe("resolved");
    expect(resolved.data).toMatchObject({ market: market.address, slot: 1n, outcome: { yes: {} } });
    const redeemed = only(await redeem(client, doer, market, market.yesMint));
    expect(redeemed.name).toBe("redeemed");
    expect(redeemed.data).toMatchObject({ owner: doer.address, amount: USDC, outcome: { yes: {} } });
    expect(only(await withdrawBudget(client, sponsor, market))).toEqual({
      name: "sponsorWithdrew",
      data: {
        market: market.address,
        sponsor: sponsor.address,
        budget: BUDGET - (USDC * 9n) / 10n,
        sponsorNo: 0n,
      },
    });
  });
});

/** Small deterministic PRNG (mulberry32), so a failing sequence replays exactly. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("Collateral invariant (randomized)", () => {
  const runs = [
    { seed: 7, outcome: "yes" },
    { seed: 11, outcome: "no" },
    { seed: 23, outcome: "yes" },
    { seed: 42, outcome: "no" },
  ] as const;

  for (const { seed, outcome } of runs) {
    test(`seed ${seed}: 150 random operations stay fully backed; resolves ${outcome.toUpperCase()} and drains to 0`, async () => {
      const client = await createTestClient();
      const random = prng(seed);
      /** Uniform in [0, n). */
      const below = (n: bigint) => (n <= 0n ? 0n : BigInt(Math.floor(random() * Number(n))));
      const pick = <T>(xs: readonly T[]) => xs[Math.floor(random() * xs.length)]!;

      const priceBps = 2_345;
      const sponsor = await fundedSigner(client, 1_000n);
      const actors = [sponsor, ...(await Promise.all([1, 2, 3, 4].map(() => fundedSigner(client, 1_000n))))];
      const { mint, market } = await burnGoalMarket(client, sponsor, 1n, { priceBps, budget: 50n * USDC + 13n });
      const lpMint = lpMintPda(market.address);
      const mintOf = (side: lib.Side) => (side === "yes" ? market.yesMint : market.noMint);
      const bal = (owner: Address, mintAddress: Address) => tokenBalance(client, ata(owner, mintAddress)) ?? 0n;
      const lpSupply = () => (client.svm.getAccount(lpMint).exists ? mintSupply(client, lpMint) : 0n);

      const check = () => {
        expectFullyBacked(client, market);
        const pool = poolOf(client, market);
        // Nothing was sent to the pool by hand, so its accounts hold exactly the tracked reserves.
        expect(bal(market.address, market.yesMint)).toBe(pool.yes);
        expect(bal(market.address, market.noMint)).toBe(pool.no);
        if (lpSupply() === 0n) expect(pool).toEqual({ yes: 0n, no: 0n });
      };

      const ops: Record<string, (u: KeyPairSigner) => Promise<boolean>> = {
        async buy(u) {
          const max = lib.maxSaleAmount(budgetOf(client, market), priceBps);
          if (max === 0n) return false;
          const span = max - MIN_STAKE + 1n;
          await buyYes(client, u, market, MIN_STAKE + below(span < 3n * USDC ? span : 3n * USDC));
          return true;
        },
        async mint(u) {
          await mintPair(client, u, market, MIN_STAKE + below(5n * USDC));
          return true;
        },
        async burn(u) {
          const held =
            bal(u.address, market.yesMint) < bal(u.address, market.noMint)
              ? bal(u.address, market.yesMint)
              : bal(u.address, market.noMint);
          if (held === 0n) return false;
          await burnPair(client, u, market, 1n + below(held));
          return true;
        },
        async add(u) {
          const [yes, no] = [bal(u.address, market.yesMint), bal(u.address, market.noMint)];
          if (yes === 0n || no === 0n) return false;
          const [maxYes, maxNo] = [1n + below(yes), 1n + below(no)];
          const [pool, supply] = [poolOf(client, market), lpSupply()];
          if (supply === 0n && (maxYes < MIN_STAKE || maxNo < MIN_STAKE)) return false;
          const quote = lib.addLiquidityQuote(maxYes, maxNo, pool, supply);
          if (quote.shares === 0n) return false;
          const before = bal(u.address, lpMint);
          await addLiquidity(client, u, market, maxYes, maxNo, quote.shares);
          expect(bal(u.address, lpMint) - before).toBe(quote.shares);
          expect(poolOf(client, market)).toEqual({ yes: pool.yes + quote.yesIn, no: pool.no + quote.noIn });
          return true;
        },
        async remove(u) {
          const held = bal(u.address, lpMint);
          if (held === 0n) return false;
          const shares = 1n + below(held);
          const pool = poolOf(client, market);
          const quote = lib.removeLiquidityQuote(shares, pool, lpSupply());
          await removeLiquidity(client, u, market, shares, { minYes: quote.yesOut, minNo: quote.noOut });
          expect(poolOf(client, market)).toEqual({ yes: pool.yes - quote.yesOut, no: pool.no - quote.noOut });
          return true;
        },
        async swap(u) {
          const side = pick(["yes", "no"] as const);
          const other = side === "yes" ? "no" : "yes";
          const held = bal(u.address, mintOf(side));
          if (held === 0n) return false;
          const amountIn = 1n + below(held);
          const pool = poolOf(client, market);
          const out =
            side === "yes" ? lib.swapQuote(pool.yes, pool.no, amountIn) : lib.swapQuote(pool.no, pool.yes, amountIn);
          if (out === 0n) return false;
          const before = bal(u.address, mintOf(other));
          await swap(client, u, market, side, amountIn, out);
          expect(bal(u.address, mintOf(other)) - before).toBe(out);
          return true;
        },
        async transfer(u) {
          const to = pick(actors.filter((a) => a !== u));
          const tokenMint = mintOf(pick(["yes", "no"] as const));
          const held = bal(u.address, tokenMint);
          if (held === 0n) return false;
          await transferTokens(client, u, to.address, tokenMint, 1n + below(held));
          return true;
        },
      };
      const weighted = ["buy", "mint", "mint", "burn", "add", "add", "remove", "swap", "swap", "swap", "transfer"];

      let executed = 0;
      for (let i = 0; i < 150; i++) {
        if (await ops[pick(weighted)]!(pick(actors))) {
          executed++;
          check();
        }
      }
      expect(executed).toBeGreaterThan(75);

      if (outcome === "yes") setMint(client, mint, 1n, null);
      else client.svm.warpToSlot(DEADLINE + 1n);
      await resolve(client, market);

      // Everyone leaves: providers pull liquidity, winners redeem, the sponsor withdraws.
      const winner = outcome === "yes" ? market.yesMint : market.noMint;
      for (const u of actors) {
        const shares = bal(u.address, lpMint);
        if (shares > 0n) await removeLiquidity(client, u, market, shares);
        if (bal(u.address, winner) > 0n) await redeem(client, u, market, winner);
      }
      const settled = fetchMarket(client, market.address);
      const owed = BigInt(settled.budget.toString()) + (outcome === "no" ? sponsorNoOf(client, market) : 0n);
      if (owed > 0n) await withdrawBudget(client, sponsor, market);

      expect(vaultBalance(client, market)).toBe(0n);
      expect(mintSupply(client, winner)).toBe(0n);
      expect(lpSupply()).toBe(0n);
      expect(poolOf(client, market)).toEqual({ yes: 0n, no: 0n });
      if (outcome === "no") expect(sponsorNoOf(client, market)).toBe(0n);
    }, 60_000);
  }
});
