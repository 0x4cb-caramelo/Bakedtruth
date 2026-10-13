/**
 * Purpose: "two keepers change nothing twice" (Sprint 07 DoD): the primary and the standby settle the same finalized
 *          campaign at once, on LiteSVM. Both simulate before either sends (a barrier holds the first send until the
 *          second arrives); one lands, the other's transaction lands as the program's refusal (`AlreadySettled`) and
 *          moves nothing; then a keeper working from a stale view is refused in simulation and sends nothing at all.
 *          Every lamport is checked once against the SDK's math; each keeper wallet only paid network fees.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 07 DoD: the two-keepers test)
 */
import { describe, expect, test } from "bun:test";
import type { KeyPairSigner } from "@solana/kit";
import { Side, Status, decodeEntry, entryAddress } from "@brot/sdk/read";
import { buildFinalizeCampaign, buildTallyLateJoins } from "@brot/sdk/tx";

import { openedCampaign } from "../../../tests/brot/flows";
import { balance, expectOk, fundedWallet, send } from "../../../tests/brot/setup";
import { readChainView } from "../src/chain";
import { runCycle } from "../src/cycle";
import { settleTask } from "../src/settle";
import { chainRpc } from "./kit/litesvm-rpc";
import { expectPaidAsOwed } from "./kit/settle-checks";
import { bake, capturer, keeperContext, keeperWorld, readCampaignOf, setClockTo, touchBtc } from "./kit/settle-world";

const SOL = 1_000_000_000n;

/** A Split campaign resolved by the keeper, then tallied and finalized by a third party (any wallet may). */
async function finalizedSplit() {
  const kw = await keeperWorld();
  const { campaign } = await openedCampaign(kw, kw.creator);
  const bakers = await bake(kw, campaign, [
    [Side.Yes, 2n * SOL],
    [Side.Yes, SOL],
    [Side.No, 3n * SOL],
  ]);
  touchBtc(kw);
  expect((await runCycle(keeperContext(kw), false)).counts.resolved).toBe(1);
  setClockTo(kw, readCampaignOf(kw, campaign).reviewEndsAt + 1n);
  for (const baker of bakers) {
    const held = kw.client.svm.getAccount(await entryAddress(campaign, baker.address));
    if (!held.exists) throw new Error("no entry");
    const { joinCount } = decodeEntry({ owner: held.programAddress, data: held.data });
    expectOk(await send(kw, [await buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to: joinCount })]));
  }
  expectOk(await send(kw, [await buildFinalizeCampaign({ campaign })]));
  expect(readCampaignOf(kw, campaign).status).toBe(Status.Settling);
  return { kw, campaign, bakers };
}

/** Holds each caller until `n` have arrived (or a second passes, so a broken test fails instead of hanging). */
function barrier(n: number) {
  let arrived = 0;
  let release = () => {};
  const open = new Promise<void>((done) => (release = done));
  setTimeout(() => release(), 1_000);
  return async () => {
    arrived++;
    if (arrived >= n) release();
    await open;
  };
}

describe("two keepers change nothing twice", () => {
  test("primary and standby send the same settlement at once: one lands, the other is the program's refusal", async () => {
    const { kw, campaign, bakers } = await finalizedSplit();
    const standby: KeyPairSigner = await fundedWallet(kw, 10n);
    const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address, standby.address];
    const captured = (
      await capturer(
        kw,
        campaign,
        bakers.map((b) => b.address),
        parties,
      )
    )();

    const chainA = kw.chain;
    const chainB = chainRpc(kw);
    const wait = barrier(2);
    let held = 0;
    const firstOnly = async () => (held++ < 2 ? wait() : undefined);
    chainA.beforeSend = firstOnly;
    chainB.beforeSend = firstOnly;
    const events: string[] = [];
    const log = (who: string) => (event: string, fields: Record<string, unknown>) =>
      events.push(`${who} ${event} ${fields.step} ${fields.detail ?? ""}`);
    const [a, b] = await Promise.all([
      runCycle(keeperContext(kw, { log: log("A") }), false),
      runCycle(keeperContext(kw, { keeper: standby, chain: chainB, log: log("B") }), false),
    ]);

    // Both sent their first batch; exactly one landed it, the other's landed as AlreadySettled (6107) and failed whole.
    const failed = events.filter((line) => line.includes("settle-failed"));
    expect(failed.length).toBeGreaterThan(0);
    expect(failed.every((line) => line.includes("AlreadySettled (6107)"))).toBe(true);
    expect(a.settle.landed + b.settle.landed).toBeGreaterThan(0);
    expect(Math.min(a.settle.failed, b.settle.failed)).toBe(0);
    await expectPaidAsOwed(kw, campaign, captured, [standby.address]);
  });

  test("a keeper working from a stale view is refused in simulation and sends nothing", async () => {
    const { kw, campaign, bakers } = await finalizedSplit();
    const late: KeyPairSigner = await fundedWallet(kw, 10n);
    const chainB = chainRpc(kw);
    const stale = await readChainView(chainB.rpc, late.address);
    const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address, late.address];
    const captured = (
      await capturer(
        kw,
        campaign,
        bakers.map((b) => b.address),
        parties,
      )
    )();

    expect((await runCycle(keeperContext(kw), false)).settle).toMatchObject({ refused: 0, failed: 0 });
    const lateBefore = balance(kw, late.address);
    const ctx = keeperContext(kw, { keeper: late, chain: chainB });
    const report = await settleTask({ ...ctx.settle, landing: { ...ctx.landing, dryRun: false } }, stale);
    expect(report).toMatchObject({ landed: 0, failed: 0 });
    expect(chainB.calls.filter((method) => method === "sendTransaction")).toHaveLength(0);
    expect(balance(kw, late.address)).toBe(lateBefore);
    await expectPaidAsOwed(kw, campaign, captured, [late.address]);
  });
});
