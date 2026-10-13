/**
 * Purpose: /healthz and the 80% alert from a real cycle on LiteSVM (Sprint 06 DoD: "/healthz returns the last full
 *          cycle, the SOL balance, the pending items and the open campaigns against max_open_campaigns"; Sprint 16
 *          DoD: the 80% alert fires in a test). With `max_open_campaigns` at 1 and one paid campaign open, the
 *          keeper's cycle reads the program's count, the chain watch raises `open_campaigns_high`, and the state
 *          /healthz serves is plain JSON (no bigint) with the usage, the pending work, the vaults' SOL and the
 *          balance. With settlement off nothing is simulated for it, and nothing is sent.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: /healthz; Sprint 16 DoD: the 80% alert)
 */
import { describe, expect, test } from "bun:test";

import { openedCampaign } from "../../../tests/brot/flows";
import type { AlertKind, Alerter } from "../src/alert";
import { createChainWatch } from "../src/chain-watch";
import { runCycle } from "../src/cycle";
import type { KeeperState } from "../src/health";
import { DEFAULT_THRESHOLDS } from "../src/watch-rules";
import { keeperContext, keeperWorld } from "./kit/settle-world";

describe("/healthz from a real cycle", () => {
  test("one paid campaign of a ceiling of one: the 80% alert fires; /healthz carries usage, pending work and SOL", async () => {
    const kw = await keeperWorld({ max_open_campaigns: 1 });
    await openedCampaign(kw, kw.creator);
    const fired: AlertKind[] = [];
    const alerter: Alerter = { alert: (kind) => (fired.push(kind), true) };
    const ctx = keeperContext(kw);
    const context = {
      ...ctx,
      settle: { ...ctx.settle, enabled: false },
      watch: createChainWatch(alerter, DEFAULT_THRESHOLDS),
    };
    const report = await runCycle(context, false);
    expect(fired).toContain("open_campaigns_high");
    expect(report.maxOpenCampaigns).toEqual({ openCampaigns: 1, maxOpenCampaigns: 1, usageBps: 10_000 });
    expect(report.settle).toMatchObject({ enabled: false, landed: 0, wouldSend: 0 });
    expect(kw.chain.calls.filter((m) => m === "sendTransaction" || m === "simulateTransaction")).toEqual([]);

    const state: KeeperState = {
      cluster: "local",
      startedAt: "t0",
      cycles: 1,
      last: report,
      lastError: null,
      mode: "primary",
      settle: "off",
    };
    const served = (await Response.json(state).json()) as { last: Record<string, string> };
    expect(served.last).toMatchObject({
      openCampaigns: 1,
      maxOpenCampaigns: { usageBps: 10_000 },
      settle: { pending: { tally: 0, finalize: 0, entries: 0 } },
      readBatches: 1,
    });
    expect(BigInt(served.last.exposureLamports) > 0n).toBe(true); // the opening's prize and fee sit in its vault
    expect(BigInt(served.last.keeperLamports)).toBe(10_000_000_000n);
  });
});
