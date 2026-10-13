/**
 * Purpose: what the chain says was paid (Sprint 14, lane L14R): the operations wallet's own signatures at `finalized`,
 *          back to the last one scanned, each successful transaction read (JSON) and, when it carries a
 *          `brot-referral` memo, each System Program transfer from that wallet in it recorded as landed, by its
 *          signature and instruction (unique), in one transaction with the scan's place. A regular payout (one memo
 *          `brot-referral:<batch>:<index>`, one transfer) that matches its prepared row (batch, index, wallet and
 *          lamports) turns that row `landed`; anything else that left the wallet under a payout memo is recorded as
 *          landed too, to whoever received it, with a note (a duplicate, a changed amount, a row this ledger never
 *          had, an irregular shape), so a lost, stale or bypassed ledger can never make the routine pay twice.
 * Version: 0.3.0 (the scan keeps and reports the oldest signature it ever read)
 * Sprint:  14 (referral, lane L14R)
 *
 * Only transfers under a payout memo are read: a payout sent by hand without one is not seen, so every payout goes
 * through the signing file (signing.ts).
 */
import { getBase58Encoder, signature as toSignature } from "@solana/kit";
import { accountKeysOf, type RpcTransaction, type SolanaRpc } from "@brot/sdk/read";

import type { Store } from "../db/store";
import { listNewer } from "../listing";
import { MEMO_PREFIX, parseMemo } from "./rules";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const MEMO_PROGRAMS = new Set([
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo",
]);
const TX = { encoding: "json", maxSupportedTransactionVersion: 0, commitment: "finalized" } as const;

export type Landing = {
  signature: string;
  /** The transfer's instruction index in its transaction. */
  ix: number;
  slot: number;
  /** From the memo; 0 and 0 when it names none. */
  batch: number;
  idx: number;
  wallet: string;
  lamports: bigint;
  /** Why the transaction is not a regular payout, or `null`. */
  irregular: string | null;
};
export type Recorded = { landing: Landing; note: string | null };
export type ScanReport = {
  scanned: number;
  recorded: Recorded[];
  stoppedAt: string | null;
  /** The last signature scanned before this read, or `null` when this read began at the RPC's oldest. */
  since: string | null;
  /** The oldest signature this ledger ever read for the wallet. */
  first: { signature: string; slot: number } | null;
};

type Ix = { programIdIndex: number; accounts: readonly number[]; data: string };
const view = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

/** Every transfer from `ops` in a successful transaction under a payout memo; none for any other transaction. */
export function payoutsOf(tx: RpcTransaction, ops: string): Landing[] {
  if (!tx.meta || tx.meta.err !== null) return [];
  const signature = tx.transaction.signatures[0];
  const keys = accountKeysOf(tx);
  const ixs = (tx.transaction.message as unknown as { instructions?: readonly Ix[] }).instructions ?? [];
  const bytes = (ix: Ix) => new Uint8Array(getBase58Encoder().encode(ix.data));
  const memos = ixs
    .filter((ix) => MEMO_PROGRAMS.has(keys[ix.programIdIndex]))
    .map((ix) => new TextDecoder().decode(bytes(ix)))
    .filter((m) => m.startsWith(MEMO_PREFIX));
  if (memos.length === 0) return [];
  const transfers = ixs
    .map((ix, i) => ({ i, to: keys[ix.accounts[1]], from: keys[ix.accounts[0]], ix, data: bytes(ix) }))
    .filter((t) => keys[t.ix.programIdIndex] === SYSTEM_PROGRAM && t.from === ops)
    .filter((t) => t.data.length === 12 && view(t.data).getUint32(0, true) === 2);
  const parsed = memos.map(parseMemo);
  const regular = memos.length === 1 && parsed[0] !== null && transfers.length === 1;
  const named = parsed.find((m) => m !== null) ?? { batch: 0, idx: 0 };
  const irregular = regular ? null : `irregular: ${memos.length} payout memo(s), ${transfers.length} transfer(s)`;
  return transfers.map((t) => ({
    ...{ signature, ix: t.i, slot: Number(tx.slot), ...named, wallet: t.to },
    ...{ lamports: view(t.data).getBigUint64(4, true), irregular },
  }));
}

