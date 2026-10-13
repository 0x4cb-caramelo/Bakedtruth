/**
 * Purpose: what the second review fixed in the weekly routine (Sprint 14, lane L14R), no cluster. R2: a line that can
 *          never be credited (a sysvar, an executable account, a transfer the simulation fails) is held for a person,
 *          carried and listed, never in the signing file, and the simulation is not run when the operations wallet
 *          cannot pay. R3: a new ledger that reads old landings back numbers its next batch above them; cancel refuses
 *          a batch it did not prepare and another wallet than the batch's; the summary says how far back the wallet's
 *          history was read. R4: the signing file and its summary name the cluster. Filter: `-t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";

import { simulationCheck } from "../../../scripts/referral/simulate";
import { openLedger } from "../src/referral/ledger";
import { publicReport } from "../src/referral/report";
import { prepareBatch, recordPayouts } from "../src/referral/routine";
import { Campaign } from "./referral-campaign";
import { Chain, indexed, SOL, wallet } from "./referral-chain";
import { earnings, GENESIS, OPS, OpsWallet, routineRpc } from "./referral-ops";

const CLOCK = "SysvarC1ock11111111111111111111111111111111";
const [F, F2, PROGRAM, REFUSED, D] = [wallet(2), wallet(6), wallet(90), wallet(91), wallet(4)];

/** Five referees on the winning side, each earning its referrer 0.02 SOL: F, the Clock sysvar, a program, REFUSED and
 *  the operations wallet itself. */
async function fourReferrers() {
  const chain = new Chain();
  const referees = [11, 12, 13, 14, 15].map(wallet);
  [F, CLOCK, PROGRAM, REFUSED, OPS].forEach((referrer, i) => chain.link(referees[i], referrer as never));
  const c = new Campaign(chain, 1);
  for (const r of referees) c.join(r, "yes", SOL);
  c.join(D, "no", 5n * SOL);
  c.finalize("yes");
  c.settle();
  return (await indexed(chain)).store;
}

const prepare = (
  indexer: Parameters<typeof prepareBatch>[0]["indexer"],
  ops: OpsWallet,
  ledger = openLedger(":memory:"),
) =>
  prepareBatch({
    rpc: routineRpc(ops),
    indexer,
    ledger,
    ops: OPS,
    dryRun: false,
    now: 0,
    canCredit: simulationCheck(routineRpc(ops), OPS),
  }).then((p) => ({ ...p, ledger }));

describe("referral holds", () => {
  test("R2: a line that can never be credited is held for a person, carried and listed, never in the script", async () => {
    const indexer = await fourReferrers();
    const ops = new OpsWallet();
    ops.balances.set(PROGRAM, { lamports: SOL, executable: true });
    ops.uncreditable.add(REFUSED);
    const { plan, script, summary, ledger } = await prepare(indexer, ops);
    expect(plan.send.map((l) => [l.idx, l.wallet, l.amount])).toEqual([[1, F, 20_000_000n]]);
    expect(plan.held.map((l) => [l.wallet, l.reason])).toEqual([
      [OPS, "the operations wallet itself"],
      [PROGRAM, "an executable account: a program, not a wallet"],
      [CLOCK, "a sysvar: the runtime never lets a transfer credit it"],
      [REFUSED, 'its transfer fails in simulation: {"InstructionError":[0,"ReadonlyLamportChange"]}'],
    ]);
    expect(ops.simulated).toEqual([F, REFUSED]); // the static guard answered for the other two
    for (const w of [CLOCK, PROGRAM, REFUSED]) expect(script).not.toContain(w);
    expect(script).not.toContain(`send 2 ${OPS}`);
    expect(summary).toContain("Held for a person (it cannot be credited; carried, never in the signing file): 4.");
    expect(summary).toContain("each one simulated from the operations wallet");
    const notes = ledger.db.query("SELECT wallet, status, note FROM referral_payouts WHERE status = 'carried'").all();
    expect(notes).toHaveLength(4);
    for (const row of notes as { note: string }[]) expect(row.note).toStartWith("held for a person: ");
    const pending = publicReport(ledger, 1).split("Pending\n")[1].split("\n").filter(Boolean);
    expect(pending.map((line) => line.split(" ")[0])).toEqual([F, CLOCK, PROGRAM, REFUSED, OPS].sort()); // F: not landed yet
  });

  test("R2: no simulation when the operations wallet cannot pay: the summary says so", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    ops.balances.set(OPS, { lamports: 1_000n });
    const dry = await prepareBatch({
      ...{ rpc: routineRpc(ops), indexer, ledger: openLedger(":memory:"), ops: OPS, dryRun: true, now: 0 },
      canCredit: simulationCheck(routineRpc(ops), OPS),
    });
    expect([dry.plan.checked, ops.simulated]).toEqual([false, []]);
    expect(dry.summary).toContain("not simulated");
    expect(dry.summary).toContain("NOT ENOUGH");
  });

  test("R3: a new ledger reading old landings back never reuses their batch number; cancel is bound to its batch", async () => {
    const { indexer } = await earnings();
    const ops = new OpsWallet();
    const first = await prepare(indexer, ops);
    expect(first.summary).toContain(
      "0 new transaction(s) read from the oldest the RPC returned; the oldest this ledger ever read is none yet.",
    );
    const paid = ops.pay(F, 40_000_000n, 1, 1);
    await expect(recordPayouts({ rpc: routineRpc(ops), ledger: first.ledger, ops: OPS, cancel: 9 })).rejects.toThrow(
      "this ledger prepared no batch 9",
    );
    const other = wallet(78);
    await expect(recordPayouts({ rpc: routineRpc(ops), ledger: first.ledger, ops: other, cancel: 1 })).rejects.toThrow(
      `batch 1 was prepared for ${OPS}, not ${other}`,
    );
    const lost = await prepare(indexer, ops); // a new, empty ledger: it reads batch 1's landing back first
    expect(lost.plan.batch).toBe(2);
    expect(lost.plan.send.map((l) => l.wallet)).toEqual([F2]);
    expect(lost.script).toContain("BATCH=2\n");
    expect(lost.summary).toContain(
      `1 new transaction(s) read from the oldest the RPC returned; the oldest this ledger ever read is ${paid}`,
    );
  });

  test("R4: the signing file and its summary name the cluster; no RPC URL is ever written in them", async () => {
    const { indexer } = await earnings();
    const { script, summary } = await prepare(indexer, new OpsWallet());
    expect(script).toContain(`GENESIS=${GENESIS}\n`);
    expect(script).toContain('[ "$(solana genesis-hash -C "$CFG")" = "$GENESIS" ] || {');
    expect(script).toContain("RPC_URL_FILE=<file holding the RPC URL>");
    expect(script).not.toMatch(/https?:\/\//);
    expect(script).not.toContain("--url");
    expect(summary).toContain(`on the cluster ${GENESIS} (genesis)`);
  });
});
