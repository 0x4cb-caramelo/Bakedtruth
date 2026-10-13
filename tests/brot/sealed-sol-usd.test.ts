/**
 * Purpose: a sealed entry on a campaign that reads SOL/USD itself (Sprint 15; red team L5), the commonest one: slot 5
 *          (the metric account, read by the join lock) and slot 7 (the SOL/USD account the entry is priced at) hold
 *          the same sponsored account. It is read twice, read-only, and the entry is charged as on any campaign; when
 *          that one account is stale, the join lock speaks first (`JoinPriceStale`), before the price
 *          (`SolUsdStale`), in the program's order, and nothing moves.
 *          Filter: `bun test tests/ -t "a sealed entry on a SOL/USD campaign"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";

import { readCampaign, SOL_CHARGED, SOL_PRICE } from "./flows";
import * as P from "./program";
import { sealedCharge, sealedEntry, sealedEntryIx, sealedState, sealedWorld } from "./sealed-support";
import { balance, expectError, expectOk, send, setPriceAccount, START_TIME } from "./setup";

describe("a sealed entry on a SOL/USD campaign", () => {
  test("a sealed entry on a SOL/USD campaign: one account in the metric and SOL/USD slots, for the lock and the price", async () => {
    const { w, campaign, vault, sponsor } = await sealedWorld({
      feedId: P.SOL_USD_FEED_ID,
      target: (SOL_PRICE * 11n) / 10n,
    });
    expect(readCampaign(w, campaign).metric_account).toBe(P.SOL_USD_ACCOUNT);
    const ix = await sealedEntryIx(w, sponsor, campaign, { side: P.Side.No });
    expect([ix.accounts![5].address, ix.accounts![7].address]).toEqual([P.SOL_USD_ACCOUNT, P.SOL_USD_ACCOUNT]);
    const before = balance(w, vault);
    const sent = expectOk(await send(w, [ix]));
    const { paid, entry, fee } = sealedCharge(500n);
    expect(sent.events.map((e) => e.name)).toEqual(["EntryAdded", "SealedFeeHeld"]);
    expect(sent.events[1].data).toMatchObject({ paid, entry_lamports: entry, fee_lamports: fee, price: SOL_CHARGED });
    expect([balance(w, vault) - before, readCampaign(w, campaign).pool_no]).toEqual([entry, entry]);

    // Stale, the one account is refused by the join lock, which reads it first, and nothing moves.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime: START_TIME - 121n });
    const kept = await sealedState(w, sponsor.address, campaign);
    expectError(await sealedEntry(w, sponsor, campaign, { side: P.Side.No }), "JoinPriceStale");
    expect(await sealedState(w, sponsor.address, campaign)).toEqual(kept);
  });
});
