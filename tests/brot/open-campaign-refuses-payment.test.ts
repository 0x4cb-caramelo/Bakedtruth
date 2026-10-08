/**
 * Purpose: `user_open_campaign` refuses rows 7 and 8 of TP section 3.4.10, each with its own error
 *          (X0.7): who must pay and how much, the signed `max_lamports`, the SOL/USD account derived
 *          from the config with its freshness and confidence; the pause and `max_open_campaigns`.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, expect, test } from "bun:test";

import { DEFAULT_PARAMS, openingLamports, readConfig, SOL_PRICE } from "./flows";
import * as I from "./instructions";
import { openingWorld, STALE, tryOpen, type OpeningWorld } from "./opening";
import * as P from "./program";
import { expectError, expectOk, send, setPriceAccount } from "./setup";

/** Rewrites the SOL/USD account with one field changed (fresh unless `publishTime` is given). */
const solUsd = (w: OpeningWorld, change: Parameters<typeof setPriceAccount>[3]) =>
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", change);

describe("open campaign refuses", () => {
  test("row 7: a signer outside the team that passes no payment", async () => {
    const w = await openingWorld();
    expectError((await tryOpen(w, w.creator, { openingUsd: 0n })).sent, "OpeningUsdBelowFee");
  });

  test("row 7: a payment below the opening fee, from a wallet or a team key", async () => {
    const w = await openingWorld();
    expectError((await tryOpen(w, w.creator, { openingUsd: 499n })).sent, "OpeningUsdBelowFee");
    // A team key that adds a prize pays like any wallet, from the same floor [AC].
    expectError((await tryOpen(w, w.team, { openingUsd: 1n })).sent, "OpeningUsdBelowFee");
  });

  test("row 7: a price above the signed max_lamports (T25)", async () => {
    const w = await openingWorld();
    const price = openingLamports(500n, SOL_PRICE);
    expectError((await tryOpen(w, w.creator, { maxLamports: price - 1n })).sent, "OpeningAboveMaxLamports");
    expectError((await tryOpen(w, w.creator, { maxLamports: 0n })).sent, "OpeningAboveMaxLamports");
  });

  test("row 7: a SOL/USD slot that is not the config's sponsored account", async () => {
    const w = await openingWorld();
    const btc = await tryOpen(w, w.creator, {}, { slots: { solUsd: P.BTC_USD_ACCOUNT } });
    expectError(btc.sent, "SolUsdAccountMismatch");
    const system = await tryOpen(w, w.creator, {}, { slots: { solUsd: P.SYSTEM_PROGRAM_ID } });
    expectError(system.sent, "SolUsdAccountMismatch");
  });

  test("row 7: the SOL/USD account under the pre-upgrade receiver", async () => {
    const w = await openingWorld();
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet-legacy", { owner: P.PYTH_LEGACY_RECEIVER_ID });
    expectError((await tryOpen(w, w.creator)).sent, "ReaderWrongOwner");
  });

  test("row 7: a stale, a non-positive and a wide SOL/USD price", async () => {
    const w = await openingWorld();
    solUsd(w, { publishTime: STALE });
    expectError((await tryOpen(w, w.creator)).sent, "SolUsdStale");
    solUsd(w, { price: 0n });
    expectError((await tryOpen(w, w.creator)).sent, "SolUsdPriceNonPositive");
    // Wider than the devnet `max_price_conf_bps` (0.5%) by one unit.
    solUsd(w, { conf: SOL_PRICE / 200n + 1n });
    expectError((await tryOpen(w, w.creator)).sent, "SolUsdConfidenceTooWide");
    solUsd(w, {});
    expectOk((await tryOpen(w, w.creator)).sent);
  });

  test("row 7: a SOL/USD exponent the conversion does not support", async () => {
    const w = await openingWorld();
    solUsd(w, { exponent: -100 });
    expectError((await tryOpen(w, w.creator)).sent, "PriceExponentOutOfRange");
  });

  test("row 8: the pause stops every opening, a team key's included", async () => {
    const w = await openingWorld();
    expectOk(await send(w, [await I.pauseEntriesIx(w.team)]));
    expectError((await tryOpen(w, w.creator)).sent, "OpenWhilePaused");
    expectError((await tryOpen(w, w.team, { openingUsd: 0n })).sent, "OpenWhilePaused");
    expectOk(await send(w, [await I.resumeEntriesIx(w.admin)]));
    expectOk((await tryOpen(w, w.creator)).sent);
  });

  test("row 8: max_open_campaigns reached", async () => {
    const w = await openingWorld();
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, max_open_campaigns: 1 })]));
    expectOk((await tryOpen(w, w.creator)).sent);
    expect((await readConfig(w)).open_campaigns).toBe(1);
    expectError((await tryOpen(w, w.creator)).sent, "TooManyOpenCampaigns");
    expectError((await tryOpen(w, w.team, { openingUsd: 0n })).sent, "TooManyOpenCampaigns");
    expect((await readConfig(w)).open_campaigns).toBe(1);
  });
});
