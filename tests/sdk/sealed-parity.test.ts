/**
 * Purpose: `checkSealedEntry` and the SDK's sealed-entry charge against `sponsor_join_campaign` (Sprint 15), as
 *          tests/sdk/join-parity.test.ts holds `checkJoin` to the join: each case is fed to both from the same world,
 *          with the same verdict, in the program's order: not Open; the entry close; the lock and the buffer; the
 *          pause (before the price is read); the floor, `max_lamports` and the SOL/USD account; a SealedFee that is not
 *          the sponsor's; the campaign's minimum on the entry part; the signed entry total, a replay included; and the
 *          signed return at the SDK's estimate and one basis point above it. An accepted entry is charged what the SDK
 *          said, to the lamport. Filter: `bun test tests/ -t "checkSealedEntry refuses what the program refuses"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15). Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import type { Address, KeyPairSigner } from "@solana/kit";

import { checkSealedEntry, decodeCampaign, decodeEntry, decodeGlobalConfig, errorName } from "@brot/sdk/read";

import type { BrotErrorName } from "../brot/errors";
import { BTC_PRICE, readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { freshPrice, rewrite } from "../brot/join-campaign-support";
import { offsetOf } from "../brot/layouts";
import { BTC_CONF } from "../brot/opening";
import * as P from "../brot/program";
import {
  entryTotal,
  placeSealedFee,
  sealedCharge,
  sealedEntry,
  sealedWorld,
  type SealedArgs,
} from "../brot/sealed-support";
import { expectOk, fundedWallet, now, send, setPriceAccount, START_TIME, type World } from "../brot/setup";
import { CAMPAIGN } from "../brot/structs";

const SOL = P.SOL;
const raw = (w: World, at: Address) => {
  const a = w.client.svm.getAccount(at);
  return a.exists ? { owner: a.programAddress as string, data: new Uint8Array(a.data) } : null;
};
const fetched = (w: World, at: Address) => ({
  address: at,
  owner: P.SYSTEM_PROGRAM_ID as string,
  data: new Uint8Array(),
  ...raw(w, at),
});

/** The SDK's verdict on `a`, from what the world holds now, with the values `sealedEntry` signs. */
async function sdkVerdict(w: World, sponsor: KeyPairSigner, campaign: Address, a: SealedArgs) {
  const c = decodeCampaign(raw(w, campaign)!);
  const entry = raw(w, await P.entryPda(campaign, sponsor.address));
  const clock = w.client.svm.getClock();
  return checkSealedEntry({
    campaignAddress: campaign,
    campaign: c,
    config: decodeGlobalConfig(raw(w, await P.configPda())!),
    sponsor: sponsor.address,
    entry: entry && entry.data.length > 0 ? decodeEntry(entry) : null,
    sealedFee: raw(w, await P.sealedFeePda(campaign, sponsor.address)),
    metric: fetched(w, c.metricAccount),
    solUsd: fetched(w, P.SOL_USD_ACCOUNT),
    chain: { unixTimestamp: clock.unixTimestamp, slot: clock.slot, epoch: clock.epoch },
    side: a.side,
    entryUsd: a.entryUsd ?? 500n,
    maxLamports: a.maxLamports ?? 100n * SOL,
    minReturnBps: a.minReturnBps ?? 0,
    expectedEntryTotal: a.expectedEntryTotal ?? (await entryTotal(w, campaign, sponsor.address)),
  });
}

/** Both sides on `a`, expecting `expected`; an accepted entry must be charged what the SDK said. */
async function parity(
  w: World,
  sponsor: KeyPairSigner,
  campaign: Address,
  expected: BrotErrorName | "accepted",
  a: SealedArgs,
) {
  const sdk = await sdkVerdict(w, sponsor, campaign, a);
  const sent = await sealedEntry(w, sponsor, campaign, a);
  const program = sent.ok ? "accepted" : (errorName(sent.code ?? -1) ?? `code ${sent.code}`);
  expect({ program, sdk: sdk.ok ? "accepted" : sdk.refusal.errorName }).toEqual({ program: expected, sdk: expected });
  if (sent.ok && sdk.ok) {
    const held = sent.events.find((e) => e.name === "SealedFeeHeld")!.data;
    const { paid, entry, fee, price, exponent, publishTime } = sdk.charge;
    expect(held).toMatchObject({
      paid,
      entry_lamports: entry,
      fee_lamports: fee,
      price,
      exponent,
      publish_time: publishTime,
    });
  }
  return sdk;
}

const yes = (more: Partial<SealedArgs> = {}): SealedArgs => ({ side: P.Side.Yes, ...more });

