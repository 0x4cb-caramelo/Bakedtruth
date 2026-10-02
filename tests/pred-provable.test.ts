import { describe, expect, test } from "bun:test";
import { BN } from "@anchor-lang/core";
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import {
  ATA_PROGRAM_ID,
  INCINERATOR,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  USDC,
  USDC_MINT,
  ata,
  createAtaIdempotentIx,
  createTestClient,
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
  setMint,
  setTokenAccount,
  setUpgradeableProgram,
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
  },
): Promise<MarketRef> {
  const market = await marketPda(sponsor.address, opts.id);
  const mints = await outcomeMints(market);
  const vault = await vaultPda(market);
  const usdcMint = opts.usdcMint ?? USDC_MINT;
  const ix = await program.methods
    .createMarket({
      marketId: new BN(opts.id.toString()),
      kind: opts.kind as never,
      metricThreshold: new BN(opts.threshold.toString()),
      cutoffSlot: new BN(CUTOFF.toString()),
      deadlineSlot: new BN(DEADLINE.toString()),
      yesPriceBps: opts.priceBps ?? PRICE_BPS,
      sponsorBudget: new BN((opts.budget ?? BUDGET).toString()),
    })
    .accountsStrict({
      sponsor: pk(sponsor.address),
      market: pk(market),
      yesMint: pk(mints.yes),
      noMint: pk(mints.no),
      sponsorNoAccount: pk(await ata(sponsor.address, mints.no)),
      usdcMint: pk(usdcMint),
      vault: pk(vault),
      sponsorUsdcAccount: pk(await ata(sponsor.address, usdcMint)),
      target: pk(opts.target),
      metricAccount: pk(opts.metric),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
  await send(client, [ix], [sponsor]);
  return {
    address: market,
    sponsor: sponsor.address,
    metric: opts.metric,
    yesMint: mints.yes,
    noMint: mints.no,
    vault,
  };
}

async function buyYes(client: TestClient, buyer: KeyPairSigner, market: MarketRef, amount: bigint) {
  const ix = await program.methods
    .buyYes(new BN(amount.toString()))
    .accountsStrict({
      buyer: pk(buyer.address),
      market: pk(market.address),
      metricAccount: pk(market.metric),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      buyerYesAccount: pk(await ata(buyer.address, market.yesMint)),
      sponsor: pk(market.sponsor),
      sponsorNoAccount: pk(await ata(market.sponsor, market.noMint)),
      ...(await usdcAccounts(market, buyer.address, "buyerUsdcAccount")),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
  return send(client, [ix], [buyer]);
}

/** The USDC mint, the market's vault and the user's USDC account, as every USDC-moving instruction takes them. */
async function usdcAccounts<K extends string>(market: MarketRef, user: Address, key: K) {
  return {
    usdcMint: pk(USDC_MINT),
    vault: pk(market.vault),
    [key]: pk(await usdcAta(user)),
  } as { usdcMint: ReturnType<typeof pk>; vault: ReturnType<typeof pk> } & Record<K, ReturnType<typeof pk>>;
}

async function resolve(client: TestClient, market: MarketRef, metric = market.metric) {
  const ix = await program.methods
    .resolve()
    .accountsStrict({ market: pk(market.address), metricAccount: pk(metric) })
    .instruction();
  return send(client, [ix]);
}

async function redeem(client: TestClient, owner: KeyPairSigner, market: MarketRef, mint: Address) {
  const ix = await program.methods
    .redeem()
    .accountsStrict({
      owner: pk(owner.address),
      market: pk(market.address),
      winningMint: pk(mint),
      ownerTokens: pk(await ata(owner.address, mint)),
      ...(await usdcAccounts(market, owner.address, "ownerUsdcAccount")),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
    })
    .instruction();
  return send(client, [ix], [owner]);
}

async function withdrawBudget(client: TestClient, sponsor: KeyPairSigner, market: MarketRef) {
  const ix = await program.methods
    .withdrawBudget()
    .accountsStrict({
      sponsor: pk(sponsor.address),
      market: pk(market.address),
      ...(await usdcAccounts(market, sponsor.address, "sponsorUsdcAccount")),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
    })
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
      ownerYesAccount: pk(await ata(owner, market.yesMint)),
      ownerNoAccount: pk(await ata(owner, market.noMint)),
      ...(await usdcAccounts(market, owner, "ownerUsdcAccount")),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
}

const mintPair = async (client: TestClient, owner: KeyPairSigner, market: MarketRef, amount: bigint) =>
  send(client, [await mintPairIx(owner.address, market, amount)], [owner]);

async function burnPairIx(owner: Address, market: MarketRef, amount: bigint) {
  return program.methods
    .burnPair(new BN(amount.toString()))
    .accountsStrict({
      owner: pk(owner),
      market: pk(market.address),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      ownerYesAccount: pk(await ata(owner, market.yesMint)),
      ownerNoAccount: pk(await ata(owner, market.noMint)),
      ...(await usdcAccounts(market, owner, "ownerUsdcAccount")),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
    })
    .instruction();
}

const burnPair = async (client: TestClient, owner: KeyPairSigner, market: MarketRef, amount: bigint) =>
  send(client, [await burnPairIx(owner.address, market, amount)], [owner]);

async function addLiquidity(
  client: TestClient,
  provider: KeyPairSigner,
  market: MarketRef,
  maxYes: bigint,
  maxNo: bigint,
  minShares = 0n,
) {
  const ix = await program.methods
    .addLiquidity(new BN(maxYes.toString()), new BN(maxNo.toString()), new BN(minShares.toString()))
    .accountsStrict({
      provider: pk(provider.address),
      market: pk(market.address),
      metricAccount: pk(market.metric),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      lpMint: pk(await lpMintPda(market.address)),
      poolYesAccount: pk(await ata(market.address, market.yesMint)),
      poolNoAccount: pk(await ata(market.address, market.noMint)),
      providerYesAccount: pk(await ata(provider.address, market.yesMint)),
      providerNoAccount: pk(await ata(provider.address, market.noMint)),
      providerLpAccount: pk(await ata(provider.address, await lpMintPda(market.address))),
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
  minYes = 0n,
  minNo = 0n,
) {
  const lpMint = await lpMintPda(market.address);
  const ix = await program.methods
    .removeLiquidity(new BN(shares.toString()), new BN(minYes.toString()), new BN(minNo.toString()))
    .accountsStrict({
      provider: pk(provider.address),
      market: pk(market.address),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      lpMint: pk(lpMint),
      poolYesAccount: pk(await ata(market.address, market.yesMint)),
      poolNoAccount: pk(await ata(market.address, market.noMint)),
      providerLpAccount: pk(await ata(provider.address, lpMint)),
      providerYesAccount: pk(await ata(provider.address, market.yesMint)),
      providerNoAccount: pk(await ata(provider.address, market.noMint)),
      tokenProgram: pk(TOKEN_PROGRAM_ID),
      associatedTokenProgram: pk(ATA_PROGRAM_ID),
      systemProgram: pk(SYSTEM_PROGRAM_ID),
    })
    .instruction();
  return send(client, [ix], [provider]);
}

async function swapIx(trader: Address, market: MarketRef, tokenIn: "yes" | "no", amountIn: bigint, minOut = 0n) {
  return program.methods
    .swap(tokenIn === "yes" ? { yes: {} } : { no: {} }, new BN(amountIn.toString()), new BN(minOut.toString()))
    .accountsStrict({
      trader: pk(trader),
      market: pk(market.address),
      metricAccount: pk(market.metric),
      yesMint: pk(market.yesMint),
      noMint: pk(market.noMint),
      poolYesAccount: pk(await ata(market.address, market.yesMint)),
      poolNoAccount: pk(await ata(market.address, market.noMint)),
      traderYesAccount: pk(await ata(trader, market.yesMint)),
      traderNoAccount: pk(await ata(trader, market.noMint)),
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
  tokenIn: "yes" | "no",
  amountIn: bigint,
  minOut = 0n,
) => send(client, [await swapIx(trader.address, market, tokenIn, amountIn, minOut)], [trader]);

function poolOf(client: TestClient, market: MarketRef) {
  const m = fetchMarket(client, market.address);
  return { yes: BigInt(m.pool_yes.toString()), no: BigInt(m.pool_no.toString()) };
}

/** Mirror of the program's swap math: 1% fee kept in the pool, constant product on the rest. */
function quote(reserveIn: bigint, reserveOut: bigint, amountIn: bigint) {
  const afterFee = (amountIn * 9_900n) / 10_000n;
  return (reserveOut * afterFee) / (reserveIn + afterFee);
}

function isqrt(n: bigint) {
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) [x, y] = [y, (y + n / y) / 2n];
  return x;
}

/** Moves outcome tokens with the plain SPL programs, as a DEX trade would. */
async function transferTokens(client: TestClient, from: KeyPairSigner, to: Address, mint: Address, amount: bigint) {
  const destination = await ata(to, mint);
  await send(
    client,
    [
      createAtaIdempotentIx(from.address, to, mint, destination),
      splTransferIx(await ata(from.address, mint), destination, from.address, amount),
    ],
    [from],
  );
}

const budgetOf = (client: TestClient, market: MarketRef) =>
  BigInt(fetchMarket(client, market.address).budget.toString());
const vaultBalance = (client: TestClient, market: MarketRef) => tokenBalance(client, market.vault)!;

/** Collateral invariant: the vault holds the unspent budget plus one USDC base unit per YES/NO pair. */
function expectFullyBacked(client: TestClient, market: MarketRef) {
  expect(mintSupply(client, market.yesMint)).toBe(mintSupply(client, market.noMint));
  expect(vaultBalance(client, market)).toBe(budgetOf(client, market) + mintSupply(client, market.yesMint));
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
  test("goal hit: resolves YES in the same slot, YES holder redeems 1:1 in USDC", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 1n);

    const start = await usdcBalance(client, doer.address);
    await buyYes(client, doer, market, USDC);

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
    expect(tokenBalance(client, await ata(doer.address, market.yesMint))).toBeNull();
    expect(mintSupply(client, market.yesMint)).toBe(0n);

    // The losing side cannot redeem.
    await expect(redeem(client, sponsor, market, market.noMint)).rejects.toThrow("NotWinningMint");
  });

  test("sniping guard: buying reverts once the metric is met, even before cutoff", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const sniper = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 2n);
    setMint(client, mint, 400_000n, null);

    await expect(buyYes(client, sniper, market, USDC)).rejects.toThrow("MetricAlreadyMet");
  });

  test("deadline passes unmet: sponsor redeems NO and recovers budget plus the buyer's price", async () => {
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
    await redeem(client, sponsor, market, market.noMint);
    await withdrawBudget(client, sponsor, market);
    // 1 USDC of NO (0.1 from the buyer + 0.9 of the sponsor's own cover) + 1.1 USDC unspent budget.
    expect((await usdcBalance(client, sponsor.address)) - before).toBe(BUDGET + USDC / 10n);
    expect(vaultBalance(client, market)).toBe(0n);
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
  test("buying mints one YES to the buyer and one NO to the sponsor, fully backed", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 40n);
    expectFullyBacked(client, market);

    const before = await usdcBalance(client, doer.address);
    await buyYes(client, doer, market, USDC);

    // The buyer pays only the price.
    expect(before - (await usdcBalance(client, doer.address))).toBe(USDC / 10n);
    expect(tokenBalance(client, await ata(doer.address, market.yesMint))).toBe(USDC);
    expect(tokenBalance(client, await ata(sponsor.address, market.noMint))).toBe(USDC);
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
    expect(vaultBalance(client, market) - vaultBefore).toBe(333_301n);
    expect(budgetOf(client, market)).toBe(BUDGET - 666_700n);
    expectFullyBacked(client, market);
  });

  test("the budget caps how much YES can be sold", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    // At a 50% price the sponsor covers 0.5 USDC per YES, so a 1 USDC budget sells 2 YES.
    const { market } = await burnGoalMarket(client, sponsor, 42n, { priceBps: 5_000, budget: USDC });

    await buyYes(client, doer, market, 2n * USDC);
    expect(budgetOf(client, market)).toBe(0n);
    await expect(buyYes(client, doer, market, 1_000_000n)).rejects.toThrow("BudgetExhausted");
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

  test("the budget is locked while the sale is open, then returns to the sponsor", async () => {
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
    // Sold pairs stay backed after the withdrawal.
    expectFullyBacked(client, market);
  });

  test("outcome tokens are plain SPL: a transferred YES redeems for its new holder", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const trader = await fundedSigner(client);
    const { mint, market } = await burnGoalMarket(client, sponsor, 47n);
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

  test("the sponsor cannot halt the sale by closing their NO account", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const doer = await fundedSigner(client);
    const { market } = await burnGoalMarket(client, sponsor, 48n);
    const sponsorNo = await ata(sponsor.address, market.noMint);

    await send(client, [splCloseAccountIx(sponsorNo, sponsor.address, sponsor.address)], [sponsor]);
    expect(tokenBalance(client, sponsorNo)).toBeNull();

    await buyYes(client, doer, market, USDC);
    expect(tokenBalance(client, sponsorNo)).toBe(USDC);
  });
});

describe("USDC vault", () => {
  test("collateral must be USDC", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const fakeUsdc = (await generateKeyPairSigner()).address;
    setMint(client, fakeUsdc, 1_000_000n * USDC, sponsor.address);
    setTokenAccount(client, await ata(sponsor.address, fakeUsdc), {
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
    expect(tokenBalance(client, await ata(speculator.address, market.yesMint))).toBe(USDC);
    expect(tokenBalance(client, await ata(speculator.address, market.noMint))).toBe(USDC);
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
    expect(tokenBalance(client, await ata(speculator.address, market.yesMint))).toBe(USDC);
    expect(tokenBalance(client, await ata(speculator.address, market.noMint))).toBe(USDC);
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
    await redeem(client, sponsor, market, market.noMint);
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
});

describe("Guarded pool (add_liquidity / swap / remove_liquidity)", () => {
  /** 9 YES against 1 NO prices YES at 10%, the same as the default sale price. */
  async function seededPool(client: TestClient, sponsor: KeyPairSigner, provider: KeyPairSigner, id: bigint) {
    const { mint, market } = await burnGoalMarket(client, sponsor, id);
    await mintPair(client, provider, market, 9n * USDC);
    await addLiquidity(client, provider, market, 9n * USDC, USDC);
    return { mint, market };
  }
  const lpBalance = async (client: TestClient, owner: Address, market: MarketRef) =>
    tokenBalance(client, await ata(owner, await lpMintPda(market.address)));

  test("the first deposit sets the price and mints sqrt(yes * no) shares", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, provider, 60n);

    expect(poolOf(client, market)).toEqual({ yes: 9n * USDC, no: USDC });
    expect(await lpBalance(client, provider.address, market)).toBe(isqrt(9n * USDC * USDC));
    // The 8 NO the price did not need stay with the provider.
    expect(tokenBalance(client, await ata(provider.address, market.noMint))).toBe(8n * USDC);
    expectFullyBacked(client, market);
  });

  test("later deposits take both sides at the current ratio and leave the excess", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const first = await fundedSigner(client, 20n);
    const second = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, first, 61n);
    await mintPair(client, second, market, 4n * USDC);

    const { yes: y, no: n } = poolOf(client, market);
    const supply = isqrt(9n * USDC * USDC);
    const shares = [(4n * USDC * supply) / y, (4n * USDC * supply) / n].reduce((a, b) => (a < b ? a : b));
    const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b;
    const [yesIn, noIn] = [ceilDiv(shares * y, supply), ceilDiv(shares * n, supply)];
    await addLiquidity(client, second, market, 4n * USDC, 4n * USDC);

    expect(await lpBalance(client, second.address, market)).toBe(shares);
    expect(poolOf(client, market)).toEqual({ yes: y + yesIn, no: n + noIn });
    expect(tokenBalance(client, await ata(second.address, market.yesMint))).toBe(4n * USDC - yesIn);
    expect(tokenBalance(client, await ata(second.address, market.noMint))).toBe(4n * USDC - noIn);
  });

  test("buy YES with USDC in one transaction: mint_pair + swap the NO in", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 62n);

    const spend = USDC;
    const { yes: y, no: n } = poolOf(client, market);
    const out = quote(n, y, spend);
    await send(
      client,
      [await mintPairIx(trader.address, market, spend), await swapIx(trader.address, market, "no", spend, out)],
      [trader],
    );

    expect(tokenBalance(client, await ata(trader.address, market.yesMint))).toBe(spend + out);
    expect(tokenBalance(client, await ata(trader.address, market.noMint))).toBe(0n);
    expect(poolOf(client, market)).toEqual({ yes: y - out, no: n + spend });
    expectFullyBacked(client, market);
  });

  test("sell YES for USDC in one transaction: swap part of it to NO + burn_pair", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 63n);
    await buyYes(client, trader, market, USDC);

    // Smallest split whose NO proceeds pair off the YES that is left (computed client-side).
    const held = USDC;
    const { yes: y, no: n } = poolOf(client, market);
    let [lo, hi] = [0n, held];
    while (lo < hi) {
      const mid = (lo + hi) / 2n;
      if (quote(y, n, mid) >= held - mid) hi = mid;
      else lo = mid + 1n;
    }
    const out = quote(y, n, lo);
    const pairs = held - lo;

    const before = await usdcBalance(client, trader.address);
    await send(
      client,
      [await swapIx(trader.address, market, "yes", lo, out), await burnPairIx(trader.address, market, pairs)],
      [trader],
    );
    // USDC out = pairs burned.
    expect((await usdcBalance(client, trader.address)) - before).toBe(pairs);
    expect(tokenBalance(client, await ata(trader.address, market.yesMint))).toBe(0n);
    expect(tokenBalance(client, await ata(trader.address, market.noMint))!).toBeLessThan(10n);
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

    await removeLiquidity(client, provider, market, (await lpBalance(client, provider.address, market))!);
    expect(poolOf(client, market)).toEqual({ yes: 0n, no: 0n });
    expect(tokenBalance(client, await ata(provider.address, market.yesMint))).toBe(9n * USDC);

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
    const k = (pool: { yes: bigint; no: bigint }) => pool.yes * pool.no;
    const k0 = k(poolOf(client, market));

    // A round trip that only pays fees.
    await mintPair(client, trader, market, USDC);
    await swap(client, trader, market, "no", USDC);
    const yesHeld = tokenBalance(client, await ata(trader.address, market.yesMint))!;
    await swap(client, trader, market, "yes", yesHeld - USDC);
    const grown = poolOf(client, market);
    expect(k(grown)).toBeGreaterThan(k0);

    // The sole provider takes all of it back out.
    await removeLiquidity(client, provider, market, (await lpBalance(client, provider.address, market))!);
    expect(tokenBalance(client, await ata(provider.address, market.yesMint))).toBe(grown.yes);
    expect(tokenBalance(client, await ata(provider.address, market.noMint))).toBe(8n * USDC + grown.no);
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
    const out = quote(USDC, 9n * USDC, USDC / 10n);
    await swap(client, trader, market, "no", USDC / 10n, out);
    expect(tokenBalance(client, await ata(trader.address, market.yesMint))).toBe(USDC + out);
  });

  test("a min_out above the quote reverts", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const trader = await fundedSigner(client);
    const { market } = await seededPool(client, sponsor, provider, 68n);
    await mintPair(client, trader, market, USDC);

    const out = quote(USDC, 9n * USDC, USDC / 10n);
    await expect(swap(client, trader, market, "no", USDC / 10n, out + 1n)).rejects.toThrow("SlippageExceeded");
  });

  test("an emptied pool cannot be traded until someone seeds it again", async () => {
    const client = await createTestClient();
    const sponsor = await fundedSigner(client);
    const provider = await fundedSigner(client, 20n);
    const { market } = await seededPool(client, sponsor, provider, 69n);

    await removeLiquidity(client, provider, market, (await lpBalance(client, provider.address, market))!);
    await expect(swap(client, provider, market, "no", USDC)).rejects.toThrow("PoolEmpty");

    // Re-seeding at an even price works like a first deposit.
    await addLiquidity(client, provider, market, USDC, USDC);
    expect(poolOf(client, market)).toEqual({ yes: USDC, no: USDC });
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
    const locked = await incineratorAta(lpMint);
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
    const locked = await incineratorAta(lpMint);

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
    const locked = await incineratorAta(lpMint);
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
