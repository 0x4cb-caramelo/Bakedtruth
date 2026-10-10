/**
 * Purpose: the refusals of `user_open_campaign` on a local validator, one case per error, as the LiteSVM suites
 *          test them (tests/brot/open-campaign-refuses*.test.ts, open-campaign-kinds.test.ts): rows 1 to 10 of TP
 *          §3.4.10, from the kind byte to the retry, each sent and required to fail with its own error.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import { configAddress, decodeGlobalConfig } from "@brot/sdk/read";

import { BTC_PRICE } from "../../tests/brot/flows";
import * as I from "../../tests/brot/instructions";
import * as P from "../../tests/brot/program";
import * as R from "../../tests/brot/readers";

import { funded, type Env } from "./negative-baselines";
import { captured, writePrice } from "./negative-price";
import { account, clock, send, type Rpc, type Sent } from "./rpc";
import { setAccount } from "./surfnet";
import { FIXTURES, refreshPrices, SOL } from "./world";

export type RuleCase = { name: string; run: (env: Env) => Promise<Sent> };

let creator: KeyPairSigner | null = null;
let nextId = 11_000_000n;
const LEGACY_RECEIVER = "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ";
const BTC = captured("btc");
const SOL_USD = captured("sol");

async function paramsVersion(rpc: Rpc) {
  return decodeGlobalConfig((await account(rpc, await configAddress()))!).paramsVersion;
}

/** The kit's default paid opening (BTC/USD above 110%, seven days, US$500) with `over`, sent by a non-team wallet. */
export async function open(
  env: Env,
  over: Partial<I.OpenArgs> = {},
  slots: { metric?: Address; solUsd?: Address } = {},
) {
  creator ??= await funded(env.rpc, 1_000n);
  const now = (await clock(env.rpc)).unixTimestamp;
  const args: I.OpenArgs = {
    id: nextId++,
    feedId: P.BTC_USD_FEED_ID,
    direction: P.Direction.Above,
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: now + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * SOL,
    expectedParamsVersion: await paramsVersion(env.rpc),
    ...over,
  };
  return send(env.rpc, env.payer, [await I.openCampaignIx(creator, args, slots)]);
}

/** A raw account written on the surfnet (a mint, a broken mint) at a fresh address. */
async function raw(env: Env, data: Uint8Array, owner: string): Promise<Address> {
  const at = (await generateKeyPairSigner()).address;
  await setAccount(env.rpc, at, { lamports: SOL, data, owner });
  return at;
}

const price = (name: string, which: "sol" | "btc", change: Parameters<typeof writePrice>[2]): RuleCase => ({
  name,
  run: async (env) => {
    await writePrice(env.rpc, which, change);
    return open(env);
  },
});
const supply = (env: Env, metric: Address) =>
  open(env, { kind: P.ReaderKind.SupplyAtMost, feedId: new Uint8Array(32), target: 1n }, { metric });
const now = async (env: Env) => (await clock(env.rpc)).unixTimestamp;
const pool = FIXTURES["stakepool-jitosol"][0] as Address;

