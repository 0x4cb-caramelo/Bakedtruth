/**
 * Purpose: the resolution table of TP section 3.4.6 as test cases, one per row and kind: `Yes`
 *          before the deadline, `No` after it, `met_late`, `Void` for `MissedWindow`,
 *          `UnreadableAccount` and `StaleFeed`, and `NotResolvableYet`; each recorded outcome checked
 *          in the campaign and in its `CampaignResolved` (`bun test tests/ -t "resolution table"`).
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane D. Needs the SBF build with the readers of lanes A to C.
 *
 * Campaigns are written straight into the world (`injectCampaign`), so no row depends on the
 * opening's rules for its kind. LiteSVM's npm package answers zero to `sol_get_epoch_stake`, so the
 * `StakeAtLeast` YES lives in lane B's Mollusk test, not here.
 */
import { describe, test } from "bun:test";

import { BTC_PRICE } from "./flows";
import * as P from "./program";
import { mintBytes, setRawAccount } from "./readers";
import {
  DEADLINE,
  EPOCH,
  PRICE_TARGET,
  anyAddress,
  at,
  dammCampaign,
  expectRefused,
  expectResolved,
  priceCampaign,
  resolveIx,
  resolveWorld,
  setBtcPrice,
  stakePoolCampaign,
  supplyCampaign,
  voteCampaign,
} from "./resolve-support";
import { START_TIME } from "./setup";

const { Yes, No, Void } = P.Outcome;
const { MissedWindow, UnreadableAccount, StaleFeed } = P.VoidReason;
/** A JitoSOL-sized target: ten million SOL. */
const POOL_TARGET = 10_000_000n * P.SOL;
const AFTER = DEADLINE + 10n;
/** Past the deadline's 60 s proof window, when a price campaign without a YES proof is decided. */
const AFTER_PROOFS = DEADLINE + 2n * P.PROOF_DELAY_SECONDS;

