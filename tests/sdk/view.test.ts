/**
 * Purpose: A-7 and BR-05: `publicState` gives each of the five public states (and its details) from the
 *          campaign and the CHAIN's time alone; chain times decades from the machine's clock show the device
 *          clock plays no part. One test per state, then a real campaign in LiteSVM read through the SDK.
 *          Filter: `bun test tests/ -t "public state follows chain time"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";

import {
  ACCOUNT_TAG,
  decodeCampaign,
  getCampaignDecoder,
  LAYOUT_VERSION,
  Outcome,
  outcomeKnowable,
  PROGRAM_ID,
  publicState,
  ReaderKind,
  Status,
  type Campaign,
} from "@brot/sdk/read";

import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { accountData, now } from "../brot/setup";
import { setClock } from "../brot/readers";

/** A campaign as the program stores one, every field zero but the tag, then `over`. */
function campaign(over: Partial<Campaign>): Campaign {
  const data = new Uint8Array(512);
  data.set([ACCOUNT_TAG.campaign, LAYOUT_VERSION]);
  return { ...getCampaignDecoder().decode(data), ...over };
}

const YEAR_2050 = 2_524_608_000n;
const chain = (unixTimestamp: bigint, epoch = 0n) => ({ slot: 1n, epoch, unixTimestamp });
const open = { status: Status.Open, entriesCloseAt: YEAR_2050, deadlineAt: YEAR_2050 + 86_400n };

describe("public state follows chain time", () => {
  test("Open: before the entry close by chain time, though the device's clock is decades away", () => {
    const view = publicState(campaign(open), chain(YEAR_2050 - 1n));
    expect([view.state, view.closedBecause]).toEqual(["Open", null]);
    expect(Number(YEAR_2050) * 1000 - Date.now()).toBeGreaterThan(0);
  });

  test("Closed: at the entry close by chain time, in the past of the device's clock too", () => {
    expect(publicState(campaign(open), chain(YEAR_2050)).closedBecause).toBe("entriesClosed");
    const old = campaign({ ...open, entriesCloseAt: 1_000n });
    expect([publicState(old, chain(999n)).state, publicState(old, chain(1_000n)).state]).toEqual(["Open", "Closed"]);
  });

  test("Closed: an epoch kind once the measured epoch starts, from the clock alone", () => {
    const pool = campaign({ ...open, kind: ReaderKind.StakePoolTvlAtLeast, epoch: 900n });
    expect(publicState(pool, chain(1n, 899n)).state).toBe("Open");
    expect(publicState(pool, chain(1n, 900n)).closedBecause).toBe("epochStarted");
  });

  test("Closed: the outcome knowable from the metric account the caller read", () => {
    expect(publicState(campaign(open), chain(1n), { outcomeKnowable: true }).closedBecause).toBe("outcomeKnowable");
  });

  test("In review: the window open, ended, or paused by a contest", () => {
    const review = campaign({ status: Status.InReview, outcome: Outcome.Yes, reviewEndsAt: 5_000n });
    expect(publicState(review, chain(4_999n))).toMatchObject({ state: "InReview", windowEnded: false });
    expect(publicState(review, chain(5_000n))).toMatchObject({ state: "InReview", windowEnded: true });
    expect(publicState(campaign({ status: Status.Contested }), chain(1n))).toMatchObject({ contested: true });
  });

  test("Paid: settling or settled with a YES or a NO", () => {
    for (const outcome of [Outcome.Yes, Outcome.No]) {
      expect(publicState(campaign({ status: Status.Settling, outcome }), chain(1n))).toMatchObject({
        state: "Paid",
        settled: false,
      });
      expect(publicState(campaign({ status: Status.Settled, outcome }), chain(1n)).settled).toBe(true);
    }
  });

  test("Void: settling or settled with a void; a settling campaign without an outcome is refused", () => {
    expect(publicState(campaign({ status: Status.Settling, outcome: Outcome.Void }), chain(1n)).state).toBe("Void");
    expect(() => publicState(campaign({ status: Status.Settling }), chain(1n))).toThrow("without an outcome");
  });

  test("a campaign opened in LiteSVM, read through the SDK, against the world's clock", async () => {
    const w = await openingWorld();
    const { campaign: address } = await openedCampaign(w, w.creator);
    const read = () => decodeCampaign({ owner: PROGRAM_ID, data: accountData(w, address) });
    const clock = () => {
      const c = w.client.svm.getClock();
      return { slot: c.slot, epoch: c.epoch, unixTimestamp: c.unixTimestamp };
    };
    const metric = { address: P.BTC_USD_ACCOUNT, owner: P.PYTH_RECEIVER_ID, data: accountData(w, P.BTC_USD_ACCOUNT) };
    expect(outcomeKnowable(read(), metric, clock())).toBe(false);
    expect(publicState(read(), clock()).state).toBe("Open");
    setClock(w.client, { unixTimestamp: read().entriesCloseAt });
    expect(publicState(read(), clock())).toMatchObject({ state: "Closed", closedBecause: "entriesClosed" });
    expect(now(w.client)).toBe(read().entriesCloseAt);
  });
});
