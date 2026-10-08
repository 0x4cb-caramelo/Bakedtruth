/**
 * Purpose: `user_open_campaign` refuses rows 1 to 6 and 9 of TP section 3.4.10, each with its own
 *          error (X0.7): the kind, the direction, the metric account, the price and its target, the
 *          duration, and arguments that could carry a fee, a share or text. Payment, pause and
 *          slots are in the sibling files with the same describe name.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, expect, test } from "bun:test";
import { address, type Instruction } from "@solana/kit";

import { BTC_PRICE, DEFAULT_PARAMS, openedCampaign, readCampaign, SOL_PRICE } from "./flows";
import * as I from "./instructions";
import { BTC_CONF, FRESH, openingWorld, STALE, tryOpen } from "./opening";
import * as P from "./program";
import { expectError, expectOk, now, send, setPriceAccount } from "./setup";

describe("open campaign refuses", () => {
  test("row 1: the four other kinds, StakeAtLeast included, do not open yet", async () => {
    const w = await openingWorld();
    for (const kind of [1, 2, 3, 4]) {
      expectError((await tryOpen(w, w.creator, { kind })).sent, "ReaderKindNotOpen");
    }
  });

  test("row 1: a kind byte that names no reader", async () => {
    const w = await openingWorld();
    for (const kind of [5, 255]) {
      expectError((await tryOpen(w, w.creator, { kind })).sent, "UnknownReaderKind");
    }
  });

  test("a direction byte that is neither Above nor Below", async () => {
    const w = await openingWorld();
    expectError((await tryOpen(w, w.creator, { direction: 2 })).sent, "InvalidDirection");
  });

  test("row 2: a metric account that is not the feed's sponsored account", async () => {
    const w = await openingWorld();
    // SOL/USD's real account named for a BTC campaign; BTC's pre-upgrade sponsored address.
    const sol = await tryOpen(w, w.creator, {}, { slots: { metric: P.SOL_USD_ACCOUNT } });
    expectError(sol.sent, "MetricAccountMismatch");
    const legacy = address("4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo");
    expectError((await tryOpen(w, w.creator, {}, { slots: { metric: legacy } })).sent, "MetricAccountMismatch");
  });

  test("row 2: a legacy-receiver account at the sponsored address", async () => {
    const w = await openingWorld();
    // The pre-upgrade receiver's real SOL/USD bytes, at the upgraded sponsored address.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet-legacy", { owner: P.PYTH_LEGACY_RECEIVER_ID });
    const onSol = { feedId: P.SOL_USD_FEED_ID, target: (SOL_PRICE * 11n) / 10n };
    expectError((await tryOpen(w, w.creator, onSol)).sent, "ReaderWrongOwner");
  });

  test("row 4: a partial verification", async () => {
    const w = await openingWorld();
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { verification: 0 });
    expectError((await tryOpen(w, w.creator)).sent, "PriceNotFullyVerified");
  });

  test("row 4: a stale, a non-positive and a wide metric price", async () => {
    const w = await openingWorld();
    const btc = (change: Parameters<typeof setPriceAccount>[3]) =>
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", change);
    btc({ publishTime: STALE });
    expectError((await tryOpen(w, w.creator)).sent, "PriceStale");
    btc({ price: 0n });
    expectError((await tryOpen(w, w.creator)).sent, "PriceNonPositive");
    // Wider than 0.5% of the price by one unit.
    btc({ conf: BTC_PRICE / 200n + 1n });
    expectError((await tryOpen(w, w.creator)).sent, "PriceConfidenceTooWide");
    btc({ publishTime: FRESH });
    expectOk((await tryOpen(w, w.creator)).sent);
  });

  test("row 3: the target already touched, in both directions", async () => {
    const w = await openingWorld();
    const { Above, Below } = P.Direction;
    const open = async (direction: number, target: bigint) => (await tryOpen(w, w.creator, { direction, target })).sent;
    expectError(await open(Above, BTC_PRICE + BTC_CONF), "TargetAlreadyTouched");
    expectError(await open(Below, BTC_PRICE - BTC_CONF), "TargetAlreadyTouched");
    expectError(await open(Above, BTC_PRICE / 2n), "TargetAlreadyTouched");
    // One unit past the confidence band opens, in either direction.
    expectOk(await open(Above, BTC_PRICE + BTC_CONF + 1n));
    expectOk(await open(Below, BTC_PRICE - BTC_CONF - 1n));
  });

  test("row 5: 3 days − 1 s, 90 days + 1 s and a deadline in the past", async () => {
    const w = await openingWorld();
    const at = (seconds: bigint) => ({ deadlineAt: now(w.client) + seconds });
    expectError((await tryOpen(w, w.creator, at(3n * P.DAY - 1n))).sent, "DurationTooShort");
    expectError((await tryOpen(w, w.creator, at(90n * P.DAY + 1n))).sent, "DurationTooLong");
    expectError((await tryOpen(w, w.creator, at(-P.DAY))).sent, "DurationTooShort");
  });

  test("row 6: fees and share are copied from the config, never passed; later changes leave them", async () => {
    const w = await openingWorld();
    const first = await openedCampaign(w, w.creator);
    const changed = { ...DEFAULT_PARAMS, fee_bps: 500, one_sided_fee_bps: 50, creator_share_bps: 40 };
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, changed)]));
    const second = await openedCampaign(w, w.creator);
    const copies = (c: Record<string, unknown>) => [c.fee_bps, c.one_sided_fee_bps, c.creator_share_bps];
    expect(copies(readCampaign(w, first.campaign))).toEqual([1_000, 100, 100]);
    expect(copies(readCampaign(w, second.campaign))).toEqual([500, 50, 40]);
  });

  test("rows 6 and 9: an argument with an extra or a missing byte", async () => {
    const w = await openingWorld();
    const data = (ix: Instruction) => Uint8Array.from(ix.data ?? []);
    const longer = (ix: Instruction) => I.withData(ix, Uint8Array.of(...data(ix), 0));
    const shorter = (ix: Instruction) => I.withData(ix, data(ix).slice(0, -1));
    for (const tamper of [longer, shorter]) {
      expectError((await tryOpen(w, w.creator, {}, { tamper })).sent, "BadInstructionData");
    }
    // Row 9: no argument is text; the program names the sentence template itself.
    const opened = await openedCampaign(w, w.creator);
    expect(readCampaign(w, opened.campaign).template_version).toBe(1);
  });
});
