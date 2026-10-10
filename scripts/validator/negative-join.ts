/**
 * Purpose: the refusals of `user_join_campaign` on a local validator, one case per error, as the LiteSVM suites
 *          test them (tests/brot/join-campaign-refuses.test.ts, join-campaign-lock.test.ts, join-campaign-price.test.ts):
 *          the side, the minimum, the retry guard, the return bound, the pause, the price's age and exponent, the
 *          join lock and its buffer, the metric slot, and a campaign not open or closed to entries.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { type Address } from "@solana/kit";

import { injectCampaign } from "../../tests/brot/campaigns";
import { BTC_PRICE } from "../../tests/brot/flows";
import * as I from "../../tests/brot/instructions";
import * as P from "../../tests/brot/program";

import { funded, type Env } from "./negative-baselines";
import { base } from "./negative-world";
import { open, type RuleCase } from "./negative-open";
import { captured, writePrice } from "./negative-price";
import { clock, send } from "./rpc";
import { refreshPrices, SOL } from "./world";

const TARGET = (BTC_PRICE * 11n) / 10n;
const BTC = captured("btc");
let campaign: Address | null = null;

/** A paid BTC/USD campaign (above 110% of the captured price) to join; opened once for the run. */
async function joinable(env: Env): Promise<Address> {
  if (campaign) return campaign;
  const id = 12_000_000n;
  const sent = await open(env, { id });
  if (!sent.ok) throw new Error(`the campaign to join did not open: ${sent.error}`);
  return (campaign = await P.campaignPda(id));
}

/** A first join of a fresh baker with `a`, on `target` (the paid campaign unless given). */
async function join(env: Env, a: Partial<I.JoinArgs> = {}, slots: { campaign?: Address; metric?: Address } = {}) {
  const baker = await funded(env.rpc);
  const at = slots.campaign ?? (await joinable(env));
  const args = { side: P.Side.Yes, amount: SOL / 10n, ...a };
  return send(env.rpc, env.payer, [await I.joinCampaignIx(baker, at, slots.metric ?? P.BTC_USD_ACCOUNT, args)]);
}

const price = (name: string, change: Parameters<typeof writePrice>[2]): RuleCase => ({
  name,
  run: async (env) => {
    await joinable(env);
    await writePrice(env.rpc, "btc", change);
    const sent = await join(env);
    await refreshPrices(env.rpc);
    return sent;
  },
});

/** A price campaign written in `status` with entries closing at `closeIn` seconds from now. */
async function injected(env: Env, status: number, closeIn: bigint) {
  const t = (await clock(env.rpc)).unixTimestamp;
  const c = await base(env.rpc, { status, entriesCloseAt: t + closeIn, metric: P.BTC_USD_ACCOUNT, target: TARGET });
  const { campaign: at } = await injectCampaign(env.sw.w.client, c);
  await env.sw.flush();
  return at;
}

export const JOIN_RULES: RuleCase[] = [
  { name: "InvalidSide", run: (env) => join(env, { side: 2 }) },
  { name: "BelowCampaignMinEntry", run: (env) => join(env, { amount: 9_999_999n }) },
  { name: "EntryTotalMismatch", run: (env) => join(env, { expectedEntryTotal: 5n }) },
  { name: "ReturnBelowMinimum", run: (env) => join(env, { minReturnBps: 0xffff_ffff }) },
  {
    name: "JoinWhilePaused",
    run: async (env) => {
      await joinable(env);
      await send(env.rpc, env.payer, [await I.pauseEntriesIx(env.team[0])]);
      const sent = await join(env);
      await send(env.rpc, env.payer, [await I.resumeEntriesIx(env.admin)]);
      return sent;
    },
  },
  price("JoinPriceStale", { age: 1_000n }),
  price("PriceExponentChanged", { exponent: -7 }),
  price("OutcomeKnowable", { price: TARGET }),
  price("JoinBufferRefused", { price: TARGET - BTC.conf - 1n }),
  { name: "MetricAccountMismatch", run: (env) => join(env, {}, { metric: P.SOL_USD_ACCOUNT }) },
  {
    name: "CampaignNotOpen",
    run: async (env) => join(env, {}, { campaign: await injected(env, P.Status.InReview, P.DAY) }),
  },
  { name: "EntriesClosed", run: async (env) => join(env, {}, { campaign: await injected(env, P.Status.Open, -10n) }) },
];
