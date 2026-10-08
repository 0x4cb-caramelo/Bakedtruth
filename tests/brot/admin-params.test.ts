/**
 * Purpose: creation parameters change future campaigns only (TP section 3.4.1): an open campaign
 *          keeps every byte it copied at opening and a new one takes the new values; the minimum
 *          entry (read at every join), the open-campaign valve and the SOL/USD read act from the
 *          next call on.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); lane B
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import {
  DEFAULT_PARAMS,
  initConfig,
  join,
  openedCampaign,
  openingLamports,
  openPriceCampaign,
  readCampaign,
  readConfig,
  SOL_PRICE,
} from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import {
  accountData,
  createWorld,
  expectError,
  expectOk,
  fundedWallet,
  send,
  setPriceAccount,
  START_TIME,
} from "./setup";
import type { World } from "./setup";

/** What a campaign copies from the config at opening and keeps for its whole life. */
function copied(w: World, campaign: Address) {
  const c = readCampaign(w, campaign);
  return { fee_bps: c.fee_bps, one_sided: c.one_sided_fee_bps, share: c.creator_share_bps, max_age: c.max_age };
}
const FOUNDERS = { fee_bps: 1_000, one_sided: 100, share: 100, max_age: 120 };

/** A config with the founder's values and one paid campaign already open. */
async function withOpenCampaign() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const creator = await fundedWallet(w);
  const old = await openedCampaign(w, creator);
  const setParams = async (change: Record<string, unknown>) =>
    expectOk(await send(w, [await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, ...change })]));
  return { w, creator, old, setParams };
}

describe("creation params apply to future campaigns only", () => {
  test("an open campaign keeps the fees, the share and the price age it copied; a new one takes the new", async () => {
    const { w, creator, old, setParams } = await withOpenCampaign();
    const before = accountData(w, old.campaign);
    expect(copied(w, old.campaign)).toEqual(FOUNDERS);

    await setParams({ fee_bps: 500, one_sided_fee_bps: 50, creator_share_bps: 40, campaign_max_age: 60 });
    expect(accountData(w, old.campaign)).toEqual(before); // not one byte of it moved
    expect((await readConfig(w)).open_campaigns).toBe(1); // a counter, not a parameter

    const fresh = await openedCampaign(w, creator);
    expect(copied(w, fresh.campaign)).toEqual({ fee_bps: 500, one_sided: 50, share: 40, max_age: 60 });
    expect(copied(w, old.campaign)).toEqual(FOUNDERS);
    expect((await readConfig(w)).open_campaigns).toBe(2);
  });

  test("the opening fee in US$ and the prize share apply from the next opening on", async () => {
    const { w, creator, old, setParams } = await withOpenCampaign();
    const before = accountData(w, old.campaign);
    await setParams({ opening_fee_usd: 600n, opening_prize_bps: 9_500 });
    expectError((await openPriceCampaign(w, creator)).sent, "OpeningUsdBelowFee");

    const fresh = await openedCampaign(w, creator, { openingUsd: 600n });
    const paid = openingLamports(600n, SOL_PRICE);
    const prize = (paid * 9_500n) / 10_000n;
    const c = readCampaign(w, fresh.campaign);
    const opening = [c.opening_usd, c.opening_paid_lamports, c.prize_lamports, c.opening_fee_lamports];
    expect(opening).toEqual([600n, paid, prize, paid - prize]);
    expect(accountData(w, old.campaign)).toEqual(before);
  });

  test("the minimum entry is read at every join, an open campaign's included", async () => {
    const { w, old, setParams } = await withOpenCampaign();
    const baker = await fundedWallet(w);
    await setParams({ min_entry_lamports: 50_000_000n });
    const small = { side: P.Side.Yes, amount: 20_000_000n };
    expectError(await join(w, baker, old.campaign, small), "EntryBelowMinimum");
    expectOk(await join(w, baker, old.campaign, { side: P.Side.Yes, amount: 50_000_000n }));
  });

  test("a lower max_open_campaigns stops new openings only", async () => {
    const { w, creator, old, setParams } = await withOpenCampaign();
    await setParams({ max_open_campaigns: 1 });
    expectError((await openPriceCampaign(w, creator)).sent, "TooManyOpenCampaigns");
    const baker = await fundedWallet(w);
    expectOk(await join(w, baker, old.campaign, { side: P.Side.No, amount: P.SOL / 10n }));
    expect((await readConfig(w)).open_campaigns).toBe(1);
  });

  test("the SOL/USD feed and its age bound apply from the next paid opening on", async () => {
    const { w, creator, setParams } = await withOpenCampaign();
    // The SOL/USD account now 100 s old: inside the founder's 120 s, outside a 90 s bound.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 100n });
    await setParams({ max_price_age: 90 });
    expectError((await openPriceCampaign(w, creator)).sent, "SolUsdStale");
    // The account is derived from the configured feed, never trusted as passed.
    await setParams({ sol_usd_feed_id: P.BTC_USD_FEED_ID });
    expectError((await openPriceCampaign(w, creator)).sent, "SolUsdAccountMismatch");
    await setParams({});
    expectOk((await openPriceCampaign(w, creator)).sent);
  });
});
