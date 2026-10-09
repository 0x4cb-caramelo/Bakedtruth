/**
 * Purpose: the price split at the join (TP section 3.4.8): joining a price campaign reads only the
 *          sponsored account the campaign locked at opening, fully verified, of its feed and its
 *          stored exponent, at most the campaign's `max_age` old, at most 60 s ahead of the clock and
 *          posted within the slot bound. Any other account or reading is refused with its own error
 *          and moves nothing; each bound passes at its edge.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane E. Needs the SBF build with lane C's price rules: runs
 *          from the integration on.
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { anyAddress } from "./checks-support";
import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, join, openedCampaign, readCampaign, readConfig, SOL_PRICE } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { setClock } from "./readers";
import { expectOk, fundedWallet, now, send, setPriceAccount, type World } from "./setup";
import { joinWorld, refusedJoin } from "./join-campaign-support";

const SOL = P.SOL;
const yes = (amount: bigint): I.JoinArgs => ({ side: P.Side.Yes, amount });
/** A refused first join: the baker had no Entry, and still has none. */
const noEntry = (kept: { entry: { owner: Address | null } }) => expect(kept.entry.owner).toBeNull();

/** SOL/USD above 110%: the legacy receiver's capture is of the same feed, so only its owner differs. */
const SOL_CAMPAIGN = { feedId: P.SOL_USD_FEED_ID, target: (SOL_PRICE * 11n) / 10n };
/** Writes `fixture` at the sponsored SOL/USD address with `change`, published 5 s ago unless `change` says. */
const sponsored = (w: World, change: Parameters<typeof setPriceAccount>[3] = {}, fixture = "pyth-sol-usd-devnet") =>
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, fixture, { publishTime: now(w.client) - 5n, ...change });

describe("price join accepts only the sponsored account", () => {
  test("any other account or reading is refused with its own error, and nothing moves", async () => {
    const { w, campaign } = await joinWorld(SOL_CAMPAIGN);
    // The opening locked the sponsored account it derived from the feed; the join only compares it.
    expect(readCampaign(w, campaign).metric_account).toBe(await P.sponsoredPriceAccount(P.SOL_USD_FEED_ID));
    // A Full account of the same feed, as a YES proof may be, written at another address.
    const elsewhere = await anyAddress();
    setPriceAccount(w.client, elsewhere, "pyth-sol-usd-devnet", { publishTime: now(w.client) - 5n });
    const legacy = { owner: P.PYTH_LEGACY_RECEIVER_ID };
    const cases: [() => unknown, BrotErrorName, Address?][] = [
      [() => sponsored(w), "MetricAccountMismatch", elsewhere],
      [() => sponsored(w, legacy, "pyth-sol-usd-devnet-legacy"), "ReaderWrongOwner"],
      [() => sponsored(w, { verification: 0 }), "PriceNotFullyVerified"],
      [() => sponsored(w, {}, "pyth-btc-usd-devnet"), "PriceWrongFeed"],
      [() => sponsored(w, { exponent: -7 }), "PriceExponentChanged"],
      [() => sponsored(w, { exponent: -9 }), "PriceExponentChanged"],
      [() => sponsored(w, { publishTime: now(w.client) - 121n }), "JoinPriceStale"],
      [() => sponsored(w, { publishTime: now(w.client) + 61n }), "JoinPriceStale"],
    ];
    for (const [write, error, metric] of cases) {
      write();
      noEntry(await refusedJoin(w, await fundedWallet(w), campaign, { ...yes(SOL), metric }, error));
    }
    // The same sponsored account, fresh and of the feed: the join passes.
    sponsored(w);
    const baker = await fundedWallet(w);
    expectOk(await join(w, baker, campaign, yes(SOL)));
    expect(readCampaign(w, campaign)).toMatchObject({ pool_yes: SOL, first_baker: baker.address });
  });

  test("a price exactly max_age old, or exactly 60 s ahead of the clock, still passes", async () => {
    const { w, campaign } = await joinWorld(SOL_CAMPAIGN);
    const maxAge = BigInt(readCampaign(w, campaign).max_age);
    expect(maxAge).toBe(BigInt(DEFAULT_PARAMS.campaign_max_age));
    sponsored(w, { publishTime: now(w.client) - maxAge });
    expectOk(await join(w, await fundedWallet(w), campaign, yes(SOL)));
    sponsored(w, { publishTime: now(w.client) + P.MAX_PRICE_CLOCK_LEAD_SECONDS });
    expectOk(await join(w, await fundedWallet(w), campaign, yes(SOL)));
  });

  test("posted more than ceil(max_age × 1,000 / MIN_SLOT_MS) slots before the clock: JoinPriceStale", async () => {
    const { w, campaign } = await joinWorld(SOL_CAMPAIGN);
    const maxAge = BigInt(readCampaign(w, campaign).max_age);
    const bound = (maxAge * 1_000n + P.MIN_SLOT_MS - 1n) / P.MIN_SLOT_MS;
    expect(bound).toBe(1_200n);
    // A clock slot above the capture's posted slot (~5.08e8), so the lag is what the test sets.
    const slot = 600_000_000n;
    setClock(w.client, { slot });
    sponsored(w, { postedSlot: slot - bound - 1n });
    noEntry(await refusedJoin(w, await fundedWallet(w), campaign, yes(SOL), "JoinPriceStale"));
    sponsored(w, { postedSlot: slot - bound });
    expectOk(await join(w, await fundedWallet(w), campaign, yes(SOL)));
  });

  test("the age bound is the campaign's own max_age, copied at opening, not the config's later value", async () => {
    const { w, admin, creator, campaign } = await joinWorld(SOL_CAMPAIGN);
    const params = { ...DEFAULT_PARAMS, campaign_max_age: 60 };
    expectOk(await send(w, [await I.setCreationParamsIx(admin, params)]));
    sponsored(w);
    const expectedParamsVersion = (await readConfig(w)).params_version as number;
    const later = (await openedCampaign(w, creator, { ...SOL_CAMPAIGN, expectedParamsVersion })).campaign;
    expect([readCampaign(w, campaign).max_age, readCampaign(w, later).max_age]).toEqual([120, 60]);
    // 100 s old: within the first campaign's 120 s, past the later one's 60 s.
    sponsored(w, { publishTime: now(w.client) - 100n });
    expectOk(await join(w, await fundedWallet(w), campaign, yes(SOL)));
    noEntry(await refusedJoin(w, await fundedWallet(w), later, yes(SOL), "JoinPriceStale"));
  });
});
