/**
 * Purpose: the join lock (BR-06): once the reader of the campaign's kind knows the outcome, a join is
 *          refused with `OutcomeKnowable` and nothing moves; one step short of it, the join passes.
 *          Price `Above` and `Below` (price ± confidence reaches the target), `SupplyAtMost`,
 *          `DammV2LockedAtLeast`, the two epoch kinds (the measured epoch has started), and where the
 *          lock sits among the join's checks.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane E. Needs the SBF build with the readers of lanes A, B
 *          and C: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";
import { address, type Address } from "@solana/kit";

import { injectCampaign } from "./campaigns";
import { anyAddress } from "./checks-support";
import { BTC_PRICE, initConfig, join, newId, readCampaign } from "./flows";
import * as I from "./instructions";
import { offsetOf } from "./layouts";
import { BTC_CONF } from "./opening";
import * as P from "./program";
import * as R from "./readers";
import { createWorld, expectOk, fundedWallet, now, send, setPriceAccount, type World } from "./setup";
import { CAMPAIGN } from "./structs";
import { freshPrice, joinWorld, MIN_ENTRY, refusedJoin, rewrite } from "./join-campaign-support";

const SOL = P.SOL;
const yes = (amount: bigint, expectedEntryTotal = 0n): I.JoinArgs => ({ side: P.Side.Yes, amount, expectedEntryTotal });
/** A refused first join: the baker had no Entry, and still has none. */
const noEntry = (kept: { entry: { owner: Address | null } }) => expect(kept.entry.owner).toBeNull();

/** The captured BTC/USD account at its sponsored address with `change`, published 5 s ago unless `change` says. */
const btc = (w: World, change: Parameters<typeof setPriceAccount>[3]) =>
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: now(w.client) - 5n, ...change });

/** A world with the founder's config and a campaign of `kind` written in on `metric`; entries close in 6 days. */
async function injected(kind: number, metric: Address, target: bigint, epoch = 0n) {
  const w = await createWorld();
  await initConfig(w);
  const t = now(w.client);
  const times = { opensAt: t, entriesCloseAt: t + 6n * P.DAY, deadlineAt: t + 7n * P.DAY };
  const creator = await anyAddress();
  const { campaign } = await injectCampaign(w.client, { id: newId(), kind, metric, target, creator, epoch, ...times });
  return { w, campaign };
}

const U64 = (1n << 64n) - 1n;
const LOCKED_AT = R.DAMM_OFFSETS.permanentLockLiquidity;
/** The DAMM v2 pool's `permanent_lock_liquidity` (u128) as captured. */
const CAPTURED_LOCKED = (() => {
  const view = new DataView(R.fixtureBytes("damm-sol-usdc").buffer);
  return view.getBigUint64(LOCKED_AT, true) | (view.getBigUint64(LOCKED_AT + 8, true) << 64n);
})();
/** An epoch just after the captured stake pool's last update (1,047), and mainnet's epoch length. */
const MEASURED = 1_048n;
const SLOTS_PER_EPOCH = 432_000n;

