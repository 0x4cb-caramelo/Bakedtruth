/**
 * Purpose: the week's batch (Sprint 14, lane L14R; TP §3.4.11): what each wallet is owed, its earnings (earned.ts)
 *          less what the chain shows it was paid and what is still in a signing file (ledger.ts), each line sorted into
 *          one of three: held for a person when it can never be credited (credit.ts: a sysvar, a builtin, a program,
 *          the operations wallet; or the injected `CreditCheck`, a simulation, says its transfer fails), carried when
 *          it would leave the wallet below the rent-exempt minimum for its size (read from the RPC at `finalized`,
 *          never a constant), sent otherwise. Held and carried lines are owed again next week and never reach the
 *          signing file. The plan also carries the cluster's genesis hash, which the signing file checks. No batch
 *          while another is open. It prepares; it never signs.
 * Version: 0.2.0 (held lines, the simulation's verdict, the genesis hash; the writing moved to write.ts)
 * Sprint:  14 (referral, lane L14R)
 */
import { address, getBase64Encoder } from "@solana/kit";
import { rentExemptMinimum, type SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { staticRefusal, type CreditCheck } from "./credit";
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
export type Held = Line & { reason: string };
export type Plan = {
  batch: number;
  ops: string;
  /** The cluster's genesis hash, as the RPC answered it: the signing file refuses any other cluster. */
  genesis: string;
  standing: Standing;
  /** The rent-exempt minimum of an empty wallet, as the RPC answered it. */
  rentMin: bigint;
  opsBalance: bigint;
  send: Line[];
  carried: Line[];
  held: Held[];
  /** Whether the `CreditCheck` ran (not when the operations wallet cannot pay: every transfer would fail). */
  checked: boolean;
  total: bigint;
  /** What the operations wallet needs: the transfers, their fees and its own minimum. */
  needed: bigint;
  mark: string;
};

/** A batch that must not be prepared, with the reason. */
export class BatchRefused extends Error {
  override name = "BatchRefused";
}

/** Each wallet's lamports, data size and executable flag at `finalized`; `null` for one that does not exist. */
async function accountsOf(rpc: SolanaRpc, wallets: readonly string[], timeoutMs: number) {
  const out = new Map<string, { lamports: bigint; size: number; executable: boolean } | null>();
  for (let i = 0; i < wallets.length; i += 100) {
    const slice = wallets.slice(i, i + 100);
    const { value } = await rpc
      .getMultipleAccounts(
        slice.map((a) => address(a)),
        { encoding: "base64", commitment: "finalized" },
      )
      .send({ abortSignal: AbortSignal.timeout(timeoutMs) });
    value.forEach((a, j) => {
      const size = a ? getBase64Encoder().encode(a.data[0]).length : 0;
      out.set(slice[j], a ? { lamports: BigInt(a.lamports), size, executable: a.executable } : null);
    });
  }
  return out;
}

const sum = (lines: readonly Line[]) => lines.reduce((t, l) => t + l.amount, 0n);

export async function planBatch(
  rpc: SolanaRpc,
  ledger: Store,
  standing: Standing,
  ops: string,
  options: { timeoutMs?: number; canCredit?: CreditCheck } = {},
): Promise<Plan> {
  const open = openBatch(ledger);
  if (open !== null) throw new BatchRefused(`batch ${open} is still open: record what landed, or cancel it`);
  const timeoutMs = options.timeoutMs ?? 20_000;
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
  const genesis = await rpc.getGenesisHash().send({ abortSignal: AbortSignal.timeout(timeoutMs) });
  const rents = new Map<number, bigint>();
  const rentFor = async (size: number) =>
    rents.get(size) ?? rents.set(size, await rentExemptMinimum(rpc, size)).get(size)!;
  const rentMin = await rentFor(0);
  const [send, carried, held]: [Line[], Line[], Held[]] = [[], [], []];
  for (const o of owed) {
    const account = accounts.get(o.wallet) ?? null;
    const line = { ...o, idx: 0, balance: account?.lamports ?? 0n, rentMin: await rentFor(account?.size ?? 0) };
    const refusal = staticRefusal(o.wallet, account, ops);
    if (refusal !== null) held.push({ ...line, reason: refusal });
    else (line.balance + o.amount < line.rentMin ? carried : send).push(line);
  }
  const opsBalance = accounts.get(ops)?.lamports ?? 0n;
  const neededFor = (lines: readonly Line[]) => sum(lines) + FEE_PER_TRANSFER * BigInt(lines.length) + rentMin;
  const checked = options.canCredit !== undefined && send.length > 0 && opsBalance >= neededFor(send);
  const refused = checked ? await options.canCredit!(send) : new Map<string, string>();
  const credited = send.filter((l) => !refused.has(l.wallet));
  held.push(...send.filter((l) => refused.has(l.wallet)).map((l) => ({ ...l, reason: refused.get(l.wallet)! })));
  [...credited, ...carried, ...held].forEach((line, i) => (line.idx = i + 1));
  return {
    ...{ batch: nextBatch(ledger), ops, genesis, standing, rentMin, opsBalance, send: credited, carried, held },
    ...{ checked, total: sum(credited), needed: neededFor(credited), mark },
  };
}
