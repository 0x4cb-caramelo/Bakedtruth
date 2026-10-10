/**
 * Purpose: the site's retry guard (A-9; proposal §3.4 rule 6) end to end, against the program in LiteSVM behind a
 *          local RPC: the record is saved before the wallet sees the join; a wallet that sends and never answers is
 *          found landed by the entry total; a retry that passes the saved total is refused by the SDK's check and, if
 *          a page skipped it, by the program (`EntryTotalMismatch`); an attempt that never reached the chain is
 *          declared unlanded only once the block height passed its `lastValidBlockHeight`, and the next attempt then
 *          lands once. Filter: `bun test tests/ -t "a retried entry fails on expected total"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { fromRefusal } from "../../app/features/entry/failures";
import {
  decidePending,
  guardedTotal,
  loadPending,
  pendingKey,
  savePending,
} from "../../app/features/entry/retry-guard";
import { handToWallet, pendingOf, prepareEntry, settle, walletTransaction } from "../../app/features/entry/submit";
import { join, openedCampaign, readEntry } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectError, fundedWallet } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { LAST_VALID, startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, napThen, refusingStore, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

async function setup() {
  const w = await openingWorld();
  const { campaign } = await openedCampaign(w, w.creator);
  chain = startFakeChain(w);
  const rpc = createSolanaRpc(chain.url);
  const baker = await fundedWallet(w);
  const choice = { campaign: campaign as string, baker: baker.address as string, side: "yes" as const, amount: P.SOL };
  return { w, campaign, rpc, baker, choice, store: memoryStore(), chain };
}

describe("a retried entry fails on expected total", () => {
  test("a wallet that sends and never answers: the entry is found landed, and the retry is refused (A-9)", async () => {
    const { w, campaign, rpc, baker, choice, store } = await setup();
    const first = ready(await prepareEntry({ rpc, ...choice }));
    const pending = pendingOf(first, choice);
    expect(pending).toMatchObject({
      expectedEntryTotal: "0",
      lastValidBlockHeight: LAST_VALID.toString(),
      state: "handed",
    });
    const send = testWallet(baker, chain!.url, "no-answer");
    const outcome = await handToWallet({
      rpc,
      ready: first,
      pending,
      send,
      store,
      watch: { sleep: napThen(() => {}) },
    });
    expect(outcome).toEqual({ kind: "landed", signature: null });
    expect(store.map.has(pendingKey(choice.campaign, choice.baker))).toBe(false);
    expect((await readEntry(w, campaign, baker.address)).amount_yes).toBe(P.SOL);
    // What the wallet signed is the message the summary read, byte for byte.
    expect(send.sent[0].message.serialize()).toEqual(new Uint8Array(first.transaction.messageBytes));

    // The retry passes the first attempt's saved total: the SDK's check refuses it before anything is built.
    const retry = await prepareEntry({ rpc, ...choice, expectedEntryTotal: BigInt(pending.expectedEntryTotal) });
    if (retry.ok || retry.stage !== "check") throw new Error("expected the check to refuse the retry");
    expect(retry.check.refusal.errorName).toBe("EntryTotalMismatch");
    expect(fromRefusal("EntryTotalMismatch", true).key).toBe("alreadyLanded");
    // And a page that skipped its checks still cannot enter twice: the program refuses the stale total.
    expectError(
      await join(w, baker, campaign, { side: P.Side.Yes, amount: P.SOL, expectedEntryTotal: 0n }),
      "EntryTotalMismatch",
    );
    expect((await readEntry(w, campaign, baker.address)).amount_yes).toBe(P.SOL);
  });

  test("an attempt that never reached the chain is unlanded only after its last valid block height", async () => {
    const { w, campaign, rpc, baker, choice, store, chain: c } = await setup();
    const first = ready(await prepareEntry({ rpc, ...choice }));
    const heights: bigint[] = [];
    const outcome = await handToWallet({
      rpc,
      ready: first,
      pending: pendingOf(first, choice),
      send: testWallet(baker, c.url, "drop"),
      store,
      watch: { onWait: (left) => heights.push(left), sleep: napThen(() => c.setBlockHeight(LAST_VALID + 1n)) },
    });
    expect(heights).toEqual([150n]); // it waited while the transaction could still land
    expect(outcome.kind === "failed" && outcome.failure.key).toBe("notLanded");
    const kept = loadPending(store, choice.campaign, choice.baker);
    expect(kept?.state).toBe("expired");
    // The next attempt passes the saved total; nothing landed, so it equals the chain's and the entry goes in once.
    c.setBlockHeight(LAST_VALID - 150n);
    const next = ready(await prepareEntry({ rpc, ...choice, expectedEntryTotal: guardedTotal(kept) }));
    const landed = await handToWallet({
      rpc,
      ready: next,
      pending: pendingOf(next, choice),
      send: testWallet(baker, c.url),
      store,
    });
    expect(landed.kind).toBe("landed");
    expect(landed.kind === "landed" && landed.signature).toBeString();
    expect((await readEntry(w, campaign, baker.address)).amount_yes).toBe(P.SOL);
  });

  test("a refusal in the wallet sends nothing, and the saved total stays for the next attempt", async () => {
    const { rpc, baker, choice, store, chain: c } = await setup();
    const first = ready(await prepareEntry({ rpc, ...choice }));
    const outcome = await handToWallet({
      rpc,
      ready: first,
      pending: pendingOf(first, choice),
      send: testWallet(baker, c.url, "refuse"),
      store,
    });
    expect(outcome).toMatchObject({ kind: "failed", onChain: false, failure: { key: "signatureRefused" } });
    expect(c.methods).not.toContain("sendTransaction");
    expect(loadPending(store, choice.campaign, choice.baker)).toMatchObject({
      state: "refused",
      expectedEntryTotal: "0",
    });
  });

  test("after a reload, the stored record alone is watched to its end", async () => {
    const { w, campaign, rpc, baker, choice, store, chain: c } = await setup();
    const first = ready(await prepareEntry({ rpc, ...choice }));
    savePending(store, pendingOf(first, choice));
    // The wallet sent it while the page was frozen; the page comes back with only its storage.
    await testWallet(baker, c.url)(walletTransaction(first));
    const record = loadPending(store, choice.campaign, choice.baker);
    expect(record).not.toBeNull();
    expect(await settle(rpc, record!, store, true)).toEqual({ kind: "landed", signature: null });
    expect((await readEntry(w, campaign, baker.address)).amount_yes).toBe(P.SOL);
  });

  test("the guard's rule, and a store that refuses everything", () => {
    const record = {
      v: 1,
      campaign: "c",
      baker: "b",
      side: "yes",
      amount: "5",
      expectedEntryTotal: "10",
      lastValidBlockHeight: "100",
      signature: null,
      state: "handed",
      savedAt: 0,
    } as const;
    const now = (entryTotal: bigint, blockHeight: bigint, status: "landed" | "failed" | null = null) => ({
      entryTotal,
      blockHeight,
      status,
    });
    expect(decidePending(record, now(10n, 100n))).toBe("wait");
    expect(decidePending(record, now(15n, 100n))).toBe("landed");
    expect(decidePending(record, now(10n, 101n))).toBe("not-landed");
    expect(decidePending(record, now(10n, 50n, "failed"))).toBe("failed");
    expect(decidePending(record, now(10n, 50n, "landed"))).toBe("landed");
    // With a signature, its status decides: another entry moving the total does not make this one landed.
    const signed = { ...record, signature: "sig" };
    expect(decidePending(signed, now(15n, 50n, "failed"))).toBe("failed");
    expect(decidePending(signed, now(15n, 50n))).toBe("wait");
    expect(decidePending(signed, now(15n, 101n))).toBe("landed");
    expect(decidePending(signed, now(10n, 101n))).toBe("not-landed");
    expect(savePending(refusingStore(), { ...record })).toBe(false);
    expect(loadPending(refusingStore(), "c", "b")).toBeNull();
    const store = memoryStore();
    store.setItem(pendingKey("c", "b"), JSON.stringify({ ...record, expectedEntryTotal: "-1" }));
    expect(loadPending(store, "c", "b")).toBeNull();
    store.setItem(pendingKey("c", "b"), "{not json");
    expect(loadPending(store, "c", "b")).toBeNull();
  });
});
