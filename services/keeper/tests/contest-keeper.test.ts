/**
 * Purpose: the keeper and a contest on the program, on LiteSVM (Sprint 14, D2), with RPC B configured: a matching
 *          re-read before stage 1's deadline is refused by design (`RereadBeforeTimelock`), logged as a wait and not
 *          simulated again until that deadline, then sent and paid after it; a different reading is sent at once
 *          (the contest goes to stage 2) and alerts the team; a lapsed stage 2 is finalized and settled to the close;
 *          the dry run simulates and sends nothing; with KEEPER_SETTLE off nothing is sent; without RPC B there is no
 *          re-read at all. The campaigns are the contest kit's (tests/brot/contest-support.ts).
 * Version: 0.1.0
 * Sprint:  14 (lane L14K: the keeper learns the contest's exits)
 */
import { describe, expect, test } from "bun:test";
import { ContestStage, Status } from "@brot/sdk/read";

import * as C from "../../../tests/brot/contest-support";
import { at } from "../../../tests/brot/resolve-support";
import { balance, fundedWallet } from "../../../tests/brot/setup";
import type { AlertKind } from "../src/alert";
import { Backoff, DailyClock } from "../src/backoff";
import { runCycle, type CycleContext } from "../src/cycle";
import { chainRpc } from "./kit/litesvm-rpc";
import { readCampaignOf } from "./kit/settle-world";

async function world(opts: { settle?: boolean; rpcB?: boolean } = {}) {
  const cw = await C.contestWorld();
  const keeper = await fundedWallet(cw.w, 10n);
  const chain = chainRpc(cw.w);
  const alerts: AlertKind[] = [];
  const events: string[] = [];
  const log = (event: string, fields: Record<string, unknown>) => events.push(`${event} ${fields.step ?? ""}`.trim());
  const ctx: CycleContext = {
    landing: {
      rpc: chain.rpc,
      payer: keeper,
      fees: { floor: 0n, ceiling: 1_000_000n, maxLamports: 1_000_000n },
      batchMax: 10,
      timing: { rebroadcastMs: 0, maxWaitMs: 5_000 },
    },
    settle: {
      enabled: opts.settle ?? true,
      backoff: new Backoff(0, 0),
      claims: new DailyClock(),
      sweepMinLamports: 0n,
      log,
    },
    watch: null,
    pyth: null,
    contest:
      opts.rpcB === false
        ? null
        : { rpcB: chain.rpc, alerter: { alert: (kind) => (alerts.push(kind), true) }, waits: new Map(), log },
  };
  return { cw, chain, ctx, alerts, events, sends: () => chain.calls.filter((m) => m === "sendTransaction").length };
}

const STAGE1_ENDS = C.NOW + C.HOUR;

describe("the keeper and a contest", () => {
  test("a matching re-read waits for stage 1's deadline (logged as a wait), then is sent and pays", async () => {
    const k = await world();
    const c = await C.contested(k.cw, ContestStage.Stage1, STAGE1_ENDS);
    await C.entries(k.cw, c);
    const first = await runCycle(k.ctx, false);
    expect(first.contest).toEqual({ simulated: 1, waiting: 1, differs: 0, sent: 0, refused: 0 });
    expect(k.events).toContain("reread-waiting");
    expect(k.sends()).toBe(0);
    // Before the deadline it is not simulated again.
    expect((await runCycle(k.ctx, false)).contest).toMatchObject({ simulated: 0, waiting: 1 });
    at(k.cw.w, STAGE1_ENDS);
    expect((await runCycle(k.ctx, false)).contest).toMatchObject({ simulated: 1, sent: 1, differs: 0 });
    expect(readCampaignOf(k.cw.w, c.campaign).status).toBe(Status.Settling);
    // The next cycle settles it like any other, to the close.
    expect((await runCycle(k.ctx, false)).settle).toMatchObject({ refused: 0, failed: 0 });
    expect(balance(k.cw.w, c.campaign)).toBe(0n);
    expect(k.alerts).toEqual([]);
  });

  test("a different reading is sent at once, the contest goes to stage 2, and the team is alerted", async () => {
    const k = await world();
    const c = await C.contested(k.cw, ContestStage.Stage1, STAGE1_ENDS);
    await C.entries(k.cw, c);
    C.setSupply(k.cw.w, c.metric, C.TARGET - 1n); // the fact met after the deadline: NO with met_late, not the stored NO
    expect((await runCycle(k.ctx, false)).contest).toMatchObject({ simulated: 1, differs: 1, sent: 1 });
    const after = readCampaignOf(k.cw.w, c.campaign);
    expect({ status: after.status, stage: after.contestStage }).toEqual({ status: Status.Contested, stage: 2 });
    expect(k.alerts).toEqual(["contest_reread_differs"]);
  });

  test("a stage 2 past its deadline lapses: finalized with the stored result, then settled to the close", async () => {
    const k = await world();
    const c = await C.contested(k.cw, ContestStage.Stage2, C.NOW - 10n);
    await C.entries(k.cw, c);
    const report = await runCycle(k.ctx, false);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    expect(report.contest).toMatchObject({ simulated: 0 }); // stage 2 is the admin's: never re-read
    expect(k.events[0]).toBe(`settle-landed finalize:${c.campaign}`);
    expect(k.events).toContain(`settle-landed close:${c.campaign}`);
    expect(balance(k.cw.w, c.campaign)).toBe(0n);
  });

  test("the dry run simulates every send and sends nothing; KEEPER_SETTLE off sends nothing either", async () => {
    const dry = await world();
    const differs = await C.contested(dry.cw, ContestStage.Stage1, STAGE1_ENDS);
    await C.entries(dry.cw, differs);
    C.setSupply(dry.cw.w, differs.metric, C.TARGET - 1n);
    const lapsed = await C.contested(dry.cw, ContestStage.Stage2, C.NOW - 10n);
    await C.entries(dry.cw, lapsed);
    const report = await runCycle(dry.ctx, true);
    expect(dry.sends()).toBe(0);
    expect(dry.events).toEqual(
      expect.arrayContaining(["reread-wouldSend", `settle-wouldSend finalize:${lapsed.campaign}`]),
    );
    expect(report.contest).toMatchObject({ simulated: 1, differs: 1, sent: 0 });

    const off = await world({ settle: false });
    const c = await C.contested(off.cw, ContestStage.Stage1, STAGE1_ENDS);
    C.setSupply(off.cw.w, c.metric, C.TARGET - 1n);
    await C.contested(off.cw, ContestStage.Stage2, C.NOW - 10n);
    const offReport = await runCycle(off.ctx, false);
    expect(off.sends()).toBe(0);
    expect(off.events).toContain("reread-not-sent");
    expect(off.alerts).toEqual(["contest_reread_differs"]); // the simulation still warns the team
    expect(offReport.settle.pending).toMatchObject({ finalize: 1, contested: 2 });
  });

  test("without RPC B the keeper never re-reads a contest", async () => {
    const k = await world({ rpcB: false });
    await C.contested(k.cw, ContestStage.Stage1, STAGE1_ENDS);
    const report = await runCycle(k.ctx, false);
    expect(report.contest).toBeNull();
    expect(k.chain.calls.filter((m) => m === "simulateTransaction")).toHaveLength(0);
  });
});