describe("resolution table", () => {
  test("Yes before the deadline: a mint's supply at or below the target", async () => {
    const w = await resolveWorld();
    const c = await supplyCampaign(w, 900_000n, 1_000_000n);
    await expectResolved(w, c, { outcome: Yes, observed: 900_000n });
  });

  test("Yes before the deadline: a DAMM v2 pool's locked liquidity at or above the target", async () => {
    const w = await resolveWorld();
    const locked = 5n * 10n ** 24n;
    const c = await dammCampaign(w, locked, 4n * 10n ** 24n);
    await expectResolved(w, c, { outcome: Yes, observed: locked });
  });

  test("Yes before the deadline: a fresh Full proof at its own address whose price − conf crosses", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    const proof = await anyAddress();
    const price = PRICE_TARGET + 1_000n;
    const published = setBtcPrice(w, proof, price, START_TIME - 10n);
    await expectResolved(w, c, { outcome: Yes, observed: price, read: proof, ...published }, proof);
  });

  test("Yes before the deadline: a stake pool's snapshot of the epoch at or above the target", async () => {
    const w = await resolveWorld();
    const snapshot = POOL_TARGET + P.SOL;
    const c = await stakePoolCampaign(w, { updated: EPOCH, snapshot, target: POOL_TARGET });
    await expectResolved(w, c, { outcome: Yes, observed: snapshot });
  });

  test("No after the deadline: a mint's supply still above the target", async () => {
    const w = await resolveWorld();
    const c = await supplyCampaign(w, 1_500_000n, 1_000_000n);
    at(w, AFTER);
    await expectResolved(w, c, { outcome: No, observed: 1_500_000n });
  });

  test("No after the deadline: no proof after the window, the sponsored feed fresh", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    at(w, AFTER_PROOFS);
    const published = setBtcPrice(w, P.BTC_USD_ACCOUNT, BTC_PRICE, DEADLINE - 10n);
    await expectResolved(w, c, { outcome: No, observed: BTC_PRICE, ...published });
  });

  test("No after the deadline: a stake pool's snapshot of the epoch below the target", async () => {
    const w = await resolveWorld();
    const snapshot = POOL_TARGET - P.SOL;
    const c = await stakePoolCampaign(w, { updated: EPOCH, snapshot, target: POOL_TARGET });
    at(w, AFTER);
    await expectResolved(w, c, { outcome: No, observed: snapshot });
  });

  test("met_late: a supply met but read only after the deadline is No, flagged", async () => {
    const w = await resolveWorld();
    const c = await supplyCampaign(w, 900_000n, 1_000_000n);
    at(w, AFTER);
    await expectResolved(w, c, { outcome: No, metLate: true, observed: 900_000n });
  });

  test("Void(MissedWindow): a stake pool whose snapshot of the epoch was overwritten", async () => {
    const w = await resolveWorld();
    const c = await stakePoolCampaign(w, { updated: EPOCH + 1n, snapshot: POOL_TARGET, target: POOL_TARGET });
    at(w, AFTER, EPOCH + 1n);
    await expectResolved(w, c, { outcome: Void, voidReason: MissedWindow });
  });

  test("Void(MissedWindow): a StakeAtLeast campaign read in the epoch after its own", async () => {
    const w = await resolveWorld();
    const c = await voteCampaign(w, 1_000n * P.SOL);
    at(w, AFTER, EPOCH + 1n);
    await expectResolved(w, c, { outcome: Void, voidReason: MissedWindow });
  });

  test("Void(MissedWindow): an epoch kind whose epoch had not started when the deadline passed", async () => {
    const w = await resolveWorld();
    const c = await stakePoolCampaign(w, { updated: EPOCH - 1n, snapshot: POOL_TARGET, target: POOL_TARGET });
    at(w, AFTER, EPOCH - 1n);
    await expectResolved(w, c, { outcome: Void, voidReason: MissedWindow });
  });

  test("Void(UnreadableAccount): a mint that no longer reads after the deadline, re-owned or cut short", async () => {
    const w = await resolveWorld();
    const reowned = await supplyCampaign(w, 900_000n, 1_000_000n);
    const short = await supplyCampaign(w, 900_000n, 1_000_000n);
    const bytes = mintBytes({ supply: 900_000n, mintAuthority: null });
    setRawAccount(w.client, reowned.metric, bytes, P.TOKEN_2022_PROGRAM_ID);
    setRawAccount(w.client, short.metric, bytes.slice(0, 81), P.SPL_TOKEN_PROGRAM_ID);
    at(w, AFTER);
    for (const c of [reowned, short]) {
      await expectResolved(w, c, { outcome: Void, voidReason: UnreadableAccount, observed: 0n });
    }
  });

  test("Void(StaleFeed): no proof after the window, the sponsored feed last updated before deadline − 600 s", async () => {
    const w = await resolveWorld();
    const c = await priceCampaign(w);
    at(w, AFTER_PROOFS);
    // The campaign's max_age (120 s) is under the floor, so the floor decides.
    const published = setBtcPrice(w, P.BTC_USD_ACCOUNT, BTC_PRICE, DEADLINE - P.STALE_FEED_MIN_SECONDS - 10n);
    await expectResolved(w, c, { outcome: Void, voidReason: StaleFeed, observed: BTC_PRICE, ...published });
  });

  test("NotResolvableYet: a supply not met before the deadline, nothing written", async () => {
    const w = await resolveWorld();
    const c = await supplyCampaign(w, 1_500_000n, 1_000_000n);
    await expectRefused(w, c, resolveIx(c), "NotResolvableYet");
  });

  test("NotResolvableYet: a stake pool before its epoch, nothing written", async () => {
    const w = await resolveWorld();
    const c = await stakePoolCampaign(w, { updated: EPOCH - 1n, snapshot: POOL_TARGET, target: POOL_TARGET });
    at(w, START_TIME, EPOCH - 1n);
    await expectRefused(w, c, resolveIx(c), "NotResolvableYet");
  });
});
