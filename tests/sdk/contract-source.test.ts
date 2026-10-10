/**
 * Purpose: the SDK's hand-written copies of the program's contract, checked against the program's own
 *          source so they cannot drift: the error codes (and one IDL message per code), the constants of
 *          constants.rs and join_rules.rs, the real and drill time constants, both compiled feed lists, and
 *          the event authority's seeds used to sign only in `emit`.
 *          Needs no binary.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

import * as R from "@brot/sdk/read";

const SRC = "programs/brot-markets/src";
const source = (file: string) => readFileSync(`${SRC}/${file}`, "utf8");

/** Every `pub const NAME: T = EXPR;` of a file, with the `cfg` attribute just above it, EXPR evaluated. */
function constants(file: string): Map<string, bigint | string> {
  const out = new Map<string, bigint | string>();
  const known: Record<string, bigint> = { SECONDS_PER_HOUR: 3_600n, SECONDS_PER_DAY: 86_400n };
  const pattern = /(#\[cfg\(([^\]]*)\)\]\s*)?pub const (\w+): [^=]+= ([^;]+);/g;
  for (const [, , cfg, name, expr] of source(file).matchAll(pattern)) {
    const key = cfg?.includes('feature = "drill"') ? `${name}${cfg.includes("not(") ? "" : ":drill"}` : name;
    const product = expr.split("*").map((term) => term.trim());
    const values = product.map((term) => (/^-?[\d_]+$/.test(term) ? BigInt(term.replace(/_/g, "")) : known[term]));
    out.set(key, values.every((v) => v !== undefined) ? values.reduce((a, b) => a! * b!, 1n)! : expr.trim());
  }
  return out;
}

describe("sdk constants match the program source", () => {
  test("error codes: error.rs, the SDK map and the IDL agree, with one non-empty message per code", () => {
    const rust = [...source("error.rs").matchAll(/^\s*(\w+) = (\d+),$/gm)].map(([, name, code]) => [
      name,
      Number(code),
    ]);
    expect(Object.entries(R.BROT_ERROR_CODES) as unknown[]).toEqual(rust);
    expect(R.programErrors().map((e) => [e.name, e.code])).toEqual(rust);
    for (const [name, code] of rust as [R.BrotErrorName, number][]) {
      expect(R.errorName(code)).toBe(name);
      expect((R.errorMessage(code) ?? "").length).toBeGreaterThan(5);
      expect(new R.BrotRefusal(name).code).toBe(code);
    }
    expect(R.errorMessage(1)).toBeUndefined();
  });

  test("the code ceilings, price rules, reader distances and template version", () => {
    const c = constants("constants.rs");
    const want: Record<string, bigint | number> = {
      MAX_FEE_BPS: R.LIMITS.maxFeeBps,
      MAX_CREATOR_SHARE_BPS: R.LIMITS.maxCreatorShareBps,
      MAX_ONE_SIDED_FEE_BPS: R.LIMITS.maxOneSidedFeeBps,
      MIN_OPENING_PRIZE_BPS: R.LIMITS.minOpeningPrizeBps,
      MIN_OPENING_FEE_USD: R.LIMITS.minOpeningFeeUsd,
      MAX_OPENING_FEE_USD: R.LIMITS.maxOpeningFeeUsd,
      MIN_ENTRY_FLOOR_LAMPORTS: R.LIMITS.minEntryFloorLamports,
      MIN_ENTRY_CEILING_LAMPORTS: R.LIMITS.minEntryCeilingLamports,
      MAX_OPEN_CAMPAIGNS_CEILING: R.LIMITS.maxOpenCampaignsCeiling,
      MAX_PRICE_AGE_CEILING: R.LIMITS.maxPriceAgeCeiling,
      MAX_PRICE_CONF_BPS_CEILING: R.LIMITS.maxPriceConfBpsCeiling,
      CAMPAIGN_MAX_AGE_FLOOR: R.LIMITS.campaignMaxAgeFloor,
      CAMPAIGN_MAX_AGE_CEILING: R.LIMITS.campaignMaxAgeCeiling,
      CAMPAIGN_TEMPLATE_VERSION: R.CAMPAIGN_TEMPLATE_VERSION,
      PRICE_CAMPAIGN_MAX_CONF_BPS: R.PRICE_RULES.campaignMaxConfBps,
      MAX_PRICE_CLOCK_LEAD_SECONDS: R.PRICE_RULES.maxClockLeadSeconds,
      PRICE_TARGET_MAX_RATIO: R.PRICE_RULES.targetMaxRatio,
      MIN_SLOT_MS: R.PRICE_RULES.minSlotMs,
      PROOF_DELAY_SECONDS: R.PRICE_RULES.proofDelaySeconds,
      STALE_FEED_MIN_SECONDS: R.PRICE_RULES.staleFeedMinSeconds,
      MIN_DISTANCE_BPS_PRICE: R.MIN_DISTANCE_BPS.price,
      MIN_DISTANCE_BPS_SUPPLY: R.MIN_DISTANCE_BPS.supply,
      MIN_DISTANCE_BPS_DAMM: R.MIN_DISTANCE_BPS.damm,
      MIN_DISTANCE_BPS_STAKE_POOL: R.MIN_DISTANCE_BPS.stakePool,
      MIN_DISTANCE_BPS_STAKE: R.MIN_DISTANCE_BPS.stake,
      EPOCH_START_SLOW_SLOT_MS: R.EPOCH_START_SLOW_SLOT_MS,
      PYTH_SHARD: R.PYTH_SHARD,
      EVENT_AUTHORITY_BUMP: R.EVENT_AUTHORITY_BUMP,
      BPS_DENOMINATOR: R.BPS_DENOMINATOR,
    };
    for (const [name, value] of Object.entries(want)) expect([name, c.get(name)]).toEqual([name, BigInt(value)]);
    expect(constants("instructions/entries/join_rules.rs").get("JOIN_BUFFER_BPS")).toBe(
      BigInt(R.PRICE_RULES.joinBufferBps),
    );
  });

  test("the time constants of the real build and of the drill build", () => {
    const c = constants("constants.rs");
    for (const [schedule, suffix] of [
      [R.REAL_SCHEDULE, ""],
      [R.DRILL_SCHEDULE, ":drill"],
    ] as const) {
      expect([c.get(`MIN_DURATION_SECONDS${suffix}`), c.get(`REVIEW_WINDOW_SECONDS${suffix}`)]).toEqual([
        schedule.minDurationSeconds,
        schedule.reviewWindowSeconds,
      ]);
      expect(c.get(`ENTRY_CLOSE_MIN_SECONDS${suffix}`)).toBe(schedule.entryCloseMinSeconds);
      expect([c.get("MAX_DURATION_SECONDS"), c.get("ENTRY_CLOSE_BPS"), c.get("ENTRY_CLOSE_MAX_SECONDS")]).toEqual([
        schedule.maxDurationSeconds,
        schedule.entryCloseBps,
        schedule.entryCloseMaxSeconds,
      ]);
    }
  });

  test("addresses, seeds and the SOL/USD feed id", () => {
    const text = source("constants.rs");
    const addresses = Object.fromEntries(
      [...text.matchAll(/pub const (\w+): Address\s*=\s*address!\("(\w+)"\)/g)].map(([, n, a]) => [n, a]),
    );
    expect(addresses).toMatchObject({
      EVENT_AUTHORITY: R.EVENT_AUTHORITY,
      BPF_LOADER_UPGRADEABLE_ID: R.BPF_LOADER_UPGRADEABLE_ID,
      PYTH_RECEIVER_ID: R.PYTH_RECEIVER_ID,
      PYTH_PUSH_ORACLE_ID: R.PYTH_PUSH_ORACLE_ID,
      SPL_TOKEN_PROGRAM_ID: R.SPL_TOKEN_PROGRAM_ID,
      TOKEN_2022_PROGRAM_ID: R.TOKEN_2022_PROGRAM_ID,
      DAMM_V2_PROGRAM_ID: R.DAMM_V2_PROGRAM_ID,
      STAKE_POOL_PROGRAM_ID: R.STAKE_POOL_PROGRAM_ID,
      VOTE_PROGRAM_ID: R.VOTE_PROGRAM_ID,
      EPOCH_SCHEDULE_SYSVAR_ID: R.EPOCH_SCHEDULE_SYSVAR_ID,
    });
    const seeds = Object.fromEntries(
      [...text.matchAll(/pub const (\w+)_SEED: &\[u8\] = b"(\w+)";/g)].map(([, n, s]) => [n, s]),
    );
    expect(seeds).toEqual({
      CONFIG: R.SEEDS.config,
      FEE_VAULT: R.SEEDS.feeVault,
      CAMPAIGN: R.SEEDS.campaign,
      VAULT: R.SEEDS.vault,
      ENTRY: R.SEEDS.entry,
      JOIN: R.SEEDS.join,
      EVENT_AUTHORITY: R.SEEDS.eventAuthority,
    });
    const feedBytes = /SOL_USD_FEED_ID: \[u8; 32\] = \[([^\]]+)\]/
      .exec(text)![1]
      .match(/0x[0-9a-f]{2}/g)!
      .join("")
      .replace(/0x/g, "");
    expect(feedBytes).toBe(R.SOL_USD_FEED_HEX);
    expect(source("lib.rs")).toContain(`declare_id!("${R.PROGRAM_ID}")`);
  });

  test("the event authority's seeds sign only in emit, which the decoder's rule 2 rests on", () => {
    // Rule 2 trusts an inner instruction of this program whose one account is the event authority, because
    // only `emit` can sign for that PDA. A second signer of the seeds would break it (Sprint 05 review).
    const files = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".rs"));
    const signers = files.filter((f) =>
      /EVENT_AUTHORITY_SEED|EVENT_AUTHORITY_BUMP|b"__event_authority"/.test(source(f)),
    );
    expect(signers.sort()).toEqual(["constants.rs", "events/self_cpi.rs"]);
    expect(source("events/self_cpi.rs").match(/Seed::from\(EVENT_AUTHORITY_SEED\)/g)).toHaveLength(1);
  });

  test("both compiled feed lists, in order", () => {
    const text = source("feeds.rs");
    const list = (name: string) =>
      [
        ...new RegExp(`const ${name}: &\\[&str\\] = &\\[([\\s\\S]*?)\\];`).exec(text)![1].matchAll(/"([0-9a-f]{64})"/g),
      ].map(([, hex]) => hex);
    expect(R.MAINNET_FEEDS.map(([hex]) => hex)).toEqual(list("MAINNET"));
    expect(R.DEVNET_FEEDS.map(([hex]) => hex)).toEqual(list("DEVNET"));
    expect([R.MAINNET_FEEDS.length, R.DEVNET_FEEDS.length]).toEqual([63, 17]);
  });
});
