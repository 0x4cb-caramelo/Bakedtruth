/**
 * Purpose: F3 of the pre-freeze review (Sprint 16): a cut-off move stores the earlier proof's price with its time, so
 *          the campaign and the `CampaignResolved` the move emits pair that proof's account, publish time and slot with
 *          that proof's own price, and a second read of the account the event names finds the value the campaign
 *          recorded. Before the fix the move kept the first proof's price beside the second proof's account.
 * Version: 0.0.1
 * Sprint:  16 (lane L16P, the review's follow-ups). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { readPriceUpdate } from "@brot/sdk/read";

import { BTC_PRICE, openedCampaign } from "./flows";
import { BTC_CONF, openingWorld } from "./opening";
import { proofAccount, recorded, resolveWith } from "./price-support";
import * as P from "./program";
import { setClock } from "./readers";
import { START_TIME } from "./setup";

const TARGET = (BTC_PRICE * 11n) / 10n;
const DAY_ONE = START_TIME + P.DAY;

describe("a cut-off move records the earlier proof's price with its time", () => {
  test("after a move, the account the event names holds the value the campaign stores", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    setClock(w.client, { unixTimestamp: DAY_ONE });
    // The first YES: a touch at TARGET + conf, published 10 s ago.
    const first = await proofAccount(w, { price: TARGET + BTC_CONF, publishTime: DAY_ONE - 10n });
    const resolved = recorded(w, campaign, await resolveWith(w, campaign, first));
    expect(resolved.campaign.observed_value).toBe(TARGET + BTC_CONF);

    // An earlier proof at another price moves the cut-off back.
    const earlierPrice = TARGET + BTC_CONF + 777n;
    const earlier = await proofAccount(w, { price: earlierPrice, publishTime: DAY_ONE - 30n });
    const moved = recorded(w, campaign, await resolveWith(w, campaign, earlier));
    expect(moved.campaign).toMatchObject({
      outcome: P.Outcome.Yes,
      publish_time: DAY_ONE - 30n,
      observed_value: earlierPrice,
      review_ends_at: resolved.campaign.review_ends_at,
    });
    const event = moved.event as Record<string, unknown>;
    const pick = (snake: string, camel: string) => event[snake] ?? event[camel];
    expect(pick("read_account", "readAccount")).toBe(earlier);
    expect(pick("publish_time", "publishTime")).toBe(DAY_ONE - 30n);
    expect(pick("observed_value", "observedValue")).toBe(earlierPrice);

    // The second read: the account the event names, read as the SDK reads a price update, holds that very price.
    const account = w.client.svm.getAccount(earlier);
    if (!account.exists) throw new Error("the earlier proof's account is gone");
    const reading = readPriceUpdate(account.programAddress, account.data, P.BTC_USD_FEED_ID);
    expect({ price: reading.price, publishTime: reading.publishTime }).toEqual({
      price: moved.campaign.observed_value as bigint,
      publishTime: moved.campaign.publish_time as bigint,
    });
  });
});
