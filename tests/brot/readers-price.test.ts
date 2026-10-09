/**
 * Purpose: the price reader on the captured mainnet accounts in LiteSVM (TP section 3.4.8): an
 *          opening checked and priced on them as captured, a campaign left on them voided as a
 *          stale feed after its window, and their updates proving YES from any address.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane C. Runs after the SBF build (lanes C and D).
 */
import { describe, expect, test } from "bun:test";

import { openedCampaign, readCampaign } from "./flows";
import { openingWorld, type OpeningWorld } from "./opening";
import { capturedPrice, capturedProof, recorded, resolveWith } from "./price-support";
import * as P from "./program";
import { setFixture } from "./readers";
import { setTime } from "./setup";

const BTC_MAINNET = capturedPrice("pyth-btc-usd-mainnet");
const SOL_MAINNET = capturedPrice("pyth-sol-usd-mainnet");

/** A world whose sponsored SOL/USD and BTC/USD accounts are the captured mainnet ones, 7 s after them. */
async function mainnetWorld() {
  const w = await openingWorld();
  setFixture(w.client, "pyth-sol-usd-mainnet");
  setFixture(w.client, "pyth-btc-usd-mainnet");
  setTime(w.client, BTC_MAINNET.publishTime + 7n);
  return w;
}

/** A world whose sponsored accounts are the captured devnet ones, unchanged, 7 s after them. */
async function devnetWorld() {
  const w = await openingWorld();
  setFixture(w.client, "pyth-sol-usd-devnet");
  setFixture(w.client, "pyth-btc-usd-devnet");
  return w;
}

/** Opens a `Below` campaign on the devnet bytes, then proves it with the mainnet update of the feed. */
async function provenByMainnet(w: OpeningWorld, feed: "sol" | "btc", target: bigint) {
  const feedId = feed === "sol" ? P.SOL_USD_FEED_ID : P.BTC_USD_FEED_ID;
  const metric = feed === "sol" ? P.SOL_USD_ACCOUNT : P.BTC_USD_ACCOUNT;
  const { campaign } = await openedCampaign(w, w.creator, { feedId, direction: P.Direction.Below, target });
  const proof = await capturedProof(w, `pyth-${feed}-usd-mainnet`);
  // The mainnet updates were published three and a half days after the devnet ones.
  const captured = feed === "sol" ? SOL_MAINNET : BTC_MAINNET;
  setTime(w.client, captured.publishTime + 30n);
  return { proof, captured, ...recorded(w, campaign, await resolveWith(w, campaign, proof, metric)) };
}

describe("readers match fixtures: price", () => {
  test("an opening reads the mainnet SOL/USD and BTC/USD accounts as captured", async () => {
    const w = await mainnetWorld();
    const { campaign } = await openedCampaign(w, w.creator, { target: (BTC_MAINNET.price * 11n) / 10n });
    expect(readCampaign(w, campaign)).toMatchObject({
      metric_account: P.BTC_USD_ACCOUNT,
      price_exponent: -8,
      opening_price_publish_time: SOL_MAINNET.publishTime,
    });
  });

  test("a campaign left on the captured mainnet account voids as a stale feed after its window", async () => {
    const w = await mainnetWorld();
    const { campaign, args } = await openedCampaign(w, w.creator, { target: (BTC_MAINNET.price * 11n) / 10n });
    setTime(w.client, args.deadlineAt + P.PROOF_DELAY_SECONDS + 1n);
    const { campaign: c, event } = recorded(w, campaign, await resolveWith(w, campaign));
    expect(c).toMatchObject({ outcome: P.Outcome.Void, void_reason: P.VoidReason.StaleFeed });
    expect(c.observed_value).toBe(BTC_MAINNET.price);
    expect(event).toMatchObject({
      read_account: P.BTC_USD_ACCOUNT,
      observed_value: BTC_MAINNET.price,
      publish_time: BTC_MAINNET.publishTime,
      posted_slot: BTC_MAINNET.postedSlot,
    });
  });

  test("the captured mainnet BTC/USD update proves YES from any address", async () => {
    // Opened at 85,212.34 US$ towards 83,000; the mainnet update reads 82,064.75 ± 28.05.
    const { proof, captured, campaign, event } = await provenByMainnet(await devnetWorld(), "btc", 8_300_000_000_000n);
    expect(campaign).toMatchObject({ outcome: P.Outcome.Yes, observed_value: captured.price });
    expect(event).toMatchObject({
      read_account: proof,
      publish_time: captured.publishTime,
      posted_slot: captured.postedSlot,
    });
  });

  test("the captured mainnet SOL/USD update proves YES for a campaign on SOL/USD itself", async () => {
    // Opened at 119.22 US$ towards 115; the mainnet update reads 110.00 ± 0.03.
    const { proof, captured, campaign, event } = await provenByMainnet(await devnetWorld(), "sol", 11_500_000_000n);
    expect(campaign).toMatchObject({ outcome: P.Outcome.Yes, observed_value: captured.price });
    expect(event).toMatchObject({ read_account: proof, publish_time: captured.publishTime });
  });
});
