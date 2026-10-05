// Seeds devnet with demo markets for the app, on named tokens (Metaplex metadata) so they read like
// real ones: a burn goal partway there with a pool, renounce goals (mint and freeze), a lock goal,
// a stake goal on a live devnet validator, and a market that resolves NO. Run after deploying:
//
//   bun run seed:devnet                      # every step
//   bun run seed:devnet name burn stake      # only some steps
//
// Steps: name (adds names to earlier demo tokens the deployer still controls), burn, renounce,
// freeze, lock, stake, miss. All of them cost the deployer ~0.15 SOL and ~11 USDC, which stays in
// the open markets (the resolved one pays its USDC back).

import { BN } from "@anchor-lang/core";
import { Keypair, PublicKey } from "@solana/web3.js";

import {
  addLiquidityIx,
  buyYesIx,
  createMarketIx,
  marketKeys,
  mintPairIx,
  resolveIx,
  withdrawBudgetIx,
  type ResolverKind,
} from "../app/lib/instructions";
import * as lib from "../app/lib/market";
import { parseMint } from "../app/lib/metric";
import { fetchTokenNames } from "../app/lib/tokens";
import {
  burnIx,
  check,
  connection,
  createMetadataIx,
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
const SOL = 1_000_000_000n;
const me = deployer.publicKey;

/** Slots in a week at the cluster's recent pace (devnet has run near 235 ms per slot, not 400). */
async function slotsPerWeek() {
  const samples = await connection.getRecentPerformanceSamples(10);
  const slots = samples.reduce((sum, s) => sum + s.numSlots, 0);
  const seconds = samples.reduce((sum, s) => sum + s.samplePeriodSecs, 0);
  return BigInt(Math.round((7 * 86_400 * slots) / seconds));
}

/** A fresh named 6-decimal token with `supply` minted to the deployer, who stays its authority. */
async function demoToken(name: string, symbol: string, supply: bigint, opts: { freeze?: boolean } = {}) {
  const mint = Keypair.generate();
  const account = lib.ataAddress(me, mint.publicKey);
  await send(
    `$${symbol}: create "${name}" with ${fmt(supply)} supply`,
    [
      ...(await createMintIxs(mint.publicKey, me, opts.freeze ? me : undefined)),
      createMetadataIx(mint.publicKey, me, name, symbol),
      lib.createAtaIdempotentIx(me, me, mint.publicKey),
      mintToIx(mint.publicKey, account, me, supply),
    ],
    [mint],
  );
  return { mint: mint.publicKey, account };
}

async function openMarket(
  label: string,
  p: { kind: ResolverKind; target: PublicKey; metric: PublicKey; threshold: bigint },
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

const NAMES: [string, string][] = [
  ["Keystone", "KEYS"],
  ["Vaultline LP", "VLP"],
  ["Driftwood", "DRIFT"],
  ["Lumen", "LUMEN"],
];

const steps: Record<string, (week: bigint) => Promise<void>> = {
  /** Names earlier demo tokens that have no metadata yet and whose mint authority is still the deployer. */
  async name() {
    const markets = (await program.account.market.all()).filter((m) => m.account.sponsor.equals(me));
    const mints = [
      ...new Map(markets.map((m) => [m.account.targetPubkey.toBase58(), m.account.targetPubkey])).values(),
    ];
    const named = await fetchTokenNames(connection, mints);
    const infos = await connection.getMultipleAccountsInfo(mints);
    let next = 0;
    for (const [i, mint] of mints.entries()) {
      const view = parseMint(infos[i] ?? null);
      if (!view || named.has(mint.toBase58()) || !view.mintAuthority?.equals(me) || next >= NAMES.length) continue;
      const [name, symbol] = NAMES[next++]!;
      await send(`name ${mint.toBase58().slice(0, 4)}… "${name}" ($${symbol})`, [
        createMetadataIx(mint, me, name, symbol),
      ]);
    }
    if (next === 0) console.log("  nothing to name");
  },

  /** Burn goal 70% there: 1,000,000 $EMBER, 350,000 burned, target 500,000. YES sold, pool at 20%. */
  async burn(week) {
    const token = await demoToken("Ember", "EMBER", 1_000_000n * TOKEN);
    await send("$EMBER: revoke the mint authority and burn 350,000", [
      revokeMintAuthorityIx(token.mint, me),
      burnIx(token.account, token.mint, me, 350_000n * TOKEN),
    ]);
    const m = await openMarket(
      "$EMBER",
      { kind: { supplyAtMost: {} }, target: token.mint, metric: token.mint, threshold: 500_000n * TOKEN },
      { priceBps: 1_200, budget: 2n * USDC, cutoffIn: week, deadlineIn: 2n * week },
    );
    await send("$EMBER: buy 1 YES from the sale", [await buyYesIx(program, m, me, USDC)]);
    await send("$EMBER: mint 5 pairs and seed the pool at 20%", [
      await mintPairIx(program, m, me, 5n * USDC),
      await addLiquidityIx(program, m, me, {
        maxYes: 5n * USDC,
        maxNo: lib.seedNoForPrice(5n * USDC, 2_000),
        minShares: 0n,
      }),
    ]);
  },

  /** Renounce goal: $KEYS's mint authority is still live. */
  async renounce(week) {
    const token = await demoToken("Keystone", "KEYS", 21_000_000n * TOKEN);
    await openMarket(
      "$KEYS",
      { kind: { mintAuthorityRevoked: {} }, target: token.mint, metric: token.mint, threshold: 0n },
      { priceBps: 2_000, budget: USDC, cutoffIn: week, deadlineIn: 2n * week },
    );
  },

  /** Renounce goal: $FROST's freeze authority is still live. */
  async freeze(week) {
    const token = await demoToken("Frost", "FROST", 50_000_000n * TOKEN, { freeze: true });
    await openMarket(
      "$FROST",
      { kind: { freezeAuthorityRevoked: {} }, target: token.mint, metric: token.mint, threshold: 0n },
      { priceBps: 2_500, budget: USDC, cutoffIn: week, deadlineIn: 2n * week },
    );
  },

  /** Lock goal: 300,000 $VLP in the program's lock account, 100,000 locked so far. */
  async lock(week) {
    const token = await demoToken("Vaultline LP", "VLP", 1_000_000n * TOKEN);
    const locked = lib.lockAta(token.mint);
    await send("$VLP: send 100,000 to the lock account", [
      lib.createAtaIdempotentIx(me, lib.lockOwner(), token.mint),
      transferIx(token.account, locked, me, 100_000n * TOKEN),
    ]);
    await openMarket(
      "$VLP",
      { kind: { lockedAtLeast: {} }, target: token.mint, metric: locked, threshold: 300_000n * TOKEN },
      { priceBps: 1_500, budget: USDC, cutoffIn: week, deadlineIn: 2n * week },
    );
  },

  /** Stake goal on the largest devnet validator: 2% more stake than it has now, in the next epoch. */
  async stake(week) {
    const [{ epoch }, { current }] = await Promise.all([connection.getEpochInfo(), connection.getVoteAccounts()]);
    const top = [...current].sort((a, b) => b.activatedStake - a.activatedStake)[0];
    check(top, "devnet has an active validator");
    const stake = BigInt(top.activatedStake);
    // 2% above today's stake, rounded up to a whole 1,000 SOL.
    const step = 1_000n * SOL;
    const target = (((stake * 102n) / 100n + step - 1n) / step) * step;
    const vote = new PublicKey(top.votePubkey);
    console.log(`    validator ${top.votePubkey}: ${fmt(stake / 1000n)} SOL staked, target ${fmt(target / 1000n)} SOL`);
    await openMarket(
      "stake",
      { kind: { stakeAtLeast: { epoch: new BN(epoch + 1) } }, target: vote, metric: vote, threshold: target },
      { priceBps: 3_000, budget: USDC, cutoffIn: week, deadlineIn: week },
    );
  },

  /** A market that misses its deadline and resolves NO. */
  async miss() {
    const token = await demoToken("Ashfall", "ASH", 1_000_000n * TOKEN);
    await send("$ASH: revoke the mint authority", [revokeMintAuthorityIx(token.mint, me)]);
    const m = await openMarket(
      "$ASH",
      { kind: { supplyAtMost: {} }, target: token.mint, metric: token.mint, threshold: 100_000n * TOKEN },
      { priceBps: 1_000, budget: USDC, cutoffIn: 75n, deadlineIn: 100n },
    );
    await send("$ASH: buy 1 YES from the sale", [await buyYesIx(program, m, me, USDC)]);
    const deadline = (await program.account.market.fetch(m.market)).deadlineSlot.toNumber();
    process.stdout.write("    waiting for the deadline to pass");
    while ((await connection.getSlot()) <= deadline) {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
    console.log();
    await send("$ASH: resolve (NO)", [await resolveIx(program, m)]);
    await send("$ASH: sponsor withdraws budget and NO", [await withdrawBudgetIx(program, m, me)]);
  },
};

async function main() {
  const chosen = process.argv.slice(2);
  const unknown = chosen.filter((s) => !(s in steps));
  check(unknown.length === 0, `unknown steps ${unknown.join(", ")}; pick from ${Object.keys(steps).join(", ")}`);
  console.log(`pred-provable devnet seed\n  program  ${lib.PROGRAM_ID.toBase58()}\n  rpc      ${RPC_URL}`);
  check((await connection.getAccountInfo(lib.PROGRAM_ID))?.executable, "program is deployed");
  console.log(`  deployer holds ${fmt(await usdcOf(me))} USDC`);
  const week = await slotsPerWeek();
  for (const [name, step] of Object.entries(steps)) {
    if (chosen.length && !chosen.includes(name)) continue;
    console.log(`\n${name}`);
    await step(week);
  }
  console.log(`\nSeeded. Deployer now holds ${fmt(await usdcOf(me))} USDC.`);
}

main().catch((error) => {
  console.error(`\nSeed FAILED: ${error instanceof Error ? error.message : error}`);
  if (error?.logs) console.error(error.logs.join("\n"));
  process.exit(1);
});
