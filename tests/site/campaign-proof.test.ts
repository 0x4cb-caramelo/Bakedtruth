/**
 * Purpose: the campaign page's proof (BR-23) for each kind, from the program's own campaign accounts and real captured
 *          bytes of the accounts they read: the value read now through the SDK's readers, "if read now", and on a
 *          price campaign the price facts the join applies (fresh by the campaign's maximum age, the 1% buffer). A
 *          wrong owner or a missing account is shown as such, never as a value.
 *          Filter: `bun test tests/ -t "the proof a campaign page shows"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { decodeCampaign } from "@brot/sdk/read";

import { proofOf } from "../../app/features/campaign-page/proof";
import { BTC_PRICE } from "../brot/flows";
import * as P from "../brot/program";
import * as R from "../brot/readers";
import {
  at,
  dammCampaign,
  EPOCH,
  PRICE_TARGET,
  priceCampaign,
  resolveWorld,
  setBtcPrice,
  stakePoolCampaign,
  supplyCampaign,
  voteCampaign,
} from "../brot/resolve-support";
import { START_TIME, type World } from "../brot/setup";
import { chainOf, rawOf } from "./support";

const proofIn = (w: World, campaign: Address) => {
  const c = decodeCampaign(rawOf(w, campaign));
  return proofOf(c, rawOf(w, c.metricAccount), chainOf(w));
};

describe("the proof a campaign page shows", () => {
  test("a price campaign: the price read now, fresh by the campaign's maximum age, and if read now", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = proofIn(w, c.campaign);
    expect(proof).toMatchObject({
      kind: "price",
      value: BTC_PRICE,
      target: PRICE_TARGET,
      comparator: "≥",
      ifReadNow: "NO",
      problem: null,
    });
    expect(proof.price).toMatchObject({ symbol: "BTC/USD", exponent: -8, maxAge: 120, fresh: true, tooClose: false });
    const published = proof.price!.publishTime;
    expect(proof.price?.ageSeconds).toBe(START_TIME - published);
    // Past the campaign's 120 s, a join would not take this price (L-22: "no fresh price").
    at(w, published + 120n);
    expect(proofIn(w, c.campaign).price).toMatchObject({ fresh: true, ageSeconds: 120n });
    at(w, published + 121n);
    expect(proofIn(w, c.campaign).price).toMatchObject({ fresh: false, ageSeconds: 121n });
  });

  test("a price within 1% of the target makes joins wait; the whole band past it reads YES", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    setBtcPrice(w, c.metric, (PRICE_TARGET * 995n) / 1_000n, START_TIME - 3n);
    expect(proofIn(w, c.campaign).price?.tooClose).toBe(true);
    setBtcPrice(w, c.metric, PRICE_TARGET, START_TIME - 3n);
    expect(proofIn(w, c.campaign).ifReadNow).toBe("YES");
  });

  test("an account under another owner, or none, is a problem and never a value", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    R.setRawAccount(w.client, c.metric, rawOf(w, c.metric).data, P.SPL_TOKEN_PROGRAM_ID);
    expect(proofIn(w, c.campaign)).toMatchObject({ value: null, problem: "ReaderWrongOwner" });
    const campaign = decodeCampaign(rawOf(w, c.campaign));
    expect(proofOf(campaign, null, chainOf(w))).toMatchObject({ value: null, problem: "missing", ifReadNow: null });
  });

  test("a burn reads the supply (at most the target is YES); a lock reads the liquidity locked for good", async () => {
    const w = await resolveWorld();
    const burn = await supplyCampaign(w, 1_000_000n, 990_000n);
    expect(proofIn(w, burn.campaign)).toMatchObject({
      kind: "burn",
      value: 1_000_000n,
      comparator: "≤",
      ifReadNow: "NO",
    });
    R.setRawAccount(
      w.client,
      burn.metric,
      R.mintBytes({ supply: 980_000n, mintAuthority: null }),
      P.SPL_TOKEN_PROGRAM_ID,
    );
    expect(proofIn(w, burn.campaign).ifReadNow).toBe("YES");
    const lock = await dammCampaign(w, 5_000n, 4_000n);
    expect(proofIn(w, lock.campaign)).toMatchObject({ kind: "lock", value: 5_000n, comparator: "≥", ifReadNow: "YES" });
  });

  test("the epoch kinds decide nothing before the measured epoch's snapshot", async () => {
    const w = await resolveWorld();
    const measured = await stakePoolCampaign(w, { updated: EPOCH, snapshot: 5n * P.SOL, target: 4n * P.SOL });
    expect(proofIn(w, measured.campaign)).toMatchObject({
      kind: "pool",
      value: 5n * P.SOL,
      ifReadNow: "YES",
      measuredEpoch: EPOCH,
    });
    const before = await stakePoolCampaign(w, { updated: EPOCH - 1n, snapshot: 5n * P.SOL, target: 4n * P.SOL });
    expect(proofIn(w, before.campaign)).toMatchObject({ kind: "pool", ifReadNow: null });
    const stake = await voteCampaign(w, P.SOL);
    expect(proofIn(w, stake.campaign)).toMatchObject({
      kind: "stake",
      value: null,
      ifReadNow: null,
      measuredEpoch: EPOCH,
    });
  });
});
