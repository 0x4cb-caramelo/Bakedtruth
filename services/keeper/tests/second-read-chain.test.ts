/**
 * Purpose: the second read of a price resolution end to end (Sprint 07 DoD: "tested with a forged mismatch"), on
 *          LiteSVM with recorded devnet bytes: a BTC/USD campaign is resolved by the keeper from the very sponsored
 *          account recorded on devnet (its price, publish time and posted slot); RPC B answers the recorded block and
 *          transaction of that slot. The check matches; with the transaction's signed price forged it is a mismatch,
 *          and the pass puts it in the review queue and alerts, naming the RPC that answered; with no block at RPC B,
 *          the pass retries, and in the window's last hour queues the campaign as unchecked, once.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read: the proof transaction)
 */
import { describe, expect, test } from "bun:test";
import { lamports } from "@solana/kit";
import { Outcome, PYTH_RECEIVER_ID, Status } from "@brot/sdk/read";

import { openedCampaign } from "../../../tests/brot/flows";
import * as P from "../../../tests/brot/program";
import type { AlertKind, Alerter } from "../src/alert";
import { listCampaignsWithStatus } from "../src/campaigns";
import { runCycle } from "../src/cycle";
import { checkPrice } from "../src/second-check";
import { secondReadPass } from "../src/second-read-pass";
import { ACCOUNT, BLOCK, INDEX, WRITER_TX, forgedWriterTx, storedReading } from "./kit/proof-fixtures";
import { keeperContext, keeperWorld, readCampaignOf, setClockTo } from "./kit/settle-world";

/** A Below campaign the recorded BTC/USD update touches: its band (price + conf) is under the target. */
async function resolvedFromRecording() {
  const kw = await keeperWorld();
  const stored = storedReading();
  const target = 8_420_000_000_000n; // 84,200 US$: above the recorded price + conf, 1% under the opening price
  expect(stored.price + stored.conf <= target).toBe(true);
  const deadlineAt = kw.client.svm.getClock().unixTimestamp + 10n * P.DAY;
  const { campaign } = await openedCampaign(kw, kw.creator, { direction: P.Direction.Below, target, deadlineAt });
  kw.client.svm.warpToSlot(stored.postedSlot + 2n);
  setClockTo(kw, stored.publishTime + 5n);
  const data = Buffer.from(ACCOUNT().data[0], "base64");
  kw.client.svm.setAccount({
    address: P.BTC_USD_ACCOUNT,
    data,
    executable: false,
    lamports: lamports(1_823_520n),
    programAddress: PYTH_RECEIVER_ID,
    space: BigInt(data.length),
  });
  expect((await runCycle(keeperContext(kw), false)).counts.resolved).toBe(1);
  const c = readCampaignOf(kw, campaign);
  expect({ outcome: c.outcome, observed: c.observedValue, publish: c.publishTime }).toEqual({
    outcome: Outcome.Yes,
    observed: stored.price,
    publish: stored.publishTime,
  });
  return { kw, campaign, reviewEndsAt: c.reviewEndsAt };
}

function spyAlerter() {
  const fired: Array<{ kind: AlertKind; key: string }> = [];
  const alerter: Alerter = { alert: (kind, key) => (fired.push({ kind, key }), true) };
  return { fired, alerter };
}

describe("the second read of a price resolution", () => {
  test("matches the recorded proof transaction; a forged signed price is a mismatch, queued and alerted", async () => {
    const { kw, campaign } = await resolvedFromRecording();
    const rpcB = kw.chain;
    let tx: unknown = WRITER_TX();
    rpcB.answer("getBlock", ([slot]) => (Number(slot) === INDEX.postedSlot ? BLOCK() : undefined));
    rpcB.answer("getTransaction", ([signature]) => (signature === INDEX.writers[0] ? tx : undefined));
    const ok = await checkPrice(rpcB.rpc, campaign);
    expect(ok).toMatchObject({ match: true, postedSlot: BigInt(INDEX.postedSlot) });
    expect(ok.detail).toContain(INDEX.writers[0]!);

    tx = forgedWriterTx(storedReading().price + 1n);
    const lines: string[] = [];
    const logs: Record<string, unknown>[] = [];
    const { fired, alerter } = spyAlerter();
    const tally = await secondReadPass({
      listInReview: () => listCampaignsWithStatus(kw.chain.rpc, Status.InReview),
      rpcB: rpcB.rpc,
      recheck: () => Promise.reject(new Error("not a price campaign")),
      answeredBy: "https://rpc-b.example.test",
      sameProvider: false,
      queuePath: "/var/lib/brot-markets/review-queue.jsonl",
      alerter,
      memory: { done: new Set(), unchecked: new Set() },
      write: async (_, line) => void lines.push(line),
      log: (_, fields) => void logs.push(fields),
    });
    expect(tally).toEqual({ checked: 1, mismatches: 1, unchecked: 0 });
    expect(fired).toEqual([{ kind: "second_read_mismatch", key: campaign }]);
    const entry = JSON.parse(lines[0]!);
    expect(entry).toMatchObject({
      campaign,
      reason: "second_read_mismatch",
      kind: "PriceTouch",
      answeredBy: "https://rpc-b.example.test",
      sameProvider: false,
      postedSlot: String(INDEX.postedSlot),
    });
    expect(entry.detail).toContain(`wrote price ${storedReading().price + 1n}`);
    expect(logs[0]).toMatchObject({ answeredBy: "https://rpc-b.example.test", match: false });
  });

  test("with no block at RPC B the check is retried, and in the window's last hour queued as unchecked, once", async () => {
    const { kw, campaign, reviewEndsAt } = await resolvedFromRecording();
    const lines: string[] = [];
    const { fired, alerter } = spyAlerter();
    const memory = { done: new Set<string>(), unchecked: new Set<string>() };
    const pass = (nowS: bigint) =>
      secondReadPass({
        listInReview: () => listCampaignsWithStatus(kw.chain.rpc, Status.InReview),
        rpcB: kw.chain.rpc,
        recheck: () => Promise.reject(new Error("not a price campaign")),
        answeredBy: "https://rpc-b.example.test",
        sameProvider: true,
        queuePath: "/var/lib/brot-markets/review-queue.jsonl",
        alerter,
        memory,
        write: async (_, line) => void lines.push(line),
        now: () => Number(nowS) * 1_000,
        log: () => {},
      });
    expect(await pass(reviewEndsAt - 7_200n)).toEqual({ checked: 0, mismatches: 0, unchecked: 0 });
    expect(await pass(reviewEndsAt - 600n)).toEqual({ checked: 0, mismatches: 0, unchecked: 1 });
    expect(await pass(reviewEndsAt - 300n)).toEqual({ checked: 0, mismatches: 0, unchecked: 0 });
    expect(fired).toEqual([{ kind: "second_read_unchecked", key: campaign }]);
    expect(JSON.parse(lines[0]!)).toMatchObject({ reason: "second_read_unchecked", sameProvider: true });
  });
});
