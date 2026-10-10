/**
 * Purpose: `checkJoin` against `user_join_campaign` (Sprint 05 closure review: a baker's money path had no parity
 *          harness). Each case of the program's join tests that the SDK can produce is fed to both, from the same
 *          world, with the same verdict: not Open; the entry close, at it and a second before; the pause; the
 *          campaign's minimum; the signed entry total, a replay included; the signed return at the SDK's estimate
 *          and one basis point above it (so the estimate is the program's, to the basis point); and the lock, a
 *          price that reaches the target and the buffer around it. The metric slot and the side byte stay out: the
 *          builders derive the one and encode only YES or NO.
 *          Filter: `bun test tests/ -t "checkJoin refuses what the program refuses"`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, expect, test } from "bun:test";
import type { Address, KeyPairSigner } from "@solana/kit";

import { checkJoin, decodeCampaign, decodeEntry, decodeGlobalConfig, errorName } from "@brot/sdk/read";

import type { BrotErrorName } from "../brot/errors";
import { BTC_PRICE, join, readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { freshPrice, joinWorld, MIN_ENTRY, rewrite } from "../brot/join-campaign-support";
import { offsetOf } from "../brot/layouts";
import { BTC_CONF } from "../brot/opening";
import * as P from "../brot/program";
import { expectOk, fundedWallet, now, send, setPriceAccount, type World } from "../brot/setup";
import { CAMPAIGN } from "../brot/structs";

const SOL = P.SOL;
const raw = (w: World, at: Address) => {
  const a = w.client.svm.getAccount(at);
  return a.exists ? { owner: a.programAddress as string, data: new Uint8Array(a.data) } : null;
};

/** The SDK's verdict on `a`, from what the world holds now, with the same signed values `flows.join` sends. */
async function sdkVerdict(w: World, baker: KeyPairSigner, campaign: Address, a: I.JoinArgs) {
  const c = decodeCampaign(raw(w, campaign)!);
  const entryRaw = raw(w, await P.entryPda(campaign, baker.address));
  const metric = raw(w, c.metricAccount as Address);
  const clock = w.client.svm.getClock();
  return checkJoin({
    campaign: c,
    config: decodeGlobalConfig(raw(w, await P.configPda())!),
    entry: entryRaw && entryRaw.data.length > 0 ? decodeEntry(entryRaw) : null,
    metric: {
      address: c.metricAccount,
      owner: metric?.owner ?? P.SYSTEM_PROGRAM_ID,
      data: metric?.data ?? new Uint8Array(),
    },
    chain: { unixTimestamp: clock.unixTimestamp, slot: clock.slot, epoch: clock.epoch },
    side: a.side,
    amount: a.amount,
    minReturnBps: a.minReturnBps ?? 0,
    expectedEntryTotal: a.expectedEntryTotal ?? 0n,
  });
}

/** Both sides on `a`, expecting `expected`; returns the SDK's verdict. */
async function parity(
  w: World,
  baker: KeyPairSigner,
  campaign: Address,
  expected: BrotErrorName | "accepted",
  a: I.JoinArgs,
) {
  const sdk = await sdkVerdict(w, baker, campaign, a);
  const sent = await join(w, baker, campaign, a);
  const program = sent.ok ? "accepted" : (errorName(sent.code ?? -1) ?? `code ${sent.code}`);
  expect({ program, sdk: sdk.ok ? "accepted" : sdk.refusal.errorName }).toEqual({ program: expected, sdk: expected });
  return sdk;
}

const yes = (amount: bigint, more: Partial<I.JoinArgs> = {}): I.JoinArgs => ({ side: P.Side.Yes, amount, ...more });
const no = (amount: bigint, more: Partial<I.JoinArgs> = {}): I.JoinArgs => ({ side: P.Side.No, amount, ...more });

describe("checkJoin refuses what the program refuses", () => {
  test("not Open; the entry close; the pause; the minimum", async () => {
    const { w, team, campaign, metric } = await joinWorld();
    const baker = await fundedWallet(w);
    await parity(w, baker, campaign, "BelowCampaignMinEntry", yes(MIN_ENTRY - 1n));
    await parity(w, baker, campaign, "BelowCampaignMinEntry", no(0n));
    await parity(w, baker, campaign, "accepted", yes(MIN_ENTRY));
    const closeAt = readCampaign(w, campaign).entries_close_at as bigint;
    freshPrice(w, metric, closeAt);
    await parity(w, baker, campaign, "EntriesClosed", yes(SOL, { expectedEntryTotal: MIN_ENTRY }));
    freshPrice(w, metric, closeAt - 1n);
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    await parity(w, baker, campaign, "JoinWhilePaused", yes(SOL, { expectedEntryTotal: MIN_ENTRY }));
    rewrite(w, campaign, (data) => (data[offsetOf(CAMPAIGN, "status")] = P.Status.InReview));
    await parity(w, baker, campaign, "CampaignNotOpen", yes(SOL, { expectedEntryTotal: MIN_ENTRY }));
  });

  test("the signed entry total, a replay included, and the signed return at the estimate", async () => {
    const { w, campaign } = await joinWorld();
    const [a, b] = [await fundedWallet(w), await fundedWallet(w)];
    await parity(w, a, campaign, "EntryTotalMismatch", yes(SOL, { expectedEntryTotal: SOL }));
    const first = await sdkVerdict(w, a, campaign, yes(SOL));
    if (!first.ok) throw new Error("the first join's estimate was refused");
    await parity(w, a, campaign, "ReturnBelowMinimum", yes(SOL, { minReturnBps: Number(first.estimateBps + 1n) }));
    await parity(w, a, campaign, "accepted", yes(SOL, { minReturnBps: Number(first.estimateBps) }));
    for (const replayed of [0n, SOL - 1n, SOL + 1n]) {
      await parity(w, a, campaign, "EntryTotalMismatch", yes(SOL, { expectedEntryTotal: replayed }));
    }
    const other = await sdkVerdict(w, b, campaign, no(3n * SOL));
    if (!other.ok) throw new Error("the other side's estimate was refused");
    await parity(w, b, campaign, "ReturnBelowMinimum", no(3n * SOL, { minReturnBps: Number(other.estimateBps + 1n) }));
    await parity(w, b, campaign, "accepted", no(3n * SOL, { minReturnBps: Number(other.estimateBps) }));
    await parity(w, a, campaign, "accepted", yes(SOL, { expectedEntryTotal: SOL }));
  });

  test("the lock: a price that reaches the target, and the buffer around it", async () => {
    const target = (BTC_PRICE * 11n) / 10n;
    const { w, campaign } = await joinWorld({ direction: P.Direction.Above, target });
    const btc = (price: bigint) =>
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: now(w.client) - 5n, price });
    const baker = await fundedWallet(w);
    btc(target - BTC_CONF);
    await parity(w, baker, campaign, "OutcomeKnowable", yes(SOL));
    // The buffer: the band's edge at least 1% of the price, rounded up, from the target (question 7).
    const margin = (p: bigint) => (p * 100n + 9_999n) / 10_000n;
    const priceAtGap = (offset: bigint) => {
      let p = target;
      for (let i = 0; i < 10; i++) p = target - (margin(p) + offset + BTC_CONF);
      return p;
    };
    btc(priceAtGap(-1n));
    await parity(w, baker, campaign, "JoinBufferRefused", yes(SOL));
    btc(priceAtGap(0n));
    await parity(w, baker, campaign, "accepted", yes(SOL));
  });
});
