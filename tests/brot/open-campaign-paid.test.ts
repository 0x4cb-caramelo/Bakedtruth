/**
 * Purpose: the paid opening (TP section 3.4.16, I14): US$500 in lamports at the captured Pyth
 *          SOL/USD price, all of it into the vault, 90% bookkept as the prize and 10% held as the
 *          opening fee, the creator charged exactly that plus both rents; more US$ make a larger
 *          prize at the same 90/10; and a team key that adds a prize pays like any wallet [AC].
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio), lane D. Runs after the SBF build (Wave 2).
 */
import { describe, expect, test } from "bun:test";

import { BTC_PRICE, openingLamports, readCampaign, readConfig, SOL_PRICE } from "./flows";
import { CAMPAIGN_LEN, FRESH, openingWorld, rents, split, tryOpen, VAULT_LEN } from "./opening";
import * as P from "./program";
import { balance, expectError, expectOk, START_TIME, type Event } from "./setup";

/** What a paid opening by `creator` of the default campaign stores and announces. */
function paidOpening(creator: string, usd: bigint, team = false) {
  const { paid, prize, fee } = split(openingLamports(usd, SOL_PRICE));
  return {
    creator,
    creator_is_team: team,
    kind: P.ReaderKind.PriceTouch,
    direction: P.Direction.Above,
    feed_id: P.BTC_USD_FEED_ID,
    metric_account: P.BTC_USD_ACCOUNT,
    target: (BTC_PRICE * 11n) / 10n,
    price_exponent: -8,
    max_age: 120,
    template_version: 1,
    opens_at: START_TIME,
    entries_close_at: START_TIME + 6n * P.DAY,
    deadline_at: START_TIME + 7n * P.DAY,
    fee_bps: 1_000,
    one_sided_fee_bps: 100,
    creator_share_bps: team ? 0 : 100,
    opening_usd: usd,
    opening_paid_lamports: paid,
    opening_price: SOL_PRICE,
    opening_price_exponent: -8,
    opening_price_publish_time: FRESH,
    prize_lamports: prize,
    opening_fee_lamports: fee,
  };
}

const opened = (events: Event[]) => events.filter((e) => e.name === "CampaignOpened");

describe("opening charges 500 dollars at the pyth price", () => {
  test("the exact lamports at the captured SOL/USD price, into the vault, 90/10 bookkept (I14)", async () => {
    const w = await openingWorld();
    const before = balance(w, w.creator.address);
    const { sent, args, campaign, vault } = await tryOpen(w, w.creator);
    const ok = expectOk(sent);
    const expected = paidOpening(w.creator.address, 500n);
    const rent = rents(w);

    // ceil(500 × 10^17 ÷ 11,921,844,516) = 4,193,981,891 lamports: 3,774,583,701 prize, 419,398,190 fee.
    expect(expected).toMatchObject({ opening_paid_lamports: 4_193_981_891n, prize_lamports: 3_774_583_701n });
    expect(expected.opening_fee_lamports).toBe(419_398_190n);
    expect(before - balance(w, w.creator.address)).toBe(expected.opening_paid_lamports + rent.campaign + rent.vault);
    expect(balance(w, vault)).toBe(rent.vault + expected.opening_paid_lamports);
    expect(balance(w, campaign)).toBe(rent.campaign);

    const stored = readCampaign(w, campaign);
    expect(stored).toMatchObject({ ...expected, tag: 2, version: 1, id: args.id, rent_payer: w.creator.address });
    expect(stored).toMatchObject({ status: P.Status.Open, outcome: 0, pool_yes: 0n, pool_no: 0n, event_seq: 1n });
    expect((await readConfig(w)).open_campaigns).toBe(1);

    const events = opened(ok.events);
    expect(events).toHaveLength(1);
    expect(events[0].data).toMatchObject({ ...expected, campaign, seq: 0n, id: args.id });

    const cu = ok.computeUnits;
    console.log(`T19: Campaign ${CAMPAIGN_LEN} bytes, rent ${rent.campaign} lamports (LiteSVM)`);
    console.log(`T19: vault ${VAULT_LEN} bytes, rent ${rent.vault} lamports (LiteSVM)`);
    console.log(`T19: a paid opening (US$500, BTC/USD campaign) used ${cu} compute units`);
  });

  test("US$1,000 makes a larger prize at the same 90/10", async () => {
    const w = await openingWorld();
    const { sent, campaign, vault } = await tryOpen(w, w.creator, { openingUsd: 1_000n });
    expectOk(sent);
    const expected = paidOpening(w.creator.address, 1_000n);
    const base = paidOpening(w.creator.address, 500n);
    // `expected` splits the lamports of US$1,000 at 9,000 bps, as for US$500.
    expect(readCampaign(w, campaign)).toMatchObject(expected);
    expect(balance(w, vault)).toBe(rents(w).vault + expected.opening_paid_lamports);
    expect(expected.prize_lamports).toBeGreaterThan(base.prize_lamports);
  });

  test("max_lamports at the price opens, one lamport below is refused (T25)", async () => {
    const w = await openingWorld();
    const price = openingLamports(500n, SOL_PRICE);
    expectError((await tryOpen(w, w.creator, { maxLamports: price - 1n })).sent, "OpeningAboveMaxLamports");
    const atPrice = await tryOpen(w, w.creator, { maxLamports: price });
    expectOk(atPrice.sent);
    expect(readCampaign(w, atPrice.campaign).opening_paid_lamports).toBe(price);
  });
});

describe("team opening with a prize", () => {
  test("a team key passing opening_usd pays like any wallet, 90/10, with a zero creator share [AC]", async () => {
    const w = await openingWorld();
    const before = balance(w, w.team.address);
    const { sent, campaign, vault } = await tryOpen(w, w.team);
    const ok = expectOk(sent);
    const expected = paidOpening(w.team.address, 500n, true);
    const rent = rents(w);
    expect(before - balance(w, w.team.address)).toBe(expected.opening_paid_lamports + rent.campaign + rent.vault);
    expect(balance(w, vault)).toBe(rent.vault + expected.opening_paid_lamports);
    expect(readCampaign(w, campaign)).toMatchObject({ ...expected, rent_payer: w.team.address });
    expect(opened(ok.events)[0].data).toMatchObject({ ...expected, creator_share_bps: 0, creator_is_team: true });
  });

  test("a team key that adds a prize meets the same floor and the same price checks", async () => {
    const w = await openingWorld();
    expectError((await tryOpen(w, w.team, { openingUsd: 499n })).sent, "OpeningUsdBelowFee");
    const price = openingLamports(500n, SOL_PRICE);
    expectError((await tryOpen(w, w.team, { maxLamports: price - 1n })).sent, "OpeningAboveMaxLamports");
  });
});
