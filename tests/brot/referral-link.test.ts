/**
 * Purpose: `user_link_referrer` in LiteSVM, the paths that link: the link the program writes (tag, version, canonical
 *          bump, referee, referrer, the clock's time and slot), paid by the referee, with its `ReferralLinked` event
 *          decoded by the SDK; an address funded in advance topped up instead of blocking the link; a link while
 *          entries are paused (I10′: linking is never paused); and a link after the referee's first entry, recorded
 *          with its later slot for the indexer to compare (TP 3.4.11), not refused.
 *          Filter: `bun test tests/ -t "link referrer links"`.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A. Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";

import { findReferralLinkPda } from "@brot/sdk/read";

import { place } from "./checks-support";
import { join, readCampaign } from "./flows";
import * as I from "./instructions";
import { joinWorld } from "./join-campaign-support";
import { decode } from "./layouts";
import * as P from "./program";
import { setClock } from "./readers";
import { LINK_SLOT, LINK_TIME, link, linkWorld, readLink } from "./referral-support";
import { accountData, balance, expectError, expectOk, fundedWallet, now, rentFor, send } from "./setup";
import { JOIN } from "./structs";

const LINK_LEN = 96;

describe("link referrer links", () => {
  test("link: the referee's link records the referrer, the time and the slot, with the referee's rent", async () => {
    const { w, referee, referrer, link: address } = await linkWorld();
    const before = balance(w, referee.address);
    const sent = expectOk(await link(w, referee, referrer.address));
    const { link: stored, lamports } = await readLink(w, referee.address);
    const [, bump] = await findReferralLinkPda(referee.address);
    expect(stored).toMatchObject({ tag: 4, version: 1, bump, referee: referee.address, referrer: referrer.address });
    expect([stored.linkedAt, stored.linkedSlot]).toEqual([LINK_TIME, LINK_SLOT]);
    expect(Array.from(stored.reserved)).toEqual(Array(13).fill(0));
    // The link holds its rent-exempt minimum, paid by the referee (the world's payer pays the fee).
    expect(lamports).toBe(rentFor(w, LINK_LEN));
    expect(before - balance(w, referee.address)).toBe(rentFor(w, LINK_LEN));
    // One event, decoded by the SDK as an indexer decodes it, and by the kit's layout.
    expect(sent.events).toEqual([
      {
        name: "ReferralLinked",
        data: { referee: referee.address, referrer: referrer.address, linked_at: LINK_TIME, linked_slot: LINK_SLOT },
      },
    ]);
    expect(address).toBe(await P.referralLinkPda(referee.address));
  });

  test("link: an address funded in advance is topped up and linked", async () => {
    // One lamport, below the minimum: the referee pays the rest.
    const low = await linkWorld();
    place(low.w, low.link, { owner: P.SYSTEM_PROGRAM_ID, lamports: 1n });
    const before = balance(low.w, low.referee.address);
    expectOk(await link(low.w, low.referee, low.referrer.address));
    expect((await readLink(low.w, low.referee.address)).lamports).toBe(rentFor(low.w, LINK_LEN));
    expect(before - balance(low.w, low.referee.address)).toBe(rentFor(low.w, LINK_LEN) - 1n);
    // Twice the minimum: the referee pays nothing, and the surplus stays in the link.
    const high = await linkWorld();
    const twice = 2n * rentFor(high.w, LINK_LEN);
    place(high.w, high.link, { owner: P.SYSTEM_PROGRAM_ID, lamports: twice });
    const kept = balance(high.w, high.referee.address);
    expectOk(await link(high.w, high.referee, high.referrer.address));
    const { link: stored, lamports } = await readLink(high.w, high.referee.address);
    expect([stored.referee, stored.referrer, lamports]).toEqual([high.referee.address, high.referrer.address, twice]);
    expect(balance(high.w, high.referee.address)).toBe(kept);
  });

  test("link: a referee links while entries are paused (linking is never paused, I10′)", async () => {
    const { w, team, campaign } = await joinWorld();
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    const [referee, referrer] = [await fundedWallet(w), await fundedWallet(w)];
    // The pause is on: the referee's join is refused...
    expectError(await join(w, referee, campaign, { side: P.Side.Yes, amount: P.SOL }), "JoinWhilePaused");
    // ...and its link goes through.
    expectOk(await link(w, referee, referrer.address));
    expect((await readLink(w, referee.address)).link.referrer).toBe(referrer.address);
  });

  test("link: a link after the referee's first entry is recorded with its later time and slot, not refused", async () => {
    // "Before the first entry" is the indexer's check, from two on-chain times (TP 3.4.11).
    const { w, campaign } = await joinWorld();
    const [referee, referrer] = [await fundedWallet(w), await fundedWallet(w)];
    const entrySlot = w.client.svm.getClock().slot;
    expectOk(await join(w, referee, campaign, { side: P.Side.No, amount: P.SOL }));
    const joined = decode(JOIN, accountData(w, await P.joinPda(campaign, referee.address, 0)));
    setClock(w.client, { unixTimestamp: now(w.client) + P.HOUR, slot: entrySlot + 9_000n });
    expectOk(await link(w, referee, referrer.address));
    const { link: stored } = await readLink(w, referee.address);
    expect(stored.linkedAt).toBe((joined.joined_at as bigint) + P.HOUR);
    expect(stored.linkedSlot).toBe(entrySlot + 9_000n);
    expect(readCampaign(w, campaign).pool_no).toBe(P.SOL);
  });
});
