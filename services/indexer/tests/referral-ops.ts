/**
 * Purpose: the operations wallet's side of the referral routine's tests (Sprint 14, lane L14R), with no cluster: the
 *          transfers a person sends from it, each a landed transaction as a node writes it in JSON (a System Program
 *          transfer and a memo, as `solana transfer --with-memo` builds one; or a shape a test makes irregular), and
 *          the routine's RPC: fake-chain.ts's scripted listing and reads over those transactions, each wallet's
 *          balance and data size, and the rent-exempt minimum at a rate a test sets: `(128 + size) × rate`, 5,080 a
 *          byte as devnet and mainnet answer, or 6,960 as LiteSVM does. And `earnings`, the indexer's side of them.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { expect } from "bun:test";
import { getBase58Decoder, getBase64Decoder } from "@solana/kit";
import type { RpcTransaction, SolanaRpc } from "@brot/sdk/read";

import { scripted } from "./fake-chain";
import { Campaign } from "./referral-campaign";
import { Chain, indexed, SOL, wallet } from "./referral-chain";

export const OPS = wallet(77);
const SYSTEM = "11111111111111111111111111111111";
const MEMO = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
const base58 = getBase58Decoder();
let sent = 0;

const transferData = (lamports: bigint) => {
  const bytes = new Uint8Array(12);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 2, true);
  view.setBigUint64(4, lamports, true);
  return base58.decode(bytes);
};

export class OpsWallet {
  readonly txs: RpcTransaction[] = [];
  slot = 5_000;
  /** Each wallet the routine reads, by address; missing ones do not exist. */
  readonly balances = new Map<string, { lamports: bigint; size?: number }>([[OPS, { lamports: 10n ** 10n }]]);
  /** Lamports a byte of the rent-exempt minimum, the 128-byte header included. */
  rentPerByte = 5_080n;

  /** One landed transaction from the operations wallet: its transfers, then the memo, if any. */
  send(transfers: { to: string; lamports: bigint }[], memo: string | null, options: { failed?: boolean } = {}): string {
    this.slot += 1;
    sent += 1;
    const signature = base58.decode(
      new Uint8Array(64).map((_, i) => (i === 0 ? 0xee : i < 5 ? sent >> (8 * (i - 1)) : 3)),
    );
    const keys = [...new Set([OPS, ...transfers.map((t) => t.to), SYSTEM, MEMO])];
    const instructions = [
      ...transfers.map((t) => ({
        ...{ programIdIndex: keys.indexOf(SYSTEM), accounts: [0, keys.indexOf(t.to)] },
        data: transferData(t.lamports),
      })),
      ...(memo === null
        ? []
        : [{ programIdIndex: keys.indexOf(MEMO), accounts: [], data: base58.decode(new TextEncoder().encode(memo)) }]),
    ];
    this.txs.push({
      slot: BigInt(this.slot),
      blockTime: BigInt(1_800_000_000 + this.slot),
      transaction: { signatures: [signature], message: { accountKeys: keys, instructions } },
      meta: { err: options.failed ? { InstructionError: [0, { Custom: 1 }] } : null, innerInstructions: [] },
    } as unknown as RpcTransaction);
    return signature;
  }

  /** What the CLI's `transfer --with-memo` sends for one line of a signing file. */
  pay(to: string, lamports: bigint, batch: number, idx: number): string {
    return this.send([{ to, lamports }], `brot-referral:${batch}:${idx}`);
  }
}

/** The routine's RPC over the operations wallet's transactions, with balances and the rent-exempt minimum. */
export function routineRpc(ops: OpsWallet): SolanaRpc {
  const { rpc } = scripted({ txs: ops.txs });
  const account = (at: string) => {
    const known = ops.balances.get(at);
    if (!known) return null;
    const size = known.size ?? 0;
    const data = [getBase64Decoder().decode(new Uint8Array(size)), "base64"];
    return { lamports: known.lamports, owner: SYSTEM, executable: false, rentEpoch: 0n, space: BigInt(size), data };
  };
  return Object.assign(rpc, {
    getMultipleAccounts: (addresses: string[]) => ({ send: async () => ({ value: addresses.map(account) }) }),
    getMinimumBalanceForRentExemption: (size: bigint) => ({
      send: async () => (128n + BigInt(size)) * ops.rentPerByte,
    }),
  });
}

const [R, F, R2, F2, B, D] = [wallet(1), wallet(2), wallet(5), wallet(6), wallet(3), wallet(4)];

/** F earns 0.04 SOL from R's winning entry; F2 earns 700,000 lamports from R2's. */
export async function earnings(path = ":memory:") {
  const chain = new Chain();
  chain.link(R, F);
  chain.link(R2, F2);
  const a = new Campaign(chain, 1);
  a.join(R, "yes", 2n * SOL);
  a.join(B, "yes", SOL);
  a.join(D, "no", 3n * SOL);
  a.finalize("yes");
  a.settle();
  const b = new Campaign(chain, 2);
  b.join(R2, "yes", SOL / 100n);
  b.join(D, "no", 35_000_000n);
  b.finalize("yes");
  b.settle();
  const x = await indexed(chain, path);
  expect([x.referral(R).referrer_share, x.referral(R2).referrer_share]).toEqual(["40000000", "700000"]);
  return { chain, x, indexer: x.store };
}
