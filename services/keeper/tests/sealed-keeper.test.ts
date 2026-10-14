/**
 * Purpose: the keeper settles a campaign that carries two sealed entries (Sprint 15), end to end on LiteSVM: two
 *          sponsors each enter through `sponsor_join_campaign` next to an ordinary baker; the campaign resolves YES and,
 *          after its window, one keeper cycle tallies, finalizes, pays every entry, settles both `SealedFee`s
 *          (`settle_sealed_fee`) and only then closes the campaign (`close_campaign` waits on them: `SealedFeesOpen`).
 *          Each sponsor gets its entry's payout, its entry's rent and its SealedFee's rent back; each held fee goes to
 *          the fee vault and on to the fee recipient (a YES is no house failure); every lamport as the SDK's math says.
 * Version: 0.1.0
 * Sprint:  15 (lane L14K: the keeper learns the sealed fee)
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";
import { SettleMode, Side, decodeSealedFee, sealedFeeAddress } from "@brot/sdk/read";

import { openedCampaign } from "../../../tests/brot/flows";
import { sealedEntry } from "../../../tests/brot/sealed-support";
import { expectOk, fundedWallet } from "../../../tests/brot/setup";
import { runCycle } from "../src/cycle";
import { expectPaidAsOwed, type SealedHeld } from "./kit/settle-checks";
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

describe("the keeper and the sealed entry", () => {
  test("two sealed fees are settled to their sponsors' accounts before the close; every lamport as owed", async () => {
    const kw = await keeperWorld();
    const { campaign } = await openedCampaign(kw, kw.creator);
    const bakers = await bake(kw, campaign, [[Side.No, 2n * SOL]]);
    const sponsors = [await fundedWallet(kw, 20n), await fundedWallet(kw, 20n)];
    for (const sponsor of sponsors) expectOk(await sealedEntry(kw, sponsor, campaign, { side: Side.Yes }));
    expect(readCampaignOf(kw, campaign).sealedFeesOpen).toBe(2);

    const fees = await Promise.all(sponsors.map((s) => sealedFeeAddress(campaign, s.address)));
    const held = (at: Address) => {
      const account = kw.client.svm.getAccount(at);
      if (!account.exists) throw new Error(`no SealedFee at ${at}`);
      return decodeSealedFee({ owner: account.programAddress, data: account.data }).feeLamports;
    };
    const feeLamports = fees.map(held);

    touchBtc(kw);
    expect((await runCycle(keeperContext(kw), false)).counts.resolved).toBe(1);
    setClockTo(kw, readCampaignOf(kw, campaign).reviewEndsAt + 1n);
    const everyBaker = [...bakers, ...sponsors].map((b) => b.address);
    const parties = [kw.creator.address, kw.feeRecipient, kw.keeper.address, ...fees];
    const watch = await captureOnFinalize(kw, campaign, everyBaker, parties);
    const steps: string[] = [];
    const log = (event: string, fields: Record<string, unknown>) => {
      watch.log(event, fields);
      if (event.startsWith("settle-")) steps.push(`${event} ${String(fields.step).split(":")[0]}`);
    };
    const report = await runCycle(keeperContext(kw, { log }), false);
    expect(report.settle).toMatchObject({ refused: 0, failed: 0 });
    const captured = watch.captured();
    if (!captured) throw new Error("finalize did not land");
    expect(captured.campaign.settleMode).toBe(SettleMode.Split);

    // Both fees settled, each once, and before the close.
    expect(steps.filter((s) => s === "settle-landed sealedFee")).toHaveLength(2);
    expect(steps.lastIndexOf("settle-landed sealedFee")).toBeLessThan(steps.indexOf("settle-landed close"));
    for (const at of fees) expect(kw.client.svm.getAccount(at).exists).toBe(false);

    const sealed: SealedHeld[] = sponsors.map((s, i) => ({
      sponsor: s.address,
      lamports: captured.balances.get(fees[i]!)!,
      fee: feeLamports[i]!,
      toSponsor: false,
    }));
    expect(sealed.every((s) => s.fee > 0n && s.lamports > s.fee)).toBe(true);
    await expectPaidAsOwed(kw, campaign, captured, [], sealed);
  });
});
