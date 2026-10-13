/**
 * Purpose: the landing path on the program, on LiteSVM (Sprint 06 DoD: "drop the failing instruction", "retry a
 *          reserved credit"): a batch holding one entry another wallet already settled lands the others, and records
 *          the dropped one by the program's refusal; a creator whose wallet is empty when the share is paid has it
 *          reserved, and the close pays it with the rents (the creator is the rent payer), every lamport as owed.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: transaction landing; the reserved credit)
 */
import { describe, expect, test } from "bun:test";
import { lamports } from "@solana/kit";
import { Side, decodeEntry, entryAddress } from "@brot/sdk/read";
import { buildFinalizeCampaign, buildSettleEntry, buildTallyLateJoins } from "@brot/sdk/tx";

import { openedCampaign } from "../../../tests/brot/flows";
import { balance, expectOk, send } from "../../../tests/brot/setup";
import { runCycle } from "../src/cycle";
import { landItems } from "../src/landing";
import { expectPaidAsOwed } from "./kit/settle-checks";
import {
  bake,
  captureOnFinalize,
  keeperContext,
  keeperWorld,
  readCampaignOf,
  setClockTo,
  touchBtc,
} from "./kit/settle-world";

const SOL = 1_000_000_000n;

describe("landing on the program", () => {
  test("a batch with one entry already settled lands the others and drops that one by its refusal", async () => {
    const kw = await keeperWorld();
    const { campaign } = await openedCampaign(kw, kw.creator);
    const bakers = await bake(kw, campaign, [
      [Side.Yes, 2n * SOL],
      [Side.Yes, SOL],
      [Side.No, 3n * SOL],
    ]);
    touchBtc(kw);
    await runCycle(keeperContext(kw), false);
    setClockTo(kw, readCampaignOf(kw, campaign).reviewEndsAt + 1n);
    for (const baker of bakers) {
      const held = kw.client.svm.getAccount(await entryAddress(campaign, baker.address));
      if (!held.exists) throw new Error("no entry");
      const { joinCount } = decodeEntry({ owner: held.programAddress, data: held.data });
      expectOk(await send(kw, [await buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to: joinCount })]));
    }
    expectOk(await send(kw, [await buildFinalizeCampaign({ campaign })]));
    // Someone else settles the second entry first.
    expectOk(await send(kw, [await buildSettleEntry({ campaign, baker: bakers[1]!.address })]));

    const ctx = keeperContext(kw);
    const items = await Promise.all(
      bakers.map(async (baker, i) => ({
        key: `entry-${i}`,
        kind: "settleEntry" as const,
        ix: await buildSettleEntry({ campaign, baker: baker.address }),
      })),
    );
    const before = bakers.map((baker) => balance(kw, baker.address));
    const results = await landItems({ ...ctx.landing, dryRun: false }, items);
    expect(results.map((r) => [r.key, r.outcome, r.outcome === "refused" ? r.detail : null])).toEqual([
      ["entry-1", "refused", "AlreadySettled"],
      ["entry-0", "landed", null],
      ["entry-2", "landed", null],
    ]);
    // The two that landed went out in one transaction; the dropped one moved nothing.
    expect(results[1]!.signature).toBe(results[2]!.signature!);
    expect(balance(kw, bakers[1]!.address)).toBe(before[1]!);
    expect(balance(kw, bakers[0]!.address) > before[0]!).toBe(true);
  });

  test("a creator share owed to an empty wallet is reserved, then paid by the close with the rents", async () => {
    const kw = await keeperWorld();
    const { campaign } = await openedCampaign(kw, kw.creator);
    // Small entries: a 1% share of 0.05 SOL is below an empty wallet's rent-exempt minimum, so it is reserved.
    const bakers = await bake(kw, campaign, [
      [Side.Yes, 20_000_000n],
      [Side.No, 30_000_000n],
    ]);
    touchBtc(kw);
    await runCycle(keeperContext(kw), false);
    setClockTo(kw, readCampaignOf(kw, campaign).reviewEndsAt + 1n);
    const held = kw.client.svm.getAccount(kw.creator.address);
    if (!held.exists) throw new Error("no creator account");
    const { address, data, executable, programAddress, space } = held;
    kw.client.svm.setAccount({ address, data, executable, programAddress, space, lamports: lamports(0n) });
    expect(balance(kw, kw.creator.address)).toBe(0n);

    const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address];
    const watch = await captureOnFinalize(
      kw,
      campaign,
      bakers.map((b) => b.address),
      parties,
    );
    const events: string[] = [];
    const log = (event: string, fields: Record<string, unknown>) => {
      watch.log(event, fields);
      events.push(`${event} ${String(fields.step).split(":")[0]}`);
    };
    const report = await runCycle(keeperContext(kw, { log }), false);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    expect(events).toContain("settle-landed creatorShare");
    expect(events).toContain("settle-landed close");
    const captured = watch.captured();
    if (!captured) throw new Error("finalize did not land");
    const o = await expectPaidAsOwed(kw, campaign, captured);
    expect(o.share > 0n && o.share < 890_880n).toBe(true);
  });
});
