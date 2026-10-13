/**
 * Purpose: the weekly referral routine with no cluster (Sprint 14, lane L14R; TP §3.4.11): prepare writes the batch to
 *          the ledger, the signing file (Solana CLI transfers with their memos, the signer checked) and its summary;
 *          the rent-exempt minimum is whatever the RPC answers, never a constant, and a transfer that would leave a
 *          wallet below it is carried, shown as pending, and sent the week its wallet can take it; a dry run writes
 *          nothing; record finds the landed transfer by its signature and closes the batch; the public report lists
 *          wallets and amounts only. Filter: `bun test services/indexer -t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ledgerCopy, openLedger } from "../src/referral/ledger";
import { publicReport } from "../src/referral/report";
import { prepareBatch, recordPayouts } from "../src/referral/routine";
import { SOL, wallet } from "./referral-chain";
import { earnings, OPS, OpsWallet, routineRpc } from "./referral-ops";

const [F, F2] = [wallet(2), wallet(6)];

const run = (indexer: Parameters<typeof prepareBatch>[0]["indexer"], ops: OpsWallet, ledger = openLedger(":memory:")) =>
  prepareBatch({ rpc: routineRpc(ops), indexer, ledger, ops: OPS, dryRun: false, now: 1_800_000_000 }).then((p) => ({
    ...p,
    ledger,
  }));

describe("referral routine", () => {
  test("prepare: the batch, its signing file and summary; the rent minimum is the RPC's, never a constant", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    ops.rentPerByte = 6_960n; // LiteSVM's: 890,880 for an empty wallet, above F2's 700,000
    const first = await run(indexer, ops);
    expect(first.plan.send.map((l) => [l.idx, l.wallet, l.amount])).toEqual([[1, F, 40_000_000n]]);
    expect(first.plan.carried.map((l) => [l.idx, l.wallet, l.amount, l.rentMin])).toEqual([
      [2, F2, 700_000n, 890_880n],
    ]);
    expect(first.script).toContain(`OPS=${OPS}`);
    expect(first.script).toContain(`send 1 ${F} 0.040000000`);
    expect(first.script).toContain('--with-memo "brot-referral:1:$1"');
    expect(first.script).not.toContain(F2);
    expect(first.summary).toContain("as the RPC answered it: 890880 lamports");
    const rows = first.ledger.db.query("SELECT batch, idx, wallet, amount, status FROM referral_payouts ORDER BY idx");
    expect(rows.all()).toEqual([
      { batch: 1, idx: 1, wallet: F, amount: "40000000", status: "prepared" },
      { batch: 1, idx: 2, wallet: F2, amount: "700000", status: "carried" },
    ]);
    ops.rentPerByte = 5_080n; // devnet and mainnet: 650,240, below F2's 700,000: sent
    const devnet = await run(indexer, ops);
    expect(devnet.plan.send.map((l) => [l.wallet, l.amount])).toEqual([
      [F, 40_000_000n],
      [F2, 700_000n],
    ]);
    expect(devnet.plan.rentMin).toBe(650_240n);
    ops.rentPerByte = 6_960n;
    ops.balances.set(F2, { lamports: 190_880n }); // 190,880 + 700,000 = 890,880: exactly the minimum, so it goes
    const exact = await run(indexer, ops);
    expect(exact.plan.send.map((l) => [l.wallet, l.balance, l.rentMin])).toEqual([
      [F, 0n, 890_880n],
      [F2, 190_880n, 890_880n],
    ]);
  });

  test("a dry run writes nothing: the summary only, from a throwaway copy of the ledger", async () => {
    const { indexer } = await earnings();
    const dir = mkdtempSync(join(tmpdir(), "brot-referral-"));
    try {
      const path = join(dir, "ledger.sqlite");
      openLedger(path).close();
      const ops = new OpsWallet();
      const dry = await prepareBatch({
        ...{ rpc: routineRpc(ops), indexer, ledger: ledgerCopy(path), ops: OPS, dryRun: true, now: 0 },
      });
      expect(dry.summary).toStartWith("Brot Markets: referral payouts, batch 1 (dry run: nothing written)");
      expect([dry.written, dry.script, dry.plan.send.length]).toEqual([false, null, 2]);
      const ledger = openLedger(path, { readonly: true });
      expect(ledger.db.query("SELECT count(*) AS n FROM referral_payouts").get()).toEqual({ n: 0 });
      expect(ledger.db.query("SELECT count(*) AS n FROM batches").get()).toEqual({ n: 0 });
      ledger.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("record: the landed transfer by its signature; the carried one is pending, then sent once it can be", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    ops.rentPerByte = 6_960n;
    const { ledger } = await run(indexer, ops);
    const signature = ops.pay(F, 40_000_000n, 1, 1);
    const recorded = await recordPayouts({ rpc: routineRpc(ops), ledger, ops: OPS });
    expect(recorded.scan.recorded.map((r) => [r.landing.signature, r.note])).toEqual([[signature, null]]);
    expect(recorded.status).toEqual([
      { batch: 1, status: "carried", n: 1 },
      { batch: 1, status: "landed", n: 1 },
    ]);
    const landed = ledger.db.query("SELECT status, signature, ix FROM referral_payouts WHERE idx = 1").get();
    expect(landed).toEqual({ status: "landed", signature, ix: 0 });
    const report = publicReport(ledger, 1);
    expect(report).toBe(
      [
        "Brot Markets: referral payouts, in SOL",
        "",
        "Paid",
        `${F} 0.040000000`,
        "",
        "Pending",
        `${F2} 0.000700000`,
        "",
      ].join("\n"),
    );
    for (const line of report
      .split("\n")
      .filter((l) => !["", "Paid", "Pending"].includes(l))
      .slice(1))
      expect(line).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44} \d+\.\d{9}$/);
    ops.balances.set(F2, { lamports: SOL }); // the next week, F2's wallet holds SOL: the 700,000 can go
    const next = await prepareBatch({ rpc: routineRpc(ops), indexer, ledger, ops: OPS, dryRun: false, now: 1 });
    expect(next.plan.batch).toBe(2);
    expect(next.plan.send.map((l) => [l.wallet, l.amount, l.paidBefore])).toEqual([[F2, 700_000n, 0n]]);
    expect(next.plan.carried).toEqual([]);
  });
});
