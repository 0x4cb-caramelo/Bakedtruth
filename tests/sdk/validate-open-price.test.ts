/**
 * Purpose: A-10 / X0.7, SDK half, for the price kind and the rules every kind shares: each case that
 *          tests/brot/open-campaign-refuses.test.ts feeds to the program is fed to `validateOpenCampaign`
 *          too, and both must refuse with the same error (rows 1 to 5, the terms the creator saw, the
 *          pause), or both accept with the same charge. Filter: "sdk refuses at least what the program refuses".
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";
import { address } from "@solana/kit";

import { BTC_PRICE, DEFAULT_PARAMS, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import { BTC_CONF, FRESH, openingWorld, STALE } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, now, send, setPriceAccount } from "../brot/setup";
import { expectParity } from "./open-parity";

describe("sdk refuses at least what the program refuses", () => {
  test("rows 1 and 4: a kind byte past the five, a direction byte past the two", async () => {
    const w = await openingWorld();
    for (const kind of [6, 255]) await expectParity(w, w.creator, "UnknownReaderKind", { kind });
    await expectParity(w, w.creator, "InvalidDirection", { direction: 2 });
    await expectParity(w, w.creator, "UnusedArgumentNotZero", { epoch: 1n });
  });

  test("row 2: a metric account that is not the sponsored one, or under the old receiver", async () => {
    const w = await openingWorld();
    await expectParity(w, w.creator, "MetricAccountMismatch", {}, { metric: P.SOL_USD_ACCOUNT });
    const legacy = address("4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo");
    await expectParity(w, w.creator, "MetricAccountMismatch", {}, { metric: legacy });
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet-legacy", { owner: P.PYTH_LEGACY_RECEIVER_ID });
    await expectParity(w, w.creator, "ReaderWrongOwner", { feedId: P.SOL_USD_FEED_ID, target: SOL_PRICE * 2n });
  });

  test("row 4: a feed outside the compiled list, a partial verification", async () => {
    const w = await openingWorld();
    const unlisted = Uint8Array.from(P.SOL_USD_FEED_ID);
    unlisted[31] ^= 1;
    const account = await P.sponsoredPriceAccount(unlisted);
    setPriceAccount(w.client, account, "pyth-sol-usd-devnet", { feedId: unlisted });
    const change = { feedId: unlisted, target: (SOL_PRICE * 11n) / 10n };
    await expectParity(w, w.creator, "FeedNotOnList", change, { metric: account });
    // SOL/USD's bytes at BTC/USD's sponsored address: the right address, another feed.
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-sol-usd-devnet");
    await expectParity(w, w.creator, "PriceWrongFeed");
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { verification: 0 });
    await expectParity(w, w.creator, "PriceNotFullyVerified");
  });

  test("row 4: a stale, a non-positive and a wide metric price, then a fresh one", async () => {
    const w = await openingWorld();
    const btc = (change: Parameters<typeof setPriceAccount>[3]) =>
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", change);
    btc({ publishTime: STALE });
    await expectParity(w, w.creator, "PriceStale");
    btc({ publishTime: now(w.client) + 61n });
    await expectParity(w, w.creator, "PriceStale");
    btc({ price: 0n });
    await expectParity(w, w.creator, "PriceNonPositive");
    btc({ conf: BTC_PRICE / 200n + 1n });
    await expectParity(w, w.creator, "PriceConfidenceTooWide");
    btc({ publishTime: FRESH });
    await expectParity(w, w.creator, "accepted");
  });

  test("row 3: touched, too close and out of reach in both directions, and the bounds that open", async () => {
    const w = await openingWorld();
    const { Above, Below } = P.Direction;
    const at = (direction: number, target: bigint) => ({ direction, target });
    await expectParity(w, w.creator, "TargetAlreadyTouched", at(Above, BTC_PRICE + BTC_CONF));
    await expectParity(w, w.creator, "TargetAlreadyTouched", at(Below, BTC_PRICE - BTC_CONF));
    await expectParity(w, w.creator, "TargetAlreadyTouched", at(Above, BTC_PRICE / 2n));
    await expectParity(w, w.creator, "TargetTooClose", at(Above, BTC_PRICE + BTC_CONF + 1n));
    await expectParity(w, w.creator, "TargetTooClose", at(Below, BTC_PRICE - BTC_CONF - 1n));
    await expectParity(w, w.creator, "TargetUnreachable", at(Above, BTC_PRICE * 10n + 1n));
    await expectParity(w, w.creator, "TargetUnreachable", at(Below, 0n));
    await expectParity(w, w.creator, "TargetUnreachable", at(Below, BTC_PRICE / 10n - 1n));
    await expectParity(w, w.creator, "accepted", at(Above, BTC_PRICE + BTC_CONF + BTC_PRICE / 50n));
    await expectParity(w, w.creator, "accepted", at(Below, BTC_PRICE - BTC_CONF - BTC_PRICE / 50n));
    await expectParity(w, w.creator, "accepted", at(Above, BTC_PRICE * 10n));
  });

  test("row 5: 3 days − 1 s, 90 days + 1 s, a deadline in the past; both bounds open", async () => {
    const w = await openingWorld();
    const at = (seconds: bigint) => ({ deadlineAt: now(w.client) + seconds });
    await expectParity(w, w.creator, "DurationTooShort", at(3n * P.DAY - 1n));
    await expectParity(w, w.creator, "DurationTooLong", at(90n * P.DAY + 1n));
    await expectParity(w, w.creator, "DurationTooShort", at(-P.DAY));
    await expectParity(w, w.creator, "accepted", at(3n * P.DAY));
    await expectParity(w, w.creator, "accepted", at(90n * P.DAY));
  });

  test("the terms the creator saw, then the pause before them, for a wallet and a team key", async () => {
    const w = await openingWorld();
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, creator_share_bps: 40 })]));
    for (const expectedParamsVersion of [0, 2]) {
      await expectParity(w, w.creator, "CreationParamsChanged", { expectedParamsVersion });
    }
    await expectParity(w, w.team, "CreationParamsChanged", { openingUsd: 0n });
    expectOk(await send(w, [await I.pauseEntriesIx(w.team)]));
    await expectParity(w, w.creator, "OpenWhilePaused", { expectedParamsVersion: 1 });
    await expectParity(w, w.team, "OpenWhilePaused", { openingUsd: 0n, expectedParamsVersion: 1 });
    expectOk(await send(w, [await I.resumeEntriesIx(w.admin)]));
    await expectParity(w, w.creator, "accepted", { expectedParamsVersion: 1 });
    await expectParity(w, w.team, "accepted", { openingUsd: 0n, maxLamports: 0n, expectedParamsVersion: 1 });
  });
});