describe("checkSealedEntry refuses what the program refuses", () => {
  test("the pause before the price; the floor, max_lamports and the SOL/USD account", async () => {
    const { w, team, admin, campaign, sponsor } = await sealedWorld();
    const { paid } = sealedCharge(500n);
    await parity(w, sponsor, campaign, "SealedEntryBelowFloor", yes({ entryUsd: 499n }));
    await parity(w, sponsor, campaign, "SealedEntryBelowFloor", yes({ entryUsd: 0n }));
    await parity(w, sponsor, campaign, "SealedEntryAboveMaxLamports", yes({ maxLamports: paid - 1n }));
    const solUsd = (change: Parameters<typeof setPriceAccount>[3]) =>
      setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", change);
    solUsd({ publishTime: START_TIME - 121n });
    await parity(w, sponsor, campaign, "SolUsdStale", yes());
    solUsd({ owner: P.PYTH_LEGACY_RECEIVER_ID });
    await parity(w, sponsor, campaign, "SolUsdWrongOwner", yes());
    solUsd({ conf: 1_000_000_000n });
    await parity(w, sponsor, campaign, "SolUsdConfidenceTooWide", yes());
    solUsd({});
    expectOk(await send(w, [await I.pauseEntriesIx(team[0])]));
    await parity(w, sponsor, campaign, "JoinWhilePaused", yes({ entryUsd: 1n }));
    expectOk(await send(w, [await I.resumeEntriesIx(admin)]));
    await parity(w, sponsor, campaign, "accepted", yes({ maxLamports: paid }));
  });

  test("not Open; the entry close; the lock and the buffer; the campaign's minimum on the entry part", async () => {
    const target = (BTC_PRICE * 11n) / 10n;
    const { w, campaign, metric, sponsor } = await sealedWorld({ direction: P.Direction.Above, target });
    const { entry } = sealedCharge(500n);
    const btc = (price: bigint) =>
      setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime: now(w.client) - 5n, price });
    btc(target - BTC_CONF);
    await parity(w, sponsor, campaign, "OutcomeKnowable", yes());
    // The buffer: the band's edge less than 1% of the price, rounded up, from the target (question 7).
    const margin = (p: bigint) => (p * 100n + 9_999n) / 10_000n;
    let inside = target;
    for (let i = 0; i < 10; i++) inside = target - (margin(inside) - 1n + BTC_CONF);
    btc(inside);
    await parity(w, sponsor, campaign, "JoinBufferRefused", yes());
    btc(BTC_PRICE);
    const minimum = offsetOf(CAMPAIGN, "min_entry_lamports");
    const setMinimum = (value: bigint) =>
      rewrite(w, campaign, (d) => new DataView(d.buffer).setBigUint64(minimum, value, true));
    setMinimum(entry + 1n);
    await parity(w, sponsor, campaign, "BelowCampaignMinEntry", yes());
    setMinimum(entry);
    await parity(w, sponsor, campaign, "accepted", yes());
    const closeAt = readCampaign(w, campaign).entries_close_at as bigint;
    freshPrice(w, metric, closeAt);
    await parity(w, sponsor, campaign, "EntriesClosed", yes());
    freshPrice(w, metric, closeAt - 1n);
    rewrite(w, campaign, (d) => (d[offsetOf(CAMPAIGN, "status")] = P.Status.InReview));
    await parity(w, sponsor, campaign, "CampaignNotOpen", yes());
  });

  test("the signed entry total, a replay, the signed return at the estimate, and a SealedFee not the sponsor's", async () => {
    const { w, campaign, sponsor } = await sealedWorld();
    const { entry } = sealedCharge(500n);
    await parity(w, sponsor, campaign, "EntryTotalMismatch", yes({ expectedEntryTotal: SOL }));
    const first = await sdkVerdict(w, sponsor, campaign, yes());
    if (!first.ok) throw new Error("the first sealed entry's estimate was refused");
    await parity(w, sponsor, campaign, "ReturnBelowMinimum", yes({ minReturnBps: Number(first.estimateBps + 1n) }));
    await parity(w, sponsor, campaign, "accepted", yes({ minReturnBps: Number(first.estimateBps) }));
    await parity(w, sponsor, campaign, "EntryTotalMismatch", yes({ expectedEntryTotal: 0n, joinIndex: 1 }));
    await parity(w, sponsor, campaign, "accepted", yes({ expectedEntryTotal: entry }));
    // Another sponsor's address holding a SealedFee that names another campaign: no transaction writes one.
    const other = await fundedWallet(w, 1_000n);
    await placeSealedFee(w, campaign, other.address, 0n, { campaign: other.address });
    await parity(w, other, campaign, "SealedFeeMismatch", yes());
  });
});