describe("join refuses once the outcome is knowable", () => {
  const touches = [
    ["Above", P.Direction.Above, (BTC_PRICE * 11n) / 10n, 1n],
    ["Below", P.Direction.Below, (BTC_PRICE * 9n) / 10n, -1n],
  ] as const;
  for (const [name, direction, target, sign] of touches) {
    test(`price ${name}: refused once price ± confidence reaches the target; one tick short, it passes`, async () => {
      const { w, campaign } = await joinWorld({ direction, target });
      expect(readCampaign(w, campaign).target).toBe(target);
      const a = await fundedWallet(w);
      // The band's edge on the target; the price itself on it; the price unmoved, with a confidence wide enough.
      const edge = target - sign * BTC_CONF;
      for (const change of [
        { price: edge },
        { price: target },
        { price: BTC_PRICE, conf: sign * (target - BTC_PRICE) },
      ]) {
        btc(w, change);
        noEntry(await refusedJoin(w, a, campaign, yes(SOL), "OutcomeKnowable"));
      }
      btc(w, { price: edge - sign });
      expectOk(await join(w, a, campaign, yes(SOL)));
      // A baker already in is locked out as well once the band reaches the target.
      btc(w, { price: edge });
      await refusedJoin(w, a, campaign, yes(SOL, SOL), "OutcomeKnowable");
    });
  }

  test("SupplyAtMost: refused once the supply is at or below the target; one unit above, it passes", async () => {
    const mint = await anyAddress();
    const target = 1_000_000_000_000n;
    const { w, campaign } = await injected(P.ReaderKind.SupplyAtMost, mint, target);
    const supply = (s: bigint, owner: Address = P.SPL_TOKEN_PROGRAM_ID) =>
      R.setRawAccount(w.client, mint, R.mintBytes({ supply: s, mintAuthority: null }), owner);
    const a = await fundedWallet(w);
    for (const s of [target, target - 1n, 0n]) {
      supply(s);
      noEntry(await refusedJoin(w, a, campaign, yes(SOL), "OutcomeKnowable"));
    }
    supply(target + 1n);
    expectOk(await join(w, a, campaign, yes(SOL)));
    // An account the reader cannot read refuses the join with the reader's own error.
    supply(target + 1n, P.TOKEN_2022_PROGRAM_ID);
    await refusedJoin(w, a, campaign, yes(SOL, SOL), "ReaderWrongOwner");
  });

  test("DammV2LockedAtLeast: refused once the locked liquidity reaches the target; one unit short, it passes", async () => {
    const pool = address(R.FIXTURES["damm-sol-usdc"].address);
    const target = 2n * CAPTURED_LOCKED;
    const { w, campaign } = await injected(P.ReaderKind.DammV2LockedAtLeast, pool, target);
    const locked = (v: bigint) =>
      R.setFixture(w.client, "damm-sol-usdc", {
        mutate: (_, view) => {
          view.setBigUint64(LOCKED_AT, v & U64, true);
          view.setBigUint64(LOCKED_AT + 8, v >> 64n, true);
        },
      });
    const a = await fundedWallet(w);
    for (const v of [target, target + 1n]) {
      locked(v);
      noEntry(await refusedJoin(w, a, campaign, yes(SOL), "OutcomeKnowable"));
    }
    locked(target - 1n);
    expectOk(await join(w, a, campaign, yes(SOL)));
  });

  const epochKinds = [
    ["StakePoolTvlAtLeast", P.ReaderKind.StakePoolTvlAtLeast, "stakepool-jitosol"],
    ["StakeAtLeast", P.ReaderKind.StakeAtLeast, "vote-mainnet-top"],
  ] as const;
  for (const [name, kind, fixture] of epochKinds) {
    test(`${name}: passes in the epoch before the measured one; refused once it starts`, async () => {
      const metric = address(R.FIXTURES[fixture].address);
      const { w, campaign } = await injected(kind, metric, 20_000_000n * SOL, MEASURED);
      R.setFixture(w.client, fixture);
      R.setMainnetEpochSchedule(w.client);
      const [a, b] = [await fundedWallet(w), await fundedWallet(w)];
      // The last slot of the epoch before: the outcome is still open.
      R.setClock(w.client, { epoch: MEASURED - 1n, slot: MEASURED * SLOTS_PER_EPOCH - 1n });
      expectOk(await join(w, a, campaign, yes(SOL)));
      for (const epoch of [MEASURED, MEASURED + 1n]) {
        R.setClock(w.client, { epoch, slot: epoch * SLOTS_PER_EPOCH });
        noEntry(await refusedJoin(w, b, campaign, yes(SOL), "OutcomeKnowable"));
        await refusedJoin(w, a, campaign, yes(SOL, SOL), "OutcomeKnowable");
      }
    });
  }

  test("the lock runs after the metric account, Open and the entry close, before the pause and the minimum", async () => {
    const { w, team, campaign, metric } = await joinWorld();
    const c = readCampaign(w, campaign);
    const baker = await fundedWallet(w);
    const small = { side: P.Side.Yes, amount: MIN_ENTRY - 1n };
    btc(w, { price: c.target as bigint }); // knowable from here on
    await refusedJoin(w, baker, campaign, { ...small, metric: P.SOL_USD_ACCOUNT }, "MetricAccountMismatch");
    const status = (s: number) => rewrite(w, campaign, (data) => (data[offsetOf(CAMPAIGN, "status")] = s));
    status(P.Status.InReview);
    await refusedJoin(w, baker, campaign, small, "CampaignNotOpen");
    status(P.Status.Open);
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    noEntry(await refusedJoin(w, baker, campaign, small, "OutcomeKnowable"));
    // An account the reader refuses is the reader's own refusal, also before the pause.
    btc(w, { price: c.target as bigint, publishTime: now(w.client) - 121n });
    await refusedJoin(w, baker, campaign, small, "JoinPriceStale");
    freshPrice(w, metric, c.entries_close_at as bigint);
    await refusedJoin(w, baker, campaign, small, "EntriesClosed");
  });
});
