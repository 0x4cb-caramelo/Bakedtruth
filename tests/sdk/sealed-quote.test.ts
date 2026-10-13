/**
 * Purpose: the SDK's sealed-entry charge and quote (Sprint 15; TP 3.4.16) on the captured SOL/USD account: US$ at its
 *          price less its confidence, rounded up toward Brot, split by `opening_prize_bps` (the entry rounds down, the
 *          fee is the rest); the quote's `maxLamports` a margin above the charge; the opening's two refusals under the
 *          sealed entry's own codes, and the SOL/USD account's under row 7's. Needs no binary.
 *          Filter: `bun test tests/ -t "the sealed entry's charge and quote"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { describe, expect, test } from "bun:test";

import { chargeSealedEntry, isRefusal, SOL_USD_ACCOUNT, sealedEntryQuote, type OpeningParams } from "@brot/sdk/read";

import { DEFAULT_PARAMS, openingLamports, SOL_CHARGED } from "../brot/flows";
import * as P from "../brot/program";
import { fixtureBytes } from "../brot/readers";
import { PRICE_OFFSETS, START_TIME } from "../brot/setup";

const PARAMS: OpeningParams = {
  openingFeeUsd: DEFAULT_PARAMS.opening_fee_usd,
  openingPrizeBps: DEFAULT_PARAMS.opening_prize_bps,
  maxPriceAge: DEFAULT_PARAMS.max_price_age,
  maxPriceConfBps: DEFAULT_PARAMS.max_price_conf_bps,
};
const clock = { unixTimestamp: START_TIME, slot: 1n };

/** The captured SOL/USD account, published 5 s before the clock, with any field changed. */
function solUsd(change: { publishTime?: bigint; owner?: string } = {}) {
  const data = new Uint8Array(fixtureBytes("pyth-sol-usd-devnet"));
  new DataView(data.buffer).setBigInt64(PRICE_OFFSETS.publishTime, change.publishTime ?? START_TIME - 5n, true);
  return { address: SOL_USD_ACCOUNT as string, owner: change.owner ?? P.PYTH_RECEIVER_ID, data };
}

const refusal = (run: () => unknown) => {
  try {
    run();
    return "charged";
  } catch (error) {
    if (isRefusal(error)) return error.errorName;
    throw error;
  }
};

describe("the sealed entry's charge and quote", () => {
  test("US$ at the price less its confidence, rounded toward Brot, split 90/10", () => {
    for (const usd of [500n, 501n, 777n, 5_000n, 123_456n]) {
      const paid = openingLamports(usd, SOL_CHARGED);
      const entry = (paid * 9_000n) / 10_000n;
      const charge = chargeSealedEntry({ params: PARAMS, entryUsd: usd, maxLamports: paid, solUsd: solUsd(), clock });
      expect(charge).toMatchObject({ paid, entry, prize: entry, fee: paid - entry, price: SOL_CHARGED, exponent: -8 });
    }
  });

  test("the quote: the charge now, and maxLamports one percent above it, rounded up", () => {
    const paid = openingLamports(500n, SOL_CHARGED);
    const quote = sealedEntryQuote({ params: PARAMS, entryUsd: 500n, solUsd: solUsd(), clock });
    expect(quote).toMatchObject({ entryUsd: 500n, paid, marginBps: 100 });
    expect(quote.maxLamports).toBe(paid + (paid * 100n + 9_999n) / 10_000n);
    expect(quote.entry + quote.fee).toBe(paid);
  });

  test("the floor and max_lamports refuse under the sealed entry's codes, the SOL/USD account under row 7's", () => {
    const paid = openingLamports(500n, SOL_CHARGED);
    const charge =
      (entryUsd: bigint, maxLamports = paid, account = solUsd()) =>
      () =>
        chargeSealedEntry({ params: PARAMS, entryUsd, maxLamports, solUsd: account, clock });
    expect(refusal(charge(499n))).toBe("SealedEntryBelowFloor");
    expect(refusal(charge(0n))).toBe("SealedEntryBelowFloor");
    expect(refusal(charge(500n, paid - 1n))).toBe("SealedEntryAboveMaxLamports");
    expect(refusal(charge(500n, paid, solUsd({ publishTime: START_TIME - 121n })))).toBe("SolUsdStale");
    expect(refusal(charge(500n, paid, solUsd({ owner: P.PYTH_LEGACY_RECEIVER_ID })))).toBe("SolUsdWrongOwner");
    expect(refusal(charge(500n, paid, { ...solUsd(), address: P.BTC_USD_ACCOUNT }))).toBe("SolUsdAccountMismatch");
    expect(refusal(() => sealedEntryQuote({ params: PARAMS, entryUsd: 1n, solUsd: solUsd(), clock }))).toBe(
      "SealedEntryBelowFloor",
    );
  });
});
