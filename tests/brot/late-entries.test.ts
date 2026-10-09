/**
 * Purpose: the late-entry refund (TP section 3.4.16, founder answer 7) on the program: a join at or after the
 *          YES proof's publish_time comes back to its baker whole, neither wins nor loses, and pays no fee.
 *          The pure property tests are in invariant-rules.test.ts. This file needs the program binary
 *          (target/deploy/brot_markets.so) and the Join accounts the interface does not yet carry (see the
 *          report of lane E): it is expected to fail until that contract change lands.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { describe, expect, test } from "bun:test";

import { BTC_PRICE, initConfig, join, openedCampaign } from "./flows";
import { setBtc } from "./invariant-harness";
import { layoutSize } from "./layouts";
import { finalizeCampaignIx, settleEntryIx } from "./instructions-settlement";
import * as P from "./program";
import { resolveWith } from "./price-support";
import { balance, createWorld, expectOk, fundedWallet, now, rentFor, send, setTime } from "./setup";
import { ENTRY } from "./structs";

const SOL = P.SOL;
const SIX_HOURS = 6n * 3_600n;
/** The touch: the target crossed by 1%, so the YES proof reads a touch. */
const TOUCH = (BTC_PRICE * 11n * 101n) / (10n * 100n);

describe("late-entry refund on the program", () => {
  test("late entries come back whole: Ana's early YES and Bruno's late NO are each returned exactly", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const [ana, bruno] = [await fundedWallet(w), await fundedWallet(w)];
    const opened = await openedCampaign(w, creator);
    const { campaign, vault } = opened;

    // Ana joins YES first (early). Bruno joins NO later; the YES proof is dated at Bruno's join, so Bruno is late.
    expectOk(await join(w, ana, campaign, { side: P.Side.Yes, amount: 2n * SOL, expectedEntryTotal: 0n }));
    setTime(w.client, now(w.client) + 10n);
    setBtc(w, BTC_PRICE, now(w.client) - 5n);
    const bruTime = now(w.client);
    expectOk(await join(w, bruno, campaign, { side: P.Side.No, amount: 3n * SOL, expectedEntryTotal: 0n }));

    setBtc(w, TOUCH, bruTime);
    expectOk(await resolveWith(w, campaign));
    setTime(w.client, now(w.client) + SIX_HOURS + 1n);
    expectOk(await send(w, [finalizeCampaignIx(campaign, await P.configPda())]));

    const rent = rentFor(w, layoutSize(ENTRY));
    const anaBefore = balance(w, ana.address);
    expectOk(await send(w, [settleEntryIx(await P.entryPda(campaign, ana.address), campaign, vault, ana.address)]));
    expect(balance(w, ana.address) - anaBefore).toBe(2n * SOL + rent);
    const bruBefore = balance(w, bruno.address);
    expectOk(await send(w, [settleEntryIx(await P.entryPda(campaign, bruno.address), campaign, vault, bruno.address)]));
    expect(balance(w, bruno.address) - bruBefore).toBe(3n * SOL + rent);
  });
});
