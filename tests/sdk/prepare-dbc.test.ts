/**
 * Purpose: the SDK on the sixth kind (`DbcGraduated`), against the program's state (LiteSVM behind a local RPC
 *          endpoint) and the Meteora DBC pool and config captured from mainnet: A-3 reads the pool, then the config
 *          it names, checks, builds with that config after the nine slots, summarises the signed bytes (trusted,
 *          the curve and its config named) and simulates; a wrong target stops at the check; a join is prepared
 *          while the curve is open and refused once it completes; `recheck` re-reads the stamp; the summary refuses
 *          any other shape of the extra account, and the builder refuses to build one.
 * Version: 0.1.0
 * Sprint:  the sixth kind, after 05
 */
import { afterEach, describe, expect, test } from "bun:test";
import { AccountRole, createSolanaRpc, signTransactionMessageWithSigners, type Address } from "@solana/kit";

import { ReaderKind, recheck, Side } from "@brot/sdk/read";
import { buildOpenCampaign, prepareJoin, prepareOpenCampaign, summarizeInstructions } from "@brot/sdk/tx";

import { readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setFixture } from "../brot/readers";
import { expectOk, now, send } from "../brot/setup";
import { startFakeRpc, type FakeRpc } from "./fake-rpc";
import { ready } from "./prepared";

let rpc: FakeRpc | null = null;
afterEach(() => rpc?.close());

const T85 = 85n * P.SOL;
const AT = { quoteReserve: 240, migrationProgress: 308, finishCurveTimestamp: 344 } as const;

/** The captured stage-0 pool and its config in the world; with `completedAt`, the curve completed then. */
function curve(w: OpeningWorld, completedAt?: bigint): { pool: Address; config: Address } {
  const mutate = (_: Uint8Array, view: DataView) => {
    if (completedAt === undefined) return;
    view.setUint8(AT.migrationProgress, 2);
    view.setBigUint64(AT.finishCurveTimestamp, completedAt, true);
    view.setBigUint64(AT.quoteReserve, T85, true);
  };
  const pool = setFixture(w.client, "dbc-pool-stage0", { mutate }).address;
  return { pool, config: setFixture(w.client, "dbc-config-85sol").address };
}

/** A team key's free graduation opening, prepared through the RPC. */
function prepareGraduation(w: OpeningWorld, pool: Address, target = T85) {
  const deadlineAt = now(w.client) + 7n * P.DAY;
  const choice = { kind: ReaderKind.DbcGraduated, target, deadlineAt, metricAccount: pool, openingUsd: 0n };
  return prepareOpenCampaign({ rpc: createSolanaRpc(rpc!.url), creator: w.team, choice });
}

