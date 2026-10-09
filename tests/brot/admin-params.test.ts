/**
 * Purpose: creation parameters change future campaigns only (TP section 3.4.1): an open campaign
 *          keeps every byte it copied at opening and a new one takes the new values; the minimum
 *          entry (read at every join), the open-campaign valve and the SOL/USD read act from the
 *          next call on; every change raises `params_version` by one, and an opening signs the
 *          version it previewed.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio); lane B. 03 (`params_version`), lane F
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
  SOL_CHARGED,
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

/**
 * A config with the founder's values and one paid campaign already open. `setParams` changes the
 * parameters and checks that `params_version` rose by one; `open` and `opened` sign the version
 * the creator would preview now.
 */
async function withOpenCampaign() {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const creator = await fundedWallet(w);
  const old = await openedCampaign(w, creator);
  expect((await readConfig(w)).params_version).toBe(0); // the initialisation's
  let version = 0;
  const setParams = async (change: Record<string, unknown>) => {
    expectOk(await send(w, [await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, ...change })]));
    version += 1;
    expect((await readConfig(w)).params_version).toBe(version);
  };
  const signed = (over: Partial<I.OpenArgs>) => ({ expectedParamsVersion: version, ...over });
  const open = (over: Partial<I.OpenArgs> = {}) => openPriceCampaign(w, creator, signed(over));
  const opened = (over: Partial<I.OpenArgs> = {}) => openedCampaign(w, creator, signed(over));
  return { w, admin, creator, old, setParams, open, opened };
}

describe("creation params apply to future campaigns only", () => {
  test("an open campaign keeps the fees, the share and the price age it copied; a new one takes the new", async () => {
    const { w, old, setParams, opened } = await withOpenCampaign();
    const before = accountData(w, old.campaign);
    expect(copied(w, old.campaign)).toEqual(FOUNDERS);

    await setParams({ fee_bps: 500, one_sided_fee_bps: 50, creator_share_bps: 40, campaign_max_age: 60 });
    expect(accountData(w, old.campaign)).toEqual(before); // not one byte of it moved
    expect((await readConfig(w)).open_campaigns).toBe(1); // a counter, not a parameter

    const fresh = await opened();
    expect(copied(w, fresh.campaign)).toEqual({ fee_bps: 500, one_sided: 50, share: 40, max_age: 60 });
    expect(copied(w, old.campaign)).toEqual(FOUNDERS);
    expect((await readConfig(w)).open_campaigns).toBe(2);
  });

  test("the opening fee in US$ and the prize share apply from the next opening on", async () => {
    const { w, old, setParams, open, opened } = await withOpenCampaign();
    const before = accountData(w, old.campaign);
    await setParams({ opening_fee_usd: 600n, opening_prize_bps: 9_500 });
    expectError((await open()).sent, "OpeningUsdBelowFee");

    const fresh = await opened({ openingUsd: 600n });
    const paid = openingLamports(600n, SOL_CHARGED);
    const prize = (paid * 9_500n) / 10_000n;
    const c = readCampaign(w, fresh.campaign);
    const opening = [c.opening_usd, c.opening_paid_lamports, c.prize_lamports, c.opening_fee_lamports];
    expect(opening).toEqual([600n, paid, prize, paid - prize]);
    expect(accountData(w, old.campaign)).toEqual(before);
  });

  test("an open campaign keeps the minimum it opened with: a later config change does not move it", async () => {
    // Question 5 (lane G): the join reads the campaign's own `min_entry_lamports`, copied at opening.
    const { w, old, setParams } = await withOpenCampaign();
    const baker = await fundedWallet(w);
    await setParams({ min_entry_lamports: 50_000_000n });
    const opened = 10_000_000n; // 0.01 SOL, the minimum the campaign was opened with
    expectError(await join(w, baker, old.campaign, { side: P.Side.Yes, amount: opened - 1n }), "BelowCampaignMinEntry");
    expectOk(await join(w, baker, old.campaign, { side: P.Side.Yes, amount: 20_000_000n }));
  });

  test("the campaign keeps the minimum entry it opened with (question 5)", async () => {
    const { w, setParams, open } = await withOpenCampaign();
    await setParams({ min_entry_lamports: 50_000_000n });
    const fresh = await open();
    expectOk(fresh.sent);
    await setParams({ min_entry_lamports: 20_000_000n });
    expect(readCampaign(w, fresh.campaign).min_entry_lamports).toBe(50_000_000n);
  });

  test("a lower max_open_campaigns stops new openings only", async () => {
    const { w, old, setParams, open } = await withOpenCampaign();
    await setParams({ max_open_campaigns: 1 });
    expectError((await open()).sent, "TooManyOpenCampaigns");
    const baker = await fundedWallet(w);
    expectOk(await join(w, baker, old.campaign, { side: P.Side.No, amount: P.SOL / 10n }));
    expect((await readConfig(w)).open_campaigns).toBe(1);
  });

  test("the SOL/USD feed and its age bound apply from the next paid opening on", async () => {
    const { w, setParams, open } = await withOpenCampaign();
    // The SOL/USD account now 100 s old: inside the founder's 120 s, outside a 90 s bound.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 100n });
    await setParams({ max_price_age: 90 });
    expectError((await open()).sent, "SolUsdStale");
    // The opening prices with the compiled SOL/USD id (founder answer 3): the config's field is unused,
    // so changing it changes nothing, and the same stale SOL/USD account is still refused.
    await setParams({ sol_usd_feed_id: P.BTC_USD_FEED_ID });
    expectError((await open()).sent, "SolUsdStale");
    // Back to the founder's values (version 3), then the same values again (version 4): every call
    // counts, so a preview signed under version 3 is refused.
    await setParams({});
    expectOk((await open()).sent);
    await setParams({});
    expectError((await open({ expectedParamsVersion: 3 })).sent, "CreationParamsChanged");
    expectOk((await open()).sent);
  });

  test("a refused change leaves params_version where it was", async () => {
    const { w, admin, creator, setParams } = await withOpenCampaign();
    await setParams({ fee_bps: 900 });
    const above = await I.setCreationParamsIx(admin, { ...DEFAULT_PARAMS, fee_bps: 1_001 });
    expectError(await send(w, [above]), "FeeBpsAboveCeiling");
    const stranger = await I.setCreationParamsIx(creator, DEFAULT_PARAMS);
    expectError(await send(w, [stranger]), "NotAdmin");
    expect((await readConfig(w)).params_version).toBe(1);
  });
});
