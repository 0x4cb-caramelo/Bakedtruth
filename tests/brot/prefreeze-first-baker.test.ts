/**
 * Purpose: L-1 of the S-8 review (Sprint 16): the first baker is written once. `settle_entry` exempts a one-sided entry
 *          only when its baker is the campaign's `first_baker` and requires its flag to agree (6182), so the pair must
 *          never move to a second entry. A pot that is empty again while it already records a first baker (after a
 *          zero join or an exit, neither of which exists today) is planted here: the next join neither takes the
 *          campaign's `first_baker` nor gets the flag.
 * Version: 0.0.1
 * Sprint:  16 (lane S8). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { getAddressEncoder } from "@solana/kit";

import { join, readCampaign, readEntry } from "./flows";
import { joinWorld, rewrite } from "./join-campaign-support";
import { offsetOf } from "./layouts";
import * as P from "./program";
import { expectOk, fundedWallet } from "./setup";
import { CAMPAIGN } from "./structs";

describe("the first baker is written once", () => {
  test("a join into an empty pot that already records a first baker leaves it, and the new entry unflagged", async () => {
    const { w, campaign } = await joinWorld();
    const [first, next] = [await fundedWallet(w), await fundedWallet(w)];
    const at = offsetOf(CAMPAIGN, "first_baker");
    rewrite(w, campaign, (data) => data.set(getAddressEncoder().encode(first.address), at));
    expect(readCampaign(w, campaign)).toMatchObject({ first_baker: first.address, pool_yes: 0n, pool_no: 0n });

    expectOk(await join(w, next, campaign, { side: P.Side.Yes, amount: P.SOL }));
    expect(readCampaign(w, campaign)).toMatchObject({ first_baker: first.address, pool_yes: P.SOL });
    expect((await readEntry(w, campaign, next.address)).is_first).toBe(false);
  });
});
