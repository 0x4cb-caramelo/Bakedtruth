/**
 * Purpose: the entry panel's estimate is the SDK's (BR-09; P1 §3.2): the number `checkJoin` gives for the pot with the
 *          baker's own amount added, which is the number `prepareJoin` signs `min_return_bps` against. P1 §3.2's table
 *          is reproduced on a real campaign read from the program: 300 on YES and 700 on NO with no prize pay YES
 *          3.10 per 1, and 3.067 with the creator's 1% (the panel writes the SDK's 3.0666 exactly, never rounded up).
 *          Filter: `bun test tests/ -t "entry panel estimate matches sdk"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { estimateReturnBps, OperatingLevel } from "@brot/sdk/read";

import { chance, estimateEntry, lowersItsSide, perOne, type JoinInputs } from "../../app/features/entry/estimate";
import { prepareEntry } from "../../app/features/entry/submit";
import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { inputsOf } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

const SOL = P.SOL;

/** The world's campaign with its pot replaced: `yes` and `no` before the baker's entry, no prize. */
const withPot = (inputs: JoinInputs, yes: bigint, no: bigint, creatorShareBps: number): JoinInputs => ({
  ...inputs,
  campaign: { ...inputs.campaign, poolYes: yes, poolNo: no, prizeLamports: 0n, feeBps: 1_000, creatorShareBps },
});

const bps = (e: ReturnType<typeof estimateEntry>) => (e.ok ? e.bps : e.refusal);

describe("entry panel estimate matches sdk", () => {
  test("P1 §3.2: 300 on YES and 700 on NO, no prize: YES 3.10 per 1, and 3.067 with the creator's 1%", async () => {
    const w = await openingWorld();
    const inputs = await inputsOf(w, (await openedCampaign(w, w.creator)).campaign);
    // The baker's 100 makes YES 300: the estimate counts the entry it is about to add.
    expect(bps(estimateEntry(withPot(inputs, 200n * SOL, 700n * SOL, 0), "yes", 100n * SOL))).toBe(31_000n);
    expect(perOne(31_000n)).toBe("3.10");
    const share = estimateEntry(withPot(inputs, 200n * SOL, 700n * SOL, 100), "yes", 100n * SOL);
    expect(bps(share)).toBe(30_666n); // 920 ÷ 300 = 3.0666…, floored to the basis point the program checks
    expect(perOne(30_666n)).toBe("3.0666");
    expect((30_666 / 10_000).toFixed(3)).toBe("3.067"); // P1 §3.2's figure, to its three decimals
    expect(share.ok && share.returns).toBe(306_660_000_000n); // about 306.66 SOL for 100, never rounded up
    // NO: 970 ÷ 700 = 1.3857 (P1's 1.39), and 960 ÷ 700 = 1.3714 with the share (P1's 1.371).
    expect(bps(estimateEntry(withPot(inputs, 300n * SOL, 600n * SOL, 0), "no", 100n * SOL))).toBe(13_857n);
    expect(bps(estimateEntry(withPot(inputs, 300n * SOL, 600n * SOL, 100), "no", 100n * SOL))).toBe(13_714n);
  });

  test("the panel's number equals the SDK's estimate for any pot, the baker's amount added on its side", async () => {
    const w = await openingWorld();
    const inputs = await inputsOf(w, (await openedCampaign(w, w.creator)).campaign);
    const c = inputs.campaign;
    for (const [yes, no] of [
      [0n, 0n],
      [SOL, 0n],
      [0n, 3n * SOL],
      [7n * SOL, 2n * SOL],
      [123_456_789n, 987_654_321n],
    ]) {
      for (const amount of [10_000_000n, SOL, 42n * SOL + 1n]) {
        for (const side of ["yes", "no"] as const) {
          const pot = { ...inputs, campaign: { ...c, poolYes: yes, poolNo: no } };
          const [mine, other] = side === "yes" ? [yes, no] : [no, yes];
          const sdk = estimateReturnBps({
            amount,
            sideAfter: mine + amount,
            other,
            prize: c.prizeLamports,
            feeBps: c.feeBps,
            oneSidedFeeBps: c.oneSidedFeeBps,
            creatorShareBps: c.creatorShareBps,
            isFirst: yes + no === 0n,
          });
          expect(bps(estimateEntry(pot, side, amount))).toBe(sdk);
        }
      }
    }
  });

  test("the number on the panel is the number prepareJoin signs min_return_bps against", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const baker = await fundedWallet(w);
    const shown = estimateEntry(await inputsOf(w, campaign), "no", 2n * SOL);
    const prepared = ready(
      await prepareEntry({
        rpc: createSolanaRpc(chain.url),
        campaign,
        baker: baker.address,
        side: "no",
        amount: 2n * SOL,
      }),
    );
    expect(shown.ok && shown.bps).toBe(prepared.check.estimateBps);
    expect(BigInt(prepared.minReturnBps)).toBe((prepared.check.estimateBps * 9_900n) / 10_000n);
  });

  test("a large entry lowers its own side's return (P1 §3.2: 1.90 per 1, then 1.30 with 10,000 more on YES)", async () => {
    const w = await openingWorld();
    const inputs = withPot(
      await inputsOf(w, (await openedCampaign(w, w.creator)).campaign),
      5_000n * SOL,
      5_000n * SOL,
      0,
    );
    const small = estimateEntry(inputs, "yes", 10_000_000n);
    const large = estimateEntry(inputs, "yes", 10_000n * SOL);
    expect(bps(large)).toBe(13_000n);
    expect(small.ok && large.ok && lowersItsSide(large.bps, small.bps)).toBe(true);
    expect(small.ok && perOne(small.bps)).toBe("1.8999"); // 19,500.01 ÷ 5,000.01 less a hair: the minimum entry counts too
  });

  test("an empty other side is a refund estimate; a refused entry gives the program's refusal, not a number", async () => {
    const w = await openingWorld();
    const inputs = await inputsOf(w, (await openedCampaign(w, w.creator)).campaign);
    const alone = estimateEntry(withPot(inputs, 0n, 0n, 100), "yes", SOL);
    expect(alone).toMatchObject({ ok: true, mode: "onesided", isFirst: true, bps: 10_000n });
    const second = estimateEntry(withPot(inputs, SOL, 0n, 100), "yes", SOL);
    expect(second).toMatchObject({ ok: true, mode: "onesided", isFirst: false, bps: 9_900n });
    expect(estimateEntry(inputs, "yes", 9_999_999n)).toEqual({ ok: false, refusal: "BelowCampaignMinEntry" });
    const paused = { ...inputs, config: { ...inputs.config, operatingLevel: OperatingLevel.EntriesHalted } };
    expect(estimateEntry(paused, "yes", SOL)).toEqual({ ok: false, refusal: "JoinWhilePaused" });
    expect(chance(0n, 0n)).toBeNull();
    expect(chance(300n, 700n)).toEqual({ yes: 30, no: 70 });
    expect(chance(1n, 999n)).toEqual({ yes: 1, no: 99 });
  });
});