export const OPEN_RULES: RuleCase[] = [
  { name: "UnknownReaderKind", run: (env) => open(env, { kind: 9 }) },
  { name: "ReaderKindNotOpen", run: (env) => open(env, { kind: P.ReaderKind.StakeAtLeast, epoch: 1n }) },
  { name: "InvalidDirection", run: (env) => open(env, { direction: 2 }) },
  { name: "UnusedArgumentNotZero", run: (env) => open(env, { kind: P.ReaderKind.SupplyAtMost, target: 1n }) },
  { name: "FeedNotOnList", run: (env) => open(env, { feedId: new Uint8Array(32).fill(7) }) },
  { name: "MetricAccountMismatch", run: (env) => open(env, {}, { metric: P.SOL_USD_ACCOUNT }) },
  price("PriceNotFullyVerified", "btc", { verification: 0 }),
  price("PriceStale", "btc", { age: 1_000n }),
  price("PriceNonPositive", "btc", { price: -1n }),
  price("PriceConfidenceTooWide", "btc", { conf: BTC.price / 100n }),
  { name: "TargetAlreadyTouched", run: (env) => open(env, { target: BTC.price }) },
  { name: "TargetTooClose", run: (env) => open(env, { target: BTC.price + BTC.conf + 1n }) },
  { name: "TargetUnreachable", run: (env) => open(env, { target: BTC.price * 11n }) },
  { name: "DurationTooShort", run: async (env) => open(env, { deadlineAt: (await now(env)) + 3n * P.DAY - 60n }) },
  { name: "DurationTooLong", run: async (env) => open(env, { deadlineAt: (await now(env)) + 90n * P.DAY + 60n }) },
  { name: "OpeningUsdBelowFee", run: (env) => open(env, { openingUsd: 499n }) },
  { name: "OpeningAboveMaxLamports", run: (env) => open(env, { maxLamports: 1n }) },
  { name: "SolUsdAccountMismatch", run: (env) => open(env, {}, { solUsd: P.BTC_USD_ACCOUNT }) },
  price("SolUsdStale", "sol", { age: 1_000n }),
  price("SolUsdConfidenceTooWide", "sol", { conf: SOL_USD.price / 50n }),
  price("SolUsdPriceNonPositive", "sol", { price: -1n }),
  price("SolUsdWrongOwner", "sol", { owner: LEGACY_RECEIVER }),
  price("SolUsdBadLayout", "sol", { length: 133 }),
  price("SolUsdNotFullyVerified", "sol", { verification: 0 }),
  price("SolUsdWrongFeed", "sol", { feedHex: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43" }),
  price("PriceExponentOutOfRange", "sol", { exponent: -19 }),
  { name: "CreationParamsChanged", run: (env) => open(env, { expectedParamsVersion: 7 }) },
  {
    name: "OpenWhilePaused",
    run: async (env) => {
      await send(env.rpc, env.payer, [await I.pauseEntriesIx(env.team[0])]);
      const sent = await open(env);
      await send(env.rpc, env.payer, [await I.resumeEntriesIx(env.admin)]);
      return sent;
    },
  },
  {
    name: "MintAuthorityLive",
    run: async (env) =>
      supply(
        env,
        await raw(env, R.mintBytes({ supply: 1_000n, mintAuthority: env.admin.address }), P.SPL_TOKEN_PROGRAM_ID),
      ),
  },
  {
    name: "ReaderWrongOwner",
    run: async (env) =>
      supply(env, await raw(env, R.mintBytes({ supply: 1_000n, mintAuthority: null }), P.TOKEN_2022_PROGRAM_ID)),
  },
  {
    name: "ReaderBadLayout",
    run: async (env) => supply(env, await raw(env, new Uint8Array(81), P.SPL_TOKEN_PROGRAM_ID)),
  },
  {
    name: "EpochAlreadyStarted",
    run: (env) =>
      open(
        env,
        { kind: P.ReaderKind.StakePoolTvlAtLeast, feedId: new Uint8Array(32), target: 1n, epoch: 0n },
        { metric: pool },
      ),
  },
  {
    name: "EpochAfterDeadline",
    run: async (env) =>
      open(
        env,
        {
          kind: P.ReaderKind.StakePoolTvlAtLeast,
          feedId: new Uint8Array(32),
          target: 1n,
          epoch: 100n,
          deadlineAt: (await now(env)) + 3n * P.DAY + 3_600n,
        },
        { metric: pool },
      ),
  },
  {
    name: "BadInstructionData",
    run: async (env) => {
      creator ??= await funded(env.rpc, 1_000n);
      const ix = await I.openCampaignIx(creator, {
        id: nextId++,
        feedId: P.BTC_USD_FEED_ID,
        target: 1n,
        deadlineAt: 1n,
        openingUsd: 500n,
        maxLamports: 1n,
      });
      return send(env.rpc, env.payer, [I.withData(ix, Uint8Array.of(...ix.data!, 0))]);
    },
  },
  {
    name: "AlreadyInitialized",
    run: async (env) => {
      const id = nextId++;
      await open(env, { id });
      await refreshPrices(env.rpc);
      return open(env, { id });
    },
  },
];
