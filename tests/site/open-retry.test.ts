/**
 * Purpose: the opening's retry guard end to end (T17, A-9; TP §3.4.10 row 10), against the program in LiteSVM behind a
 *          local RPC: the id is the page's until the hand-off saves it, every rebuild reuses it, and a refusal clears
 *          only its own attempt; a wallet that sends and never answers is found opened by the campaign at its id; one
 *          that never sent is declared unlanded only past its last valid block height, and the rebuilt opening then
 *          lands once, on the same id; a second send of that id (from a page that skipped the SDK's check) fails on
 *          the existing `Campaign`, its watch reads it as the first attempt landing, and nothing is charged twice. The
 *          look-up for a browser that lost its record is open-recent.test.ts's.
 *          Filter: `bun test tests/ -t "a retried opening reuses its id"`.
 * Version: 0.2.0 (the Sprint 19 reviews: saved at the hand-off only)
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { address, compileTransaction, createNoopSigner, createSolanaRpc } from "@solana/kit";

import { bytesToHex, ReaderKind } from "@brot/sdk/read";
import { buildOpenCampaign, messageFor, type OpeningChoice } from "@brot/sdk/tx";

import {
  clearAttemptOpening,
  decideOpening,
  handedRecord,
  idFor,
  loadOpening,
  openingKey,
  saveOpening,
} from "../../app/features/open-campaign/retry-guard";
import { handToWallet, prepareOpening, type ReadyOpening } from "../../app/features/open-campaign/submit";
import { BTC_PRICE, newId } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { balance, now } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { LAST_VALID, startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, napThen, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

async function setup() {
  const w = await openingWorld();
  chain = startFakeChain(w);
  const rpc = createSolanaRpc(chain.url);
  const choice: OpeningChoice = {
    kind: ReaderKind.PriceTouch,
    feedId: bytesToHex(P.BTC_USD_FEED_ID),
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: now(w.client) + 7n * P.DAY,
    openingUsd: 500n,
  };
  return { w, rpc, choice, store: memoryStore(), creator: w.creator.address as string, chain };
}

describe("a retried opening reuses its id", () => {
  test("the id is the page's until the hand-off saves it; a rebuild reuses the saved one", () => {
    const store = memoryStore();
    let draws = 0;
    const draw = () => (draws++, 12_345n);
    const first = idFor(store, "wallet-a", draw);
    // Nothing is written before the wallet gets the transaction (the legal review, M6).
    expect(store.map.has(openingKey("wallet-a"))).toBe(false);
    expect(first).toMatchObject({ id: "12345", state: "drawn" });
    const handed = handedRecord(first, 500n);
    expect(saveOpening(store, handed)).toBe(true);
    expect(loadOpening(store, "wallet-a")).toEqual(handed);
    expect(idFor(store, "wallet-a", () => 99n).id).toBe("12345");
    expect(draws).toBe(1);
    // A refusal in the wallet deletes the record of its own attempt only, never a newer one.
    const newer = handedRecord(handed, 600n);
    saveOpening(store, newer);
    clearAttemptOpening(store, handed);
    expect(loadOpening(store, "wallet-a")?.attempt).toBe(newer.attempt);
    clearAttemptOpening(store, newer);
    expect(store.map.has(openingKey("wallet-a"))).toBe(false);
    const at = (creator: string | null, height = 0n, status: "landed" | "failed" | null = null) =>
      decideOpening(
        { ...handed, state: "handed", deadline: "10" },
        { campaignCreator: creator, blockHeight: height, status },
      );
    expect([at("wallet-a"), at("wallet-b"), at(null, 11n), at(null, 9n), at(null, 9n, "failed")]).toEqual([
      "landed",
      "taken",
      "not-landed",
      "wait",
      "failed",
    ]);
  });

  test("a wallet that sends and never answers: the campaign at the id is found, and the record cleared", async () => {
    const { w, rpc, choice, store, creator } = await setup();
    const record = idFor(store, creator, newId);
    const prepared = ready(await prepareOpening({ rpc, creator, choice, id: BigInt(record.id) }));
    const outcome = await handToWallet({
      rpc,
      ready: prepared,
      record,
      send: testWallet(w.creator, chain!.url, "no-answer"),
      store,
      watch: { sleep: napThen(() => {}) },
    });
    expect(outcome).toEqual({ kind: "opened", id: BigInt(record.id), signature: null, finalized: false });
    expect(store.map.has(openingKey(creator))).toBe(false);
  });

  test("never sent: unlanded only past its height; the rebuild lands once on the same id; a repeat is refused", async () => {
    const { w, rpc, choice, store, creator, chain: c } = await setup();
    const record = idFor(store, creator, newId);
    const id = BigInt(record.id);
    const first = ready(await prepareOpening({ rpc, creator, choice, id }));
    const heights: bigint[] = [];
    const lost = await handToWallet({
      rpc,
      ready: first,
      record,
      send: testWallet(w.creator, c.url, "drop"),
      store,
      watch: { sleep: napThen(() => (heights.push(1n), c.setBlockHeight(LAST_VALID + BigInt(heights.length)))) },
    });
    expect(lost).toEqual({ kind: "not-landed", id, cost: "unknown" });
    expect(loadOpening(store, creator)).toMatchObject({ id: record.id, state: "expired" });
    c.setBlockHeight(LAST_VALID - 150n);

    // The rebuild draws nothing new: the saved id comes back, and this time the wallet answers.
    const again = idFor(store, creator, () => 1n);
    expect(again.id).toBe(record.id);
    const before = balance(w, w.creator.address);
    const second = ready(await prepareOpening({ rpc, creator, choice, id }));
    const opened = await handToWallet({
      rpc,
      ready: second,
      record: again,
      send: testWallet(w.creator, c.url),
      store,
      watch: { sleep: napThen(() => {}) },
    });
    expect(opened).toMatchObject({ kind: "opened", id, finalized: true });
    const charged = before - balance(w, w.creator.address);
    expect(charged).toBe(second.debit.total);

    // A repeat of the same id: the SDK's check refuses it before anything is built.
    const repeat = await prepareOpening({ rpc, creator, choice, id });
    if (repeat.ok || repeat.stage !== "check") throw new Error("expected the check to refuse the repeat");
    expect(repeat.check.refusal.errorName).toBe("AlreadyInitialized");
    // A page that skipped its checks sends the same id again (US$600 this time, so the bytes differ): the program
    // refuses it on the existing campaign, the watch reads that as the first attempt having landed, and no second
    // payment leaves the wallet.
    const payer = createNoopSigner(address(creator));
    const ix = await buildOpenCampaign({
      creator: payer,
      args: { ...choice, id, openingUsd: 600n, maxLamports: 2n * second.maxLamports, expectedParamsVersion: 0 },
    });
    const message = await messageFor(rpc, payer, ix);
    const careless = { message, transaction: compileTransaction(message) } as unknown as ReadyOpening;
    const afterOpen = balance(w, w.creator.address);
    const outcome = await handToWallet({
      rpc,
      ready: careless,
      record: idFor(store, creator, () => id),
      send: testWallet(w.creator, c.url),
      store,
      watch: { sleep: napThen(() => {}) },
    });
    expect(outcome).toEqual({ kind: "already", id });
    expect(afterOpen - balance(w, w.creator.address)).toBeLessThanOrEqual(5_000n);
    expect(store.map.has(openingKey(creator))).toBe(false);
  });
});
