// Seeds devnet with demo markets for the app, one for each state the explorer and the market page
// show: a burn goal partway there with a pool, a renounce goal, a lock goal, and a market that has
// resolved NO. Run it after `bun run deploy:devnet`:
//
//   bun run seed:devnet
//
// Costs the deployer ~0.06 SOL and 8 devnet USDC, which stay in the open markets (the resolved one
// pays its USDC back). Each run adds a fresh set.

import { Keypair, type PublicKey } from "@solana/web3.js";

import {
  addLiquidityIx,
  buyYesIx,
  createMarketIx,
  marketKeys,
  mintPairIx,
  resolveIx,
  withdrawBudgetIx,
} from "../app/lib/instructions";
import * as lib from "../app/lib/market";
import {
  burnIx,
  check,
  connection,
  createMintIxs,
  deployer,
  fmt,
  mintToIx,
  program,
  revokeMintAuthorityIx,
  RPC_URL,
  send,
  transferIx,
  USDC,
  usdcOf,
} from "./devnet";

/** One whole token of a 6-decimal demo mint. */
const TOKEN = 1_000_000n;
/** Slots in a week at the cluster's recent pace (devnet has run near 235 ms per slot, not 400). */
async function slotsPerWeek() {
  const samples = await connection.getRecentPerformanceSamples(10);
  const slots = samples.reduce((sum, s) => sum + s.numSlots, 0);
  const seconds = samples.reduce((sum, s) => sum + s.samplePeriodSecs, 0);
  return BigInt(Math.round((7 * 86_400 * slots) / seconds));
}
const me = deployer.publicKey;

/** A fresh 6-decimal token with `supply` minted to the deployer; the deployer stays its mint authority. */
async function demoToken(label: string, supply: bigint) {
  const mint = Keypair.generate();
  const account = lib.ataAddress(me, mint.publicKey);
  await send(
    `${label}: create a token with ${fmt(supply)} supply`,
    [
      ...(await createMintIxs(mint.publicKey, me)),
      lib.createAtaIdempotentIx(me, me, mint.publicKey),
      mintToIx(mint.publicKey, account, me, supply),
    ],
    [mint],
  );
  return { mint: mint.publicKey, account };
}

async function openMarket(
  label: string,
  p: { kind: Parameters<typeof createMarketIx>[1]["kind"]; target: PublicKey; metric: PublicKey; threshold: bigint },
  opts: { priceBps: number; budget: bigint; cutoffIn: bigint; deadlineIn: bigint },
) {
  const marketId = BigInt(Date.now());
  const slot = BigInt(await connection.getSlot());
  await send(`${label}: create_market`, [
    await createMarketIx(program, {
      sponsor: me,
      marketId,
      ...p,
      cutoffSlot: slot + opts.cutoffIn,
      deadlineSlot: slot + opts.deadlineIn,
      yesPriceBps: opts.priceBps,
      budget: opts.budget,
    }),
  ]);
  const market = lib.marketPda(me, marketId);
  console.log(`    market ${market.toBase58()}`);
  return marketKeys(market, p.metric);
}

async function main() {
  console.log(`pred-provable devnet seed\n  program  ${lib.PROGRAM_ID.toBase58()}\n  rpc      ${RPC_URL}`);
  check((await connection.getAccountInfo(lib.PROGRAM_ID))?.executable, "program is deployed");
  check((await usdcOf(me)) >= 9n * USDC, "the deployer holds at least 9 USDC (faucet.circle.com)");
  const WEEK = await slotsPerWeek();

  console.log("\n1. Burn goal: supply 1,000,000 -> 500,000, 200,000 already burned, YES sold, pool at 20%");
  const burn = await demoToken("burn", 1_000_000n * TOKEN);
  await send("burn: revoke the mint authority and burn 200,000", [
    revokeMintAuthorityIx(burn.mint, me),
    burnIx(burn.account, burn.mint, me, 200_000n * TOKEN),
  ]);
  const burnMarket = await openMarket(
    "burn",
    { kind: { supplyAtMost: {} }, target: burn.mint, metric: burn.mint, threshold: 500_000n * TOKEN },
    { priceBps: 1_000, budget: 2n * USDC, cutoffIn: WEEK, deadlineIn: 2n * WEEK },
  );
  await send("burn: buy 1 YES from the sale", [await buyYesIx(program, burnMarket, me, USDC)]);
  await send("burn: mint 4 pairs and seed the pool with 4 YES / 1 NO", [
    await mintPairIx(program, burnMarket, me, 4n * USDC),
    await addLiquidityIx(program, burnMarket, me, { maxYes: 4n * USDC, maxNo: USDC, minShares: 0n }),
  ]);

  console.log("\n2. Renounce goal: the token's mint authority is still live");
  const renounce = await demoToken("renounce", 21_000_000n * TOKEN);
  await openMarket(
    "renounce",
    { kind: { mintAuthorityRevoked: {} }, target: renounce.mint, metric: renounce.mint, threshold: 0n },
    { priceBps: 2_000, budget: USDC, cutoffIn: WEEK, deadlineIn: 2n * WEEK },
  );

  console.log("\n3. Lock goal: 300,000 tokens under the incinerator, 100,000 locked so far");
  const lock = await demoToken("lock", 1_000_000n * TOKEN);
  const locked = lib.incineratorAta(lock.mint);
  await send("lock: send 100,000 to the incinerator", [
    lib.createAtaIdempotentIx(me, lib.INCINERATOR, lock.mint),
    transferIx(lock.account, locked, me, 100_000n * TOKEN),
  ]);
  await openMarket(
    "lock",
    { kind: { lockedAtLeast: {} }, target: lock.mint, metric: locked, threshold: 300_000n * TOKEN },
    { priceBps: 1_500, budget: USDC, cutoffIn: WEEK, deadlineIn: 2n * WEEK },
  );

  console.log("\n4. A market that misses its deadline and resolves NO");
  const miss = await demoToken("miss", 1_000_000n * TOKEN);
  await send("miss: revoke the mint authority", [revokeMintAuthorityIx(miss.mint, me)]);
  const missMarket = await openMarket(
    "miss",
    { kind: { supplyAtMost: {} }, target: miss.mint, metric: miss.mint, threshold: 100_000n * TOKEN },
    { priceBps: 1_000, budget: USDC, cutoffIn: 75n, deadlineIn: 100n },
  );
  await send("miss: buy 1 YES from the sale", [await buyYesIx(program, missMarket, me, USDC)]);
  const deadline = (await program.account.market.fetch(missMarket.market)).deadlineSlot.toNumber();
  process.stdout.write("    waiting for the deadline to pass");
  while ((await connection.getSlot()) <= deadline) {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  console.log();
  await send("miss: resolve (NO)", [await resolveIx(program, missMarket)]);
  await send("miss: sponsor withdraws budget and NO", [await withdrawBudgetIx(program, missMarket, me)]);

  console.log(`\nSeeded. Deployer now holds ${fmt(await usdcOf(me))} USDC.`);
}

main().catch((error) => {
  console.error(`\nSeed FAILED: ${error instanceof Error ? error.message : error}`);
  if (error?.logs) console.error(error.logs.join("\n"));
  process.exit(1);
});
