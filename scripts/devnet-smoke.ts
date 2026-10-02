// Devnet smoke test: the full USDC lifecycle against the deployed program, with the client stack
// the app uses (Anchor client, web3.js v1 and app/lib/market.ts) and Circle's real devnet USDC.
//
//   bun run deploy:devnet && bun run smoke:devnet
//
// The deployer keypair (SMOKE_WALLET, default ~/.config/solana/pred-provable-devnet.json) pays and
// sponsors; it needs ~0.2 SOL and 4 devnet USDC (https://faucet.circle.com). The doer and liquidity
// provider are keypairs derived from the deployer's secret, so an interrupted run loses nothing:
// the next run reuses them. Every USDC base unit returns to the deployer at the end.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { AnchorProvider, BN, Program, Wallet, type Idl } from "@anchor-lang/core";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Signer,
} from "@solana/web3.js";

import idl from "../app/lib/idl/pred_provable.json";
import type { PredProvable } from "../app/lib/idl/pred_provable";
import * as lib from "../app/lib/market";

const RPC_URL = process.env.SMOKE_RPC_URL ?? "https://api.devnet.solana.com";
const WALLET = process.env.SMOKE_WALLET ?? `${homedir()}/.config/solana/pred-provable-devnet.json`;
const USDC = 1_000_000n;
const PRICE_BPS = 1_000;
const BUDGET = USDC;

const connection = new Connection(RPC_URL, "confirmed");
const deployer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(WALLET, "utf8"))));
const derived = (role: string) =>
  Keypair.fromSeed(createHash("sha256").update(deployer.secretKey).update(role).digest());
const doer = derived("pred-provable-smoke-doer");
const lp = derived("pred-provable-smoke-lp");
const provider = new AnchorProvider(connection, new Wallet(deployer), { commitment: "confirmed" });
const program = new Program<PredProvable>(idl as Idl, provider);

// --- Small utilities ------------------------------------------------------------------------

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`check failed: ${message}`);
}

function expectEqual(actual: bigint, expected: bigint, what: string) {
  check(actual === expected, `${what}: expected ${expected}, got ${actual}`);
}

const explorer = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
const fmt = (base: bigint) => `${Number(base) / 1e6}`;
const u64 = (value: bigint) => new BN(value.toString());

/** Sends one transaction (deployer pays) and returns its signature and decoded program events. */
async function send(label: string, ixs: TransactionInstruction[], signers: Signer[] = []) {
  const sig = await provider.sendAndConfirm(new Transaction().add(...ixs), signers);
  const tx = await connection.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  const events = lib.decodeEvents(tx?.meta?.logMessages ?? []);
  console.log(`  ✓ ${label}  [${events.map((e) => e.name).join(", ") || "no events"}]\n    ${explorer(sig)}`);
  return { sig, events };
}

/** Asserts that `ixs` fail in simulation with `error` in the logs (nothing is sent). */
async function expectFailure(label: string, ixs: TransactionInstruction[], signers: Signer[], error: string) {
  const tx = new Transaction().add(...ixs);
  tx.feePayer = deployer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(deployer, ...signers);
  const sim = await connection.simulateTransaction(tx);
  const logs = sim.value.logs?.join("\n") ?? "";
  check(sim.value.err && logs.includes(error), `${label}: expected ${error}, got ${JSON.stringify(sim.value.err)}`);
  console.log(`  ✓ ${label} fails with ${error}`);
}

async function tokenAmount(account: PublicKey) {
  const info = await connection.getAccountInfo(account);
  return info ? info.data.readBigUInt64LE(64) : 0n;
}

async function mintSupply(mint: PublicKey) {
  const info = await connection.getAccountInfo(mint);
  check(info, `mint ${mint.toBase58()} exists`);
  return info.data.readBigUInt64LE(36);
}

const usdcOf = (owner: PublicKey) => tokenAmount(lib.ataAddress(owner, lib.USDC_MINT));

// --- Raw SPL Token instructions (layouts from spl-token) ------------------------------------

const splIx = (keys: [PublicKey, boolean, boolean][], data: Buffer) =>
  new TransactionInstruction({
    programId: lib.TOKEN_PROGRAM_ID,
    keys: keys.map(([pubkey, isSigner, isWritable]) => ({ pubkey, isSigner, isWritable })),
    data,
  });

