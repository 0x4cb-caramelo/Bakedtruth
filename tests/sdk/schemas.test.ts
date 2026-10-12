/**
 * Purpose: the opening's zod schema (TP Appendix B): one valid input per kind parses and converts to the
 *          SDK's `OpenArgs` the builders take; text, extra keys, numbers where strings go, malformed
 *          hex or addresses and values outside their Rust types are refused before anything is built.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";

import { ReaderKind } from "@brot/sdk/read";
import { OpenCampaignInput, toOpenArgs } from "@brot/sdk/schemas";

import * as P from "../brot/program";
import { bytesToHex } from "@brot/sdk/read";

const pool = "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy";
const base = { id: "18446744073709551615", openingUsd: "500", maxLamports: "5000000000" };

describe("the opening's input schema", () => {
  test("one valid input per kind, and its conversion", () => {
    const inputs = [
      {
        kind: "PriceTouch",
        feedId: bytesToHex(P.BTC_USD_FEED_ID),
        direction: "below",
        target: "-5",
        deadlineAt: "1800000000",
      },
      { kind: "SupplyAtMost", mint: pool, target: "1", deadlineAt: "1800000000" },
      {
        kind: "DammV2LockedAtLeast",
        pool,
        target: "170141183460469231731687303715884105727",
        deadlineAt: "1800000000",
      },
      { kind: "StakePoolTvlAtLeast", pool, target: "1", epoch: "900", deadlineAt: "1800000000" },
      { kind: "StakeAtLeast", voteAccount: pool, target: "1", epoch: "900", deadlineAt: "1800000000" },
    ];
    const converted = inputs.map((params) => toOpenArgs(OpenCampaignInput.parse({ ...base, params }), 4));
    expect(converted.map(({ args }) => args.kind)).toEqual([0, 1, 2, 3, 4].map((k) => k as ReaderKind));
    const [price, , damm, stakePool] = converted;
    expect(price.args).toMatchObject({ id: 2n ** 64n - 1n, direction: 1, target: -5n, expectedParamsVersion: 4 });
    expect(bytesToHex(price.args.feedId)).toBe(bytesToHex(P.BTC_USD_FEED_ID));
    expect(price.metricAccount).toBeNull();
    expect(damm.args.target).toBe(2n ** 127n - 1n);
    expect([stakePool.args.epoch, stakePool.metricAccount as string | null]).toEqual([900n, pool]);
    const free = OpenCampaignInput.parse({ id: "1", params: inputs[1] });
    expect(toOpenArgs(free, 0).args).toMatchObject({ openingUsd: 0n, maxLamports: 0n });
  });

  test("a graduation input names its pool and takes the curve's threshold as its target", () => {
    const params = { kind: "DbcGraduated", pool, deadlineAt: "1800000000" };
    const input = OpenCampaignInput.parse({ id: "9", params });
    const { args, metricAccount } = toOpenArgs(input, 2, 85_000_000_000n);
    expect(args).toMatchObject({ kind: ReaderKind.DbcGraduated, target: 85_000_000_000n, direction: 0, epoch: 0n });
    expect(metricAccount as string | null).toBe(pool);
    expect(() => toOpenArgs(input, 2)).toThrow("DbcGraduated takes the curve's threshold as its target");
    // The target is the curve's, never typed: an input that carries one is refused.
    expect(OpenCampaignInput.safeParse({ id: "9", params: { ...params, target: "1" } }).success).toBe(false);
  });

  test("refused before anything is built", () => {
    const price = {
      kind: "PriceTouch",
      feedId: bytesToHex(P.BTC_USD_FEED_ID),
      direction: "above",
      target: "1",
      deadlineAt: "1",
    };
    const refused = [
      { ...base, params: { ...price, note: "a free text" } },
      { ...base, note: "a free text", params: price },
      { ...base, id: 7, params: price },
      { ...base, id: "-1", params: price },
      { ...base, id: "18446744073709551616", params: price },
      { ...base, params: { ...price, feedId: "0x" + bytesToHex(P.BTC_USD_FEED_ID) } },
      { ...base, params: { ...price, direction: "sideways" } },
      { ...base, params: { ...price, target: "170141183460469231731687303715884105728" } },
      { ...base, params: { kind: "SupplyAtMost", mint: "not-an-address", target: "1", deadlineAt: "1" } },
      { ...base, params: { kind: "StakePoolTvlAtLeast", pool, target: "1", deadlineAt: "1" } },
      { ...base, params: { kind: "Opinion", target: "1", deadlineAt: "1" } },
    ];
    for (const input of refused) expect([input, OpenCampaignInput.safeParse(input).success]).toEqual([input, false]);
  });
});
