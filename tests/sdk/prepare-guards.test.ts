/**
 * Purpose: the guards of the A-3 preparation (Sprint 05 review): a retried join that already landed is
 *          refused instead of doubled (A-9, M2); the slippage is bounded (L3); a transaction the cluster
 *          refuses in simulation is not ready (L8); an opening returns the program's first refusal in its
 *          order even when the price is stale (L2); a drill schedule reaches the checks, and the program's
 *          build still decides (L4).
 *          Filter: `bun test tests/ -t "the preparation's guards"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, signTransactionMessageWithSigners } from "@solana/kit";

import { DRILL_SCHEDULE, ReaderKind, Side } from "@brot/sdk/read";
import { prepareJoin, prepareOpenCampaign, type OpeningChoice } from "@brot/sdk/tx";

import { BTC_PRICE, openedCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld, STALE, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, fundedWallet, now, send, setPriceAccount } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { ready } from "./prepared";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

const btcAbove = (w: OpeningWorld, days: bigint): OpeningChoice => ({
  kind: ReaderKind.PriceTouch,
  feedId: P.BTC_USD_FEED_ID,
  target: (BTC_PRICE * 11n) / 10n,
  deadlineAt: now(w.client) + days * P.DAY,
  openingUsd: 500n,
});

describe("the preparation's guards", () => {
  test("a retry that passes the saved entry total is refused once the first join landed (A-9)", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const join = { rpc: createSolanaRpc(rpc.url), baker: w.creator, campaign, side: Side.Yes, amount: P.SOL };
    const first = ready(await prepareJoin(join));
    const saved = first.expectedEntryTotal;
    w.client.svm.sendTransaction(await signTransactionMessageWithSigners(first.message));
    const retry = await prepareJoin({ ...join, expectedEntryTotal: saved });
    expect(retry.ok || retry.stage !== "check" ? null : retry.check.refusal.errorName).toBe("EntryTotalMismatch");
    // Without the saved total, a new preparation reads the landed one and would add a second entry.
    expect(ready(await prepareJoin(join)).expectedEntryTotal).toBe(P.SOL);
  });

  test("the slippage is an integer from 0 to 2,000 basis points", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const join = { rpc: createSolanaRpc(rpc.url), baker: w.creator, campaign, side: Side.Yes, amount: P.SOL };
    for (const slippageBps of [-1, 0.5, 2_001, 10_000]) {
      await expect(prepareJoin({ ...join, slippageBps })).rejects.toThrow(RangeError);
    }
    expect(ready(await prepareJoin({ ...join, slippageBps: 2_000 })).minReturnBps).toBeGreaterThan(0);
  });

  test("a join the cluster refuses in simulation is not ready, though the SDK's checks passed", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    rpc = startFakeRpc(w);
    const poor = await fundedWallet(w, 1n);
    const prepared = await prepareJoin({
      rpc: createSolanaRpc(rpc.url),
      baker: poor,
      campaign,
      side: Side.Yes,
      amount: 2n * P.SOL,
    });
    expect(prepared.ok).toBe(false);
    if (prepared.ok || prepared.stage !== "simulation") throw new Error(`expected the simulation stage`);
    expect([prepared.simulation.ok, prepared.summary.trusted]).toEqual([false, true]);
  });

  test("an opening returns the program's first refusal in its order, even when SOL/USD is stale", async () => {
    const w = await openingWorld();
    rpc = startFakeRpc(w);
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: STALE });
    const open = () =>
      prepareOpenCampaign({ rpc: createSolanaRpc(rpc!.url), creator: w.creator, choice: btcAbove(w, 7n) });
    const stale = await open();
    expect(stale.ok || stale.stage !== "check" ? null : stale.check.refusal.errorName).toBe("SolUsdStale");
    expectOk(await send(w, [await I.pauseEntriesIx(w.team)]));
    // The pause (row 8) comes before the payment (row 7) in the program: the stale price no longer speaks first.
    const paused = await open();
    expect(paused.ok || paused.stage !== "check" ? null : paused.check.refusal.errorName).toBe("OpenWhilePaused");
  });

  test("a drill schedule reaches the checks; the program's own build still decides", async () => {
    const w = await openingWorld();
    rpc = startFakeRpc(w);
    const hour = { ...btcAbove(w, 0n), deadlineAt: now(w.client) + 3_600n };
    const real = await prepareOpenCampaign({ rpc: createSolanaRpc(rpc.url), creator: w.creator, choice: hour });
    expect(real.ok || real.stage !== "check" ? null : real.check.refusal.errorName).toBe("DurationTooShort");
    const drill = await prepareOpenCampaign({
      rpc: createSolanaRpc(rpc.url),
      creator: w.creator,
      choice: hour,
      build: { schedule: DRILL_SCHEDULE },
    });
    // The SDK accepts a one-hour campaign under the drill schedule; the program in this world is a real build.
    expect(drill.ok || drill.stage !== "simulation" ? null : drill.simulation.errorName).toBe("DurationTooShort");
  });
});