const withAmount = (tag: number, amount: bigint, extra: number[] = []) => {
  const data = Buffer.alloc(9 + extra.length);
  data[0] = tag;
  data.writeBigUInt64LE(amount, 1);
  extra.forEach((byte, i) => (data[9 + i] = byte));
  return data;
};

/** InitializeMint2 with no freeze authority. */
const initializeMintIx = (mint: PublicKey, authority: PublicKey) =>
  splIx([[mint, false, true]], Buffer.concat([Buffer.from([20, 6]), authority.toBuffer(), Buffer.from([0])]));
const mintToIx = (mint: PublicKey, to: PublicKey, authority: PublicKey, amount: bigint) =>
  splIx(
    [
      [mint, false, true],
      [to, false, true],
      [authority, true, false],
    ],
    withAmount(7, amount),
  );
/** SetAuthority(MintTokens, None): nobody can ever mint again. */
const revokeMintAuthorityIx = (mint: PublicKey, authority: PublicKey) =>
  splIx(
    [
      [mint, false, true],
      [authority, true, false],
    ],
    Buffer.from([6, 0, 0]),
  );
const burnIx = (account: PublicKey, mint: PublicKey, owner: PublicKey, amount: bigint) =>
  splIx(
    [
      [account, false, true],
      [mint, false, true],
      [owner, true, false],
    ],
    withAmount(8, amount),
  );
const closeAccountIx = (account: PublicKey, owner: PublicKey) =>
  splIx(
    [
      [account, false, true],
      [owner, false, true],
      [owner, true, false],
    ],
    Buffer.from([9]),
  );
const usdcTransferIx = (from: PublicKey, to: PublicKey, amount: bigint) =>
  splIx(
    [
      [lib.ataAddress(from, lib.USDC_MINT), false, true],
      [lib.USDC_MINT, false, false],
      [lib.ataAddress(to, lib.USDC_MINT), false, true],
      [from, true, false],
    ],
    withAmount(12, amount, [lib.USDC_DECIMALS]),
  );

// --- Program instructions (same account lists the app will pass) -----------------------------

type MarketKeys = { market: PublicKey; metric: PublicKey; yesMint: PublicKey; noMint: PublicKey; vault: PublicKey };

const common = { tokenProgram: lib.TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId };
const withAta = { ...common, associatedTokenProgram: lib.ASSOCIATED_TOKEN_PROGRAM_ID };

const buyYesIx = (m: MarketKeys, buyer: PublicKey, amount: bigint) =>
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
      buyerUsdcAccount: lib.ataAddress(buyer, lib.USDC_MINT),
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
  ownerUsdcAccount: lib.ataAddress(owner, lib.USDC_MINT),
  tokenProgram: lib.TOKEN_PROGRAM_ID,
});
const mintPairIx = (m: MarketKeys, owner: PublicKey, amount: bigint) =>
  program.methods
    .mintPair(u64(amount))
    .accountsStrict({ ...pairAccounts(m, owner), ...withAta })
    .instruction();
const burnPairIx = (m: MarketKeys, owner: PublicKey, amount: bigint) =>
  program.methods.burnPair(u64(amount)).accountsStrict(pairAccounts(m, owner)).instruction();

const poolAccounts = (m: MarketKeys) => ({
  market: m.market,
  yesMint: m.yesMint,
  noMint: m.noMint,
  poolYesAccount: lib.poolAccounts(m.market).yes,
  poolNoAccount: lib.poolAccounts(m.market).no,
  ...withAta,
});
const addLiquidityIx = (m: MarketKeys, provider: PublicKey, maxYes: bigint, maxNo: bigint, minShares: bigint) => {
  const lpMint = lib.lpMintPda(m.market);
  return program.methods
    .addLiquidity(u64(maxYes), u64(maxNo), u64(minShares))
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
};
const removeLiquidityIx = (m: MarketKeys, provider: PublicKey, shares: bigint) => {
  const lpMint = lib.lpMintPda(m.market);
  return program.methods
    .removeLiquidity(u64(shares), u64(0n), u64(0n))
    .accountsStrict({
      ...poolAccounts(m),
      provider,
      lpMint,
      providerLpAccount: lib.ataAddress(provider, lpMint),
      providerYesAccount: lib.ataAddress(provider, m.yesMint),
      providerNoAccount: lib.ataAddress(provider, m.noMint),
    })
    .instruction();
};
const swapIx = (m: MarketKeys, trader: PublicKey, side: lib.Side, amountIn: bigint, minOut: bigint) =>
  program.methods
    .swap(side === "yes" ? { yes: {} } : { no: {} }, u64(amountIn), u64(minOut))
    .accountsStrict({
      ...poolAccounts(m),
      trader,
      metricAccount: m.metric,
      traderYesAccount: lib.ataAddress(trader, m.yesMint),
      traderNoAccount: lib.ataAddress(trader, m.noMint),
    })
    .instruction();
