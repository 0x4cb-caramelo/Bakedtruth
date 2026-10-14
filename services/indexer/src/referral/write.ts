/**
 * Purpose: a planned batch written to the ledger (Sprint 14, lane L14R; batch.ts plans it): `prepared` rows for the
 *          transfers of the signing file, `carried` rows for the lines below the rent-exempt minimum and for the lines
 *          held for a person (with why), all owed again next week. Refused when the operations wallet cannot pay the
 *          transfers, their fees and its own minimum, and when the ledger changed since the plan (another batch, a
 *          landing recorded): one immediate transaction, all or nothing. Nothing is written when nothing is owed.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { Store } from "../db/store";
import { BatchRefused, type Line, type Plan } from "./batch";
import { ledgerMark, openBatch } from "./ledger";

export function writeBatch(ledger: Store, plan: Plan, preparedAt: number): boolean {
  if (plan.send.length + plan.carried.length + plan.held.length === 0) return false;
  if (plan.send.length > 0 && plan.opsBalance < plan.needed)
    throw new BatchRefused(`the operations wallet holds ${plan.opsBalance} lamports; the batch needs ${plan.needed}`);
  const insert = ledger.db.prepare(
    `INSERT INTO referral_payouts (batch, idx, wallet, amount, status, earned_referrer, earned_rebate, paid_before,
       balance, rent_min, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const row = (l: Line, status: string, note: string | null) => {
    const amounts = [l.amount, l.referrer, l.rebate, l.paidBefore, l.balance, l.rentMin].map(String);
    insert.run(plan.batch, l.idx, l.wallet, amounts[0], status, ...amounts.slice(1), note);
  };
  ledger.db
    .transaction(() => {
      if (openBatch(ledger) !== null || ledgerMark(ledger) !== plan.mark)
        throw new BatchRefused("the ledger changed while the batch was planned: plan it again");
      ledger.db.run(
        "INSERT INTO batches (batch, ops_wallet, as_of_slot, rent_min, prepared_at) VALUES (?, ?, ?, ?, ?)",
        [...[plan.batch, plan.ops, plan.standing.asOfSlot, `${plan.rentMin}`, preparedAt]],
      );
      for (const l of plan.send) row(l, "prepared", null);
      for (const l of plan.carried) row(l, "carried", "below the rent-exempt minimum: owed again next batch");
      for (const l of plan.held) row(l, "carried", `held for a person: ${l.reason}`);
    })
    .immediate();
  return true;
}
