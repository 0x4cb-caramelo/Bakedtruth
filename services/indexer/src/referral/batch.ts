/**
 * Purpose: the week's batch (Sprint 14, lane L14R; TP §3.4.11): what each wallet is owed, its earnings (earned.ts)
 *          less what the chain shows it was paid and what is still in a signing file (ledger.ts), each checked against
 *          the wallet's balance and the rent-exempt minimum for its size, both read from the RPC at `finalized`, never
 *          a constant. A transfer that would leave the wallet below that minimum is not sent: it is written `carried`,
 *          shown as pending, and owed again next week. No batch while another is open; none the operations wallet
 *          cannot pay with its fees while keeping its own minimum. Written in one immediate transaction, and only if
 *          the ledger did not change while the batch was planned. It prepares; it never signs.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { address, getBase64Encoder } from "@solana/kit";
import { rentExemptMinimum, type SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import type { Standing } from "./earned";
import { inFlightByWallet, ledgerMark, nextBatch, openBatch, paidByWallet } from "./ledger";

/** The network fee of one transfer: one signature, no priority fee. */
export const FEE_PER_TRANSFER = 5_000n;

export type Line = {
  idx: number;
  wallet: string;
  amount: bigint;
  /** Earned so far, as referrer and as referee, and paid before this batch: the composition of `amount`. */
  referrer: bigint;
  rebate: bigint;
  paidBefore: bigint;
  balance: bigint;
  rentMin: bigint;
};
export type Plan = {
  batch: number;
  ops: string;
  standing: Standing;
  /** The rent-exempt minimum of an empty wallet, as the RPC answered it. */
  rentMin: bigint;
  opsBalance: bigint;
  send: Line[];
  carried: Line[];
  total: bigint;
  /** What the operations wallet needs: the transfers, their fees and its own minimum. */
  needed: bigint;
  mark: string;
};

/** A batch that must not be prepared, with the reason. */
export class BatchRefused extends Error {
  override name = "BatchRefused";
}

/** Each wallet's lamports and data size at `finalized`; `null` for one that does not exist. */
async function accountsOf(rpc: SolanaRpc, wallets: readonly string[], timeoutMs: number) {
  const out = new Map<string, { lamports: bigint; size: number } | null>();
  for (let i = 0; i < wallets.length; i += 100) {
    const slice = wallets.slice(i, i + 100);
    const { value } = await rpc
      .getMultipleAccounts(
        slice.map((a) => address(a)),
        { encoding: "base64", commitment: "finalized" },
      )
      .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
    value.forEach((a, j) =>
      out.set(slice[j], a ? { lamports: BigInt(a.lamports), size: getBase64Encoder().encode(a.data[0]).length } : null),
    );
  }
  return out;
}

export async function planBatch(rpc: SolanaRpc, ledger: Store, standing: Standing, ops: string, timeoutMs = 20_000) {
  const open = openBatch(ledger);
  if (open !== null) throw new BatchRefused(`batch ${open} is still open: record what landed, or cancel it`);
  const mark = ledgerMark(ledger);
  const [paid, flight] = [paidByWallet(ledger), inFlightByWallet(ledger)];
  const owed = [...standing.earned]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([wallet, e]) => {
      const paidBefore = paid.get(wallet) ?? 0n;
      const amount = e.referrer + e.rebate - paidBefore - (flight.get(wallet) ?? 0n);
      return { wallet, referrer: e.referrer, rebate: e.rebate, paidBefore, amount };
    })
    .filter((o) => o.amount > 0n);
  const accounts = await accountsOf(rpc, [ops, ...owed.map((o) => o.wallet)], timeoutMs);
  const rents = new Map<number, bigint>();
  const rentFor = async (size: number) =>
    rents.get(size) ?? rents.set(size, await rentExemptMinimum(rpc, size)).get(size)!;
  const rentMin = await rentFor(0);
  const [send, carried]: Line[][] = [[], []];
  for (const o of owed) {
    const account = accounts.get(o.wallet) ?? null;
    const balance = account?.lamports ?? 0n;
    const min = await rentFor(account?.size ?? 0);
    (balance + o.amount < min ? carried : send).push({ ...o, idx: 0, balance, rentMin: min });
  }
  [...send, ...carried].forEach((line, i) => (line.idx = i + 1));
  const total = send.reduce((t, l) => t + l.amount, 0n);
  const needed = total + FEE_PER_TRANSFER * BigInt(send.length) + rentMin;
  const opsBalance = accounts.get(ops)?.lamports ?? 0n;
  return { batch: nextBatch(ledger), ops, standing, rentMin, opsBalance, send, carried, total, needed, mark } as Plan;
}

/** Writes the plan's rows: `prepared` for the transfers, `carried` for the rest. Nothing when nothing is owed. */
export function writeBatch(ledger: Store, plan: Plan, preparedAt: number): boolean {
  if (plan.send.length + plan.carried.length === 0) return false;
  if (plan.send.length > 0 && plan.opsBalance < plan.needed)
    throw new BatchRefused(`the operations wallet holds ${plan.opsBalance} lamports; the batch needs ${plan.needed}`);
  const insert = ledger.db.prepare(
    `INSERT INTO referral_payouts (batch, idx, wallet, amount, status, earned_referrer, earned_rebate, paid_before,
       balance, rent_min, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const row = (l: Line, status: string, note: string | null) =>
    insert.run(
      plan.batch,
      l.idx,
      l.wallet,
      `${l.amount}`,
      status,
      `${l.referrer}`,
      `${l.rebate}`,
      `${l.paidBefore}`,
      `${l.balance}`,
      `${l.rentMin}`,
      note,
    );
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
    })
    .immediate();
  return true;
}