const resolveIx = (m: MarketKeys) =>
  program.methods.resolve().accountsStrict({ market: m.market, metricAccount: m.metric }).instruction();
const redeemIx = (m: MarketKeys, owner: PublicKey, winningMint: PublicKey) =>
  program.methods
    .redeem()
    .accountsStrict({
      owner,
      market: m.market,
      winningMint,
      ownerTokens: lib.ataAddress(owner, winningMint),
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      ownerUsdcAccount: lib.ataAddress(owner, lib.USDC_MINT),
      tokenProgram: lib.TOKEN_PROGRAM_ID,
    })
    .instruction();
const withdrawBudgetIx = (m: MarketKeys, sponsor: PublicKey) =>
  program.methods
    .withdrawBudget()
    .accountsStrict({
      sponsor,
      market: m.market,
      usdcMint: lib.USDC_MINT,
      vault: m.vault,
      sponsorUsdcAccount: lib.ataAddress(sponsor, lib.USDC_MINT),
      tokenProgram: lib.TOKEN_PROGRAM_ID,
    })
    .instruction();

/** Collateral invariant while open: YES = NO tokens + sponsor's NO, and vault = budget + YES. */
async function expectFullyBacked(m: MarketKeys) {
  const state = await program.account.market.fetch(m.market);
  const [yes, no, vault] = await Promise.all([mintSupply(m.yesMint), mintSupply(m.noMint), tokenAmount(m.vault)]);
  expectEqual(yes, no + BigInt(state.sponsorNo.toString()), "YES supply = NO supply + sponsor NO");
  expectEqual(vault, BigInt(state.budget.toString()) + yes, "vault = budget + YES supply");
  console.log(
    `  ✓ fully backed: vault ${fmt(vault)} USDC = budget ${fmt(BigInt(state.budget.toString()))} + YES ${fmt(yes)}`,
  );
}

// --- The run ----------------------------------------------------------------------------------