/** Records one transfer; returns its note (`null` for the prepared row it matched), or `undefined` if known. */
export function recordLanding(ledger: Store, l: Landing): string | null | undefined {
  const db = ledger.db;
  if (db.query("SELECT 1 FROM referral_payouts WHERE signature = ? AND ix = ?").get(l.signature, l.ix))
    return undefined;
  const row = db
    .query(
      `SELECT id, wallet, amount, status FROM referral_payouts WHERE batch = ? AND idx = ?
       AND status IN ('prepared', 'cancelled') ORDER BY id LIMIT 1`,
    )
    .get(l.batch, l.idx) as { id: number; wallet: string; amount: string; status: string } | null;
  if (l.irregular === null && row && row.wallet === l.wallet && BigInt(row.amount) === l.lamports) {
    const note = row.status === "cancelled" ? "landed after it was cancelled" : null;
    db.run("UPDATE referral_payouts SET status = 'landed', signature = ?, ix = ?, slot = ?, note = ? WHERE id = ?", [
      ...[l.signature, l.ix, l.slot, note, row.id],
    ]);
    return note;
  }
  const landedBefore = db
    .query("SELECT 1 FROM referral_payouts WHERE batch = ? AND idx = ? AND status = 'landed'")
    .get(l.batch, l.idx);
  const note =
    l.irregular ??
    (row ? "not the prepared wallet or amount" : landedBefore ? "duplicate: landed twice" : "not in this ledger");
  db.run(
    `INSERT INTO referral_payouts (batch, idx, wallet, amount, status, signature, ix, slot, note)
     VALUES (?, ?, ?, ?, 'landed', ?, ?, ?, ?)`,
    [l.batch, l.idx, l.wallet, l.lamports.toString(), l.signature, l.ix, l.slot, note],
  );
  return note;
}

/**
 * Scans `ops`'s signatures newer than the last scanned, oldest first, recording each payout with the scan's place.
 * A transaction the node does not return yet stops the scan there (`stoppedAt`); a call that fails throws. The report
 * says where this read began (`since`, null for the start of the RPC's history) and the oldest signature the ledger
 * ever read for the wallet (`first`): on a node that keeps no full history, it is not the wallet's first transaction.
 */
export async function scanLandings(
  rpc: SolanaRpc,
  ledger: Store,
  ops: string,
  options: { timeoutMs?: number; pageSize?: number } = {},
): Promise<ScanReport> {
  const o = { timeoutMs: options.timeoutMs ?? 20_000, pageSize: options.pageSize ?? 1_000 };
  const place = () =>
    ledger.db.query("SELECT * FROM scans WHERE ops_wallet = ?").get(ops) as {
      last_signature: string;
      first_signature: string;
      first_slot: number;
    } | null;
  const since = place()?.last_signature ?? null;
  const listed = (await listNewer(rpc, ops, since, o)).reverse();
  const report: ScanReport = { scanned: 0, recorded: [], stoppedAt: null, since, first: null };
  const done = () => {
    const at = place();
    return { ...report, first: at === null ? null : { signature: at.first_signature, slot: at.first_slot } };
  };
  for (const s of listed) {
    const tx = s.failed
      ? null
      : ((await rpc
          .getTransaction(toSignature(s.signature), TX)
          .send({ abortSignal: AbortSignal.timeout(o.timeoutMs) })) as unknown as RpcTransaction | null);
    if (!s.failed && tx === null) return { ...done(), stoppedAt: s.signature };
    ledger.tx(() => {
      for (const landing of tx === null ? [] : payoutsOf(tx, ops)) {
        const note = recordLanding(ledger, landing);
        if (note !== undefined) report.recorded.push({ landing, note });
      }
      ledger.db.run(
        `INSERT INTO scans (ops_wallet, last_signature, last_slot, first_signature, first_slot) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (ops_wallet) DO UPDATE SET last_signature = excluded.last_signature, last_slot = excluded.last_slot`,
        [ops, s.signature, s.slot, s.signature, s.slot],
      );
    });
    report.scanned += 1;
  }
  return done();
}
