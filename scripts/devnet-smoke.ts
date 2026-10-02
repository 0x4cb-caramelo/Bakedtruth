// Devnet smoke test: the full USDC lifecycle against the deployed program, with the client stack
// the app uses (Anchor client, web3.js v1, app/lib/market.ts and the app's instruction builders in
// app/lib/instructions.ts) and Circle's real devnet USDC.
//
//   bun run deploy:devnet && bun run smoke:devnet
//
// The deployer keypair (DEVNET_WALLET, default ~/.config/solana/pred-provable-devnet.json) pays and
// sponsors; it needs ~0.2 SOL and 4 devnet USDC (https://faucet.circle.com). The doer and liquidity
// provider are keypairs derived from the deployer's secret, so an interrupted run loses nothing:
// the next run reuses them. Every USDC base unit returns to the deployer at the end.

import { Keypair, LAMPORTS_PER_SOL, SystemProgram, type TransactionInstruction } from "@solana/web3.js";

import * as lib from "../app/lib/market";
import {
  addLiquidityIx,
  burnPairIx,
  buyViaPoolIxs,
  buyYesIx,
  createMarketIx,
  mintPairIx,
  marketKeys,
  redeemIx,
  removeLiquidityIx,
  resolveIx,
  swapIx,
  withdrawBudgetIx,
  type MarketKeys,
} from "../app/lib/instructions";
import {
  burnIx,
  check,
  closeAccountIx,
  connection,
  createMintIxs,
  deployer,
  derived,
  expectEqual,
  expectFailure,
  fmt,
  mintSupply,
  mintToIx,
  program,
  revokeMintAuthorityIx,
  RPC_URL,
  send,
  tokenAmount,
  USDC,
  usdcOf,
  usdcTransferIx,
} from "./devnet";

const PRICE_BPS = 1_000;
const BUDGET = USDC;
const doer = derived("pred-provable-smoke-doer");
const lp = derived("pred-provable-smoke-lp");

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
      ...(await createMintIxs(target.publicKey, deployer.publicKey)),
      lib.createAtaIdempotentIx(deployer.publicKey, doer.publicKey, target.publicKey),
      mintToIx(target.publicKey, doerTarget, deployer.publicKey, 1_000_000n),
      revokeMintAuthorityIx(target.publicKey, deployer.publicKey),
    ],
    [target],
  );

  console.log("\n3. The sponsor opens a burn-goal market: supply <= 500,000, YES at 10%, 1 USDC budget");
  const marketId = BigInt(Date.now());
  const market = lib.marketPda(deployer.publicKey, marketId);
  const m = marketKeys(market, target.publicKey);
  const slot = BigInt(await connection.getSlot());
  const created = await send("create_market", [
    await createMarketIx(program, {
      sponsor: deployer.publicKey,
      marketId,
      kind: { supplyAtMost: {} },
      target: target.publicKey,
      metric: target.publicKey,
      threshold: 500_000n,
      cutoffSlot: slot + 3_000n,
      deadlineSlot: slot + 6_000n,
      yesPriceBps: PRICE_BPS,
      budget: BUDGET,
    }),
  ]);
  check(created.events[0]?.name === "marketCreated", "MarketCreated event");
  console.log(`    market ${market.toBase58()}`);
  expectEqual(await tokenAmount(m.vault), BUDGET, "vault holds the budget");

  console.log("\n4. The doer buys 1 YES from the sale");
  const doerUsdc = await usdcOf(doer.publicKey);
  const bought = await send("buy_yes", [await buyYesIx(program, m, doer.publicKey, USDC)], [doer]);
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
    [
      await mintPairIx(program, m, lp.publicKey, USDC),
      await addLiquidityIx(program, m, lp.publicKey, { maxYes: USDC, maxNo: USDC, minShares: USDC }),
    ],
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
    await buyViaPoolIxs(program, m, doer.publicKey, "yes", buy.mintPair, buy.swapOut),
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
      await swapIx(program, m, doer.publicKey, "yes", sell.swapIn, sell.swapOut),
      await burnPairIx(program, m, doer.publicKey, sell.usdcOut),
    ],
    [doer],
  );
  expectEqual((await usdcOf(doer.publicKey)) - usdcBefore, sell.usdcOut, "USDC out matches sellQuote");
  await expectFullyBacked(m);

  console.log("\n8. The doer burns 600,000 tokens and resolves in the same transaction");
  await send(
    "burn + resolve",
    [burnIx(doerTarget, target.publicKey, doer.publicKey, 600_000n), await resolveIx(program, m)],
    [doer],
  );
  const resolved = await program.account.market.fetch(market);
  check("yes" in resolved.outcome, `outcome is YES, got ${JSON.stringify(resolved.outcome)}`);
  await expectFailure(
    "buy_yes after resolution",
    [await buyYesIx(program, m, lp.publicKey, USDC)],
    [lp],
    "AlreadyResolved",
  );
  await expectFailure("a second resolve", [await resolveIx(program, m)], [], "AlreadyResolved");

  console.log("\n9. Everyone settles: LP exits, YES redeems 1:1, the sponsor takes the unspent budget");
  const shares = await tokenAmount(lib.ataAddress(lp.publicKey, lib.lpMintPda(market)));
  await send(
    "remove_liquidity",
    [await removeLiquidityIx(program, m, lp.publicKey, { shares, minYes: 0n, minNo: 0n })],
    [lp],
  );
  for (const [who, signer] of [
    [doer.publicKey, doer],
    [lp.publicKey, lp],
  ] as const) {
    const held = await tokenAmount(lib.ataAddress(who, m.yesMint));
    const before = await usdcOf(who);
    if (held > 0n) {
      await send(`redeem ${fmt(held)} YES`, [await redeemIx(program, m, who, m.yesMint)], [signer]);
      expectEqual((await usdcOf(who)) - before, held, "redeemed 1:1");
    }
  }
  const withdrawn = await send("withdraw_budget", [await withdrawBudgetIx(program, m, deployer.publicKey)]);
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