describe("the sdk on the graduation kind", () => {
  test("A-3: the pool, its config after the nine slots, a trusted summary naming both, the simulation", async () => {
    const w = await openingWorld();
    const { pool, config } = curve(w);
    rpc = startFakeRpc(w);
    const prepared = ready(await prepareGraduation(w, pool));
    expect(prepared.check).toMatchObject({ ok: true, isTeam: true, priceExponent: 0 });
    expect(prepared.summary.trusted).toBe(true);
    const line = prepared.summary.lines[1];
    expect(line).toContain(`DbcGraduated of Meteora curve ${pool}: YES if it completes by the deadline`);
    expect(line).toContain(`threshold 85.000000000 SOL) with its curve config ${config}`);
    expect(prepared.simulation.events.map((e) => e.name)).toEqual(["CampaignOpened"]);
    w.client.svm.sendTransaction(await signTransactionMessageWithSigners(prepared.message));
    const stored = readCampaign(w, await P.campaignPda(prepared.id));
    expect(stored).toMatchObject({ kind: ReaderKind.DbcGraduated, metric_account: pool, target: T85 });
  });

  test("a target other than the threshold stops at the check, with its row", async () => {
    const w = await openingWorld();
    rpc = startFakeRpc(w);
    const refused = await prepareGraduation(w, curve(w).pool, T85 + 1n);
    const verdict = refused.ok || refused.stage !== "check" ? null : refused.check;
    expect([verdict?.refusal.errorName, verdict?.row]).toEqual(["TargetNotThreshold", 3]);
  });

  test("a join is prepared while the curve is open and refused at the check once it completes", async () => {
    const w = await openingWorld();
    const { pool } = curve(w);
    rpc = startFakeRpc(w);
    const opened = ready(await prepareGraduation(w, pool));
    w.client.svm.sendTransaction(await signTransactionMessageWithSigners(opened.message));
    const campaign = await P.campaignPda(opened.id);
    const join = () =>
      prepareJoin({ rpc: createSolanaRpc(rpc!.url), baker: w.creator, campaign, side: Side.Yes, amount: P.SOL });
    expect(ready(await join()).simulation.ok).toBe(true);
    curve(w, now(w.client));
    const locked = await join();
    expect(locked.ok || locked.stage !== "check" ? null : locked.check.refusal.errorName).toBe("OutcomeKnowable");
  });

  test("recheck re-reads the pool's stamp: consistent with YES, its quote reserve free to move at migration", async () => {
    const w = await openingWorld();
    const { pool } = curve(w);
    rpc = startFakeRpc(w);
    const opened = ready(await prepareGraduation(w, pool));
    w.client.svm.sendTransaction(await signTransactionMessageWithSigners(opened.message));
    const campaign = await P.campaignPda(opened.id);
    const stamp = now(w.client);
    curve(w, stamp);
    expectOk(await send(w, [I.resolveCampaignIx(campaign, pool)]));
    const first = await recheck(campaign, rpc.url);
    expect(first).toMatchObject({
      field: "quote_reserve",
      recorded: T85,
      reread: T85,
      matches: true,
      consistent: true,
    });
    expect(first.note).toContain(`the curve completed at ${stamp} (stage 2)`);
    // Migration moves the quote out of the pool; the stamp, and so the outcome, stays.
    setFixture(w.client, "dbc-pool-stage0", {
      mutate: (_, view) => {
        view.setUint8(AT.migrationProgress, 3);
        view.setBigUint64(AT.finishCurveTimestamp, stamp, true);
        view.setBigUint64(AT.quoteReserve, 0n, true);
      },
    });
    expect(await recheck(campaign, rpc.url)).toMatchObject({ reread: 0n, matches: false, consistent: true });
  });

  test("the summary takes one read-only config after the nine slots, and the builder builds only that", async () => {
    const w = await openingWorld();
    const { pool, config } = curve(w);
    const args = { id: 7n, kind: ReaderKind.DbcGraduated, target: T85, deadlineAt: 1_900_000_000n };
    const open = { ...args, openingUsd: 0n, maxLamports: 0n, expectedParamsVersion: 0 };
    const ix = await buildOpenCampaign({ creator: w.team, args: open, metricAccount: pool, curveConfig: config });
    expect(ix.accounts?.slice(9)).toEqual([{ address: config, role: AccountRole.READONLY }]);
    expect(summarizeInstructions([ix]).trusted).toBe(true);
    const shapes = [
      { ...ix, accounts: [...ix.accounts!.slice(0, 9), { address: config, role: AccountRole.WRITABLE }] },
      { ...ix, accounts: [...ix.accounts!, { address: pool, role: AccountRole.READONLY }] },
      { ...ix, accounts: ix.accounts!.slice(0, 9) },
    ];
    // Writable, followed by a second account, or missing (the program refuses that one too): do not sign.
    for (const shape of shapes) {
      expect(summarizeInstructions([shape]).items[0].text).toContain("takes one read-only config");
    }
    const price = { ...open, kind: ReaderKind.PriceTouch, feedId: P.BTC_USD_FEED_ID };
    await expect(buildOpenCampaign({ creator: w.team, args: price, curveConfig: config })).rejects.toThrow(RangeError);
    await expect(buildOpenCampaign({ creator: w.team, args: open, metricAccount: pool })).rejects.toThrow(RangeError);
  });
});