async function main() {
  console.log(`pred-provable devnet smoke test\n  program  ${lib.PROGRAM_ID.toBase58()}\n  rpc      ${RPC_URL}`);
  console.log(
    `  deployer ${deployer.publicKey.toBase58()}\n  doer     ${doer.publicKey.toBase58()}\n  lp       ${lp.publicKey.toBase58()}`,
  );

  const programInfo = await connection.getAccountInfo(lib.PROGRAM_ID);
  check(programInfo?.executable, "program is deployed (run `bun run deploy:devnet`)");
  const deployerUsdc = await usdcOf(deployer.publicKey);
  // USDC the doer and LP kept from an interrupted run also comes back at the end.
  const usdcStart = deployerUsdc + (await usdcOf(doer.publicKey)) + (await usdcOf(lp.publicKey));
  console.log(
    `  deployer holds ${(await connection.getBalance(deployer.publicKey)) / LAMPORTS_PER_SOL} SOL, ${fmt(deployerUsdc)} USDC`,
  );

  console.log("\n1. Fund the doer (2 USDC) and the liquidity provider (1 USDC)");
  const funding: TransactionInstruction[] = [];
  let toSend = 0n;
  for (const [who, usdc] of [
    [doer.publicKey, 2n * USDC],
    [lp.publicKey, USDC],
  ] as const) {
    if ((await connection.getBalance(who)) < 0.04 * LAMPORTS_PER_SOL) {
      funding.push(
        SystemProgram.transfer({ fromPubkey: deployer.publicKey, toPubkey: who, lamports: 0.05 * LAMPORTS_PER_SOL }),
      );
    }
    funding.push(lib.createAtaIdempotentIx(deployer.publicKey, who, lib.USDC_MINT));
    const missing = usdc - (await usdcOf(who));
    if (missing > 0n) {
      funding.push(usdcTransferIx(deployer.publicKey, who, missing));
      toSend += missing;
    }
  }
  check(
    deployerUsdc >= toSend + BUDGET,
    `deployer needs ${fmt(toSend + BUDGET)} USDC, holds ${fmt(deployerUsdc)} (get devnet USDC at faucet.circle.com)`,
  );
  await send("fund doer and LP", funding);

  console.log("\n2. A token whose supply can only go down: mint 1,000,000 to the doer, revoke the mint authority");
  const target = Keypair.generate();
  const doerTarget = lib.ataAddress(doer.publicKey, target.publicKey);
  await send(
    "create target mint",
    [
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: target.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(82),
        space: 82,
        programId: lib.TOKEN_PROGRAM_ID,
      }),
      initializeMintIx(target.publicKey, deployer.publicKey),
      lib.createAtaIdempotentIx(deployer.publicKey, doer.publicKey, target.publicKey),
      mintToIx(target.publicKey, doerTarget, deployer.publicKey, 1_000_000n),
      revokeMintAuthorityIx(target.publicKey, deployer.publicKey),
    ],
    [target],
  );

  console.log("\n3. The sponsor opens a burn-goal market: supply <= 500,000, YES at 10%, 1 USDC budget");
  const marketId = BigInt(Date.now());
  const market = lib.marketPda(deployer.publicKey, marketId);
  const m: MarketKeys = {
    market,
    metric: target.publicKey,
    yesMint: lib.yesMintPda(market),
    noMint: lib.noMintPda(market),
    vault: lib.vaultPda(market),
  };
  const slot = BigInt(await connection.getSlot());
  const created = await send("create_market", [
    await program.methods
      .createMarket({
        marketId: u64(marketId),
        kind: { supplyAtMost: {} },
        metricThreshold: u64(500_000n),
        cutoffSlot: u64(slot + 3_000n),
        deadlineSlot: u64(slot + 6_000n),
        yesPriceBps: PRICE_BPS,
        sponsorBudget: u64(BUDGET),
      })
      .accountsStrict({
        sponsor: deployer.publicKey,
        market,
        yesMint: m.yesMint,
        noMint: m.noMint,
        usdcMint: lib.USDC_MINT,
        vault: m.vault,
        sponsorUsdcAccount: lib.ataAddress(deployer.publicKey, lib.USDC_MINT),
        target: target.publicKey,
        metricAccount: target.publicKey,
        ...common,
      })
      .instruction(),
  ]);
  check(created.events[0]?.name === "marketCreated", "MarketCreated event");
  console.log(`    market ${market.toBase58()}`);
  expectEqual(await tokenAmount(m.vault), BUDGET, "vault holds the budget");

  console.log("\n4. The doer buys 1 YES from the sale");
  const doerUsdc = await usdcOf(doer.publicKey);
  const bought = await send("buy_yes", [await buyYesIx(m, doer.publicKey, USDC)], [doer]);
  const yesBought = bought.events.find((e) => e.name === "yesBought");
  check(yesBought?.name === "yesBought", "YesBought event");
  expectEqual(BigInt(yesBought.data.price.toString()), lib.salePrice(USDC, PRICE_BPS), "event price");
  expectEqual(doerUsdc - (await usdcOf(doer.publicKey)), lib.salePrice(USDC, PRICE_BPS), "doer paid the sale price");
  expectEqual(await tokenAmount(lib.ataAddress(doer.publicKey, m.yesMint)), USDC, "doer YES");
  const afterSale = await program.account.market.fetch(market);
  expectEqual(BigInt(afterSale.sponsorNo.toString()), USDC, "sponsor NO booked on the market");
  await expectFullyBacked(m);

  console.log("\n5. The LP mints a pair and seeds the pool at 50%");
  await send(
    "mint_pair + add_liquidity",
    [await mintPairIx(m, lp.publicKey, USDC), await addLiquidityIx(m, lp.publicKey, USDC, USDC, USDC)],
    [lp],
  );
  await expectFullyBacked(m);

  console.log("\n6. The doer buys YES with 1 USDC through the pool (mint_pair + swap)");
  const pool = async () => {
    const s = await program.account.market.fetch(market);
    return { yes: BigInt(s.poolYes.toString()), no: BigInt(s.poolNo.toString()) };
  };
  const buy = lib.buyQuote("yes", USDC, await pool());
  const yesBefore = await tokenAmount(lib.ataAddress(doer.publicKey, m.yesMint));
  await send(
    "mint_pair + swap(NO in)",
    [await mintPairIx(m, doer.publicKey, buy.mintPair), await swapIx(m, doer.publicKey, "no", buy.swapIn, buy.swapOut)],
    [doer],
  );
  expectEqual(
    (await tokenAmount(lib.ataAddress(doer.publicKey, m.yesMint))) - yesBefore,
    buy.tokensOut,
    "YES out matches buyQuote",
  );

  console.log("\n7. The doer sells 0.5 YES back for USDC (swap + burn_pair)");
  const sell = lib.sellQuote("yes", USDC / 2n, await pool());
  const usdcBefore = await usdcOf(doer.publicKey);
  await send(
    "swap(YES in) + burn_pair",
    [
      await swapIx(m, doer.publicKey, "yes", sell.swapIn, sell.swapOut),
      await burnPairIx(m, doer.publicKey, sell.usdcOut),
    ],
    [doer],
  );
  expectEqual((await usdcOf(doer.publicKey)) - usdcBefore, sell.usdcOut, "USDC out matches sellQuote");
  await expectFullyBacked(m);

  console.log("\n8. The doer burns 600,000 tokens and resolves in the same transaction");
  await send(
    "burn + resolve",
    [burnIx(doerTarget, target.publicKey, doer.publicKey, 600_000n), await resolveIx(m)],
    [doer],
  );
  const resolved = await program.account.market.fetch(market);
  check("yes" in resolved.outcome, `outcome is YES, got ${JSON.stringify(resolved.outcome)}`);
  await expectFailure("buy_yes after resolution", [await buyYesIx(m, lp.publicKey, USDC)], [lp], "AlreadyResolved");
  await expectFailure("a second resolve", [await resolveIx(m)], [], "AlreadyResolved");

  console.log("\n9. Everyone settles: LP exits, YES redeems 1:1, the sponsor takes the unspent budget");
  const shares = await tokenAmount(lib.ataAddress(lp.publicKey, lib.lpMintPda(market)));
  await send("remove_liquidity", [await removeLiquidityIx(m, lp.publicKey, shares)], [lp]);
  for (const [who, signer] of [
    [doer.publicKey, doer],
    [lp.publicKey, lp],
  ] as const) {
    const held = await tokenAmount(lib.ataAddress(who, m.yesMint));
    const before = await usdcOf(who);
    if (held > 0n) {
      await send(`redeem ${fmt(held)} YES`, [await redeemIx(m, who, m.yesMint)], [signer]);
      expectEqual((await usdcOf(who)) - before, held, "redeemed 1:1");
    }
  }
  const withdrawn = await send("withdraw_budget", [await withdrawBudgetIx(m, deployer.publicKey)]);
  const sponsorWithdrew = withdrawn.events.find((e) => e.name === "sponsorWithdrew");
  check(sponsorWithdrew?.name === "sponsorWithdrew", "SponsorWithdrew event");
  expectEqual(
    BigInt(sponsorWithdrew.data.budget.toString()),
    BUDGET - (USDC - lib.salePrice(USDC, PRICE_BPS)),
    "unspent budget",
  );
  expectEqual(await tokenAmount(m.vault), 0n, "vault drained to exactly 0");
  expectEqual(await mintSupply(m.yesMint), 0n, "every YES redeemed");
  console.log("  ✓ vault 0, YES supply 0");

  console.log("\n10. Clean up: burn worthless NO and close the accounts, return all USDC to the deployer");
  for (const signer of [doer, lp]) {
    const cleanup: TransactionInstruction[] = [];
    for (const mint of [m.noMint, lib.lpMintPda(market), m.yesMint, target.publicKey]) {
      const account = lib.ataAddress(signer.publicKey, mint);
      const info = await connection.getAccountInfo(account);
      if (!info) continue;
      const amount = info.data.readBigUInt64LE(64);
      if (amount > 0n) cleanup.push(burnIx(account, mint, signer.publicKey, amount));
      cleanup.push(closeAccountIx(account, signer.publicKey));
    }
    const usdc = await usdcOf(signer.publicKey);
    if (usdc > 0n) cleanup.push(usdcTransferIx(signer.publicKey, deployer.publicKey, usdc));
    if (cleanup.length) await send(`clean up ${signer === doer ? "doer" : "LP"}`, cleanup, [signer]);
  }
  expectEqual(await usdcOf(deployer.publicKey), usdcStart, "every USDC base unit is back with the deployer");
  console.log(`\nSmoke test passed: ${fmt(usdcStart)} USDC in, ${fmt(usdcStart)} USDC out, vault empty.`);
}

main().catch((error) => {
  console.error(`\nSmoke test FAILED: ${error instanceof Error ? error.message : error}`);
  if (error?.logs) console.error(error.logs.join("\n"));
  process.exit(1);
});
