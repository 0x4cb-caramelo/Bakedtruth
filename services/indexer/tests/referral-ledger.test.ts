/**
 * Purpose: what keeps the referral routine from paying twice or paying blind (Sprint 14, lane L14R), no cluster: a
 *          batch is refused while another is open; cancel gives one up, and a transfer that lands after its cancel
 *          still counts as paid, so what a wallet is owed never goes below what reached it; a lost ledger, a duplicate
 *          send and an irregular transaction are read back from the operations wallet's own memo'd transfers and
 *          counted as paid to whoever received them; an indexer file with a skipped transaction or a gap, an
 *          operations wallet that cannot pay, and a file that is not a ledger are refused; a payout transaction the
 *          node cannot return in a version this client reads (-32015) stops the scan, named, and is never skipped
 *          (Sprint 16, the review's F1). Filter: `-t referral`.
 * Version: 0.2.0 (Sprint 16: an unreadable payout stops the scan)
 * Sprint:  14 (referral, lane L14R); 16
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { openStore } from "../src/db/store";
import { payoutsOf } from "../src/referral/landed";
import { openLedger, paidByWallet } from "../src/referral/ledger";
import { prepareBatch, recordPayouts } from "../src/referral/routine";
import { wallet } from "./referral-chain";
import { earnings, OPS, OpsWallet, routineRpc } from "./referral-ops";

const [F, F2] = [wallet(2), wallet(6)];
type Indexer = Awaited<ReturnType<typeof earnings>>["indexer"];
const prepare = (indexer: Indexer, ops: OpsWallet, ledger: ReturnType<typeof openLedger>) =>
  prepareBatch({ rpc: routineRpc(ops), indexer, ledger, ops: OPS, dryRun: false, now: 0 });
const record = (ops: OpsWallet, ledger: ReturnType<typeof openLedger>, cancel?: number) =>
  recordPayouts({ rpc: routineRpc(ops), ledger, ops: OPS, cancel });

describe("referral ledger", () => {
  test("an open batch blocks the next; cancel gives it up; a transfer landing after its cancel still counts", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    const ledger = openLedger(":memory:");
    await prepare(indexer, ops, ledger);
    await expect(prepare(indexer, ops, ledger)).rejects.toThrow("batch 1 is still open");
    expect((await record(ops, ledger, 1)).cancelled).toBe(2);
    const second = await prepare(indexer, ops, ledger);
    expect(second.plan.send.map((l) => [l.idx, l.wallet, l.amount])).toEqual([
      [1, F, 40_000_000n],
      [2, F2, 700_000n],
    ]);
    ops.pay(F, 40_000_000n, 1, 1); // the cancelled batch's line, sent anyway
    ops.pay(F, 40_000_000n, 2, 1);
    ops.pay(F2, 700_000n, 2, 2);
    const notes = (await record(ops, ledger)).scan.recorded.map((r) => r.note);
    expect(notes).toEqual(["landed after it was cancelled", null, null]);
    expect(paidByWallet(ledger).get(F)).toBe(80_000_000n);
    const third = await prepare(indexer, ops, ledger);
    expect([third.plan.send, third.plan.carried, third.written]).toEqual([[], [], false]); // owed is below zero
  });

  test("a payout the node cannot return in a version this client reads stops the scan, named; never skipped", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    const ledger = openLedger(":memory:");
    await prepare(indexer, ops, ledger);
    const paid = ops.pay(F, 40_000_000n, 1, 1);
    ops.newer.add(paid);
    await expect(record(ops, ledger)).rejects.toThrow(`cannot read ${paid} (-32015`);
    const row = ledger.db.query("SELECT status FROM referral_payouts WHERE batch = 1 AND idx = 1");
    expect(row.all()).toEqual([{ status: "prepared" }]); // not counted as paid, not skipped
    // No next batch either: preparing scans first, so nothing is paid while that payout cannot be read.
    await expect(prepare(indexer, ops, ledger)).rejects.toThrow(`cannot read ${paid} (-32015`);
    ops.newer.delete(paid);
    expect((await record(ops, ledger)).scan.recorded.map((r) => [r.landing.signature, r.note])).toEqual([[paid, null]]);
  });

  test("a line sent with another amount counts as it landed; the line stays in flight until cancelled", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    const ledger = openLedger(":memory:");
    await prepare(indexer, ops, ledger);
    const edited = ops.pay(F, 39_999_999n, 1, 1);
    const scan = (await record(ops, ledger)).scan;
    expect(scan.recorded.map((r) => [r.landing.signature, r.note])).toEqual([
      [edited, "not the prepared wallet or amount"],
    ]);
    const statuses = ledger.db.query("SELECT status FROM referral_payouts WHERE batch = 1 AND idx = 1 ORDER BY id");
    expect(statuses.all()).toEqual([{ status: "prepared" }, { status: "landed" }]);
    expect(paidByWallet(ledger).get(F)).toBe(39_999_999n);
    expect((await record(ops, ledger)).scan.recorded).toEqual([]); // each transfer is read once
    await record(ops, ledger, 1);
    ops.balances.set(F, { lamports: 39_999_999n });
    const next = await prepare(indexer, ops, ledger);
    expect(next.plan.send.map((l) => [l.wallet, l.amount])).toEqual([
      [F, 1n],
      [F2, 700_000n],
    ]);
  });

  test("only a successful transfer from the operations wallet under a payout memo is a payout", () => {
    const ops = new OpsWallet();
    const tx = (signature: string) => ops.txs.find((t) => t.transaction.signatures[0] === signature)!;
    const failed = ops.send([{ to: F, lamports: 7n }], "brot-referral:1:1", { failed: true });
    const bare = ops.send([{ to: F, lamports: 7n }], null);
    const paid = ops.pay(F, 7n, 1, 1);
    expect(payoutsOf(tx(failed), OPS)).toEqual([]);
    expect(payoutsOf(tx(bare), OPS)).toEqual([]);
    expect(payoutsOf(tx(paid), wallet(78))).toEqual([]); // not from that wallet
    expect(payoutsOf(tx(paid), OPS)).toMatchObject([{ signature: paid, ix: 0, batch: 1, idx: 1, lamports: 7n }]);
  });

  test("a lost ledger, a duplicate and an irregular transfer are read back from the chain and never paid again", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    const first = openLedger(":memory:");
    await prepare(indexer, ops, first);
    ops.pay(F, 40_000_000n, 1, 1);
    ops.pay(F, 40_000_000n, 1, 1); // the same line run twice
    ops.send(
      [
        { to: F2, lamports: 300_000n },
        { to: F2, lamports: 400_000n },
      ],
      "brot-referral:1:2",
    );
    ops.send([{ to: F2, lamports: 5n }], null); // no memo: not a payout
    ops.send([{ to: F, lamports: 7n }], "brot-referral:9:9", { failed: true }); // failed: nothing moved
    const lost = openLedger(":memory:"); // the ledger is gone: a new one reads the wallet's history again
    const again = await prepare(indexer, ops, lost);
    expect(again.scan.recorded.map((r) => [r.landing.wallet, r.landing.lamports, r.note])).toEqual([
      [F, 40_000_000n, "not in this ledger"],
      [F, 40_000_000n, "duplicate: landed twice"],
      [F2, 300_000n, "irregular: 1 payout memo(s), 2 transfer(s)"],
      [F2, 400_000n, "irregular: 1 payout memo(s), 2 transfer(s)"],
    ]);
    expect([again.plan.send, again.plan.carried, again.written]).toEqual([[], [], false]);
    expect((await record(ops, lost)).scan.recorded).toEqual([]); // each transfer recorded once
    lost.db.run("DELETE FROM scans"); // a ledger restored without its scan's place reads the history again
    expect((await record(ops, lost)).scan.recorded).toEqual([]);
    expect(paidByWallet(lost)).toEqual(
      new Map([
        [F, 80_000_000n],
        [F2, 700_000n],
      ]),
    );
  });

  test("refused: an indexer file with a skipped transaction or a gap, a wallet that cannot pay, a foreign file", async () => {
    const { indexer, chain } = await earnings();
    const ops = new OpsWallet();
    ops.balances.set(OPS, { lamports: 40_000_000n });
    await expect(prepare(indexer, ops, openLedger(":memory:"))).rejects.toThrow(
      "the operations wallet holds 40000000 lamports; the batch needs 41360240",
    );
    const dry = await prepareBatch({
      ...{ rpc: routineRpc(ops), indexer, ledger: openLedger(":memory:"), ops: OPS, dryRun: true, now: 0 },
    });
    expect(dry.summary).toContain("NOT ENOUGH");
    indexer.db.run("UPDATE signatures SET state = 'skipped' WHERE signature = ?", [
      chain.txs[3].transaction.signatures[0],
    ]);
    await expect(prepare(indexer, new OpsWallet(), openLedger(":memory:"))).rejects.toThrow(
      "not read: wait, or rebuild",
    );
    indexer.db.run("UPDATE signatures SET state = 'done'");
    indexer.db.run("DELETE FROM events WHERE seq = 2 AND name = 'EntryAdded'");
    await expect(prepare(indexer, new OpsWallet(), openLedger(":memory:"))).rejects.toThrow("with a gap");
  });

  test("the ledger and the indexer's file never open as each other", () => {
    const dir = mkdtempSync(join(tmpdir(), "brot-referral-ledger-"));
    try {
      openStore(join(dir, "indexer.sqlite")).close();
      expect(() => openLedger(join(dir, "indexer.sqlite"))).toThrow("not a referral ledger");
      openLedger(join(dir, "ledger.sqlite")).close();
      expect(() => openStore(join(dir, "ledger.sqlite"))).toThrow("another application's id");
      expect(() => openLedger(join(dir, "ledger.sqlite"), { readonly: true }).close()).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
