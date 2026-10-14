/**
 * Purpose: the public report of a batch (Sprint 14, lane L14R; the sprint's security gate, "a public report carries
 *          wallets and amounts only"): the wallets the batch paid with what reached each, and the wallets still
 *          pending in it (carried below the rent-exempt minimum, prepared and not landed yet, or cancelled) with what
 *          each is owed in it, in SOL. Nothing else: no time, no campaign, no batch number, no pairing of a referee
 *          with its referrer, no IP. From the ledger alone; each list sorted by wallet, one line per wallet.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import type { Store } from "../db/store";
import { solOf } from "./rules";

const PAID = new Set(["landed"]);
const PENDING = new Set(["carried", "prepared", "cancelled"]);

export function publicReport(ledger: Store, batch: number): string {
  const rows = ledger.db.query("SELECT wallet, amount, status FROM referral_payouts WHERE batch = ?").all(batch) as {
    wallet: string;
    amount: string;
    status: string;
  }[];
  if (rows.length === 0) throw new RangeError(`no batch ${batch} in this ledger`);
  const lines = (statuses: Set<string>) => {
    const sums = new Map<string, bigint>();
    for (const r of rows) if (statuses.has(r.status)) sums.set(r.wallet, (sums.get(r.wallet) ?? 0n) + BigInt(r.amount));
    return [...sums].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([w, sol]) => `${w} ${solOf(sol)}`);
  };
  return [
    "Brot Markets: referral payouts, in SOL",
    "",
    "Paid",
    ...lines(PAID),
    "",
    "Pending",
    ...lines(PENDING),
    "",
  ].join("\n");
}
