/**
 * Purpose: seed a cluster with example campaigns opened free by a team key (Sprint 05 DoD), one per kind that can
 *          open there: a price campaign above and one below (targets placed from the live sponsored price, past
 *          row 3's distance), a burn campaign on a fresh mint, and, when a real account is given (or captured, on
 *          the local surfnet), locked liquidity and a stake pool. `StakeAtLeast` stays closed in this build.
 * Version: 0.2.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; replaces the USDC seed of the frozen program
 *
 *   bun run seed:devnet                                        # the local offline surfnet (default)
 *   bun run seed:devnet -- --cluster devnet [--damm-pool <address>] [--stake-pool <address>]
 *
 * On devnet the program must be deployed and initialized; TEAM_KEYPAIR is your team key, DEVNET_WALLET pays.
 */
import { parseArgs } from "node:util";

import { address, generateKeyPairSigner, type Address } from "@solana/kit";

import {
  DEVNET_FEEDS,
  ReaderKind,
  campaignAddress,
  readLockedLiquidity,
  readPriceUpdate,
  readStakePool,
  sponsoredPriceAddress,
} from "@brot/sdk/read";
import { buildOpenCampaign, randomCampaignId, type OpenCampaignArgs } from "@brot/sdk/tx";

import { check, openSession, SOL, step, type Session } from "./devnet";
import { burnMint } from "./validator/cycle-open";
import { account, clock, expectOk, send } from "./validator/rpc";
import { FIXTURES } from "./validator/world";

const DAY = 86_400n;
const { values: o } = parseArgs({
  strict: false,
  options: { "damm-pool": { type: "string" }, "stake-pool": { type: "string" } },
});

type Spec = Omit<OpenCampaignArgs, "id" | "openingUsd" | "maxLamports" | "expectedParamsVersion">;

/** Opens one free team campaign and prints where it lives. */
async function open(s: Session, label: string, spec: Spec, metricAccount?: Address) {
  const config = await s.config();
  const args = {
    ...spec,
    id: randomCampaignId(),
    openingUsd: 0n,
    maxLamports: 0n,
    expectedParamsVersion: config.paramsVersion,
  };
  const ix = await buildOpenCampaign({ creator: s.team, args, metricAccount });
  const sent = expectOk(await send(s.rpc, s.team, [ix]), label);
  check(
    sent.events[0]?.name === "CampaignOpened",
    `${label}: campaign ${args.id} at ${await campaignAddress(args.id)}`,
  );
}

const feedHex = (symbol: string) => DEVNET_FEEDS.find(([, name]) => name === symbol)![0];

/** The feed's sponsored price now, and a target 5% past the edge of its confidence band. */
async function priceTarget(s: Session, symbol: string, above: boolean) {
  const hex = feedHex(symbol);
  const found = (await account(s.rpc, await sponsoredPriceAddress(hex)))!;
  const r = readPriceUpdate(found.owner, found.data, hex);
  const target = above ? ((r.price + r.conf) * 105n) / 100n + 1n : ((r.price - r.conf) * 95n) / 100n;
  return { hex, target, shown: `${r.price}e${r.exponent}` };
}

/** A stake pool campaign on the next epoch, its deadline after the epoch's latest plausible start (500 ms slots). */
async function stakePoolSpec(s: Session, pool: Address): Promise<Spec> {
  const read = (await account(s.rpc, pool))!;
  // The higher of the pool's two totals, as the program's row 3 compares the target with it.
  const view = readStakePool(read.owner, read.data);
  const total = view.totalLamports > view.lastEpochTotalLamports ? view.totalLamports : view.lastEpochTotalLamports;
  const info = await s.rpc.call<{ epoch: number; absoluteSlot: number }>("getEpochInfo");
  const schedule = await s.rpc.call<{ slotsPerEpoch: number; firstNormalEpoch: number; firstNormalSlot: number }>(
    "getEpochSchedule",
  );
  const epoch = BigInt(info.epoch) + 1n;
  const firstSlot =
    (epoch - BigInt(schedule.firstNormalEpoch)) * BigInt(schedule.slotsPerEpoch) + BigInt(schedule.firstNormalSlot);
  const now = (await clock(s.rpc)).unixTimestamp;
  const latestStart = now + ((firstSlot - BigInt(info.absoluteSlot)) * 500n) / 1000n;
  const floor = now + 3n * DAY + 3_600n;
  const deadlineAt = latestStart + 3_600n > floor ? latestStart + 3_600n : floor;
  return { kind: ReaderKind.StakePoolTvlAtLeast, target: total * 2n, deadlineAt, epoch };
}

async function main() {
  const s = await openSession(import.meta.path);
  try {
    await s.freshPrices();
    const now = (await clock(s.rpc)).unixTimestamp;
    step(`price campaigns (${s.cluster})`);
    const btc = await priceTarget(s, "Crypto.BTC/USD", true);
    const btcSpec = { kind: ReaderKind.PriceTouch, feedId: btc.hex, target: btc.target, deadlineAt: now + 14n * DAY };
    await open(s, `BTC/USD above ${btc.target} (now ${btc.shown})`, btcSpec);
    const solUsd = await priceTarget(s, "Crypto.SOL/USD", false);
    const solSpec = { kind: ReaderKind.PriceTouch, direction: 1, feedId: solUsd.hex, target: solUsd.target };
    await open(s, `SOL/USD below ${solUsd.target} (now ${solUsd.shown})`, { ...solSpec, deadlineAt: now + 7n * DAY });

    step("a burn campaign on a fresh mint (its authority revoked)");
    const holder = s.cluster === "local" ? s.team : await generateKeyPairSigner();
    await s.fund(holder.address, SOL / 10n);
    const { mint } = await burnMint(s, holder, 1_000_000n);
    const burn = { kind: ReaderKind.SupplyAtMost, target: 500_000n, deadlineAt: now + 30n * DAY };
    await open(s, "supply at most 500,000", burn, mint);

    const dammPool = o["damm-pool"] ?? (s.cluster === "local" ? FIXTURES["damm-sol-usdc"][0] : undefined);
    if (dammPool) {
      step("locked liquidity on a Meteora DAMM v2 pool");
      const pool = (await account(s.rpc, address(String(dammPool))))!;
      const target = (readLockedLiquidity(pool.owner, pool.data) * 11n) / 10n + 1n;
      const spec = { kind: ReaderKind.DammV2LockedAtLeast, target, deadlineAt: now + 30n * DAY };
      await open(s, `locked at least ${target}`, spec, address(String(dammPool)));
    } else console.log("\n(no --damm-pool on this cluster: locked liquidity skipped)");

    const pool = o["stake-pool"] ?? (s.cluster === "local" ? FIXTURES["stakepool-jitosol"][0] : undefined);
    if (pool) {
      step("a stake pool's size at the next epoch");
      const spec = await stakePoolSpec(s, address(String(pool)));
      await open(s, `pool at least ${spec.target} lamports in epoch ${spec.epoch}`, spec, address(String(pool)));
    } else console.log("\n(no --stake-pool on this cluster: stake pool skipped)");
    console.log("\n(StakeAtLeast is closed in this build until a devnet YES is recorded: not seeded)");
    console.log(`\nseed: done on ${s.cluster}`);
  } finally {
    s.stop();
  }
}

main().catch((error) => {
  console.error(`\nseed FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
